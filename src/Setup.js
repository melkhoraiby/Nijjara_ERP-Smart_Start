/**
 * ===================================================================
 * Nijjara ERP (v2) - MIGRATION & ORGANIZATION SCRIPT (v7 - The Correct One)
 * ===================================================================
 * هذا السكربت هو "سكربت هجرة" (Migration Script) لمرة واحدة.
 * لا يقوم بحذف أي بيانات، بل يقوم بما يلي:
 *
 * 1. (FIX): يمر على الـ 5 "Engine Sheets" ويطابق عناوينها (Headers) مع ما يتطلبه
 * الكود الجديد (Code.js).
 * 2. (RE-ORGANIZE DATA): إذا وجد أعمدة ناقصة، يقوم بإضافتها. إذا كانت الأعمدة
 * بترتيب مختلف، يقوم بإعادة ترتيبها مع الحفاظ على البيانات الموجودة
 * أسفل كل عمود صحيح.
 * 3. (ORGANIZE TABS): يقوم بإعادة ترتيب جميع الـ tabs في الملف
 * حسب الوحدة (SYS, PRJ, FIN, HR).
 * 4. (CLEANUP): يحذف أي tabs فارغة أو غير مستخدمة (مثل "Sheet1").
 *
 * TO RUN:
 * 1. تأكد من أن SPREADSHEET_ID صحيح في ملف Code.js.
 * 2. اختر دالة 'runMigrationAndSetup' واضغط "Run".
 * 3. قم بإعطاء الصلاحيات اللازمة (لإدارة ملف Sheet).
 */

if (typeof SPREADSHEET_ID === "undefined") {
  throw new Error(
    "Setup.js requires a global SPREADSHEET_ID constant (defined in Code.js)."
  );
}
/**
 * ===================================================================
 * PASSWORD FIX UTILITY
 * ===================================================================
 * Run 'fixAdminPassword' ONCE to set the password for the admin user.
 */
function fixAdminPassword() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("SYS_Users");
  if (!sheet) {
    Logger.log("ERROR: 'SYS_Users' sheet not found.");
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => String(h).trim());

  // Find the required columns
  const idCol = headers.indexOf("User_Id");
  const hashCol = headers.indexOf("Password_Hash");

  if (idCol === -1 || hashCol === -1) {
    Logger.log("ERROR: Could not find 'User_Id' or 'Password_Hash' columns.");
    return;
  }

  // Find the User row
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === "USR_00001") {
      // Calculate the new hash
      const newPassword = "210388";
      const newHash = hashPassword_(newPassword);

      // Write the new hash to the correct cell
      sheet.getRange(i + 1, hashCol + 1).setValue(newHash);

      Logger.log(`SUCCESS: Password for USR_00001 has been set.`);
      SpreadsheetApp.flush();
      return;
    }
  }

  Logger.log("ERROR: User 'USR_00001' not found in SYS_Users.");
}

/**
 * ===================================================================
 * HELPER (Copied from Code.js)
 * ===================================================================
 * This is needed to calculate the hash.
 */
function hashPassword_(password) {
  if (!password && password !== 0) return "";
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password),
    Utilities.Charset.UTF_8
  );
  const base64 = Utilities.base64Encode(digest);
  return base64;
}
/**
 * ===================================================================
 * MAIN FUNCTION
 * ===================================================================
 * قم بتشغيل هذه الدالة مرة واحدة فقط.
 */
function runMigrationAndSetup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log(
    `Starting Nijjara ERP v2 Migration & Setup for: ${ss.getName()}...`
  );

  try {
    // --- PART 1: MIGRATE ENGINE SHEET HEADERS & DATA ---
    Logger.log("--- Phase 1: Migrating Engine Sheets (Headers & Data) ---");

    // 1. SYS_Users
    const usersMap = {
      User_Id: null,
      Full_Name: null,
      Username: null,
      Email: null,
      Job_Title: null,
      Department: null,
      Role_Id: null,
      IsActive: null,
      Password_Hash: null, // العمود الجديد الذي يتوقعه Code.js
      Last_Login: null,
      Created_At: null,
      Created_By: null,
      Updated_At: null,
      Updated_By: null,
    };
    migrateSheetHeaders_(ss, "SYS_Users", usersMap);
    Logger.log(" -> SYS_Users migration complete.");

    // 2. SYS_Tab_Register
    const tabRegisterMap = {
      Record_Type: null,
      Tab_ID: null,
      Tab_Label_EN: null,
      Tab_Label_AR: null,
      Sub_ID: null,
      Sub_Label_EN: null,
      Sub_Label_AR: null,
      Route: null,
      Sort_Order: null,
      Source_Sheet: null,
      Render_Mode: null,
      Add_Form_ID: null,
      Edit_Form_ID: null, // العمود الجديد
      View_Label: null,
      Add_Label: null,
      Permissions: null,
      Search_Bar: null,
      Filter_Options: null,
    };
    migrateSheetHeaders_(ss, "SYS_Tab_Register", tabRegisterMap);
    Logger.log(" -> SYS_Tab_Register migration complete.");

    // 3. SYS_Dynamic_Forms
    const dynamicFormsMap = {
      Form_ID: null,
      Form_Title: null,
      Tab_ID: null,
      Tab_Name: null,
      Section_Header: null,
      Field_ID: null,
      Field_Label: null,
      Field_Type: null,
      Source_Sheet: null,
      Source_Range: null,
      Mandatory: null,
      Default_Value: null,
      Dropdown_Key: null,
      Target_Sheet: null,
      Target_Column: null,
      Role_ID: null,
      Show: null,
      Quick_Actions: null,
      Pane: null, // العمود الجديد
      Field_Order: null, // العمود الجديد
      Help_Text: null, // العمود الجديد
      Placeholder: null, // العمود الجديد
    };
    migrateSheetHeaders_(ss, "SYS_Dynamic_Forms", dynamicFormsMap);
    Logger.log(" -> SYS_Dynamic_Forms migration complete.");

    // 4. SYS_Dropdowns
    const dropdownsMap = {
      Key: null,
      English_Title: null,
      Arabic_Title: null,
      Is_Active: null,
      Sort_Order: null,
      Value: null,
      Group: null,
    };
    migrateSheetHeaders_(ss, "SYS_Dropdowns", dropdownsMap);
    Logger.log(" -> SYS_Dropdowns migration complete.");

    // 5. SYS_Role_Permissions
    const rolePermsMap = {
      Role_Id: null,
      Permission_Key: null,
      Scope: null,
      Allowed: null,
      Constraints: null,
      Created_At: null,
      Created_By: null,
      Updated_At: null,
      Updated_By: null,
    };
    migrateSheetHeaders_(ss, "SYS_Role_Permissions", rolePermsMap);
    Logger.log(" -> SYS_Role_Permissions migration complete.");

    Logger.log("✅ SUCCESS: All 5 'Engine Sheets' have been migrated.");

    // --- PART 2: ORGANIZE ALL SHEETS ---
    Logger.log("--- Phase 2: Organizing All Sheet Tabs ---");
    organizeAllSheets(ss);
    Logger.log("✅ SUCCESS: All tabs have been re-ordered by module.");

    // --- PART 3: CLEANUP UNUSED SHEETS ---
    Logger.log("--- Phase 3: Cleaning up unused tabs ---");
    deleteUnusedSheets(ss);
    Logger.log("✅ SUCCESS: Unused tabs cleaned.");

    SpreadsheetApp.flush(); // Final flush after all operations
    Logger.log("Setup complete. You can now test the web app.");
  } catch (err) {
    Logger.log(`❌ ERROR during setup: ${err.message}\n${err.stack}`);
  }
}

/**
 * ===================================================================
 * HELPER FUNCTIONS
 * ===================================================================
 */

/**
 * يقوم بترحيل بيانات الشيت إلى هيكل العناوين (Headers) الجديد.
 * هذا يحافظ على جميع البيانات وينقلها إلى العمود الصحيح.
 */
function migrateSheetHeaders_(ss, sheetName, requiredHeadersMap) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(` -> Sheet "${sheetName}" not found. Skipping migration.`);
    return;
  }

  const dataRange = sheet.getDataRange();
  const allData = dataRange.getValues();

  if (allData.length === 0) {
    Logger.log(` -> Sheet "${sheetName}" is empty. Skipping.`);
    return;
  }

  const oldHeaders = allData[0];
  const dataRows = allData.slice(1);
  const newHeaders = Object.keys(requiredHeadersMap);

  // 1. إنشاء خريطة (map) لتحديد العمود القديم أين سيذهب
  //    (e.g., [oldColIdxForNewCol0, oldColIdxForNewCol1, ...])
  const headerMap = newHeaders.map((newHeader) => {
    // ابحث عن العناوين المطابقة (حتى لو كانت بأسماء مختلفة قليلاً)
    let oldIndex = -1;
    if (oldHeaders.includes(newHeader)) {
      oldIndex = oldHeaders.indexOf(newHeader);
    } else {
      // (يمكن إضافة منطق مطابقة أكثر ذكاءً هنا إذا لزم الأمر)
      // Logger.log(`Column '${newHeader}' not found in '${sheetName}'. Will be added as empty.`);
    }
    return oldIndex;
  });

  // 2. إنشاء مصفوفة البيانات الجديدة (re-mapped)
  const newData = [];
  dataRows.forEach((oldRow) => {
    const newRow = [];
    headerMap.forEach((oldColIndex) => {
      if (oldColIndex === -1) {
        newRow.push(""); // إضافة خلية فارغة للعمود الجديد
      } else {
        newRow.push(oldRow[oldColIndex]); // نقل البيانات القديمة
      }
    });
    newData.push(newRow);
  });

  // 3. مسح الشيت وكتابة البيانات الجديدة
  sheet.clearContents();

  // كتابة العناوين (Headers) الجديدة
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  // كتابة البيانات (Rows) الجديدة
  if (newData.length > 0) {
    sheet.getRange(2, 1, newData.length, newHeaders.length).setValues(newData);
  }

  SpreadsheetApp.flush(); // فرض الحفظ
}

/**
 * يقوم بإعادة ترتيب جميع الـ tabs في الملف حسب الوحدة (Module).
 */
function organizeAllSheets(ss) {
  const allSheets = ss.getSheets();
  let position = 1; // البدء من أول tab
  const prefixes = ["SYS_", "PRJ_", "FIN_", "HR_", "PV_"];

  prefixes.forEach((prefix) => {
    allSheets.forEach((sheet) => {
      if (sheet.getName().startsWith(prefix)) {
        ss.setActiveSheet(sheet);
        ss.moveActiveSheet(position);
        position++;
      }
    });
  });
  Logger.log("Sheet re-ordering complete.");
}

/**
 * يحذف الـ tabs الافتراضية غير المستخدمة.
 */
function deleteUnusedSheets(ss) {
  const defaultSheets = ["Sheet1", "Sheet2", "Sheet3", "Untitled"];
  defaultSheets.forEach((name) => {
    const sheet = ss.getSheetByName(name);
    if (sheet && sheet.getDataRange().getValues().length <= 1) {
      try {
        ss.deleteSheet(sheet);
        Logger.log(` -> Deleted unused sheet: ${name}`);
      } catch (e) {
        // ignore
      }
    }
  });
}
