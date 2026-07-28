@echo off


mkdir css\base
mkdir css\layout
mkdir css\components
mkdir css\pages
mkdir css\themes

type nul > css\app.css

type nul > css\base\reset.css
type nul > css\base\variables.css
type nul > css\base\typography.css
type nul > css\base\animations.css
type nul > css\base\utilities.css

type nul > css\layout\appLayout.css
type nul > css\layout\header.css
type nul > css\layout\footer.css
type nul > css\layout\navigationDrawer.css
type nul > css\layout\pageLayout.css

type nul > css\components\buttons.css
type nul > css\components\icons.css
type nul > css\components\cards.css
type nul > css\components\forms.css
type nul > css\components\search.css
type nul > css\components\tabs.css
type nul > css\components\fab.css
type nul > css\components\bottomSheet.css
type nul > css\components\dialog.css
type nul > css\components\snackbar.css
type nul > css\components\accordion.css
type nul > css\components\dropdown.css
type nul > css\components\overlays.css
type nul > css\components\progressBars.css
type nul > css\components\badges.css
type nul > css\components\toast.css
type nul > css\components\emptyState.css

type nul > css\pages\dashboard.css
type nul > css\pages\category.css
type nul > css\pages\item.css
type nul > css\pages\budget.css
type nul > css\pages\authentication.css
type nul > css\pages\profile.css
type nul > css\pages\settings.css
type nul > css\pages\notifications.css
type nul > css\pages\groupManagement.css

type nul > css\themes\darkMode.css

echo.
echo CSS structure created successfully.
pause