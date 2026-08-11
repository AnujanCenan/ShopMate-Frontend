/***************************************************************************************************
 * FILE: localizationRegistry.js
 *
 * PURPOSE
 * Maintains the central registry of all loaded ShopMate language dictionaries.
 *
 * IMPORTANT
 * Language-specific code must never be added to this file.
 ***************************************************************************************************/

(function () {
  const languageRegistry = {};

  window.shopMateLanguageRegistry = languageRegistry;

  /* Register Language */
  window.registerLanguage = function (languageCode, dictionary) {
    if (!languageCode || !dictionary) {
      return;
    }

    languageRegistry[languageCode] = dictionary;
  };

  /* Get Language */
  window.getRegisteredLanguage = function (languageCode) {
    return languageRegistry[languageCode] || null;
  };

  /* Check Language */
  window.isLanguageRegistered = function (languageCode) {
    return Object.prototype.hasOwnProperty.call(languageRegistry, languageCode);
  };
})();
