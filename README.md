# 🚀 Nijjara ERP (v2): System Overview

This repository contains the serverless, Google-based ERP system for Nijjara. It is built as a high-performance Single-Page Application (SPA) designed to manage Project Management, Finance, HR, and System Administration modules.

This project (v2) is a "Fresh Start" rebuild, focusing on a clean, 100% data-driven architecture.

## 🏛️ Core Architecture: The "Data-Driven" Engine

The **source of truth** for this system is not the code, but the **Google Sheet database**. The code is merely an engine that reads the database configuration and builds the User Interface dynamically.

The entire application logic is defined by three (3) "Engine Sheets":

1.  **`SYS_Tab_Register` (The Map):**
    * Defines every module (e.g., Projects, Finance) and sub-tab (e.g., Clients, Employees).
    * Tells the code *what* data to show (`Source_Sheet`) and *how* to show it (`Render_Mode`).

2.  **`SYS_Dynamic_Forms` (The Form Builder):**
    * Defines every single field for every "Add" or "Edit" popup in the system, linked by a `Form_ID`.
    * Controls field types (Text, Dropdown), validation (Mandatory), and permissions (`Role_ID`).
    * If a `Form_ID` exists here, the "Add/Edit" functionality for that module is **automatically activated**.

3.  **`SYS_Dropdowns` (The Data Lists):**
    * Manages all dropdown list content (e.g., Project Status, Payment Method) used across all forms.

## ⚙️ Technology Stack

* **Backend:** Google Apps Script (`Code.gs`). Handles authentication, data fetching, and all database interactions.
* **Frontend:** A single `App.html` file (SPA) that hosts the UI.
* **Database:** Google Sheets (acting as both a relational database and the app's config file).
* **UI Builders:**
    * `ViewTab.js.html`: A client-side script that builds dynamic data tables and search bars.
    * `FormModal.js.html`: A client-side script that builds dynamic popup forms with vertical tabs.

## 💡 Core Logic Flow (v2)

The new v2 architecture is clean, fast, and driven by commands.

1.  **Boot:** User loads the Web App URL. `doGet()` serves the `App.html` shell.
2.  **Login:** User enters credentials. `authenticateUser(user, pass)` in `Code.gs` validates them against the `SYS_Users` sheet.
3.  **Bootstrap:** On success, the backend runs **`getBootstrapData()`**. This single function gathers *all* config data (all tabs, all form definitions, all dropdowns, and user permissions) and sends it to the frontend in one "bootstrap" object.
4.  **Command Palette:** The UI (powered by `CommandPalette.js.html`) initializes. The user can type "Add Client", "View Projects", or "Run Payroll Report". This palette uses the bootstrap data to know what commands are available.
5.  **Dynamic Rendering (The "Engine" in Action):**
    * **User Action:** User selects "View Clients".
    * **Frontend:** Calls `google.script.run.getSubTabViewData('Sub_PRJ_Clients')`.
    * **Backend:** `getSubTabViewData()` reads `SYS_Tab_Register` to find the `Source_Sheet` (e.g., `PV_PRJ_Clients`) and fetches its data.
    * **Frontend:** `ViewTab.js` receives the data and builds the dynamic table view.
6.  **Dynamic Forms:**
    * **User Action:** User clicks "Add New Client".
    * **Frontend:** Calls `google.script.run.getFormPayload('FORM_PRJ_AddClient')`.
    * **Backend:** `getFormPayload()` reads `SYS_Dynamic_Forms` and pulls all fields matching that `Form_ID`.
    * **Frontend:** `FormModal.js` receives the field list and builds the "Add Client" popup, complete with all tabs and fields.

This architecture ensures that to add a new module, page, or form, **no new JavaScript code is required**. The work is done 100% by adding new configuration rows to the "Engine Sheets."
📋 Nijjara ERP (v2): Action Plan & To-Do List
Here is our structured plan. We will use this to track every task, ensuring we only build clean, necessary code.

Phase 1: Foundation (The New Project)
[x] Task 1.1 (Done): Create new Google Apps Script project.

[x] Task 1.2 (Done): Create and link new Google Sheet (copied from original).

[ ] Task 1.3 (In Progress): Create base Code.gs file (with doGet, include, and SPREADSHEET_ID).

[ ] Task 1.4: Create base App.html file (the main SPA shell).

[ ] Task 1.5: Create helper file Utils.gs (We will move utility functions like sheetToObjects here).

Phase 2: Backend (Porting The "Clean" Engine)
[ ] Task 2.1: Authentication:

[ ] Port authenticateUser from old Code.js.

[ ] Port createSession and related session logic.

[ ] Task 2.2: Bootstrap:

[ ] Port getBootstrapData (The most important function).

[ ] Port all sub-functions it relies on (e.g., getTabs, getForms, getPermissions).

[ ] Task 2.3: Data View Engine:

[ ] Port getSubTabViewData (This powers the ViewAdd mode).

[ ] Task 2.4: Form Engine:

[ ] Port getFormPayload (This builds the popups).

[ ] Task 2.5: Save Engine:

[ ] Port saveRecord (The single function that reads SYS_Dynamic_Forms to save data).

Phase 3: Frontend (The New "Command" UI)
[ ] Task 3.1: Design App.html (Login Screen).

[ ] Task 3.2: Design App.html (Main Workspace):

[ ] Header (User menu, etc.)

[ ] Main Content Area (<main id="main-content-area"></main>)

[ ] Global Modal Container (<div id="global-modal-container"></div>)

[ ] Task 3.3: Create CommandPalette.js.html (The new Ctrl+K logic).

[ ] Logic to parse window.ERP_STATE and build commands.

[ ] Logic to call loadSubTabContent or loadFormModal based on command.

[ ] Task 3.4: Port Core UI Engines (No changes needed):

[ ] Port ViewTab.js.html

[ ] Port FormModal.js.html

[ ] Port ViewTab.css.html

[ ] Port FormModal.css.html

Phase 4: Activation (Data-Entry Only)
[ ] Task 4.1: System Module:

[ ] Review SYS_Tab_Register for Tab_SYS_Management.

[ ] Review FORM_SYS_AddUser, FORM_SYS_EditUser in SYS_Dynamic_Forms.

[ ] Task 4.2: Projects Module:

[ ] Review SYS_Tab_Register for Tab_PRJ_Management.

[ ] (Crucial) Define all FORM_... entries in SYS_Dynamic_Forms for all project sub-tabs.

[ ] Task 4.3: Finance Module:

[ ] Review SYS_Tab_Register for Tab_FIN_Management.

[ ] (Crucial) Define all FORM_... entries in SYS_Dynamic_Forms for all finance sub-tabs.

[ ] Task 4.4: HR Module:

[ ] Review SYS_Tab_Register for Tab_HR_Management.

[ ] (Crucial) Define all FORM_... entries in SYS_Dynamic_Forms for all HR sub-tabs.
