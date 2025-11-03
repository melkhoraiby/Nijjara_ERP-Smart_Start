/**
 * ===================================================================
 * Nijjara ERP (v2) - MIGRATION & ORGANIZATION SCRIPT (v3 - Robust)
 * ===================================================================
 * This script is for developer use only.
 * It does NOT delete any data.
 *
 * It performs two actions:
 * 1. FIX: Resets the 5 "Engine Sheets" (SYS_Users, SYS_Tab_Register, etc.)
 * using the correct CSV data to fix application errors.
 * 2. ORGANIZE: Re-orders all 70+ tabs into logical groups.
 *
 * TO RUN:
 * 1. Make sure you have enabled the "Drive API" in "Services +".
 * 2. Select the 'runMigrationAndSetup' function from the editor.
 * 3. Click "Run".
 * 4. Grant permissions (it will ask for Drive and Sheets).
 */

/**
 * This object maps the "Engine Sheets" to their source CSV files.
 * These 5 sheets WILL BE RESET to fix the app.
 */
const ENGINE_SHEETS_TO_RESET = Object.freeze({
  USERS: {
    csvName: "Nijjara_ERP-Smart_Start - SYS_Users.csv",
    sheetName: "SYS_Users",
  },
  TAB_REGISTER: {
    csvName: "Nijjara_ERP-Smart_Start - SYS_Tab_Register.csv",
    sheetName: "SYS_Tab_Register",
  },
  DYNAMIC_FORMS: {
    csvName: "Nijjara_ERP-Smart_Start - SYS_Dynamic_Forms.csv",
    sheetName: "SYS_Dynamic_Forms",
  },
  DROPDOWNS: {
    csvName: "Nijjara_ERP-Smart_Start - SYS_Dropdowns.csv",
    sheetName: "SYS_Dropdowns",
  },
  ROLE_PERMISSIONS: {
    csvName: "Nijjara_ERP-Smart_Start - SYS_Role_Permissions.csv",
    sheetName: "SYS_Role_Permissions",
  },
});

/**
 * ===================================================================
 * MAIN FUNCTION
 * ===================================================================
 * Run this single function to fix and organize the spreadsheet.
 */
function runMigrationAndSetup() {
  // Get the spreadsheet this script is bound to automatically.
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log(
    `Starting Nijjara ERP v2 Migration & Setup for: ${ss.getName()}...`
  );

  try {
    // --- PART 1: FIX THE 5 ENGINE SHEETS ---
    Logger.log("--- Phase 1: Resetting Core Engine Sheets ---");
    Object.keys(ENGINE_SHEETS_TO_RESET).forEach((key) => {
      const config = ENGINE_SHEETS_TO_RESET[key];
      populateSheetFromCSV_(ss, config.csvName, config.sheetName);
    });
    Logger.log("✅ SUCCESS: All 5 'Engine Sheets' have been fixed.");

    // --- PART 2: ORGANIZE ALL SHEETS ---
    Logger.log("--- Phase 2: Organizing All Sheet Tabs ---");
    organizeAllSheets(ss);
    Logger.log("✅ SUCCESS: All tabs have been re-ordered by module.");

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
 * Finds a CSV (or Google Sheet) by name, exports it as CSV,
 * parses it, and writes its data to a target sheet.
 */
function populateSheetFromCSV_(spreadsheet, csvFileName, sheetName) {
  if (!csvFileName || !sheetName) {
    throw new Error(
      "populateSheetFromCSV_: csvFileName and sheetName are required."
    );
  }

  Logger.log(`Populating: ${sheetName} from ${csvFileName}...`);

  // 1. Find the source file in your Google Drive
  const files = DriveApp.getFilesByName(csvFileName);
  if (!files.hasNext()) {
    throw new Error(
      `Critical Error: File "${csvFileName}" was not found in your Drive.`
    );
  }

  const file = files.next();
  const fileId = file.getId();

  // --- THIS IS THE FIX ---
  // Use Drive API (Advanced Service) to EXPORT the file as 'text/csv'
  // This works on both real CSVs and Google Sheets.
  const csvText = Drive.Files.export(fileId, "text/csv").getDataAsString();
  // --- END FIX ---

  const csvData = Utilities.parseCsv(csvText);

  if (!Array.isArray(csvData) || !csvData.length) {
    throw new Error(
      `CSV file '${csvFileName}' is empty or invalid after export.`
    );
  }

  // 2. Find the target sheet (or create it)
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(`Sheet "${sheetName}" not found. Creating it...`);
    sheet = spreadsheet.insertSheet(sheetName);
  }

  // 3. Clear the sheet and write new data
  sheet.clearContents();
  sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);

  SpreadsheetApp.flush();

  Logger.log(
    ` -> Successfully populated "${sheetName}" with ${csvData.length} rows.`
  );
}

/**
 * Re-orders all tabs in the spreadsheet by module prefix.
 */
function organizeAllSheets(ss) {
  const allSheets = ss.getSheets();
  let position = 1; // Start at the first tab position

  // Define the sort order
  const moduleOrder = ["SYS_", "PRJ_", "FIN_", "HR_", "PV_"];

  // Sort SYS sheets first
  allSheets.forEach((sheet) => {
    if (sheet.getName().startsWith("SYS_")) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(position);
      position++;
    }
  });

  // Sort PRJ sheets
  allSheets.forEach((sheet) => {
    if (sheet.getName().startsWith("PRJ_")) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(position);
      position++;
    }
  });

  // Sort FIN sheets
  allSheets.forEach((sheet) => {
    if (sheet.getName().startsWith("FIN_")) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(position);
      position++;
    }
  });

  // Sort HR sheets
  allSheets.forEach((sheet) => {
    if (sheet.getName().startsWith("HR_")) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(position);
      position++;
    }
  });

  // Sort PV (View) sheets
  allSheets.forEach((sheet) => {
    if (sheet.getName().startsWith("PV_")) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(position);
      position++;
    }
  });

  Logger.log("Sheet re-ordering complete.");
}
