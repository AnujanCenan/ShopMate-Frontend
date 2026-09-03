async function renameGroupMySql(familyGroupId, newName) {
  const res = await fetch(`http://localhost:5113/api/group-rename`, {
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


  state.groups[familyGroupId].name = newName;
  saveState();
};

async function deleteGroupMySql(familyGroupId) {
  const res = await fetch(`http://localhost:5113/api/group-delete?familyGroupId=${familyGroupId}`, {
    method: "DELETE",
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(msg);
    return;
  }

  delete state.groups[familyGroupId];
  saveState();
  
}


async function renameCategoryMySql(newCategoryName, familyGroupId, listId) {
  const res = await fetch(`http://localhost:5113/api/list-rename`, {
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