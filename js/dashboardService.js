async function renameGroupMySql(familyGroupId, newName) {
  const res = await fetch(`${SERVER_ENDPOINT}/api/group-rename`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      familyGroupId: familyGroupId,
      newName: newName,
    })
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }


  state.groups.find(group => group.familyGroupId == familyGroupId).name = newName;
  if (state.activeGroupId === familyGroupId) {
    state.activeGroup = newName;
    selectedGroupName.textContent = newName;
  }
  saveState();
};

async function deleteGroupMySql(familyGroupId) {
  const res = await fetch(`${SERVER_ENDPOINT}/api/group-leave?familyGroupId=${familyGroupId}`, {
    method: "DELETE",
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }

  if (state.activeGroupId === familyGroupId) {
    state.activeGroupId = null;
    state.activeGroup = null;
  }

  state.groups = state.groups.filter(group => group.familyGroupId != familyGroupId);
  saveState();
  
}


async function renameCategoryMySql(newCategoryName, familyGroupId, listId) {
  const res = await fetch(`${SERVER_ENDPOINT}/api/list-rename`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      listId: listId,
      familyGroupId: familyGroupId,
      newName: newCategoryName,
    })
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }


  // state.groups[familyGroupId].name = newName;
  // saveState();

}

async function getGroups() {
  const res = await fetch(`${SERVER_ENDPOINT}/api/get-groups`, {
    method: "GET",
    credentials: 'include',
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const msg = await res.text();
    return null;
  }

  const groups = await res.json();
  state.groups = groups;
  console.log("User's groups...")
  console.log(state.groups);
  saveState();
  return groups;
}