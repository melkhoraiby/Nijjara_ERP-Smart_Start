if (typeof SPREADSHEET_ID === "undefined") {
  throw new Error(
    "Setup.js requires a global SPREADSHEET_ID constant (defined in Code.js)."
  );
}

const ENGINE_SHEETS = [
  {
    sheetName: "SYS_Users",
    fileId: "", // Optional: paste the Drive file ID for a guaranteed match
    sources: [
      "Nijjara_ERP-Smart_Start - SYS_Users.csv",
      "SYS_Users.csv",
      "SYS_Users",
    ],
  },
  {
    sheetName: "SYS_Tab_Register",
    fileId: "",
    sources: [
      "Nijjara_ERP-Smart_Start - SYS_Tab_Register.csv",
      "SYS_Tab_Register.csv",
      "SYS_Tab_Register",
    ],
  },
  {
    sheetName: "SYS_Dynamic_Forms",
    fileId: "",
    sources: [
      "Nijjara_ERP-Smart_Start - SYS_Dynamic_Forms.csv",
      "SYS_Dynamic_Forms.csv",
      "SYS_Dynamic_Forms",
    ],
  },
  {
    sheetName: "SYS_Dropdowns",
    fileId: "",
    sources: [
      "Nijjara_ERP-Smart_Start - SYS_Dropdowns.csv",
      "SYS_Dropdowns.csv",
      "SYS_Dropdowns",
    ],
  },
  {
    sheetName: "SYS_Role_Permissions",
    fileId: "",
    sources: [
      "Nijjara_ERP-Smart_Start - SYS_Role_Permissions.csv",
      "SYS_Role_Permissions.csv",
      "SYS_Role_Permissions",
    ],
  },
];

function runInitialSetup() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  ENGINE_SHEETS.forEach((config) => {
    populateSheetFromCSV_(spreadsheet, config);
  });
  SpreadsheetApp.flush();
}

function populateSheetFromCSV_(spreadsheet, sheetConfig) {
  if (!sheetConfig || !sheetConfig.sheetName) {
    throw new Error("populateSheetFromCSV_: sheet configuration is invalid.");
  }

  const { sheetName } = sheetConfig;
  if (!sheetName) {
    throw new Error("populateSheetFromCSV_: sheetName is required.");
  }

  const rows = getSourceRows_(spreadsheet, sheetConfig);
  if (!rows || !rows.length) {
    Logger.log(
      `populateSheetFromCSV_: No external data found for ${sheetName}. ` +
        "Leaving the sheet untouched."
    );
    return;
  }

  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}

function getSourceRows_(spreadsheet, sheetConfig) {
  const {
    fileId = "",
    sources = [],
    sheetName = "Unknown Sheet",
  } = sheetConfig || {};
  const seen = new Set();
  const inspectedNames = [];
  let attemptCount = 0;

  const sourceList = Array.isArray(sources) ? sources.slice() : [];

  // Pass 1: try to read from local tabs within the current spreadsheet.
  for (let i = 0; i < sourceList.length; i++) {
    const rawName = (sourceList[i] || "").trim();
    if (!rawName || seen.has(rawName)) continue;
    seen.add(rawName);
    inspectedNames.push(rawName);
    attemptCount++;

    const localRows = getRowsFromLocalSheet_(spreadsheet, rawName, sheetName);
    if (localRows && localRows.length) {
      Logger.log(
        `populateSheetFromCSV_: Loaded data for ${sheetName} from local sheet tab "${rawName}".`
      );
      return localRows;
    }
  }

  // Pass 2: explicit fileId override (if provided).
  if (fileId) {
    const file = safeGetFileById_(fileId);
    if (file) {
      const rows = extractRowsFromFile_(file);
      if (rows && rows.length) {
        Logger.log(
          `populateSheetFromCSV_: Loaded data for ${sheetName} using fileId ${fileId}.`
        );
        return rows;
      }
      Logger.log(
        `populateSheetFromCSV_: FileId ${fileId} was found but contained no usable rows.`
      );
    } else {
      Logger.log(
        `populateSheetFromCSV_: FileId ${fileId} could not be opened. Falling back to name search.`
      );
    }
  }

  // Pass 3: look for separate Drive files by the same names.
  for (let i = 0; i < sourceList.length; i++) {
    const rawName = (sourceList[i] || "").trim();
    if (!rawName || seen.has(rawName)) continue;
    seen.add(rawName);
    inspectedNames.push(rawName);
    attemptCount++;
    const file = getFileHandleByName_(rawName);
    if (file) {
      const rows = extractRowsFromFile_(file);
      if (rows && rows.length) {
        Logger.log(
          `populateSheetFromCSV_: Loaded data for ${sheetName} from Drive item "${file.getName()}".`
        );
        return rows;
      }
      Logger.log(
        `populateSheetFromCSV_: Drive item "${file.getName()}" contained no usable rows.`
      );
    }

    if (rawName.toLowerCase().endsWith(".csv")) {
      const fallback = rawName.slice(0, -4).trim();
      if (fallback && !seen.has(fallback)) {
        seen.add(fallback);
        inspectedNames.push(fallback);
        const fallbackFile = getFileHandleByName_(fallback);
        if (fallbackFile) {
          const rows = extractRowsFromFile_(fallbackFile);
          if (rows && rows.length) {
            Logger.log(
              `populateSheetFromCSV_: Loaded data for ${sheetName} from fallback Drive item "${fallbackFile.getName()}".`
            );
            return rows;
          }
          Logger.log(
            `populateSheetFromCSV_: Fallback Drive item "${fallbackFile.getName()}" contained no usable rows.`
          );
        }
      }
    }
  }

  if (!attemptCount) {
    Logger.log(
      `populateSheetFromCSV_: No candidates provided for ${sheetName}. Please supply a fileId or at least one candidate name.`
    );
  } else {
    Logger.log(
      `populateSheetFromCSV_: Attempted candidates for ${sheetName}: ${inspectedNames.join(
        ", "
      )}`
    );
  }

  return null;
}

function getFileHandleByName_(name) {
  const exact = DriveApp.getFilesByName(name);
  if (exact.hasNext()) {
    return exact.next();
  }

  const escaped = name.replace(/'/g, "\\'");
  const searchQuery = `title contains '${escaped}' and trashed = false`;
  const search = DriveApp.searchFiles(searchQuery);
  if (search.hasNext()) {
    return search.next();
  }

  return null;
}

function extractRowsFromFile_(file) {
  const mimeType = file.getMimeType();
  if (mimeType === MimeType.GOOGLE_SHEETS) {
    const ss = SpreadsheetApp.openById(file.getId());
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const range = sheet ? sheet.getDataRange() : null;
      const values = range ? range.getValues() : null;
      const normalized = normalizeRows_(values);
      if (normalized && normalized.length) {
        return normalized;
      }
    }
    return null;
  }

  const blob = file.getBlob();
  const csvRows = Utilities.parseCsv(blob.getDataAsString());
  return normalizeRows_(csvRows);
}

function normalizeRows_(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const maxColumns = rows.reduce(
    (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
    0
  );
  if (maxColumns === 0) return null;
  return rows.map((row) => {
    const source = Array.isArray(row) ? row : [row];
    if (source.length === maxColumns) return source;
    const copy = source.slice(0, maxColumns);
    while (copy.length < maxColumns) copy.push("");
    return copy;
  });
}

function getRowsFromLocalSheet_(spreadsheet, sourceTabName, targetSheetName) {
  if (!sourceTabName || sourceTabName === targetSheetName) return null;
  const sourceSheet = spreadsheet.getSheetByName(sourceTabName);
  if (!sourceSheet) return null;
  const range = sourceSheet.getDataRange();
  if (!range) return null;
  const values = range.getValues();
  return normalizeRows_(values);
}

function safeGetFileById_(fileId) {
  if (!fileId) return null;
  try {
    return DriveApp.getFileById(fileId);
  } catch (err) {
    Logger.log(
      `populateSheetFromCSV_: Unable to open file with ID ${fileId}. ${err}`
    );
    return null;
  }
}
