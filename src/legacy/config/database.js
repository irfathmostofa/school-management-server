const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });
const { Pool } = require("pg");

let uniqueKeys = {};
try {
  uniqueKeys = require("./uniqueKeys.json");
} catch (err) {
  uniqueKeys = {};
}

const STRIP_PARAMS = ["sslmode", "ssl", "channel_binding", "uselibpqcompat"];

function envFlag(name) {
  const value = process.env[name];
  if (value == null || value === "") return undefined;
  const normalized = String(value).toLowerCase();
  if (["1", "true", "yes", "require"].includes(normalized)) return true;
  if (["0", "false", "no", "disable", "disabled"].includes(normalized)) {
    return false;
  }
  return undefined;
}

function isNeonHost(value) {
  return /(^|\.)neon\.(tech|build)(:|\/|\?|$)/i.test(value || "");
}

function trimEnv(value) {
  if (value == null) return undefined;
  const trimmed = String(value).trim().replace(/^['"]|['"]$/g, "");
  return trimmed || undefined;
}

function getDatabaseUrl() {
  return (
    trimEnv(process.env.DATABASE_URL) ||
    trimEnv(process.env.POSTGRES_URL) ||
    trimEnv(process.env.POSTGRES_PRISMA_URL) ||
    trimEnv(process.env.NEON_DATABASE_URL) ||
    undefined
  );
}

function sanitizeConnectionString(connectionString) {
  try {
    const parsed = new URL(connectionString);
    for (const key of STRIP_PARAMS) {
      parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch (_err) {
    return connectionString;
  }
}

function shouldUseSsl(connectionString) {
  const sslFlag = envFlag("DB_SSL");
  if (sslFlag !== undefined) return sslFlag;

  if (!connectionString) {
    return isNeonHost(process.env.DB_HOST || "");
  }

  try {
    const parsed = new URL(connectionString);
    const sslMode = (
      parsed.searchParams.get("sslmode") ||
      process.env.PGSSLMODE ||
      ""
    ).toLowerCase();
    if (sslMode === "disable") return false;
    if (["require", "verify-ca", "verify-full", "prefer"].includes(sslMode)) {
      return true;
    }
    return isNeonHost(parsed.hostname);
  } catch (_err) {
    const lower = String(connectionString).toLowerCase();
    if (lower.includes("sslmode=disable")) return false;
    return (
      lower.includes("sslmode=require") ||
      lower.includes("sslmode=verify") ||
      isNeonHost(lower)
    );
  }
}

function createPgPoolConfig() {
  const rawUrl = getDatabaseUrl();
  const useSsl = shouldUseSsl(rawUrl);
  const ssl = useSsl ? { rejectUnauthorized: false } : undefined;
  const isNeon = rawUrl
    ? isNeonHost(rawUrl)
    : isNeonHost(process.env.DB_HOST || "");
  const max = Number(process.env.DB_POOL_MAX) || (isNeon ? 5 : 20);
  const idleTimeoutMillis =
    Number(process.env.DB_IDLE_TIMEOUT) || (isNeon ? 10000 : 30000);
  const connectionTimeoutMillis =
    Number(process.env.DB_CONNECT_TIMEOUT) || (isNeon ? 20000 : 10000);

  if (rawUrl) {
    return {
      connectionString: sanitizeConnectionString(rawUrl),
      ssl,
      max,
      idleTimeoutMillis,
      connectionTimeoutMillis,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "rooh_db",
    ssl,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };
}

const pool = new Pool(createPgPoolConfig());
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

const RESERVED_TABLES = new Set([
  "user",
  "session",
  "group",
  "order",
  "table",
  "constraint",
  "check",
  "primary",
  "references",
  "limit",
  "offset",
  "column",
  "default",
]);

const RESERVED_COLS = new Set([
  "user",
  "session",
  "group",
  "order",
  "table",
  "start",
  "end",
  "check",
  "default",
  "column",
  "constraint",
  "primary",
  "references",
]);

function quoteIdent(name) {
  const cleaned = String(name).replace(/[`"]/g, "");
  if (RESERVED_TABLES.has(cleaned.toLowerCase()) || RESERVED_COLS.has(cleaned.toLowerCase())) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

function quoteReservedTables(sql) {
  return sql.replace(
    /\b(FROM|INTO|UPDATE|JOIN|TABLE)\s+(`?)([A-Za-z_][A-Za-z0-9_]*)\2/gi,
    (full, kw, _q, name) => {
      if (RESERVED_TABLES.has(name.toLowerCase())) {
        return `${kw} ${quoteIdent(name)}`;
      }
      return `${kw} ${name}`;
    }
  );
}

function quoteDottedReserved(sql) {
  return sql.replace(
    /\.(\s*)(`?)([A-Za-z_][A-Za-z0-9_]*)\2/g,
    (full, sp, _q, name) => {
      if (RESERVED_COLS.has(name.toLowerCase())) {
        return `.${sp}${quoteIdent(name)}`;
      }
      return full;
    }
  );
}

function convertMysqlFunctions(sql) {
  let out = sql;
  out = out.replace(/IFNULL\s*\(/gi, "COALESCE(");
  out = out.replace(/\bCURDATE\s*\(\s*\)/gi, "CURRENT_DATE");
  out = out.replace(/\bNOW\s*\(\s*\)/gi, "NOW()");
  out = out.replace(/\bDAYNAME\s*\(\s*([^)]+)\)/gi, "TO_CHAR(($1)::date, 'FMDay')");
  out = out.replace(
    /DATE_FORMAT\s*\(\s*([^,]+),\s*'%Y-%m'\s*\)/gi,
    "TO_CHAR(($1)::timestamp, 'YYYY-MM')"
  );
  out = out.replace(
    /DATE_FORMAT\s*\(\s*([^,]+),\s*'%Y-%m-%d'\s*\)/gi,
    "TO_CHAR(($1)::timestamp, 'YYYY-MM-DD')"
  );
  out = out.replace(/CAST\s*\(\s*([^)]+)\s+AS\s+UNSIGNED\s*\)/gi, "CAST($1 AS BIGINT)");
  out = out.replace(
    /SUBSTRING_INDEX\s*\(\s*([^,]+),\s*'([^']+)',\s*-1\s*\)/gi,
    "REVERSE(SPLIT_PART(REVERSE($1), '$2', 1))"
  );
  out = out.replace(
    /SUBSTRING_INDEX\s*\(\s*([^,]+),\s*'([^']+)',\s*(\d+)\s*\)/gi,
    "SPLIT_PART($1, '$2', $3)"
  );
  out = out.replace(
    /GROUP_CONCAT\s*\(\s*([\s\S]*?)\s+ORDER\s+BY\s+([\s\S]*?)\s+SEPARATOR\s+'([^']*)'\s*\)/gi,
    "STRING_AGG($1, '$3' ORDER BY $2)"
  );
  out = out.replace(
    /GROUP_CONCAT\s*\(\s*([\s\S]*?)\s+SEPARATOR\s+'([^']*)'\s*\)/gi,
    "STRING_AGG($1, '$2')"
  );
  out = out.replace(/GROUP_CONCAT\s*\(/gi, "STRING_AGG(");
  out = out.replace(/`+/g, "");
  out = quoteDottedReserved(out);
  out = quoteReservedTables(out);
  return out;
}

function splitSqlAndStrings(sql) {
  const parts = [];
  let buf = "";
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = sql[i - 1];
    if (!inDouble && ch === "'" && prev !== "\\") {
      inSingle = !inSingle;
      buf += ch;
      continue;
    }
    if (!inSingle && ch === '"' && prev !== "\\") {
      inDouble = !inDouble;
      buf += ch;
      continue;
    }
    if (!inSingle && !inDouble && ch === "?") {
      parts.push({ type: "sql", value: buf });
      parts.push({ type: "ph" });
      buf = "";
      continue;
    }
    buf += ch;
  }
  parts.push({ type: "sql", value: buf });
  return parts;
}

function flattenParams(sql, params) {
  if (params == null) return { sql, params: [] };
  if (!Array.isArray(params)) {
    if (typeof params === "object") return { sql, params };
    return { sql, params: [params] };
  }

  const parts = splitSqlAndStrings(sql);
  let phIndex = 0;
  let newSql = "";
  const newParams = [];

  for (const part of parts) {
    if (part.type === "sql") {
      newSql += part.value;
      continue;
    }
    const value = params[phIndex++];
    if (Array.isArray(value) && /IN\s*\(\s*$/i.test(newSql.trimEnd())) {
      if (value.length === 0) {
        newSql += "NULL";
      } else {
        newSql += value.map(() => "?").join(", ");
        newParams.push(...value);
      }
    } else {
      newSql += "?";
      newParams.push(value);
    }
  }
  return { sql: newSql, params: newParams };
}

function toNumberedPlaceholders(sql) {
  const parts = splitSqlAndStrings(sql);
  let n = 1;
  let out = "";
  for (const part of parts) {
    if (part.type === "sql") out += part.value;
    else out += `$${n++}`;
  }
  out = out.replace(/LIMIT\s+(\$\d+)\s*,\s*(\$\d+)/gi, (_, a, b) => `LIMIT ${b} OFFSET ${a}`);
  return out;
}

function objectInsert(tableSql, data) {
  const keys = Object.keys(data);
  const cols = keys.map(quoteIdent).join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  return {
    sql: `${tableSql} (${cols}) VALUES (${placeholders})`,
    values: keys.map((k) => data[k]),
    cols: keys,
  };
}

function objectUpdateSet(data) {
  const keys = Object.keys(data);
  const setSql = keys.map((k) => `${quoteIdent(k)} = ?`).join(", ");
  return { setSql, values: keys.map((k) => data[k]) };
}

function getInsertTable(sql) {
  const m = sql.match(/INSERT\s+INTO\s+"?([A-Za-z0-9_]+)"?/i);
  return m ? m[1] : null;
}

function getInsertCols(sql) {
  const m = sql.match(/INSERT\s+INTO\s+"?[A-Za-z0-9_]+"?\s*\(([^)]+)\)/i);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((c) => c.replace(/["`]/g, "").trim())
    .filter(Boolean);
}

function conflictTarget(table, insertCols) {
  const keys = uniqueKeys[table] || [];
  const colsLower = (insertCols || []).map((c) => c.toLowerCase());
  let chosen = keys.find((k) => k.every((c) => colsLower.includes(String(c).toLowerCase())));
  if (!chosen) chosen = keys.find((k) => k.length > 1) || keys[0];
  if (!chosen) return "";
  return `ON CONFLICT (${chosen.map(quoteIdent).join(", ")})`;
}

function mysqlOnDupToConflict(sql, insertCols) {
  const table = getInsertTable(sql);
  const cols = insertCols && insertCols.length ? insertCols : getInsertCols(sql);
  const target = conflictTarget(table, cols);
  const prefix = target || "ON CONFLICT DO NOTHING";
  let out = sql.replace(/ON\s+DUPLICATE\s+KEY\s+UPDATE/gi, `${prefix} DO UPDATE SET`);
  out = out.replace(/VALUES\s*\(([\w.`"]+)\)/gi, (_, col) => {
    const clean = col.replace(/[`"]/g, "");
    return `EXCLUDED.${quoteIdent(clean)}`;
  });
  if (!target) {
    out = out.replace(/ON CONFLICT DO NOTHING DO UPDATE SET[\s\S]*$/i, "ON CONFLICT DO NOTHING");
  }
  return out;
}

function ensureReturning(sql) {
  if (/^\s*INSERT\s+/i.test(sql) && !/\bRETURNING\b/i.test(sql)) {
    return `${sql} RETURNING *`;
  }
  return sql;
}

function wrapResult(pgResult) {
  const command = pgResult.command;
  const rows = pgResult.rows || [];
  if (command === "SELECT" || command === "WITH") {
    return rows;
  }
  const out = rows.slice();
  const first = rows[0] || {};
  const idKey = Object.keys(first).find((k) =>
    /^(id|.*_id|.*_ID|event_ID|Form_ID|task_ID|sticky_ID|transfer_id|comment_ID)$/i.test(k)
  );
  out.insertId = idKey ? first[idKey] : undefined;
  out.affectedRows = pgResult.rowCount || 0;
  out.changedRows = pgResult.rowCount || 0;
  out.rowCount = pgResult.rowCount || 0;
  return out;
}

async function runPrepared(client, sql, params) {
  const converted = convertMysqlFunctions(sql);
  const numbered = toNumberedPlaceholders(converted);
  const finalSql = ensureReturning(numbered);
  const result = await client.query(finalSql, params);
  return wrapResult(result);
}

async function execute(sql, params) {
  const client = await pool.connect();
  try {
    let rawSql = sql;
    let rawParams = params;
    let insertCols = [];

    const dupUpdateObj = /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+\?/i.test(rawSql);
    let updateObject = null;
    if (dupUpdateObj && Array.isArray(rawParams) && rawParams[1] && typeof rawParams[1] === "object") {
      updateObject = rawParams[1];
      rawSql = rawSql.replace(/ON\s+DUPLICATE\s+KEY\s+UPDATE\s+\?/i, "ON DUPLICATE KEY UPDATE __OBJ__");
      rawParams = [rawParams[0], ...rawParams.slice(2)];
    }

    const setMatch = rawSql.match(/^([\s\S]*?)\bSET\s+\?([\s\S]*)$/i);
    if (setMatch && rawParams && !Array.isArray(rawParams) && typeof rawParams === "object") {
      const data = rawParams;
      const prefix = setMatch[1];
      const suffix = setMatch[2] || "";
      if (/INSERT/i.test(prefix)) {
        const built = objectInsert(prefix.replace(/\s+$/, ""), data);
        rawSql = built.sql + suffix;
        rawParams = built.values;
        insertCols = built.cols;
      }
    } else if (
      setMatch &&
      Array.isArray(rawParams) &&
      rawParams[0] &&
      typeof rawParams[0] === "object" &&
      !Array.isArray(rawParams[0])
    ) {
      const data = rawParams[0];
      const prefix = setMatch[1];
      const suffix = setMatch[2] || "";
      if (/UPDATE/i.test(prefix)) {
        const built = objectUpdateSet(data);
        rawSql = `${prefix}SET ${built.setSql}${suffix}`;
        rawParams = [...built.values, ...rawParams.slice(1)];
      } else if (/INSERT/i.test(prefix)) {
        const built = objectInsert(prefix.replace(/\s+$/, ""), data);
        rawSql = built.sql + suffix;
        rawParams = [...built.values, ...rawParams.slice(1)];
        insertCols = built.cols;
      }
    }

    if (updateObject) {
      const setSql = Object.keys(updateObject)
        .map((k) => `${quoteIdent(k)} = EXCLUDED.${quoteIdent(k)}`)
        .join(", ");
      rawSql = rawSql.replace("ON DUPLICATE KEY UPDATE __OBJ__", `ON DUPLICATE KEY UPDATE ${setSql}`);
    }

    const valuesPlaceholder = rawSql.match(/^([\s\S]*VALUES)\s+\?([\s\S]*)$/i);
    if (valuesPlaceholder && Array.isArray(rawParams) && Array.isArray(rawParams[0])) {
      const rows = rawParams[0];
      const extra = rawParams.slice(1);
      if (rows.length && Array.isArray(rows[0])) {
        const all = [];
        const tuples = rows.map((row) => {
          all.push(...row);
          return `(${row.map(() => "?").join(", ")})`;
        });
        rawSql = `${valuesPlaceholder[1]} ${tuples.join(", ")}${valuesPlaceholder[2]}`;
        rawParams = [...all, ...extra];
      }
    }

    if (/ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(rawSql)) {
      rawSql = mysqlOnDupToConflict(rawSql, insertCols);
    }

    const flattened = flattenParams(rawSql, rawParams);
    return await runPrepared(client, flattened.sql, flattened.params);
  } finally {
    client.release();
  }
}

function query(sql, params, cb) {
  if (typeof params === "function") {
    cb = params;
    params = [];
  }
  if (params === undefined) params = [];
  const promise = execute(sql, params);
  if (typeof cb === "function") {
    promise
      .then((result) => cb(null, result || []))
      .catch((err) => {
        console.error("DB query error:", err.message);
        cb(err, []);
      });
    return;
  }
  return promise;
}

async function connect() {
  const client = await pool.connect();
  client.release();
  return true;
}

module.exports = {
  pool,
  query,
  connect,
  db: { query, connect, pool },
};
