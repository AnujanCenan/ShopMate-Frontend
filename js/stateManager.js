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
/* Create a collision-resistant identifier for a locally stored shopping item. */
function createItemId() {
  return "item-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
const defaultAppState = {
  loggedIn: false,
  currentUser: null,
  lockedUserId: null,
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
      firstName: "ShopMate",
      lastName: "Admin",
      name: "ShopMate Admin",
      email: "admin@shopmate.app",
      phone: "",
      gender: "",
      dateOfBirth: "",
      profilePhoto: "",
      memberSince: new Date().toISOString().split("T")[0],
      password: "123456",
      biometricEnabled: true,
    },
  ],
  groups: {
    "My Shopping Group": [
      {
        name: "Monthly Groceries",
        createdByUserId: "user_1",
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
  groupColorPreferences: {},
  groupCreators: {
    "My Shopping Group": "user_1",
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
  settings: {
    theme: "system",
    language: "en",
    currency: "AUD",
    measurementUnit: "metric",
    notifications: {
      group: true,
      shopping: true,
      budget: true,
      general: true,
    },
  },
};
/* Load Application State - Loads the saved application state from Local Storage and upgrades older data structures if required. */
function loadAppState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return structuredClone(defaultAppState);
  }

  let parsedState;

  try {
    parsedState = JSON.parse(savedState);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(defaultAppState);
  }

  if (!parsedState || typeof parsedState !== "object") {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(defaultAppState);
  }

  let stateUpdated = false;

  if (!Array.isArray(parsedState.users)) {
    parsedState.users = [];
    stateUpdated = true;
  }

  if (
    (parsedState.lockedUserId !== null &&
      typeof parsedState.lockedUserId !== "string") ||
    (typeof parsedState.lockedUserId === "string" &&
      !parsedState.users.some(function (user) {
        return user && user.id === parsedState.lockedUserId;
      }))
  ) {
    parsedState.lockedUserId = null;
    stateUpdated = true;
  }

  if (
    !parsedState.groups ||
    typeof parsedState.groups !== "object" ||
    Array.isArray(parsedState.groups)
  ) {
    parsedState.groups = {};
    stateUpdated = true;
  }

  if (
    !parsedState.groupMembers ||
    typeof parsedState.groupMembers !== "object" ||
    Array.isArray(parsedState.groupMembers)
  ) {
    parsedState.groupMembers = {};
    stateUpdated = true;
  }

  if (
    !parsedState.groupCreators ||
    typeof parsedState.groupCreators !== "object" ||
    Array.isArray(parsedState.groupCreators)
  ) {
    parsedState.groupCreators = {};
    stateUpdated = true;
  }

  Object.keys(parsedState.groups).forEach(function (groupName) {
    if (!Array.isArray(parsedState.groupMembers[groupName])) {
      parsedState.groupMembers[groupName] = [];
      stateUpdated = true;
    }
    const members = parsedState.groupMembers[groupName];
    if (!Array.isArray(parsedState.groups[groupName])) {
      parsedState.groups[groupName] = [];
      stateUpdated = true;
    }
    members.forEach(function (member) {
      if (member.role === "owner") {
        member.role = "admin";
        stateUpdated = true;
      } else if (member.role !== "admin" && member.role !== "member") {
        member.role = "member";
        stateUpdated = true;
      }
    });

    if (!Object.prototype.hasOwnProperty.call(parsedState.groupCreators, groupName)) {
      const originalAdmin = members.find(function (member) {
        return member.role === "admin";
      });
      parsedState.groupCreators[groupName] =
        originalAdmin?.id || originalAdmin?.email || null;
      stateUpdated = true;
    }

    parsedState.groups[groupName].forEach(function (category) {
      if (!category.createdByUserId) {
        category.createdByUserId = parsedState.groupCreators[groupName] || null;
        stateUpdated = true;
      }
    });
  });

  if (
    !parsedState.groupColorPreferences ||
    typeof parsedState.groupColorPreferences !== "object" ||
    Array.isArray(parsedState.groupColorPreferences)
  ) {
    parsedState.groupColorPreferences = {};
    stateUpdated = true;
  }

  if (!Array.isArray(parsedState.pendingInvitations)) {
    parsedState.pendingInvitations = [];
    stateUpdated = true;
  }
  parsedState.pendingInvitations.forEach(function (invitation) {
    if (invitation.status === "pending" && !invitation.code) {
      invitation.code = `invite_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 12)}`;
      stateUpdated = true;
    }
    if (!invitation.role) {
      invitation.role = "member";
      stateUpdated = true;
    }
    if (invitation.role === "owner") {
      invitation.role = "admin";
      stateUpdated = true;
    } else if (
      invitation.role !== undefined &&
      invitation.role !== "admin" &&
      invitation.role !== "member"
    ) {
      invitation.role = "member";
      stateUpdated = true;
    }
    if (!invitation.id) {
      invitation.id = `invite_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      stateUpdated = true;
    }

    if (!invitation.invitedAt) {
      invitation.invitedAt = invitation.createdAt || Date.now();
      stateUpdated = true;
    }

    if (!invitation.expiresAt) {
      invitation.expiresAt = invitation.invitedAt + 7 * 24 * 60 * 60 * 1000;
      stateUpdated = true;
    }
  });
  if (!parsedState.budgets || typeof parsedState.budgets !== "object") {
    parsedState.budgets = {
      groupBudgets: {},
      categoryBudgets: {},
    };
    stateUpdated = true;
  }

  if (
    !parsedState.budgets.groupBudgets ||
    typeof parsedState.budgets.groupBudgets !== "object"
  ) {
    parsedState.budgets.groupBudgets = {};
    stateUpdated = true;
  }

  if (
    !parsedState.budgets.categoryBudgets ||
    typeof parsedState.budgets.categoryBudgets !== "object"
  ) {
    parsedState.budgets.categoryBudgets = {};
    stateUpdated = true;
  }

  if (!Array.isArray(parsedState.notifications)) {
    parsedState.notifications = [];
    stateUpdated = true;
  }

  if (!Array.isArray(parsedState.favoriteItems)) {
    parsedState.favoriteItems = [];
    stateUpdated = true;
  }

  if (!Array.isArray(parsedState.selectedItems)) {
    parsedState.selectedItems = [];
    stateUpdated = true;
  }

  if (typeof parsedState.searchQuery !== "string") {
    parsedState.searchQuery = "";
    stateUpdated = true;
  }

  if (typeof parsedState.selectionMode !== "boolean") {
    parsedState.selectionMode = false;
    stateUpdated = true;
  }

  if (typeof parsedState.dashboardBudgetExpanded !== "boolean") {
    parsedState.dashboardBudgetExpanded = false;
    stateUpdated = true;
  }

  if (
    parsedState.drawerPosition !== "left" &&
    parsedState.drawerPosition !== "right"
  ) {
    parsedState.drawerPosition = "right";
    stateUpdated = true;
  }

  if (
    parsedState.settings === null ||
    typeof parsedState.settings !== "object" ||
    Array.isArray(parsedState.settings)
  ) {
    parsedState.settings = structuredClone(defaultAppState.settings);
    stateUpdated = true;
  }

  if (
    parsedState.settings.theme !== "system" &&
    parsedState.settings.theme !== "light" &&
    parsedState.settings.theme !== "dark"
  ) {
    parsedState.settings.theme = "system";
    stateUpdated = true;
  }

  if (
    parsedState.settings.language !== "en" &&
    parsedState.settings.language !== "fr" &&
    parsedState.settings.language !== "ta"
  ) {
    parsedState.settings.language = "en";
    stateUpdated = true;
  }

  if (
    parsedState.settings.currency !== "AUD" &&
    parsedState.settings.currency !== "LKR" &&
    parsedState.settings.currency !== "INR"
  ) {
    parsedState.settings.currency = "AUD";
    stateUpdated = true;
  }

  if (
    parsedState.settings.measurementUnit !== "metric" &&
    parsedState.settings.measurementUnit !== "imperial"
  ) {
    parsedState.settings.measurementUnit = "metric";
    stateUpdated = true;
  }

  if (
    !parsedState.settings.notifications ||
    typeof parsedState.settings.notifications !== "object" ||
    Array.isArray(parsedState.settings.notifications)
  ) {
    parsedState.settings.notifications = {
      group: true,
      shopping: true,
      budget: true,
      general: true,
    };
    stateUpdated = true;
  }

  const notificationDefaults = {
    group: true,
    shopping: true,
    budget: true,
    general: true,
  };

  Object.keys(notificationDefaults).forEach(function (key) {
    if (typeof parsedState.settings.notifications[key] !== "boolean") {
      parsedState.settings.notifications[key] = notificationDefaults[key];
      stateUpdated = true;
    }
  });

  if (
    !parsedState.settings.security ||
    typeof parsedState.settings.security !== "object" ||
    Array.isArray(parsedState.settings.security)
  ) {
    parsedState.settings.security = {
      pinEnabled: false,
      pin: null,
      appLockEnabled: false,
    };
    stateUpdated = true;
  }

  if (typeof parsedState.settings.security.pinEnabled !== "boolean") {
    parsedState.settings.security.pinEnabled = false;
    stateUpdated = true;
  }

  if (
    parsedState.settings.security.pin !== null &&
    typeof parsedState.settings.security.pin !== "string"
  ) {
    parsedState.settings.security.pin = null;
    stateUpdated = true;
  }

  if (typeof parsedState.settings.security.appLockEnabled !== "boolean") {
    parsedState.settings.security.appLockEnabled = false;
    stateUpdated = true;
  }

  parsedState.users.forEach(function (user) {
    if (!user || typeof user !== "object") {
      return;
    }

    if (
      !user.security ||
      typeof user.security !== "object" ||
      Array.isArray(user.security)
    ) {
      user.security = {
        pinEnabled: false,
        pin: null,
        appLockEnabled: false,
      };
      stateUpdated = true;
    }

    if (typeof user.security.pinEnabled !== "boolean") {
      user.security.pinEnabled = false;
      stateUpdated = true;
    }

    if (user.security.pin !== null && typeof user.security.pin !== "string") {
      user.security.pin = null;
      stateUpdated = true;
    }

    if (typeof user.security.appLockEnabled !== "boolean") {
      user.security.appLockEnabled = false;
      stateUpdated = true;
    }

    if (typeof user.biometricEnabled !== "boolean") {
      user.biometricEnabled = false;
      stateUpdated = true;
    }
  });

  Object.values(parsedState.groups).forEach(function (categories) {
    if (!Array.isArray(categories)) {
      return;
    }

    categories.forEach(function (category) {
      if (!category || typeof category !== "object") {
        return;
      }

      if (!Array.isArray(category.items)) {
        category.items = [];
        stateUpdated = true;
        return;
      }

      category.items.forEach(function (item) {
        if (!item || typeof item !== "object") {
          return;
        }

        if (typeof item.id !== "string" || !item.id) {
          item.id = createItemId();
          stateUpdated = true;
        }

        if (item.purchaseShop === undefined) {
          item.purchaseShop = "";
          stateUpdated = true;
        }

        if (!Array.isArray(item.purchaseEvents)) {
          item.purchaseEvents = item.purchased
            ? [{
                quantity: item.quantity,
                actualPrice: item.actualPrice ?? null,
                purchaseDate: item.purchaseDate || null,
                purchaseShop: item.purchaseShop || "",
              }]
            : [];
          stateUpdated = true;
        }

        if (item.estimatedPrice === undefined) {
          item.estimatedPrice = 0;
          stateUpdated = true;
        }

        if (
          typeof item.estimatedPrice !== "number" ||
          Number.isNaN(item.estimatedPrice)
        ) {
          item.estimatedPrice = 0;
          stateUpdated = true;
        }

        if (item.actualPrice === undefined) {
          item.actualPrice = 0;
          stateUpdated = true;
        }

        if (
          item.actualPrice !== null &&
          (typeof item.actualPrice !== "number" ||
            !Number.isFinite(item.actualPrice))
        ) {
          item.actualPrice = 0;
          stateUpdated = true;
        }

        if (item.purchaseDate === undefined) {
          item.purchaseDate = null;
          stateUpdated = true;
        }

        if (
          item.recurrence === undefined ||
          item.recurrence === null ||
          typeof item.recurrence !== "object"
        ) {
          item.recurrence = {
            enabled: false,
            frequency: "none",
            startDate: null,
            endDate: null,
          };
          stateUpdated = true;
        } else {
          if (typeof item.recurrence.enabled !== "boolean") {
            item.recurrence.enabled = false;
            stateUpdated = true;
          }

          if (typeof item.recurrence.frequency !== "string") {
            item.recurrence.frequency = "none";
            stateUpdated = true;
          }

          if (item.recurrence.startDate === undefined) {
            item.recurrence.startDate = null;
            stateUpdated = true;
          }

          if (item.recurrence.endDate === undefined) {
            item.recurrence.endDate = null;
            stateUpdated = true;
          }
        }
      });
    });
  });

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

///////////// Server-backed state (`state`) ////////////
/*
 * `state` is the primary client store. It caches data fetched from the API plus the
 * current session/navigation context, and is persisted to localStorage under STATE_KEY.
 *
 * GUARANTEES (enforced by normalizeState on every page load and by resetState):
 *   - Every key in createDefaultState() exists with the right type. Arrays are always
 *     arrays and objects are always plain objects, so `state.groups.find(...)` or
 *     `state.budgets.categoryBudgets.forEach(...)` never throw on a fresh/old/corrupt store.
 *   - Saved data from an older STATE_VERSION is discarded (only the session/navigation
 *     context is kept) and is re-fetched from the API.
 *   - Logging in or out resets everything, so one user's cached data never leaks to another.
 *
 * NOT GUARANTEED: that cached server data is fresh or loaded. Fields marked [server cache]
 * are only as current as the last fetch on some page; e.g. `groups` is filled by getGroups()
 * on the dashboard. Pages that need them must fetch (or check) before relying on them.
 */
const STATE_KEY = "ShopMate-StateData";
const STATE_VERSION = 2;

function createDefaultState() {
  return {
    version: STATE_VERSION,

    // Session
    loggedIn: false,
    currentUser: null,            // [server cache] /api/user-profile -> { userId, name, email, ... }

    // Navigation context
    activeGroup: null,            // name of the selected family group (display only)
    activeGroupId: null,          // id of the selected family group (use this for API calls)
    activeCategory: null,         // name of the selected shopping list (display only)
    activeCategoryId: null,       // id of the selected shopping list
    activeTab: "lists",           // category page tab: "lists" | "purchased" | "favorites"
    searchQuery: "",              // category page search box
    selectionMode: false,
    selectedItems: [],

    // [server cache] data
    groups: [],                   // /api/get-groups -> [{ familyGroupId, familyName, isAdmin, groupColour }]
    currentCategories: [],        // /api/get-lists for the active group
    listItems: [],                // items of the active shopping list
    favoriteItems: [],
    notifications: [],            // notifications currently rendered on the notifications page
    budgets: {
      groupBudgets: [],
      categoryBudgets: [],        // [{ shoppingListId, budgetLimit, budgetSpent, ... }]
    },
    tempMembers: {},              // { [familyGroupId]: members[] } - group management page
    tempPendingInvites: {},       // { [familyGroupId]: invitations[] } - group management page
    catalogue: null,              // product catalogue cache { items, timeFetched }

    // UI preferences (device only)
    dashboardBudgetExpanded: false,
    drawerPosition: "right",

    // [server cache] /api/get-settings - the single source for user settings.
    // Loaded once per login by loadUserSettings() (see bootstrap); the change*_mysql
    // functions in settingsService.js keep it in sync after each save.
    settingsLoaded: false,
    settings: {
      theme: "system",            // "system" | "light" | "dark"
      language: "en",             // "en" | "fr" | "ta"
      currency: "AUD",            // "AUD" | "LKR" | "INR"
      measuringSystem: "metric",  // "metric" | "imperial"
      notifications: {
        group: true,
        shopping: true,
        budget: true,
        general: true,
      },
      security: {
        appLockOn: false,
        pinOn: false,
        biometricOn: false,
      },
    },
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/* Fill in missing keys and replace values of the wrong type with their defaults. Unknown keys are kept. */
function mergeWithDefaults(defaults, saved) {
  const result = isPlainObject(saved) ? { ...saved } : {};
  Object.keys(defaults).forEach(function (key) {
    const defaultValue = defaults[key];
    const savedValue = result[key];
    if (Array.isArray(defaultValue)) {
      result[key] = Array.isArray(savedValue) ? savedValue : defaultValue;
    } else if (isPlainObject(defaultValue)) {
      result[key] = mergeWithDefaults(defaultValue, savedValue);
    } else if (defaultValue === null) {
      result[key] = savedValue === undefined ? null : savedValue;
    } else if (typeof savedValue !== typeof defaultValue) {
      result[key] = defaultValue;
    }
  });
  return result;
}

/* Bring a saved (possibly old or corrupt) state up to the current schema. */
function normalizeState(saved) {
  const defaults = createDefaultState();
  if (!isPlainObject(saved)) {
    return defaults;
  }
  if (saved.version !== STATE_VERSION) {
    // Older layout: keep only the session/navigation context; server data is re-fetched.
    const kept = {};
    ["loggedIn", "currentUser", "activeGroup", "activeGroupId", "activeCategory", "activeCategoryId"]
      .forEach(function (key) {
        if (key in saved) kept[key] = saved[key];
      });
    return mergeWithDefaults(defaults, kept);
  }
  return mergeWithDefaults(defaults, saved);
}

function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STATE_KEY));
  } catch (error) {
    console.error("Saved state was unreadable; starting fresh.", error);
  }
  const normalized = normalizeState(saved);
  localStorage.setItem(STATE_KEY, JSON.stringify(normalized));
  return normalized;
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/* Reset to a clean default state (used on login and logout). `state` is const, so mutate in place. */
function resetState() {
  Object.keys(state).forEach(function (key) {
    delete state[key];
  });
  Object.assign(state, createDefaultState());
  saveState();
}


const state = loadState();
