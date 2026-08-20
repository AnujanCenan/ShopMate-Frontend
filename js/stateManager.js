/***************************************************************************************************
 * FILE: stateManager.js
 *
 * PURPOSE
 * Stores, retrieves and manages the application's persistent state.
 *
 * RESPONSIBILITIES
 * • Define the default application state
 * • Load application state
 * • Save application state
 * • Maintain backward compatibility
 *
 * FUNCTIONS IN THIS FILE
 *
 * State Initialization
 * ├── defaultAppState
 *
 * State Management
 * ├── loadAppState()
 * └── saveAppState()
 *
 * DEPENDENCIES
 * • Local Storage
 *
 * PAGES
 * • All Pages
 *
 * NOTE
 * This file is responsible only for storing application data.
 * Business logic belongs in the respective manager files.
 ***************************************************************************************************/
const STORAGE_KEY = "shopMateData";
const defaultAppState = {
  loggedIn: false,
  currentUser: null,
  activeGroup: null,
  activeCategory: null,
  activeTab: "lists",
  searchQuery: "",
  selectionMode: false,
  selectedItems: [],
  favoriteItems: [],
  notifications: [],
  users: [
    {
      id: "user_1",
      name: "ShopMate Admin",
      email: "admin@shopmate.app",
      password: "123456",
      biometricEnabled: true,
    },
  ],
  groups: {
    "My Shopping Group": [
      {
        name: "Monthly Groceries",
        items: [
          {
            name: "Milk",
            quantity: 2,
            notes: "Low Fat",
            preferredShop: "Woolworths",
            purchased: false,
            estimatedPrice: 60,
            actualPrice: 0,
            purchaseDate: null,
          },
          {
            name: "Bread",
            quantity: 1,
            notes: "",
            preferredShop: "",
            purchased: false,
            estimatedPrice: 40,
            actualPrice: 0,
            purchaseDate: null,
          },
        ],
      },
    ],
  },
  groupMembers: {
    "My Shopping Group": [
      {
        id: "user_1",
        name: "ShopMate Admin",
        email: "admin@shopmate.app",
        role: "admin",
        joinedAt: new Date().toISOString(),
        invitedBy: null,
      },
    ],
  },
  pendingInvitations: [],
  budgets: {
    groupBudgets: {},
    categoryBudgets: {},
  },
  dashboardBudgetExpanded: false,
  drawerPosition: "right",
};
/* Load Application State - Loads the saved application state from Local Storage and upgrades older data structures if required. */
function loadAppState() {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return structuredClone(defaultAppState);
  }
  const parsedState = JSON.parse(savedState);
  let stateUpdated = false;
  /* Backward Compatibility */
  if (!parsedState.budgets) {
    parsedState.budgets = {
      groupBudgets: {},
      categoryBudgets: {},
    };
    stateUpdated = true;
  }
  /* Upgrade Existing Item Structure */
  Object.values(parsedState.groups || {}).forEach(function (categories) {
    categories.forEach(function (category) {
      category.items.forEach(function (item) {
        if (item.estimatedPrice === undefined) {
          item.estimatedPrice = 0;
          stateUpdated = true;
        }
        if (item.actualPrice === undefined) {
          item.actualPrice = 0;
          stateUpdated = true;
        }
        if (item.purchaseDate === undefined) {
          item.purchaseDate = null;
          stateUpdated = true;
        }
      });
    });
  });
  /* Upgrade Pending Invitations */
  if (!parsedState.pendingInvitations) {
    parsedState.pendingInvitations = [];
    stateUpdated = true;
  }
  /* Upgrade Group Members */
  if (!parsedState.groupMembers) {
    parsedState.groupMembers = {};
    stateUpdated = true;
  }
  if (stateUpdated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedState));
  }
  return parsedState;
}
const appState = loadAppState();
/* Save Application State - Saves the current application state to Local Storage. */
function saveAppState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

///////////// Anujan's Modified State Variable ////////////


const STATE_KEY = "ShopMate-StateData"

const defaultState = {
  loggedIn: false,
  currentUser: null,
  activeGroup: null,
  activeGroupId: null,
  activeCategory: null,
  activeCategoryId: null,
  activeTab: "lists",
  searchQuery: "",
  selectionMode: false,
  selectedItems: [],
  favoriteItems: [],
  listItems: [],
  notifications: [],
  dashboardBudgetExpanded: false,
  drawerPosition: "right",
  groups: {
    // 0: {
    // "name": "Family Group",
    // "lists": [
    //   {
    //     name: "Monthly Groceries",
    //     num_items: 0,
    //     num_purchased: 0
    //     listItems: [
    //       {
    //         name: "Milk",
    //         quantity: 2,
    //         notes: "Low Fat",
    //         preferredShop: "Woolworths",
    //         purchased: false,
    //         estimatedPrice: 60,
    //         actualPrice: 0,
    //         purchaseDate: null,
    //       },
    //       {
    //         name: "Bread",
    //         quantity: 1,
    //         notes: "",
    //         preferredShop: "",
    //         purchased: false,
    //         estimatedPrice: 40,
    //         actualPrice: 0,
    //         purchaseDate: null,
    //       },
    //     ],
    //   },
    // ]},
  },
  groupMembers: {
    0: [
      {
        id: "user_1",
        name: "Hari",
        email: "admin@shopmate.app",
        role: "admin",
      },
    ],
  },
  pendingInvites: [
    {
      // code: "INVITE123",
      // groupName: "Family Group",
    },
  ],
  budgets: {
    groupBudgets: [
      {
        // familyGroupId: 0
        // limit: 0
      }
    ],
    categoryBudgets: [
      {
        // shoppingListId: 0
        // shoppingListName: ""
        // budgetLimit: 0,
        // budgetSpent: 0,
        // numPurchased: 0,
        // shoppingListName: "",
        // userType: (Admin|Normal)
      }
    ],
  },
};


function loadState() {
    const savedState = localStorage.getItem(STATE_KEY);
  if (!savedState) {
    return structuredClone(defaultState);
  }

  return JSON.parse(savedState);
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}


const state = loadState();