/* Toggle Selection */
function toggleItemSelection(itemName) {
  state.selectionMode = true;
  /* Remove Selection */
  if (state.selectedItems.includes(itemName)) {
    state.selectedItems = state.selectedItems.filter(function (item) {
      return item !== itemName;
    });
  } else {
    /* Add Selection */
    state.selectedItems.push(itemName);
  }
  updateBulkActionCount();
  /* Exit Selection Mode */
  if (state.selectedItems.length === 0) {
    clearSelectionMode();
  } else {
    showBulkActionBar();
  }
  renderFilteredItems();
}
/* Show Bulk Action Bar */
function showBulkActionBar() {
  const bulkActionBar = document.getElementById("bulkActionBar");
  if (!bulkActionBar) {
    return;
  }
  bulkActionBar.classList.remove("hidden");
}
/* Hide Bulk Action Bar */
function hideBulkActionBar() {
  const bulkActionBar = document.getElementById("bulkActionBar");
  if (!bulkActionBar) {
    return;
  }
  bulkActionBar.classList.add("hidden");
}
/* Update Count */
function updateBulkActionCount() {
  const bulkSelectionCount = document.getElementById("bulkSelectionCount");
  if (!bulkSelectionCount) {
    return;
  }
  bulkSelectionCount.textContent = `${state.selectedItems.length} Selected`;
}
/* Clear Selection */
function clearSelectionMode() {
  state.selectionMode = false;
  state.selectedItems = [];
  hideBulkActionBar();
  renderFilteredItems();
}
/* Bulk Favorite */
function bulkFavoriteItems() {
  state.selectedItems.forEach(function (itemName) {
    toggleFavorite(itemName);
  });
  clearSelectionMode();
}
/* Bulk Purchased */
function bulkPurchasedItems() {
  state.selectedItems.forEach(function (itemName) {
    openPurchaseConfirmation(itemName);
  });
  clearSelectionMode();
}
/* Bulk Delete */
function bulkDeleteItems() {
  state.selectedItems.forEach(function (itemName) {
    deleteItem(itemName);
  });
  clearSelectionMode();
}
/* Exit Selection On Overlay Click */
document.addEventListener("click", function (event) {
  if (
    state.selectionMode &&
    !event.target.closest(".itemCard") &&
    !event.target.closest(".bulkActionBar")
  ) {
    clearSelectionMode();
  }
});
/* Event Listeners */
const bulkFavoriteButton = document.getElementById("bulkFavoriteButton");
const bulkPurchasedButton = document.getElementById("bulkPurchasedButton");
const bulkDeleteButton = document.getElementById("bulkDeleteButton");
if (bulkFavoriteButton) {
  bulkFavoriteButton.addEventListener("click", bulkFavoriteItems);
}
if (bulkPurchasedButton) {
  bulkPurchasedButton.addEventListener("click", bulkPurchasedItems);
}
if (bulkDeleteButton) {
  bulkDeleteButton.addEventListener("click", bulkDeleteItems);
}
