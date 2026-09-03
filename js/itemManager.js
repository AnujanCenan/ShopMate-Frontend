const openItemBottomSheetButton = document.getElementById(
  "openItemBottomSheetButton",
);
const bottomSheetContent = document.getElementById("bottomSheetContent");
/* Favorite Item Being Added */
let favoriteItemToAdd = null;
/* Render Add Item Form */
function renderAddItemForm(itemName = "") {
  favoriteItemToAdd = itemName || null;
  const imageUrl = itemName ? getProductImage(itemName) : "";
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("item.addItem")}
      </h2>
      <button
        class="closeButton"
        onclick="
          favoriteItemToAdd = null;
          closeBottomSheet();
        "
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="formField">
        <label class="formLabel">
          ${t("item.itemName")}
        </label>
        <input
          type="text"
          id="itemNameInput"
          class="bottomSheetInput"
          placeholder="${t("item.enterItemName")}"
          value="${itemName}"
          ${itemName ? "readonly" : ""}
        >
        ${
          itemName
            ? ""
            : `<div
                 id="productSuggestions"
                 class="productSuggestions"
               ></div>`
        }
      </div>
      <div class="formRow">
        <div class="halfWidthField">
          <label class="formLabel">
            ${t("item.quantity")}
          </label>
          <input
            type="number"
            id="itemQuantityInput"
            class="bottomSheetInput"
            placeholder="${t("item.enterQuantity")}"
            value="1"
          >
        </div>
        <div class="halfWidthField">
          <label class="formLabel">
            ${t("item.estimatedPrice")}
          </label>
          <div class="currencyInputWrapper">
            <span class="currencySymbol">
              $
            </span>
            <input
              type="number"
              id="itemPriceInput"
              class="bottomSheetInput currencyInput"
              placeholder="${t("item.enterEstimatedPrice")}"
            >
          </div>
        </div>
      </div>
      <div class="formField">
        <img
          id="itemImagePreview"
          class="itemImagePreview ${imageUrl ? "" : "hidden"}"
          src="${imageUrl}"
          alt=""
        >
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.preferredShop")}
        </label>
        <input
          type="text"
          id="itemShopInput"
          class="bottomSheetInput"
          placeholder="${t("item.enterPreferredShop")}"
        >
      </div>
            <div class="formField">
        <label class="formLabel">
          ${t("item.notes")}
        </label>
        <input
          type="text"
          id="itemNotesInput"
          class="bottomSheetInput"
          placeholder="${t("item.enterNotes")}"
        >
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.repeat")}
        </label>
        <select
          id="itemRecurrenceFrequency"
          class="bottomSheetInput"
        >
          <option value="none">
            ${t("item.doesNotRepeat")}
          </option>
          <option value="daily">
            ${t("item.daily")}
          </option>
          <option value="weekly">
            ${t("item.weekly")}
          </option>
          <option value="monthly">
            ${t("item.monthly")}
          </option>
        </select>
      </div>
      <div
        id="itemRecurrenceDates"
        style="display: none;"
      >
        <div class="formField">
          <label class="formLabel">
            ${t("item.startDate")}
          </label>
          <input
            type="date"
            id="itemRecurrenceStartDate"
            class="bottomSheetInput"
          >
        </div>
        <div class="formField">
          <label class="formLabel">
            ${t("item.endDate")}
          </label>
          <input
            type="date"
            id="itemRecurrenceEndDate"
            class="bottomSheetInput"
          >
        </div>
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          ${t("common.cancel")}
        </button>
        <button
          class="primaryButton"
          onclick="createItem()"
        >
          ${t("item.addItem")}
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
  initializeItemForm();
}
/* Render Edit Item Form */
function renderEditItemForm(listItemId) {
  // const currentCategory = getActiveCategory();
  // if (!currentCategory) {
  //   return;
  // }
  const item = state.listItems.find(function (item) {
    return item.ListItemId === listItemId;
  });
  if (!item) {
    return;
  }
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("item.editItem")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="formField">
        <label class="formLabel">
          ${t("item.itemName")}
        </label>
        <input
          type="text"
          id="editItemNameInput"
          class="bottomSheetInput"
          value="${item.ItemName}"
        >
      </div>
      <div class="formRow">
        <div class="halfWidthField">
          <label class="formLabel">
            ${t("item.quantity")}
          </label>
          <input
            type="number"
            id="editItemQuantityInput"
            class="bottomSheetInput"
            value="${item.Quantity}"
          >
        </div>
        <div class="halfWidthField">
          <label class="formLabel">
            ${t("item.estimatedPrice")}
          </label>
          <div class="currencyInputWrapper">
            <span class="currencySymbol">
              $
            </span>
            <input
              type="number"
              id="editItemPriceInput"
              class="
                bottomSheetInput
                currencyInput
              "
              value="${item.estimatedPrice || 0}"
            >
          </div>
        </div>
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.itemImage")}
        </label>
        <img
          id="editItemImagePreview"
          class="
            itemImagePreview
            ${getProductImage(item.ItemName) ? "" : "hidden"}
          "
          src="${getProductImage(item.ItemName)}"
          alt=""
        >
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.notes")}
        </label>
        <input
          type="text"
          id="editItemNotesInput"
          class="bottomSheetInput"
          value="${item.OptionalNotes || ""}"
        >
      </div>
            <div class="formField">
        <label class="formLabel">
          ${t("item.preferredShop")}
        </label>
        <input
          type="text"
          id="editItemShopInput"
          class="bottomSheetInput"
          value="${item.ShopName || ""}"
        >
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.repeat")}
        </label>
        <select
          id="editItemRecurrenceFrequency"
          class="bottomSheetInput"
        >
          <option
            value="none"
            ${(item.recurrence?.frequency || "none") === "none" ? "selected" : ""}
          >
            ${t("item.doesNotRepeat")}
          </option>
          <option
            value="daily"
            ${item.recurrence?.frequency === "daily" ? "selected" : ""}
          >
            ${t("item.daily")}
          </option>
          <option
            value="weekly"
            ${item.recurrence?.frequency === "weekly" ? "selected" : ""}
          >
            ${t("item.weekly")}
          </option>
          <option
            value="monthly"
            ${item.recurrence?.frequency === "monthly" ? "selected" : ""}
          >
            ${t("item.monthly")}
          </option>
        </select>
      </div>
      <div
        id="editItemRecurrenceDates"
        style="${
          item.recurrence?.enabled && item.recurrence?.frequency !== "none"
            ? ""
            : "display: none;"
        }"
      >
        <div class="formField">
          <label class="formLabel">
            ${t("item.startDate")}
          </label>
          <input
            type="date"
            id="editItemRecurrenceStartDate"
            class="bottomSheetInput"
            value="${item.recurrence?.startDate || ""}"
          >
        </div>
        <div class="formField">
          <label class="formLabel">
            ${t("item.endDate")}
          </label>
          <input
            type="date"
            id="editItemRecurrenceEndDate"
            class="bottomSheetInput"
            value="${item.recurrence?.endDate || ""}"
          >
        </div>
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          ${t("common.cancel")}
        </button>
        <button
          class="primaryButton"
          onclick="updateItem(${listItemId})"
        >
          ${t("common.saveChanges")}
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
  initializeEditImagePreview();
  initializeEditRecurrenceForm();
}
/* Initialize Item Form */
function initializeItemForm() {
  const itemNameInput = document.getElementById("itemNameInput");
  const itemQuantityInput = document.getElementById("itemQuantityInput");
  const itemNotesInput = document.getElementById("itemNotesInput");
  const itemShopInput = document.getElementById("itemShopInput");
  const itemPriceInput = document.getElementById("itemPriceInput");
  const imagePreview = document.getElementById("itemImagePreview");
  if (!itemNameInput) {
    return;
  }
  itemNameInput.addEventListener("input", function () {
    renderProductSuggestions(itemNameInput.value);
  });
  setTimeout(function () {
    itemNameInput.focus();
  }, 200);
  itemNameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      itemQuantityInput.focus();
    }
  });
  itemQuantityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      itemNotesInput.focus();
    }
  });
  itemNotesInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      itemShopInput.focus();
    }
  });
  itemShopInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      createItem();
    }
  });
  itemNameInput.addEventListener("blur", function () {
    setTimeout(function () {
      const suggestionContainer = document.getElementById("productSuggestions");
      if (suggestionContainer) {
        suggestionContainer.innerHTML = "";
        suggestionContainer.classList.remove("showSuggestions");
      }
    }, 150);
    const product = findProduct(itemNameInput.value);
    if (!product) {
      return;
    }
    if (!itemPriceInput.value) {
      itemPriceInput.value = product.defaultPrice || 0;
    }
    if (!itemShopInput.value) {
      itemShopInput.value = product.preferredShop || "";
    }
    const imageUrl = getProductImage(product.name);
    if (imageUrl) {
      imagePreview.src = imageUrl;
      imagePreview.classList.remove("hidden");
    }
  });
  const recurrenceFrequency = document.getElementById(
    "itemRecurrenceFrequency",
  );
  const recurrenceDates = document.getElementById("itemRecurrenceDates");
  if (recurrenceFrequency && recurrenceDates) {
    recurrenceFrequency.addEventListener("change", function () {
      recurrenceDates.style.display =
        recurrenceFrequency.value === "none" ? "none" : "";
    });
  }
}
/* Initialize Edit Recurrence Form */
function initializeEditRecurrenceForm() {
  const recurrenceFrequency = document.getElementById(
    "editItemRecurrenceFrequency",
  );
  const recurrenceDates = document.getElementById("editItemRecurrenceDates");
  if (!recurrenceFrequency || !recurrenceDates) {
    return;
  }
  recurrenceFrequency.addEventListener("change", function () {
    recurrenceDates.style.display =
      recurrenceFrequency.value === "none" ? "none" : "";
  });
}
/*Image Preview */
function initializeImagePreview() {
  const imageInput = document.getElementById("itemImageInput");
  const preview = document.getElementById("itemImagePreview");
  if (!imageInput || !preview) {
    return;
  }
  imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });
}
/* Image Preview for Edit Form */
function initializeEditImagePreview() {
  const imageInput = document.getElementById("editItemImageInput");
  const preview = document.getElementById("editItemImagePreview");
  if (!imageInput || !preview) {
    return;
  }
  imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });
}
/* Create Item */
async function createItem() {
  const itemNameInput = document.getElementById("itemNameInput");
  const itemQuantityInput = document.getElementById("itemQuantityInput");
  const itemNotesInput = document.getElementById("itemNotesInput");
  const itemShopInput = document.getElementById("itemShopInput");
  const itemName = itemNameInput.value.trim();
  const itemQuantity = itemQuantityInput.value.trim();
  const itemNotes = itemNotesInput.value.trim();
  const itemShop = itemShopInput.value.trim();
  const itemPrice =
    Number(document.getElementById("itemPriceInput").value) || 0;
  /* Item added from Favorites */
  const openedFromFavorite = favoriteItemToAdd !== null;
  if (!itemName || !itemQuantity) {
    showSnackbar(t("item.enterItemDetails"));
    return;
  }

  const categoryId = state.activeCategoryId; 

  // const existingItem = currentCategory.items.find(function (item) {
  //   return item.name.toLowerCase() === itemName.toLowerCase();
  // });
  /* Existing Item Found */

  const res = await fetch("http://localhost:5113/api/item-add", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: itemName,
      familyGroupId: state.activeGroupId,
      quantity: itemQuantity,
      optionalNotes: itemNotes,
      listId: categoryId,
      shopName: itemShop,
    })
  })

  if (!res.ok)
  {
    // error handler
    return;
  }

  const body = await res.json();
  
  const itemMasterId = body.itemMasterId;
  const listItemId = body.listItemId;

  const existingItem = false; // TODO: check if there is an existing item
  if (existingItem) {
    bottomSheetContent.innerHTML = `
      <div class="bottomSheetHeader">
        <h2>
          ${t("item.itemAlreadyExists")}
        </h2>
        <button
          class="closeButton"
          onclick="closeBottomSheet()"
        >
          <img
            src="${getIconPath("navigation", "close")}"
            class="icon actionIcon"
            alt="${t("common.close")}"
          >
        </button>
      </div>
      <div class="bottomSheetBody">
        <p class="duplicateMessage">
          "${existingItem.name}"
          ${t("item.alreadyExistsWithQuantity")}
          ${existingItem.quantity}.
        </p>
        <p class="duplicateMessage">
          ${t("item.addMoreQuantity", {
            quantity: itemQuantity,
          })}
        </p>
        <div class="bottomSheetButtonRow">
          <button
            class="secondaryButton"
            onclick="closeBottomSheet()"
          >
            ${t("common.cancel")}
          </button>
          <button
            class="primaryButton"
            onclick="updateDuplicateQuantity(
              '${existingItem.name}',
              '${itemQuantity}'
            )"
          >
            ${t("item.updateQuantity")}
          </button>
        </div>
      </div>
    `;
    return;
  }
  const recurrenceFrequency =
    document.getElementById("itemRecurrenceFrequency")?.value || "none";
  const recurrenceStartDate =
    document.getElementById("itemRecurrenceStartDate")?.value || null;
  const recurrenceEndDate =
    document.getElementById("itemRecurrenceEndDate")?.value || null;
  const newItem = {
    ListItemId: listItemId,
    ItemMasterId: itemMasterId,

    ItemName: itemName,
    Quantity: itemQuantity,
    OptionalNotes: itemNotes,
    ShopName: itemShop,
    // imageUrl: imageUrl,
    estimatedPrice: itemPrice,
    ActualPrice: 0,
    purchaseDate: null,
    Purchased: false,
    recurrence: {
      enabled: recurrenceFrequency !== "none",
      frequency: recurrenceFrequency,
      startDate: recurrenceFrequency !== "none" ? recurrenceStartDate : null,
      endDate: recurrenceFrequency !== "none" ? recurrenceEndDate : null,
    },
  };
  state.listItems.unshift(newItem);
  saveProductToCatalog(newItem);
  
  /* Update Product Usage */
  const productUsage = JSON.parse(localStorage.getItem("productUsage")) || {};
  productUsage[itemName] = (productUsage[itemName] || 0) + 1;
  localStorage.setItem("productUsage", JSON.stringify(productUsage));
  /* Added from Favorites */
  if (openedFromFavorite) {
    state.activeTab = "lists";
    const tabButtons = document.querySelectorAll(".tabButton");
    tabButtons.forEach(function (tab) {
      tab.classList.remove("activeTab");
      if (tab.dataset.tab === "lists") {
        tab.classList.add("activeTab");
      }
    });
    const fab = document.getElementById("openItemBottomSheetButton");
    if (fab) {
      fab.classList.remove("hidden");
    }
    favoriteItemToAdd = null;
  }
  saveAppState();
  renderFilteredItems();
  closeBottomSheet();
  showSnackbar(t("item.itemAdded"));

  await createNotification_mysql(
    "item",
    "notifications.itemAdded",
    "notifications.itemAddedMessage",
    {
      title_params: {},
      message_params: {
        itemName: itemName
      },
      action: "category",
      action_data: {
        groupId: state.activeGroupId,
        group: state.activeGroup,
        categoryId: state.activeCategoryId,
        category: state.activeCategory
      },
      image_key: "item"
    },
    categoryId,           // note: decided to give the shopping list id here instead of the item id
    state.activeGroupId 
  );

  
  createNotification( // Done
    "item",
    t("notifications.itemAdded"),
    t("notifications.itemAddedMessage", {
      itemName: itemName,
    }),
    "category",
    {
      group: state.activeGroup,
      category: state.activeCategory
    },
    {
      titleKey: "notifications.itemAdded",
      messageKey: "notifications.itemAddedMessage",
      params: {
        itemName: itemName,
      },
    },
  );
  favoriteItemToAdd = null;
}
/* Update Duplicate Quantity */
function updateDuplicateQuantity(itemName, newQuantity) {
  const currentCategory = getActiveCategory();
  if (!currentCategory) {
    return;
  }
  const item = currentCategory.items.find(function (item) {
    return item.name === itemName;
  });
  if (!item) {
    return;
  }
  item.quantity = Number(item.quantity) + Number(newQuantity);
  saveAppState();
  renderFilteredItems();
  closeBottomSheet();
  showSnackbar(t("item.quantityUpdated"));
}
/* Update Item */

async function updateItemMySql(listItemId, newItem) {
  const res = await fetch("http://localhost:5113/api/edit-item", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ListItemId: listItemId,
      ItemName: newItem.ItemName,
      Quantity: newItem.Quantity,
      EstimatedPrice: newItem.estimatedPrice,
      OptionalNotes: newItem.OptionalNotes,
      ShopName: newItem.ShopName,
      FamilyGroupId: state.activeGroupId,
    })
  })

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }
}

async function updateItem(listItemId) {
  // const currentCategory = getActiveCategory();
  // if (!currentCategory) {
  //   return;
  // }
  const item = state.listItems.find(function (item) {
    return item.ListItemId === listItemId;
  });
  if (!item) {
    return;
  }
  const originalItemName = item.ItemName.trim().toLowerCase();
  const newName = document.getElementById("editItemNameInput").value.trim();
  const newQuantity = document
    .getElementById("editItemQuantityInput")
    .value.trim();
  const newPrice =
    Number(document.getElementById("editItemPriceInput").value) || 0;
  const newNotes = document.getElementById("editItemNotesInput").value.trim();
  const newShop = document.getElementById("editItemShopInput").value.trim();
  if (!newName || !newQuantity) {
    showSnackbar(t("item.enterItemDetails"));
    return;
  }
  const normalizedNewName = newName.toLowerCase();
  const duplicateItem = state.listItems.find(function (existingItem) {
    return (
      existingItem.ItemName !== originalItemName &&
      existingItem.ItemName.trim().toLowerCase() === normalizedNewName
    );
  });
  if (duplicateItem) {
    showSnackbar(t("item.duplicateItemName"));
    return;
  }
  const recurrenceFrequency =
    document.getElementById("editItemRecurrenceFrequency")?.value || "none";
  const recurrenceStartDate =
    document.getElementById("editItemRecurrenceStartDate")?.value || null;
  const recurrenceEndDate =
    document.getElementById("editItemRecurrenceEndDate")?.value || null;
  item.ItemName = newName;
  item.Quantity = newQuantity;
  item.estimatedPrice = newPrice;
  item.notes = newNotes;
  item.ShopName = newShop;
  item.recurrence = {
    enabled: recurrenceFrequency !== "none",
    frequency: recurrenceFrequency,
    startDate: recurrenceFrequency !== "none" ? recurrenceStartDate : null,
    endDate: recurrenceFrequency !== "none" ? recurrenceEndDate : null,
  };
  updateItemMySql(listItemId, item);
  saveState();
  renderFilteredItems();
  closeBottomSheet();
  showSnackbar(t("item.itemUpdated"));
}

/*Save Product to Catalog */
function saveProductToCatalog(item) {
  if (!appState.productCatalog) {
    appState.productCatalog = {};
  }
  appState.productCatalog[item.ItemName.toLowerCase()] = {
    imageUrl: item.imageUrl || "",
    defaultPrice: item.estimatedPrice || 0,
    preferredShop: item.PreferredShop || "",
  };
}


async function unmarkPurchased_mysql(item) {
  const listId = state.activeCategoryId;
  const res = await fetch("http://localhost:5113/api/unmark-purchase", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ShoppingListId: listId,
      ListItemId: item.ListItemId
    })
  })
}

async function markPurchased_mysql(item, price) {
  const listId = state.activeCategoryId;
  const res = await fetch("http://localhost:5113/api/mark-purchase", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ListItemId: item.ListItemId,
      ShoppingListId: listId,
      Price: price
    })
  })

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }
}

/*  Purchase Confirmation */
async function openPurchaseConfirmation(listItemId) {
  
  const item = state.listItems.find(item => item.ListItemId === listItemId);
  if (item.Purchased) {
    await unmarkPurchased_mysql(item);
    item.Purchased = false;
    item.ActualPrice = 0;
    // saveAppState();
    renderFilteredItems();
    showSnackbar(t("item.movedBackToList"));
    return;
  }

  // Marking an item as purchased
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("item.confirmPurchase")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="purchaseItemName">
        ${item.ItemName}
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.estimatedPrice")}
        </label>
        <div class="currencyInputWrapper">
          <span class="currencySymbol">
            $
          </span>
          <input
            type="number"
            class="bottomSheetInput currencyInput"
            value="${item.estimatedPrice || 0}"
            readonly
          >
        </div>
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("item.actualPricePaid")}
        </label>
        <div class="currencyInputWrapper">
          <span class="currencySymbol">
            $
          </span>
          <input
            type="number"
            id="actualPriceInput"
            class="bottomSheetInput currencyInput"
            placeholder="0.00"
            step="0.01"
            min="0"
          >
        </div>
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          ${t("common.cancel")}
        </button>
        <button
          class="primaryButton"
          onclick="
            confirmPurchase(
              ${listItemId}
            )
          "
        >
          ${t("common.confirm")}
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Confirm Purchase */
async function confirmPurchase(listItemId) {

  const item = state.listItems.find(function (item) {
    return item.ListItemId === listItemId;
  });
  if (!item) {
    return;
  }
  const actualPrice =
    Number(document.getElementById("actualPriceInput").value) || 0;
  item.actualPrice = actualPrice;
  item.purchased = !item.purchased;
  
  await markPurchased_mysql(item, actualPrice);
  item.Purchased = true;      // update local state as well

  if (item.purchased) {
    item.purchaseDate = new Date().toISOString();
    if (item.recurrence && item.recurrence.enabled === true) {
      item.recurrence.lastGeneratedDate = null;
    }
  } else {
    item.purchaseDate = null;
  }
  if (item.purchased) {
    item.purchaseDate = new Date().toISOString();
  } else {
    item.purchaseDate = null;
  }
  updateBudgetTracking(state.activeCategory, actualPrice);
  calculateGroupBudget();
  saveState();
  renderFilteredItems();
  if (typeof renderBudgetDashboardWidget === "function") {
    renderBudgetDashboardWidget();
  }
  closeBottomSheet();
  showSnackbar(
    item.purchased ? t("item.itemPurchased") : t("item.itemRestored"),
  );


  await createNotification_mysql(
    "item",
    "notifications.itemPurchased",
    "notifications.itemPurchasedMessage",
    {
      title_params: {},
      message_params: {
        itemName: item.ItemName
      },
      action: "category",
      action_data: {
        groupId: state.activeGroupId,
        group: state.activeGroup,
        categoryId: state.activeCategoryId,
        category: state.activeCategory
      },
      image_key: "purchase",
    },
    listItemId,   // note we provide the list item id instead of the purchase id
    state.activeGroupId
  );
  
  createNotification(
    "purchase",
    t("notifications.itemPurchased"),
    t("notifications.itemPurchasedMessage", {
      itemName: item.name,
    }),
    "category",
    {
      group: state.activeGroupId,
      category: state.activeCategoryId,
    },
    {
      titleKey: "notifications.itemPurchased",
      messageKey: "notifications.itemPurchasedMessage",
      params: {
        itemName: item.name,
      },
    },
  );
}

/* Update Budget Tracking */
function updateBudgetTracking(categoryName, amount) {
  if (!state.budgets) {
    return;
  }
  /* Update Group Budget */
  const categoryBudget = appState.budgets.categoryBudgets[categoryName];
  if (categoryBudget) {
    /* Update Category Budget */
    categoryBudget.spent += amount;
    /* Overspend Check */
    if (
      categoryBudget.spent > categoryBudget.monthlyLimit &&
      !categoryBudget.overspendNotified
    ) {
      categoryBudget.overspendNotified = true;
      createNotification(
        "budget",
        t("notifications.budgetExceeded"),
        t("notifications.budgetExceededMessage", {
          categoryName: categoryName,
        }),
      );
      showToast(
        t("notifications.budgetExceededToast", {
          categoryName: categoryName,
        }),
        "info",
      );
    }
  }
  saveAppState();
}



async function deleteItemMySql(listItemId) {
  const res = await fetch(`http://localhost:5113/api/delete-item?listItemId=${listItemId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }

  state.listItems = state.listItems.filter((item) => item.ListItemId != listItemId);
  state.selectedItems = state.selectedItems.filter((itemId) => itemId != listItemId);
  saveState();
}

/* Delete Item */
async function deleteItem(listItemId) {
  const activeCategoryId = state.activeCategoryId; 

  await deleteItemMySql(listItemId);

  saveAppState();
  renderFilteredItems();
  // showUndoSnackbar(deletedItem, itemIndex);    // to do
}
/* Event Listeners */
if (openItemBottomSheetButton) {
  openItemBottomSheetButton.addEventListener("click", () =>
    renderAddItemForm(""),
  );
}
