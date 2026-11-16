/***************************************************************************************************
 * FILE: bootstrap.js
 *
 * PURPOSE
 * Initializes ShopMate application services in the correct order.
 *
 * INITIALIZATION ORDER
 * 1. Theme
 * 2. Localization
 * 3. Recurring Items
 * 4. Icons
 * 5. Application Lock
 * 6. Dashboard
 ***************************************************************************************************/
async function initializeApplication() {
  const dashboardSkeletonId = document.getElementById(
    "dashboardPageSkeleton",
  )
    ? "dashboardPageSkeleton"
    : null;
  if (dashboardSkeletonId && typeof startPageSkeleton === "function") {
    startPageSkeleton(dashboardSkeletonId);
  }
  try {
    // state.loggedIn can outlive the 2-hour auth cookie. Check with the server first so the
    // login page doesn't bounce an expired user to the dashboard, and app pages don't load
    // half-working. (null = server unreachable: keep the local state and carry on.)
    if (state.loggedIn && typeof verifySession === "function") {
      const sessionValid = await verifySession();
      if (sessionValid === false && !isAuthPage()) {
        window.location.href = "../pages/loginPage.html";
        return;
      }
    } else if (!state.loggedIn && typeof isAuthPage === "function" && !isAuthPage()) {
      window.location.href = "../pages/loginPage.html";
      return;
    }

    // Settings live in the database; load them once per login before applying theme/language.
    if (
      typeof loadUserSettings === "function" &&
      typeof isUserLoggedIn === "function" &&
      isUserLoggedIn() &&
      !state.settingsLoaded
    ) {
      await loadUserSettings();
    }

    if (typeof applyTheme === "function") {
      applyTheme();
    }

    if (typeof refreshIcons === "function") {
      refreshIcons();
    }

    if (typeof initializeLocalization === "function") {
      await initializeLocalization();
    }

    if (typeof initializeSplitSelects === "function") {
      initializeSplitSelects();
    }

    if (typeof processRecurringItems === "function") {
      processRecurringItems();
    }

    if (typeof refreshIcons === "function") {
      refreshIcons();
    }

    const isLoginPage = document.getElementById("loginForm") !== null;

    if (isLoginPage) {
      if (
        typeof initializeApplicationEntry === "function" &&
        initializeApplicationEntry() === true
      ) {
        return;
      }
    } else {
      if (
        typeof initializeApplicationLock === "function" &&
        initializeApplicationLock() === true
      ) {
        return;
      }
    }

    if (typeof initializeBudgetPage === "function") {
      initializeBudgetPage();
      return;
    }

    if (typeof initializeDashboard === "function") {
      await initializeDashboard();
    }

    if (typeof updateNotificationBadge === "function" && typeof isUserLoggedIn === "function" && isUserLoggedIn()) {
      updateNotificationBadge();
    }
  } catch (error) {
    console.error("ShopMate application initialization failed.", error);
  } finally {
    if (dashboardSkeletonId && typeof finishPageSkeleton === "function") {
      finishPageSkeleton(dashboardSkeletonId);
    }
  }
}
