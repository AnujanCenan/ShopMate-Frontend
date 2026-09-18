/* Group Service Layer */
/* Backend Team Integration Point */
async function updateMemberRole(memberId, role) {
  console.log("TODO Backend Role:", memberId, role);
  return {
    success: true,
  };
}
async function removeGroupMember(memberId) {
  console.log("TODO Backend Remove:", memberId);
  return {
    success: true,
  };
}
async function leaveGroup(groupId, shouldDelete) {
  const res = await fetch(`http://localhost:5113/api/group-leave?familyGroupId=${groupId}&shouldDelete=${shouldDelete}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
  });

  if (!res.ok) {
    console.error("leaveGroup... something went wrong with the fetch call");
    return;
  }
}

async function canLeave(groupId) {
  const res = await fetch(`http://localhost:5113/api/check-sole-admin?familyGroupId=${groupId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
  });

  if (!res.ok) {
    console.log(res);
    console.error("canLeave... something went wrong with the fetch call");
    return;
  }

  const body = await res.json();
  if (body.isUserAdmin && body.totalAdmins == 1 && body.totalMembers > 1) {
    return "mustPromoteFirst"
  } else if (body.totalMembers == 1) {
    return "confirmDeletion"
  } else {
    return "canDelete";
  }
}



/**
 * Data to pull:
 * For a particular user, for each each family group that they belong to:
 * - Who are the members and what are their roles?
 * - How many shopping lists does the family group have?
 * - What are the pending invitations
 * 
 * 
 * Expected return structure
 * {
 *  groups: [
 *      {
 *        members: [
 *          {
 *            name: "",
 *            email: "",
 *            role: Admin | Normal
 *          }
 *        ],
 *        num_shopping_lists: <int>,
 *        invitations: [
 *          {
 *             email: "",
 *            role: Admin | Normal
 *        }
 *      ]
 *      }
 *  ]
 * }
 */
async function getGroupManagementData()
{
  const res = await fetch("http://localhost:5113/api/get-group-management-info", {
    method: "GET",
    headers: { 'Content-Type': 'application/json' },
    credentials: "include"
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(`Error in getGroupManagementData() -> ${msg}`);
    return null;
  }

  const data = res.json();
  return data;
}


async function sendInvititation_mysql(inputEmail, inputRole) {
  const invitee_email = inputEmail || document
    .getElementById("inviteMemberEmail")
    .value.trim()
    .toLowerCase();
  const role = inputRole || document.getElementById("inviteMemberRole").value || "Normal";
  console.log("In mysql send invite");
  console.log(`Role = ${role}`);
  console.log(`FgpId: ${state.activeCategoryId}`);
  console.log(`Invitee email: ${invitee_email}`);
  if (!invitee_email) {
    console.error("Email not effectively sent to the sendInvitation_mysql function")
  }

  const res = await fetch("http://localhost:5113/api/create-invitation", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      FgpId: Number(state.activeGroupId),
      InviteeEmail: invitee_email,
      Role: role
    })
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }
}

async function deleteInvitation_mysql(invitationId) {
    const res = await fetch(`http://localhost:5113/api/invitation-delete?invitationId=${invitationId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("Something went wrong with deleting the invite");
      return;
    }

    for (const key in state.tempPendingInvites) {
    const index = state.tempPendingInvites[key].findIndex(invite => invite.invId === invitationId);
    
    // If found, delete it from the array and stop searching
    if (index !== -1) {
      const deletedEmail = state.tempPendingInvites[key].invEmail;
      state.tempPendingInvites[key].splice(index, 1);
      return deletedEmail; 
      }
    }

    saveState();
}