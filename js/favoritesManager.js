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


async function toggleFavorite_mysql(itemMasterId, listsState) {
  
  /* Existing Favorite */

  const existingFavorite = state.favoriteItems.find(function (fav) {
    return fav.ItemMasterId === itemMasterId;
  });

  /* Remove Favorite */

  if (existingFavorite) {
    // appState.favoriteItems = appState.favoriteItems.filter(function (item) {
    //   return item.ItemMasterId !== itemMasterId;
    // });

    const index = listsState.favoriteItems.findIndex((item) => {
      return item.ItemMasterId === itemMasterId;
    })
    if (index !== -1) {
      await removeFavorite_mysql(itemMasterId);
      const removedFavourite = listsState.favoriteItems.splice(index, 1)[0];
    }

  } else {
    /* Add Favorite */
    
    const currentItem = listsState.listItems.find(function (item) {
      return item.ItemMasterId === itemMasterId;
    })

    await addFavorite_mysql(itemMasterId);

    listsState.favoriteItems.unshift({
      ItemMasterId: currentItem.ItemMasterId,

      ItemName: currentItem.ItemName,
      Quantity: currentItem.Quantity || 0,
      OptionalNotes: currentItem.OptionalNotes || "",
      PreferredShop: currentItem.PreferredShop || "",
      imageUrl: currentItem.imageUrl || "",
      estimatedPrice: currentItem.estimatedPrice || 0,
      actualPrice: currentItem.actualPrice || 0,
      purchaseDate: currentItem.purchaseDate || null,
    });
  }
  saveAppState();
  renderFilteredItems();
}

async function removeFavorite_mysql(itemMasterId) {
  const res = await fetch("http://localhost:5113/api/unfavourite-item", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({
      itemMasterId: itemMasterId
    })
    
  })

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
  }
}

async function addFavorite_mysql(itemMasterId) {
  const res = await fetch("http://localhost:5113/api/favourite-item", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({
      ItemMasterId: itemMasterId
    })
  })


  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }
}