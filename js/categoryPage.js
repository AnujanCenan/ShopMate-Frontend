/* Initialize Category Page */
function initializeCategoryPage() {
  appState.activeTab = "lists";
  appState.searchQuery = "";
  initializeTabs();
  activateDefaultTab();
  renderCategoryPage();
}
/* Activate Default Tab */
function activateDefaultTab() {
  const tabButtons = document.querySelectorAll(".tabButton");
  tabButtons.forEach(function (tab) {
    tab.classList.remove("activeTab");
    if (tab.dataset.tab === "lists") {
      tab.classList.add("activeTab");
    }
  });
}
const categoryPageTitle = document.getElementById("categoryPageTitle");
const itemList = document.getElementById("itemList");
const itemEmptyState = document.getElementById("itemEmptyState");
const searchInput = document.querySelector(".searchInput");

/* Use delegated listeners so item names never need to appear in inline JavaScript. */
if (itemList && !itemList.dataset.itemActionsBound) {
  itemList.dataset.itemActionsBound = "true";

  itemList.addEventListener("click", function (event) {
    const card = event.target.closest(".itemCard");
    if (!card) {
      return;
    }

    const actionElement = event.target.closest("[data-item-action]");
    if (actionElement) {
      event.stopPropagation();
      const itemKey = card.dataset.itemId;
      const item = getFilteredItems().find(function (candidate) {
        return String(candidate.id || candidate.name) === itemKey;
      });
      if (!item) {
        return;
      }

      switch (actionElement.dataset.itemAction) {
        case "edit":
          if (!appState.selectionMode && item.id) {
            renderEditItemForm(item.id);
          }
          break;
        case "favorite":
          toggleFavorite(item.name);
          break;
        case "add-favorite":
          addFavoriteToList(item.name);
          break;
        case "purchase":
          if (item.id) {
            openPurchaseConfirmation(item.id);
          }
          break;
      }
      return;
    }

    if (appState.selectionMode) {
      toggleItemSelection(card.dataset.itemId);
    }
  });

  itemList.addEventListener("contextmenu", function (event) {
    const card = event.target.closest(".itemCard");
    if (!card) {
      return;
    }
    event.preventDefault();
    toggleItemSelection(card.dataset.itemId);
  });
}
/* Render Category Page */
function renderCategoryPage() {
  if (!categoryPageTitle) {
    return;
  }
  const activeCategory = localStorage.getItem("activeCategory");
  categoryPageTitle.textContent = activeCategory;
  const fab = document.getElementById("openItemBottomSheetButton");
  if (fab) {
    fab.classList.toggle("hidden", appState.activeTab !== "lists");
  }
  renderFilteredItems();
}
/* Get Filtered Items */
function getFilteredItems() {
  let filteredItems = [];
  if (appState.activeTab === "favorites") {
    filteredItems = [...appState.favoriteItems];
  } else {
    const currentCategory = getActiveCategory();
    if (!currentCategory) {
      return [];
    }
    filteredItems = [...currentCategory.items];
    if (appState.activeTab === "lists") {
      filteredItems = filteredItems.filter(function (item) {
        return item.purchased === false;
      });
    }
    if (appState.activeTab === "purchased") {
      filteredItems = filteredItems.filter(function (item) {
        return item.purchased === true;
      });
    }
  }
  /* Search Filter */
  if (appState.searchQuery) {
    filteredItems = filteredItems.filter(function (item) {
      return item.name.toLowerCase().includes(appState.searchQuery);
    });
  }
  return filteredItems;
}
/* Render Filtered Items */
function renderFilteredItems() {
  renderItems(getFilteredItems());
  initializeSwipeGestures();
}
/* Render Items */
function renderItems(items) {
  if (!itemList) {
    return;
  }
  itemList.innerHTML = "";
  /* Empty State */
  if (items.length === 0) {
    let emptyMessage = t("category.noItems");
    if (appState.activeTab === "favorites") {
      emptyMessage = t("category.noFavoriteItems");
    }
    if (appState.activeTab === "purchased") {
      emptyMessage = t("category.noPurchasedItems");
    }
    itemEmptyState.innerHTML = `
      <p class="emptyStateText">
        ${emptyMessage}
      </p>
    `;
    return;
  }
  itemEmptyState.innerHTML = "";
  itemList.innerHTML = items
    .map(function (item) {
      const normalizedItemName = item.name.trim().toLowerCase();
      const isFavorite = appState.favoriteItems.some(function (favoriteItem) {
        return favoriteItem.name.trim().toLowerCase() === normalizedItemName;
      });
      const itemKey = item.id || item.name;
      const safeItemName = escapeHtml(item.name);
      const safeItemKey = escapeHtml(itemKey);
      const safeNotes = escapeHtml(item.notes || "-");
      const safeShop = escapeHtml(
        item.purchased ? item.purchaseShop || "-" : item.preferredShop || "-",
      );
      const safeProductImage = escapeHtml(getProductImage(item.name) || "");
      const hasProductImage = Boolean(getProductImage(item.name));

      return `
      <div class="swipeWrapper">
        <div class="swipeBackground">
          <div class="swipePurchased">
            <img
              src="${
                appState.activeTab === "favorites"
                  ? getIconPath("actions", "add")
                  : appState.activeTab === "purchased"
                    ? getIconPath("actions", "re-add")
                    : getIconPath("actions", "purchased")
              }"
              class="icon actionIcon"
              alt=""
            >
            ${
              appState.activeTab === "favorites"
                ? t("category.addToList")
                : appState.activeTab === "purchased"
                  ? t("category.reAdd")
                  : t("category.purchased")
            }
          </div>
          <div class="swipeDelete">
            <img
              src="${
                appState.activeTab === "favorites"
                  ? getIconPath(
                      "actions",
                      item.isFavorite ? "favorite" : "favorite-outline",
                    )
                  : getIconPath("actions", "delete")
              }"
              class="icon actionIcon"
              alt=""
            >
            ${
              appState.activeTab === "favorites"
                ? t("category.removeFavorite")
                : t("category.delete")
            }
          </div>
        </div>
        <div
          class="itemCard swipeCard ${
            item.recurrence &&
            item.recurrence.enabled === true &&
            item.recurrence.frequency !== "none"
              ? "recurringItemCard"
              : ""
          } ${appState.selectedItems.includes(item.id || item.name) ? "selectedItem" : ""}"
          data-item-name="${safeItemName}"
          data-item-id="${safeItemKey}"
          data-item-recurring="${item.recurrence && item.recurrence.enabled === true && item.recurrence.frequency !== "none" ? "true" : "false"}"
        >
          <div class="itemCardTopRow">
            <div class="itemTitleSection">
              <h2
                class="itemName"
                data-item-action="edit"
              >
                ${safeItemName}
              </h2>
              ${
                appState.activeTab === "favorites"
                  ? ""
                  : `
                    <p class="itemQuantityBadge">
                      ${t("category.quantity")}: ${item.quantity} ${getQuantityUnitLabel(item.quantityUnit)}
                    </p>
                  `
              }
            </div>
            <div class="itemActionButtons">
              <button
                class="modernActionButton favoriteActionButton ${
                  isFavorite ? "activeFavoriteButton" : ""
                }"
                data-item-action="favorite"
              >
                <img
                  src="${getIconPath(
                    "actions",
                    isFavorite ? "favorite" : "favorite-outline",
                  )}"
                  class="icon actionIcon"
                  alt="${t("category.favorite")}"
                >
              </button>
              ${
                appState.activeTab === "favorites"
                  ? `
                    <button
                      class="modernActionButton addActionButton"
                      data-item-action="add-favorite"
                    >
                      <img
                        src="${getIconPath("actions", "add")}"
                        class="icon actionIcon"
                        alt="${t("category.add")}"
                      >
                    </button>
                  `
                  : `
                    <button
                      class="
                        modernActionButton
                        purchasedActionButton
                        ${item.purchased ? "activePurchasedButton" : ""}
                      "
                      data-item-action="purchase"
                    >
                      <span class="actionButtonIcon">
                        <img
                          src="${
                            appState.activeTab === "purchased"
                              ? getIconPath("actions", "re-add")
                              : getIconPath("actions", "purchased")
                          }"
                          class="icon actionIcon"
                          alt="${t("category.purchased")}"
                        >
                      </span>
                    </button>
                  `
              }
            </div>
          </div>
          <div class="itemCardContent">
            ${
              appState.activeTab === "favorites"
                ? `
                  <div class="itemImageContainer">
                    ${
                      hasProductImage
                        ? `
                          <img
                            src="${safeProductImage}"
                            class="itemImage"
                            alt="${safeItemName}"
                          >
                        `
                        : `
                          <div class="itemImagePlaceholder">
                            <img
                              src="${getIconPath("actions", "package")}"
                              class="icon largeIcon"
                              alt="${t("category.product")}"
                            >
                          </div>
                        `
                    }
                  </div>
                `
                : `
                  <div class="itemDetailsSection">
                    <p class="itemDetails">
                      ${t("category.notes")}: ${safeNotes}
                    </p>
                    <p class="itemDetails">
                      ${t("category.shop")}: ${safeShop}
                    </p>
                    <p class="itemDetails">
                      ${t("category.estimatedPrice")}: ${getCurrencySymbol()}${item.estimatedPrice || 0}
                    </p>
                  </div>
                  <div class="itemImageContainer">
                    ${
                      hasProductImage
                        ? `
                          <img
                            src="${safeProductImage}"
                            class="itemImage"
                            alt="${safeItemName}"
                          >
                        `
                        : `
                          <div class="itemImagePlaceholder">
                            <img
                              src="${getIconPath("actions", "package")}"
                              class="icon largeIcon"
                              alt="${t("category.product")}"
                            >
                          </div>
                        `
                    }
                  </div>
                `
            }
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}
/* Initialize Tabs */
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tabButton");
  if (!tabButtons.length) {
    return;
  }
  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      tabButtons.forEach(function (tab) {
        tab.classList.remove("activeTab");
      });
      button.classList.add("activeTab");
      appState.activeTab = button.dataset.tab;
      /* Show FAB only on Lists tab */
      const fab = document.getElementById("openItemBottomSheetButton");
      if (fab) {
        fab.classList.toggle("hidden", appState.activeTab !== "lists");
      }
      renderFilteredItems();
    });
  });
}
/* Search */
if (searchInput) {
  searchInput.addEventListener("input", function (event) {
    appState.searchQuery = event.target.value.trim().toLowerCase();
    renderFilteredItems();
  });
}
/* Back Button */
const backButton = document.getElementById("backButton");
if (backButton) {
  backButton.addEventListener("click", function () {
    window.location.href = "../pages/dashboardPage.html";
  });
}
/* Initial Render */
(async function () {
  await loadProductCatalog();
  if (typeof initializeLocalization === "function") {
    await initializeLocalization();
  }
  initializeCategoryPage();
})();
