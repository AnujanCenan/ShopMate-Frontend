const snackbar = document.getElementById("snackbar");

const snackbarText = document.getElementById("snackbarText");

const snackbarUndoButton = document.getElementById("snackbarUndoButton");

let undoItem = null;

let undoIndex = null;

let timeout = null;

function showSnackbar(message) {
  snackbarText.textContent = message;

  snackbarUndoButton.style.display = "none";

  snackbar.classList.remove("hidden");

  clearTimeout(timeout);

  timeout = setTimeout(function () {
    snackbar.classList.add("hidden");
  }, 3000);
}

function showUndoSnackbar(item, index) {
  undoItem = item;

  undoIndex = index;

  snackbarText.textContent = `${item.name} deleted`;

  snackbarUndoButton.style.display = "block";

  snackbar.classList.remove("hidden");

  clearTimeout(timeout);

  timeout = setTimeout(function () {
    undoItem = null;

    undoIndex = null;

    snackbar.classList.add("hidden");
  }, 5000);
}

function undoDelete() {
  if (!undoItem) {
    return;
  }

  const category = getActiveCategory();

  category.items.splice(undoIndex, 0, undoItem);

  saveAppState();

  renderFilteredItems();

  snackbar.classList.add("hidden");
}

snackbarUndoButton.addEventListener("click", undoDelete);
