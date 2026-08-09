/***************************************************************************************************
 * FILE: localizationBootstrap.js
 *
 * PURPOSE
 * Bootstraps the ShopMate localization framework.
 *
 * RESPONSIBILITIES
 * • Load Supported Languages
 * • Load Selected Dictionary
 * • Initialize Localization
 *
 * NOTE
 * This is the ONLY localization file that HTML pages should include.
 ***************************************************************************************************/
/* Active Translation Dictionary */
let activeTranslations = {};
/* Initialize Localization Framework */
async function initializeLocalizationFramework() {
  /* Load Language Registry */
  await loadScript("../js/localization/supportedLanguages.js");
  /* Load Current Dictionary */
  const language = appState.settings.language || "en";
  const selectedLanguage =
    SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;
  await loadScript("../js/localization/languages/" + selectedLanguage.file);
  switch (language) {
    case "fr":
      activeTranslations = translationsFr;
      break;
    case "ta":
      activeTranslations = translationsTa;
      break;
    case "en":
    default:
      activeTranslations = translationsEn;
      break;
  }
  /* Load Language Manager */
  await loadScript("../js/localization/languageManager.js");
}
/***************************************************************************************************
 * Dynamically Loads JavaScript Files
 ***************************************************************************************************/
function loadScript(filePath) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = filePath;
    script.onload = function () {
      resolve();
    };
    script.onerror = function () {
      reject(new Error(filePath));
    };
    document.head.appendChild(script);
  });
}
