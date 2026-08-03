/***************************************************************************************************
 * PURPOSE
 * Manages favorite items for the ShopMate application.
 *
 * RESPONSIBILITIES
 * - Toggle favorite status of shopping items
 * - Add favorite items to the shopping list
 * - Launch the Add Item form from Favorites
 *
 * FUNCTIONS IN THIS FILE
 * - toggleFavorite()
 * - addFavorite()
 * - addFavoriteToList()
 *
 * DEPENDENCIES
 * - appState
 * - saveAppState()
 * - getActiveCategory()
 * - renderFilteredItems()
 * - updateNotificationBadge()
 * - renderAddItemForm()
 * - showSnackbar()
 *
 * PAGES
 * - categoryPage.html
 *
 * NOTE
 * This file manages the user's favorite items only.
 ***************************************************************************************************/
/* Toggle Favorite - Toggles the favorite status of an item. */
function toggleFavorite(itemName) {
  const category = getActiveCategory();
  if (!category) {
    return;
  }
  const item = category.items.find(function (item) {
    return item.name === itemName;
  });
  if (!item) {
    return;
  }
  item.isFavorite = !item.isFavorite;
  if (item.isFavorite) {
    addFavorite(item.name);
  } else {
    appState.favoriteItems = appState.favoriteItems.filter(
      function (favoriteItem) {
        return favoriteItem.name !== item.name;
      },
    );
    saveAppState();
  }
  renderFilteredItems();
  updateNotificationBadge();
}
/* Add Favorite - Adds an item from the current shopping list to the Favorites list. */
function addFavorite(itemName) {
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
  const normalizedName = currentItem.name.trim().toLowerCase();
  const alreadyExists = appState.favoriteItems.some(function (favoriteItem) {
    return favoriteItem.name.trim().toLowerCase() === normalizedName;
  });
  if (alreadyExists) {
    showSnackbar("Item already exists in Favorites");
    return;
  }
  appState.favoriteItems.unshift({
    name: currentItem.name,
  });
  saveAppState();
  renderFilteredItems();
  showSnackbar("Added to Favorites");
}
/* Add Favorite To List - Opens the Add Item form using a favorite item. */
function addFavoriteToList(itemName) {
  renderAddItemForm(itemName);
}


async function toggleFavorite_mysql(itemMasterId) {
  
  /* Existing Favorite */

  const existingFavorite = state.favoriteItems.find(function (fav) {
    return fav.ItemMasterId === itemMasterId;
  });

  /* Remove Favorite */

  if (existingFavorite) {
    // appState.favoriteItems = appState.favoriteItems.filter(function (item) {
    //   return item.ItemMasterId !== itemMasterId;
    // });

    const index = state.favoriteItems.findIndex((item) => {
      return item.ItemMasterId === itemMasterId;
    })
    if (index !== -1) {
      await removeFavorite_mysql(itemMasterId);
      const removedFavourite = state.favoriteItems.splice(index, 1)[0];
    }

  } else {
    /* Add Favorite */
    
    const currentItem = state.listItems.find(function (item) {
      return item.ItemMasterId === itemMasterId;
    })

    await addFavorite_mysql(itemMasterId);

    state.favoriteItems.unshift({
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