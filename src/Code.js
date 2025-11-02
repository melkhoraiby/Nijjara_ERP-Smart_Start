const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

const SHEET_ALIASES = Object.freeze({
  USERS: ["SYS_Users", "Users"],
  SESSIONS: ["SYS_Sessions", "Sessions"],
  TAB_REGISTER: ["SYS_Tab_Register"],
  TAB_SIMPLE: ["SYS_Tabs"],
  DYNAMIC_FORMS: ["SYS_Dynamic_Forms"],
  FORM_SIMPLE: ["SYS_Forms"],
  DROPDOWNS: ["SYS_Dropdowns"],
  ROLE_PERMISSIONS: ["SYS_Role_Permissions"],
  PERMISSIONS_SIMPLE: ["SYS_Permissions"]
});

const DEBUG_ENABLED = false;
let __spreadsheetCache;

function debugLog_(context, stage, payload) {
  if (!DEBUG_ENABLED) return;
  try {
    Logger.log(
      `[${context}] ${stage}: ${payload ? JSON.stringify(payload) : ""}`
    );
  } catch (err) {
    Logger.log(`[${context}] ${stage}`);
  }
}

function getSpreadsheet_() {
  if (!__spreadsheetCache) {
    __spreadsheetCache = SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return __spreadsheetCache;
}

function getSheetByAliases_(aliases) {
  const ss = getSpreadsheet_();
  const names = Array.isArray(aliases) ? aliases : [aliases];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (!name) continue;
    const sheet = ss.getSheetByName(name);
    if (sheet) return sheet;
  }
  return null;
}

function getSheetFlexible_(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  if (!trimmed) return null;
  const ss = getSpreadsheet_();
  const direct = ss.getSheetByName(trimmed);
  if (direct) return direct;
  const normalized = trimmed.replace(/\s+/g, "_");
  if (normalized !== trimmed) {
    const alt = ss.getSheetByName(normalized);
    if (alt) return alt;
  }
  return null;
}

function loadSheetData_(sheetRef) {
  let sheet = null;
  let sourceName = "";
  if (Array.isArray(sheetRef)) {
    sheet = getSheetByAliases_(sheetRef);
    sourceName = sheetRef[0] || "";
  } else if (SHEET_ALIASES[sheetRef]) {
    sheet = getSheetByAliases_(SHEET_ALIASES[sheetRef]);
    sourceName = SHEET_ALIASES[sheetRef][0] || "";
  } else {
    sheet = getSheetFlexible_(sheetRef);
    sourceName = sheetRef;
  }

  if (!sheet) {
    return { sheet: null, sourceName, headers: [], rows: [] };
  }

  const values = sheet.getDataRange().getValues();
  if (!values || !values.length) {
    return { sheet, sourceName: sheet.getName(), headers: [], rows: [] };
  }

  const headers = values[0].map((header) =>
    typeof header === "string" ? header.trim() : header
  );
  const rows = values.slice(1);
  return { sheet, sourceName: sheet.getName(), headers, rows };
}

function normalizeHeaderKey_(header) {
  return String(header || "")
    .trim()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^A-Z0-9_]/gi, "")
    .toUpperCase();
}

function findHeaderIndex_(headers, ...aliases) {
  if (!Array.isArray(headers) || !headers.length) return -1;
  const normalizedHeaders = headers.map((header) => normalizeHeaderKey_(header));
  for (let i = 0; i < aliases.length; i++) {
    const alias = normalizeHeaderKey_(aliases[i]);
    if (!alias) continue;
    const index = normalizedHeaders.indexOf(alias);
    if (index >= 0) return index;
  }
  return -1;
}

function getValueAt_(row, index) {
  if (!Array.isArray(row) || index == null || index < 0) return null;
  return index < row.length ? row[index] : null;
}

function readString_(row, index) {
  const value = getValueAt_(row, index);
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function readNumber_(row, index) {
  const raw = getValueAt_(row, index);
  if (raw == null || raw === "") return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function isTruthyFlag_(value) {
  if (value === true || value === false) return !!value;
  const text = String(value || "").trim().toLowerCase();
  if (!text) return false;
  return ["1", "true", "yes", "y", "t", "active", "enabled"].indexOf(text) >= 0;
}

function parseListFromCell_(value) {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  }
  const text = String(value || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);
    }
  } catch (err) {
    // Ignore JSON parse error and fallback to string split.
  }
  return text
    .split(/[,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseJSONSafe_(value, fallback) {
  if (value == null || value === "") return fallback;
  if (Array.isArray(value) || typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function parseFilterOptions_(rawValue) {
  if (!rawValue && rawValue !== 0) return [];
  const parsed = parseJSONSafe_(rawValue, null);
  if (Array.isArray(parsed)) {
    return parsed
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "string") {
          return { column: entry };
        }
        if (typeof entry === "object") {
          return entry;
        }
        return null;
      })
      .filter(Boolean);
  }
  const text = String(rawValue || "").trim();
  if (!text) return [];
  return text
    .split(/;+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const parts = token.split(/[:|]/).map((part) => part.trim());
      return {
        column: parts[0],
        settingKey: parts[1] || "",
        label: parts[2] || ""
      };
    });
}

function toCamelCase_(text) {
  const cleaned = String(text || "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/\s+/);
  if (!parts.length) return "";
  const first = parts.shift().toLowerCase();
  const rest = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
  return first + rest;
}

function rowToObject_(row, headers) {
  const record = {};
  headers.forEach((header, index) => {
    if (!header) return;
    const trimmed = String(header).trim();
    if (!trimmed) return;
    const value = getValueAt_(row, index);
    record[trimmed] = value;
    const camel = toCamelCase_(trimmed);
    if (camel && camel !== trimmed) {
      record[camel] = value;
    }
  });
  return record;
}

function sheetRowsToObjects_(headers, rows) {
  return rows.map((row, index) => {
    const record = rowToObject_(row, headers);
    record.__rowIndex = index + 2;
    return record;
  });
}

function keysEqual_(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  return String(a).trim() === String(b).trim();
}

function createKeyVariations_(key) {
  const base = String(key || "").trim();
  if (!base) return [];
  const variations = new Set();
  variations.add(base);
  variations.add(base.toLowerCase());
  variations.add(base.toUpperCase());

  const underscored = base.replace(/\s+/g, "_");
  variations.add(underscored);
  variations.add(underscored.toLowerCase());
  variations.add(underscored.toUpperCase());

  const camel = toCamelCase_(base);
  if (camel) {
    variations.add(camel);
    variations.add(camel.charAt(0).toLowerCase() + camel.slice(1));
    variations.add(camel.charAt(0).toUpperCase() + camel.slice(1));
  }

  const stripped = base.replace(/[^A-Za-z0-9]/g, "");
  if (stripped) {
    variations.add(stripped);
    variations.add(stripped.toLowerCase());
    variations.add(stripped.toUpperCase());
  }
  return Array.from(variations);
}

function valueFromKeys_(source, keys) {
  if (!source || typeof source !== "object") return undefined;
  const tested = new Set();
  for (let i = 0; i < keys.length; i++) {
    const variations = createKeyVariations_(keys[i]);
    for (let j = 0; j < variations.length; j++) {
      const key = variations[j];
      if (!key || tested.has(key)) continue;
      tested.add(key);
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key];
        if (value !== undefined) {
          return value;
        }
      }
    }
  }
  return undefined;
}

function parseQuickActions_(rawValue) {
  if (!rawValue && rawValue !== 0) return [];
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((entry) => normalizeQuickAction_(entry))
      .filter(Boolean);
  }
  if (typeof rawValue === "object") {
    return [normalizeQuickAction_(rawValue)].filter(Boolean);
  }
  const text = String(rawValue || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => normalizeQuickAction_(entry))
        .filter(Boolean);
    }
    return [normalizeQuickAction_(parsed)].filter(Boolean);
  } catch (err) {
    return text
      .split(/[,;]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => normalizeQuickAction_(token))
      .filter(Boolean);
  }
}

function normalizeQuickAction_(entry) {
  if (!entry && entry !== 0) return null;
  if (typeof entry === "string") {
    const key = entry.trim();
    if (!key) return null;
    return { key, label: key };
  }
  if (typeof entry !== "object") return null;
  const key =
    entry.key ||
    entry.id ||
    entry.action ||
    (typeof entry.label === "string" ? entry.label : "");
  if (!key) return null;
  return {
    key: String(key).trim(),
    label: entry.label ? String(entry.label).trim() : String(key).trim(),
    ...entry
  };
}

function mergeQuickActions_(existing, incoming) {
  const merged = new Map();
  (Array.isArray(existing) ? existing : []).forEach((action) => {
    if (!action) return;
    const key = String(action.key || action.id || "").trim();
    if (!key) return;
    merged.set(key, action);
  });
  (Array.isArray(incoming) ? incoming : []).forEach((action) => {
    if (!action) return;
    const key = String(action.key || action.id || "").trim();
    if (!key) return;
    merged.set(key, action);
  });
  return Array.from(merged.values());
}

function coerceFieldValue_(field, rawValue) {
  if (rawValue === undefined) return undefined;
  if (rawValue === null) return "";
  const type = (field?.type || "").toString().toLowerCase();
  if (!type) return rawValue;
  if (type === "number" || type === "currency" || type === "integer") {
    const num = Number(rawValue);
    return Number.isFinite(num) ? num : "";
  }
  if (type === "date" || type === "datetime") {
    if (rawValue instanceof Date) return rawValue;
    const date = new Date(rawValue);
    return Number.isNaN(date.getTime()) ? "" : date;
  }
  if (type === "checkbox" || type === "boolean") {
    return isTruthyFlag_(rawValue);
  }
  return rawValue;
}

function setup() {
  createSheets();
}

function createSheets() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = spreadsheet.getSheets().map(sheet => sheet.getName());

  if (sheets.indexOf('Users') === -1) {
    spreadsheet.insertSheet('Users');
    const usersSheet = spreadsheet.getSheetByName('Users');
    usersSheet.appendRow(['Email', 'Password', 'Role']);
    usersSheet.appendRow(['admin@nijjara.com', 'admin', 'admin']);
  }

  if (sheets.indexOf('Sessions') === -1) {
    spreadsheet.insertSheet('Sessions');
    const sessionsSheet = spreadsheet.getSheetByName('Sessions');
    sessionsSheet.appendRow(['Email', 'Token', 'Timestamp']);
  }

  if (sheets.indexOf('SYS_Dynamic_Forms') === -1) {
    spreadsheet.insertSheet('SYS_Dynamic_Forms');
    const formsSheet = spreadsheet.getSheetByName('SYS_Dynamic_Forms');
    formsSheet.appendRow(['Form ID', 'Sheet Name', 'Field Mapping']);
    formsSheet.appendRow(['new-customer', 'Customers', '{\"name\":\"Name\",\"email\":\"Email\",\"phone\":\"Phone\"}']);
    formsSheet.appendRow(['new-product', 'Products', '{\"name\":\"Name\",\"price\":\"Price\",\"stock\":\"Stock\"}']);
    formsSheet.appendRow(['new-order', 'Orders', '{\"customer\":\"Customer\",\"product\":\"Product\",\"quantity\":\"Quantity\"}']);
  }

  if (sheets.indexOf('SYS_Tabs') === -1) {
    spreadsheet.insertSheet('SYS_Tabs');
    const tabsSheet = spreadsheet.getSheetByName('SYS_Tabs');
    tabsSheet.appendRow(['ID', 'Title', 'Icon']);
    tabsSheet.appendRow(['home', 'Home', 'home']);
    tabsSheet.appendRow(['customers', 'Customers', 'users']);
    tabsSheet.appendRow(['products', 'Products', 'box']);
    tabsSheet.appendRow(['orders', 'Orders', 'shopping-cart']);
    tabsSheet.appendRow(['settings', 'Settings', 'settings']);
  }

  if (sheets.indexOf('SYS_Forms') === -1) {
    spreadsheet.insertSheet('SYS_Forms');
    const formsSheet = spreadsheet.getSheetByName('SYS_Forms');
    formsSheet.appendRow(['ID', 'Title', 'Fields']);
    formsSheet.appendRow(['new-customer', 'New Customer', '[{"id":"name","label":"Name","type":"text"},{"id":"email","label":"Email","type":"email"},{"id":"phone","label":"Phone","type":"text"}]']);
    formsSheet.appendRow(['new-product', 'New Product', '[{"id":"name","label":"Name","type":"text"},{"id":"price","label":"Price","type":"number"},{"id":"stock","label":"Stock","type":"number"}]']);
    formsSheet.appendRow(['new-order', 'New Order', '[{"id":"customer","label":"Customer","type":"text"},{"id":"product","label":"Product","type":"text"},{"id":"quantity","label":"Quantity","type":"number"}]']);
  }

  if (sheets.indexOf('SYS_Permissions') === -1) {
    spreadsheet.insertSheet('SYS_Permissions');
    const permissionsSheet = spreadsheet.getSheetByName('SYS_Permissions');
    permissionsSheet.appendRow(['Role', 'Tab', 'Permissions']);
    permissionsSheet.appendRow(['admin', 'customers', '[\"create\",\"read\",\"update\",\"delete\"]']);
    permissionsSheet.appendRow(['admin', 'products', '[\"create\",\"read\",\"update\",\"delete\"]']);
    permissionsSheet.appendRow(['admin', 'orders', '[\"create\",\"read\",\"update\",\"delete\"]']);
    permissionsSheet.appendRow(['user', 'customers', '[\"read\"]']);
    permissionsSheet.appendRow(['user', 'products', '[\"read\"]']);
    permissionsSheet.appendRow(['user', 'orders', '[\"read\"]']);
  }

  if (sheets.indexOf('Customers') === -1) {
    spreadsheet.insertSheet('Customers');
    const customersSheet = spreadsheet.getSheetByName('Customers');
    customersSheet.appendRow(['Name', 'Email', 'Phone']);
    customersSheet.appendRow(['John Doe', 'john.doe@example.com', '123-456-7890']);
  }

  if (sheets.indexOf('Products') === -1) {
    spreadsheet.insertSheet('Products');
    const productsSheet = spreadsheet.getSheetByName('Products');
    productsSheet.appendRow(['Name', 'Price', 'Stock']);
    productsSheet.appendRow(['Laptop', 1200, 50]);
    productsSheet.appendRow(['Keyboard', 75, 100]);
  }

  if (sheets.indexOf('Orders') === -1) {
    spreadsheet.insertSheet('Orders');
    const ordersSheet = spreadsheet.getSheetByName('Orders');
    ordersSheet.appendRow(['Customer', 'Product', 'Quantity', 'Date']);
    ordersSheet.appendRow(['John Doe', 'Laptop', 1, new Date()]);
  }
}

function doGet(e) {
  if (e.parameter.page === 'dashboard') {
    return HtmlService.createHtmlOutputFromFile('Dashboard.html')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else if (e.parameter.page === 'signup') {
    return HtmlService.createHtmlOutputFromFile('SignUp.html')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  return HtmlService.createHtmlOutputFromFile('App.html')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Function to authenticate user
function authenticateUser(email, password) {
  const sheet = getSheetByAliases_(SHEET_ALIASES.USERS);
  if (!sheet) {
    return { authenticated: false, message: 'Users sheet not found.' };
  }
  const data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return { authenticated: false, message: 'Users sheet has no data.' };
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowEmail = row[0];
    const rowPassword = row[1];
    if (rowEmail === email && rowPassword === password) {
      return {
        authenticated: true,
        role: row[2] || row[3] || 'user'
      };
    }
  }
  return { authenticated: false }; // Authentication failed
}

// Function to create a session
function createSession(email) {
  const token = Utilities.getUuid();
  const sessionSheet = getSheetByAliases_(SHEET_ALIASES.SESSIONS);
  if (!sessionSheet) {
    throw new Error('Sessions sheet not found.');
  }
  sessionSheet.appendRow([email, token, new Date()]);
  return token;
}

// Function to check session validity
function checkSession(token) {
  const sessionSheet = getSheetByAliases_(SHEET_ALIASES.SESSIONS);
  if (!sessionSheet) {
    return { valid: false };
  }
  const sessionData = sessionSheet.getDataRange().getValues();

  for (let i = 1; i < sessionData.length; i++) {
    if (sessionData[i][1] === token) {
      // Optional: Check for session expiry
      const sessionTime = new Date(sessionData[i][2]);
      const currentTime = new Date();
      const diff = (currentTime - sessionTime) / (1000 * 60); // Difference in minutes
      if (diff > 60) { // Session expires after 60 minutes
        return { valid: false };
      }
      
      const userSheet = getSheetByAliases_(SHEET_ALIASES.USERS);
      if (!userSheet) {
        return { valid: false };
      }
      const userData = userSheet.getDataRange().getValues();
      for (let j = 1; j < userData.length; j++) {
        if (userData[j][0] === sessionData[i][0]) {
          return {
            valid: true,
            email: userData[j][0],
            role: userData[j][2],
            user: rowToObject_(userData[j], userData[0] ? userData[0] : [])
          }; // Session valid
        }
      }
    }
  }
  return { valid: false }; // Session not found
}

function getLoggedInUser(token) {
  const session = checkSession(token);
  if (session.valid) {
    return {
      email: session.email,
      role: session.role
    };
  } else {
    return null;
  }
}

function deleteRecord(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Record not found.' };
}

function updateRecord(sheetName, id, data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  let recordUpdated = false;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == id) {
      const newRow = headers.map((header, index) => data[header] !== undefined ? data[header] : values[i][index]);
      sheet.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
      recordUpdated = true;
      break;
    }
  }

  if (recordUpdated) {
    return { success: true };
  } else {
    return { success: false, message: 'Record not found.' };
  }
}

function getRecord(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == id) {
      const record = {};
      headers.forEach((header, j) => {
        record[header.toLowerCase()] = data[i][j];
      });
      return record;
    }
  }
  return null;
}

// Function to sign up a new user
function signUpUser(email, password, role) {
  const sheet = getSheetByAliases_(SHEET_ALIASES.USERS);
  if (!sheet) {
    throw new Error('Users sheet not found.');
  }
  sheet.appendRow([email, password, role || 'user']);
}

function getBootstrapData(user) {
  const currentUser = user || {};
  const tabs = getTabs(currentUser);
  const forms = getForms(currentUser);
  const permissions = getPermissions(currentUser);
  const dropdowns = getDropdowns();

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    user: currentUser,
    role:
      currentUser.role ||
      currentUser.roleId ||
      currentUser.Role_Id ||
      currentUser.RoleID ||
      null,
    tabs,
    forms,
    permissions,
    dropdowns,
    meta: {
      tabCount: Array.isArray(tabs) ? tabs.length : 0,
      formKeys: forms ? Object.keys(forms).length : 0,
      dropdownCount: dropdowns ? Object.keys(dropdowns).length : 0
    }
  };
}

function getTabs(user) {
  const advanced = getTabRegister_();
  if (Array.isArray(advanced) && advanced.length) {
    return advanced;
  }
  return getTabsSimple_();
}

function getTabsSimple_() {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.TAB_SIMPLE);
  if (!rows.length) return [];
  return rows.map((row, index) => {
    const record = {};
    headers.forEach((header, i) => {
      if (!header) return;
      record[String(header).toLowerCase()] = getValueAt_(row, i);
    });
    record.tabId =
      record.id ||
      record.tab_id ||
      record.tabid ||
      record.key ||
      `tab_${index + 1}`;
    record.tabLabelEn = record.title || record.label || record.tabLabelEn || record.tabLabel || record.tabid;
    record.subTabs = [];
    return record;
  });
}

function getForms(user) {
  const register = getDynamicFormsRegister_();
  if (register && Object.keys(register).length) {
    return register;
  }
  return getFormsSimple_();
}

function getFormsSimple_() {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.FORM_SIMPLE);
  if (!rows.length) return {};
  const forms = {};
  rows.forEach((row) => {
    const form = {};
    headers.forEach((header, i) => {
      if (!header) return;
      const lower = String(header).toLowerCase();
      const cellValue = getValueAt_(row, i);
      if (lower === "fields") {
        form[lower] = parseJSONSafe_(cellValue, []);
      } else {
        form[lower] = cellValue;
      }
    });
    if (form.id) {
      forms[form.id] = form;
    }
  });
  return forms;
}

function getPermissions(user) {
  const roleKey = resolveRoleKey_(user);
  const advanced = getRolePermissions_(roleKey);
  if (Array.isArray(advanced) && advanced.length) {
    return advanced;
  }
  return getPermissionsSimple_(roleKey);
}

function resolveRoleKey_(user) {
  if (!user) return "";
  const candidates = [
    user.role,
    user.roleId,
    user.role_id,
    user.Role_ID,
    user.RoleId,
    user.Role,
    user.roleID
  ];
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (candidate) return String(candidate).trim();
  }
  return "";
}

function getPermissionsSimple_(roleKey) {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.PERMISSIONS_SIMPLE);
  if (!rows.length) return {};
  const permissions = {};
  rows.forEach((row) => {
    const role = getValueAt_(row, 0);
    if (!roleKey || keysEqual_(role, roleKey)) {
      const tab = getValueAt_(row, 1);
      const perms = parseJSONSafe_(getValueAt_(row, 2), []);
      if (tab) {
        permissions[tab] = perms;
      }
    }
  });
  return permissions;
}

function getSubTabViewData(subTabId, user) {
  const register = getTabRegister_();
  if (Array.isArray(register) && register.length) {
    const matches = [];
    register.forEach((tab) => {
      const subTabs = Array.isArray(tab.subTabs) ? tab.subTabs : [];
      subTabs.forEach((sub) => {
        matches.push({ tab, sub });
      });
    });

    const match = matches.find((entry) =>
      entry.sub && entry.sub.subId
        ? String(entry.sub.subId) === String(subTabId)
        : false
    );
    if (!match) {
      return {
        success: false,
        message: `Sub-tab ${subTabId} not found in register.`
      };
    }

    const sourceSheetName =
      match.sub.sourceSheet || match.tab.sourceSheet || match.sub.source;
    if (!sourceSheetName) {
      return {
        success: false,
        message: `Sub-tab ${subTabId} has no source sheet configured.`
      };
    }

    const viewData = loadSheetData_(sourceSheetName);
    if (!viewData.sheet) {
      return {
        success: false,
        message: `Source sheet ${sourceSheetName} not found for sub-tab ${subTabId}.`
      };
    }

    const rows = sheetRowsToObjects_(viewData.headers, viewData.rows);
    const formsRegister = getForms(user) || {};
    let formConfig = formsRegister[subTabId];
    if (!formConfig && match.sub.addFormId) {
      formConfig = formsRegister[match.sub.addFormId];
    }
    if (!formConfig && match.sub.editFormId) {
      formConfig = formsRegister[match.sub.editFormId];
    }

    return {
      success: true,
      subTabConfig: Object.assign({}, match.sub, {
        tabId: match.tab.tabId,
        searchBar: !!match.sub.searchBar,
        filterOptions: Array.isArray(match.sub.filterOptions)
          ? match.sub.filterOptions
          : [],
        tabLabelEn: match.tab.tabLabelEn || match.sub.labelEn || match.sub.label,
        tabLabelAr: match.tab.tabLabelAr || match.sub.labelAr
      }),
      formConfig: formConfig || null,
      viewData: {
        success: true,
        headers: viewData.headers,
        rows
      }
    };
  }
  return getSubTabViewDataSimple_(subTabId, user);
}

function getSubTabViewDataSimple_(tabId, user) {
  if (tabId === "customers") {
    const sheet = getSheetFlexible_("Customers");
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    return data.map((row) => {
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[String(header).toLowerCase()] = row[i];
      });
      return rowData;
    });
  }
  if (tabId === "products") {
    const sheet = getSheetFlexible_("Products");
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    return data.map((row) => {
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[String(header).toLowerCase()] = row[i];
      });
      return rowData;
    });
  }
  if (tabId === "orders") {
    const sheet = getSheetFlexible_("Orders");
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    return data.map((row) => {
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[String(header).toLowerCase()] = row[i];
      });
      return rowData;
    });
  }
  return [];
}

function getFormPayload(formId, user) {
  if (!formId) {
    return { success: false, message: "Form ID is required." };
  }

  const structure = getDynamicFormStructure_(formId);
  if (structure) {
    const dropdownRegistry = getDropdowns();
    const enrichedFields = structure.fields.map((field) => {
      const options =
        field.dropdownKey && dropdownRegistry[field.dropdownKey]
          ? dropdownRegistry[field.dropdownKey]
          : undefined;
      return Object.assign({}, field, {
        options: options ? options.slice() : undefined
      });
    });
    const fieldMap = new Map();
    enrichedFields.forEach((field) => {
      if (field && field.fieldId) {
        fieldMap.set(field.fieldId, field);
      }
    });
    const sections = structure.sections.map((section) => {
      const mappedFields = section.fields
        .map((field) =>
          field.fieldId && fieldMap.has(field.fieldId)
            ? fieldMap.get(field.fieldId)
            : field
        )
        .map((field) => Object.assign({}, field));
      return Object.assign({}, section, {
        fields: mappedFields
      });
    });

    return {
      success: true,
      form: {
        formId: structure.formId,
        titleEn: structure.titleEn,
        titleAr: structure.titleAr,
        tabId: structure.tabId,
        tabName: structure.tabName,
        targetSheet: structure.targetSheet,
        sections,
        fields: enrichedFields
      }
    };
  }

  const simpleForms = getFormsSimple_();
  if (simpleForms && simpleForms[formId]) {
    return { success: true, form: simpleForms[formId] };
  }

  return {
    success: false,
    message: `Form configuration not found for ${formId}.`
  };
}

function saveRecord(formId, data, user) {
  try {
    const advanced = saveRecordAdvanced_(formId, data, user);
    if (advanced) {
      return advanced;
    }
  } catch (err) {
    debugLog_("saveRecord", "advancedError", {
      formId,
      message: err && err.message
    });
  }
  return saveRecordSimple_(formId, data, user);
}

function getDropdowns() {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.DROPDOWNS);
  if (!rows.length) return {};

  const idx = {
    key: findHeaderIndex_(headers, "Key", "Dropdown_Key", "List_Key", "Name"),
    labelEn: findHeaderIndex_(
      headers,
      "English_Title",
      "Label_EN",
      "LabelEn",
      "Title_EN",
      "Title"
    ),
    labelAr: findHeaderIndex_(
      headers,
      "Arabic_Title",
      "Label_AR",
      "LabelAr",
      "Title_AR"
    ),
    value: findHeaderIndex_(headers, "Value", "Option_Value"),
    active: findHeaderIndex_(headers, "Is_Active", "Active", "Enabled"),
    sort: findHeaderIndex_(headers, "Sort_Order", "Sort", "Order"),
    group: findHeaderIndex_(headers, "Group", "Category")
  };

  if (idx.key < 0) return {};

  const registry = {};
  rows.forEach((row) => {
    const key = readString_(row, idx.key);
    if (!key) return;
    if (idx.active >= 0 && !isTruthyFlag_(getValueAt_(row, idx.active))) {
      return;
    }
    const labelEn = idx.labelEn >= 0 ? readString_(row, idx.labelEn) : "";
    const labelAr = idx.labelAr >= 0 ? readString_(row, idx.labelAr) : "";
    const value =
      idx.value >= 0
        ? readString_(row, idx.value)
        : labelEn || labelAr || key;

    const option = {
      value,
      label: labelAr || labelEn || value,
      labelEn,
      labelAr,
      sortOrder: idx.sort >= 0 ? readNumber_(row, idx.sort) || 0 : 0,
      group: idx.group >= 0 ? readString_(row, idx.group) : ""
    };
    if (!registry[key]) {
      registry[key] = [];
    }
    registry[key].push(option);
  });

  Object.keys(registry).forEach((key) => {
    registry[key].sort((a, b) => {
      const orderA = a.sortOrder == null ? 0 : a.sortOrder;
      const orderB = b.sortOrder == null ? 0 : b.sortOrder;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.label || "").localeCompare(String(b.label || ""));
    });
  });

  return registry;
}

function getDropdownOptions(key) {
  if (!key) return [];
  const registry = getDropdowns();
  const options = registry[key];
  if (!Array.isArray(options)) return [];
  return options.map((option) => Object.assign({}, option));
}

function mergeStringArraysUnique_(current, incoming) {
  const existing = new Set(
    (Array.isArray(current) ? current : []).map((entry) =>
      String(entry || "").trim()
    )
  );
  (Array.isArray(incoming) ? incoming : []).forEach((entry) => {
    const value = String(entry || "").trim();
    if (!value) return;
    if (!existing.has(value)) {
      existing.add(value);
    }
  });
  return Array.from(existing.values());
}

function getTabRegister_() {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.TAB_REGISTER);
  if (!rows.length) return [];

  const idx = {
    recordType: findHeaderIndex_(
      headers,
      "Record_Type",
      "RecordType",
      "Type",
      "Row_Type"
    ),
    tabId: findHeaderIndex_(headers, "Tab_ID", "TabId", "TabID", "Tab_Key"),
    tabLabelEn: findHeaderIndex_(
      headers,
      "Tab_Label_EN",
      "Tab_Label",
      "Tab_Name_EN",
      "Label_EN"
    ),
    tabLabelAr: findHeaderIndex_(
      headers,
      "Tab_Label_AR",
      "Tab_Name_AR",
      "Label_AR"
    ),
    tabIcon: findHeaderIndex_(headers, "Tab_Icon", "Icon", "TabIcon"),
    subIcon: findHeaderIndex_(headers, "Sub_Icon", "SubIcon", "Icon_Sub"),
    route: findHeaderIndex_(headers, "Route", "Path", "Target", "URL", "Url"),
    sortOrder: findHeaderIndex_(headers, "Sort_Order", "SortOrder", "Sort"),
    sourceSheet: findHeaderIndex_(
      headers,
      "Source_Sheet",
      "Source",
      "SourceSheet"
    ),
    permissions: findHeaderIndex_(
      headers,
      "Permissions",
      "Permission",
      "Permission_Key",
      "PermissionKey"
    ),
    renderMode: findHeaderIndex_(
      headers,
      "Render_Mode",
      "RenderMode",
      "Mode",
      "View_Mode"
    ),
    addFormId: findHeaderIndex_(headers, "Add_Form_ID", "AddFormId", "Form_ID"),
    editFormId: findHeaderIndex_(
      headers,
      "Edit_Form_ID",
      "EditFormId",
      "Edit_Form"
    ),
    viewLabel: findHeaderIndex_(headers, "View_Label", "ViewLabel"),
    addLabel: findHeaderIndex_(headers, "Add_Label", "AddLabel"),
    searchBar: findHeaderIndex_(headers, "Search_Bar", "Search", "Has_Search"),
    filterOptions: findHeaderIndex_(
      headers,
      "Filter_Options",
      "Filters",
      "FilterOptions"
    ),
    subId: findHeaderIndex_(headers, "Sub_ID", "SubId", "Pane", "Pane_Key"),
    subLabelEn: findHeaderIndex_(
      headers,
      "Sub_Label_EN",
      "Sub_Label",
      "Sub_Title_EN"
    ),
    subLabelAr: findHeaderIndex_(
      headers,
      "Sub_Label_AR",
      "Sub_Title_AR",
      "SubLabelAr"
    ),
    subSourceSheet: findHeaderIndex_(
      headers,
      "Sub_Source_Sheet",
      "Pane_Source",
      "Pane_Sheet"
    ),
    subPermissions: findHeaderIndex_(
      headers,
      "Sub_Permissions",
      "SubPermission",
      "Pane_Permissions"
    ),
    subSearchBar: findHeaderIndex_(
      headers,
      "Sub_Search_Bar",
      "Pane_Search",
      "SubSearch"
    ),
    subFilterOptions: findHeaderIndex_(
      headers,
      "Sub_Filter_Options",
      "Pane_Filters"
    ),
    subSortOrder: findHeaderIndex_(
      headers,
      "Sub_Sort_Order",
      "SubSort",
      "Pane_Sort"
    )
  };

  if (idx.tabId < 0) return [];

  const tabsMap = new Map();

  rows.forEach((row) => {
    const tabId = readString_(row, idx.tabId);
    if (!tabId) return;
    let tab = tabsMap.get(tabId);
    if (!tab) {
      tab = {
        tabId,
        tabLabelEn: "",
        tabLabelAr: "",
        route: "",
        sortOrder: null,
        icon: "",
        tabColor: "",
        sourceSheet: "",
        permissions: [],
        renderMode: "",
        searchBar: false,
        filterOptions: [],
        subTabs: [],
        _subMap: new Map()
      };
      tabsMap.set(tabId, tab);
    }

    tab.tabLabelEn =
      tab.tabLabelEn || (idx.tabLabelEn >= 0 ? readString_(row, idx.tabLabelEn) : "");
    tab.tabLabelAr =
      tab.tabLabelAr || (idx.tabLabelAr >= 0 ? readString_(row, idx.tabLabelAr) : "");
    tab.route = tab.route || (idx.route >= 0 ? readString_(row, idx.route) : "");
    tab.icon = tab.icon || (idx.tabIcon >= 0 ? readString_(row, idx.tabIcon) : "");
    tab.sourceSheet =
      tab.sourceSheet ||
      (idx.sourceSheet >= 0 ? readString_(row, idx.sourceSheet) : "");
    if (tab.sortOrder == null && idx.sortOrder >= 0) {
      tab.sortOrder = readNumber_(row, idx.sortOrder);
    }
    if (!tab.renderMode && idx.renderMode >= 0) {
      tab.renderMode = readString_(row, idx.renderMode);
    }
    if (idx.permissions >= 0) {
      tab.permissions = mergeStringArraysUnique_(
        tab.permissions,
        parseListFromCell_(getValueAt_(row, idx.permissions))
      );
    }
    if (!tab.searchBar && idx.searchBar >= 0) {
      tab.searchBar = isTruthyFlag_(getValueAt_(row, idx.searchBar));
    }
    if (!tab.filterOptions.length && idx.filterOptions >= 0) {
      tab.filterOptions = parseFilterOptions_(getValueAt_(row, idx.filterOptions));
    }

    const recordType = idx.recordType >= 0 ? readString_(row, idx.recordType).toUpperCase() : "";
    const hasSubId = idx.subId >= 0 && readString_(row, idx.subId);
    if (!hasSubId && recordType && recordType !== "SUB" && recordType !== "SUBTAB") {
      return;
    }

    const subId =
      idx.subId >= 0
        ? readString_(row, idx.subId)
        : `${tabId}_sub_${tab.subTabs.length + 1}`;
    const subMap = tab._subMap;
    let subTab = subMap.get(subId);
    if (!subTab) {
      subTab = {
        subId,
        tabId,
        labelEn: "",
        labelAr: "",
        sourceSheet: "",
        renderMode: "",
        sortOrder: null,
        permissions: [],
        addFormId: "",
        editFormId: "",
        viewLabel: "",
        addLabel: "",
        searchBar: tab.searchBar,
        filterOptions: [],
        icon: ""
      };
      subMap.set(subId, subTab);
      tab.subTabs.push(subTab);
    }

    subTab.labelEn =
      subTab.labelEn ||
      (idx.subLabelEn >= 0 ? readString_(row, idx.subLabelEn) : "");
    subTab.labelAr =
      subTab.labelAr ||
      (idx.subLabelAr >= 0 ? readString_(row, idx.subLabelAr) : "");
    subTab.sourceSheet =
      subTab.sourceSheet ||
      (idx.subSourceSheet >= 0
        ? readString_(row, idx.subSourceSheet)
        : idx.sourceSheet >= 0
        ? readString_(row, idx.sourceSheet)
        : "");
    if (!subTab.renderMode && idx.renderMode >= 0) {
      subTab.renderMode = readString_(row, idx.renderMode);
    }
    if (subTab.sortOrder == null) {
      if (idx.subSortOrder >= 0) {
        subTab.sortOrder = readNumber_(row, idx.subSortOrder);
      } else if (idx.sortOrder >= 0) {
        subTab.sortOrder = readNumber_(row, idx.sortOrder);
      }
    }
    if (idx.subPermissions >= 0) {
      subTab.permissions = mergeStringArraysUnique_(
        subTab.permissions,
        parseListFromCell_(getValueAt_(row, idx.subPermissions))
      );
    } else if (idx.permissions >= 0) {
      subTab.permissions = mergeStringArraysUnique_(
        subTab.permissions,
        parseListFromCell_(getValueAt_(row, idx.permissions))
      );
    }
    if (!subTab.addFormId && idx.addFormId >= 0) {
      subTab.addFormId = readString_(row, idx.addFormId);
    }
    if (!subTab.editFormId && idx.editFormId >= 0) {
      subTab.editFormId = readString_(row, idx.editFormId);
    }
    if (!subTab.viewLabel && idx.viewLabel >= 0) {
      subTab.viewLabel = readString_(row, idx.viewLabel);
    }
    if (!subTab.addLabel && idx.addLabel >= 0) {
      subTab.addLabel = readString_(row, idx.addLabel);
    }
    if (idx.subSearchBar >= 0) {
      subTab.searchBar = isTruthyFlag_(getValueAt_(row, idx.subSearchBar));
    }
    if (!subTab.filterOptions.length && idx.subFilterOptions >= 0) {
      subTab.filterOptions = parseFilterOptions_(
        getValueAt_(row, idx.subFilterOptions)
      );
    } else if (!subTab.filterOptions.length && idx.filterOptions >= 0) {
      subTab.filterOptions = parseFilterOptions_(getValueAt_(row, idx.filterOptions));
    }
    if (!subTab.icon && idx.subIcon >= 0) {
      subTab.icon = readString_(row, idx.subIcon);
    }
  });

  const tabs = Array.from(tabsMap.values()).map((tab) => {
    tab.permissions = mergeStringArraysUnique_(tab.permissions, []);
    tab.subTabs = tab.subTabs
      .map((subTab) => {
        const order =
          subTab.sortOrder == null ? Number.MAX_SAFE_INTEGER : subTab.sortOrder;
        return Object.assign({}, subTab, { sortOrder: order });
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((subTab) => {
        const clone = Object.assign({}, subTab);
        delete clone.sortOrder;
        return clone;
      });
    delete tab._subMap;
    const order = tab.sortOrder == null ? Number.MAX_SAFE_INTEGER : tab.sortOrder;
    return Object.assign({}, tab, { sortOrder: order });
  });

  return tabs.sort((a, b) => a.sortOrder - b.sortOrder).map((tab) => {
    const clone = Object.assign({}, tab);
    delete clone.sortOrder;
    return clone;
  });
}

function getRolePermissions_(roleKey) {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.ROLE_PERMISSIONS);
  if (!rows.length) return [];
  const idxRole = findHeaderIndex_(headers, "Role_Id", "RoleID", "Role", "Role_Key");
  if (idxRole < 0) return [];
  return rows
    .filter((row) => {
      if (!roleKey) return true;
      return keysEqual_(getValueAt_(row, idxRole), roleKey);
    })
    .map((row) => rowToObject_(row, headers));
}

function getDynamicFormsRegister_() {
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.DYNAMIC_FORMS);
  if (!rows.length) return {};
  const idx = {
    pane: findHeaderIndex_(
      headers,
      "Pane",
      "Pane_Key",
      "PaneId",
      "Pane_ID",
      "Sub_ID",
      "SubId"
    ),
    formId: findHeaderIndex_(
      headers,
      "Form_Id",
      "Form_ID",
      "FormId",
      "FormID",
      "Form_Key"
    ),
    titleEn: findHeaderIndex_(
      headers,
      "Title_EN",
      "Form_Title_EN",
      "Form_Title",
      "Label_EN",
      "Label"
    ),
    titleAr: findHeaderIndex_(
      headers,
      "Title_AR",
      "Form_Title_AR",
      "Label_AR"
    ),
    permission: findHeaderIndex_(
      headers,
      "Permission_Key",
      "Permission",
      "Required_Permission",
      "PermissionKey",
      "Role_ID"
    ),
    type: findHeaderIndex_(headers, "Form_Type", "Type", "Record_Type"),
    isActive: findHeaderIndex_(
      headers,
      "Is_Active",
      "IsActive",
      "Active",
      "Enabled"
    ),
    quickActions: findHeaderIndex_(
      headers,
      "Quick_Actions",
      "QuickActions",
      "Bulk_Actions",
      "BulkActions"
    ),
    targetSheet: findHeaderIndex_(headers, "Target_Sheet", "TargetSheet")
  };

  if (idx.pane < 0 || idx.formId < 0) return {};

  const register = {};
  rows.forEach((row) => {
    if (idx.isActive >= 0 && !isTruthyFlag_(getValueAt_(row, idx.isActive))) {
      return;
    }
    const paneKey = readString_(row, idx.pane);
    const formId = readString_(row, idx.formId);
    if (!paneKey || !formId) return;

    const entry =
      register[paneKey] ||
      {
        paneId: paneKey,
        formId: "",
        editFormId: "",
        titleEn: "",
        titleAr: "",
        permission: "",
        quickActions: [],
        targetSheet: ""
      };

    entry.titleEn =
      entry.titleEn || (idx.titleEn >= 0 ? readString_(row, idx.titleEn) : "");
    entry.titleAr =
      entry.titleAr || (idx.titleAr >= 0 ? readString_(row, idx.titleAr) : "");
    entry.permission =
      entry.permission ||
      (idx.permission >= 0 ? readString_(row, idx.permission) : "");
    entry.targetSheet =
      entry.targetSheet ||
      (idx.targetSheet >= 0 ? readString_(row, idx.targetSheet) : "");

    const type = idx.type >= 0 ? readString_(row, idx.type).toUpperCase() : "";
    if (
      !entry.formId ||
      !type ||
      type === "FORM" ||
      type === "ADD" ||
      type === "CREATE"
    ) {
      entry.formId = formId;
    }
    if (type === "EDIT" || type === "UPDATE") {
      entry.editFormId = formId;
    }

    const quickActions =
      idx.quickActions >= 0
        ? parseQuickActions_(getValueAt_(row, idx.quickActions))
        : [];
    entry.quickActions = mergeQuickActions_(entry.quickActions, quickActions);

    register[paneKey] = entry;
  });

  return register;
}

function getDynamicFormStructure_(formId) {
  if (!formId) return null;
  const { headers, rows } = loadSheetData_(SHEET_ALIASES.DYNAMIC_FORMS);
  if (!rows.length) return null;

  const idx = {
    pane: findHeaderIndex_(
      headers,
      "Pane",
      "Pane_Key",
      "PaneId",
      "Pane_ID",
      "Sub_ID",
      "SubId"
    ),
    formId: findHeaderIndex_(
      headers,
      "Form_Id",
      "Form_ID",
      "FormId",
      "FormID",
      "Form_Key"
    ),
    titleEn: findHeaderIndex_(
      headers,
      "Form_Title_EN",
      "Title_EN",
      "Form_Title",
      "Label_EN",
      "Label"
    ),
    titleAr: findHeaderIndex_(
      headers,
      "Form_Title_AR",
      "Title_AR",
      "Label_AR"
    ),
    tabId: findHeaderIndex_(headers, "Tab_ID", "TabId"),
    tabName: findHeaderIndex_(headers, "Tab_Name", "TabName"),
    section: findHeaderIndex_(
      headers,
      "Section_Header",
      "Section",
      "Group",
      "Section_Name"
    ),
    fieldId: findHeaderIndex_(headers, "Field_ID", "FieldId", "Field_Key"),
    fieldLabel: findHeaderIndex_(headers, "Field_Label", "Field", "Label"),
    fieldType: findHeaderIndex_(headers, "Field_Type", "Type"),
    sourceSheet: findHeaderIndex_(headers, "Source_Sheet", "SourceSheet"),
    sourceRange: findHeaderIndex_(headers, "Source_Range", "SourceRange"),
    dropdownKey: findHeaderIndex_(headers, "Dropdown_Key", "DropdownKey"),
    mandatory: findHeaderIndex_(headers, "Mandatory", "Required", "Is_Required"),
    defaultValue: findHeaderIndex_(headers, "Default_Value", "Default"),
    readOnly: findHeaderIndex_(headers, "Read_Only", "ReadOnly", "Readonly"),
    targetSheet: findHeaderIndex_(headers, "Target_Sheet", "TargetSheet"),
    targetColumn: findHeaderIndex_(headers, "Target_Column", "TargetColumn"),
    roleId: findHeaderIndex_(headers, "Role_ID", "RoleId"),
    show: findHeaderIndex_(headers, "Show", "Visible", "IsVisible"),
    order: findHeaderIndex_(
      headers,
      "Field_Order",
      "Sort_Order",
      "Sort",
      "Order"
    ),
    helpText: findHeaderIndex_(headers, "Help_Text", "Hint"),
    placeholder: findHeaderIndex_(headers, "Placeholder", "Placeholder_Text")
  };

  if (idx.formId < 0) return null;

  const matchingRows = rows.filter((row) =>
    keysEqual_(readString_(row, idx.formId), formId)
  );
  if (!matchingRows.length) return null;

  const structure = {
    formId,
    titleEn:
      idx.titleEn >= 0 ? readString_(matchingRows[0], idx.titleEn) : formId,
    titleAr: idx.titleAr >= 0 ? readString_(matchingRows[0], idx.titleAr) : "",
    tabId: idx.tabId >= 0 ? readString_(matchingRows[0], idx.tabId) : "",
    tabName: idx.tabName >= 0 ? readString_(matchingRows[0], idx.tabName) : "",
    paneId: idx.pane >= 0 ? readString_(matchingRows[0], idx.pane) : "",
    targetSheet: "",
    sections: [],
    fields: []
  };

  const sectionMap = new Map();
  matchingRows.forEach((row, index) => {
    const sectionLabel =
      idx.section >= 0 ? readString_(row, idx.section) : "Main";
    let section = sectionMap.get(sectionLabel);
    if (!section) {
      section = {
        id: toCamelCase_(sectionLabel) || `section${sectionMap.size + 1}`,
        title: sectionLabel,
        fields: [],
        order: sectionMap.size
      };
      sectionMap.set(sectionLabel, section);
    }

    const fieldId =
      idx.fieldId >= 0
        ? readString_(row, idx.fieldId)
        : `${formId}_field_${index + 1}`;
    const field = {
      fieldId,
      label:
        idx.fieldLabel >= 0 ? readString_(row, idx.fieldLabel) : fieldId,
      type:
        idx.fieldType >= 0
          ? readString_(row, idx.fieldType).toLowerCase() || "text"
          : "text",
      section: section.id,
      required:
        idx.mandatory >= 0
          ? isTruthyFlag_(getValueAt_(row, idx.mandatory))
          : false,
      defaultValue:
        idx.defaultValue >= 0 ? getValueAt_(row, idx.defaultValue) : "",
      readOnly:
        idx.readOnly >= 0 ? isTruthyFlag_(getValueAt_(row, idx.readOnly)) : false,
      sourceSheet:
        idx.sourceSheet >= 0 ? readString_(row, idx.sourceSheet) : "",
      sourceRange:
        idx.sourceRange >= 0 ? readString_(row, idx.sourceRange) : "",
      dropdownKey:
        idx.dropdownKey >= 0 ? readString_(row, idx.dropdownKey) : "",
      targetSheet:
        idx.targetSheet >= 0 ? readString_(row, idx.targetSheet) : "",
      targetColumn:
        idx.targetColumn >= 0 ? readString_(row, idx.targetColumn) : "",
      roleId: idx.roleId >= 0 ? readString_(row, idx.roleId) : "",
      show:
        idx.show >= 0 ? isTruthyFlag_(getValueAt_(row, idx.show)) : true,
      order: idx.order >= 0 ? readNumber_(row, idx.order) : index,
      helpText: idx.helpText >= 0 ? readString_(row, idx.helpText) : "",
      placeholder:
        idx.placeholder >= 0 ? readString_(row, idx.placeholder) : ""
    };

    if (!structure.targetSheet && field.targetSheet) {
      structure.targetSheet = field.targetSheet;
    }

    section.fields.push(field);
    structure.fields.push(field);
  });

  structure.sections = Array.from(sectionMap.values()).map((section) => {
    section.fields.sort((a, b) => {
      const orderA = a.order == null ? Number.MAX_SAFE_INTEGER : a.order;
      const orderB = b.order == null ? Number.MAX_SAFE_INTEGER : b.order;
      return orderA - orderB;
    });
    return section;
  });

  return structure;
}

function saveRecordAdvanced_(formId, data, user) {
  const structure = getDynamicFormStructure_(formId);
  if (!structure) return null;

  const targetSheetName =
    structure.targetSheet ||
    (structure.fields.find((field) => field.targetSheet)?.targetSheet || "");
  if (!targetSheetName) {
    return {
      success: false,
      message: `Target sheet is not configured for form ${formId}.`
    };
  }

  const sheetData = loadSheetData_(targetSheetName);
  if (!sheetData.sheet) {
    return {
      success: false,
      message: `Target sheet ${targetSheetName} not found.`
    };
  }

  const headers = sheetData.headers;
  const rows = sheetData.rows;
  if (!headers.length) {
    return {
      success: false,
      message: `Target sheet ${targetSheetName} has no header row.`
    };
  }

  const identifier = resolveRecordIdentifier_(structure, data, headers, rows);
  const isUpdate = identifier && identifier.rowIndex >= 0;
  const templateRow = headers.map(() => "");
  const workingRow = isUpdate
    ? rows[identifier.rowIndex].slice(0, headers.length)
    : templateRow.slice(0);

  structure.fields.forEach((field) => {
    const headerIndex = findHeaderIndex_(
      headers,
      field.targetColumn,
      field.fieldId,
      field.label
    );
    if (headerIndex < 0) return;
    const rawValue = getPayloadValue_(data, field);
    if (rawValue === undefined) {
      if (!isUpdate && workingRow[headerIndex] == null) {
        workingRow[headerIndex] = "";
      }
      return;
    }
    const coerced = coerceFieldValue_(field, rawValue);
    workingRow[headerIndex] = coerced;
  });

  if (isUpdate) {
    sheetData.sheet
      .getRange(identifier.rowIndex + 2, 1, 1, workingRow.length)
      .setValues([workingRow]);
  } else {
    sheetData.sheet.appendRow(workingRow);
  }

  const record = rowToObject_(workingRow, headers);
  const recordId =
    (identifier && identifier.value) ||
    record.ID ||
    record.Id ||
    record.Record_ID ||
    record.recordId ||
    null;

  return {
    success: true,
    mode: isUpdate ? "update" : "insert",
    recordId,
    record
  };
}

function resolveRecordIdentifier_(structure, payload, headers, rows) {
  const fields = Array.isArray(structure?.fields) ? structure.fields : [];
  const idField =
    fields.find((field) => {
      const key = (field?.fieldId || field?.targetColumn || "").toLowerCase();
      if (!key) return false;
      if (key === "id" || key === "record_id") return true;
      return key.endsWith("_id");
    }) || null;

  const idCandidates = [
    "record_id",
    "recordId",
    "id",
    "ID",
    idField ? idField.fieldId : "",
    idField ? idField.targetColumn : ""
  ].filter(Boolean);
  const value = valueFromKeys_(payload, idCandidates);
  if (value == null || value === "") {
    return null;
  }

  const headerIndex = findHeaderIndex_(
    headers,
    idField?.targetColumn,
    idField?.fieldId,
    "Record_ID",
    "RecordId",
    "ID",
    "Id"
  );
  if (headerIndex < 0) {
    return {
      value,
      headerIndex: -1,
      rowIndex: -1,
      field: idField
    };
  }
  const rowIndex = rows.findIndex((row) =>
    keysEqual_(getValueAt_(row, headerIndex), value)
  );
  return {
    value,
    headerIndex,
    rowIndex,
    field: idField
  };
}

function getPayloadValue_(payload, field) {
  if (!payload || !field) return undefined;
  const candidates = [
    field.fieldId,
    field.targetColumn,
    field.label,
    field.fieldId ? field.fieldId.replace(/_/g, " ") : "",
    field.targetColumn ? field.targetColumn.replace(/_/g, " ") : ""
  ].filter(Boolean);
  return valueFromKeys_(payload, candidates);
}

function saveRecordSimple_(formId, data) {
  const sheetData = loadSheetData_(SHEET_ALIASES.DYNAMIC_FORMS);
  if (!sheetData.rows.length) {
    return { success: false, message: "Form configuration sheet not found." };
  }

  const idx = {
    formId: findHeaderIndex_(
      sheetData.headers,
      "Form_ID",
      "Form Id",
      "FormID",
      "Form ID"
    ),
    sheetName: findHeaderIndex_(
      sheetData.headers,
      "Sheet_Name",
      "Target_Sheet",
      "SheetName"
    ),
    mapping: findHeaderIndex_(
      sheetData.headers,
      "Field_Mapping",
      "Mapping",
      "FieldMapping",
      "Fields"
    )
  };

  if (idx.formId < 0 || idx.sheetName < 0) {
    return { success: false, message: "Field mapping columns are missing." };
  }

  let sheetName = "";
  let fieldMapping = null;
  for (let i = 0; i < sheetData.rows.length; i++) {
    const row = sheetData.rows[i];
    if (keysEqual_(getValueAt_(row, idx.formId), formId)) {
      sheetName = readString_(row, idx.sheetName);
      fieldMapping = idx.mapping >= 0 ? parseJSONSafe_(getValueAt_(row, idx.mapping), null) : null;
      break;
    }
  }

  if (!sheetName) {
    return { success: false, message: "Form configuration not found." };
  }

  if (data && data.id) {
    return updateRecord(sheetName, data.id, data);
  }

  if (!fieldMapping || typeof fieldMapping !== "object") {
    return {
      success: false,
      message: "Field mapping is not defined for this form."
    };
  }

  const targetSheet = getSheetFlexible_(sheetName);
  if (!targetSheet) {
    return {
      success: false,
      message: `Target sheet ${sheetName} not found.`
    };
  }

  const headers = targetSheet
    .getRange(1, 1, 1, targetSheet.getLastColumn())
    .getValues()[0];

  const newRow = headers.map((header) => {
    const headerName = String(header || "").trim();
    const dataKey = Object.keys(fieldMapping).find(
      (key) => String(fieldMapping[key] || "").trim() === headerName
    );
    if (!dataKey) return "";
    const value = valueFromKeys_(data, [dataKey]);
    return value === undefined || value === null ? "" : value;
  });

  targetSheet.appendRow(newRow);
  return { success: true };
}
