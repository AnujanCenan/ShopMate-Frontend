/***************************************************************************************************
 * FILE: languageManager.js
 *
 * PURPOSE
 * Handles application localization and language switching.
 *
 * RESPONSIBILITIES
 * • Load the selected language
 * • Retrieve translated text
 * • Translate page elements
 * • Translate placeholders
 * • Translate page title
 *
 * DEPENDENCIES
 * • stateManager.js
 * • en.js
 * • fr.js
 * • ta.js
 ***************************************************************************************************/
/* Current Translation Dictionary */
let currentTranslations = {};
/* Load Language - Loads the active translation dictionary. */
function loadLanguage() {
  currentTranslations = activeTranslations;
}
/* Get Translation - Returns translated text from a translation key. */
function t(key) {
  const keys = key.split(".");
  let value = currentTranslations;
  for (const item of keys) {
    if (!value[item]) {
      return key;
    }
    value = value[item];
  }
  return value;
}
/* Translate Page - Translates all registered page elements. */
function translatePage() {
  /* Translate Text */
  document.querySelectorAll("[data-i18n]").forEach(function (element) {
    element.textContent = t(element.dataset.i18n);
  });
  /* Translate Placeholders */
  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach(function (element) {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
  /* Translate Page Title */
  const pageTitle = document.querySelector("title[data-i18n]");
  if (pageTitle) {
    pageTitle.textContent = t(pageTitle.dataset.i18n);
  }
}
/* Initialize Localization - Loads the current language and translates the page. */
function initializeLocalization() {
  loadLanguage();
  translatePage();
}
