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
const sideDrawer = document.getElementById("sideDrawer");
const sideDrawerOverlay = document.getElementById("sideDrawerOverlay");
/* Initialize Dashboard */
function initializeDashboard() {
  restoreLastGroup();
  renderCategories();
  renderBudgetDashboardWidget();
}
/* Restore Last Group */
function restoreLastGroup() {
  const savedGroup = localStorage.getItem("activeGroup");
  if (savedGroup && appState.groups[savedGroup]) {
    appState.activeGroup = savedGroup;
    selectedGroupName.textContent = savedGroup;
  }
}
/* Render Categories */
function renderCategories() {
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
  const categories = appState.groups[appState.activeGroup];
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
    const categoryBudget =
      appState.budgets.categoryBudgets?.[appState.activeGroup]?.[category.name]
        ?.monthlyLimit ?? 0;
    let categorySpent = 0;
    category.items.forEach(function (item) {
      if (item.purchased && item.estimatedPrice) {
        categorySpent += Number(item.estimatedPrice);
      }
    });
    const categoryRemaining =
      categoryBudget > 0 ? Math.max(categoryBudget - categorySpent, 0) : null;
    const pendingCount = category.items.filter(function (item) {
      return !item.purchased;
    }).length;
    const purchasedCount = category.items.filter(function (item) {
      return item.purchased;
    }).length;
    categoryList.innerHTML += `
      <div
        class="categoryCard"
        onclick="openCategoryPage('${category.name}')"
      >
        <div class="categoryHeaderTitle">
        <h2 class="categoryTitle">
          ${category.name}
        </h2>
        <button
          class="categoryMoreButton"
          onclick="
            event.stopPropagation();
            renderCategoryActions(
              '${category.name}'
            );
          "
        >
          <img
    src="${getIconPath("navigation", "menu")}"
    class="icon actionIcon"
    alt="More"
>
        </button>
        </div>
        <div class="categoryBudgetSummary">
  Budget
  <strong>
    ${categoryBudget > 0 ? "$" + categoryBudget : "Not Set"}
  </strong>
  &nbsp; • &nbsp;
  Spent
  <strong>
    $${categorySpent}
  </strong>
  &nbsp; • &nbsp;
  Left
  <strong>
    ${categoryBudget > 0 ? "$" + categoryRemaining : "-"}
  </strong>
</div>
        <p class="categoryInfo">
  ${pendingCount}
  Pending
  &nbsp; • &nbsp;
  ${purchasedCount}
  Purchased
</p>
      </div>
    `;
  });
}
/* Select Group */
function selectGroup(groupName) {
  appState.activeGroup = groupName;
  selectedGroupName.textContent = groupName;
  localStorage.setItem("activeGroup", groupName);
  renderCategories();
  renderBudgetDashboardWidget();
  renderGroupDropdown();
  closeBottomSheet();
}
/* Open Category Page */
function openCategoryPage(categoryName) {
  localStorage.setItem("activeGroup", appState.activeGroup);
  localStorage.setItem("activeCategory", categoryName);
  window.location.href = "../pages/categoryPage.html";
}
/* Render Group Dropdown */
function renderGroupDropdown() {
  let groupItemsHTML = "";
  Object.keys(appState.groups).forEach(function (groupName) {
    groupItemsHTML += `
    <div class="groupItem" onclick="selectGroup('${groupName}')">
      <span class="groupItemName">
        ${groupName}
      </span>
      ${
        canManageGroup()
          ? `
      <button
        class="groupMoreButton"
        onclick="event.stopPropagation(); renderGroupActions('${groupName}');"
      >
        <img
          src="${getIconPath("navigation", "more")}"
          class="icon actionIcon"
          alt="More"
        >
      </button>
    `
          : ""
      }
    </div>`;
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
                <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
            </button>
        </div>
        <div class="groupList">
            ${groupItemsHTML}
        </div>
        <div class="createGroupButtonWrapper">
          <div class="createGroupButtonWrapper">
    <button
        class="primaryButton createGroupButton"
        onclick="renderCreateGroupForm()"
    >
        Create New Group
    </button>
</div>
</div>
        </div>`;
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
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="Close"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <div class="formField">
        <label class="formLabel">
          Group Name
        </label>
        <input
          id="groupNameInput"
          type="text"
          class="bottomSheetInput"
          placeholder="Enter Group Name"
          oninput="clearGroupValidation()"
        >
        <div
          id="groupNameError"
          class="validationMessage"
        ></div>
      </div>
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
  setTimeout(function () {
    document.getElementById("groupNameInput").focus();
  }, 100);
}
/* Clear Group Validation */
function clearGroupValidation() {
  const groupNameInput = document.getElementById("groupNameInput");
  const groupNameError = document.getElementById("groupNameError");
  if (!groupNameInput || !groupNameError) {
    return;
  }
  let groupName = groupNameInput.value;
  groupName = groupName.replace(/^\s+/, "");
  groupName = groupName.replace(/\s{2,}/g, " ");
  groupName = groupName.replace(/\b[a-z]/g, function (letter) {
    return letter.toUpperCase();
  });
  groupNameInput.value = groupName;
  groupNameInput.classList.remove("formInputError");
  groupNameError.textContent = "";
}
/* Clear Rename Group Validation */
function clearRenameGroupValidation() {
  const renameGroupInput = document.getElementById("renameGroupInput");
  const renameGroupError = document.getElementById("renameGroupError");
  if (!renameGroupInput || !renameGroupError) {
    return;
  }
  let groupName = renameGroupInput.value;
  groupName = groupName.replace(/^\s+/, "");
  groupName = groupName.replace(/\s{2,}/g, " ");
  groupName = groupName.replace(/\b[a-z]/g, function (letter) {
    return letter.toUpperCase();
  });
  renameGroupInput.value = groupName;
  renameGroupInput.classList.remove("formInputError");
  renameGroupError.textContent = "";
}
/* Create Group */
function createGroup() {
  const groupNameInput = document.getElementById("groupNameInput");
  const groupNameError = document.getElementById("groupNameError");
  const groupName = groupNameInput.value.trim().replace(/\s+/g, " ");
  if (groupName.length < 2) {
    groupNameInput.classList.add("formInputError");
    groupNameError.textContent =
      "Group name must contain at least 2 characters.";
    groupNameInput.focus();
    return;
  }
  if (groupName.length > 40) {
    groupNameInput.classList.add("formInputError");
    groupNameError.textContent = "Group name cannot exceed 40 characters.";
    groupNameInput.focus();
    return;
  }
  const validGroupName = /^[A-Za-z0-9\s'-]+$/;
  if (!validGroupName.test(groupName)) {
    groupNameInput.classList.add("formInputError");
    groupNameError.textContent =
      "Only letters, numbers, spaces, apostrophes and hyphens are allowed.";
    groupNameInput.focus();
    return;
  }
  clearGroupValidation();
  if (!groupName) {
    groupNameInput.classList.add("formInputError");
    groupNameError.textContent = "Please enter a group name.";
    groupNameInput.focus();
    return;
  }
  const groupExists = Object.keys(appState.groups).some(
    function (existingGroup) {
      return existingGroup.toLowerCase() === groupName.toLowerCase();
    },
  );
  if (groupExists) {
    groupNameInput.classList.add("formInputError");
    groupNameError.textContent = "A group with this name already exists.";
    groupNameInput.focus();
    groupNameInput.select();
    return;
  }
  appState.groups[groupName] = [];
  if (!appState.budgets) {
    appState.budgets = {};
  }
  if (!appState.budgets.groupBudgets) {
    appState.budgets.groupBudgets = {};
  }
  appState.budgets.groupBudgets[groupName] = {
    monthlyLimit: null,
  };
  if (!appState.groupMembers) {
    appState.groupMembers = {};
  }
  const currentUser = getCurrentUser();
  appState.groupMembers[groupName] = [
    {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: "admin",
    },
  ];
  saveAppState();
  selectGroup(groupName);
  showSnackbar("Group created successfully.");
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
                <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
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
function createCategory() {
  const categoryNameInput = document.getElementById("categoryNameInput");
  const categoryName = categoryNameInput.value.trim();
  if (!categoryName) {
    return;
  }
  appState.groups[appState.activeGroup].unshift({
    name: categoryName,
    items: [],
  });
  if (!appState.budgets) {
    appState.budgets = {
      groupBudgets: {},
      categoryBudgets: {},
    };
  }
  if (!appState.budgets.categoryBudgets) {
    appState.budgets.categoryBudgets = {};
  }
  if (!appState.budgets.categoryBudgets[appState.activeGroup]) {
    appState.budgets.categoryBudgets[appState.activeGroup] = {};
  }
  appState.budgets.categoryBudgets[appState.activeGroup][categoryName] = {
    monthlyLimit: null,
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
                <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
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
                <img
    src="${getIconPath("actions", "edit")}"
    class="icon actionIcon"
    alt=""
>
Rename Category
            </button>
            <button
              class="bottomSheetActionButton"
              onclick="
                renderCategoryBudgetForm(
                    '${categoryName}'
                )
              "
            >Set Category Budget</button>
            <button
                class="bottomSheetDeleteButton"
                onclick="
                    deleteCategory(
                        '${categoryName}'
                    )
                "
            >
                <img
    src="${getIconPath("actions", "delete")}"
    class="icon actionIcon"
    alt=""
>
Delete Category
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
                <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
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
  if (
    appState.budgets.categoryBudgets?.[appState.activeGroup]?.[categoryName]
  ) {
    appState.budgets.categoryBudgets[appState.activeGroup][newCategoryName] =
      appState.budgets.categoryBudgets[appState.activeGroup][categoryName];
    delete appState.budgets.categoryBudgets[appState.activeGroup][categoryName];
  }
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
                <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
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
  if (appState.budgets.categoryBudgets?.[appState.activeGroup]) {
    delete appState.budgets.categoryBudgets[appState.activeGroup][categoryName];
  }
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
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="Close"
        >
      </button>
    </div>
    <div class="bottomSheetBody">
      <button
        class="bottomSheetActionButton"
        onclick="renameGroup('${groupName}')"
      >
        <img
          src="${getIconPath("actions", "edit")}"
          class="icon actionIcon"
          alt=""
        >
        <span>
          Rename Group
        </span>
      </button>
     <button
  class="bottomSheetActionButton"
  onclick="renderInviteMemberForm('${groupName}')"
>
  <img
    src="${getIconPath("actions", "add")}"
    class="icon actionIcon"
    alt=""
  >
  <span>
    Invite Member
  </span>
</button>
<button
  class="bottomSheetDeleteButton"
  onclick="deleteGroup('${groupName}')"
>
  <img
    src="${getIconPath("actions", "delete")}"
    class="icon actionIcon"
    alt=""
  >
  <span>
    Delete Group
  </span>
</button>
    </div>
  `;
  openBottomSheet();
}
/* Render Invite Member Form */
function renderInviteMemberForm(groupName) {
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>Invite Member</h2>
      <button class="closeButton" onclick="closeBottomSheet()">
        <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
      </button>
    </div>
    <div class="bottomSheetBody">
    <div class="inviteGroupInformation">
  <label class="formLabel">
    Inviting Member To
  </label>
  <div class="inviteGroupName">
    ${groupName}
  </div>
</div>
      <div class="formField">
        <label class="formLabel">
          Email Address
        </label>
        <input id="inviteMemberEmailInput" type="email" class="bottomSheetInput" placeholder="Enter Email Address" oninput="clearInviteMemberValidation()">
          <div id="inviteMemberEmailError" class="validationMessage"></div>
      </div>
        <div class="bottomSheetButtonRow">
          <button class="secondaryButton" onclick="renderGroupActions('${groupName}')">
            Cancel
          </button>
          <button class="primaryButton" onclick="sendMemberInvitation('${groupName}')">
            Send Invitation
          </button>
      </div>
    </div>
  `;
  openBottomSheet();
  setTimeout(function () {
    const emailInput = document.getElementById("inviteMemberEmailInput");
    if (!emailInput) {
      return;
    }
    emailInput.focus();
  }, 100);
}
/* Clear Invite Member Validation */
function clearInviteMemberValidation() {
  const emailInput = document.getElementById("inviteMemberEmailInput");
  const emailError = document.getElementById("inviteMemberEmailError");
  if (!emailInput || !emailError) {
    return;
  }
  emailInput.classList.remove("formInputError");
  emailError.textContent = "";
}
/* Send Member Invitation */
function sendMemberInvitation(groupName) {
  const emailInput = document.getElementById("inviteMemberEmailInput");
  const emailError = document.getElementById("inviteMemberEmailError");
  if (!emailInput || !emailError) {
    return;
  }
  const email = emailInput.value.trim().toLowerCase();
  emailInput.classList.remove("formInputError");
  emailError.textContent = "";
  if (!email) {
    emailInput.classList.add("formInputError");
    emailError.textContent = "Please enter an email address.";
    emailInput.focus();
    return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    emailInput.classList.add("formInputError");
    emailError.textContent = "Please enter a valid email address.";
    emailInput.focus();
    return;
  }
  const members = appState.groupMembers[groupName] || [];
  const memberExists = members.some(function (member) {
    return member.email.toLowerCase() === email;
  });
  if (memberExists) {
    emailInput.classList.add("formInputError");
    emailError.textContent = "This user is already a member of the group.";
    emailInput.focus();
    return;
  }
  const invitationExists = appState.pendingInvitations.some(
    function (invitation) {
      return (
        invitation.groupName === groupName &&
        invitation.email.toLowerCase() === email &&
        invitation.status === "pending"
      );
    },
  );
  if (invitationExists) {
    emailInput.classList.add("formInputError");
    emailError.textContent = "A pending invitation already exists.";
    emailInput.focus();
    return;
  }
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Unable to determine the current user.", "info");
    return;
  }
  const invitation = {
    id: crypto.randomUUID(),
    groupId: groupName,
    groupName: groupName,
    email: email,
    invitedBy: currentUser.email,
    invitedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  };
  appState.pendingInvitations.push(invitation);
  saveAppState();
  closeBottomSheet();
  showToast("Invitation sent successfully.");
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
        <img
          src="${getIconPath("navigation", "close")}"
          class="icon actionIcon"
          alt="Close"
        >
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
          maxlength="40"
          oninput="clearRenameGroupValidation()"
        >
        <div
          id="renameGroupError"
          class="validationMessage"
        ></div>
      </div>
      <div class="bottomSheetButtonRow">
        <button
          class="secondaryButton"
          onclick="renderGroupActions('${groupName}')"
        >
          Cancel
        </button>
        <button
          class="primaryButton"
          onclick="saveRenamedGroup('${groupName}')"
        >
          Save
        </button>
      </div>
    </div>
  `;
  openBottomSheet();
  setTimeout(function () {
    const renameGroupInput = document.getElementById("renameGroupInput");
    if (!renameGroupInput) {
      return;
    }
    renameGroupInput.focus();
    renameGroupInput.select();
  }, 100);
}
/* Save Renamed Group */
function saveRenamedGroup(oldGroupName) {
  const renameGroupInput = document.getElementById("renameGroupInput");
  const renameGroupError = document.getElementById("renameGroupError");
  const newGroupName = renameGroupInput.value.trim().replace(/\s+/g, " ");
  renameGroupInput.value = newGroupName;
  if (newGroupName.length < 2) {
    renameGroupInput.classList.add("formInputError");
    renameGroupError.textContent =
      "Group name must contain at least 2 characters.";
    renameGroupInput.focus();
    return;
  }
  if (newGroupName.length > 40) {
    renameGroupInput.classList.add("formInputError");
    renameGroupError.textContent = "Group name cannot exceed 40 characters.";
    renameGroupInput.focus();
    return;
  }
  const validGroupName = /^[A-Za-z0-9\s'-]+$/;
  if (!validGroupName.test(newGroupName)) {
    renameGroupInput.classList.add("formInputError");
    renameGroupError.textContent =
      "Only letters, numbers, spaces, apostrophes and hyphens are allowed.";
    renameGroupInput.focus();
    return;
  }
  const duplicateGroup = Object.keys(appState.groups).some(function (group) {
    return (
      group.toLowerCase() === newGroupName.toLowerCase() &&
      group !== oldGroupName
    );
  });
  if (duplicateGroup) {
    renameGroupInput.classList.add("formInputError");
    renameGroupError.textContent = "A group with this name already exists.";
    renameGroupInput.focus();
    renameGroupInput.select();
    return;
  }
  appState.groups[newGroupName] = appState.groups[oldGroupName];
  delete appState.groups[oldGroupName];
  if (appState.groupMembers?.[oldGroupName]) {
    appState.groupMembers[newGroupName] = appState.groupMembers[oldGroupName];
    delete appState.groupMembers[oldGroupName];
  }
  if (appState.budgets.groupBudgets?.[oldGroupName]) {
    appState.budgets.groupBudgets[newGroupName] =
      appState.budgets.groupBudgets[oldGroupName];
    delete appState.budgets.groupBudgets[oldGroupName];
  }
  if (appState.budgets.categoryBudgets?.[oldGroupName]) {
    appState.budgets.categoryBudgets[newGroupName] =
      appState.budgets.categoryBudgets[oldGroupName];
    delete appState.budgets.categoryBudgets[oldGroupName];
  }
  if (appState.activeGroup === oldGroupName) {
    appState.activeGroup = newGroupName;
    selectedGroupName.textContent = newGroupName;
    localStorage.setItem("activeGroup", newGroupName);
  }
  saveAppState();
  renderCategories();
  renderGroupDropdown();
  renderBudgetDashboardWidget();
  closeBottomSheet();
  showToast("Group Renamed");
}
/* Delete Group */
function deleteGroup(groupName) {
  showConfirmDialog(
    "Delete Group",
    `Are you sure you want to delete "${groupName}"?
All categories, shopping items, budgets and members in this group will also be permanently deleted.
This action cannot be undone.`,
    function () {
      delete appState.groups[groupName];
      if (appState.groupMembers?.[groupName]) {
        delete appState.groupMembers[groupName];
      }
      if (appState.budgets.groupBudgets?.[groupName]) {
        delete appState.budgets.groupBudgets[groupName];
      }
      if (appState.budgets.categoryBudgets?.[groupName]) {
        delete appState.budgets.categoryBudgets[groupName];
      }
      if (appState.activeGroup === groupName) {
        const remainingGroups = Object.keys(appState.groups);
        if (remainingGroups.length > 0) {
          appState.activeGroup = remainingGroups[0];
          selectedGroupName.textContent = appState.activeGroup;
          localStorage.setItem("activeGroup", appState.activeGroup);
        } else {
          appState.activeGroup = null;
          selectedGroupName.textContent = "No Group Selected";
          localStorage.removeItem("activeGroup");
        }
      }
      saveAppState();
      renderCategories();
      renderGroupDropdown();
      renderBudgetDashboardWidget();
      closeBottomSheet();
      showToast("Group deleted.");
    },
  );
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
/* Open Side Drawer */
function openSideDrawer() {
  renderSideDrawer();
  const drawerPosition = appState.drawerPosition || "right";
  sideDrawer.classList.remove("left", "right");
  sideDrawer.classList.add(drawerPosition);
  sideDrawer.classList.add("active");
  sideDrawerOverlay.classList.add("active");
}
function closeSideDrawer() {
  sideDrawer.classList.remove("active");
  sideDrawerOverlay.classList.remove("active");
}
/* Render Side Drawer */
function renderSideDrawer() {
  sideDrawer.innerHTML = `
    <div class="drawerHeader">
  <div
    class="drawerProfile"
    onclick="window.location.href='../pages/profilePage.html'"
  >
    <div class="drawerAvatar">
      ${
        getCurrentUser().profilePhoto
          ? `
            <img
              src="${getCurrentUser().profilePhoto}"
              class="drawerAvatarImage"
              alt="Profile"
            >
          `
          : getCurrentUser().name.charAt(0).toUpperCase()
      }
    </div>
    <div class="drawerProfileDetails">
      <div class="drawerProfileName">
        ${getCurrentUser().name}
      </div>

    </div>
  </div>
</div>
</div>
    <div class="drawerMenu">
      <button class="drawerItem" onclick="window.location.href='../pages/familyManagementPage.html'">
        <img src="${getIconPath("features", "group")}" class="icon featureIcon"alt="">
        <span>Group Management</span>
      </button>
      <button class="drawerItem" onclick="window.location.href='../pages/notificationsPage.html'">
        <img src="${getIconPath("features", "notification")}" class="icon featureIcon" alt="">
        <span>Notifications</span>
      </button>
      <button class="drawerItem" onclick="window.location.href='../pages/budgetPage.html'">
        <img src="${getIconPath("features", "budget")}" class="icon featureIcon" alt="">
        <span>Budget</span>
      </button>
      <button class="drawerItem" onclick="window.location.href='../pages/settingsPage.html'">
        <img src="${getIconPath("features", "settings")}" class="icon featureIcon"alt="">
        <span>Settings</span>
      </button>
      <button
        class="drawerItem"
        onclick="exportAppData()"
      >
        <img
          src="${getIconPath("features", "export")}"
          class="icon featureIcon"
          alt=""
        >
        <span>Export</span>
      </button>
      <button
        class="drawerItem"
        onclick="document.getElementById('importBackupInput').click()"
      >
        <img
          src="${getIconPath("features", "import")}"
          class="icon featureIcon"
          alt=""
        >
        <span>Import</span>
      </button>
      <input
        type="file"
        id="importBackupInput"
        accept=".json"
        hidden
        onchange="importAppData(event)"
      >
    </div>
  `;
}
/* Open Profile Page - Opens the logged-in user's profile page. */
function openProfilePage() {
  closeSideDrawer();
  window.location.href = "../pages/profilePage.html";
}

/* Render Budget Dashboard Widget */
function renderBudgetDashboardWidget() {
  const budgetWidget = document.getElementById("budgetDashboardWidget");
  if (!budgetWidget || !appState.activeGroup) {
    return;
  }
  calculateGroupBudget();
  if (!appState.budgets.groupBudgets) {
    appState.budgets.groupBudgets = {};
  }
  if (!appState.budgets.groupBudgets[appState.activeGroup]) {
    appState.budgets.groupBudgets[appState.activeGroup] = {
      monthlyLimit: null,
    };
  }
  const groupBudget = appState.budgets.groupBudgets[appState.activeGroup];
  const limit = groupBudget.monthlyLimit ?? 0;
  const spent = calculateGroupBudget();
  const remaining = Math.max(limit - spent, 0);
  let allocated = 0;
  const categoryBudgets =
    appState.budgets.categoryBudgets?.[appState.activeGroup] || {};
  Object.values(categoryBudgets).forEach(function (budget) {
    allocated += budget.monthlyLimit || 0;
  });
  const unallocated = Math.max(limit - allocated, 0);
  const allocationPercent =
    limit === 0 ? 0 : Math.round((allocated / limit) * 100);
  const percentUsed =
    limit === 0 ? 0 : Math.min(Math.round((spent / limit) * 100), 100);
  let budgetHealth = "Healthy";
  let allocationHealth = "Healthy";
  if (allocationPercent >= 80) {
    allocationHealth = "Warning";
  }
  if (allocationPercent >= 100) {
    allocationHealth = "Full";
  }
  let healthClass = "budgetHealthyText";
  if (limit === 0) {
    budgetHealth = "Unlimited";
  } else if (percentUsed >= 90) {
    budgetHealth = "Critical";
    healthClass = "budgetCriticalText";
  } else if (percentUsed >= 70) {
    budgetHealth = "Warning";
    healthClass = "budgetWarningText";
  }
  let progressClass = "budgetHealthy";
  if (percentUsed >= 80) {
    progressClass = "budgetCritical";
  } else if (percentUsed >= 50) {
    progressClass = "budgetWarning";
  }
  budgetWidget.innerHTML = `
    <div class="budgetSummaryCard">
      <button
        class="budgetSummaryHeader"
        onclick="toggleBudgetCard()"
      >
        <div>
          <h3>
            Monthly Budget
          </h3>
          <p class="budgetGroupName">
            ${appState.activeGroup || "No Group Selected"}
          </p>
        </div>
        <span id="budgetCollapseIcon">
          <img
    src="${getIconPath("navigation", "collapse")}"
    class="icon actionIcon"
    alt=""
>
        </span>
      </button>
      <div
        id="budgetSummaryBody"
        class="budgetSummaryBody"
      >
        <h2>
          ${limit === 0 ? "Unlimited" : "$" + limit}
        </h2>
        <div class="analysisValue">
          <span>Allocated</span>
          <span>$${allocated}</span>
        </div>
        <div class="analysisValue">
          <span>Spent</span>
          <span>$${spent}</span>
        </div>
        <div class="analysisValue">
          <span>Remaining</span>
          <span>
            ${limit === 0 ? "Unlimited" : "$" + remaining}
          </span>
        </div>
        <div class="budgetProgressBar">
          <div
            class="
              budgetProgressFill
              ${progressClass}
            "
            style="width:${percentUsed}%"
          ></div>
        </div>
        <p class="budgetPercentText">
          ${limit === 0 ? "Unlimited Budget" : percentUsed + "% Used"}
        </p>
        <p class="budgetAllocationText">
          Allocation ${allocationPercent}%
        </p>
        <p class="${healthClass}">
          Budget Usage • ${budgetHealth}
        </p>
        <p class="budgetAllocationStatus">
          Allocation • ${allocationHealth}
        </p>
        ${
          allocated > limit && limit > 0
            ? `
            <div class="budgetWarningBanner">
              ⚠ Category budgets exceed the Group Budget.
            </div>
            `
            : ""
        }
        ${
          limit === 0
            ? ""
            : `
              <p class="budgetInsight">
                ${
                  remaining > 0
                    ? "$" + remaining + " remaining this month."
                    : "Budget exceeded."
                }
              </p>
            `
        }
        ${
          canManageBudget()
            ? `
              <button
                class="primaryButton budgetEditButton"
                onclick="renderEditGroupBudgetForm()"
              >
                Edit Budget
              </button>
            `
            : ""
        }
        <button
          class="secondaryButton budgetAnalysisButton"
          onclick="window.location.href='../pages/budgetPage.html'"
        >
          Budget Analysis
        </button>
      </div>
    </div>
  `;
  /****************************************
  Backend
  GET
  /group/budget/dashboard
  Returns
  {
      monthlyLimit,
      spent,
      remaining,
      percentage,
      status
  }
  ****************************************/
}

/* Toggle Budget Card */
function toggleBudgetCard() {
  const body = document.getElementById("budgetSummaryBody");
  const icon = document.getElementById("budgetCollapseIcon");
  body.classList.toggle("hidden");
  if (body.classList.contains("hidden")) {
    icon.innerHTML = `
      <img
        src="${getIconPath("navigation", "expand")}"
        class="icon actionIcon"
        alt="Expand"
      >
    `;
  } else {
    icon.innerHTML = `
      <img
        src="${getIconPath("navigation", "collapse")}"
        class="icon actionIcon"
        alt="Collapse"
      >
    `;
  }
}
/* Render Edit Group Budget Form */
function renderEditGroupBudgetForm() {
  bottomSheetContent.innerHTML = `
        <div class="bottomSheetHeader">
            <h2>
                Monthly Group Budget
            </h2>
            <button
                class="closeButton"
                onclick="closeBottomSheet()"
            >
                <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
            </button>
        </div>
        <div class="bottomSheetBody">
            <div class="formField">
                <label class="formLabel">
                    Monthly Budget Limit
                </label>
                <div class="currencyInputWrapper">
                    <span class="currencySymbol">$</span>
                    <input
                        id="groupBudgetInput"
                        type="number"
                        class="
                            bottomSheetInput
                            currencyInput
                        "
                        value="${
                          appState.budgets.groupBudgets?.[appState.activeGroup]
                            ?.monthlyLimit ?? ""
                        }"                    >
                </div>
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
                    onclick="saveGroupBudget()"
                >
                    Save
                </button>
            </div>
        </div>
    `;
  openBottomSheet();
}
/* Render Category Budget Form */
function renderCategoryBudgetForm(categoryName) {
  const currentBudget =
    appState.budgets.categoryBudgets?.[appState.activeGroup]?.[categoryName]
      ?.monthlyLimit ?? "";
  bottomSheetContent.innerHTML = `
    <div class="bottomSheetHeader">
      <h2>
        Category Budget
      </h2>
      <button
        class="closeButton"
        onclick="
          closeBottomSheet()
        "
      >
        <img src="${getIconPath("navigation", "close")}" class="icon actionIcon" alt="Close">
      </button>
    </div>
    <div class="bottomSheetBody">
      <label>
        Budget Amount
      </label>
      <p class="budgetHelperLabel">
Group Budget
<span id="groupBudgetValue">
</span>
</p>
<p class="budgetHelperLabel">
Allocated
<span id="allocatedBudgetValue">
</span>
</p>
<p class="budgetHelperLabel">
Remaining
<span id="remainingBudgetValue">
</span>
</p>
      <input
        id="categoryBudgetInput"
        class="bottomSheetInput"
        type="number"
        value="${currentBudget}"
      >
      <div
        id="categoryBudgetRemaining"
        class="budgetHelperText"
      ></div>
      <button
        class="primaryButton"
        onclick="
          saveCategoryBudget(
            '${categoryName}'
          )
        "
      >
        Save Budget
      </button>
    </div>
  `;
  updateCategoryBudgetRemaining(categoryName);
  document
    .getElementById("categoryBudgetInput")
    .addEventListener("input", function () {
      updateCategoryBudgetRemaining(categoryName);
    });
  openBottomSheet();
}
/* Update Remaining Budget */
function updateCategoryBudgetRemaining(categoryName) {
  const groupBudget =
    appState.budgets.groupBudgets?.[appState.activeGroup]?.monthlyLimit ?? 0;
  let allocated = 0;
  const categoryBudgets =
    appState.budgets.categoryBudgets?.[appState.activeGroup] || {};
  Object.entries(categoryBudgets).forEach(function (entry) {
    if (entry[0] !== categoryName) {
      allocated += entry[1].monthlyLimit || 0;
    }
  });
  const entered =
    Number(document.getElementById("categoryBudgetInput").value) || 0;
  document.getElementById("groupBudgetValue").innerHTML = "$" + groupBudget;
  document.getElementById("allocatedBudgetValue").innerHTML = "$" + allocated;
  const remaining = groupBudget - allocated - entered;
  const remainingLabel = document.getElementById("remainingBudgetValue");
  remainingLabel.innerHTML = "$" + remaining;
  remainingLabel.style.color = remaining < 0 ? "#dc2626" : "#16a34a";
}
/* Save Category Budget */
function saveCategoryBudget(categoryName) {
  const amount = Number(document.getElementById("categoryBudgetInput").value);
  if (amount < 0) {
    showDialog("Invalid Budget", "Budget cannot be negative.");
    return;
  }
  if (!appState.budgets.categoryBudgets) {
    appState.budgets.categoryBudgets = {};
  }
  if (!appState.budgets.categoryBudgets[appState.activeGroup]) {
    appState.budgets.categoryBudgets[appState.activeGroup] = {};
  }
  const groupBudget =
    appState.budgets.groupBudgets?.[appState.activeGroup]?.monthlyLimit ?? 0;
  let allocated = 0;
  Object.entries(
    appState.budgets.categoryBudgets[appState.activeGroup],
  ).forEach(function (entry) {
    const name = entry[0];
    const budget = entry[1];
    if (name !== categoryName) {
      allocated += budget.monthlyLimit || 0;
    }
  });
  const totalAllocated = allocated + amount;
  if (groupBudget > 0 && totalAllocated > groupBudget) {
    showDialog(
      "Category Budget Exceeded",
      `Total allocated budget is $${totalAllocated}.
Group budget is only $${groupBudget}.
Reduce another category budget or increase the group budget.`,
    );
    return;
  }
  appState.budgets.categoryBudgets[appState.activeGroup][categoryName] = {
    monthlyLimit: amount,
  };
  saveAppState();
  closeBottomSheet();
  showToast("Category Budget Saved");
}
/* Save Group Budget */
function saveGroupBudget() {
  const amount = Number(document.getElementById("groupBudgetInput").value);
  let allocated = 0;
  const categoryBudgets =
    appState.budgets.categoryBudgets?.[appState.activeGroup] || {};
  Object.values(categoryBudgets).forEach(function (budget) {
    allocated += budget.monthlyLimit || 0;
  });
  if (amount < allocated) {
    showDialog(
      "Invalid Group Budget",
      `Your category budgets already total $${allocated}.
Increase the group budget or reduce category budgets first.`,
    );
    return;
  }
  if (amount < 0) {
    showDialog("Invalid Budget", "Budget cannot be negative.");
    return;
  }
  if (!appState.budgets.groupBudgets) {
    appState.budgets.groupBudgets = {};
  }
  if (!appState.budgets.groupBudgets[appState.activeGroup]) {
    appState.budgets.groupBudgets[appState.activeGroup] = {};
  }
  appState.budgets.groupBudgets[appState.activeGroup].monthlyLimit = amount;
  saveAppState();
  createNotification(
    "budget",
    "Budget Updated",
    `${appState.activeGroup || "No Group Selected"} budget updated to $${amount}.`,
    "budget",
  );
  renderBudgetDashboardWidget();
  closeBottomSheet();
  showToast("Budget updated.");
}
/* Toggle Budget Widget */
function toggleBudgetWidget() {
  appState.dashboardBudgetExpanded = !appState.dashboardBudgetExpanded;
  saveAppState();
  renderBudgetDashboardWidget();
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
  menuButton.addEventListener("click", openSideDrawer);
}
/* Initial Render */
(async function () {
  await loadProductCatalog();
  initializeDashboard();
})();
