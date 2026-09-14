/* Group Service Layer */
/* Backend Team Integration Point */
async function inviteMemberToGroup(payload) {
  console.log("TODO Backend Invite:", payload);
  return {
    success: true,
  };
}
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
async function leaveGroup(groupName) {
  console.log("TODO Backend Leave:", groupName);
  return {
    success: true,
  };
}
async function joinGroupByInvite(inviteCode) {
  console.log("TODO Backend Join:", inviteCode);
  return {
    success: true,
  };
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


async function sendInvititation_mysql(invitee_email, role) {
  console.log("In mysql send invite");
  console.log(`Role = ${role}`);
  console.log(`FgpId: ${state.activeCategoryId}`);
  console.log(`Invitee email: ${invitee_email}`);

  const res = await fetch("http://localhost:5113/api/create-invitation", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
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