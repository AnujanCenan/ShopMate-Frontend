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
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) {
    return "Just Now";
  }
  if (minutes < 60) {
    return `${minutes} mins ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hrs ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
let activeNotificationFilter = "all";
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
/* Render Notifications - Displays notifications based on the selected filter and user preferences. */
function renderNotifications() {
  notificationList.innerHTML = "";
  const notificationSettings = appState.settings.notifications;
  let notifications = appState.notifications.filter(function (notification) {
    if (notification.type === "group" && !notificationSettings.group) {
      return false;
    }
    if (notification.type === "item" && !notificationSettings.shopping) {
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
        return !notification.read;
      });
      break;
    case "all":
      break;
    default:
      notifications = notifications.filter(function (notification) {
        return notification.type === activeNotificationFilter;
      });
      break;
  }
  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="emptyState">
        <p class="emptyStateText">
          No Notifications Found
        </p>
      </div>
    `;
    return;
  }
  notifications.forEach(function (notification) {
    notificationList.innerHTML += `
      <div
        class="
          notificationCard
          ${notification.read ? "" : "unreadNotification"}
        "
        onclick="
          openNotification(
            '${notification.id}'
          )
        "
      >
        <div class="notificationHeader">
          <div class="notificationTitleWrapper">
            <span class="notificationTypeIcon">
              ${getNotificationIcon(notification.type)}
            </span>
            <h3 class="notificationTitle">
              ${notification.title}
            </h3>
          </div>
          <button
            class="notificationDeleteButton"
            onclick="
              event.stopPropagation();
              deleteNotification(
                '${notification.id}'
              );
            "
          >
            <img
              src="${getIconPath("actions", "delete")}"
              class="icon actionIcon"
              alt="Delete"
            >
          </button>
        </div>
        <p class="notificationMessage">
          ${notification.message || ""}
        </p>
        <p class="notificationTime">
          ${formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    `;
  });
}
/* Open Notification */
function openNotification(notificationId) {
  const notification = appState.notifications.find(function (notification) {
    return notification.id === notificationId;
  });
  if (!notification) {
    return;
  }
  markNotificationRead(notificationId);
  if (!notification.action) {
    return;
  }
  switch (notification.action) {
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
      if (notification.actionData) {
        localStorage.setItem("activeGroup", notification.actionData.group);
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
function clearNotifications() {
  showConfirmDialog(
    "Clear Notifications",
    "Are you sure you want to clear all notifications?",
    function () {
      appState.notifications = [];
      saveAppState();
      renderNotifications();
      updateNotificationBadge();
      showToast("Notifications Cleared");
    },
  );
}
/* Delete Notification */
function deleteNotification(notificationId) {
  appState.notifications = appState.notifications.filter(
    function (notification) {
      return notification.id !== notificationId;
    },
  );
  saveAppState();
  renderNotifications();
  updateNotificationBadge();
  showToast("Notification Deleted");
}
initializeNotifications();
