if (typeof SPREADSHEET_ID === "undefined") {
  throw new Error(
    "Setup.js requires the SPREADSHEET_ID constant defined in Code.js."
  );
}

/**
 * Map each engine sheet to the staging tab(s) that hold its seed data.
 * Provide explicit names where you know them; the loader will also try
 * common Seed/Source naming patterns automatically.
 */
const ENGINE_SHEETS = [
  {
    sheetName: "SYS_Users",
    sourceTabs: [
      "Seed_SYS_Users",
      "SYS_Users_Seed",
      "SYS_Users Source",
      "SYS_Users (Seed)",
    ],
  },
  {
    sheetName: "SYS_Tab_Register",
    sourceTabs: [
      "Seed_SYS_Tab_Register",
      "SYS_Tab_Register_Seed",
      "SYS_Tab_Register Source",
    ],
  },
  {
    sheetName: "SYS_Dynamic_Forms",
    sourceTabs: [
      "Seed_SYS_Dynamic_Forms",
      "SYS_Dynamic_Forms_Seed",
      "SYS_Dynamic_Forms Source",
    ],
  },
  {
    sheetName: "SYS_Dropdowns",
    sourceTabs: [
      "Seed_SYS_Dropdowns",
      "SYS_Dropdowns_Seed",
      "SYS_Dropdowns Source",
    ],
  },
  {
    sheetName: "SYS_Role_Permissions",
    sourceTabs: [
      "Seed_SYS_Role_Permissions",
      "SYS_Role_Permissions_Seed",
      "SYS_Role_Permissions Source",
    ],
  },
];

function runInitialSetup() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  ENGINE_SHEETS.forEach((config) => {
    hydrateEngineSheet_(spreadsheet, config);
  });
  SpreadsheetApp.flush();
}

function hydrateEngineSheet_(spreadsheet, config) {
  if (!config || !config.sheetName) {
    throw new Error(
      "hydrateEngineSheet_: sheet configuration must include sheetName."
    );
  }

  const targetSheetName = config.sheetName;
  const sourceSheet = resolveSourceSheet_(
    spreadsheet,
    targetSheetName,
    config.sourceTabs || []
  );

  if (!sourceSheet) {
    Logger.log(
      `hydrateEngineSheet_: Skipping ${targetSheetName} (no staging tab found).`
    );
    return;
  }

  const range = sourceSheet.getDataRange();
  if (!range) {
    Logger.log(
      `hydrateEngineSheet_: Staging tab ${sourceSheet.getName()} has no data.`
    );
    return;
  }

  const values = normalizeRows_(range.getValues());
  if (!values || !values.length) {
    Logger.log(
      `hydrateEngineSheet_: Staging tab ${sourceSheet.getName()} is empty.`
    );
    return;
  }

  let target = spreadsheet.getSheetByName(targetSheetName);
  if (!target) {
    target = spreadsheet.insertSheet(targetSheetName);
  }

  target.clearContents();
  target.getRange(1, 1, values.length, values[0].length).setValues(values);

  Logger.log(
    `hydrateEngineSheet_: Loaded ${values.length} row(s) into ${targetSheetName} from ${sourceSheet.getName()}.`
  );
}

function resolveSourceSheet_(spreadsheet, targetSheetName, explicitNames) {
  const normalizedTarget = normalizeName_(targetSheetName);
  const candidateNames = buildCandidateNames_(targetSheetName, explicitNames);

  // Pass 1: direct, case sensitive matches.
  for (let i = 0; i < candidateNames.length; i++) {
    const name = candidateNames[i];
    const sheet = spreadsheet.getSheetByName(name);
    if (isValidSourceSheet_(sheet, targetSheetName)) {
      return sheet;
    }
  }

  // Pass 2: normalized (case/spacing-insensitive) matches.
  const normalizedCandidates = candidateNames.map((name) =>
    normalizeName_(name)
  );
  const allSheets = spreadsheet.getSheets();
  for (let i = 0; i < allSheets.length; i++) {
    const sheet = allSheets[i];
    if (!isValidSourceSheet_(sheet, targetSheetName)) continue;
    const normalizedSheet = normalizeName_(sheet.getName());
    if (normalizedCandidates.indexOf(normalizedSheet) >= 0) {
      return sheet;
    }
  }

  // Pass 3: partial matches (the sheet name contains the target in some form).
  for (let i = 0; i < allSheets.length; i++) {
    const sheet = allSheets[i];
    if (!isValidSourceSheet_(sheet, targetSheetName)) continue;
    const normalizedSheet = normalizeName_(sheet.getName());
    if (
      normalizedSheet.indexOf(normalizedTarget) >= 0 &&
      normalizedSheet !== normalizedTarget
    ) {
      return sheet;
    }
  }

  Logger.log(
    `resolveSourceSheet_: No staging tab found for ${targetSheetName}. Checked candidates: ${candidateNames.join(
      ", "
    )}`
  );
  return null;
}

function buildCandidateNames_(sheetName, extraNames) {
  const unique = new Set();
  const add = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    if (!unique.has(trimmed)) {
      unique.add(trimmed);
    }
  };

  (extraNames || []).forEach(add);

  const base = sheetName;
  const baseNoPrefix = base.replace(/^SYS_/, "");

  add(`Seed_${base}`);
  add(`${base}_Seed`);
  add(`${base} Seed`);
  add(`${base} (Seed)`);
  add(`Source_${base}`);
  add(`${base}_Source`);
  add(`${base} Source`);
  add(`Staging_${base}`);
  add(`${base}_Staging`);

  if (baseNoPrefix && baseNoPrefix !== base) {
    add(`Seed_${baseNoPrefix}`);
    add(`${baseNoPrefix}_Seed`);
    add(`${baseNoPrefix} Seed`);
    add(`${baseNoPrefix} (Seed)`);
    add(`Source_${baseNoPrefix}`);
    add(`${baseNoPrefix}_Source`);
    add(`${baseNoPrefix} Source`);
    add(`Staging_${baseNoPrefix}`);
    add(`${baseNoPrefix}_Staging`);
  }

  return Array.from(unique);
}

function isValidSourceSheet_(sheet, targetSheetName) {
  if (!sheet) return false;
  if (sheet.getName() === targetSheetName) return false;
  if (sheet.isSheetHidden()) return false;
  const range = sheet.getDataRange();
  return !!(range && range.getNumRows() && range.getNumColumns());
}

function normalizeRows_(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const maxCols = rows.reduce(
    (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
    0
  );
  if (!maxCols) return null;
  return rows.map((row) => {
    const working = Array.isArray(row) ? row.slice() : [row];
    while (working.length < maxCols) {
      working.push("");
    }
    return working;
  });
}

function normalizeName_(name) {
  return (name || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
