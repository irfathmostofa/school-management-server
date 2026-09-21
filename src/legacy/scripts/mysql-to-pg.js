const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "..", "rooh_db.sql");
const outPath = path.join(__dirname, "..", "database", "schema.postgresql.sql");

const RESERVED = new Set([
  "user",
  "session",
  "group",
  "order",
  "table",
  "constraint",
  "check",
  "limit",
  "offset",
  "column",
  "default",
  "primary",
  "start",
  "end",
  "references",
]);

function ident(name) {
  const cleaned = String(name)
    .replace(/`/g, "")
    .replace(/\(\d+\)/g, "")
    .trim();
  if (RESERVED.has(cleaned.toLowerCase())) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

function convertType(raw) {
  let t = raw.trim();
  t = t.replace(/CHARACTER SET \w+/gi, "");
  t = t.replace(/COLLATE \w+/gi, "");
  t = t.replace(/\s+/g, " ").trim();

  const lower = t.toLowerCase();
  if (/^tinyint\s*\(\s*1\s*\)/.test(lower)) return t.replace(/^tinyint\s*\(\s*1\s*\)/i, "SMALLINT");
  if (/^tinyint/.test(lower)) return t.replace(/^tinyint(\s*\(\s*\d+\s*\))?/i, "SMALLINT");
  if (/^smallint/.test(lower)) return t.replace(/^smallint(\s*\(\s*\d+\s*\))?/i, "SMALLINT");
  if (/^mediumint/.test(lower)) return t.replace(/^mediumint(\s*\(\s*\d+\s*\))?(\s+unsigned)?/i, "INTEGER");
  if (/^bigint/.test(lower)) return t.replace(/^bigint(\s*\(\s*\d+\s*\))?(\s+unsigned)?/i, "BIGINT");
  if (/^int/.test(lower) || /^integer/.test(lower)) {
    return t.replace(/^(int|integer)(\s*\(\s*\d+\s*\))?(\s+unsigned)?/i, "INTEGER");
  }
  if (/^double/.test(lower) || /^float/.test(lower)) return t.replace(/^(double|float)(\s*\([^)]*\))?/i, "DOUBLE PRECISION");
  if (/^decimal/.test(lower) || /^numeric/.test(lower)) return t;
  if (/^(tiny|medium|long)?text/.test(lower)) return t.replace(/^(tiny|medium|long)?text/i, "TEXT");
  if (/^longblob|^blob|^mediumblob|^tinyblob/.test(lower)) return "BYTEA";
  if (/^datetime/.test(lower)) return t.replace(/^datetime/i, "TIMESTAMP");
  if (/^timestamp/.test(lower)) return t.replace(/^timestamp/i, "TIMESTAMP");
  if (/^date/.test(lower)) return t;
  if (/^time/.test(lower)) return t;
  if (/^year/.test(lower)) return "INTEGER";
  if (/^enum\s*\(/i.test(t)) {
    const inner = t.match(/enum\s*\((.*)\)/i);
    return inner ? `VARCHAR(255)` : "TEXT";
  }
  if (/^set\s*\(/i.test(t)) return "TEXT";
  if (/^json/.test(lower)) return "JSONB";
  if (/^varchar/.test(lower) || /^char/.test(lower)) return t;
  return t;
}

function convertDefault(expr) {
  if (!expr) return "";
  const e = expr.trim();
  if (/^CURRENT_TIMESTAMP/i.test(e)) return "DEFAULT CURRENT_TIMESTAMP";
  if (/^NULL$/i.test(e)) return "DEFAULT NULL";
  return `DEFAULT ${e}`;
}

const sql = fs.readFileSync(srcPath, "utf8");

const tables = new Map();
const autoIncrement = new Map();
const primaryKeys = new Map();
const uniqueKeys = [];
const indexes = [];
const foreignKeys = [];
const inserts = [];
const views = [];

const createRe = /CREATE TABLE `([^`]+)`\s*\(([\s\S]*?)\)\s*ENGINE[^;]*;/gi;
let m;
while ((m = createRe.exec(sql))) {
  const table = m[1];
  const body = m[2];
  const cols = [];
  const lines = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (let line of lines) {
    line = line.replace(/,$/, "");
    if (!line.startsWith("`")) continue;
    const colMatch = line.match(/^`([^`]+)`\s+(.+)$/);
    if (!colMatch) continue;
    const colName = colMatch[1];
    let rest = colMatch[2];
    let notNull = /\bNOT NULL\b/i.test(rest);
    rest = rest.replace(/\bNOT NULL\b/i, "");
    let def = "";
    const defMatch = rest.match(/\bDEFAULT\s+((?:'[^']*')|(?:"[^"]*")|(?:NULL)|(?:CURRENT_TIMESTAMP(?:\s+ON UPDATE CURRENT_TIMESTAMP)?)|(?:-?\d+(?:\.\d+)?)|(?:\([^)]*\)))/i);
    if (defMatch) {
      def = defMatch[1].replace(/\s+ON UPDATE CURRENT_TIMESTAMP/i, "");
      rest = rest.replace(defMatch[0], "");
    }
    rest = rest.replace(/\bAUTO_INCREMENT\b/i, "");
    rest = rest.replace(/\bCOMMENT\s+'[^']*'/gi, "");
    rest = rest.replace(/\bUNSIGNED\b/gi, "");
    rest = rest.replace(/\bZEROFILL\b/gi, "");
    rest = rest.replace(/\s+/g, " ").trim();
    const pgType = convertType(rest);
    cols.push({ name: colName, type: pgType, notNull, def });
  }
  tables.set(table, cols);
}

function parseKeyCols(raw) {
  return raw
    .replace(/\s+USING\s+\w+/gi, "")
    .split(",")
    .map((c) => c.trim().replace(/`/g, "").replace(/\(\d+\)/g, "").trim())
    .filter(Boolean);
}

const alterBlockRe = /ALTER TABLE `([^`]+)`\s+([\s\S]*?);/gi;
while ((m = alterBlockRe.exec(sql))) {
  const table = m[1];
  const body = m[2].replace(/`([^`]+)`\s*\(\d+\)/g, "`$1`");
  const pkMatch = body.match(/ADD PRIMARY KEY \(([^)]+)\)/i);
  if (pkMatch) primaryKeys.set(table, parseKeyCols(pkMatch[1]));

  const uniqIter = body.matchAll(/ADD UNIQUE KEY `([^`]+)` \(([^)]+)\)(?:\s+USING\s+(\w+))?/gi);
  for (const um of uniqIter) {
    uniqueKeys.push({ table, name: um[1], cols: parseKeyCols(um[2]) });
  }

  const idxIter = body.matchAll(/ADD KEY `([^`]+)` \(([^)]+)\)(?:\s+USING\s+(\w+))?/gi);
  for (const im of idxIter) {
    indexes.push({ table, name: im[1], cols: parseKeyCols(im[2]) });
  }
}

const aiRe = /ALTER TABLE `([^`]+)`\s+MODIFY `([^`]+)` [^,]*AUTO_INCREMENT(?:\s*,\s*AUTO_INCREMENT\s*=\s*(\d+))?/gi;
while ((m = aiRe.exec(sql))) {
  autoIncrement.set(`${m[1]}.${m[2]}`, Number(m[3] || 1));
}

const fkRe = /ALTER TABLE `([^`]+)`\s+ADD CONSTRAINT `([^`]+)` FOREIGN KEY \(([^)]+)\) REFERENCES `([^`]+)` \(([^)]+)\)([^;]*)/gi;
while ((m = fkRe.exec(sql))) {
  foreignKeys.push({
    table: m[1],
    name: m[2],
    cols: m[3].split(",").map((c) => c.trim().replace(/`/g, "")),
    refTable: m[4],
    refCols: m[5].split(",").map((c) => c.trim().replace(/`/g, "")),
    extra: m[6] || "",
  });
}

const insertRe = /INSERT INTO `([^`]+)`(?:\s*\(([^)]*)\))?\s*VALUES\s*([\s\S]*?);/gi;
while ((m = insertRe.exec(sql))) {
  inserts.push({ table: m[1], cols: m[2] || "", values: m[3] });
}

const viewRe = /CREATE ALGORITHM=UNDEFINED[\s\S]*?VIEW `([^`]+)`\s+AS\s+([\s\S]*?);/gi;
while ((m = viewRe.exec(sql))) {
  let def = m[2];
  def = def.replace(/`/g, "");
  def = def.replace(/\bconcat\s*\(/gi, "CONCAT(");
  views.push({ name: m[1], def });
}

const out = [];
out.push("-- PostgreSQL schema converted from rooh_db.sql");
out.push("BEGIN;");
out.push("");

for (const [table, cols] of tables) {
  out.push(`CREATE TABLE IF NOT EXISTS ${ident(table)} (`);
  const pk = primaryKeys.get(table) || [];
  const lines = cols.map((col, i) => {
    const isAi = autoIncrement.has(`${table}.${col.name}`);
    const isPkSingle = pk.length === 1 && pk[0] === col.name;
    let type = col.type;
    if (isAi && /INTEGER|BIGINT|SMALLINT/i.test(type)) {
      type = "INTEGER GENERATED BY DEFAULT AS IDENTITY";
    }
    let line = `  ${ident(col.name)} ${type}`;
    if (col.notNull && !isAi) line += " NOT NULL";
    else if (col.notNull && isAi) line += " NOT NULL";
    if (col.def !== "" && !isAi) {
      let d = col.def;
      if (d === "NULL") line += " DEFAULT NULL";
      else line += ` DEFAULT ${d}`;
    }
    if (isPkSingle) line += " PRIMARY KEY";
    return line;
  });
  if (pk.length > 1) {
    lines.push(`  PRIMARY KEY (${pk.map(ident).join(", ")})`);
  }
  out.push(lines.join(",\n"));
  out.push(");");
  out.push("");
}

const usedIndexNames = new Set();
function uniqueIndexName(base) {
  let name = base.slice(0, 60);
  let i = 2;
  while (usedIndexNames.has(name.toLowerCase())) {
    name = `${base.slice(0, 50)}_${i++}`;
  }
  usedIndexNames.add(name.toLowerCase());
  return name;
}

for (const u of uniqueKeys) {
  const idxName = uniqueIndexName(`uq_${u.table}_${u.name}`.replace(/[^A-Za-z0-9_]/g, "_"));
  out.push(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${ident(idxName)} ON ${ident(u.table)} (${u.cols.map(ident).join(", ")});`
  );
}
out.push("");

for (const ix of indexes) {
  const idxName = uniqueIndexName(`idx_${ix.table}_${ix.name}`.replace(/[^A-Za-z0-9_]/g, "_"));
  out.push(
    `CREATE INDEX IF NOT EXISTS ${ident(idxName)} ON ${ident(ix.table)} (${ix.cols.map(ident).join(", ")});`
  );
}
out.push("");

function convertInsertValues(values) {
  return values.replace(/\\'/g, "''");
}

for (const ins of inserts) {
  const colSql = ins.cols
    ? ` (${ins.cols
        .split(",")
        .map((c) => ident(c.trim().replace(/`/g, "")))
        .join(", ")})`
    : "";
  out.push(`INSERT INTO ${ident(ins.table)}${colSql} VALUES ${convertInsertValues(ins.values)};`);
}
out.push("");

for (const [key, start] of autoIncrement) {
  const [table, col] = key.split(".");
  out.push(
    `SELECT setval(pg_get_serial_sequence('${table.replace(/'/g, "''")}', '${col.replace(/'/g, "''")}'), GREATEST(${start}, 1), true);`
  );
}
out.push("");

for (const fk of foreignKeys) {
  const extra = fk.extra
    .replace(/ON UPDATE CASCADE/gi, "ON UPDATE CASCADE")
    .replace(/ON DELETE CASCADE/gi, "ON DELETE CASCADE")
    .replace(/ON DELETE SET NULL/gi, "ON DELETE SET NULL")
    .replace(/ON UPDATE SET NULL/gi, "ON UPDATE SET NULL");
  out.push(
    `ALTER TABLE ${ident(fk.table)} ADD CONSTRAINT ${ident(fk.name)} FOREIGN KEY (${fk.cols.map(ident).join(", ")}) REFERENCES ${ident(fk.refTable)} (${fk.refCols.map(ident).join(", ")})${extra};`
  );
}
out.push("");

for (const v of views) {
  out.push(`CREATE OR REPLACE VIEW ${ident(v.name)} AS ${v.def};`);
}

out.push("COMMIT;");

const uniqueMap = {};
for (const u of uniqueKeys) {
  if (!uniqueMap[u.table]) uniqueMap[u.table] = [];
  uniqueMap[u.table].push(u.cols);
}
for (const [table, cols] of primaryKeys) {
  if (!uniqueMap[table]) uniqueMap[table] = [cols];
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out.join("\n"));
fs.writeFileSync(
  path.join(__dirname, "..", "config", "uniqueKeys.json"),
  JSON.stringify(uniqueMap, null, 2)
);
console.log(`Wrote ${outPath}`);
console.log(`tables=${tables.size} inserts=${inserts.length} unique=${uniqueKeys.length} indexes=${indexes.length}`);
