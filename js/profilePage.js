const selectedMember = JSON.parse(localStorage.getItem("selectedMember"));

const profileAvatar = document.getElementById("profileAvatar");

const profileName = document.getElementById("profileName");

const profileRole = document.getElementById("profileRole");

const profileEmail = document.getElementById("profileEmail");

const profileStatus = document.getElementById("profileStatus");

function initializeProfile() {
  if (!selectedMember) {
    return;
  }

  profileAvatar.textContent = selectedMember.name.charAt(0);

  profileName.textContent = selectedMember.name;

  profileRole.textContent = selectedMember.role;

  profileEmail.textContent = selectedMember.email;

  profileStatus.textContent = selectedMember.status || "Active";
}

function goBack() {
  window.location.href = "../pages/familyManagementPage.html";
}

initializeProfile();
