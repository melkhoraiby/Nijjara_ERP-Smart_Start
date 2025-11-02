const TAB_REGISTER_HEADERS = [
  "Record_Type",
  "Tab_ID",
  "Tab_Label_EN",
  "Tab_Label_AR",
  "Tab_Icon",
  "Sub_Icon",
  "Route",
  "Sort_Order",
  "Source_Sheet",
  "Permissions",
  "Render_Mode",
  "Add_Form_ID",
  "Edit_Form_ID",
  "View_Label",
  "Add_Label",
  "Tab_Color",
  "Search_Bar",
  "Filter_Options",
  "Sub_ID",
  "Sub_Label_EN",
  "Sub_Label_AR",
  "Sub_Source_Sheet",
  "Sub_Permissions",
  "Sub_Search_Bar",
  "Sub_Filter_Options",
  "Sub_Sort_Order"
];

const DYNAMIC_FORM_HEADERS = [
  "Pane",
  "Form_Id",
  "Title_EN",
  "Title_AR",
  "Permission_Key",
  "Form_Type",
  "Is_Active",
  "Quick_Actions",
  "Tab_ID",
  "Tab_Name",
  "Section_Header",
  "Field_ID",
  "Field_Label",
  "Field_Type",
  "Source_Sheet",
  "Source_Range",
  "Dropdown_Key",
  "Mandatory",
  "Default_Value",
  "Read_Only",
  "Target_Sheet",
  "Target_Column",
  "Role_ID",
  "Show",
  "Field_Order",
  "Help_Text",
  "Placeholder"
];

const DROPDOWN_HEADERS = [
  "Key",
  "Value",
  "English_Title",
  "Arabic_Title",
  "Is_Active",
  "Sort_Order",
  "Group"
];

const USERS_HEADERS = ["Email", "Password", "Role"];
const SESSIONS_HEADERS = ["Email", "Token", "Timestamp"];

const SYS_USERS_HEADERS = [
  "User_ID",
  "Full_Name",
  "Email",
  "Department",
  "Role_Id",
  "IsActive",
  "Hire_Date",
  "Notes"
];

const PROJECT_HEADERS = [
  "Project_ID",
  "Project_Name",
  "Client",
  "Status",
  "Start_Date",
  "Owner"
];

const TASK_HEADERS = [
  "Task_ID",
  "Project_ID",
  "Task_Name",
  "Assignee",
  "Status",
  "Due_Date"
];

const DIRECT_EXPENSE_HEADERS = [
  "Expense_ID",
  "Project_ID",
  "Date",
  "Category",
  "Amount",
  "Notes"
];

const REVENUE_HEADERS = [
  "Revenue_ID",
  "Project_ID",
  "Date",
  "Amount",
  "Notes"
];

const HR_EMPLOYEE_HEADERS = [
  "Employee_ID",
  "Full_Name",
  "Department",
  "Role",
  "Hire_Date",
  "Status"
];

const HR_ATTENDANCE_HEADERS = [
  "Record_ID",
  "Employee_ID",
  "Date",
  "Status",
  "Notes"
];

function createSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  seedAuthSheets(ss);
  seedDropdowns(ss);
  seedTabRegister(ss);
  seedDynamicForms(ss);
  seedDataSheets(ss);
}

function seedAuthSheets(ss) {
  seedSheet(ss, "Users", USERS_HEADERS, [
    ["admin@nijjara.com", "admin", "admin"],
    ["manager@nijjara.com", "manager", "manager"]
  ]);
  seedSheet(ss, "Sessions", SESSIONS_HEADERS, []);
}

function seedDropdowns(ss) {
  const rows = buildRows(DROPDOWN_HEADERS, [
    {
      Key: "DD_Roles",
      Value: "ADMIN",
      English_Title: "Administrator",
      Arabic_Title: "مسؤول النظام",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "System"
    },
    {
      Key: "DD_Roles",
      Value: "PROJECT_MANAGER",
      English_Title: "Project Manager",
      Arabic_Title: "مدير مشروع",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "System"
    },
    {
      Key: "DD_Roles",
      Value: "FINANCE",
      English_Title: "Finance",
      Arabic_Title: "مالية",
      Is_Active: "TRUE",
      Sort_Order: 3,
      Group: "System"
    },
    {
      Key: "DD_Roles",
      Value: "HR",
      English_Title: "HR",
      Arabic_Title: "موارد بشرية",
      Is_Active: "TRUE",
      Sort_Order: 4,
      Group: "System"
    },
    {
      Key: "DD_Departments",
      Value: "Projects",
      English_Title: "Projects",
      Arabic_Title: "إدارة المشاريع",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "Organization"
    },
    {
      Key: "DD_Departments",
      Value: "Finance",
      English_Title: "Finance",
      Arabic_Title: "المالية",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "Organization"
    },
    {
      Key: "DD_Departments",
      Value: "HR",
      English_Title: "HR",
      Arabic_Title: "الموارد البشرية",
      Is_Active: "TRUE",
      Sort_Order: 3,
      Group: "Organization"
    },
    {
      Key: "DD_User_Status",
      Value: "Active",
      English_Title: "Active",
      Arabic_Title: "نشط",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "System"
    },
    {
      Key: "DD_User_Status",
      Value: "Inactive",
      English_Title: "Inactive",
      Arabic_Title: "غير نشط",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "System"
    },
    {
      Key: "DD_Project_Status",
      Value: "Planning",
      English_Title: "Planning",
      Arabic_Title: "تخطيط",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "Projects"
    },
    {
      Key: "DD_Project_Status",
      Value: "In Progress",
      English_Title: "In Progress",
      Arabic_Title: "قيد التنفيذ",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "Projects"
    },
    {
      Key: "DD_Project_Status",
      Value: "On Hold",
      English_Title: "On Hold",
      Arabic_Title: "متوقف مؤقتاً",
      Is_Active: "TRUE",
      Sort_Order: 3,
      Group: "Projects"
    },
    {
      Key: "DD_Task_Status",
      Value: "Not Started",
      English_Title: "Not Started",
      Arabic_Title: "لم يبدأ",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "Projects"
    },
    {
      Key: "DD_Task_Status",
      Value: "In Progress",
      English_Title: "In Progress",
      Arabic_Title: "قيد التنفيذ",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "Projects"
    },
    {
      Key: "DD_Task_Status",
      Value: "Done",
      English_Title: "Completed",
      Arabic_Title: "منجز",
      Is_Active: "TRUE",
      Sort_Order: 3,
      Group: "Projects"
    },
    {
      Key: "DD_Expense_Category",
      Value: "Materials",
      English_Title: "Materials",
      Arabic_Title: "مواد",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "Finance"
    },
    {
      Key: "DD_Expense_Category",
      Value: "Labor",
      English_Title: "Labor",
      Arabic_Title: "أجور",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "Finance"
    },
    {
      Key: "DD_Employment_Status",
      Value: "Active",
      English_Title: "Active",
      Arabic_Title: "نشط",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "HR"
    },
    {
      Key: "DD_Employment_Status",
      Value: "On Leave",
      English_Title: "On Leave",
      Arabic_Title: "في إجازة",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "HR"
    },
    {
      Key: "DD_Attendance_Status",
      Value: "Present",
      English_Title: "Present",
      Arabic_Title: "حاضر",
      Is_Active: "TRUE",
      Sort_Order: 1,
      Group: "HR"
    },
    {
      Key: "DD_Attendance_Status",
      Value: "Absent",
      English_Title: "Absent",
      Arabic_Title: "غائب",
      Is_Active: "TRUE",
      Sort_Order: 2,
      Group: "HR"
    }
  ]);

  seedSheet(ss, "SYS_Dropdowns", DROPDOWN_HEADERS, rows);
}

function seedTabRegister(ss) {
  const rows = buildRows(TAB_REGISTER_HEADERS, [
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_SYS_Management",
      Tab_Label_EN: "System",
      Tab_Label_AR: "النظام",
      Tab_Icon: "settings",
      Sub_Icon: "user",
      Route: "system-management-view",
      Sort_Order: 1,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_SYS_AddUser",
      Edit_Form_ID: "FORM_SYS_EditUser",
      View_Label: "View Users",
      Add_Label: "Add User",
      Tab_Color: "#3a1b5c",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_SYS_Users",
      Sub_Label_EN: "Users",
      Sub_Label_AR: "المستخدمون",
      Sub_Source_Sheet: "SYS_Users",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Department","Role_Id","IsActive"]',
      Sub_Sort_Order: 1
    },
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Label_EN: "Projects",
      Tab_Label_AR: "المشاريع",
      Tab_Icon: "folder",
      Sub_Icon: "clipboard",
      Route: "projects-workspace",
      Sort_Order: 2,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_PRJ_AddProject",
      Edit_Form_ID: "FORM_PRJ_AddProject",
      View_Label: "Project Portfolio",
      Add_Label: "Add Project",
      Tab_Color: "#153d7a",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_PRJ_Projects",
      Sub_Label_EN: "Projects",
      Sub_Label_AR: "المشاريع",
      Sub_Source_Sheet: "PRJ_Projects",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Status","Owner"]',
      Sub_Sort_Order: 1
    },
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Label_EN: "Projects",
      Tab_Label_AR: "المشاريع",
      Tab_Icon: "folder",
      Sub_Icon: "tasks",
      Route: "projects-workspace",
      Sort_Order: 2,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_PRJ_AddTask",
      Edit_Form_ID: "FORM_PRJ_AddTask",
      View_Label: "Project Tasks",
      Add_Label: "Add Task",
      Tab_Color: "#153d7a",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_PRJ_Tasks",
      Sub_Label_EN: "Tasks",
      Sub_Label_AR: "المهام",
      Sub_Source_Sheet: "PRJ_Tasks",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Status","Assignee"]',
      Sub_Sort_Order: 2
    },
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_FIN_Management",
      Tab_Label_EN: "Finance",
      Tab_Label_AR: "المالية",
      Tab_Icon: "dollar-sign",
      Sub_Icon: "file-invoice",
      Route: "finance-workspace",
      Sort_Order: 3,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_FIN_AddDirectExpense",
      Edit_Form_ID: "FORM_FIN_AddDirectExpense",
      View_Label: "Direct Expenses",
      Add_Label: "Add Expense",
      Tab_Color: "#7c5a1f",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_FIN_Direct",
      Sub_Label_EN: "Direct Expenses",
      Sub_Label_AR: "المصاريف المباشرة",
      Sub_Source_Sheet: "FIN_DirectExpenses",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Category","Project_ID"]',
      Sub_Sort_Order: 1
    },
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_FIN_Management",
      Tab_Label_EN: "Finance",
      Tab_Label_AR: "المالية",
      Tab_Icon: "dollar-sign",
      Sub_Icon: "chart-line",
      Route: "finance-workspace",
      Sort_Order: 3,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_FIN_AddRevenue",
      Edit_Form_ID: "FORM_FIN_AddRevenue",
      View_Label: "Revenue Log",
      Add_Label: "Log Revenue",
      Tab_Color: "#7c5a1f",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_FIN_Revenue",
      Sub_Label_EN: "Revenue",
      Sub_Label_AR: "الإيرادات",
      Sub_Source_Sheet: "FIN_Revenues",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Project_ID"]',
      Sub_Sort_Order: 2
    },
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_HR_Management",
      Tab_Label_EN: "HR",
      Tab_Label_AR: "الموارد البشرية",
      Tab_Icon: "users",
      Sub_Icon: "id-badge",
      Route: "hr-workspace",
      Sort_Order: 4,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_HR_AddEmployee",
      Edit_Form_ID: "FORM_HR_AddEmployee",
      View_Label: "Employees",
      Add_Label: "Add Employee",
      Tab_Color: "#0f6c43",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_HR_Employees",
      Sub_Label_EN: "Employees",
      Sub_Label_AR: "الموظفون",
      Sub_Source_Sheet: "HR_Employees",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Department","Status"]',
      Sub_Sort_Order: 1
    },
    {
      Record_Type: "SUB",
      Tab_ID: "Tab_HR_Management",
      Tab_Label_EN: "HR",
      Tab_Label_AR: "الموارد البشرية",
      Tab_Icon: "users",
      Sub_Icon: "calendar",
      Route: "hr-workspace",
      Sort_Order: 4,
      Render_Mode: "VIEW",
      Add_Form_ID: "FORM_HR_AddAttendance",
      Edit_Form_ID: "FORM_HR_AddAttendance",
      View_Label: "Attendance",
      Add_Label: "Log Attendance",
      Tab_Color: "#0f6c43",
      Search_Bar: "TRUE",
      Filter_Options: "",
      Sub_ID: "Sub_HR_Attendance",
      Sub_Label_EN: "Attendance",
      Sub_Label_AR: "الحضور",
      Sub_Source_Sheet: "HR_Attendance",
      Sub_Search_Bar: "TRUE",
      Sub_Filter_Options: '["Status","Employee_ID"]',
      Sub_Sort_Order: 2
    }
  ]);

  seedSheet(ss, "SYS_Tab_Register", TAB_REGISTER_HEADERS, rows);
}

function seedDynamicForms(ss) {
  const rows = buildRows(DYNAMIC_FORM_HEADERS, [
    // FORM_SYS_AddUser
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Profile",
      Field_ID: "SYS_User_ID",
      Field_Label: "User ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "User_ID",
      Field_Order: 1,
      Placeholder: "USR-001"
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Profile",
      Field_ID: "SYS_Full_Name",
      Field_Label: "Full Name",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Full_Name",
      Field_Order: 2
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Profile",
      Field_ID: "SYS_Email",
      Field_Label: "Email",
      Field_Type: "Email",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Email",
      Field_Order: 3
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Assignment",
      Field_ID: "SYS_Department",
      Field_Label: "Department",
      Field_Type: "Dropdown",
      Source_Sheet: "SYS_Dropdowns",
      Dropdown_Key: "DD_Departments",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Department",
      Field_Order: 4
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Assignment",
      Field_ID: "SYS_Role",
      Field_Label: "Role",
      Field_Type: "Dropdown",
      Source_Sheet: "SYS_Dropdowns",
      Dropdown_Key: "DD_Roles",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Role_Id",
      Field_Order: 5
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Status",
      Field_ID: "SYS_User_Status",
      Field_Label: "Status",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_User_Status",
      Default_Value: "Active",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "IsActive",
      Field_Order: 6
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Status",
      Field_ID: "SYS_Hire_Date",
      Field_Label: "Hire Date",
      Field_Type: "Date",
      Mandatory: "No",
      Target_Sheet: "SYS_Users",
      Target_Column: "Hire_Date",
      Field_Order: 7
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_AddUser",
      Title_EN: "Add User",
      Title_AR: "إضافة مستخدم",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Notes",
      Field_ID: "SYS_Notes",
      Field_Label: "Notes",
      Field_Type: "Paragraph",
      Target_Sheet: "SYS_Users",
      Target_Column: "Notes",
      Field_Order: 8
    },
    // FORM_SYS_EditUser
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Profile",
      Field_ID: "SYS_User_ID_View",
      Field_Label: "User ID",
      Field_Type: "Display",
      Read_Only: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "User_ID",
      Field_Order: 1
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Profile",
      Field_ID: "SYS_Full_Name_Edit",
      Field_Label: "Full Name",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Full_Name",
      Field_Order: 2
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Profile",
      Field_ID: "SYS_Email_Edit",
      Field_Label: "Email",
      Field_Type: "Email",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Email",
      Field_Order: 3
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Assignment",
      Field_ID: "SYS_Department_Edit",
      Field_Label: "Department",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Departments",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Department",
      Field_Order: 4
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Assignment",
      Field_ID: "SYS_Role_Edit",
      Field_Label: "Role",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Roles",
      Mandatory: "Yes",
      Target_Sheet: "SYS_Users",
      Target_Column: "Role_Id",
      Field_Order: 5
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Status",
      Field_ID: "SYS_Status_Edit",
      Field_Label: "Status",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_User_Status",
      Target_Sheet: "SYS_Users",
      Target_Column: "IsActive",
      Field_Order: 6
    },
    {
      Pane: "Sub_SYS_Users",
      Form_Id: "FORM_SYS_EditUser",
      Title_EN: "Edit User",
      Title_AR: "تعديل مستخدم",
      Form_Type: "EDIT",
      Is_Active: "Yes",
      Tab_ID: "Tab_SYS_Management",
      Tab_Name: "System",
      Section_Header: "Notes",
      Field_ID: "SYS_Notes_Edit",
      Field_Label: "Notes",
      Field_Type: "Paragraph",
      Target_Sheet: "SYS_Users",
      Target_Column: "Notes",
      Field_Order: 7
    },
    // FORM_PRJ_AddProject
    {
      Pane: "Sub_PRJ_Projects",
      Form_Id: "FORM_PRJ_AddProject",
      Title_EN: "Add Project",
      Title_AR: "إضافة مشروع",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Overview",
      Field_ID: "PRJ_Project_ID",
      Field_Label: "Project ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "PRJ_Projects",
      Target_Column: "Project_ID",
      Field_Order: 1,
      Placeholder: "PRJ-001"
    },
    {
      Pane: "Sub_PRJ_Projects",
      Form_Id: "FORM_PRJ_AddProject",
      Title_EN: "Add Project",
      Title_AR: "إضافة مشروع",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Overview",
      Field_ID: "PRJ_Project_Name",
      Field_Label: "Project Name",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "PRJ_Projects",
      Target_Column: "Project_Name",
      Field_Order: 2
    },
    {
      Pane: "Sub_PRJ_Projects",
      Form_Id: "FORM_PRJ_AddProject",
      Title_EN: "Add Project",
      Title_AR: "إضافة مشروع",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Overview",
      Field_ID: "PRJ_Client",
      Field_Label: "Client",
      Field_Type: "Text",
      Target_Sheet: "PRJ_Projects",
      Target_Column: "Client",
      Field_Order: 3
    },
    {
      Pane: "Sub_PRJ_Projects",
      Form_Id: "FORM_PRJ_AddProject",
      Title_EN: "Add Project",
      Title_AR: "إضافة مشروع",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Tracking",
      Field_ID: "PRJ_Status",
      Field_Label: "Status",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Project_Status",
      Mandatory: "Yes",
      Target_Sheet: "PRJ_Projects",
      Target_Column: "Status",
      Field_Order: 4
    },
    {
      Pane: "Sub_PRJ_Projects",
      Form_Id: "FORM_PRJ_AddProject",
      Title_EN: "Add Project",
      Title_AR: "إضافة مشروع",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Tracking",
      Field_ID: "PRJ_Start_Date",
      Field_Label: "Start Date",
      Field_Type: "Date",
      Target_Sheet: "PRJ_Projects",
      Target_Column: "Start_Date",
      Field_Order: 5
    },
    {
      Pane: "Sub_PRJ_Projects",
      Form_Id: "FORM_PRJ_AddProject",
      Title_EN: "Add Project",
      Title_AR: "إضافة مشروع",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Tracking",
      Field_ID: "PRJ_Owner",
      Field_Label: "Owner",
      Field_Type: "Text",
      Target_Sheet: "PRJ_Projects",
      Target_Column: "Owner",
      Field_Order: 6
    },
    // FORM_PRJ_AddTask
    {
      Pane: "Sub_PRJ_Tasks",
      Form_Id: "FORM_PRJ_AddTask",
      Title_EN: "Add Task",
      Title_AR: "إضافة مهمة",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Details",
      Field_ID: "PRJ_Task_ID",
      Field_Label: "Task ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "PRJ_Tasks",
      Target_Column: "Task_ID",
      Field_Order: 1,
      Placeholder: "TASK-001"
    },
    {
      Pane: "Sub_PRJ_Tasks",
      Form_Id: "FORM_PRJ_AddTask",
      Title_EN: "Add Task",
      Title_AR: "إضافة مهمة",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Details",
      Field_ID: "PRJ_Task_Project",
      Field_Label: "Project ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "PRJ_Tasks",
      Target_Column: "Project_ID",
      Field_Order: 2
    },
    {
      Pane: "Sub_PRJ_Tasks",
      Form_Id: "FORM_PRJ_AddTask",
      Title_EN: "Add Task",
      Title_AR: "إضافة مهمة",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Details",
      Field_ID: "PRJ_Task_Name",
      Field_Label: "Task Name",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "PRJ_Tasks",
      Target_Column: "Task_Name",
      Field_Order: 3
    },
    {
      Pane: "Sub_PRJ_Tasks",
      Form_Id: "FORM_PRJ_AddTask",
      Title_EN: "Add Task",
      Title_AR: "إضافة مهمة",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Assignment",
      Field_ID: "PRJ_Task_Assignee",
      Field_Label: "Assignee",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Departments",
      Target_Sheet: "PRJ_Tasks",
      Target_Column: "Assignee",
      Field_Order: 4
    },
    {
      Pane: "Sub_PRJ_Tasks",
      Form_Id: "FORM_PRJ_AddTask",
      Title_EN: "Add Task",
      Title_AR: "إضافة مهمة",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Assignment",
      Field_ID: "PRJ_Task_Status",
      Field_Label: "Status",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Task_Status",
      Target_Sheet: "PRJ_Tasks",
      Target_Column: "Status",
      Field_Order: 5
    },
    {
      Pane: "Sub_PRJ_Tasks",
      Form_Id: "FORM_PRJ_AddTask",
      Title_EN: "Add Task",
      Title_AR: "إضافة مهمة",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_PRJ_Management",
      Tab_Name: "Projects",
      Section_Header: "Assignment",
      Field_ID: "PRJ_Task_Due",
      Field_Label: "Due Date",
      Field_Type: "Date",
      Target_Sheet: "PRJ_Tasks",
      Target_Column: "Due_Date",
      Field_Order: 6
    },
    // FORM_FIN_AddDirectExpense
    {
      Pane: "Sub_FIN_Direct",
      Form_Id: "FORM_FIN_AddDirectExpense",
      Title_EN: "Add Direct Expense",
      Title_AR: "إضافة مصروف مباشر",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Details",
      Field_ID: "FIN_Expense_ID",
      Field_Label: "Expense ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "FIN_DirectExpenses",
      Target_Column: "Expense_ID",
      Field_Order: 1,
      Placeholder: "EXP-001"
    },
    {
      Pane: "Sub_FIN_Direct",
      Form_Id: "FORM_FIN_AddDirectExpense",
      Title_EN: "Add Direct Expense",
      Title_AR: "إضافة مصروف مباشر",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Details",
      Field_ID: "FIN_Expense_Project",
      Field_Label: "Project ID",
      Field_Type: "Text",
      Target_Sheet: "FIN_DirectExpenses",
      Target_Column: "Project_ID",
      Field_Order: 2
    },
    {
      Pane: "Sub_FIN_Direct",
      Form_Id: "FORM_FIN_AddDirectExpense",
      Title_EN: "Add Direct Expense",
      Title_AR: "إضافة مصروف مباشر",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Details",
      Field_ID: "FIN_Expense_Date",
      Field_Label: "Date",
      Field_Type: "Date",
      Mandatory: "Yes",
      Target_Sheet: "FIN_DirectExpenses",
      Target_Column: "Date",
      Field_Order: 3
    },
    {
      Pane: "Sub_FIN_Direct",
      Form_Id: "FORM_FIN_AddDirectExpense",
      Title_EN: "Add Direct Expense",
      Title_AR: "إضافة مصروف مباشر",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Costs",
      Field_ID: "FIN_Expense_Category",
      Field_Label: "Category",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Expense_Category",
      Mandatory: "Yes",
      Target_Sheet: "FIN_DirectExpenses",
      Target_Column: "Category",
      Field_Order: 4
    },
    {
      Pane: "Sub_FIN_Direct",
      Form_Id: "FORM_FIN_AddDirectExpense",
      Title_EN: "Add Direct Expense",
      Title_AR: "إضافة مصروف مباشر",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Costs",
      Field_ID: "FIN_Expense_Amount",
      Field_Label: "Amount",
      Field_Type: "Number",
      Mandatory: "Yes",
      Target_Sheet: "FIN_DirectExpenses",
      Target_Column: "Amount",
      Field_Order: 5
    },
    {
      Pane: "Sub_FIN_Direct",
      Form_Id: "FORM_FIN_AddDirectExpense",
      Title_EN: "Add Direct Expense",
      Title_AR: "إضافة مصروف مباشر",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Notes",
      Field_ID: "FIN_Expense_Notes",
      Field_Label: "Notes",
      Field_Type: "Paragraph",
      Target_Sheet: "FIN_DirectExpenses",
      Target_Column: "Notes",
      Field_Order: 6
    },
    // FORM_FIN_AddRevenue
    {
      Pane: "Sub_FIN_Revenue",
      Form_Id: "FORM_FIN_AddRevenue",
      Title_EN: "Log Revenue",
      Title_AR: "تسجيل إيراد",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Details",
      Field_ID: "FIN_Revenue_ID",
      Field_Label: "Revenue ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "FIN_Revenues",
      Target_Column: "Revenue_ID",
      Field_Order: 1,
      Placeholder: "REV-001"
    },
    {
      Pane: "Sub_FIN_Revenue",
      Form_Id: "FORM_FIN_AddRevenue",
      Title_EN: "Log Revenue",
      Title_AR: "تسجيل إيراد",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Details",
      Field_ID: "FIN_Revenue_Project",
      Field_Label: "Project ID",
      Field_Type: "Text",
      Target_Sheet: "FIN_Revenues",
      Target_Column: "Project_ID",
      Field_Order: 2
    },
    {
      Pane: "Sub_FIN_Revenue",
      Form_Id: "FORM_FIN_AddRevenue",
      Title_EN: "Log Revenue",
      Title_AR: "تسجيل إيراد",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Details",
      Field_ID: "FIN_Revenue_Date",
      Field_Label: "Date",
      Field_Type: "Date",
      Target_Sheet: "FIN_Revenues",
      Target_Column: "Date",
      Field_Order: 3
    },
    {
      Pane: "Sub_FIN_Revenue",
      Form_Id: "FORM_FIN_AddRevenue",
      Title_EN: "Log Revenue",
      Title_AR: "تسجيل إيراد",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Amount",
      Field_ID: "FIN_Revenue_Amount",
      Field_Label: "Amount",
      Field_Type: "Number",
      Mandatory: "Yes",
      Target_Sheet: "FIN_Revenues",
      Target_Column: "Amount",
      Field_Order: 4
    },
    {
      Pane: "Sub_FIN_Revenue",
      Form_Id: "FORM_FIN_AddRevenue",
      Title_EN: "Log Revenue",
      Title_AR: "تسجيل إيراد",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_FIN_Management",
      Tab_Name: "Finance",
      Section_Header: "Notes",
      Field_ID: "FIN_Revenue_Notes",
      Field_Label: "Notes",
      Field_Type: "Paragraph",
      Target_Sheet: "FIN_Revenues",
      Target_Column: "Notes",
      Field_Order: 5
    },
    // FORM_HR_AddEmployee
    {
      Pane: "Sub_HR_Employees",
      Form_Id: "FORM_HR_AddEmployee",
      Title_EN: "Add Employee",
      Title_AR: "إضافة موظف",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Profile",
      Field_ID: "HR_Employee_ID",
      Field_Label: "Employee ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "HR_Employees",
      Target_Column: "Employee_ID",
      Field_Order: 1,
      Placeholder: "EMP-001"
    },
    {
      Pane: "Sub_HR_Employees",
      Form_Id: "FORM_HR_AddEmployee",
      Title_EN: "Add Employee",
      Title_AR: "إضافة موظف",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Profile",
      Field_ID: "HR_Full_Name",
      Field_Label: "Full Name",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "HR_Employees",
      Target_Column: "Full_Name",
      Field_Order: 2
    },
    {
      Pane: "Sub_HR_Employees",
      Form_Id: "FORM_HR_AddEmployee",
      Title_EN: "Add Employee",
      Title_AR: "إضافة موظف",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Assignment",
      Field_ID: "HR_Department",
      Field_Label: "Department",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Departments",
      Mandatory: "Yes",
      Target_Sheet: "HR_Employees",
      Target_Column: "Department",
      Field_Order: 3
    },
    {
      Pane: "Sub_HR_Employees",
      Form_Id: "FORM_HR_AddEmployee",
      Title_EN: "Add Employee",
      Title_AR: "إضافة موظف",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Assignment",
      Field_ID: "HR_Role",
      Field_Label: "Role",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Roles",
      Mandatory: "Yes",
      Target_Sheet: "HR_Employees",
      Target_Column: "Role",
      Field_Order: 4
    },
    {
      Pane: "Sub_HR_Employees",
      Form_Id: "FORM_HR_AddEmployee",
      Title_EN: "Add Employee",
      Title_AR: "إضافة موظف",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Status",
      Field_ID: "HR_Hire_Date",
      Field_Label: "Hire Date",
      Field_Type: "Date",
      Target_Sheet: "HR_Employees",
      Target_Column: "Hire_Date",
      Field_Order: 5
    },
    {
      Pane: "Sub_HR_Employees",
      Form_Id: "FORM_HR_AddEmployee",
      Title_EN: "Add Employee",
      Title_AR: "إضافة موظف",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Status",
      Field_ID: "HR_Status",
      Field_Label: "Status",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Employment_Status",
      Target_Sheet: "HR_Employees",
      Target_Column: "Status",
      Field_Order: 6
    },
    // FORM_HR_AddAttendance
    {
      Pane: "Sub_HR_Attendance",
      Form_Id: "FORM_HR_AddAttendance",
      Title_EN: "Log Attendance",
      Title_AR: "تسجيل الحضور",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Log",
      Field_ID: "HR_Att_Record",
      Field_Label: "Record ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "HR_Attendance",
      Target_Column: "Record_ID",
      Field_Order: 1,
      Placeholder: "ATT-001"
    },
    {
      Pane: "Sub_HR_Attendance",
      Form_Id: "FORM_HR_AddAttendance",
      Title_EN: "Log Attendance",
      Title_AR: "تسجيل الحضور",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Log",
      Field_ID: "HR_Att_Employee",
      Field_Label: "Employee ID",
      Field_Type: "Text",
      Mandatory: "Yes",
      Target_Sheet: "HR_Attendance",
      Target_Column: "Employee_ID",
      Field_Order: 2
    },
    {
      Pane: "Sub_HR_Attendance",
      Form_Id: "FORM_HR_AddAttendance",
      Title_EN: "Log Attendance",
      Title_AR: "تسجيل الحضور",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Log",
      Field_ID: "HR_Att_Date",
      Field_Label: "Date",
      Field_Type: "Date",
      Target_Sheet: "HR_Attendance",
      Target_Column: "Date",
      Field_Order: 3
    },
    {
      Pane: "Sub_HR_Attendance",
      Form_Id: "FORM_HR_AddAttendance",
      Title_EN: "Log Attendance",
      Title_AR: "تسجيل الحضور",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Log",
      Field_ID: "HR_Att_Status",
      Field_Label: "Status",
      Field_Type: "Dropdown",
      Dropdown_Key: "DD_Attendance_Status",
      Target_Sheet: "HR_Attendance",
      Target_Column: "Status",
      Field_Order: 4
    },
    {
      Pane: "Sub_HR_Attendance",
      Form_Id: "FORM_HR_AddAttendance",
      Title_EN: "Log Attendance",
      Title_AR: "تسجيل الحضور",
      Form_Type: "FORM",
      Is_Active: "Yes",
      Tab_ID: "Tab_HR_Management",
      Tab_Name: "HR",
      Section_Header: "Notes",
      Field_ID: "HR_Att_Notes",
      Field_Label: "Notes",
      Field_Type: "Paragraph",
      Target_Sheet: "HR_Attendance",
      Target_Column: "Notes",
      Field_Order: 5
    }
  ]);

  seedSheet(ss, "SYS_Dynamic_Forms", DYNAMIC_FORM_HEADERS, rows);
}

function seedDataSheets(ss) {
  seedSheet(ss, "SYS_Users", SYS_USERS_HEADERS, [
    ["USR-001", "Sara Alnahdi", "sara@nijjara.com", "Projects", "PROJECT_MANAGER", "Active", "2023-05-12", ""],
    ["USR-002", "Omar Hassan", "omar@nijjara.com", "Finance", "FINANCE", "Active", "2022-11-01", "Finance lead"]
  ]);

  seedSheet(ss, "PRJ_Projects", PROJECT_HEADERS, [
    ["PRJ-001", "Headquarters Renovation", "City Holdings", "Planning", "2024-01-10", "Sara Alnahdi"],
    ["PRJ-002", "Retail Expansion", "Urban Group", "In Progress", "2023-09-01", "Omar Hassan"]
  ]);

  seedSheet(ss, "PRJ_Tasks", TASK_HEADERS, [
    ["TASK-001", "PRJ-001", "Gather requirements", "Projects", "In Progress", "2024-02-15"],
    ["TASK-002", "PRJ-002", "Finalize store layout", "Projects", "Not Started", "2024-03-01"]
  ]);

  seedSheet(ss, "FIN_DirectExpenses", DIRECT_EXPENSE_HEADERS, [
    ["EXP-001", "PRJ-001", "2024-01-12", "Materials", 32500, "Initial equipment purchase"],
    ["EXP-002", "PRJ-002", "2023-12-20", "Labor", 14800, "Contractor payment"]
  ]);

  seedSheet(ss, "FIN_Revenues", REVENUE_HEADERS, [
    ["REV-001", "PRJ-001", "2024-01-25", 54000, "Client initial payment"],
    ["REV-002", "PRJ-002", "2023-12-30", 22000, "Progress billing"]
  ]);

  seedSheet(ss, "HR_Employees", HR_EMPLOYEE_HEADERS, [
    ["EMP-001", "Laila Saleh", "Projects", "Project Coordinator", "2022-06-05", "Active"],
    ["EMP-002", "Hisham Ali", "HR", "HR Specialist", "2021-03-11", "On Leave"]
  ]);

  seedSheet(ss, "HR_Attendance", HR_ATTENDANCE_HEADERS, [
    ["ATT-001", "EMP-001", "2024-01-08", "Present", ""],
    ["ATT-002", "EMP-002", "2024-01-08", "Absent", "Annual leave"]
  ]);
}

function seedSheet(ss, name, headers, rows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  } else {
    sheet.clearContents();
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows && rows.length) {
    const normalized = rows.map((row) => padRow(row, headers.length));
    sheet.getRange(2, 1, normalized.length, headers.length).setValues(normalized);
  }
}

function padRow(row, length) {
  const copy = Array.isArray(row) ? row.slice(0, length) : [];
  while (copy.length < length) {
    copy.push("");
  }
  return copy;
}

function buildRows(headers, entries) {
  return entries.map((entry) =>
    headers.map((key) => (entry && Object.prototype.hasOwnProperty.call(entry, key) ? entry[key] : ""))
  );
}
