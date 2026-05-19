redirectIfLoggedOut();

const memberList = document.getElementById("memberList");

const groupManagementTitle = document.getElementById("groupManagementTitle");

const groupMemberCount = document.getElementById("groupMemberCount");

const inviteMemberButton = document.getElementById("inviteMemberButton");

const readOnlyBanner = document.getElementById("readOnlyBanner");

const bottomSheet = document.getElementById("bottomSheet");

const bottomSheetContent = document.getElementById("bottomSheetContent");

const screenOverlay = document.getElementById("screenOverlay");

/* Initialize */

function initializeGroupManagement() {
  renderMembers();

  setupPermissions();
}

/* Permissions */

function setupPermissions() {
  if (!isAdmin()) {
    inviteMemberButton.style.display = "none";

    readOnlyBanner.classList.remove("hidden");
  }
}

/* Render Members */

function renderMembers() {
  const activeGroup = appState.activeGroup;

  const members = appState.groupMembers[activeGroup];

  groupManagementTitle.textContent = activeGroup;

  groupMemberCount.textContent = `${members.length} Members`;

  memberList.innerHTML = "";

  members.forEach(function (member) {
    const memberStatus = member.role === "admin" ? "Admin" : "Active";

    memberList.innerHTML += `
      <div class="memberCard">

        <div class="memberInfo">

          <div class="memberAvatar">
            ${member.name.charAt(0)}
          </div>

          <div>

            <h3 class="memberName">
              ${member.name}
            </h3>

            <p class="memberRole">
              ${member.role}
            </p>

            <div
              class="
                memberStatusBadge
                ${
                  member.role === "admin"
                    ? "adminStatusBadge"
                    : "activeStatusBadge"
                }
              "
            >
              ${memberStatus}
            </div>

          </div>

        </div>

        ${
          isAdmin() && member.id !== appState.currentUser.id
            ? `
              <button
                class="memberMoreButton"
                onclick="
                  openMemberActions(
                    '${member.id}'
                  )
                "
              >
                ⋮
              </button>
            `
            : ""
        }

      </div>
    `;
  });
}

/* Member Actions */

function openMemberActions(memberId) {
  const members = getCurrentGroupMembers();

  const member = members.find(function (member) {
    return member.id === memberId;
  });

  if (!member) {
    return;
  }

  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">

      <h2>
        ${member.name}
      </h2>

      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        ✕
      </button>

    </div>

    <div class="bottomSheetBody">

      ${
        member.role !== "admin"
          ? `
            <button
              class="bottomSheetActionButton"
              onclick="
                makeAdmin(
                  '${member.id}'
                )
              "
            >
              👑 Make Admin
            </button>
          `
          : ""
      }

      <button
        class="
          bottomSheetActionButton
          destructiveActionButton
        "
        onclick="
          openRemoveMemberDialog(
            '${member.id}'
          )
        "
      >
        🗑 Remove Member
      </button>

    </div>
  `;

  openBottomSheet();
}

/* Make Admin */

function makeAdmin(memberId) {
  const members = getCurrentGroupMembers();

  const member = members.find(function (member) {
    return member.id === memberId;
  });

  if (!member) {
    return;
  }

  member.role = "admin";

  saveAppState();

  closeBottomSheet();

  renderMembers();
}

/* Remove Dialog */

function openRemoveMemberDialog(memberId) {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">

      <h2>
        Remove Member
      </h2>

      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        ✕
      </button>

    </div>

    <div class="bottomSheetBody">

      <p class="deleteMessage">
        Are you sure you want to remove this member?
      </p>

      <div class="bottomSheetButtonRow">

        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          Cancel
        </button>

        <button
          class="bottomSheetDeleteButton"
          onclick="
            removeMember(
              '${memberId}'
            )
          "
        >
          Remove
        </button>

      </div>

    </div>
  `;
}

/* Remove Member */

function removeMember(memberId) {
  const members = getCurrentGroupMembers();

  appState.groupMembers[appState.activeGroup] = members.filter(
    function (member) {
      return member.id !== memberId;
    },
  );

  saveAppState();

  closeBottomSheet();

  renderMembers();
}

/* Invite */

inviteMemberButton.addEventListener(
  "click",

  function () {
    const inviteCode =
      "INVITE_" + Math.random().toString(36).substring(2, 8).toUpperCase();

    appState.pendingInvites.push({
      code: inviteCode,

      groupName: appState.activeGroup,
    });

    saveAppState();

    bottomSheetContent.innerHTML = `
      <div class="bottomSheetHeader">

        <h2>
          Invite Member
        </h2>

        <button
          class="closeButton"
          onclick="closeBottomSheet()"
        >
          ✕
        </button>

      </div>

      <div class="bottomSheetBody">

        <div class="inviteCodeCard">

          <p class="inviteCodeLabel">
            Invite Code
          </p>

          <h2 class="inviteCodeValue">
            ${inviteCode}
          </h2>

        </div>

        <button
          class="primaryButton"
          onclick="
            copyInviteCode(
              '${inviteCode}'
            )
          "
        >
          Copy Invite Code
        </button>

      </div>
    `;

    openBottomSheet();
  },
);

/* Copy Invite */

function copyInviteCode(inviteCode) {
  navigator.clipboard.writeText(inviteCode);

  alert("Invite code copied");
}

/* Leave Group Dialog */

function openLeaveGroupDialog() {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">

      <h2>
        Leave Group
      </h2>

      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        ✕
      </button>

    </div>

    <div class="bottomSheetBody">

      <p class="deleteMessage">
        Leaving this group is permanent.
        You will need a new invite to rejoin.
      </p>

      <div class="bottomSheetButtonRow">

        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          Cancel
        </button>

        <button
          class="bottomSheetDeleteButton"
          onclick="leaveCurrentGroup()"
        >
          Leave
        </button>

      </div>

    </div>
  `;

  openBottomSheet();
}

/* Leave Group */

function leaveCurrentGroup() {
  const currentUser = getCurrentUser();

  const members = getCurrentGroupMembers();

  const currentMember = members.find(function (member) {
    return member.id === currentUser.id;
  });

  const adminCount = members.filter(function (member) {
    return member.role === "admin";
  }).length;

  if (
    currentMember.role === "admin" &&
    adminCount === 1 &&
    members.length > 1
  ) {
    alert("Please assign another admin before leaving.");

    return;
  }

  appState.groupMembers[appState.activeGroup] = members.filter(
    function (member) {
      return member.id !== currentUser.id;
    },
  );

  saveAppState();

  appState.activeGroup = null;

  closeBottomSheet();

  window.location.href = "../pages/dashboardPage.html";
}

/* Bottom Sheet */

function openBottomSheet() {
  bottomSheet.classList.remove("hidden");

  screenOverlay.classList.remove("hidden");
}

function closeBottomSheet() {
  bottomSheet.classList.add("hidden");

  screenOverlay.classList.add("hidden");
}

screenOverlay.addEventListener(
  "click",

  closeBottomSheet,
);

/* Back */

function goBack() {
  window.location.href = "../pages/dashboardPage.html";
}

/* Initialize */

initializeGroupManagement();
