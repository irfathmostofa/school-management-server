const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src", "modules");

const MODULES = [
  { name: "auth", folder: "auth", className: "Auth", prefix: "server", controller: "authController.js", routes: "auth.js" },
  { name: "admin", folder: "admin", className: "Admin", prefix: "server", controller: "adminController.js", routes: "admin.js" },
  { name: "academic", folder: "academic", className: "Academic", prefix: "server", controller: "academicController.js", routes: "academic.js" },
  { name: "account", folder: "account", className: "Account", prefix: "server", controller: "accountController.js", routes: "account.js" },
  { name: "dashboard", folder: "dashboard", className: "Dashboard", prefix: "server", controller: "dashboardController.js", routes: "dashboard.js" },
  { name: "fees", folder: "fees", className: "Fees", prefix: "server", controller: "feesController.js", routes: "fees.js" },
  { name: "frontOffice", folder: "front-office", className: "FrontOffice", prefix: "server", controller: "frontOfficeController.js", routes: "frontOffice.js" },
  { name: "hr", folder: "hr", className: "Hr", prefix: "server/hr", controller: "hrController.js", routes: "hr.js" },
  { name: "newHr", folder: "new-hr", className: "NewHr", prefix: "server", controller: "newHrController.js", routes: "newHr.js" },
  { name: "paymentGateway", folder: "payment", className: "Payment", prefix: "server/payment", controller: "paymentGatewayController.js", routes: "paymentGateway.js" },
  { name: "procurement", folder: "procurement", className: "Procurement", prefix: "server", controller: "procurementController.js", routes: "procurement.js" },
  { name: "settings", folder: "settings", className: "Settings", prefix: "server", controller: "settingsController.js", routes: "settings.js" },
  { name: "stad", folder: "stad", className: "Stad", prefix: "server", controller: "stadController.js", routes: "stad.js" },
  { name: "storeInventory", folder: "store-inventory", className: "StoreInventory", prefix: "server", controller: "storeInventoryController.js", routes: "storeInventory.js" },
  { name: "student", folder: "student", className: "Student", prefix: "server/student", controller: "studentController.js", routes: "student.js" },
  { name: "management", folder: "management", className: "Management", prefix: "server", controller: "managementController.js", routes: "management.js" },
];

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

function parseRoutes(src) {
  const results = [];
  const re = /router\.(get|post|put|delete|patch)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*ctrl\.([A-Za-z0-9_]+)\s*\)/g;
  let match;
  while ((match = re.exec(src))) {
    results.push({
      method: match[1],
      routePath: match[3],
      handler: match[4],
    });
  }
  return results;
}

function extractExports(src) {
  const results = [];
  const re = /exports\.([A-Za-z0-9_]+)\s*=\s*/g;
  let match;
  while ((match = re.exec(src))) {
    const name = match[1];
    const start = match.index;
    let i = re.lastIndex;
    while (i < src.length && /\s/.test(src[i])) i++;
    let asyncPref = false;
    if (src.slice(i, i + 5) === "async") {
      asyncPref = true;
      i += 5;
      while (i < src.length && /\s/.test(src[i])) i++;
    }
    const brace = src.indexOf("{", i);
    if (brace === -1) continue;
    const end = findMatchingBrace(src, brace);
    if (end === -1) continue;
    const sig = src.slice(i, brace).trim();
    const body = src.slice(brace, end + 1);
    let closeEnd = end + 1;
    while (closeEnd < src.length && /\s/.test(src[closeEnd])) closeEnd++;
    if (src[closeEnd] === ";") closeEnd++;
    results.push({ name, asyncPref, sig, body, start, end: closeEnd });
    re.lastIndex = closeEnd;
  }
  return results;
}

function stripRequires(src) {
  return src
    .replace(/const \{ db \} = require\(["'][^"']+["']\);?\n?/g, "")
    .replace(/const db = require\(["'][^"']+["']\);?\n?/g, "")
    .replace(/const bcrypt = require\(["']bcryptjs["']\);?\n?/g, "")
    .replace(/const \{ v4: uuidv4 \} = require\(["']uuid["']\);?\n?/g, "")
    .replace(/const path = require\(["']path["']\);?\n?/g, "")
    .replace(/const crypto = require\(["']crypto["']\);?\n?/g, "")
    .replace(/const cron = require\(["']node-cron["']\);?\n?/g, "")
    .replace(/const \{ sendNotification, sendAttendanceNotification \} = require\(["'][^"']+["']\);?\n?/g, "")
    .replace(/const \{ sendNotification \} = require\(["'][^"']+["']\);?\n?/g, "")
    .replace(/const \{ SMS_API_URL[\s\S]*?\} = require\(["'][^"']+["']\);?\n?/g, "")
    .replace(/const \{ sign, verify \} = require\(["'][^"']+["']\);?\n?/g, "")
    .replace(/const publicDirectory = path\.join\([^;]+;?\n*/g, "")
    .replace(/\/\/ const db = require\([^;]+;?\n?/g, "");
}

function nestPath(routePath) {
  return routePath.replace(/^\//, "");
}

function decoratorFor(method, routePath) {
  const m = method[0].toUpperCase() + method.slice(1);
  const p = nestPath(routePath);
  return `@${m}('${p}')`;
}

function needs(src, token) {
  return src.includes(token);
}

function buildController(mod, controllerSrc, routes) {
  const exportsFound = extractExports(controllerSrc);
  const exportMap = new Map(exportsFound.map((e) => [e.name, e]));
  const usedRanges = exportsFound.map((e) => [e.start, e.end]);

  let remainder = "";
  let cursor = 0;
  const sorted = [...exportsFound].sort((a, b) => a.start - b.start);
  for (const e of sorted) {
    remainder += controllerSrc.slice(cursor, e.start);
    cursor = e.end;
  }
  remainder += controllerSrc.slice(cursor);
  remainder = stripRequires(remainder)
    .replace(/module\.exports\s*=\s*[^;]+;?/g, "")
    .trim();

  const cronBlocks = [];
  remainder = remainder.replace(/cron\.schedule\(([\s\S]*?)\);/g, (full) => {
    cronBlocks.push(full);
    return "";
  });

  const origFull = controllerSrc;
  const useBcrypt = needs(origFull, "bcrypt");
  const useUuid = needs(origFull, "uuidv4") || needs(origFull, "uuid");
  const usePath = needs(origFull, "path.") || needs(origFull, "publicDirectory");
  const useCrypto = needs(origFull, "crypto");
  const useNotify = needs(origFull, "sendNotification") || needs(origFull, "sendAttendanceNotification");
  const useJwt = needs(origFull, "sign(") || needs(origFull, "verify(");
  const useSms = needs(origFull, "SMS_API");
  const usePublic = needs(origFull, "publicDirectory");
  const useCron = cronBlocks.length > 0 || needs(origFull, "cron.");

  const imports = [
    `import { Controller, Get, Post, Put, Delete, Patch, Req, Res${useCron ? ", OnModuleInit" : ""} } from "@nestjs/common";`,
    `import { DatabaseService } from "../../common/database/database.service";`,
  ];
  if (useJwt) imports.push(`import { TokenService } from "../../common/jwt/jwt.service";`);
  if (useNotify) imports.push(`import { NotificationService } from "../../common/notification/notification.service";`);
  if (usePublic || usePath) imports.push(`import { UploadService } from "../../common/upload/upload.service";`);
  if (useBcrypt) imports.push(`import * as bcrypt from "bcryptjs";`);
  if (useUuid) imports.push(`import { v4 as uuidv4 } from "uuid";`);
  if (usePath) imports.push(`import * as path from "path";`);
  if (useCrypto) imports.push(`import * as crypto from "crypto";`);
  if (useCron) imports.push(`import * as cron from "node-cron";`);

  const lets = ["let db: any;"];
  if (useJwt) {
    lets.push("let sign: any;");
    lets.push("let verify: any;");
  }
  if (useNotify) {
    lets.push("let sendNotification: any;");
    lets.push("let sendAttendanceNotification: any;");
  }
  if (usePublic) lets.push("let publicDirectory: string;");
  if (useSms) {
    lets.push('const SMS_API_URL = process.env.SMS_API_URL;');
    lets.push('const SMS_API_KEY = process.env.SMS_API_KEY;');
    lets.push('const SMS_SECRET_KEY = process.env.SMS_SECRET_KEY;');
    lets.push('const SMS_CALLER_ID = process.env.SMS_CALLER_ID;');
  }

  const ctorParams = ["private readonly database: DatabaseService"];
  if (useJwt) ctorParams.push("private readonly tokens: TokenService");
  if (useNotify) ctorParams.push("private readonly notifications: NotificationService");
  if (usePublic || usePath) ctorParams.push("private readonly upload: UploadService");

  const ctorBody = ["    db = this.database;"];
  if (useJwt) {
    ctorBody.push("    sign = (payload: any, expiresIn?: any) => this.tokens.sign(payload, expiresIn);");
    ctorBody.push("    verify = (token: string) => this.tokens.verify(token);");
  }
  if (useNotify) {
    ctorBody.push("    sendNotification = (...args: any[]) => this.notifications.sendNotification(...args);");
    ctorBody.push("    sendAttendanceNotification = (...args: any[]) => this.notifications.sendAttendanceNotification(...args);");
  }
  if (usePublic) ctorBody.push("    publicDirectory = this.upload.publicDirectory;");

  const methods = [];
  const seen = new Set();
  for (const route of routes) {
    const exp = exportMap.get(route.handler);
    if (!exp) {
      console.warn(`Missing handler ${route.handler} in ${mod.name}`);
      continue;
    }
    if (seen.has(route.handler + "|" + route.routePath + "|" + route.method)) continue;
    seen.add(route.handler + "|" + route.routePath + "|" + route.method);
    const asyncKw = exp.asyncPref ? "async " : "";
    let args = "req: any, res: any";
    if (/\(\s*req\s*,\s*res\s*,\s*next/.test(exp.sig)) args = "req: any, res: any, next: any";
    methods.push(
      `  ${decoratorFor(route.method, route.routePath)}\n  ${asyncKw}${route.handler}(@Req() ${args.replace("req: any, res: any", "req: any, @Res() res: any")}) ${exp.body}`,
    );
  }

  for (const exp of exportsFound) {
    const used = routes.some((r) => r.handler === exp.name);
    if (used) continue;
    const asyncKw = exp.asyncPref ? "async " : "";
    methods.push(`  ${asyncKw}${exp.name}(req: any, res: any) ${exp.body}`);
  }

  let onInit = "";
  if (useCron) {
    onInit = `
  onModuleInit() {
${cronBlocks.map((b) => "    " + b).join("\n")}
  }
`;
  }

  const remainderBlock = remainder
    ? `\n${remainder}\n`
    : "";

  return `// @ts-nocheck
${imports.join("\n")}

${lets.join("\n")}
${remainderBlock}
@Controller("${mod.prefix}")
export class ${mod.className}Controller${useCron ? " implements OnModuleInit" : ""} {
  constructor(
    ${ctorParams.join(",\n    ")},
  ) {
${ctorBody.join("\n")}
  }
${onInit}
${methods.join("\n\n")}
}
`;
}

function buildModule(mod) {
  return `import { Module } from "@nestjs/common";
import { ${mod.className}Controller } from "./${mod.folder.split("/").pop() === mod.folder ? path.basename(mod.folder) : mod.folder}.controller";

@Module({
  controllers: [${mod.className}Controller],
})
export class ${mod.className}Module {}
`;
}

function fileBase(mod) {
  return mod.folder;
}

for (const mod of MODULES) {
  const controllerPath = path.join(ROOT, "controllers", mod.controller);
  const routesPath = path.join(ROOT, "routes", mod.routes);
  if (!fs.existsSync(controllerPath) || !fs.existsSync(routesPath)) {
    console.log("skip", mod.name);
    continue;
  }
  const controllerSrc = fs.readFileSync(controllerPath, "utf8");
  const routesSrc = fs.readFileSync(routesPath, "utf8");
  const routes = parseRoutes(routesSrc);
  const outDir = path.join(SRC, mod.folder);
  fs.mkdirSync(outDir, { recursive: true });
  const controllerOut = buildController(mod, controllerSrc, routes);
  const fileName = mod.folder;
  fs.writeFileSync(path.join(outDir, `${fileName}.controller.ts`), controllerOut);
  const moduleSrc = `import { Module } from "@nestjs/common";
import { ${mod.className}Controller } from "./${fileName}.controller";

@Module({
  controllers: [${mod.className}Controller],
})
export class ${mod.className}Module {}
`;
  fs.writeFileSync(path.join(outDir, `${fileName}.module.ts`), moduleSrc);
  console.log(`${mod.name}: ${routes.length} routes -> src/modules/${mod.folder}`);
}

console.log("conversion complete");
