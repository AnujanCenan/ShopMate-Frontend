async function getRenderingItems() {
  const categoryId = localStorage.getItem("activeCategoryId")
  const groupId = localStorage.getItem("activeGroupId");

  const res = await fetch(`http://localhost:5113/api/get-rendering-items?listId=${categoryId}&familyGroupId=${groupId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
  })

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }

  const all_items = await res.json();

  state.listItems = all_items.ListItems;
  state.favoriteItems = all_items.Favourites;

  saveState();
}

/* Initialize Category Page */
async function initializeCategoryPage() {

  const categoryId = localStorage.getItem("activeCategoryId")
  const groupId = localStorage.getItem("activeGroupId");

  await getRenderingItems();

  state.activeTab = "lists";
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

/* Render Category Page */
function renderCategoryPage() {
  if (!categoryPageTitle) {
    return;
  }
  const activeCategory = localStorage.getItem("activeCategory");
  categoryPageTitle.textContent = activeCategory;
  const fab = document.getElementById("openItemBottomSheetButton");
  if (fab) {
    fab.classList.toggle("hidden", state.activeTab !== "lists");
  }
  renderFilteredItems();
}
/* Get Filtered Items */
function getFilteredItems() {
  let filteredItems = [];
  if (state.activeTab === "favorites") {
    filteredItems = [...state.favoriteItems];
  } else {
    // const currentCategory = getActiveCategory();
    // if (!currentCategory) {
    //   return [];
    // }

    filteredItems = state.listItems;
    if (state.activeTab === "lists") {
      filteredItems = filteredItems.filter(function (item) {
        return item.Purchased === false;
      });
    }
    if (state.activeTab === "purchased") {
      filteredItems = filteredItems.filter(function (item) {
        return item.Purchased === true;
      });
    }
  }
  /* Search Filter */
  if (appState.searchQuery) {
    filteredItems = filteredItems.filter(function (item) {
      return item.ItemName.toLowerCase().includes(appState.searchQuery);
    });
  }
  return filteredItems;
}


/* Render Filtered Items */
async function renderFilteredItems() {

  const filteredItems = await getFilteredItems()
  renderItems(filteredItems);
  initializeSwipeGestures();
}
/* Render Items */
function renderItems(items) {
  console.log(`renderItems(): items = ${items}`);
  if (!itemList) {
    return;
  }
  itemList.innerHTML = "";
  /* Empty State */
<<<<<<< HEAD
  if (!items || items.length === 0) {
    let emptyMessage = "No items yet";
    if (state.activeTab === "favorites") {
      emptyMessage = "No favorite items yet";
    }
    if (state.activeTab === "purchased") {
      emptyMessage = "No purchased items yet";
=======
  if (items.length === 0) {
    let emptyMessage = t("category.noItems");
    if (appState.activeTab === "favorites") {
      emptyMessage = t("category.noFavoriteItems");
    }
    if (appState.activeTab === "purchased") {
      emptyMessage = t("category.noPurchasedItems");
>>>>>>> upstream/master
    }
    itemEmptyState.innerHTML = `
      <p class="emptyStateText">
        ${emptyMessage}
      </p>
    `;
    return;
  }
  itemEmptyState.innerHTML = "";
  items.forEach(function (item) {
    const normalizedItemName = item.ItemName.trim().toLowerCase();
    const isFavorite = state.favoriteItems.some(function (favoriteItem) {
      return favoriteItem.ItemName.trim().toLowerCase() === normalizedItemName;
    });
    itemList.innerHTML += `
<<<<<<< HEAD
            <div class="swipeWrapper">
                <div class="swipeBackground">
                    <div class="swipePurchased">
  <img
    src="${
      state.activeTab === "favorites"
        ? getIconPath("actions", "add")
        : state.activeTab === "purchased"
          ? getIconPath("actions", "re-add")
          : getIconPath("actions", "purchased")
    }"
    class="icon actionIcon"
    alt=""
  >
  ${
    state.activeTab === "favorites"
      ? "Add to List"
      : state.activeTab === "purchased"
        ? "Re-Add"
        : "Purchased"
  }
</div>
<div class="swipeDelete">
  <img
    src="${
      state.activeTab === "favorites"
        ? getIconPath(
            "actions",
            item.isFavorite ? "favorite" : "favorite-outline",
          )
        : getIconPath("actions", "delete")
    }"
    class="icon actionIcon"
    alt=""
  >
  ${state.activeTab === "favorites" ? "Remove Favorite" : "Delete"}
  </div>
</div>
               <div class="itemCard swipeCard ${
                 state.selectedItems.includes(item.ListItemId)
                   ? "selectedItem"
                   : " "
               }" data-item-name="${
                 item.ItemName
               }" data-list-item-id="${
                 item.ListItemId
               }" data-item-master-id="${
                item.ItemMasterId
               }"
               onclick=" event.stopPropagation();
            if (appState.selectionMode){
                toggleItemSelection(${item.ListItemId});
            }" oncontextmenu=" event.preventDefault(); toggleItemSelection(${item.ListItemId});">
               <div class="itemCardTopRow">
               <div class="itemTitleSection">
            <h2
            class="itemName"
            onclick="
            event.stopPropagation();
            
            if (!state.selectionMode) {
              renderEditItemForm(${item.ListItemId});
            }
            ">
            ${item.ItemName}
            </h2>
            ${
              state.activeTab === "favorites"
                ? ""
                : `
            <p class="itemQuantityBadge">
            Qty: ${item.Quantity}
            </p>
            `
            }
            </div>
               <div class="itemActionButtons">
                <button
  class="modernActionButton favoriteActionButton ${
    isFavorite ? "activeFavoriteButton" : ""
  }"
  onclick="event.stopPropagation(); toggleFavorite_mysql(${item.ItemMasterId});"
>
  <img
    src="${getIconPath(
      "actions",
      isFavorite ? "favorite" : "favorite-outline",
    )}"
    class="icon actionIcon"
    alt="Favorite"
  >
</button>
               ${
                 state.activeTab === "favorites"
                   ? `<button
  class="modernActionButton addActionButton"
  onclick="addFavoriteToList('${item.ItemName}')"
>
  <img
    src="${getIconPath("actions", "add")}"
    class="icon actionIcon"
    alt="Add"
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
    onclick="
        event.stopPropagation();
        openPurchaseConfirmation(${item.ListItemId});
    "
>
    <span class="actionButtonIcon">
       <img
  src="${
    state.activeTab === "purchased"
      ? getIconPath("actions", "re-add")
      : getIconPath("actions", "purchased")
  }"
  class="icon actionIcon"
  alt=""
>
    </span>
</button>
            `
               }
    </div>
</div>
<div class="itemCardContent">
    ${
      state.activeTab === "favorites"
        ? `
            <div class="itemImageContainer">
                ${
                  getProductImage(item.ItemName)
                    ? `<img src="${getProductImage(item.ItemName)}"
                            class="itemImage"
                            alt="${item.ItemName}">`
                    : `<div class="itemImagePlaceholder">
  <img
    src="${getIconPath("actions", "package")}"
    class="icon largeIcon"
    alt="Product"
  >
</div>`
                }
            </div>
          `
        : `
            <div class="itemDetailsSection">
                <p class="itemDetails">
                    Notes: ${item.OptionalNotes || "-"}
                </p>
                <p class="itemDetails">
                    Shop: ${item.ShopName || "-"}
                </p>
                <p class="itemDetails">
                    Est Price: $${item.estimatedPrice || 0}
                </p>
            </div>
            <div class="itemImageContainer">
                ${
                  getProductImage(item.ItemName)
                    ? `<img src="${getProductImage(item.ItemName)}"
                            class="itemImage"
                            alt="${item.ItemName}">`
                    : `<div class="itemImagePlaceholder">
  <img
    src="${getIconPath("actions", "package")}"
    class="icon largeIcon"
    alt="Product"
  >
</div>`
                }
            </div>
          `
    }
</div>`;
=======
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
            appState.selectedItems.includes(item.name) ? "selectedItem" : " "
          }"
          data-item-name="${item.name}"
          onclick="
            event.stopPropagation();
            if(appState.selectionMode){
              toggleItemSelection('${item.name}');
            }
          "
          oncontextmenu="
            event.preventDefault();
            toggleItemSelection('${item.name}');
          "
        >
          <div class="itemCardTopRow">
            <div class="itemTitleSection">
              <h2
                class="itemName"
                onclick="
                  event.stopPropagation();
                  if(!appState.selectionMode){
                    renderEditItemForm('${item.name}');
                  }
                "
              >
                ${item.name}
              </h2>
              ${
                appState.activeTab === "favorites"
                  ? ""
                  : `
                    <p class="itemQuantityBadge">
                      ${t("category.quantity")}: ${item.quantity}
                    </p>
                  `
              }
            </div>
            <div class="itemActionButtons">
              <button
                class="modernActionButton favoriteActionButton ${
                  isFavorite ? "activeFavoriteButton" : ""
                }"
                onclick="
                  event.stopPropagation();
                  toggleFavorite('${item.name}');
                "
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
                      onclick="addFavoriteToList('${item.name}')"
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
                      onclick="
                        event.stopPropagation();
                        openPurchaseConfirmation('${item.name}');
                      "
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
                      getProductImage(item.name)
                        ? `
                          <img
                            src="${getProductImage(item.name)}"
                            class="itemImage"
                            alt="${item.name}"
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
                      ${t("category.notes")}: ${item.notes || "-"}
                    </p>
                    <p class="itemDetails">
                      ${t("category.shop")}: ${item.preferredShop || "-"}
                    </p>
                    <p class="itemDetails">
                      ${t("category.estimatedPrice")}: $${item.estimatedPrice || 0}
                    </p>
                  </div>
                  <div class="itemImageContainer">
                    ${
                      getProductImage(item.name)
                        ? `
                          <img
                            src="${getProductImage(item.name)}"
                            class="itemImage"
                            alt="${item.name}"
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
>>>>>>> upstream/master
  });
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
      state.activeTab = button.dataset.tab;
      /* Show FAB only on Lists tab */
      const fab = document.getElementById("openItemBottomSheetButton");
      if (fab) {
        fab.classList.toggle("hidden", state.activeTab !== "lists");
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
