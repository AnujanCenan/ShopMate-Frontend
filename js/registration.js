// Called on DOMContentLoaded via initializeApplication() if on registerPage.html
async function handleInvitationFlow() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) return; // Standard registration without invitation

  try {
    const response = await fetch(`http://localhost:5113/api/verify-invite?token=${token}`);
    const data = await response.json();

    if (!response.ok) {
      showSnackBar(data.message || "Invalid or expired invitation token.");
      return;
    }

    // User account already exists -> Redirect to Login Page
    if (data.userExists) {
      showSnackBar("An account with this email already exists. Please log in to join the group.");
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

async function registerUser_mysql(event) {
  event.preventDefault();

  const inviteToken = document.getElementById("inviteTokenInput")?.value || null;
  
  const payload = {
    Name: document.getElementById("registerFirstNameInput")?.value + " " + document.getElementById("registerLastNameInput")?.value,
    Email: document.getElementById("registerEmailInput")?.value,
    Password: document.getElementById("registerPasswordInput")?.value,
    Phone: null,

    GroupName: document.getElementById("groupNameInput")?.value || null,
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
      resetState();
      await obtainUserProfile();
      window.location.href = "./dashboardPage.html";
    } else {
      if (result.message) {
          // t() translates the key based on the user's current language
          showSnackBar(result.message); 
      } else {
          alert(result.message || "An error occurred.");
      }
    }
  } catch (err) {
    console.error("Registration error:", err);
  }
}