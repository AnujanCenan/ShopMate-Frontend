/***************************************************************************************************
 * FILE: bootstrap.js
 *
 * PURPOSE
 * Initializes the ShopMate application.
 *
 * RESPONSIBILITIES
 * • Apply Theme
 * • Load Localization Framework
 * • Initialize Localization
 * • Refresh Theme Icons
 *
 * NOTE
 * This file is the application bootstrapper.
 ***************************************************************************************************/
/* Initialize Application - Initializes global application services. */
async function initializeApplication() {
  /* Apply Theme */
  applyTheme();
  /* Load Localization Framework */
  await initializeLocalizationFramework();
  /* Initialize Localization */
  initializeLocalization();
  /* Refresh Theme Icons */
  refreshIcons();
}
