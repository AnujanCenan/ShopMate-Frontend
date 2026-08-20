async function deleteCategoryMySql(shoppingListId) {
    if (!shoppingListId) {
        console.error(`shoppingListId == ${shoppingListId}`);
        return;
    }

    const res = await fetch(`http://localhost:5113/api/list-delete?shoppingListId=${shoppingListId}&familyGroupId=${state.activeGroupId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
        return;
    }
}