/***************************************************************************************************
 * FILE: helpers.js
 *
 * PURPOSE
 * Provides reusable helper functions shared across the ShopMate application.
 *
 * RESPONSIBILITIES
 * • Product catalog management
 * • Product search
 * • UI helpers
 * • Bottom Sheet helpers
 * • Dialog helpers
 * • Toast helpers
 * • Permission helpers
 * • Notification helpers
 * • Utility helpers
 *
 * FUNCTIONS IN THIS FILE
 *
 * Product Catalog
 * ├── loadProductCatalog()
 * ├── normalizeSearchText()
 * ├── searchProducts()
 * ├── findProduct()
 * └── getQuickPickProducts()
 *
 * Product Suggestions
 * ├── renderProductSuggestions()
 * └── selectSuggestedProduct()
 *
 * UI Helpers
 * ├── getIconPath()
 * ├── openBottomSheet()
 * ├── closeBottomSheet()
 * ├── getActiveCategory()
 * └── debugActiveCategory()
 *
 * Permission Helpers
 * ├── getCurrentMember()
 * ├── isAdmin()
 * ├── isMember()
 * ├── canManageBudget()
 * └── canManageGroup()
 *
 * Budget Helpers
 * └── calculateGroupBudget()
 *
 * Dialog Helpers
 * ├── showDialog()
 * ├── closeDialog()
 * ├── showConfirmDialog()
 * └── executeDialogConfirm()
 *
 * Toast Helpers
 * └── showToast()
 *
 * Notification Helpers
 * ├── createNotification()
 * ├── markNotificationRead()
 * ├── markAllNotificationsRead()
 * └── updateNotificationBadge()
 *
 * Product Image Helpers
 * └── getProductImage()
 *
 * DEPENDENCIES
 * • stateManager.js
 *
 * PAGES
 * • Shared Across All Pages
 *
 * NOTE
 * This file should contain reusable helper functions only.
 * Business logic belongs inside the appropriate manager files.
 ***************************************************************************************************/
let productDatabase = [];
/* Load Product Catalog - Loads the product catalog from the JSON file into memory. */
async function loadProductCatalog() {
  try {
    const response = await fetch("../data/json/products.json");
    productDatabase = await response.json();
  } catch {
    productDatabase = [];
  }
}
/* Normalize Search Text - Normalizes text to improve search consistency. */
function normalizeSearchText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}
/* Search Products - Searches the product catalog and returns matching products. */
function searchProducts(searchText, maxResults = 8) {
  if (!searchText) {
    return [];
  }
  const query = normalizeSearchText(searchText);
  const startsWithMatches = [];
  const containsMatches = [];
  productDatabase.forEach(function (product) {
    const productName = normalizeSearchText(product.name);
    if (productName.startsWith(query)) {
      startsWithMatches.push(product);
      return;
    }
    if (productName.includes(query)) {
      containsMatches.push(product);
    }
  });
  return [...startsWithMatches, ...containsMatches].slice(0, maxResults);
}
/* Find Product - Finds a product by name from the loaded product catalog. */
function findProduct(productName) {
  return productDatabase.find(function (product) {
    return (
      normalizeSearchText(product.name) === normalizeSearchText(productName)
    );
  });
}
/* Get Quick Pick Products - Returns the user's most frequently used products. */
function getQuickPickProducts(maxResults = 5) {
  const usage = JSON.parse(localStorage.getItem("productUsage")) || {};
  return [...productDatabase]
    .sort(function (a, b) {
      return (usage[b.name] || 0) - (usage[a.name] || 0);
    })
    .slice(0, maxResults);
}
/* Product Suggestions - Renders matching products below the search box as the user types. */
function renderProductSuggestions(searchText) {
  const suggestionContainer = document.getElementById("productSuggestions");
  if (!suggestionContainer) {
    return;
  }
  suggestionContainer.innerHTML = "";
  let products = [];
  const search = searchText.trim();
  if (search === "") {
    products = getQuickPickProducts();
  } else {
    products = searchProducts(search);
  }
  if (products.length === 0) {
    suggestionContainer.classList.remove("showSuggestions");
    return;
  }
  suggestionContainer.classList.add("showSuggestions");
  const heading =
    search === ""
      ? `
        <div class="quickPickHeading">
          ⭐ Quick Picks
        </div>
      `
      : "";
  suggestionContainer.innerHTML =
    heading +
    products
      .map(function (product) {
        const image = getProductImage(product.name);
        let displayName = product.name;
        if (search !== "") {
          const regex = new RegExp("(" + search + ")", "ig");
          displayName = product.name.replace(
            regex,
            "<span class='matchedText'>$1</span>",
          );
        }
        return `
          <div
            class="productSuggestionItem"
            onclick="selectSuggestedProduct('${product.name}')"
          >
            <div class="productSuggestionImage">
              ${image ? `<img src="${image}">` : "📦"}
            </div>
            <div class="productSuggestionName">
              ${displayName}
            </div>
          </div>
        `;
      })
      .join("");
}
/* Select Suggested Product - Populates the item form using the selected product details. */
function selectSuggestedProduct(productName) {
  const product = findProduct(productName);
  if (!product) {
    return;
  }
  const itemNameInput = document.getElementById("itemNameInput");
  const itemQuantityInput = document.getElementById("itemQuantityInput");
  const itemPriceInput = document.getElementById("itemPriceInput");
  const itemShopInput = document.getElementById("itemShopInput");
  const imagePreview = document.getElementById("itemImagePreview");
  const suggestionContainer = document.getElementById("productSuggestions");
  itemNameInput.value = product.name;
  if (!itemPriceInput.value) {
    itemPriceInput.value = product.defaultPrice || "";
  }
  if (!itemShopInput.value) {
    itemShopInput.value = product.preferredShop || "";
  }
  const image = getProductImage(product.name);
  if (image) {
    imagePreview.src = image;
    imagePreview.classList.remove("hidden");
  }
  suggestionContainer.innerHTML = "";
  suggestionContainer.classList.remove("showSuggestions");
  itemQuantityInput.focus();
}
const ICON_BASE_PATH = "../assets/icons";
/* Get Icon Path - Returns the full path of an SVG icon from the assets folder. */
function getIconPath(folder, iconName) {
  return `${ICON_BASE_PATH}/${folder}/${iconName}.svg`;
}
/* Open Bottom Sheet - Displays the bottom sheet and prevents background interaction. */
function openBottomSheet() {
  const bottomSheet = document.getElementById("bottomSheet");
  const screenOverlay = document.getElementById("screenOverlay");
  const appFooter = document.querySelector(".appFooter");
  if (!bottomSheet || !screenOverlay) {
    return;
  }
  screenOverlay.classList.remove("hidden");
  bottomSheet.classList.remove("hidden");
  if (appFooter) {
    appFooter.classList.add("hiddenFooter");
  }
  document.body.style.overflow = "hidden";
}
/* Close Bottom Sheet - Hides the bottom sheet and restores page interaction. */
function closeBottomSheet() {
  console.log("Attempting to close bottom sheet");
  const bottomSheet = document.getElementById("bottomSheet");
  const screenOverlay = document.getElementById("screenOverlay");
  const appFooter = document.querySelector(".appFooter");
  if (!bottomSheet || !screenOverlay) {
    console.log("Could Not close the bottom sheet");
    return;
  }
  screenOverlay.classList.add("hidden");
  bottomSheet.classList.add("hidden");
  if (appFooter) {
    appFooter.classList.remove("hiddenFooter");
  }
  document.body.style.overflow = "";
}
/* Initialize Bottom Sheet Events - Registers global events used by the bottom sheet. */
function initializeBottomSheetEvents() {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeBottomSheet();
    }
  });
}
/* Get Active Category - Returns the currently selected category object. */
function getActiveCategory() {
  const activeGroup = localStorage.getItem("activeGroup");
  const activeCategory = localStorage.getItem("activeCategory");
  if (!activeGroup || !activeCategory) {
    return null;
  }
  const categories = appState.groups[activeGroup];
  if (!categories) {
    return null;
  }
  return categories.find(function (category) {
    return category.name === activeCategory;
  });
}
/* Debug Active Category - Logs the active category to the browser console. */
function debugActiveCategory() {
  console.log("ACTIVE CATEGORY:", getActiveCategory());
}
/* Get Current Member - Returns the current user's membership details for the active group. */
function getCurrentMember() {
  const groupName = appState.activeGroup;
  if (!groupName || !appState.currentUser) {
    return null;
  }
  const members = appState.groupMembers[groupName] || [];
  return members.find(function (member) {
    return member.email === appState.currentUser.email;
  });
}
/* Is Admin - Determines whether the current user is an administrator of the active group. */
function isAdmin() {
  const member = getCurrentMember();
  return member ? member.role === "admin" : false;
}
/* Is Member - Determines whether the current user is a standard member of the active group. */
function isMember() {
  const member = getCurrentMember();
  return member ? member.role === "member" : false;
}
/* Can Manage Budget - Determines whether the current user can manage group budgets. */
function canManageBudget() {
  return isAdmin();
}
/* Can Manage Group - Determines whether the current user can manage the active group. */
function canManageGroup() {
  return isAdmin();
}
/* Calculate Group Budget - Calculates the total amount spent for the active shopping group. */
function calculateGroupBudget() {
  if (!appState.budgets.groupBudgets) {
    appState.budgets.groupBudgets = {};
  }
  if (!appState.budgets.groupBudgets[appState.activeGroup]) {
    appState.budgets.groupBudgets[appState.activeGroup] = {
      monthlyLimit: null,
    };
  }
  let spent = 0;
  const categories = appState.groups[appState.activeGroup] || [];
  categories.forEach(function (category) {
    category.items.forEach(function (item) {
      if (item.purchased && item.estimatedPrice) {
        spent += Number(item.estimatedPrice);
      }
    });
  });
  return spent;
}
/* Show Dialog */
function showDialog(title, message="") {
  const existingDialog = document.getElementById("appDialogOverlay");
  if (existingDialog) {
    existingDialog.remove();
  }
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="appDialogOverlay"
        class="dialogOverlay"
      >
        <div class="appDialog">
          <h2 class="dialogTitle">
            ${title}
          </h2>
          <p class="dialogMessage">
            ${message}
          </p>
          <div class="dialogActions">
            <button
              class="primaryButton"
              onclick="closeDialog()"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    `,
  );
}
/* Close Dialog - Closes the currently displayed dialog. */
function closeDialog() {
  const dialog = document.getElementById("appDialogOverlay");
  if (dialog) {
    dialog.remove();
  }
}
/* Show Confirmation Dialog - Displays a confirmation dialog and executes the supplied callback when confirmed. */
function showConfirmDialog(title, message, onConfirm, confirmText = "Confirm") {
  const existingDialog = document.getElementById("appDialogOverlay");
  if (existingDialog) {
    existingDialog.remove();
  }
  window.dialogConfirmAction = onConfirm;
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="appDialogOverlay"
        class="dialogOverlay"
      >
        <div class="appDialog">
          <h2 class="dialogTitle">
            ${title}
          </h2>
          <p class="dialogMessage">
            ${message}
          </p>
          <div class="dialogActions">
            <button
              class="secondaryButton"
              onclick="closeDialog()"
            >
              Cancel
            </button>
            <button
              class="dangerButton"
              onclick="executeDialogConfirm()"
            >
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `,
  );
}
/* Execute Dialog Confirmation - Executes the stored confirmation callback and closes the dialog. */
function executeDialogConfirm() {
  if (typeof window.dialogConfirmAction === "function") {
    window.dialogConfirmAction();
  }
  closeDialog();
}
/* Show Toast - Displays a temporary toast notification to provide user feedback. */
function showToast(message, type = "success") {
  const existingToast = document.getElementById("appToast");
  if (existingToast) {
    existingToast.remove();
  }
  const icon = type === "success" ? "✓" : "ℹ";
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="appToast"
        class="
          toast
          ${type === "success" ? "toastSuccess" : "toastInfo"}
        "
      >
        <span class="toastIcon">
          ${icon}
        </span>
        <span class="toastText">
          ${message}
        </span>
      </div>
    `,
  );
  setTimeout(function () {
    const toast = document.getElementById("appToast");
    if (toast) {
      toast.remove();
    }
  }, 2500);
}
/* Create Notification - Creates a new notification and updates the notification badge. */
function createNotification(
  type,
  title,
  message,
  action = null,
  actionData = null,
) {
  const duplicateNotification = appState.notifications.find(
    function (notification) {
      return (
        notification.type === type &&
        notification.title === title &&
        notification.message === message &&
        Date.now() - notification.createdAt < 30000
      );
    },
  );
  if (duplicateNotification) {
    return;
  }
  appState.notifications.unshift({
    id: "notif_" + Date.now(),
    type,
    title,
    message,
    createdAt: Date.now(),
    read: false,
    action,
    actionData,
  });
  const MAX_NOTIFICATIONS = 100;
  if (appState.notifications.length > MAX_NOTIFICATIONS) {
    appState.notifications = appState.notifications.slice(0, MAX_NOTIFICATIONS);
  }
  saveAppState();
  updateNotificationBadge();
}
/* Mark Notification Read - Marks a notification as read and refreshes the notification UI. */
function markNotificationRead(notificationId) {
  const notification = appState.notifications.find(function (notification) {
    return notification.id === notificationId;
  });
  if (!notification) {
    return;
  }
  notification.read = true;
  saveAppState();
  if (typeof renderNotifications === "function") {
    renderNotifications();
  }
  updateNotificationBadge();
}
/* Mark All Notifications Read - Marks every notification as read and refreshes the notification UI. */
function markAllNotificationsRead() {
  appState.notifications.forEach(function (notification) {
    notification.read = true;
  });
  saveAppState();
  if (typeof renderNotifications === "function") {
    renderNotifications();
  }
  updateNotificationBadge();
  showToast("All Notifications Read");
}
/* Update Notification Badge - Updates the unread notification count displayed in the application header. */
function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (!badge) {
    return;
  }
  const unreadCount = appState.notifications.filter(function (notification) {
    return !notification.read;
  }).length;
  badge.textContent = unreadCount;
  badge.classList.toggle("hidden", unreadCount === 0);
}
const PRODUCT_IMAGE_PATH = "../assets/images/products";
/* Get Product Image - Returns the image path for the specified product. */
function getProductImage(itemName) {
  const product = productDatabase.find(function (product) {
    return product.name && product.name.trim().toLowerCase() === itemName.trim().toLowerCase();
  });
  if (!product) {
    return "";
  }
  return `${PRODUCT_IMAGE_PATH}/${product.image}`;
}
/***************************************************************************************************
 * Backend
 *
 * GET /products/image
 *
 * Returns
 * {
 *   productName,
 *   imageUrl
 * }
 ***************************************************************************************************/
/* Normalize Item Name */
function normalizeItemName(itemName) {
  return itemName.trim().toLowerCase();
}
/* Initialize Helpers - Registers helper event listeners and shared helper functionality. */
function initializeHelpers() {
  initializeBottomSheetEvents();
}
initializeHelpers();
