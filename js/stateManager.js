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
  dashboardBudgetExpanded: false,
  drawerPosition: "right",
  users: [
    {
      id: "user_1",
      name: "Admin",
      email: "admin@shopmate.app",
      password: "123456",
      biometricEnabled: true,
    },
  ],
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
    "Family Group": [
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
      code: "INVITE123",
      groupName: "Family Group",
    },
  ],
  budgets: {
    groupBudgets: {},
    categoryBudgets: {},
  },
};
function loadAppState() {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return structuredClone(defaultAppState);
  }
  const parsedState = JSON.parse(savedState);
  if (!parsedState.budgets) {
    parsedState.budgets = {
      groupBudget: {
        // monthlyLimit: 50000,
        // spent: 0,
      },
      categoryBudgets: {
        // "Monthly Groceries": {
        //   monthlyLimit: 8000,
        //   spent: 0,
        // },
      },
    };
  }
  Object.values(parsedState.groups).forEach(function (categories) {
    categories.forEach(function (category) {
      category.items.forEach(function (item) {
        if (item.estimatedPrice === undefined) {
          item.estimatedPrice = 0;
        }
        if (item.actualPrice === undefined) {
          item.actualPrice = 0;
        }
        if (item.purchaseDate === undefined) {
          item.purchaseDate = null;
        }
      });
    });
  });
  return parsedState;
}
const appState = loadAppState();

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
    groupBudgets: {},
    categoryBudgets: {},
  },
};


function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return structuredClone(defaultState);
  }

  return JSON.parse(savedState);
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}


const state = loadState();