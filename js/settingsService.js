async function changeLanguage_mysql(language) {
    console.log(`New language === ${language}`);
    const res = await fetch("http://localhost:5113/api/change-language", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Language: language
        })
    });

    if (!res.ok) {
        console.error("something went wrong trying to save the language");
        return false;
    }

    checkStateSettings()
    state.settings.language = language;
    saveState();

    return true;
}


async function changeMeasuringSystem_mysql(measuringSystem) {
    const res = await fetch("http://localhost:5113/api/change-measuring-system", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            MeasuringSystem: measuringSystem
        })
    });

    if (!res.ok) {
        console.error("something went wrong trying to save the measuring system");
        return false;
    }

    checkStateSettings()
    state.settings.measuringSystem = measuringSystem;
    saveState();

    return true;
}


async function changeCurrency_mysql(currency) {
    const res = await fetch("http://localhost:5113/api/change-currency", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Currency: currency
        })
    });

    if (!res.ok) {
        console.error("something went wrong trying to save the currency");
        return false;
    }

    checkStateSettings()
    state.settings.currency = currency;
    saveState();

    return true;
}

async function changeTheme_mysql(theme) {
    const res = await fetch("http://localhost:5113/api/change-theme", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Theme: theme
        })
    });

    if (!res.ok) {
        console.error("something went wrong trying to save the theme");
        return false;
    }

    checkStateSettings()
    if (!state.settings) state.settings = {};
    state.settings.theme = theme;
    saveState();

    return true;
}


/**
 * @param {Object} securitySettings 
 * can only have the following boolean keys: pinOn, appLockOn, and biometricOn
 * if keys are not present, this function will use the state variable to determine
 * the current boolean values
 * If state variable cannot provide the necessary information, default to false
 * 
 */
async function changeSecuritySettings_mysql(securitySettings) {
    const pinOn = "pinOn" in securitySettings ? securitySettings.pinOn : (state.securitySettings?.pinOn || false);
    const appLockOn = "appLockOn" in securitySettings ? securitySettings.appLockOn : (state.securitySettings?.appLockOn || false);
    const biometricOn = "biometricOn" in securitySettings ? securitySettings.biometricOn : (state.securitySettings?.biometricOn || false);

    const body = {
        PinOn: pinOn,
        AppLockOn: appLockOn,
        BiometricOn: biometricOn
    }

    const res = await fetch("http://localhost:5113/api/change-security", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        console.error("something went wrong trying to save the security settings");
        return false;
    }

    checkStateSettings()
    state.settings.security = body;
    saveState();
    
    return true;
}


/**
 * @param {Object} notificationSettings 
 * can only have the following boolean keys: 
 *      groupNotifsOn, shoppingNotifsOn, budgetNotifsOn, generalNotifsOn
 * if keys are not present, this function will use the state variable to determine
 * the current boolean values
 * If state variable cannot provide the necessary information, default to false
 * 
 */
async function changeNotificationSettings_mysql(notificationSettings) {
    const groupNotifsOn = "groupNotifsOn" in notificationSettings ? notificationSettings.groupNotifsOn : (state.notificationSettings?.groupNotifsOn || false);
    const shoppingNotifsOn = "shoppingNotifsOn" in notificationSettings ? notificationSettings.shoppingNotifsOn : (state.notificationSettings?.shoppingNotifsOn || false);
    const budgetNotifsOn = "budgetNotifsOn" in notificationSettings ? notificationSettings.budgetNotifsOn : (state.notificationSettings?.budgetNotifsOn || false);
    const generalNotifsOn = "generalNotifsOn" in notificationSettings ? notificationSettings.generalNotifsOn : (state.notificationSettings?.generalNotifsOn || false);

    const body = {
        GroupNotifsOn: groupNotifsOn,
        ShoppingNotifsOn: shoppingNotifsOn,
        BudgetNotifsOn: budgetNotifsOn,
        GeneralNotifsOn: generalNotifsOn
    }
    console.log("In changeNotiifcationSettings_mysql; body is:")
    console.log(notificationSettings);

    const res = await fetch("http://localhost:5113/api/change-notifications", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        console.error("something went wrong trying to save the notification settings");
        return false;
    }
    
    checkStateSettings()
    state.settings.notifications = body;
    saveState();

    return true;
}


/**
 * Gets a user's saved setting preferences from the database.
 * @returns {Object}
 * with the following strucutre
 * {
 *      UstId: int,
 *      UstUsrId: int,
 *      Theme: str,
 *      MeasuringSystem: str,
 *      Language: str,
 *      Currency: str,
 *      AppLockOn: bool,
 *      PinOn: bool,
 *      BiometricOn: bool,
 *      GroupNotifsOn: bool,
 *      ShoppingNotifsOn: bool,
 *      BudgetNotifsOn: bool,
 *      GeneralNotifsOn: bool 
 * }
 */
async function getUserSettings_mysql() {
    const res = await fetch("http://localhost:5113/api/get-settings", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        console.error("something went wrong with trying to fetch user settings");
        return null;
    }

    const settings = await res.json();
    console.log(settings);

    copySettingsFromDatabaseToLocal(settings);
    return settings;
}

/**
 * 
 * @param {Object} fetchedSettings 
 * The object produced in getUserSettings_mysql().
 */
function copySettingsFromDatabaseToLocal(fetchedSettings) {
      if (!state.settings) state.settings = {};
    state.settings.theme = fetchedSettings.Theme;
    state.settings.measuringSystem = fetchedSettings.measuringSystem;
    state.settings.measuringSystem = fetchedSettings.measuringSystem;
    state.settings.language = fetchedSettings.Language;
    state.settings.currency = fetchedSettings.Currency;
    state.settings.appLockOn = fetchedSettings.AppLockOn;
    state.settings.pinOn = fetchedSettings.PinOn;
    state.settings.biometricOn = fetchedSettings.BiometricOn;
    state.settings.groupNotifsOn = fetchedSettings.GroupNotifsOn;
    state.settings.shoppingNotifsOn = fetchedSettings.ShoppingNotifsOn;
    state.settings.budgetInfoOn = fetchedSettings.BudgetInfoOn;
    state.settings.generalNotifsOn = fetchedSettings.GeneralNotifsOn;
    saveState();
}


function checkStateSettings() {
    if (!("settings" in state)) state.settings = {};
}
