/* App State */

const appState = {
  activeGroup: null,

  activeCategory: null,

  activeTab: "lists",

  searchQuery: "",

  selectionMode: false,

  selectedItems: [],

  favoriteItems: [
    {
      name: "Milk",
      quantity: 2,
      notes: "Low Fat",
      preferredShop: "Woolworths",
    },
  ],

  groups: {
    "Family Group": [
      {
        name: "Monthly Groceries",

        items: [
          {
            name: "Milk",
            quantity: 2,
            notes: "Low Fat",
            preferredShop: "Woolworths",
            purchased: false,
          },

          {
            name: "Bread",
            quantity: 1,
            notes: "",
            preferredShop: "",
            purchased: false,
          },

          {
            name: "Eggs",
            quantity: 12,
            notes: "",
            preferredShop: "",
            purchased: true,
          },
        ],
      },

      {
        name: "Health",
        items: [],
      },
    ],

    "Office Team": [
      {
        name: "Pantry",

        items: [
          {
            name: "Coffee",
            quantity: 1,
            notes: "",
            preferredShop: "",
            purchased: false,
          },
        ],
      },
    ],

    "Friends Trip": [],
  },
};

/* Global Elements */

const groupDropdownButton = document.getElementById("groupDropdownButton");

const selectedGroupName = document.getElementById("selectedGroupName");

const openCategoryBottomSheetButton = document.getElementById(
  "openCategoryBottomSheetButton",
);

const openItemBottomSheetButton = document.getElementById(
  "openItemBottomSheetButton",
);

const bottomSheet = document.getElementById("bottomSheet");

const bottomSheetContent = document.getElementById("bottomSheetContent");

const screenOverlay = document.getElementById("screenOverlay");

const appFooter = document.querySelector(".appFooter");

const categoryList = document.getElementById("categoryList");

const emptyStateSection = document.getElementById("emptyStateSection");

const categoryPageTitle = document.getElementById("categoryPageTitle");

const itemList = document.getElementById("itemList");

const itemEmptyState = document.getElementById("itemEmptyState");

const searchInput = document.querySelector(".searchInput");

const snackbar = document.getElementById("snackbar");

const snackbarText = document.getElementById("snackbarText");

const snackbarUndoButton = document.getElementById("snackbarUndoButton");

const bulkActionBar = document.getElementById("bulkActionBar");

const bulkFavoriteButton = document.getElementById("bulkFavoriteButton");

const bulkPurchasedButton = document.getElementById("bulkPurchasedButton");

const bulkDeleteButton = document.getElementById("bulkDeleteButton");

/* Delete State */

let pendingDeletedItem = null;

let pendingDeleteTimeout = null;

/* Open Bottom Sheet */

function openBottomSheet() {
  if (!bottomSheet) {
    return;
  }

  screenOverlay.classList.remove("hidden");

  bottomSheet.classList.remove("hidden");

  appFooter.classList.add("hiddenFooter");
}

/* Close Bottom Sheet */

function closeBottomSheet() {
  if (!bottomSheet) {
    return;
  }

  screenOverlay.classList.add("hidden");

  bottomSheet.classList.add("hidden");

  appFooter.classList.remove("hiddenFooter");
}

/* Get Active Category */

function getActiveCategory() {
  const activeGroup = localStorage.getItem("activeGroup");

  const activeCategory = localStorage.getItem("activeCategory");

  const categories = appState.groups[activeGroup];

  if (!categories) {
    return null;
  }

  return categories.find(function (category) {
    return category.name === activeCategory;
  });
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

  if (appState.searchQuery) {
    filteredItems = filteredItems.filter(function (item) {
      return item.name.toLowerCase().includes(appState.searchQuery);
    });
  }

  return filteredItems;
}

/* Render Categories */

function renderCategories() {
  if (!categoryList) {
    return;
  }

  categoryList.innerHTML = "";

  if (!appState.activeGroup) {
    emptyStateSection.innerHTML = `
            <p class="emptyStateText">
                Select or create a group
            </p>
        `;

    return;
  }

  const categories = appState.groups[appState.activeGroup];

  if (categories.length === 0) {
    emptyStateSection.innerHTML = `
            <p class="emptyStateText">
                No categories yet
            </p>
        `;

    return;
  }

  emptyStateSection.innerHTML = "";

  categories.forEach(function (category) {
    categoryList.innerHTML += `

            <div
                class="categoryCard"
                onclick="openCategoryPage('${category.name}')"
            >

                <h2 class="categoryTitle">
                    ${category.name}
                </h2>

                <p class="categoryInfo">
                    ${category.items.length} Items
                </p>

            </div>
        `;
  });
}

/* Open Category Page */

function openCategoryPage(categoryName) {
  localStorage.setItem("activeGroup", appState.activeGroup);

  localStorage.setItem("activeCategory", categoryName);

  window.location.href = "../pages/categoryPage.html";
}

/* Render Category Page */

function renderCategoryPage() {
  if (!categoryPageTitle) {
    return;
  }

  const activeCategory = localStorage.getItem("activeCategory");

  categoryPageTitle.textContent = activeCategory;

  renderFilteredItems();
}

/* Render Filtered Items */

function renderFilteredItems() {
  const filteredItems = getFilteredItems();

  renderItems(filteredItems);
}

/* Render Items */

function renderItems(items) {
  if (!itemList) {
    return;
  }

  itemList.innerHTML = "";

  if (items.length === 0) {
    let emptyMessage = "No items yet";

    if (appState.activeTab === "favorites") {
      emptyMessage = "No favorite items yet";
    }

    if (appState.activeTab === "purchased") {
      emptyMessage = "No purchased items yet";
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
    const isFavorite = appState.favoriteItems.some(function (favoriteItem) {
      return favoriteItem.name === item.name;
    });

    itemList.innerHTML += `

            <div class="swipeWrapper">

                <div class="swipeBackground">

                    <div class="swipePurchased">
                        ${
                          appState.activeTab === "purchased"
                            ? "↺ Re-Add"
                            : "✓ Purchased"
                        }
                    </div>

                    <div class="swipeDelete">
                        🗑 Delete
                    </div>

                </div>


                <div
                    class="itemCard swipeCard
                    ${
                      appState.selectedItems.includes(item.name)
                        ? "selectedItem"
                        : ""
                    }
                    "

                    data-item-name="${item.name}"
                >

                    <div class="itemCardTopRow">

                        <h2 class="itemName">
                            ${item.name}
                        </h2>


                        <div class="itemActionButtons">

                            <button
                                class="itemActionButton"
                                ontouchstart="event.stopPropagation()"
                                onclick="event.stopPropagation(); toggleFavorite('${item.name}')"
                            >
                                ${isFavorite ? "♥" : "♡"}
                            </button>


                            ${
                              appState.activeTab === "favorites"
                                ? `

                                <button
                                    class="itemActionButton"
                                    ontouchstart="event.stopPropagation()"
                                    onclick="event.stopPropagation(); addFavoriteToList('${item.name}')"
                                >
                                    +
                                </button>

                                `
                                : `

                                <button
                                    class="itemActionButton"
                                    ontouchstart="event.stopPropagation()"
                                    onclick="event.stopPropagation(); togglePurchased('${item.name}')"
                                >
                                    ${
                                      appState.activeTab === "purchased"
                                        ? "↺"
                                        : "✓"
                                    }
                                </button>

                                `
                            }

                        </div>

                    </div>


                    <p class="itemDetails">
                        Quantity: ${item.quantity}
                    </p>

                    <p class="itemDetails">
                        Notes: ${item.notes || "-"}
                    </p>

                    <p class="itemDetails">
                        Shop: ${item.preferredShop || "-"}
                    </p>

                </div>

            </div>
        `;
  });

  initializeSwipeGestures();
}

/* Toggle Favorite */

function toggleFavorite(itemName) {
  const currentCategory = getActiveCategory();

  if (!currentCategory) {
    return;
  }

  const currentItem = currentCategory.items.find(function (item) {
    return item.name === itemName;
  });

  if (!currentItem) {
    return;
  }

  const existingFavorite = appState.favoriteItems.find(function (item) {
    return item.name === itemName;
  });

  if (existingFavorite) {
    appState.favoriteItems = appState.favoriteItems.filter(function (item) {
      return item.name !== itemName;
    });
  } else {
    appState.favoriteItems.unshift({
      name: currentItem.name,

      quantity: currentItem.quantity,

      notes: currentItem.notes,

      preferredShop: currentItem.preferredShop,
    });
  }

  renderFilteredItems();
}

/* Add Favorite To List */

function addFavoriteToList(itemName) {
  const favoriteItem = appState.favoriteItems.find(function (item) {
    return item.name === itemName;
  });

  if (!favoriteItem) {
    return;
  }

  const currentCategory = getActiveCategory();

  const existingItem = currentCategory.items.find(function (item) {
    return item.name.toLowerCase() === itemName.toLowerCase();
  });

  if (existingItem) {
    alert("Item already exists in this list");

    return;
  }

  currentCategory.items.unshift({
    name: favoriteItem.name,

    quantity: favoriteItem.quantity,

    notes: favoriteItem.notes,

    preferredShop: favoriteItem.preferredShop,

    purchased: false,
  });

  appState.activeTab = "lists";

  renderFilteredItems();
}

/* Toggle Purchased */

function togglePurchased(itemName) {
  const currentCategory = getActiveCategory();

  const item = currentCategory.items.find(function (item) {
    return item.name === itemName;
  });

  if (!item) {
    return;
  }

  item.purchased = !item.purchased;

  renderFilteredItems();
}

/* Create Item */

function createItem() {
  const itemNameInput = document.getElementById("itemNameInput");

  const itemQuantityInput = document.getElementById("itemQuantityInput");

  const itemNotesInput = document.getElementById("itemNotesInput");

  const itemShopInput = document.getElementById("itemShopInput");

  const itemName = itemNameInput.value.trim();

  const itemQuantity = itemQuantityInput.value.trim();

  const itemNotes = itemNotesInput.value.trim();

  const itemShop = itemShopInput.value.trim();

  if (!itemName || !itemQuantity) {
    return;
  }

  const currentCategory = getActiveCategory();

  currentCategory.items.unshift({
    name: itemName,

    quantity: itemQuantity,

    notes: itemNotes,

    preferredShop: itemShop,

    purchased: false,
  });

  renderFilteredItems();

  closeBottomSheet();
}

/* Search Items */

function searchItems() {
  appState.searchQuery = searchInput.value.trim().toLowerCase();

  renderFilteredItems();
}

/* Initialize Swipe Gestures */

function initializeSwipeGestures() {
  const swipeCards = document.querySelectorAll(".swipeCard");

  swipeCards.forEach(function (card) {
    let startX = 0;

    let currentX = 0;

    let isDragging = false;

    let longPressTimer = null;

    card.addEventListener("touchstart", function (event) {
      startX = event.touches[0].clientX;

      isDragging = true;

      longPressTimer = setTimeout(function () {
        toggleItemSelection(card.dataset.itemName);
      }, 500);
    });

    card.addEventListener("touchmove", function (event) {
      clearTimeout(longPressTimer);

      if (!isDragging) {
        return;
      }

      if (appState.selectionMode) {
        return;
      }

      currentX = event.touches[0].clientX;

      const diffX = currentX - startX;

      card.style.transform = `translateX(${diffX}px)`;
    });

    card.addEventListener("touchend", function () {
      clearTimeout(longPressTimer);

      if (!isDragging) {
        return;
      }

      isDragging = false;

      if (appState.selectionMode) {
        toggleItemSelection(card.dataset.itemName);

        card.style.transform = "translateX(0px)";

        return;
      }

      const diffX = currentX - startX;

      const itemName = card.dataset.itemName;

      if (diffX > 120) {
        togglePurchased(itemName);
      } else if (diffX < -120) {
        deleteItem(itemName);
      }

      card.style.transform = "translateX(0px)";
    });
  });
}

/* Toggle Item Selection */

function toggleItemSelection(itemName) {
  appState.selectionMode = true;

  if (appState.selectedItems.includes(itemName)) {
    appState.selectedItems = appState.selectedItems.filter(function (item) {
      return item !== itemName;
    });
  } else {
    appState.selectedItems.push(itemName);
  }

  if (appState.selectedItems.length === 0) {
    appState.selectionMode = false;

    bulkActionBar.classList.add("hidden");
  } else {
    bulkActionBar.classList.remove("hidden");
  }

  renderFilteredItems();
}

/* Bulk Favorite */

function bulkFavoriteItems() {
  appState.selectedItems.forEach(function (itemName) {
    toggleFavorite(itemName);
  });

  clearSelectionMode();
}

/* Bulk Purchased */

function bulkPurchasedItems() {
  appState.selectedItems.forEach(function (itemName) {
    togglePurchased(itemName);
  });

  clearSelectionMode();
}

/* Bulk Delete */

function bulkDeleteItems() {
  appState.selectedItems.forEach(function (itemName) {
    deleteItem(itemName);
  });

  clearSelectionMode();
}

/* Clear Selection Mode */

function clearSelectionMode() {
  appState.selectionMode = false;

  appState.selectedItems = [];

  bulkActionBar.classList.add("hidden");

  renderFilteredItems();
}

/* Delete Item */

function deleteItem(itemName) {
  const currentCategory = getActiveCategory();

  const itemIndex = currentCategory.items.findIndex(function (item) {
    return item.name === itemName;
  });

  if (itemIndex === -1) {
    return;
  }

  pendingDeletedItem = {
    item: currentCategory.items[itemIndex],

    index: itemIndex,
  };

  currentCategory.items.splice(itemIndex, 1);

  renderFilteredItems();

  showUndoSnackbar(itemName);
}

/* Show Undo Snackbar */

function showUndoSnackbar(itemName) {
  if (!snackbar) {
    return;
  }

  snackbarText.textContent = `${itemName} deleted`;

  snackbar.classList.remove("hidden");

  clearTimeout(pendingDeleteTimeout);

  pendingDeleteTimeout = setTimeout(function () {
    finalizeDelete();
  }, 5000);
}

/* Undo Delete */

function undoDelete() {
  if (!pendingDeletedItem) {
    return;
  }

  const currentCategory = getActiveCategory();

  currentCategory.items.splice(
    pendingDeletedItem.index,

    0,

    pendingDeletedItem.item,
  );

  pendingDeletedItem = null;

  clearTimeout(pendingDeleteTimeout);

  snackbar.classList.add("hidden");

  renderFilteredItems();
}

/* Finalize Delete */

function finalizeDelete() {
  pendingDeletedItem = null;

  snackbar.classList.add("hidden");
}

/* Initialize Tabs */

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tabButton");

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      tabButtons.forEach(function (tab) {
        tab.classList.remove("activeTab");
      });

      button.classList.add("activeTab");

      appState.activeTab = button.dataset.tab;

      clearSelectionMode();

      renderFilteredItems();
    });
  });
}

/* Event Listeners */

if (searchInput) {
  searchInput.addEventListener("input", searchItems);
}

if (snackbarUndoButton) {
  snackbarUndoButton.addEventListener("click", undoDelete);
}

if (bulkFavoriteButton) {
  bulkFavoriteButton.addEventListener("click", bulkFavoriteItems);
}

if (bulkPurchasedButton) {
  bulkPurchasedButton.addEventListener("click", bulkPurchasedItems);
}

if (bulkDeleteButton) {
  bulkDeleteButton.addEventListener("click", bulkDeleteItems);
}

/* Initial Render */

renderCategories();

renderCategoryPage();

initializeTabs();
