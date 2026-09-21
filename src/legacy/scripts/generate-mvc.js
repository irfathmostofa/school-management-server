const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONTROLLERS = path.join(ROOT, "controllers");
const ROUTES = path.join(ROOT, "routes");

const modules = [
  { src: "routes_legacy/auth.js", name: "auth" },
  { src: "routes_legacy/admin.js", name: "admin" },
  { src: "routes_legacy/academic.js", name: "academic" },
  { src: "routes_legacy/account.js", name: "account" },
  { src: "routes_legacy/dashboard.js", name: "dashboard" },
  { src: "routes_legacy/fees.js", name: "fees" },
  { src: "routes_legacy/frontOffice.js", name: "frontOffice" },
  { src: "routes_legacy/newHr.js", name: "newHr" },
  { src: "routes_legacy/procurement.js", name: "procurement" },
  { src: "routes_legacy/settings.js", name: "settings" },
  { src: "routes_legacy/stad.js", name: "stad" },
  { src: "routes_legacy/storeInventory.js", name: "storeInventory" },
  { src: "routes_legacy/management.js", name: "management" },
  { src: "hr.js", name: "hr" },
  { src: "student.js", name: "student" },
  { src: "paymentGateway.js", name: "paymentGateway" },
];

function toFnName(method, routePath, used) {
  const cleaned = routePath
    .replace(/^\//, "")
    .replace(/[:/-]+/g, "_")
    .replace(/[^A-Za-z0-9_]/g, "")
    .replace(/^(\d)/, "_$1");
  let base = cleaned || method.toLowerCase();
  if (!/^[A-Za-z_]/.test(base)) base = `action_${base}`;
  if (used.has(base)) {
    base = `${method}_${base}`;
  }
  let name = base;
  let i = 2;
  while (used.has(name)) {
    name = `${base}_${i++}`;
  }
  used.add(name);
  return name;
}

function isLineCommented(src, index) {
  const lineStart = src.lastIndexOf("\n", index - 1) + 1;
  const prefix = src.slice(lineStart, index);
  return /^\s*\/\//.test(prefix);
}

function findMatchingBrace(src, openIdx) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === "/" && next === "/") {
        inLineComment = true;
        i++;
        continue;
      }
      if (ch === "/" && next === "*") {
        inBlockComment = true;
        i++;
        continue;
      }
    }
    if (inSingle) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === '"') inDouble = false;
      continue;
    }
    if (inTemplate) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "`") inTemplate = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractRoutes(src) {
  const results = [];
  const re = /router\.(get|post|put|delete|patch)\s*\(\s*(['"`])([^'"`]+)\2\s*,/g;
  let match;
  while ((match = re.exec(src))) {
    if (isLineCommented(src, match.index)) continue;
    const method = match[1];
    const routePath = match[3];
    const start = match.index;
    let i = re.lastIndex;
    while (i < src.length && /\s/.test(src[i])) i++;
    let asyncPref = "";
    if (src.slice(i, i + 5) === "async") {
      asyncPref = "async ";
      i += 5;
      while (i < src.length && /\s/.test(src[i])) i++;
    }
    if (src[i] !== "(") continue;
    const brace = src.indexOf("{", i);
    if (brace === -1) continue;
    const end = findMatchingBrace(src, brace);
    if (end === -1) continue;
    const handlerSrc = src.slice(i, end + 1);
    let closeEnd = end + 1;
    while (closeEnd < src.length && /\s/.test(src[closeEnd])) closeEnd++;
    if (src[closeEnd] === ")") closeEnd++;
    if (src[closeEnd] === ";") closeEnd++;
    results.push({
      method,
      routePath,
      asyncPref,
      handlerSrc,
      start,
      end: closeEnd,
    });
    re.lastIndex = closeEnd;
  }
  return results;
}

function extraRequires(name, src) {
  const lines = ['const { db } = require("../models");'];
  if (src.includes("bcrypt")) lines.push('const bcrypt = require("bcryptjs");');
  if (src.includes("uuidv4") || src.includes("uuid")) {
    lines.push('const { v4: uuidv4 } = require("uuid");');
  }
  if (src.includes("path.")) lines.push('const path = require("path");');
  if (src.includes("crypto")) lines.push('const crypto = require("crypto");');
  if (src.includes("node-cron") || src.includes("cron.")) {
    lines.push('const cron = require("node-cron");');
  }
  if (src.includes("sendNotification") || src.includes("sendAttendanceNotification")) {
    lines.push('const { sendNotification, sendAttendanceNotification } = require("../notification");');
  }
  if (src.includes("SMS_API")) {
    lines.push('const { SMS_API_URL, SMS_API_KEY, SMS_SECRET_KEY, SMS_CALLER_ID } = require("../secret");');
  }
  if (src.includes("jwt.") || src.includes("jsonwebtoken")) {
    lines.push('const { sign, verify } = require("../utils/jwt");');
  }
  if (src.includes("publicDirectory") && !src.includes("path.")) {
    lines.push('const path = require("path");');
  }
  return Array.from(new Set(lines)).join("\n");
}

function buildController(src, routes, name) {
  const used = new Set();
  const names = routes.map((r) => toFnName(r.method, r.routePath, used));
  const replacements = routes
    .map((r, idx) => ({ ...r, idx }))
    .sort((a, b) => b.start - a.start);

  let body = src;
  for (const r of replacements) {
    const fn = names[r.idx];
    const replacement = `exports.${fn} = ${r.asyncPref}${r.handlerSrc}`;
    body = body.slice(0, r.start) + replacement + body.slice(r.end);
  }

  body = body.replace(/const express = require\(["']express["']\);?\n?/g, "");
  body = body.replace(/const router = express\.Router\(\);?\n?/g, "");
  body = body.replace(/const mysql = require\(["']mysql["']\);?\n?/g, "");
  body = body.replace(/const cors = require\(["']cors["']\);?\n?/g, "");
  body = body.replace(/const jwt = require\(["']jsonwebtoken["']\);?\n?/g, "");
  body = body.replace(/const bcrypt = require\(["']bcryptjs["']\);?\n?/g, "");
  body = body.replace(/const \{ v4: uuidv4 \} = require\(["']uuid["']\);?\n?/g, "");
  body = body.replace(/const path = require\(["']path["']\);?\n?/g, "");
  body = body.replace(/const crypto = require\(["']crypto["']\);?\n?/g, "");
  body = body.replace(/const cron = require\(["']node-cron["']\);?\n?/g, "");
  body = body.replace(/const \{ sendNotification \} = require\(["'][^"']+["']\);?\n?/g, "");
  body = body.replace(/const \{ sendAttendanceNotification\s*\} = require\(["'][^"']+["']\);?\n?/g, "");
  body = body.replace(/const \{ SMS_API_URL[\s\S]*?\} = require\(["'][^"']+["']\);?\n?/g, "");
  body = body.replace(/const publicDirectory = path\.join\([^;]+;\n*/g, "");
  body = body.replace(/^[ \t]*router\.use\([\s\S]*?\);?\n/gm, "");
  body = body.replace(/var corsOptions = \{[\s\S]*?\};?\n*/g, "");
  body = body.replace(/const db = mysql\.createConnection\(\{[\s\S]*?\}\);?\n*/g, "");
  body = body.replace(/module\.exports\s*=\s*router;?\s*/g, "");
  body = body.replace(/const fetch = require\(["']node-fetch["']\);[^\n]*\n?/g, "");
  body = body.replace(/jwt\.sign\(/g, "sign(");
  body = body.replace(/jwt\.verify\(/g, "verify(");
  body = body.replace(
    /sign\((\{[^}]*\))\s*,\s*["']mysupersecretpassword["']\s*,\s*\{[\s\S]*?\}/g,
    "sign($1)"
  );
  body = body.replace(
    /const id = verify\(([^,]+)(?:,\s*["']mysupersecretpassword["'])?,\s*\(err,\s*decoded\)\s*=>\s*\{[\s\S]*?\}\);/g,
    "const decoded = verify($1);\n  const id = decoded && decoded.id ? decoded.id : 0;"
  );
  body = body.replace(/verify\(([^,]+),\s*["']mysupersecretpassword["']/g, "verify($1");
  body = body.replace(/^\);?\s*$/gm, "");

  const requires = extraRequires(name, src);
  const publicDir =
    src.includes("publicDirectory")
      ? '\nconst publicDirectory = path.join(__dirname, "../public");\n'
      : "";

  return `${requires}${publicDir}\n${body.trim()}\n`;
}

function buildRoutes(name, routes, names) {
  const lines = [
    'const express = require("express");',
    "const router = express.Router();",
    `const ctrl = require("../controllers/${name}Controller");`,
    "",
  ];
  routes.forEach((r, i) => {
    lines.push(`router.${r.method}("${r.routePath}", ctrl.${names[i]});`);
  });
  lines.push("");
  lines.push("module.exports = router;");
  return lines.join("\n") + "\n";
}

fs.mkdirSync(CONTROLLERS, { recursive: true });

const originalRoutes = path.join(ROOT, "routes_legacy");
if (!fs.existsSync(originalRoutes)) {
  fs.mkdirSync(originalRoutes, { recursive: true });
}

for (const mod of modules) {
  const srcPath = path.join(ROOT, mod.src);
  if (!fs.existsSync(srcPath)) {
    console.log("skip missing", mod.src);
    continue;
  }
  const src = fs.readFileSync(srcPath, "utf8");
  const routes = extractRoutes(src);
  const used = new Set();
  const names = routes.map((r) => toFnName(r.method, r.routePath, used));
  const controller = buildController(src, routes, mod.name);
  const routeFile = buildRoutes(mod.name, routes, names);

  if (mod.src.startsWith("routes/")) {
    const backup = path.join(originalRoutes, path.basename(mod.src));
    if (!fs.existsSync(backup)) fs.copyFileSync(srcPath, backup);
  }

  fs.writeFileSync(path.join(CONTROLLERS, `${mod.name}Controller.js`), controller);
  fs.writeFileSync(path.join(ROUTES, `${mod.name}.js`), routeFile);
  console.log(`${mod.name}: ${routes.length} routes`);
}

console.log("MVC generation complete");
