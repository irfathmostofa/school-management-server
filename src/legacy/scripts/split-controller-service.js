const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "modules");

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

function splitFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const classMatch = src.match(
    /@Controller\("([^"]*)"\)\s*export class (\w+)Controller(?: implements \w+)?/,
  );
  if (!classMatch) {
    console.log("skip no controller", filePath);
    return;
  }
  const prefix = classMatch[1];
  const className = classMatch[2];
  const classStart = src.indexOf(classMatch[0]);
  const header = src.slice(0, classStart).trimEnd();
  const brace = src.indexOf("{", classStart);
  const classEnd = findMatchingBrace(src, brace);
  const classBody = src.slice(brace + 1, classEnd);

  const ctorRe = /constructor\s*\(([\s\S]*?)\)\s*\{/;
  const ctorMatch = ctorRe.exec(classBody);
  if (!ctorMatch) {
    console.log("skip no ctor", filePath);
    return;
  }
  const ctorParams = ctorMatch[1]
    .trim()
    .replace(/,\s*$/, "");
  const ctorBrace = classBody.indexOf("{", ctorMatch.index + ctorMatch[0].length - 1);
  const ctorEnd = findMatchingBrace(classBody, ctorBrace);
  const ctorBody = classBody.slice(ctorBrace + 1, ctorEnd);
  const afterCtor = classBody.slice(ctorEnd + 1);

  const methodRe =
    /(\n\s*)(@(?:Get|Post|Put|Delete|Patch)\('[^']*'\))\s*\n\s*(async\s+)?([A-Za-z0-9_]+)\(@Req\(\) req: any, @Res\(\) res: any(?:, next: any)?\)\s*/g;
  const methods = [];
  let leftovers = "";
  let cursor = 0;
  let match;
  while ((match = methodRe.exec(afterCtor))) {
    leftovers += afterCtor.slice(cursor, match.index);
    const deco = match[2];
    const asyncKw = match[3] || "";
    const name = match[4];
    const hasNext = match[0].includes("next: any");
    const bodyStart = afterCtor.indexOf("{", match.index + match[0].length - 1);
    if (bodyStart === -1) break;
    const bodyEnd = findMatchingBrace(afterCtor, bodyStart);
    const body = afterCtor.slice(bodyStart, bodyEnd + 1);
    methods.push({ deco, asyncKw, name, hasNext, body });
    cursor = bodyEnd + 1;
    methodRe.lastIndex = cursor;
  }
  leftovers += afterCtor.slice(cursor);

  const dir = path.dirname(filePath);
  const base = path.basename(filePath).replace(".controller.ts", "");

  const serviceHeader = header
    .replace("// @ts-nocheck\n", "")
    .replace(
      /import \{ Controller, Get, Post, Put, Delete, Patch, Req, Res(?:, OnModuleInit)? \} from "@nestjs\/common";/,
      'import { Injectable } from "@nestjs/common";',
    );

  const extraMethods = leftovers.trim();
  const serviceMethods = methods
    .map((m) => {
      const args = m.hasNext ? "req: any, res: any, next?: any" : "req: any, res: any";
      return `  ${m.asyncKw}${m.name}(${args}) ${m.body}`;
    })
    .join("\n\n");

  const serviceSrc = `// @ts-nocheck
${serviceHeader}

@Injectable()
export class ${className}Service {
  constructor(
    ${ctorParams}
  ) {${ctorBody}
  }
${extraMethods ? "\n" + extraMethods + "\n" : ""}
${serviceMethods}
}
`;

  const controllerSrc = `import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { ${className}Service } from "./${base}.service";

@Controller("${prefix}")
export class ${className}Controller {
  constructor(private readonly service: ${className}Service) {}
${methods
  .map((m) => {
    const args = m.hasNext
      ? "@Req() req: any, @Res() res: any"
      : "@Req() req: any, @Res() res: any";
    return `
  ${m.deco}
  ${m.asyncKw}${m.name}(${args}) {
    return this.service.${m.name}(req, res);
  }`;
  })
  .join("\n")}
}
`;

  const moduleSrc = `import { Module } from "@nestjs/common";
import { ${className}Controller } from "./${base}.controller";
import { ${className}Service } from "./${base}.service";

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}
`;

  fs.writeFileSync(path.join(dir, `${base}.service.ts`), serviceSrc);
  fs.writeFileSync(path.join(dir, `${base}.controller.ts`), controllerSrc);
  fs.writeFileSync(path.join(dir, `${base}.module.ts`), moduleSrc);
  console.log(base, methods.length, "methods");
}

const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".controller.ts")) files.push(full);
  }
}
walk(ROOT);
for (const f of files) splitFile(f);
console.log("split complete");
