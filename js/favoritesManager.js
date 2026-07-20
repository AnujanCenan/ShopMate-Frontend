/* Toggle Favorite */
function toggleFavorite(itemName) {
  /* Already exists -> Remove */
  const existingFavorite = appState.favoriteItems.find(function (item) {
    return item.name === itemName;
  });
  if (existingFavorite) {
    appState.favoriteItems = appState.favoriteItems.filter(function (item) {
      return item.name !== itemName;
    });
    saveAppState();
    renderFilteredItems();
    showSnackbar("Removed from Favorites");
    return;
  }
  /* Add from current shopping list */
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
  appState.favoriteItems.unshift({
    name: currentItem.name,
  });
  saveAppState();
  renderFilteredItems();
  showSnackbar("Added to Favorites");
}
/* Add Favorite To List */
function addFavoriteToList(itemName) {
  renderAddItemForm(itemName);
}
