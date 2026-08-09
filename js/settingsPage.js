redirectIfLoggedOut();
/* Toggle Dark Mode */
function toggleDarkMode() {
  document.body.classList.toggle("darkMode");
  appState.darkMode = !appState.darkMode;
  saveAppState();
}
/* Toggle Notifications */
function toggleNotifications() {
  appState.notificationsEnabled = !appState.notificationsEnabled;
  saveAppState();
  showDialog(
    appState.notificationsEnabled
      ? "Notifications Enabled"
      : "Notifications Disabled",
  );
}
/* Toggle Biometrics */
function toggleBiometric() {
  const currentUser = getCurrentUser();
  const user = appState.users.find(function (user) {
    return user.id === currentUser.id;
  });
  if (!user) {
    return;
  }
  user.biometricEnabled = !user.biometricEnabled;
  saveAppState();
  showDialog(
    user.biometricEnabled ? "Biometrics Enabled" : "Biometrics Disabled",
  );
}
/* Open Profile */
function openProfilePage() {
  localStorage.setItem(
    "selectedMember",
    JSON.stringify(
      getCurrentGroupMembers().find(function (member) {
        return member.id === getCurrentUser().id;
      }),
    ),
  );
  window.location.href = "../pages/profilePage.html";
}
/* Back */
function goBack() {
  window.location.href = "../pages/dashboardPage.html";
}
/* Open Security Settings - Displays information about upcoming security features. */
function openSecuritySettings() {
  showDialog(
    "Coming Soon",
    "Security settings including App Lock, PIN Protection and Biometric Unlock will be available in a future update.",
  );
}
/* Open Theme Settings - Displays available application themes. */
function openThemeSettings() {
  const selectedTheme = appState.settings.theme;
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        Theme
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        ✕
      </button>
    </div>
    <div class="bottomSheetBody">
      <label class="radioOption">
        <input
          type="radio"
          name="theme"
          value="system"
          ${selectedTheme === "system" ? "checked" : ""}
        >
        System Default
      </label>
      <label class="radioOption">
        <input
          type="radio"
          name="theme"
          value="light"
          ${selectedTheme === "light" ? "checked" : ""}
        >
        Light
      </label>
      <label class="radioOption">
        <input
          type="radio"
          name="theme"
          value="dark"
          ${selectedTheme === "dark" ? "checked" : ""}
        >
        Dark
      </label>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          Cancel
        </button>
        <button
          class="primaryButton"
          onclick="saveThemePreference()"
        >
          Save
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Save Theme Preference - Saves and immediately applies the selected application theme. */
function saveThemePreference() {
  const selectedTheme = document.querySelector('input[name="theme"]:checked');
  if (!selectedTheme) {
    return;
  }
  appState.settings.theme = selectedTheme.value;
  saveAppState();
  applyTheme();
  closeBottomSheet();
  showDialog(
    "Theme Updated",
    "Your preferred application theme has been saved.",
  );
}
/* Open Notification Settings - Displays notification preferences. */
function openNotificationSettings() {
  const notifications = appState.settings.notifications;
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>Notification Preferences</h2>
      <button class="closeButton" onclick="closeBottomSheet()">
        <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="settingsDescription">
        Select the notification categories you would like to receive.
      </div>
      <div class="toggleRow">
        <div class="toggleContent">
          <div class="toggleTitle">Group </div>
          <div class="toggleDescription">Invitations, member activity and group updates.</div>
        </div>
        <label class="toggleSwitch">
          <input id="groupNotificationToggle" type="checkbox" ${notifications.group ? "checked" : ""}>
          <span class="toggleSlider"></span>
        </label>
      </div>
      <div class="toggleRow">
        <div class="toggleContent">
          <div class="toggleTitle">Shopping </div>
          <div class="toggleDescription">Items added, purchased and shopping reminders.</div>
        </div>
        <label class="toggleSwitch">
          <input id="shoppingNotificationToggle" type="checkbox" ${
            notifications.shopping ? "checked" : ""
          }>
          <span class="toggleSlider"></span>
        </label>
      </div>
      <div class="toggleRow">
        <div class="toggleContent">
          <div class="toggleTitle">Budget </div>
          <div class="toggleDescription">Budget updates and overspending alerts</div>
        </div>
        <label class="toggleSwitch">
          <input id="budgetNotificationToggle" type="checkbox" ${
            notifications.budget ? "checked" : ""
          }>
          <span class="toggleSlider"></span>
        </label>
      </div>
      <div class="toggleRow">
        <div class="toggleContent">
          <div class="toggleTitle">General </div>
          <div class="toggleDescription">Application updates and announcements.</div>
        </div>
        <label class="toggleSwitch">
          <input id="generalNotificationToggle" type="checkbox" ${
            notifications.general ? "checked" : ""
          }>
          <span class="toggleSlider"></span>
        </label>
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          Cancel
        </button>
        <button
          class="primaryButton"
          onclick="saveNotificationSettings()"
        >
          Save
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Save Notification Settings - Saves the user's notification preferences. */
function saveNotificationSettings() {
  appState.settings.notifications.group = document.getElementById(
    "groupNotificationToggle",
  ).checked;
  appState.settings.notifications.shopping = document.getElementById(
    "shoppingNotificationToggle",
  ).checked;
  appState.settings.notifications.budget = document.getElementById(
    "budgetNotificationToggle",
  ).checked;
  appState.settings.notifications.general = document.getElementById(
    "generalNotificationToggle",
  ).checked;
  saveAppState();
  closeBottomSheet();
  showDialog(
    "Notification Preferences",
    "Your notification preferences have been updated successfully.",
  );
}
/* Open Language Settings - Displays available application languages. */
function openLanguageSettings() {
  const selectedLanguage = appState.settings.language;
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>Language</h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="Close"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="settingsDescription">
        Select your preferred application language.
      </div>
      <label class="radioOption">
        <input
          type="radio"
          name="language"
          value="english"
          ${selectedLanguage === "english" ? "checked" : ""}
        >
        🇺🇸 English
      </label>
      <label class="radioOption">
        <input
          type="radio"
          name="language"
          value="french"
          ${selectedLanguage === "french" ? "checked" : ""}
        >
        🇫🇷 French
      </label>
      <label class="radioOption">
        <input
          type="radio"
          name="language"
          value="tamil"
          ${selectedLanguage === "tamil" ? "checked" : ""}
        >
        🇮🇳 Tamil
      </label>
      <div class="settingsDescription">
        More languages will be available in future updates.
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          Cancel
        </button>
        <button
          class="primaryButton"
          onclick="saveLanguagePreference()"
        >
          Save
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Save Language Preference - Saves the user's preferred application language. */
function saveLanguagePreference() {
  const selectedLanguage = document.querySelector(
    'input[name="language"]:checked',
  );
  if (!selectedLanguage) {
    return;
  }
  appState.settings.language = selectedLanguage.value;
  saveAppState();
  closeBottomSheet();
  showDialog(
    "Language Updated",
    "Your preferred language has been saved. Full language support will be available in a future update.",
  );
}
/* Open Currency Settings */
function openCurrencySettings() {}
/* Open Measurement Settings */
function openMeasurementSettings() {}
/* Clear Local Data */
function clearLocalData() {}
/* About ShopMate */
function openAboutPage() {}
/* Privacy Policy */
function openPrivacyPolicy() {}
/* Terms & Conditions */
function openTermsConditions() {}
/* Send Feedback */
function sendFeedback() {}
