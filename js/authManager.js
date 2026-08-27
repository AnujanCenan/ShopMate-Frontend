/***************************************************************************************************
 * FILE: authManager.js
 *
 * PURPOSE
 * Manages authentication, user sessions, account registration, authorization,
 * password recovery, invite management, and logout for the ShopMate application.
 *
 * RESPONSIBILITIES
 * • Authenticate users
 * • Register new accounts
 * • Manage user sessions
 * • Control page access
 * • Manage group invitations
 * • Handle password recovery
 * • Manage biometric authentication
 * • Manage user logout
 *
 * FUNCTIONS IN THIS FILE
 authManager.js
│
├── Authentication Helpers
│   ├── getCurrentUser()
│   ├── isUserLoggedIn()
│   ├── redirectIfLoggedOut()
│   └── redirectIfLoggedIn()
│
├── Login Management
│   ├── loginUser()
│   ├── validateLoginCredentials()
│   └── findUserByCredentials()
│
├── Registration Management
│   ├── registerUser()
│   ├── validateRegistrationDetails()
│   ├── isEmailRegistered()
│   ├── createUserAccount()
│   └── createGroup()
│
├── Session Management
│   ├── createUserSession()
│   ├── restoreUserSession()
│   ├── refreshUserSession()
│   ├── clearUserSession()
│   └── getUserPrimaryGroup()
│
├── Authorization Helpers
│   ├── isAdmin()
│   ├── getCurrentGroupMembers()
│   ├── getCurrentUserRole()
│   └── isGroupMember()
│
├── Invite Management
│   ├── validateInvite()
│   └── joinGroupFromInvite()
│
├── Password Recovery
│   ├── renderForgotPasswordForm()
│   ├── sendPasswordResetLink()
│   └── validatePasswordRecoveryEmail()
│
├── Biometric Authentication
│   ├── isBiometricEnabled()
│   ├── enableBiometricAuthentication()
│   ├── disableBiometricAuthentication()
│   ├── authenticateWithBiometrics()
│   └── unlockApplication()
│
└── Logout
    └── logoutUser()
 *
 * DEPENDENCIES
 * • stateManager.js
 * • helpers.js
 *
 * PAGES
 * • loginPage.html
 * • registerPage.html
 * • forgotPassword.html
 * • resetPassword.html
 * • verifyEmail.html
 *
 * NOTE
 * Authentication is currently handled using local storage. Backend integration
 * points are documented inside the relevant functions for future implementation.
 ***************************************************************************************************/
/* Get Current User - Returns the currently logged-in user. */
function getCurrentUser() {
  return appState.currentUser || null;
}
/* Check Login Status - Returns whether a valid user session currently exists. */
function isUserLoggedIn() {
  return appState.loggedIn && getCurrentUser() !== null;
}
/* Redirect Logged-Out Users - Redirects unauthenticated users to the login page. */
function redirectIfLoggedOut() {
  if (!isUserLoggedIn()) {
    window.location.href = "../pages/loginPage.html";
  }
}
/* Redirect Logged-In Users - Prevents authenticated users from accessing authentication pages. */
function redirectIfLoggedIn() {
  if (isUserLoggedIn()) {
    window.location.href = "../pages/dashboardPage.html";
  }
}
/* Login User - Authenticates the user using their email address and password. */
async function loginUser(event) {
  if (event) {
    event.preventDefault();
  }
  const emailInput = document.getElementById("loginEmailInput");
  const passwordInput = document.getElementById("loginPasswordInput");
  if (!emailInput || !passwordInput) {
    return;
  }
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const user = validateLoginCredentials(email, password);
  if (!user) {
    showDialog(t("auth.invalidLogin"), t("auth.invalidLoginMessage"));
    return;
  }
  setCurrentUser(user);
  if (typeof saveAppState === "function") {
    saveAppState();
  }
  window.location.href = "../pages/dashboardPage.html";
}

async function loginUserMySQL(event) {
  if (event) {
    event.preventDefault();
  }
  const email = document.getElementById("loginEmailInput").value.trim();
  const password = document
    .getElementById("loginPasswordInput")
    .value.trim();

  const response = await fetch(`http://localhost:5113/api/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userEmail: email,
      userPassword: password
    })
  });


  if (!response.ok) {
    console.error(response.json())
    showDialog("Invalid Login", "Please check your email and password.");
    return;
  }

  appState.loggedIn = true;
  appState.activeGroup = "Family Group";
  saveAppState();

  // appState.currentUser = {
  //   id: user.id,

  //   name: user.name,

  //   email: user.email,
  //   role: "admin",
  // };

  // appState.loggedIn = true;

  // appState.activeGroup = "Family Group";

  // saveAppState();

  window.location.href = "./dashboardPage.html";
}

/* Validate Login Credentials - Checks whether the required login fields are completed. */
function validateLoginCredentials(email, password) {
  if (!email || !password) {
    showDialog(
      t("auth.missingInformation"),
      t("auth.missingInformationMessage"),
    );
    return null;
  }
  const users = appState.users || [];
  const normalizedEmail = email.toLowerCase();
  const user = users.find(function (item) {
    return (
      item.email &&
      item.email.toLowerCase() === normalizedEmail &&
      item.password === password
    );
  });
  return user || null;
}
/* Find User By Credentials - Returns the matching user for the supplied login credentials. */
function findUserByCredentials(email, password) {
  return appState.users.find(function (user) {
    return (
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
    );
  });
}
/* Register User - Creates a new ShopMate account and signs the user into the application. */
async function registerUser(event) {
  if (event) {
    event.preventDefault();
  }
  const firstName = document
    .getElementById("registerFirstNameInput")
    .value.trim();
  const lastName = document
    .getElementById("registerLastNameInput")
    .value.trim();
  const email = document.getElementById("registerEmailInput").value.trim();
  const password = document
    .getElementById("registerPasswordInput")
    .value.trim();
  const confirmPassword = document
    .getElementById("registerConfirmPasswordInput")
    .value.trim();
  const groupName = document.getElementById("groupNameInput").value.trim();
  const biometricEnabled = document.getElementById("biometricCheckbox").checked;
  /* Validate Registration Details */
  if (
    !validateRegistrationDetails(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      groupName,
    )
  ) {
    return;
  }
  /* Check Whether Email Already Exists */
  if (isEmailRegistered(email)) {
    showDialog(
      t("register.accountExistsTitle"),
      t("register.accountExistsMessage"),
    );
    return;
  }
  /* Create User Account */
  const user = createUserAccount(
    firstName,
    lastName,
    email,
    "",
    password,
    biometricEnabled,
    "",
    "",
    "",
  );
  /* Create Shopping Group */
  createGroup(groupName, user);
  /* Start User Session */
  createUserSession(user);
  /* Welcome New User */
  showDialog(
    t("register.successTitle"),
    t("register.successMessage"),
    function () {
      window.location.href = "./dashboardPage.html";
    },
  );
  /*
      Backend
      POST /auth/register
      Request
      {
        firstName,
        lastName,
        email,
        password,
        groupName,
        biometricEnabled
      }
      Response
      {
        user,
        accessToken,
        refreshToken,
        group
      }
    */
}
/* Validate Registration Details - Validates all information required to register a new account. */
function validateRegistrationDetails(
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  groupName,
) {
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !groupName
  ) {
    showDialog(
      t("auth.registrationMissingInformation"),
      t("auth.registrationMissingInformationMessage"),
    );
    return false;
  }
  if (password !== confirmPassword) {
    showDialog(t("auth.passwordMismatch"), t("auth.passwordMismatchMessage"));
    return false;
  }
  return true;
}
/* Check Email Registration - Returns whether the supplied email address is already registered. */
function isEmailRegistered(email) {
  return appState.users.some(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });
}
/* Create User Account - Creates and stores a new user account. */
function createUserAccount(
  firstName,
  lastName,
  email,
  password,
  biometricEnabled,
) {
  const user = {
    id: "user_" + Date.now(),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone: "",
    gender: "",
    dateOfBirth: "",
    profilePhoto: "",
    profileCompleted: false,
    memberSince: new Date().toISOString().split("T")[0],
    password,
    biometricEnabled,
  };
  appState.users.push(user);
  saveAppState();
  return user;
}
/* Create Group - Creates a new shopping group and assigns the registering user as the administrator. */
function createGroup(groupName, user) {
  appState.groups[groupName] = [];
  if (!appState.groupMembers) {
    appState.groupMembers = {};
  }
  appState.groupMembers[groupName] = [
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "admin",
    },
  ];
  appState.activeGroup = groupName;
  saveAppState();
}
/* Create User Session - Creates a new authenticated session for the specified user. */
function createUserSession(user) {
  appState.loggedIn = true;
  appState.currentUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    memberSince: user.memberSince,
    biometricEnabled: user.biometricEnabled,
  };
  appState.activeGroup = getUserPrimaryGroup(user.id);
  saveAppState();
}
/* Restore User Session - Restores the user's existing session when the application loads. */
function restoreUserSession() {
  if (!appState.loggedIn || !appState.currentUser) {
    return false;
  }
  refreshUserSession();
  return true;
}
/* Refresh User Session - Updates the current session with the latest user information. */
function refreshUserSession() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return;
  }
  const user = appState.users.find(function (user) {
    return user.id === currentUser.id;
  });
  if (!user) {
    clearUserSession();
    return;
  }
  appState.currentUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    memberSince: user.memberSince,
    biometricEnabled: user.biometricEnabled,
  };
  appState.activeGroup = getUserPrimaryGroup(user.id);
  saveAppState();
}
/* Clear User Session - Removes all information associated with the current session. */
function clearUserSession() {
  appState.loggedIn = false;
  appState.currentUser = null;
  appState.activeGroup = null;
  saveAppState();
}
/* Get User Primary Group - Returns the first group associated with the specified user. */
function getUserPrimaryGroup(userId) {
  return (
    Object.keys(appState.groupMembers).find(function (groupName) {
      return appState.groupMembers[groupName].some(function (member) {
        return member.id === userId;
      });
    }) || null
  );
}
/* Check Administrator Access - Returns whether the current user has administrator privileges. */
function isAdmin() {
  return true;
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return false;
  }
  return getCurrentGroupMembers().some(function (member) {
    return member.id === currentUser.id && member.role === "admin";
  });
}
/* Can Manage Group - Returns whether the current user can manage the active group. */
function canManageGroup() {
  return isAdmin();
}
/* Get Current Group Members - Returns all members belonging to the active group. */
function getCurrentGroupMembers() {
  if (!appState.activeGroup) {
    return [];
  }
  return appState.groupMembers[appState.activeGroup] || [];
}
/* Get Current User Role - Returns the current user's role within the active group. */
function getCurrentUserRole() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return null;
  }
  const member = getCurrentGroupMembers().find(function (member) {
    return member.id === currentUser.id;
  });
  return member ? member.role : null;
}
/* Check Group Membership - Returns whether the specified user belongs to the active group. */
function isGroupMember(userId) {
  return getCurrentGroupMembers().some(function (member) {
    return member.id === userId;
  });
}
/* Validate Invite - Returns the invite matching the supplied invite code. */
function validateInvite(inviteCode) {
  return appState.pendingInvites.find(function (invite) {
    return invite.code === inviteCode;
  });
}
/* Join Group From Invite - Adds the current user to the invited group. */
function joinGroupFromInvite(inviteCode) {
  const invite = validateInvite(inviteCode);
  if (!invite) {
    showDialog(t("auth.invalidInvite"), t("auth.invalidInviteMessage"));
    return;
  }
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showDialog(
      t("auth.authenticationRequired"),
      t("auth.authenticationRequiredMessage"),
    );
    return;
  }
  const groupMembers = appState.groupMembers[invite.groupName];
  if (!groupMembers) {
    showDialog(t("auth.groupNotFound"), t("auth.groupNotFoundMessage"));
    return;
  }
  if (isGroupMember(currentUser.id)) {
    showDialog(t("auth.alreadyMember"), t("auth.alreadyMemberMessage"));
    return;
  }
  groupMembers.push({
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: "member",
  });
  appState.activeGroup = invite.groupName;
  saveAppState();
  window.location.href = "../pages/dashboardPage.html";
  /*
      Backend
      POST /groups/join
      Request
      {
        inviteCode,
        userId
      }
      Response
      {
        group,
        members
      }
    */
}
/* Render Forgot Password Form - Displays the password recovery form in the bottom sheet. */
function renderForgotPasswordForm() {
  const bottomSheetContent = document.getElementById("bottomSheetContent");
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("forgotPassword.title")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
        aria-label="${t("common.close")}"
      >
        ✕
      </button>
    </div>
    <div class="bottomSheetBody">
      <p class="bottomSheetDescription">
        ${t("forgotPassword.description")}
      </p>
      <div class="formField">
        <input
          id="forgotPasswordEmail"
          type="email"
          class="bottomSheetInput"
          placeholder="${t("forgotPassword.emailPlaceholder")}"
        />
      </div>
      <button
        class="primaryButton"
        onclick="sendPasswordResetLink()"
      >
        ${t("forgotPassword.sendButton")}
      </button>
    </div>
  `;
  openBottomSheet();
}
/* Send Password Reset Link - Validates the email address and initiates password recovery. */
function sendPasswordResetLink() {
  const email = document.getElementById("forgotPasswordEmail").value.trim();
  if (!validatePasswordRecoveryEmail(email)) {
    return;
  }
  closeBottomSheet();
  showDialog(t("forgotPassword.resetTitle"), t("forgotPassword.resetMessage"));
  /*
    Backend
    POST /auth/forgot-password
    Request
    {
      email
    }
    Response
    {
      success,
      message
    }
  */
}
/* Validate Password Recovery Email - Ensures a valid email address has been entered. */
function validatePasswordRecoveryEmail(email) {
  if (!email) {
    showDialog(
      t("forgotPassword.missingEmailTitle"),
      t("forgotPassword.missingEmailMessage"),
    );
    return false;
  }
  return true;
}
/* Check Biometric Status - Returns whether biometric authentication is enabled for the current user. */
function isBiometricEnabled() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return false;
  }
  return currentUser.biometricEnabled || false;
}
/* Enable Biometric Authentication - Enables biometric authentication for the current user. */
function enableBiometricAuthentication() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return;
  }
  const user = appState.users.find(function (user) {
    return user.id === currentUser.id;
  });
  if (!user) {
    return;
  }
  user.biometricEnabled = true;
  refreshUserSession();
  /*
      Backend
      PATCH /users/preferences
      Request
      {
        biometricEnabled: true
      }
    */
}
/* Disable Biometric Authentication - Disables biometric authentication for the current user. */
function disableBiometricAuthentication() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return;
  }
  const user = appState.users.find(function (user) {
    return user.id === currentUser.id;
  });
  if (!user) {
    return;
  }
  user.biometricEnabled = false;
  refreshUserSession();
  /*
      Backend
      PATCH /users/preferences
      Request
      {
        biometricEnabled: false
      }
    */
}
/* Authenticate With Biometrics - Attempts to unlock the application using biometric authentication. */
async function authenticateWithBiometrics() {
  if (!isBiometricEnabled()) {
    return false;
  }
  /*
      Mobile Integration
      Replace this section with the platform's biometric API.
      Android
      • Fingerprint
      • Face Unlock
      iOS
      • Face ID
      • Touch ID
    */
  return true;
}
/* Unlock Application - Unlocks the application after successful biometric authentication. */
async function unlockApplication() {
  const authenticated = await authenticateWithBiometrics();
  if (!authenticated) {
    window.location.href = "../pages/loginPage.html";
    return;
  }
  window.location.href = "../pages/dashboardPage.html";
}
/* Initialize Login Page - Loads biometric icons based on the selected theme. */
document.addEventListener("DOMContentLoaded", function () {
  const fingerprintIcon = document.getElementById("fingerprintIcon");
  const faceIdIcon = document.getElementById("faceIdIcon");
  if (fingerprintIcon) {
    fingerprintIcon.src = getIconPath("biometric", "fingerprint");
  }
  if (faceIdIcon) {
    faceIdIcon.src = getIconPath("biometric", "faceid");
  }
});
