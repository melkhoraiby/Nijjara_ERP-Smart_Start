const SPREADSHEET_ID = "1FTubSc1-RhoAGiRA6rMKw3wQ30NnSYi0fNHUcqzeTEw";

const ENGINE_SHEETS = [
  {
    sheetName: "SYS_Users",
    candidates: [
      "Nijjara_ERP-Smart_Start - SYS_Users.csv",
      "SYS_Users.csv",
      "SYS_Users",
    ],
  },
  {
    sheetName: "SYS_Tab_Register",
    candidates: [
      "Nijjara_ERP-Smart_Start - SYS_Tab_Register.csv",
      "SYS_Tab_Register.csv",
      "SYS_Tab_Register",
    ],
  },
  {
    sheetName: "SYS_Dynamic_Forms",
    candidates: [
      "Nijjara_ERP-Smart_Start - SYS_Dynamic_Forms.csv",
      "SYS_Dynamic_Forms.csv",
      "SYS_Dynamic_Forms",
    ],
  },
  {
    sheetName: "SYS_Dropdowns",
    candidates: [
      "Nijjara_ERP-Smart_Start - SYS_Dropdowns.csv",
      "SYS_Dropdowns.csv",
      "SYS_Dropdowns",
    ],
  },
  {
    sheetName: "SYS_Role_Permissions",
    candidates: [
      "Nijjara_ERP-Smart_Start - SYS_Role_Permissions.csv",
      "SYS_Role_Permissions.csv",
      "SYS_Role_Permissions",
    ],
  },
];

function runInitialSetup() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  ENGINE_SHEETS.forEach(({ sheetName, candidates }) => {
    populateSheetFromCSV_(spreadsheet, candidates, sheetName);
  });
  SpreadsheetApp.flush();
}

function populateSheetFromCSV_(spreadsheet, nameCandidates, sheetName) {
  if (!sheetName) {
    throw new Error("populateSheetFromCSV_: sheetName is required.");
  }

  const fileBlob = findFileBlob_(nameCandidates || []);
  if (!fileBlob) {
    throw new Error(
      `populateSheetFromCSV_: Could not locate a CSV/Sheet for ${sheetName}.`
    );
  }

  const csvRows = Utilities.parseCsv(fileBlob.getDataAsString());
  if (!Array.isArray(csvRows) || !csvRows.length) {
    throw new Error(
      `populateSheetFromCSV_: Source data for ${sheetName} is empty.`
    );
  }

  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  sheet.clearContents();
  sheet.getRange(1, 1, csvRows.length, csvRows[0].length).setValues(csvRows);
}

function findFileBlob_(nameCandidates) {
  const seen = new Set();
  const candidates = Array.isArray(nameCandidates) ? nameCandidates : [];

  for (let i = 0; i < candidates.length; i++) {
    const rawName = (candidates[i] || "").trim();
    if (!rawName || seen.has(rawName)) continue;
    seen.add(rawName);

    const file = getFileHandleByName_(rawName);
    if (file) {
      const mimeType = getFileMimeType_(file);
      if (mimeType === "application/vnd.google-apps.spreadsheet") {
        return Drive.Files.export(file.getId(), "text/csv");
      }
      return file.getBlob();
    }

    if (rawName.toLowerCase().endsWith(".csv")) {
      const fallback = rawName.slice(0, -4).trim();
      if (fallback && !seen.has(fallback)) {
        seen.add(fallback);
        const fallbackFile = getFileHandleByName_(fallback);
        if (fallbackFile) {
          const fallbackMime = getFileMimeType_(fallbackFile);
          if (fallbackMime === "application/vnd.google-apps.spreadsheet") {
            return Drive.Files.export(fallbackFile.getId(), "text/csv");
          }
          return fallbackFile.getBlob();
        }
      }
    }
  }

  return null;
}

function getFileHandleByName_(name) {
  const exact = DriveApp.getFilesByName(name);
  if (exact.hasNext()) {
    return exact.next();
  }

  const cleaned = name.replace(/'/g, "\\'");
  const list = Drive.Files.list({
    q: `name='${cleaned}' and trashed=false`,
    fields: "files(id,name,mimeType)",
    pageSize: 1,
  });
  if (list.files && list.files.length) {
    return DriveApp.getFileById(list.files[0].id);
  }

  const looseList = Drive.Files.list({
    q: `name contains '${cleaned}' and trashed=false`,
    fields: "files(id,name,mimeType)",
    pageSize: 1,
  });
  if (looseList.files && looseList.files.length) {
    return DriveApp.getFileById(looseList.files[0].id);
  }

  return null;
}

function getFileMimeType_(file) {
  try {
    const meta = Drive.Files.get(file.getId(), { fields: "mimeType" });
    if (meta && meta.mimeType) {
      return meta.mimeType;
    }
  } catch (err) {
    // ignore
  }
  return file.getMimeType();
}
