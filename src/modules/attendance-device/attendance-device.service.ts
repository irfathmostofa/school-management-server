// @ts-nocheck
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { NotificationService } from "../../common/notification/notification.service";

const DEFAULT_API_URL = "https://rumytechnologies.com/rams/json_api";
const DEFAULT_OPERATION = "fetch_log";
const DEFAULT_INTERVAL = 15;
const TICK_MS = 30000;

@Injectable()
export class AttendanceDeviceService implements OnModuleInit, OnModuleDestroy {
  private tickTimer: NodeJS.Timeout | null = null;
  private runningIds = new Set<number>();

  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationService,
  ) {}

  async onModuleInit() {
    await this.ensureTables();
    this.startScheduler();
  }

  onModuleDestroy() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  private q(sql: string, params: any = []) {
    return new Promise((resolve, reject) => {
      this.db.query(sql, params, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  private async ensureTables() {
    await this.q(`
      CREATE TABLE IF NOT EXISTS attendance_device_setting (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) DEFAULT 'Attendance Device',
        api_url TEXT NOT NULL,
        auth_user VARCHAR(255) DEFAULT '',
        auth_code VARCHAR(255) DEFAULT '',
        operation VARCHAR(100) DEFAULT 'fetch_log',
        connected BOOLEAN DEFAULT FALSE,
        sync_mode VARCHAR(20) DEFAULT 'manual',
        sync_interval_minutes INTEGER DEFAULT 15,
        student_prefixes TEXT DEFAULT 'ahb-,ahg-',
        last_sync_at TIMESTAMP,
        last_sync_status VARCHAR(50),
        last_sync_message TEXT,
        last_connected_at TIMESTAMP,
        last_log_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  private getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private parsePrefixes(raw: string) {
    return String(raw || "")
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
  }

  private formatTime(accessTime: any) {
    if (accessTime instanceof Date && !Number.isNaN(accessTime.getTime())) {
      const h = String(accessTime.getHours()).padStart(2, "0");
      const m = String(accessTime.getMinutes()).padStart(2, "0");
      const s = String(accessTime.getSeconds()).padStart(2, "0");
      return `${h}:${m}:${s}`;
    }
    const raw = String(accessTime || "00:00:00");
    const timePart = raw.includes("T") ? raw.split("T")[1] : raw;
    const parts = timePart.replace("Z", "").split(":");
    const h = (parts[0] || "00").padStart(2, "0");
    const m = (parts[1] || "00").padStart(2, "0");
    const s = String(parts[2] || "00").split(".")[0].padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  private diffTime(inTime: string, outTime: string) {
    try {
      const [ih, im, is] = String(inTime).split(":").map(Number);
      const [oh, om, os] = String(outTime).split(":").map(Number);
      let sec = oh * 3600 + om * 60 + os - (ih * 3600 + im * 60 + is);
      if (Number.isNaN(sec) || sec < 0) sec = 0;
      const h = String(Math.floor(sec / 3600)).padStart(2, "0");
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    } catch {
      return "00:00:00";
    }
  }

  private sanitizeSetting(row: any) {
    if (!row) return row;
    return {
      ...row,
      has_auth_code: Boolean(row.auth_code),
      auth_code: row.auth_code ? "********" : "",
    };
  }

  private async getSettingById(id: number) {
    const rows: any = await this.q(
      "SELECT * FROM attendance_device_setting WHERE id = ?",
      [id],
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private startScheduler() {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => {
      this.runDueAutoSyncs().catch((err) => {
        console.error("Attendance auto sync tick error:", err.message);
      });
    }, TICK_MS);
  }

  private async runDueAutoSyncs() {
    const rows: any = await this.q(
      `SELECT * FROM attendance_device_setting
       WHERE connected = TRUE
         AND sync_mode = 'auto'
         AND status = 'active'`,
    );
    if (!Array.isArray(rows) || !rows.length) return;

    const now = Date.now();
    for (const device of rows) {
      const intervalMs = Math.max(1, Number(device.sync_interval_minutes) || DEFAULT_INTERVAL) * 60 * 1000;
      const last = device.last_sync_at ? new Date(device.last_sync_at).getTime() : 0;
      if (!last || now - last >= intervalMs) {
        this.syncDevice(device).catch((err) => {
          console.error(`Auto sync failed for device ${device.id}:`, err.message);
        });
      }
    }
  }

  private async fetchDeviceLogs(device: any, startDate: string, endDate: string) {
    const body: any = {
      operation: device.operation || DEFAULT_OPERATION,
      auth_code: device.auth_code,
      start_date: startDate,
      end_date: endDate,
      start_time: "00:00:00",
      end_time: "23:59:59",
    };
    if (device.auth_user) body.auth_user = device.auth_user;

    const response = await fetch(device.api_url || DEFAULT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Device API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const logs = data?.log;
    if (!Array.isArray(logs)) {
      throw new Error("Device API returned no log array");
    }
    return logs;
  }

  private async upsertEmployeeLog(row: any) {
    const empID = String(row.registration_id || "").trim();
    const empName = (row.user_name || "Unknown").trim();
    const date = row.access_date;
    const time = this.formatTime(row.access_time);
    const existing: any = await this.q(
      "SELECT inTime FROM attendance_device WHERE empID = ? AND date = ? LIMIT 1",
      [empID, date],
    );
    if (Array.isArray(existing) && existing.length) {
      const inTime = this.formatTime(existing[0].inTime || time);
      const total = this.diffTime(inTime, time);
      await this.q(
        `UPDATE attendance_device
         SET empName = ?, outTime = ?, total_time = ?
         WHERE empID = ? AND date = ?`,
        [empName, time, total, empID, date],
      );
      return;
    }
    await this.q(
      `INSERT INTO attendance_device (empID, empName, date, inTime, outTime, total_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [empID, empName, date, time, time, "00:00:00"],
    );
  }

  private async upsertStudentLog(row: any) {
    let registrationId = String(row.registration_id || "").trim();
    const userName = (row.user_name || "Unknown").trim();
    const accessDate = row.access_date;
    const formattedTime = this.formatTime(row.access_time);

    const result: any = await this.q(
      `INSERT INTO student_attendance_device
        (student_id, studentName, attendance_date, inTime, outTime)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE outTime = VALUES(outTime)`,
      [registrationId, userName, accessDate, formattedTime, formattedTime],
    );

    if (!result || result.affectedRows < 1) return;

    const alreadyNotified: any = await this.q(
      `SELECT id FROM notifications
       WHERE LOWER("user") = LOWER(?)
         AND section = 'attendance'
         AND notification_date = ?
       LIMIT 1`,
      [registrationId, accessDate],
    );
    if (Array.isArray(alreadyNotified) && alreadyNotified.length > 0) return;

    await this.q(
      `INSERT INTO notifications
        ("user", title, body, section, "content_Id", notification_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        registrationId,
        "Attendance Recorded",
        `Hello ${userName || "Student"}, your attendance has been successfully marked on ${accessDate} at ${formattedTime}.`,
        "attendance",
        registrationId,
        accessDate,
      ],
    );

    const tokens: any = await this.q(
      `SELECT device FROM student_login_information
       WHERE LOWER(student_id) = LOWER(?) AND device IS NOT NULL
       UNION ALL
       SELECT device FROM parent_login_information
       WHERE LOWER(student_id) = LOWER(?) AND device IS NOT NULL`,
      [registrationId, registrationId],
    );
    if (!Array.isArray(tokens) || !tokens.length) return;

    for (const t of tokens) {
      try {
        await this.notifications.sendAttendanceNotification(
          t.device,
          "Attendance Recorded",
          `Hello ${userName || "Student"}, your attendance has been successfully marked on ${accessDate} at ${formattedTime}.`,
          "http://test.com",
          "attendance",
          registrationId,
          registrationId,
          accessDate,
        );
      } catch (notifError) {
        console.error("Notification send error:", notifError.message);
      }
    }
  }

  private async syncDevice(device: any, startDate?: string, endDate?: string) {
    const id = Number(device.id);
    if (this.runningIds.has(id)) {
      return { skipped: true, message: "Sync already running for this device" };
    }

    this.runningIds.add(id);
    const from = startDate || this.getCurrentDate();
    const to = endDate || from;
    let employeeCount = 0;
    let studentCount = 0;
    let skipped = 0;

    try {
      const logs = await this.fetchDeviceLogs(device, from, to);
      const prefixes = this.parsePrefixes(device.student_prefixes);

      for (const row of logs) {
        try {
          if (!row?.registration_id || !row?.access_date || !row?.access_time) {
            skipped += 1;
            continue;
          }
          await this.upsertEmployeeLog(row);
          employeeCount += 1;
          const rid = String(row.registration_id).trim().toLowerCase();
          const isStudent = prefixes.some((p) => rid.startsWith(p));
          if (isStudent) {
            await this.upsertStudentLog(row);
            studentCount += 1;
          }
        } catch (rowError) {
          skipped += 1;
          console.error("Attendance row error:", rowError.message);
        }
      }

      const message = `Synced ${logs.length} logs (${employeeCount} employee, ${studentCount} student, ${skipped} skipped)`;
      await this.q(
        `UPDATE attendance_device_setting SET
           last_sync_at = NOW(),
           last_sync_status = ?,
           last_sync_message = ?,
           last_log_count = ?,
           updated_at = NOW()
         WHERE id = ?`,
        ["success", message, logs.length, id],
      );

      return {
        ok: true,
        employeeCount,
        studentCount,
        skipped,
        total: logs.length,
        message,
      };
    } catch (error) {
      const message = error.message || "Sync failed";
      await this.q(
        `UPDATE attendance_device_setting SET
           last_sync_at = NOW(),
           last_sync_status = ?,
           last_sync_message = ?,
           updated_at = NOW()
         WHERE id = ?`,
        ["failed", message, id],
      );
      throw error;
    } finally {
      this.runningIds.delete(id);
    }
  }

  addAttendanceDeviceSetting(req: any, res: any) {
    const {
      name,
      api_url,
      auth_user,
      auth_code,
      operation,
      student_prefixes,
      sync_mode,
      sync_interval_minutes,
    } = req.body || {};

    if (!api_url && !auth_code) {
      return res.json({
        ok: false,
        message: "api_url or auth_code is required",
      });
    }

    const payload = {
      name: name || "Attendance Device",
      api_url: api_url || DEFAULT_API_URL,
      auth_user: auth_user || "",
      auth_code: auth_code || "",
      operation: operation || DEFAULT_OPERATION,
      student_prefixes: student_prefixes || "ahb-,ahg-",
      sync_mode: sync_mode === "auto" ? "auto" : "manual",
      sync_interval_minutes: Number(sync_interval_minutes) || DEFAULT_INTERVAL,
      connected: false,
      status: "active",
    };

    this.db.query(
      "INSERT INTO attendance_device_setting SET ?",
      payload,
      (err: any, result: any) => {
        if (err) {
          return res.json({ ok: false, message: err });
        }
        res.json({
          ok: true,
          message: "Device setting saved. Connect the device to enable sync.",
          id: result.insertId,
        });
      },
    );
  }

  getAttendanceDeviceSetting(req: any, res: any) {
    this.db.query(
      "SELECT * FROM attendance_device_setting ORDER BY id DESC",
      (err: any, result: any) => {
        if (err) {
          return res.json({ ok: false, message: err });
        }
        const rows = Array.isArray(result) ? result.map((r) => this.sanitizeSetting(r)) : [];
        res.json({ ok: true, message: rows });
      },
    );
  }

  getAttendanceDeviceSettingById(req: any, res: any) {
    const { id } = req.body || {};
    if (!id) {
      return res.json({ ok: false, message: "id is required" });
    }
    this.db.query(
      "SELECT * FROM attendance_device_setting WHERE id = ?",
      [id],
      (err: any, result: any) => {
        if (err) {
          return res.json({ ok: false, message: err });
        }
        if (!result || !result.length) {
          return res.json({ ok: false, message: "Device setting not found" });
        }
        res.json({ ok: true, message: this.sanitizeSetting(result[0]) });
      },
    );
  }

  updateAttendanceDeviceSetting(req: any, res: any) {
    const {
      id,
      name,
      api_url,
      auth_user,
      auth_code,
      operation,
      student_prefixes,
      status,
    } = req.body || {};

    if (!id) {
      return res.json({ ok: false, message: "id is required" });
    }

    this.getSettingById(Number(id))
      .then((existing) => {
        if (!existing) {
          return res.json({ ok: false, message: "Device setting not found" });
        }

        const data: any = {
          name: name ?? existing.name,
          api_url: api_url ?? existing.api_url,
          auth_user: auth_user ?? existing.auth_user,
          operation: operation ?? existing.operation,
          student_prefixes: student_prefixes ?? existing.student_prefixes,
          status: status ?? existing.status,
          connected: false,
          updated_at: new Date(),
        };
        if (typeof auth_code === "string" && auth_code && auth_code !== "********") {
          data.auth_code = auth_code;
        }

        this.db.query(
          "UPDATE attendance_device_setting SET ? WHERE id = ?",
          [data, id],
          (err: any) => {
            if (err) {
              return res.json({ ok: false, message: err });
            }
            res.json({
              ok: true,
              message: "Device setting updated. Reconnect to verify API access.",
            });
          },
        );
      })
      .catch((err) => res.json({ ok: false, message: err.message }));
  }

  async connectAttendanceDevice(req: any, res: any) {
    const {
      id,
      name,
      api_url,
      auth_user,
      auth_code,
      operation,
      student_prefixes,
    } = req.body || {};

    try {
      let device = id ? await this.getSettingById(Number(id)) : null;

      if (!device) {
        if (!auth_code) {
          return res.json({ ok: false, message: "auth_code is required to connect" });
        }
        const inserted: any = await this.q(
          "INSERT INTO attendance_device_setting SET ?",
          {
            name: name || "Attendance Device",
            api_url: api_url || DEFAULT_API_URL,
            auth_user: auth_user || "",
            auth_code,
            operation: operation || DEFAULT_OPERATION,
            student_prefixes: student_prefixes || "ahb-,ahg-",
            sync_mode: "manual",
            sync_interval_minutes: DEFAULT_INTERVAL,
            connected: false,
            status: "active",
          },
        );
        device = await this.getSettingById(inserted.insertId);
      } else {
        const patch: any = {
          name: name ?? device.name,
          api_url: api_url ?? device.api_url,
          auth_user: auth_user ?? device.auth_user,
          operation: operation ?? device.operation,
          student_prefixes: student_prefixes ?? device.student_prefixes,
          updated_at: new Date(),
        };
        if (typeof auth_code === "string" && auth_code && auth_code !== "********") {
          patch.auth_code = auth_code;
          device.auth_code = auth_code;
        }
        if (api_url) device.api_url = api_url;
        if (auth_user !== undefined) device.auth_user = auth_user;
        if (operation) device.operation = operation;
        await this.q("UPDATE attendance_device_setting SET ? WHERE id = ?", [
          patch,
          device.id,
        ]);
      }

      const today = this.getCurrentDate();
      const logs = await this.fetchDeviceLogs(device, today, today);

      await this.q(
        `UPDATE attendance_device_setting SET
           connected = TRUE,
           last_connected_at = NOW(),
           last_sync_status = ?,
           last_sync_message = ?,
           last_log_count = ?,
           updated_at = NOW()
         WHERE id = ?`,
        ["connected", `Connection successful. ${logs.length} log(s) found for today.`, logs.length, device.id],
      );

      return res.json({
        ok: true,
        message: "Device connected successfully. Choose manual or auto sync.",
        id: device.id,
        logCount: logs.length,
        connected: true,
      });
    } catch (error) {
      if (id) {
        await this.q(
          `UPDATE attendance_device_setting SET
             connected = FALSE,
             last_sync_status = ?,
             last_sync_message = ?,
             updated_at = NOW()
           WHERE id = ?`,
          ["failed", error.message, id],
        ).catch(() => null);
      }
      return res.json({
        ok: false,
        message: error.message || "Failed to connect device API",
        connected: false,
      });
    }
  }

  disconnectAttendanceDevice(req: any, res: any) {
    const { id } = req.body || {};
    if (!id) {
      return res.json({ ok: false, message: "id is required" });
    }
    this.db.query(
      `UPDATE attendance_device_setting SET
         connected = FALSE,
         sync_mode = 'manual',
         last_sync_status = ?,
         last_sync_message = ?,
         updated_at = NOW()
       WHERE id = ?`,
      ["disconnected", "Device disconnected", id],
      (err: any) => {
        if (err) {
          return res.json({ ok: false, message: err });
        }
        res.json({ ok: true, message: "Device disconnected", connected: false });
      },
    );
  }

  updateAttendanceDeviceSyncRule(req: any, res: any) {
    const { id, sync_mode, sync_interval_minutes } = req.body || {};
    if (!id) {
      return res.json({ ok: false, message: "id is required" });
    }
    if (sync_mode && !["manual", "auto"].includes(sync_mode)) {
      return res.json({ ok: false, message: "sync_mode must be manual or auto" });
    }

    this.getSettingById(Number(id))
      .then((device) => {
        if (!device) {
          return res.json({ ok: false, message: "Device setting not found" });
        }
        if (!device.connected) {
          return res.json({
            ok: false,
            message: "Connect the device API before selecting a sync rule",
          });
        }

        const interval = Math.min(
          1440,
          Math.max(1, Number(sync_interval_minutes) || Number(device.sync_interval_minutes) || DEFAULT_INTERVAL),
        );
        const mode = sync_mode || device.sync_mode || "manual";

        this.db.query(
          `UPDATE attendance_device_setting SET
             sync_mode = ?,
             sync_interval_minutes = ?,
             updated_at = NOW()
           WHERE id = ?`,
          [mode, interval, id],
          (err: any) => {
            if (err) {
              return res.json({ ok: false, message: err });
            }
            res.json({
              ok: true,
              message:
                mode === "auto"
                  ? `Auto sync enabled every ${interval} minute(s)`
                  : "Manual sync enabled. Use syncAttendanceDevice to pull logs.",
              sync_mode: mode,
              sync_interval_minutes: interval,
            });
          },
        );
      })
      .catch((err) => res.json({ ok: false, message: err.message }));
  }

  async syncAttendanceDevice(req: any, res: any) {
    const { id, start_date, end_date } = req.body || {};
    if (!id) {
      return res.json({ ok: false, message: "id is required" });
    }

    try {
      const device = await this.getSettingById(Number(id));
      if (!device) {
        return res.json({ ok: false, message: "Device setting not found" });
      }
      if (!device.connected) {
        return res.json({
          ok: false,
          message: "Connect the device API before syncing",
        });
      }

      const result = await this.syncDevice(device, start_date, end_date);
      if (result?.skipped) {
        return res.json({ ok: false, message: result.message });
      }
      return res.json({
        ok: true,
        message: result.message,
        employeeCount: result.employeeCount,
        studentCount: result.studentCount,
        skipped: result.skipped,
        total: result.total,
      });
    } catch (error) {
      return res.json({
        ok: false,
        message: error.message || "Failed to sync attendance device",
      });
    }
  }
}
