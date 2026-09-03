const notificationList = document.getElementById("notificationList");
/* Initialize */
function initializeNotifications() {
  if (!appState.notifications) {
    appState.notifications = [];
    saveAppState();
  }
  applyNotificationPreferences();
  renderNotifications();

}
/* Apply Notification Preferences - Shows only enabled notification filter tabs. */
function applyNotificationPreferences() {
  const notificationButtons = document.querySelectorAll(
    ".notificationFilterButton",
  );
  const notificationSettings = appState.settings.notifications;
  let activeFilterAvailable = true;
  notificationButtons.forEach(function (button) {
    const filterType = button.textContent.trim().toLowerCase();
    let visible = true;
    switch (filterType) {
      case "all":
      case "unread":
        visible = true;
        break;
      case "items":
        visible = notificationSettings.shopping;
        if (activeNotificationFilter === "item" && !visible) {
          activeFilterAvailable = false;
        }
        break;
      case "budget":
        visible = notificationSettings.budget;
        if (activeNotificationFilter === "budget" && !visible) {
          activeFilterAvailable = false;
        }
        break;
      case "groups":
        visible = notificationSettings.group;
        if (activeNotificationFilter === "group" && !visible) {
          activeFilterAvailable = false;
        }
        break;
      case "system":
        visible = notificationSettings.general;
        if (activeNotificationFilter === "system" && !visible) {
          activeFilterAvailable = false;
        }
        break;
    }
    button.style.display = visible ? "" : "none";
  });
  if (!activeFilterAvailable) {
    activeNotificationFilter = "all";
    document
      .querySelectorAll(".notificationFilterButton")
      .forEach(function (button) {
        button.classList.remove("activeNotificationFilter");
        if (button.textContent.trim() === "All") {
          button.classList.add("activeNotificationFilter");
        }
      });
  }
}
/* Format Time */
function formatNotificationTime(timestamp) {
  const notifSent = new Date(timestamp.replace(' ', 'T'));   // Need to get rid of the T in the MySQL DateTime
  const now = new Date();

  const diffMs = now - notifSent;
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) {
    return t("notifications.justNow");
  }
  if (minutes < 60) {
    return t("notifications.minutesAgo", {
      count: minutes,
    });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("notifications.hoursAgo", {
      count: hours,
    });
  }
  const days = Math.floor(hours / 24);
  return t("notifications.daysAgo", {
    count: days,
  });
}
let activeNotificationFilter = "all";
/* Get Localized Notification Content */
function getLocalizedNotificationContent(notification) {
  if (
    notification.titleKey &&
    notification.messageKey
  ) {
    let notifPayload = JSON.parse(notification.payload);
    return {
      title: t(notification.titleKey),
      message: t(
        notification.messageKey,
        notifPayload.message_params || {},
      ),
    };
  }

  return {
    title: notification.title,
    message: notification.message || "",
  };
}
/* Get Notification Icon */
function getNotificationIcon(notificationType) {
  switch (notificationType) {
    case "purchase":
      return "🛒";
    case "budget":
      return "💰";
    case "group":
      return "👥";
    case "item":
      return "📦";
    case "favorite":
      return "❤️";
    case "system":
      return "⚙️";
    default:
      return "🔔";
  }
}

async function getNotifications_mysql() {
  const res = await fetch("http://localhost:5113/api/get-notifications", {
    method: "GET",
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });


  if (!res.ok) {
    const errorText = await res.text();
    console.error("Fetch failed:", errorText);
    return;
  }

  const notifs = await res.json();

  return notifs;
}

/* Render Notifications - Displays notifications based on the selected filter and user preferences. */
async function renderNotifications() {
  const notifs = await getNotifications_mysql() ;
  notificationList.innerHTML = "";
  const notificationSettings = appState.settings.notifications;
  let notifications = notifs.filter(function (notification) {
    if (notification.type === "group" && !notificationSettings.group) {
      return false;
    }
    if (notification.type === "items" && !notificationSettings.shopping) {
      return false;
    }
    if (notification.type === "budget" && !notificationSettings.budget) {
      return false;
    }
    if (notification.type === "system" && !notificationSettings.general) {
      return false;
    }
    return true;
  });
  switch (activeNotificationFilter) {
    case "unread":
      notifications = notifications.filter(function (notification) {
        return !notification.isRead;
      });
      break;
    case "all":
      break;
    default:
      notifications = notifications.filter(function (notification) {
        return notification.targetType === activeNotificationFilter;
      });
      break;
  }
  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="emptyState">
        <p class="emptyStateText">
          ${t("notifications.noNotificationsFound")}
        </p>
      </div>
    `;
    return;
  }
  state.notifications = []
  notifications.forEach(function (notification) {
    state.notifications.push(notification);
    const localizedContent = getLocalizedNotificationContent(notification);
    notificationList.innerHTML += `
      <div
        class="
          notificationCard
          ${notification.isRead ? "" : "unreadNotification"}
        "
        onclick="
          openNotification(
            ${notification.unfId}
          )
        "
      >
        <div class="notificationHeader">
          <div class="notificationTitleWrapper">
            <span class="notificationTypeIcon">
              ${getNotificationIcon(notification.targetType)}
            </span>
            <h3 class="notificationTitle">
             ${localizedContent.title}
            </h3>
          </div>
          <button
            class="notificationDeleteButton"
            onclick="
              event.stopPropagation();
              deleteNotification(
                '${notification.unfId}'
              );
            "
          >
            <img
              src="${getIconPath("actions", "delete")}"
              class="icon actionIcon"
              alt="${t("common.delete")}"
            >
          </button>
        </div>
        <p class="notificationMessage">
          ${localizedContent.message}
        </p>
        <p class="notificationTime">
          ${formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    `;
  });

}
/* Open Notification */
async function openNotification(notificationId) {
  console.log("Hi");
  const notification = state.notifications.find(function (notification) {
    return notification.unfId === notificationId;
  });

  if (!notification) {
    console.log("Early return...");
    return;
  }
  await markNotificationRead(notificationId);

  console.log(notification);
  const notifPayload = JSON.parse(notification.payload);
  console.log(notifPayload);
  switch (notifPayload.action) {
    case "dashboard":
      window.location.href = "../pages/dashboardPage.html";
      break;
    case "budget":
      window.location.href = "../pages/budgetPage.html";
      break;
    case "notifications":
      window.location.href = "../pages/notificationsPage.html";
      break;
    case "group":
      window.location.href = "../pages/familyManagementPage.html";
      break;
    case "favorites":
      window.location.href = "../pages/favoritesPage.html";
      break;
    case "category":
      if (notifPayload.actionData) {
        state.activeGroupId = notifPayload.actionData.groupId;
        state.activeGroup = notifPayload.actionData.group;
        state.activeCategoryId = notifPayload.actionData.categoryId;
        state.activeCategory = notifPayload.actionData.category;
        saveState();
        
        localStorage.setItem("activeGroup", notifPayload.actionData.group);
        localStorage.setItem(
          "activeCategory",
          notification.actionData.category,
        );
      }
      window.location.href = "../pages/categoryPage.html";
      break;
    default:
      break;
  }
}
/* Filter Notifications */
function filterNotifications(filterType, button) {
  activeNotificationFilter = filterType;
  document
    .querySelectorAll(".notificationFilterButton")
    .forEach(function (filterButton) {
      filterButton.classList.remove("activeNotificationFilter");
    });
  button.classList.add("activeNotificationFilter");
  renderNotifications();
}
/* Back */
function goBack() {
  window.location.href = "../pages/dashboardPage.html";
}
/* Clear All Notifications */
async function clearNotifications() {
  showConfirmDialog(
    t("notifications.clearNotifications"),
    t("notifications.confirmClearAll"),
    async function () {
      await deleteNotification_mysql(null);
      appState.notifications = [];
      saveAppState();
      renderNotifications();
      updateNotificationBadge();
      showToast(t("notifications.notificationsCleared"));
    },
  );
}

/**
 * @param {Array<int> | null} notificationIds 
 * if an array of integers will soft-delete these particular user notifications from the 
 * database 
 * If null, will soft-delete ALL user notifications belonging to this user.
 */
async function deleteNotification_mysql(notificationIds) {

  const res = await fetch("http://localhost:5113/api/delete-notifications", {
    method: "DELETE",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      NotificationIds: notificationIds
    })
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }
}

/* Delete Notification */
async function deleteNotification(notificationId) {
  // appState.notifications = appState.notifications.filter(
  //   function (notification) {
  //     return notification.id !== notificationId;
  //   },
  // );

  await deleteNotification_mysql([notificationId]);
  
  saveAppState();
  renderNotifications();
  updateNotificationBadge();
  showToast(t("notifications.notificationDeleted"));
}
(async function () {
  await initializeLocalization();
  initializeNotifications();
})();
