let state = {
    listItems: [],
    favoriteItems: [],
    activeTab: 'lists'
};

async function getRenderingItems() {
  const categoryId = localStorage.getItem("activeCategoryId")
  const groupId = localStorage.getItem("activeGroupId");

  const res = await fetch(`http://localhost:5113/api/get-rendering-items?listId=${categoryId}&familyGroupId=${groupId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json'},
  })

  if (!res.ok) {
    const msg = await res.text();
    console.log(msg);
    return;
  }

  const all_items = await res.json();

  state.listItems = all_items.ListItems;
  state.favoriteItems = all_items.Favourites;
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
      return item.name.toLowerCase().includes(appState.searchQuery);
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
  console.log(items);
  if (!itemList) {
    return;
  }
  itemList.innerHTML = "";
  /* Empty State */
  if (!items || items.length === 0) {
    let emptyMessage = "No items yet";
    if (state.activeTab === "favorites") {
      emptyMessage = "No favorite items yet";
    }
    if (state.activeTab === "purchased") {
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
    const isFavorite = state.favoriteItems.some(function (favoriteItem) {
      return favoriteItem.ItemName === item.ItemName;
    });
    itemList.innerHTML += `
            <div class="swipeWrapper">
                <div class="swipeBackground">
                    <div class="swipePurchased">
                        ${
                          state.activeTab === "purchased"
                            ? "↺ Re-Add"
                            : "✓ Purchased"
                        }
                    </div>
                    <div class="swipeDelete">
                        🗑 Delete
                    </div>
                </div>
               <div class="itemCard swipeCard ${
                 appState.selectedItems.includes(item.ItemName)
                   ? "selectedItem"
                   : " "
               }" data-item-name="${
                 item.ItemName
               }" onclick=" event.stopPropagation();
            if(appState.selectionMode){
                toggleItemSelection('${item.ItemName}');
            }" oncontextmenu=" event.preventDefault(); toggleItemSelection('${item.ItemName}');">
               <div class="itemCardTopRow">
               <div class="itemTitleSection">
               <h2 class="itemName" onclick=" event.stopPropagation();
               if (!appState.selectionMode) {
               renderEditItemForm('${item.ItemName}');
               }
               ">${item.ItemName}</h2>
               <p class="itemQuantityBadge">
               Qty: ${item.Quantity}</p>
               </div>
               <div class="itemActionButtons">
               <button class="modernActionButton favoriteActionButton ${isFavorite ? "activeFavoriteButton" : ""} " 
                onclick="event.stopPropagation(); toggleFavorite_mysql(${item.ItemMasterId}, state);"
              >
               <span class="actionButtonIcon">
               ${isFavorite ? "♥" : "♡"}
               </span>
               </button>
               ${
                 state.activeTab === "favorites"
                   ? `<button class="modernActionButton addActionButton" onclick="addFavoriteToList('${item.ItemName}')">+</button>`
                   : `<button class="modernActionButton purchasedActionButton ${item.Purchased ? "activePurchasedButton" : ""}"
                  onclick="event.stopPropagation(); openPurchaseConfirmation('${item.ItemName}');">
          
                  <span class="actionButtonIcon">
                    ${state.activeTab === "purchased" ? "↺" : "✓"}
                  </span>
                  </button>
                  `
                }
              </div>
              </div>
              <div class="itemCardContent">
                <div class="itemDetailsSection">
                  <p class="itemDetails">Notes: ${item.OptionalNotes || "-"}</p>
                  <p class="itemDetails">Shop: ${item.shopName || "-"}</p>
                  <p class="itemDetails">Est Price: $${item.estimatedPrice || 0}</p>
                </div>
                <div class="itemImageContainer">
                  ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" class="itemImage" alt="${item.name}">` 
                    : `<div class="itemImagePlaceholder">📦</div>`}
                </div>
              </div>
            </div>
          </div>`;
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
      state.activeTab = button.dataset.tab;
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
initializeCategoryPage();
