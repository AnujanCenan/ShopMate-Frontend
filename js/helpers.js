/* Open Bottom Sheet */

function openBottomSheet() {
  const bottomSheet = document.getElementById("bottomSheet");

  const screenOverlay = document.getElementById("screenOverlay");

  const appFooter = document.querySelector(".appFooter");

  if (!bottomSheet) {
    return;
  }

  screenOverlay.classList.remove("hidden");

  bottomSheet.classList.remove("hidden");

  appFooter.classList.add("hiddenFooter");

  document.body.style.overflow = "hidden";
}

/* Close Bottom Sheet */

function closeBottomSheet() {
  const bottomSheet = document.getElementById("bottomSheet");

  const screenOverlay = document.getElementById("screenOverlay");

  const appFooter = document.querySelector(".appFooter");

  if (!bottomSheet) {
    return;
  }

  screenOverlay.classList.add("hidden");

  bottomSheet.classList.add("hidden");

  appFooter.classList.remove("hiddenFooter");

  document.body.style.overflow = "";
}

/* Close Bottom Sheet On Escape */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeBottomSheet();
  }
});

function getActiveCategory() {
  const activeGroup = localStorage.getItem("activeGroup");

  const activeCategory = localStorage.getItem("activeCategory");

  if (!activeGroup || !activeCategory) {
    return null;
  }

  const categories = appState.groups[activeGroup];

  if (!categories) {
    return null;
  }

  return categories.find(function (category) {
    return category.name === activeCategory;
  });
}

function debugActiveCategory() {
  const activeCategory = getActiveCategory();

  console.log("ACTIVE CATEGORY:", activeCategory);
}
