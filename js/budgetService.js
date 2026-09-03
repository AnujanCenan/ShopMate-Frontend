async function getCategoryBudgets(familyGroupId) {
    if (!familyGroupId) {
        console.error("invalid family group id given");
        return;
    }
    const res = await fetch(`http://localhost:5113/api/get-group-budget?familyGroupId=${familyGroupId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }, 
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
        return;
    }

    // Body Structure:
    // - budgetValue: decimal | null
    // - shoppingListBudgets: [
    //      {
    //          shoppingListId: int,
    //          shoppingListName: str,
    //          budgetSpent: decimal,
    //          numPurchased: int,
    //          budgetLimit: decimal | null
    //          userType: Enum("Admin", "Normal")
    //      }    
    // ]

    const body = res.json();
    return body;
}

async function createGroupBudget(familyGroupId, budgetValue) {
    if (!familyGroupId || !budgetValue) {
        console.error(`familyGroupId == ${familyGroupId}; budgetValue == ${budgetValue}`);
        return;
    }

    const res = await fetch(`http://localhost:5113/api/create-group-budget?familyGroupId=${familyGroupId}&budgetValue=${budgetValue}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
    }

    const body = await res.json();
    return body.bgtId;
}

async function createListBudget(familyGroupId, shoppingListId, budgetValue) {
    if (!familyGroupId || !shoppingListId || !budgetValue) {
        console.error(`familyGroupId == ${familyGroupId}; shoppingListId == ${shoppingListId}; budgetValue == ${budgetValue}`);
        return;
    }

    const res = await fetch(`http://localhost:5113/api/create-list-budget?familyGroupId=${familyGroupId}&shoppingListId=${shoppingListId}&budgetValue=${budgetValue}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
    }
}