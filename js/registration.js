// Called on DOMContentLoaded via initializeApplication() if on registerPage.html
async function handleInvitationFlow() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) return; // Standard registration without invitation

  try {
    const response = await fetch(`http://localhost:5113/api/verify-invite?token=${token}`);
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Invalid or expired invitation token.");
      return;
    }

    // User account already exists -> Redirect to Login Page
    if (data.userExists) {
      alert("An account with this email already exists. Please log in to join the group.");
      window.location.href = `./loginPage.html?token=${token}&email=${encodeURIComponent(data.email)}`;
      return;
    }

    // New user -> Pre-fill and lock email field
    const emailInput = document.getElementById("registerEmailInput");
    if (emailInput) {
      console.log(`Email lock = ${data.email}`);
      emailInput.value = data.email;
      emailInput.readOnly = true;
    }

    // // Hide the Group Name field since they are joining an existing invited group
    // const groupNameInput = document.getElementById("groupNameInput");
    // if (groupNameInput) {
    //   groupNameInput.style.display = "none";
    //   groupNameInput.required = false;
    // }

    // Inject hidden input to store the token for submission
    let hiddenToken = document.getElementById("inviteTokenInput");
    if (!hiddenToken) {
      hiddenToken = document.createElement("input");
      hiddenToken.type = "hidden";
      hiddenToken.id = "inviteTokenInput";
      document.getElementById("registerForm").appendChild(hiddenToken);
    }
    hiddenToken.value = data.token;

  } catch (err) {
    console.error("Error verifying invitation token:", err);
  }
}

// function setupFormSubmitHandler() {
//   const registerForm = document.getElementById("registerForm");
//   const loginForm = document.getElementById("loginForm");
//   const inviteToken = document.getElementById("inv_token")?.value || null;

//   // Handle Registration
//   if (registerForm) {
//     registerForm.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const payload = {
//         // name: document.getElementById("usr_name")?.value,
//         email: document.getElementById("emailInput")?.value,
//         password: document.getElementById("passwordInput")?.value,
//         // phone: document.getElementById("usr_phone")?.value || "",
//         inviteToken: inviteToken
//       };

//       await handleAuthSubmit("http://localhost:5113/api/user-create", payload);
//     });
//   }

//   // Handle Login
//   if (loginForm) {
//     loginForm.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const payload = {
//         userEmail: document.getElementById("usr_email")?.value,
//         userPassword: document.getElementById("usr_password")?.value,
//         inviteToken: inviteToken
//       };

//       await handleAuthSubmit("http://localhost:5113/api/login", payload);
//     });
//   }
// }

// // Reusable fetch handler for both authentication forms
// async function handleAuthSubmit(endpoint, payload) {
//   try {
//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     const result = await res.json();

//     if (res.ok) {
//       if (result.token) {
//         localStorage.setItem("authToken", result.token);
//       }
//       window.location.href = "/pages/dashboard.html";
//     } else {
//       alert(result.message || "An error occurred during authentication.");
//     }
//   } catch (error) {
//     console.error("Authentication request failed:", error);
//     alert("Unable to connect to the server. Please try again.");
//   }
// }

// Inline handler called by onsubmit="registerUser(event)"
async function registerUser(event) {
  event.preventDefault();

  const inviteToken = document.getElementById("inviteTokenInput")?.value || null;

  const payload = {
    Name: document.getElementById("registerFirstNameInput")?.value + " " + document.getElementById("registerLastNameInput")?.value,
    Email: document.getElementById("registerEmailInput")?.value,
    Password: document.getElementById("registerPasswordInput")?.value,
    Phone: null,
    // groupName: document.getElementById("groupNameInput")?.value || null,
    InviteToken: inviteToken
  };

  try {
    const response = await fetch("http://localhost:5113/api/user-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem("authToken", result.token);
      window.location.href = "./dashboardPage.html";
    } else {
      alert(result.message || "Registration failed.");
    }
  } catch (err) {
    console.error("Registration error:", err);
  }
}