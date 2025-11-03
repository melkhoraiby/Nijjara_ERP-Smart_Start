## Nijjara ERP: System Overview >>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|_|>> ALL THE SYSTEM SHOULD BE IN ARABIC FOR THE USER INTERFACE <<|_|
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━━━━━━━  
➊ Detailed Explanation: The “Smart Start” System Logic  
━━━━━━━━━━━━━━━━━━━━━━━━━━  
▸ Data-driven Single-Page Application (SPA):  
 The `nijjara_erp-smart_start` system’s `Code.js` acts as an “engine” that reads instructions directly from your Google Sheet—not from hard-coded logic.

╭─ ➊ The Boot-up  
│  
│ ▸ User Visits URL: User opens your deployed web app URL.  
│ ▸ Serve App.html: The `doGet()` function in `Code.js` runs, serving `App.html` to the user's browser.  
│ ▸ Render Login: `App.html` loads, its internal JavaScript runs, sees the user is not authenticated, and shows the `id="login-view"` section.  
╰─────────────────────────

╭─ ➋ Authentication  
│  
│ ▸ User Submits: User enters email and password (e.g., `mkhoraiby` and `210388`) and clicks “Sign in.”  
│ ▸ Call Backend: JavaScript in `App.html` calls `google.script.run.authenticateUser(...)` in `Code.js`.  
│ ▸ `authenticateUser` Runs:  
│  • Finds the `SYS_Users` tab.  
│  • Searches for the user’s email (`mkhoraiby`).  
│  • Finds the `Password_Hash` column for that user.  
│  • Hashes the provided password using `hashPassword_`.  
│  • Compares the new hash to the stored hash.  
│  • If they match, login is successful.  
╰─────────────────────────

╭─ ➌ The “Bootstrap” (Most Critical Step)  
│  
│ ▸ Gather All Data: After login, `authenticateUser` calls `getBootstrapData()`.  
│ ▸ `getBootstrapData()` Runs:  
│  • Reads `SYS_Tab_Register` for navigation menu.  
│  • Reads `SYS_Dynamic_Forms` for form field definitions.  
│  • Reads `SYS_Dropdowns` for dropdown options.  
│  • Reads `SYS_Role_Permissions` for user’s role permissions.  
│ ▸ Return Object: Bundles all data into a “bootstrap” object and returns it to `App.html`.  
╰─────────────────────────

╭─ ➍ The Frontend Wakes Up  
│  
│ ▸ Store State: JavaScript stores the bootstrap object in `window.ERP_STATE`.  
│ ▸ Render UI:  
│  • Populates user’s name in header.  
│  • Calls `renderNavigation()` to build sidebar.  
│  • Calls `buildCommandList()` for Ctrl+K palette.  
│  • Hides `login-view`, shows `workspace-view`.  
│  • Loads default sub-tab (e.g., `Sub_SYS_Overview`).  
╰─────────────────────────

╭─ ➎ How a User Views Data (e.g., “View Users”)  
│  
│ ▸ User Clicks: “Users” sub-tab in sidebar.  
│ ▸ Call Backend: `google.script.run.getSubTabViewData('Sub_SYS_Users')`.  
│ ▸ `getSubTabViewData()` Runs:  
│  • Finds `Sub_SYS_Users` in `SYS_Tab_Register`.  
│  • Reads `Source_Sheet` → `PV_SYS_Users_Table`.  
│  • Fetches data from that sheet.  
│ ▸ Render ViewTab:  
│  • Success handler receives data.  
│  • Calls `buildDynamicViewPad()` from `ViewTab.js.html`.  
│  • Dynamically builds “Add New” button, search bar, filters, and data table.  
╰─────────────────────────

╭─ ➏ How a User Adds Data (e.g., “Add New User”)  
│  
│ ▸ User Clicks: “Add New User” button.  
│ ▸ Call Backend: `getFormPayload('FORM_SYS_AddUser')`.  
│ ▸ `getFormPayload()` Runs:  
│  • Opens `SYS_Dynamic_Forms`.  
│  • Finds rows with `Form_ID = FORM_SYS_AddUser`.  
│  • Reads `Tab_Name`, `Section_Header`, `Field_Label`, `Field_Type`, etc.  
│  • Bundles into a “form” object.  
│ ▸ Render FormModal:  
│  • Frontend receives form object.  
│  • Calls `form-builder` from `FormModal.js.html`.  
│  • Dynamically builds popup with tabs, sections, fields.  
│ ▸ User Saves:  
│  • Calls `saveRecord('FORM_SYS_AddUser', { ...data... })`.  
│  • Backend reads `SYS_Dynamic_Forms` for target sheet/columns.  
│  • Builds new row and appends to `SYS_Users`.  
╰─────────────────────────

✔ This is the complete, 100% data-driven logic.  
 Your code is the engine.  
 Your Google Sheet is the fuel and instruction manual.

━━━━━━━━━━━━━━━━━━━━━━━━━━  
➋ Complete Google Sheet Schema (100% Functional)  
━━━━━━━━━━━━━━━━━━━━━━━━━━  
▸ These tabs are critical. Their headers must match exactly.

➊ SYS_Users  
[User_Id, Full_Name, Username, Email, Job_Title, Department, Role_Id, IsActive, Password_Hash, Last_Login, Created_At, Created_By, Updated_At, Updated_By]

➋ SYS_Tab_Register  
[Record_Type, Tab_ID, Tab_Label_EN, Tab_Label_AR, Sub_ID, Sub_Label_EN, Sub_Label_AR, Route, Sort_Order, Source_Sheet, Render_Mode, Add_Form_ID, Edit_Form_ID, View_Label, Add_Label, Permissions, Search_Bar, Filter_Options]

➌ SYS_Dynamic_Forms  
[Form_ID, Form_Title, Tab_ID, Tab_Name, Section_Header, Field_ID, Field_Label, Field_Type, Source_Sheet, Source_Range, Mandatory, Default_Value, Dropdown_Key, Target_Sheet, Target_Column, Role_ID, Show, Quick_Actions, Pane, Field_Order, Help_Text, Placeholder]

➍ SYS_Dropdowns  
[Key, English_Title, Arabic_Title, Is_Active, Sort_Order, Value, Group]

➎ SYS_Role_Permissions  
[Role_Id, Permission_Key, Scope, Allowed, Constraints, Created_At, Created_By, Updated_At, Updated_By]

━━━━━━━━━━━━━━━━━━━━━━━━━━  
➌ Supporting System Sheets  
━━━━━━━━━━━━━━━━━━━━━━━━━━  
➏ SYS_Sessions  
[Session_Id, User_Id, Actor_Email, Type, Status, Started_At, Created_At, Created_By]

➐ SYS_Audit_Log  
[Timestamp, User, Action, Details, Entity, Entity_Id]

➑ SYS_Roles  
[Role_Id, Role_Title, Description]

➒ SYS_Permissions  
[Permission_Key, Permission_Label, Description, Category]

➓ SYS_Settings  
[Setting_Key, Setting_Value]

━━━━━━━━━━━━━━━━━━━━━━━━━━  
➍ Other Notes  
━━━━━━━━━━━━━━━━━━━━━━━━━━  
▸ Other SYS* tabs like `SYS_User_Properties`, `SYS_PubHolidays`, etc. are supported.  
▸ Data & View Sheets (PV*, PRJ*, FIN*, HR*):  
 • View Sheets (PV*): Must match `Source_Sheet` in `SYS_Tab_Register`.  
 • Data Sheets (PRJ_Main, HR_Employees, etc.): Must match `Target_Sheet` and `Target_Column` in `SYS_Dynamic_Forms`.

━━━━━━━━━━━━━━━━━━━━━━━━━━  
✔ This is the complete and detailed logic and schema for your new system.  
━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━.
