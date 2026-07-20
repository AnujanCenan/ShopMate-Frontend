const categoryList = document.getElementById("categoryList");
const emptyStateSection = document.getElementById("emptyStateSection");
const selectedGroupName = document.getElementById("selectedGroupName");
const groupDropdownButton = document.getElementById("groupDropdownButton");
const openCategoryBottomSheetButton = document.getElementById(
  "openCategoryBottomSheetButton",
);
const bottomSheetContent = document.getElementById("bottomSheetContent");
const screenOverlay = document.getElementById("screenOverlay");
const menuButton = document.querySelector(".menuButton");
/* Initialize Dashboard */
function initializeDashboard() {
  restoreLastGroup();
  renderCategories();
  renderBudgetDashboardWidget();
}
/* Restore Last Group */
function restoreLastGroup() {
  const savedGroup = localStorage.getItem("activeGroup");
  if (savedGroup) {
    selectedGroupName.textContent = savedGroup;
  }
}
/* Render Categories */
async function renderCategories() {
  if (!categoryList) {
    return;
  }
  categoryList.innerHTML = "";
  if (!appState.activeGroup) {
    emptyStateSection.innerHTML = `
            <p class="emptyStateText">
                Select or create a group
            </p>
        `;
    return;
  }
  // const categories = appState.groups[appState.activeGroup];
  const groupId = localStorage.getItem("activeGroupId");
  if (!groupId) return;

  const res = await fetch(`http://localhost:5113/api/get-lists?family_group_id=${groupId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    // Error handle
    const message = await res.text();
    console.error(`get-lists request failed ${message}`);
    return;
  }
    
  const categories = await res.json();
  if (!categories || categories.length === 0) {
    emptyStateSection.innerHTML = `
            <p class="emptyStateText">
                No categories yet
            </p>
        `;
    return;
  }
  emptyStateSection.innerHTML = "";
  categories.forEach(function (category) {
    categoryList.innerHTML += `
            <div
    class="categoryCard"
    data-list-id="'${category.listId}'"
    onclick="openCategoryPage('${category.name}', '${category.listId}')"
>
    <button
        class="categoryMoreButton"
        onclick="
            event.stopPropagation();
            renderCategoryActions(
                '${category.name}'
            );
        "
    >
        ⋮
    </button>
                <h2 class="categoryTitle">
                    ${category.name}
                </h2>
                <p class="categoryInfo">
                ${ category.numItems - category.numPurchased }
                Pending •
                ${ category.numPurchased }
                Purchased
                </p>
            </div>
        `;
  });
}
/* Select Group */
function selectGroup(groupName, groupId) {
  appState.activeGroup = groupName;
  selectedGroupName.textContent = groupName;
  localStorage.setItem("activeGroup", groupName);
  localStorage.setItem("activeGroupId", groupId);
  
  renderCategories();
  closeBottomSheet();
}
/* Open Category Page */
function openCategoryPage(categoryName, categoryId) {
  localStorage.setItem("activeCategory", categoryName);
  localStorage.setItem("activeCategoryId", categoryId)
  window.location.href = "../pages/categoryPage.html";
}
/* Render Group Dropdown */
async function renderGroupDropdown() {
  let groupItemsHTML = "";

  const res = await fetch(`http://localhost:5113/api/get-groups`, {
    method: "GET",
    credentials: 'include',
    headers: { "Content-Type": "application/json" }
  })

  if (!res.ok)
  {
    console.error(await res.text());
    return;
  }
  const groups = await res.json();

  groups.forEach(function (group) {
    groupItemsHTML += `
    <div class="groupItemRow">
    <div class="groupItem" onclick="selectGroup('${group.familyName}', '${group.familyId}')">
    ${group.familyName}
    </div>
    <button
        class="groupMoreButton"
        onclick="
            event.stopPropagation();
            renderGroupActions(
                '${group.familyName}'
            );
        "
    >
        ⋮
    </button>
</div>
        `;
  });
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Select Group
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <div class="groupList">
            ${groupItemsHTML}
        </div>
        <button
            class="primaryButton"
            onclick="renderCreateGroupForm()"
        >
            Create New Group
        </button>
    `;
  openBottomSheet();
}
/* Render Create Group Form */
function renderCreateGroupForm() {
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Create Group
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <div class="bottomSheetBody">
            <input
                type="text"
                placeholder="Group Name"
                class="bottomSheetInput"
                id="groupNameInput"
            >
            <div class="bottomSheetButtonRow">
                <button
                    class="secondaryButton"
                    onclick="renderGroupDropdown()"
                >
                    Cancel
                </button>
                <button
                    class="primaryButton"
                    onclick="createGroup()"
                >
                    Create
                </button>
            </div>
        </div>
    `;
  openBottomSheet();
}
/* Create Group */
async function createGroup() {
  const groupNameInput = document.getElementById("groupNameInput");
  const groupName = groupNameInput.value.trim();
  if (!groupName) {
    return;
  }

  const res = await fetch(`http://localhost:5113/api/group-create`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: groupName
    })
  });

  const body = await res.json();

  // appState.groups[groupName] = [];
  // saveAppState();
  selectGroup(groupName, body.familyId);
}
/* Render Create Category Form */
function renderCreateCategoryForm() {
  if (!appState.activeGroup) {
    showDialog("Please select a group first");
    return;
  }
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Create Category
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <div class="bottomSheetBody">
            <input
                type="text"
                placeholder="Category Name"
                class="bottomSheetInput"
                id="categoryNameInput"
            >
            <div class="bottomSheetButtonRow">
                <button
                    class="secondaryButton"
                    onclick="closeBottomSheet()"
                >
                    Cancel
                </button>
                <button
                    class="primaryButton"
                    onclick="createCategory()"
                >
                    Create
                </button>
            </div>
        </div>
    `;
  openBottomSheet();
}
/* Create Category */
async function createCategory() {
  const categoryNameInput = document.getElementById("categoryNameInput");
  const categoryName = categoryNameInput.value.trim();
  if (!categoryName) {
    return;
  }

  const res = await fetch("http://localhost:5113/api/list-create", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: categoryName,
      familyGroupId: localStorage.getItem("activeGroupId")
    })
  })

  // appState.groups[appState.activeGroup].unshift({
  //   name: categoryName,
  //   items: [],
  // });
  if (!appState.budgets) {
    appState.budgets = {
      groupBudget: {
        monthlyLimit: 50000,
        spent: 0,
      },
      categoryBudgets: {},
    };
  }
  appState.budgets.categoryBudgets[categoryName] = {
    monthlyLimit: 1000,
    spent: 0,
  };
  saveAppState();
  renderCategories();
  closeBottomSheet();
}
/* Render Category Actions */
function renderCategoryActions(categoryName) {
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Category Actions
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <div class="bottomSheetBody">
            <button
                class="bottomSheetActionButton"
                onclick="
                    renameCategory(
                        '${categoryName}'
                    )
                "
            >
                ✏ Rename Category
            </button>
            <button
                class="bottomSheetDeleteButton"
                onclick="
                    deleteCategory(
                        '${categoryName}'
                    )
                "
            >
                🗑 Delete Category
            </button>
        </div>
    `;
  openBottomSheet();
}
/* Rename Category */
function renameCategory(categoryName) {
  const categories = appState.groups[appState.activeGroup];
  const category = categories.find(function (item) {
    return item.name === categoryName;
  });
  if (!category) {
    return;
  }
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Rename Category
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <div class="bottomSheetBody">
            <input
                type="text"
                class="bottomSheetInput"
                id="renameCategoryInput"
                value="${category.name}"
            >
            <div class="bottomSheetButtonRow">
                <button
                    class="secondaryButton"
                    onclick="
                        renderCategoryActions(
                            '${categoryName}'
                        )
                    "
                >
                    Cancel
                </button>
                <button
                    class="primaryButton"
                    onclick="
                        saveRenamedCategory(
                            '${categoryName}'
                        )
                    "
                >
                    Save
                </button>
            </div>
        </div>
    `;
}
/* Save Renamed Category */
function saveRenamedCategory(categoryName) {
  const renameCategoryInput = document.getElementById("renameCategoryInput");
  const newCategoryName = renameCategoryInput.value.trim();
  if (!newCategoryName) {
    showSnackbar("Enter category name");
    return;
  }
  const categories = appState.groups[appState.activeGroup];
  const duplicateCategory = categories.find(function (category) {
    return (
      category.name.toLowerCase() === newCategoryName.toLowerCase() &&
      category.name !== categoryName
    );
  });
  if (duplicateCategory) {
    showSnackbar("Category already exists");
    return;
  }
  const category = categories.find(function (category) {
    return category.name === categoryName;
  });
  if (!category) {
    return;
  }
  category.name = newCategoryName;
  saveAppState();
  renderCategories();
  closeBottomSheet();
  showSnackbar("Category renamed");
}
/* Delete Category */
function deleteCategory(categoryName) {
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Delete Category
            </h2>
            <button
                class="closeButton"
                onclick="
                    renderCategoryActions(
                        '${categoryName}'
                    )
                "
            >
                ✕
            </button>
        </div>
        <div class="bottomSheetBody">
            <p class="deleteMessage">
                Are you sure you want to delete
                "${categoryName}"?
            </p>
            <div class="bottomSheetButtonRow">
                <button
                    class="secondaryButton"
                    onclick="
                        renderCategoryActions(
                            '${categoryName}'
                        )
                    "
                >
                    Cancel
                </button>
                <button
                    class="bottomSheetDeleteButton"
                    onclick="
                        confirmDeleteCategory(
                            '${categoryName}'
                        )
                    "
                >
                    Delete
                </button>
            </div>
        </div>
    `;
}
/* Confirm Delete Category */
function confirmDeleteCategory(categoryName) {
  appState.groups[appState.activeGroup] = appState.groups[
    appState.activeGroup
  ].filter(function (category) {
    return category.name !== categoryName;
  });
  saveAppState();
  renderCategories();
  closeBottomSheet();
  showSnackbar("Category deleted");
}
/* Render Group Actions */
function renderGroupActions(groupName) {
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Group Actions
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <div class="bottomSheetBody">
            <button
                class="bottomSheetActionButton"
                onclick="
                    renameGroup(
                        '${groupName}'
                    )
                "
            >
                ✏ Rename Group
            </button>
            <button
                class="bottomSheetDeleteButton"
                onclick="
                    deleteGroup(
                        '${groupName}'
                    )
                "
            >
                🗑 Delete Group
            </button>
        </div>
    `;
  openBottomSheet();
}
/* Rename Group */
function renameGroup(groupName) {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        Rename Group
      </h2>
      <button
        class="closeButton"
        onclick="closeBottomSheet()"
      >
        ✕
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="formField">
        <label class="formLabel">
          Group Name
        </label>
        <input
          id="renameGroupInput"
          class="bottomSheetInput"
          value="${groupName}"
          placeholder="Enter Group Name"
        >
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="closeBottomSheet()"
        >
          Cancel
        </button>
        <button
          class="primaryButton"
          onclick="
            saveRenamedGroup(
              '${groupName}'
            )
          "
        >
          Save
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
}
/* Save Renamed Group */
function saveRenamedGroup(oldGroupName) {
  const newGroupName = document.getElementById("renameGroupInput").value.trim();

  if (!newGroupName) {
    showDialog("Missing Name", "Please enter a group name.");

    return;
  }

  appState.groups[newGroupName] = appState.groups[oldGroupName];

  delete appState.groups[oldGroupName];

  if (appState.activeGroup === oldGroupName) {
    appState.activeGroup = newGroupName;

    selectedGroupName.textContent = newGroupName;

    localStorage.setItem("activeGroup", newGroupName);
  }

  saveAppState();

  renderCategories();

  closeBottomSheet();

  showToast("Group Renamed");
}

/* Delete Group */
function deleteGroup(groupName) {
  const confirmation = confirm("Delete this group?");
  if (!confirmation) {
    return;
  }
  delete appState.groups[groupName];
  if (appState.activeGroup === groupName) {
    appState.activeGroup = null;
    selectedGroupName.textContent = "No Group Selected";
    localStorage.removeItem("activeGroup");
  }
  saveAppState();
  renderCategories();
  closeBottomSheet();
}
/* Sort Categories */
function sortCategories() {
  if (!appState.activeGroup) {
    return;
  }
  appState.groups[appState.activeGroup].sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  saveAppState();
  renderCategories();
  closeBottomSheet();
}
/* Sort Categories By Pending */
function sortCategoriesByPending() {
  if (!appState.activeGroup) {
    return;
  }
  appState.groups[appState.activeGroup].sort(function (a, b) {
    const pendingA = a.items.filter(function (item) {
      return !item.purchased;
    }).length;
    const pendingB = b.items.filter(function (item) {
      return !item.purchased;
    }).length;
    return pendingB - pendingA;
  });
  saveAppState();
  renderCategories();
  closeBottomSheet();
}
/* Render Dashboard Menu */
function renderDashboardMenu() {
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Dashboard Menu
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                ✕
            </button>
        </div>
        <button
        class="bottomSheetActionButton"
        onclick="window.location.href ='../pages/familyManagementPage.html'">
        👨‍👩‍👧 Group Management </button>
        <div class="bottomSheetBody">
            <button
                class="bottomSheetActionButton"
                onclick="sortCategories()"
            >
                🔤 Sort A-Z
            </button>
            <button
                class="bottomSheetActionButton"
                onclick="
                    sortCategoriesByPending()
                "
            >
                📋 Sort By Pending
            </button>
            <button
    class="bottomSheetActionButton"
    onclick="exportAppData()"
>
    📤 Export Backup
</button>
<label
    class="bottomSheetActionButton importBackupButton"
>
    📥 Import Backup
    <input
        type="file"
        accept=".json"
        hidden
        onchange="importAppData(event)"
    >
</label>
        </div>
        <button
  class="bottomSheetActionButton"
  onclick="
    window.location.href =
    '../pages/notificationsPage.html'
  "
>
  🔔 Notifications
</button>
<button
  class="bottomSheetActionButton"
  onclick="
    window.location.href =
    '../pages/budgetPage.html'
  "
>
  💰 Budget
</button>
<button
  class="bottomSheetActionButton"
  onclick="
    window.location.href =
    '../pages/productCatalogPage.html'
  "
>
  📦 Product Catalog
</button>
<button
  class="bottomSheetActionButton"
  onclick="
    window.location.href =
    '../pages/settingsPage.html'
  "
>
  ⚙ Settings
</button>
    `;
  openBottomSheet();
}
function renderBudgetDashboardWidget() {
  const budgetWidget = document.getElementById("budgetDashboardWidget");
  if (!budgetWidget || !appState.budgets) {
    return;
  }
  const limit = appState.budgets.groupBudget.monthlyLimit;
  const spent = appState.budgets.groupBudget.spent;
  const remaining = limit - spent;
  const percentUsed = Math.min(Math.round((spent / limit) * 100) || 0, 100);
  let progressClass = "budgetHealthy";
  if (percentUsed >= 80) {
    progressClass = "budgetCritical";
  } else if (percentUsed >= 50) {
    progressClass = "budgetWarning";
  }
  let topCategory = "No Spending Yet";
  let highestSpend = 0;
  Object.entries(appState.budgets.categoryBudgets).forEach(function ([
    name,
    budget,
  ]) {
    if (budget.spent > highestSpend) {
      highestSpend = budget.spent;
      topCategory = name;
    }
  });
  budgetWidget.innerHTML = `
    <div
      class="
        budgetWidgetCard
      "
    >
      <h3>
        💰 Budget Snapshot
      </h3>
      <p
        class="
          budgetWidgetAmount
        "
      >
        $${spent}
        /
        $${limit}
      </p>
      <div
        class="
          budgetProgressBar
        "
      >
        <div
          class="
            budgetProgressFill
            ${progressClass}
          "
          style="
            width:
            ${percentUsed}%;
          "
        >
        </div>
      </div>
      <p
        class="
          budgetWidgetText
        "
      >
        Remaining:
        $${remaining}
      </p>
      <p
        class="
          budgetWidgetText
        "
      >
        Top Category:
        ${topCategory}
      </p>
    </div>
  `;
}
/* Export App Data */
function exportAppData() {
  const appData = JSON.stringify(appState, null, 2);
  const blob = new Blob([appData], {
    type: "application/json",
  });
  const downloadURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadURL;
  downloadLink.download = "shopMateBackup.json";
  downloadLink.click();
  URL.revokeObjectURL(downloadURL);
  closeBottomSheet();
}
/* Import App Data */
function importAppData(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function (loadEvent) {
    try {
      const importedData = JSON.parse(loadEvent.target.result);
      Object.assign(appState, importedData);
      saveAppState();
      renderCategories();
      closeBottomSheet();
      showDialog(
        "Backup Restored",
        "Your app data has been successfully restored.",
      );
    } catch {
      showDialog(
        "Invalid Backup File",
        "The selected file is not a valid backup file.",
      );
    }
  };
  reader.readAsText(file);
}
/* Event Listeners */
if (groupDropdownButton) {
  groupDropdownButton.addEventListener("click", renderGroupDropdown);
}
if (openCategoryBottomSheetButton) {
  openCategoryBottomSheetButton.addEventListener(
    "click",
    renderCreateCategoryForm,
  );
}
if (screenOverlay) {
  screenOverlay.addEventListener("click", closeBottomSheet);
}
if (menuButton) {
  menuButton.addEventListener("click", renderDashboardMenu);
}
/* Initial Render */
initializeDashboard();
