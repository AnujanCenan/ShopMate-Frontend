/***************************************************************************************************
 * FILE: bootstrap.js
 *
 * PURPOSE
 * Initializes ShopMate application services in the correct order.
 *
 * INITIALIZATION ORDER
 * 1. Theme
 * 2. Localization
 * 3. Icons
 * 4. Dashboard
 *
 * This prevents dashboard functions from calling t() before
 * the translation dictionary has been loaded.
 ***************************************************************************************************/
/* Initialize Application */
async function initializeApplication() {
  try {
    if (typeof applyTheme === "function") {
      applyTheme();
    }
    if (typeof initializeLocalization === "function") {
      await initializeLocalization();
    }
    processRecurringItems();
    if (typeof refreshIcons === "function") {
      refreshIcons();
    }
    if (typeof initializeDashboard === "function") {
      initializeDashboard();
    }
  } catch (error) {
    console.error("ShopMate application initialization failed.", error);
  }
}
