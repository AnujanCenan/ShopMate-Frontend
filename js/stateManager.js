const STORAGE_KEY = "shopMateData";

const defaultAppState = {
  activeGroup: null,

  activeCategory: null,

  activeTab: "lists",

  searchQuery: "",

  selectionMode: false,

  selectedItems: [],

  favoriteItems: [],

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
        ],
      },
    ],
  },
};

function loadAppState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return structuredClone(defaultAppState);
  }

  return JSON.parse(savedState);
}

const appState = loadAppState();

function saveAppState() {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(appState),
  );
}
