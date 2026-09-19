/**
 * Pulls from the database information regarding the a family group's budget
 * @param {int} familyGroupId 
 * @returns {Object} json-parsed object detailing the budget information
 * Structure is as follows:
 * {
 *      budgetValue: decimal | null,
 *      shoppingListBudgets: [
 *          {
 *              shoppingListId: int,
 *              shoppingListName: str,
 *              budgetSpent: decimal
 *              numPurcahsed: int
 *              budgetLimit: decimal | null,
 *              userType: str (Admin or Normal)
 *          }
 *      ]
 * }
 * 
 */
async function getGroupBudgetAndCategoryBudgets(familyGroupId) {
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

    const budgets = await res.json();
    console.log("GET GROUP BUDGET AND CATEGORY BUDGETS...");
    console.log(budgets);
    state.budgets.categoryBudgets = budgets.shoppingListBudgets;
    saveState();
    return budgets;
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