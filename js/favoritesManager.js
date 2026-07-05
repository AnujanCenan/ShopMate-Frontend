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

  /* Existing Favorite */

  const existingFavorite = appState.favoriteItems.find(function (item) {
    return item.name === itemName;
  });

  /* Remove Favorite */

  if (existingFavorite) {
    appState.favoriteItems = appState.favoriteItems.filter(function (item) {
      return item.name !== itemName;
    });
  } else {
    /* Add Favorite */
    appState.favoriteItems.unshift({
      name: currentItem.name,

      quantity: currentItem.quantity,

      notes: currentItem.notes,

      preferredShop: currentItem.preferredShop,

      imageUrl: currentItem.imageUrl || "",

      estimatedPrice: currentItem.estimatedPrice || 0,

      actualPrice: currentItem.actualPrice || 0,

      purchaseDate: currentItem.purchaseDate || null,
    });
  }
  saveAppState();
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

  if (!currentCategory) {
    return;
  }

  /* Prevent Duplicate Items */

  const existingItem = currentCategory.items.find(function (item) {
    return item.name.toLowerCase() === itemName.toLowerCase();
  });

  if (existingItem) {
    showDialog("Item already exists", "This item is already in your list.");

    return;
  }

  currentCategory.items.unshift({
    name: favoriteItem.name,

    quantity: favoriteItem.quantity,

    notes: favoriteItem.notes,

    preferredShop: favoriteItem.preferredShop,

    imageUrl: favoriteItem.imageUrl || "",

    estimatedPrice: favoriteItem.estimatedPrice || 0,

    actualPrice: 0,

    purchaseDate: null,

    purchased: false,
  });

  /* Switch Back To Lists */

  appState.activeTab = "lists";

  /* Update Tab UI */

  const tabButtons = document.querySelectorAll(".tabButton");

  tabButtons.forEach(function (tab) {
    tab.classList.remove("activeTab");

    if (tab.dataset.tab === "lists") {
      tab.classList.add("activeTab");
    }
  });

  renderFilteredItems();
}


async function toggleFavorite_mysql(itemMasterId, listsState) {
  console.log("In toggleFav_mysql");
  const currentCategory = getActiveCategory();
  
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
      await removeFavourite(itemMasterId);
      const removedFavourite = listsState.favoriteItems.splice(index, 1)[0];
    }

  } else {
    /* Add Favorite */
    
    console.log(listsState, itemMasterId);
    const currentItem = listsState.listItems.find(function (item) {
      return item.ItemMasterId === itemMasterId;
    })

    console.log(currentItem);

    await addFavourite(itemMasterId);

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

async function removeFavourite(itemMasterId) {
  console.log("Unfavouriting an item with itemMasterId = ", itemMasterId);
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

async function addFavourite(itemMasterId) {
  console.log("Favouriting item with itemMasterId = ", itemMasterId);
  const res = await fetch("http://localhost:5113/api/favourite-item", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({
      itemMasterId: itemMasterId
    })
  })

  console.log("Done favouriting...");

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }
}