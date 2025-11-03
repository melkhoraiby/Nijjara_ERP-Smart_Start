## 📘 Bilingual Schema (English + Arabic)

Each table below lists the field names in English and Arabic. You can use this for UI localization, documentation, or form generation.

### ➊ SYS_Users

| English Field | Arabic Translation |
| ------------- | ------------------ |
| User_Id       | معرف المستخدم      |
| Full_Name     | الاسم الكامل       |
| Username      | اسم المستخدم       |
| Email         | البريد الإلكتروني  |
| Job_Title     | المسمى الوظيفي     |
| Department    | القسم              |
| Role_Id       | معرف الدور         |
| IsActive      | نشط                |
| Password_Hash | تجزئة كلمة المرور  |
| Last_Login    | آخر تسجيل دخول     |
| Created_At    | تاريخ الإنشاء      |
| Created_By    | أنشئ بواسطة        |
| Updated_At    | تاريخ التحديث      |
| Updated_By    | تم التحديث بواسطة  |

---

### ➋ SYS_Tab_Register

| English Field  | Arabic Translation      |
| -------------- | ----------------------- |
| Record_Type    | نوع السجل (TAB أو SUB)  |
| Tab_ID         | معرف التبويب            |
| Tab_Label_EN   | عنوان التبويب (إنجليزي) |
| Tab_Label_AR   | عنوان التبويب (عربي)    |
| Sub_ID         | معرف الفرعي             |
| Sub_Label_EN   | عنوان الفرعي (إنجليزي)  |
| Sub_Label_AR   | عنوان الفرعي (عربي)     |
| Route          | المسار                  |
| Sort_Order     | ترتيب العرض             |
| Source_Sheet   | ورقة المصدر             |
| Render_Mode    | وضع العرض               |
| Add_Form_ID    | معرف نموذج الإضافة      |
| Edit_Form_ID   | معرف نموذج التعديل      |
| View_Label     | عنوان العرض             |
| Add_Label      | عنوان الإضافة           |
| Permissions    | الصلاحيات               |
| Search_Bar     | شريط البحث              |
| Filter_Options | خيارات التصفية          |

---

### ➌ SYS_Dynamic_Forms

| English Field  | Arabic Translation     |
| -------------- | ---------------------- |
| Form_ID        | معرف النموذج           |
| Form_Title     | عنوان النموذج          |
| Tab_ID         | معرف التبويب           |
| Tab_Name       | اسم التبويب            |
| Section_Header | عنوان القسم            |
| Field_ID       | معرف الحقل             |
| Field_Label    | عنوان الحقل            |
| Field_Type     | نوع الحقل              |
| Source_Sheet   | ورقة المصدر            |
| Source_Range   | نطاق المصدر            |
| Mandatory      | إلزامي                 |
| Default_Value  | القيمة الافتراضية      |
| Dropdown_Key   | مفتاح القائمة المنسدلة |
| Target_Sheet   | ورقة الهدف             |
| Target_Column  | عمود الهدف             |
| Role_ID        | معرف الدور             |
| Show           | عرض                    |
| Quick_Actions  | إجراءات سريعة          |
| Pane           | اللوحة                 |
| Field_Order    | ترتيب الحقول           |
| Help_Text      | نص المساعدة            |
| Placeholder    | نص افتراضي             |

---

### ➍ SYS_Dropdowns

| English Field | Arabic Translation |
| ------------- | ------------------ |
| Key           | المفتاح            |
| English_Title | العنوان (إنجليزي)  |
| Arabic_Title  | العنوان (عربي)     |
| Is_Active     | نشط                |
| Sort_Order    | ترتيب العرض        |
| Value         | القيمة             |
| Group         | المجموعة           |

---

### ➎ SYS_Role_Permissions

| English Field  | Arabic Translation |
| -------------- | ------------------ |
| Role_Id        | معرف الدور         |
| Permission_Key | مفتاح الصلاحية     |
| Scope          | النطاق             |
| Allowed        | مسموح              |
| Constraints    | القيود             |
| Created_At     | تاريخ الإنشاء      |
| Created_By     | أنشئ بواسطة        |
| Updated_At     | تاريخ التحديث      |
| Updated_By     | تم التحديث بواسطة  |

---

### ➏ Supporting System Sheets

| Sheet Name      | Fields                                                                             |
| --------------- | ---------------------------------------------------------------------------------- |
| SYS_Sessions    | Session_Id, User_Id, Actor_Email, Type, Status, Started_At, Created_At, Created_By |
| SYS_Audit_Log   | Timestamp, User, Action, Details, Entity, Entity_Id                                |
| SYS_Roles       | Role_Id, Role_Title, Description                                                   |
| SYS_Permissions | Permission_Key, Permission_Label, Description, Category                            |
| SYS_Settings    | Setting_Key, Setting_Value                                                         |

---

## 🧩 JSON Blueprint

Here’s a structured JSON blueprint for your engine to consume or validate:

```json
{
  "SYS_Users": [
    "User_Id",
    "Full_Name",
    "Username",
    "Email",
    "Job_Title",
    "Department",
    "Role_Id",
    "IsActive",
    "Password_Hash",
    "Last_Login",
    "Created_At",
    "Created_By",
    "Updated_At",
    "Updated_By"
  ],
  "SYS_Tab_Register": [
    "Record_Type",
    "Tab_ID",
    "Tab_Label_EN",
    "Tab_Label_AR",
    "Sub_ID",
    "Sub_Label_EN",
    "Sub_Label_AR",
    "Route",
    "Sort_Order",
    "Source_Sheet",
    "Render_Mode",
    "Add_Form_ID",
    "Edit_Form_ID",
    "View_Label",
    "Add_Label",
    "Permissions",
    "Search_Bar",
    "Filter_Options"
  ],
  "SYS_Dynamic_Forms": [
    "Form_ID",
    "Form_Title",
    "Tab_ID",
    "Tab_Name",
    "Section_Header",
    "Field_ID",
    "Field_Label",
    "Field_Type",
    "Source_Sheet",
    "Source_Range",
    "Mandatory",
    "Default_Value",
    "Dropdown_Key",
    "Target_Sheet",
    "Target_Column",
    "Role_ID",
    "Show",
    "Quick_Actions",
    "Pane",
    "Field_Order",
    "Help_Text",
    "Placeholder"
  ],
  "SYS_Dropdowns": [
    "Key",
    "English_Title",
    "Arabic_Title",
    "Is_Active",
    "Sort_Order",
    "Value",
    "Group"
  ],
  "SYS_Role_Permissions": [
    "Role_Id",
    "Permission_Key",
    "Scope",
    "Allowed",
    "Constraints",
    "Created_At",
    "Created_By",
    "Updated_At",
    "Updated_By"
  ],
  "SYS_Sessions": [
    "Session_Id",
    "User_Id",
    "Actor_Email",
    "Type",
    "Status",
    "Started_At",
    "Created_At",
    "Created_By"
  ],
  "SYS_Audit_Log": [
    "Timestamp",
    "User",
    "Action",
    "Details",
    "Entity",
    "Entity_Id"
  ],
  "SYS_Roles": ["Role_Id", "Role_Title", "Description"],
  "SYS_Permissions": [
    "Permission_Key",
    "Permission_Label",
    "Description",
    "Category"
  ],
  "SYS_Settings": ["Setting_Key", "Setting_Value"]
}
```

---
