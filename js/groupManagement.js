/* Renders group membership and handles invitations, roles, and leaving. */
redirectIfLoggedOut();
const pendingInviteList = document.getElementById("pendingInviteList");
const readOnlyBanner = document.getElementById("readOnlyBanner");
const bottomSheetContent = document.getElementById("bottomSheetContent");
/* Initialize */
function initializeGroupManagement() {
  const groupContainer = document.getElementById("groupManagementContainer");
  [groupContainer, bottomSheetContent].forEach(function (container) {
    if (container && !container.dataset.safeGroupActionsBound) {
      container.dataset.safeGroupActionsBound = "true";
      container.addEventListener("click", handleGroupManagementAction);
    }
  });
  renderGroupAccordion();
  setupPermissions();
}

/* Handle actions using data attributes instead of interpolated inline JavaScript. */
function handleGroupManagementAction(event) {
  const actionElement = event.target.closest("[data-group-action]");
  if (!actionElement) {
    return;
  }

  const groupName = actionElement.dataset.groupName;
  const memberId = actionElement.dataset.memberId;
  event.stopPropagation();

  switch (actionElement.dataset.groupAction) {
    case "toggle":
      toggleGroupAccordion(actionElement);
      break;
    case "member-actions":
      openMemberActions(memberId, groupName);
      break;
    case "invite-actions":
      openInviteActions(actionElement.dataset.invitationId);
      break;
    case "send-invitation":
      if (!canManageGroup(groupName)) return;
      appState.activeGroup = groupName;
      renderInviteMemberForm();
      break;
    case "leave-group":
      appState.activeGroup = groupName;
      openLeaveGroupDialog();
      break;
    case "make-admin":
      appState.activeGroup = groupName;
      makeAdmin(memberId, groupName);
      break;
    case "remove-member":
      appState.activeGroup = groupName;
      openRemoveMemberDialog(memberId);
      break;
  }
}
/* Render Group Accordion */
async function renderGroupAccordion() {
  const container = document.getElementById("groupManagementContainer");
  container.innerHTML = "";
  const groupData = await getGroupManagementData();
  
  if (!groupData) return;

  console.log("GROUP MANAGEMENT DATA");
  console.log(groupData);

  state.tempPendingInvites = {};
  state.tempMembers = {};
  groupData.forEach(function (group) {
    const groupName = group.fgpName
    const groupId = group.fgpId;
    const numCategories = group.totalShoppingLists || 0;
    const members = group.members;

    const pendingInvitations = (group.invitations || []).filter(
      function (invitation) {
        return (
          invitation.invStatus === "Pending"
        );
      },
    );

    state.tempPendingInvites[groupId] = pendingInvitations;
    state.tempMembers[groupId] = members;

    container.innerHTML += `
      <div class="groupAccordionCard">
        <button
          class="groupAccordionHeader"
          data-group-action="toggle"
          data-group-name="${escapeHtml(groupName)}"
        >
          <div>
            <h3 class="groupAccordionTitle">
              ${renderGroupNameWithColor(groupName, groupId)}
            </h3>
            <p class="groupAccordionSubtitle">
              ${members.length} ${t("groupManagement.members")} •
              ${numCategories} ${t("groupManagement.categories")}
            </p>
          </div>
          <span class="accordionIcon">
            <img
              src="${getIconPath("navigation", "expand")}"
              class="icon actionIcon"
              alt=""
            >
          </span>
        </button>
        <div class="
            groupAccordionBody
            hidden
          ">
          <h4 class="groupSectionTitle">
            ${t("groupManagement.members")}
          </h4>
          ${
            members.length === 0
              ? `
                <p class="emptyStateText">
                  ${t("groupManagement.noMembers")}
                </p>
              `
              : members
                  .map(function (member) {
                    return `
                      <div class="groupMemberRow">
                        <div class="groupMemberInformation">
                          <div class="groupMemberName">
                            ${member?.usrName}
                          </div>
                          <div
                            class="
                              groupMemberRole
                              ${
                                member?.role === "Admin"
                                  ? "memberRoleAdmin"
                                  : "memberRoleMember"
                              }
                            "
                          >
                            ${
                              member?.role === "Admin"
                                ? t("groupManagement.admin")
                                : t("groupManagement.member")
                            }
                          </div>
                        </div>
                        ${
                          canManageGroup() && member?.usrId !== getCurrentUser()?.usrId
                            ? `
                              <button
                                class="groupMoreButton"
                                onclick="
                                  event.stopPropagation();
                                  openMemberActions(
                                    ${member.usrId},
                                    ${groupId}
                                  );
                                "
                              >
                                <img
                                  src="${getIconPath("navigation", "more")}"
                                  class="icon actionIcon"
                                  alt="${t("common.more")}"
                                >
                              </button>
                            `
                            : ""
                        }
                      </div>
                    `;
                  })
                  .join("")
          }
          <hr class="groupDivider">
          <h4 class="groupSectionTitle">
            ${t("groupManagement.pendingInvitations")}
          </h4>
          ${
            pendingInvitations.length === 0
              ? `
                <div class="emptyPendingInvitationState">
                  <div class="emptyStateTitle">
                    ${t("groupManagement.noPendingInvitations")}
                  </div>
                  <div class="emptyStateSubtitle">
                    ${t("groupManagement.inviteMembersToCollaborate")}
                  </div>
                </div>
              `
              : pendingInvitations
                  .map(function (invitation) {
                    console.log(invitation);
                    const expiryTime = Date(sqlToJsTimeStamp(invitation.invExpiresAt));
                    const creationTime = Date(sqlToJsTimeStamp(invitation.invSentAt));
                    console.log(expiryTime);
                    return `
                      <div class="groupInviteRow">
                        <div class="groupInviteInformation">
                          <div class="groupMemberName">
                            ${invitation.invEmail}
                          </div>
                          <div class="groupMemberRole">
                            ${
                              expiryTime < new Date()
                                ? t("groupManagement.expired")
                                : `${t("groupManagement.invited")} ${new Date(
                                    sqlToJsTimeStamp(invitation.invSentAt),
                                  ).toLocaleDateString("en-GB")}`
                            }
                          </div>
                        </div>
                        <button
                          class="groupMoreButton"
                          onclick="
                            event.stopPropagation();
                            openInviteActions(
                              ${groupId}, ${invitation.invId}
                            );
                          "
                        >
                          <img
                            src="${getIconPath("navigation", "more")}"
                            class="icon actionIcon"
                            alt="${t("common.more")}"
                          >
                        </button>
                      </div>
                    `;
                  })
                  .join("")
          }
          <button
            class="primaryButton"
            onclick="
              appState.activeGroup='${groupName}';
              state.activeGroupId=${groupId};
              state.activeGroup='${groupName}';
              saveState();
              renderInviteMemberForm();
            "
          >
            ${t("groupManagement.sendInvitation")}
          </button>
          <button
            class="secondaryButton"
            onclick="
              appState.activeGroup='${groupName}';
              openLeaveGroupDialog(${groupId});
            "
          >
            ${t("groupManagement.leaveGroup")}
          </button>
        </div>
      </div>
    `;
  });
  saveState();
}
/* Toggle Group Accordion */
function toggleGroupAccordion(header) {
  const card = header.closest(".groupAccordionCard");
  if (!card) {
    return;
  }
  const body = card.querySelector(".groupAccordionBody");
  const icon = card.querySelector(".accordionIcon");
  if (!body || !icon) {
    return;
  }
  const isHidden = body.classList.contains("hidden");
  document.querySelectorAll(".groupAccordionBody").forEach(function (item) {
    item.classList.add("hidden");
  });
  document.querySelectorAll(".accordionIcon").forEach(function (item) {
    item.innerHTML = `
      <img
        src="${getIconPath("navigation", "expand")}"
        class="icon actionIcon"
        alt=""
      >
    `;
  });
  if (isHidden) {
    body.classList.remove("hidden");
    icon.innerHTML = `
      <img
        src="${getIconPath("navigation", "collapse")}"
        class="icon actionIcon"
        alt=""
      >
    `;
  }
}
/* Permissions */
function setupPermissions() {
  const currentUser = getCurrentUser();
  const members = getCurrentGroupMembers();
  const currentMember = members.find(function (member) {
    return member?.id === currentUser?.id;
  });
  if (!currentMember) {
    return;
  }
  if (currentMember.role !== "admin") {
    readOnlyBanner.classList.remove("hidden");
  } else {
    readOnlyBanner.classList.add("hidden");
  }
}
/* Open Invite Actions */
function openInviteActions(groupId, invitationId) {
  console.log("Opening invite actions...");
  console.log(state.tempPendingInvites);
  if (!canManageGroup()) {
    return;
  }
  const invitation = (state.tempPendingInvites[groupId] || []).find(
    function (invitation) {
      return Number(invitation.invId) === Number(invitationId);
    },
  );
  if (!invitation) {
    return;
  }
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("groupManagement.pendingInvitation")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="formField">
        <label class="formLabel">
          ${t("groupManagement.emailAddress")}
        </label>
        <div class="bottomSheetStaticValue">
          ${invitation.invEmail}
        </div>
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("groupManagement.invitedOn")}
        </label>
        <div class="bottomSheetStaticValue">
          ${new Date(invitation.invSentAt).toLocaleDateString("en-GB")}
        </div>
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="resendInvitation('${invitation.invId}')"
        >
          ${t("groupManagement.resend")}
        </button>
        <button
          class="bottomSheetDeleteButton"
          onclick="cancelInvitation('${invitation.invId}')"
        >
          ${t("groupManagement.cancelInvitation")}
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Find a cached pending invitation (from get-group-management-info) and its group id. */
function findPendingInvitation(invitationId) {
  for (const groupId of Object.keys(state.tempPendingInvites || {})) {
    const invitation = (state.tempPendingInvites[groupId] || []).find(function (entry) {
      return Number(entry.invId) === Number(invitationId);
    });
    if (invitation) {
      return { groupId: Number(groupId), invitation: invitation };
    }
  }
  return null;
}
/* Resend Invitation - Emails a fresh link and extends the invitation's expiry by 7 days. */
async function resendInvitation(invitationId) {
  if (!canManageGroup()) {
    showDialog(
      t("common.permissionDenied"),
      t("groupManagement.onlyAdminsCanResend"),
    );
    return;
  }
  const found = findPendingInvitation(invitationId);
  if (!found) {
    return;
  }
  const res = await fetch(`${SERVER_ENDPOINT}/api/invitation-resend?invitationId=${Number(invitationId)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(function () { return {}; });
    console.error("resendInvitation failed", body);
    if (res.status === 403 || res.status === 404) {
      showDialog(
        t("common.permissionDenied"),
        t("groupManagement.onlyAdminsCanResend"),
      );
    } else {
      showDialog(t("common.error"), body.message || t("common.error"));
    }
    return;
  }
  closeBottomSheet();
  await renderGroupAccordion();
  showToast(t("groupManagement.invitationResent"));
  await createGroupNotification_mysql(
    found.groupId,
    "groupManagement.invitationResent",
    "groupManagement.invitationResentTo",
    { email: found.invitation.invEmail },
    Number(invitationId),
  );
}
/* Cancel Invitation */
function cancelInvitation(invitationId) {
  if (!canManageGroup() || !findPendingInvitation(invitationId)) return;
  showConfirmDialog(
    t("groupManagement.cancelInvitation"),
    t("groupManagement.confirmCancelInvitation"),
    async function () {
      await revokeInvite(invitationId);
    },
  );
}
/* Revoke Invitation */
async function revokeInvite(invitationId) {
  if (!canManageGroup()) {
    showDialog(
      t("common.permissionDenied"),
      t("groupManagement.onlyAdminsCanCancel"),
    );
    return;
  }
  // Look up the invitation's group before deleteInvitation_mysql removes it from the cache.
  const invitationGroupId = Object.keys(state.tempPendingInvites || {}).find(function (groupId) {
    return (state.tempPendingInvites[groupId] || []).some(function (invite) {
      return String(invite.invId) === String(invitationId);
    });
  });
  const deletedInvEmail = await deleteInvitation_mysql(invitationId);

  renderGroupAccordion();
  closeBottomSheet();
  showToast(t("groupManagement.invitationCancelled"));
  if (invitationGroupId && deletedInvEmail) {
    await createGroupNotification_mysql(
      Number(invitationGroupId),
      "groupManagement.invitationCancelled",
      "groupManagement.invitationCancelledTo",
      { email: deletedInvEmail },
      Number(invitationId),
    );
  }
}
/* Member Actions */
function openMemberActions(memberId, groupId) {
  if (!canManageGroup()) {
    return;
  }


  const member = state.tempMembers[groupId].find(member => member.usrId === memberId) || null;


  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${member.usrName}
      </h2>

      <button
        class="closeButton"
        type="button"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>

    <div class="bottomSheetBody">
      ${
        member.role !== "admin"
          ? `
            <button
              class="bottomSheetActionButton"
              type="button"
              onclick="
                makeAdmin(
                  ${memberId},
                  ${groupId} 
                )
              "
            >
              <img
                src="${getIconPath("features", "admin")}"
                class="icon featureIcon"
                alt=""
              >
              <span>
                ${t("groupManagement.makeAdmin")}
              </span>
            </button>
          `
          : ""
      }

      ${
        member.role !== "owner"
          ? `
            <button
              class="bottomSheetActionButton"
              type="button"
              onclick="
                transferOwnership(
                  ${member.usrId},
                )
              "
            >
              <img
                src="${getIconPath("features", "admin")}"
                class="icon featureIcon"
                alt=""
              >
              <span>
                ${t("groupManagement.transferOwnership")}
              </span>
            </button>
          `
          : ""
      }

      <button
        class="
          bottomSheetActionButton
          destructiveActionButton
        "
        type="button"
        onclick="
          openRemoveMemberDialog(
            ${memberId},
            ${groupId}
          )
        "
      >
        <img
          src="${getIconPath("actions", "delete")}"
          class="icon actionIcon"
          alt=""
        >
        <span>
          ${t("groupManagement.removeMember")}
        </span>
      </button>
    </div>
  `;

  openBottomSheet();
}
/* Make Admin */
async function makeAdmin(otherUserId, familyGroupId) {
  if (!canManageGroup()) {
    showDialog(
      t("common.permissionDenied"),
      t("groupManagement.onlyAdminsCanChangeRoles"),
    );
    return;
  }

  // const members =
  //   appState.groupMembers && appState.groupMembers[groupName]
  //     ? appState.groupMembers[groupName]
  //     : [];

  // const member = members.find(function (member) {
  //   return member.id === memberId;
  // });

  // if (!member) {
  //   return;
  // }

  // member.role = "admin";

  /*
    Backend
    PATCH
    /group/member/role
  */


  const member = state.tempMembers[familyGroupId].find(member => member.usrId === otherUserId);

  const res = await fetch(`${SERVER_ENDPOINT}/api/change-member-role`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TargetUserId: otherUserId,
      FamilyGroupId: familyGroupId,
      MemberType: "Admin"
    })
  });

  member.role = "Admin";

  if (!res.ok) {
    console.error("someting went wrong with promoting admin");
    return;
  }

  saveAppState();
  await renderGroupAccordion();
  closeBottomSheet();

  showToast(t("groupManagement.memberPromoted"));

  await createGroupNotification_mysql(
    familyGroupId,
    "groupManagement.memberPromotedTitle",
    "groupManagement.memberPromotedMessage",
    { name: member.usrName },
    otherUserId,
  );
}
/* Remove Dialog */
function openRemoveMemberDialog(memberId, groupId) {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("groupManagement.removeMember")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <p class="deleteMessage">
        ${t("groupManagement.confirmRemoveMember")}
      </p>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          ${t("common.cancel")}
        </button>
        <button
          class="bottomSheetDeleteButton"
          onclick="
            removeMember(
              ${memberId},
              ${groupId}
            )
          "
        >
          ${t("common.remove")}
        </button>
      </div>
    </div>
  `;
}
/* Remove Member */
async function removeMember(memberId, groupId) {
  if (!canManageGroup()) {
    showDialog(
      t("common.permissionDenied"),
      t("groupManagement.onlyAdminsCanRemoveMembers"),
    );
    return;
  }
  // const members = getCurrentGroupMembers();
  // const removedMember = members.find(function (member) {
  //   return member.id === memberId;
  // });
  // appState.groupMembers[appState.activeGroup] = members.filter(
  //   function (member) {
  //     return member.id !== memberId;
  //   },
  // );
  
  const member = state.tempMembers[groupId].find(member => member.usrId === memberId);
  const res = await fetch(`${SERVER_ENDPOINT}/api/group-member-remove?familyGroupId=${groupId}&targetUserId=${memberId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    console.error("Something went wrong with removing the member");
    return;
  }
  state.tempMembers[groupId] = state.tempMembers[groupId].filter(member => member.usrId !== memberId);
  saveAppState();
  renderGroupAccordion();
  closeBottomSheet();
  showToast(t("groupManagement.memberRemoved"));
  if (member) {
    await createGroupNotification_mysql(
      groupId,
      "groupManagement.memberRemovedTitle",
      "groupManagement.memberRemovedMessage",
      { name: member.usrName },
      memberId,
    );
  }
}
/* Invite Member Form */
function renderInviteMemberForm() {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("groupManagement.inviteMember")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="formField">
        <label class="formLabel">
          ${t("groupManagement.emailAddress")}
        </label>
        <input
          id="inviteMemberEmail"
          type="email"
          class="bottomSheetInput"
          placeholder="${t("groupManagement.enterEmailAddress")}"
        >
      </div>
      <div class="formField">
        <label class="formLabel">
          ${t("groupManagement.role")}
        </label>
        <select
          id="inviteMemberRole"
          class="bottomSheetInput"
        >
          <option value="Normal"> 
            ${t("groupManagement.member")}
          </option>
          <option value="Admin">
            ${t("groupManagement.admin")}
          </option>
        </select>
      </div>
      <button
        class="primaryButton"
        onclick="sendInvitation()"
      >
        ${t("groupManagement.sendInvitation")}
      </button>
    </div>
  `;
  openBottomSheet();
}
/* Send Invitation */
async function sendInvitation() {
  if (!canManageGroup()) {
    showDialog(
      t("common.permissionDenied"),
      t("groupManagement.onlyAdminsCanInvite"),
    );
    return;
  }

  const email = document
    .getElementById("inviteMemberEmail")
    .value.trim()
    .toLowerCase();

  const role = document.getElementById("inviteMemberRole").value;

  if (!email) {
    showDialog(
      t("groupManagement.missingEmail"),
      t("groupManagement.enterEmailAddress"),
    );
    return;
  }
  if (!isValidEmail(email)) {
    showDialog(
      t("groupManagement.invalidEmail"),
      t("groupManagement.enterValidEmail"),
    );
    return;
  }

  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast(t("common.currentUserUnavailable"));
    return;
  }

  const groupName = appState.activeGroup;

  const invitationResult = await sendInvititation_mysql(email, role);
  if (!invitationResult?.success) {
    if (invitationResult?.saved) {
      // Saved without an email: show it in the pending list so it can be resent.
      renderGroupAccordion();
    }
    showDialog(t("common.error"), invitationResult?.message || t("common.error"));
    return;
  }
  renderGroupAccordion();
  closeBottomSheet();

  showToast(t("groupManagement.invitationSent"));

  await createGroupNotification_mysql(
    Number(state.activeGroupId),
    "groupManagement.invitationSent",
    "groupManagement.memberInvited",
    { email: email },
  );
}
/* Leave Group Dialog */
function openLeaveGroupDialog(familyGroupId) {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        ${t("groupManagement.leaveGroup")}
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="${t("common.close")}"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <p class="deleteMessage">
        ${t("groupManagement.leaveGroupWarning")}
        ${t("groupManagement.rejoinRequiresInvite")}
      </p>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          ${t("common.cancel")}
        </button>
        <button
          class="bottomSheetDeleteButton"
          onclick="leaveCurrentGroup(${familyGroupId})"
        >
          ${t("groupManagement.leave")}
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Leave Group */
async function leaveCurrentGroup(familyGroupId) {
  // const currentUser = getCurrentUser();
  // const members = getCurrentGroupMembers();
  // const currentMember = members.find(function (member) {
  //   return member.id === currentUser.id;
  // });
  // if (!currentMember) {
  //   showDialog(
  //     t("groupManagement.cannotLeaveGroup"),
  //     t("groupManagement.notMemberOfGroup"),
  //   );
  //   return;
  // }
  // const adminCount = members.filter(function (member) {
  //   return member.role === "admin";
  // }).length;
  const leavingStatus = await canLeave(familyGroupId);
  if (leavingStatus === "mustPromoteFirst") {
    showDialog(
      t("groupManagement.cannotLeaveGroup"),
      t("groupManagement.promoteAnotherAdmin"),
    );
    return;
  } else if (leavingStatus === "confirmDeletion") {
    showConfirmDialog(
      t("groupManagement.deleteGroup"),
      t("groupManagement.deleteLastMemberWarning"),
      function () {
        completeLeaveGroup(familyGroupId, true);
      },
    );
    return;
  }

  showConfirmDialog(
    t("groupManagement.leaveGroup"),
    t("groupManagement.confirmLeaveGroup"),
    function () {
      completeLeaveGroup(familyGroupId, false);
    },
  );
}


/* Complete Leave Group */
async function completeLeaveGroup(familyGroupId, shouldDelete) {
  await leaveGroup(familyGroupId, shouldDelete);
  state.groups = state.groups.filter(group => group.familyGroupId !== familyGroupId);
  state.activeGroupId = null;
  state.activeGroup = null;
  localStorage.removeItem("activeGroup");
  if (!shouldDelete) {
    // Sent after leaving, so it is delivered to the members who remain.
    await createGroupNotification_mysql(
      familyGroupId,
      "groupManagement.leftGroup",
      "groupManagement.leftGroupMessage",
      { name: state.currentUser?.name || "" },
    );
  }

  saveState();
  closeBottomSheet();
  showToast(
      t("groupManagement.youLeftGroup"),
  );
  window.location.href = "../pages/dashboardPage.html";
}
/* Back */
function goBack() {
  window.location.href = "../pages/dashboardPage.html";
}
/* Validate Email */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/* Initialize */
(async function () {
  await initializeLocalization();
  initializeGroupManagement();
})();
/*
========================================
Backend Integration Points
========================================
POST /group/invite
GET /group/pending-invitations
POST /group/accept-invitation
PATCH /group/member-role
DELETE /group/member
DELETE /group/leave
========================================
*/


