import pool from "@/lib/db";
import { performBackup } from "@/lib/backupService";

const DEFAULT_INTERVAL_SECONDS = 600;
const SCHEDULER_STATE_KEY = "__nth_auto_backup_scheduler__";

const getSchedulerState = () => {
  if (!globalThis[SCHEDULER_STATE_KEY]) {
    globalThis[SCHEDULER_STATE_KEY] = {
      intervalId: null,
      running: false,
    };
  }
  return globalThis[SCHEDULER_STATE_KEY];
};

const ensureBackupSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS backup_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      enabled BOOLEAN NOT NULL DEFAULT FALSE,
      interval_seconds INTEGER NOT NULL DEFAULT ${DEFAULT_INTERVAL_SECONDS},
      last_run TIMESTAMP WITH TIME ZONE,
      next_run TIMESTAMP WITH TIME ZONE,
      last_error TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(
    `INSERT INTO backup_settings (id, enabled, interval_seconds)
     VALUES (1, FALSE, $1)
     ON CONFLICT (id) DO NOTHING;`,
    [DEFAULT_INTERVAL_SECONDS]
  );
};

const normalizeIntervalSeconds = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < DEFAULT_INTERVAL_SECONDS) {
    return null;
  }
  return Math.floor(parsed);
};

const calculateNextRun = (intervalSeconds, from = new Date()) => {
  return new Date(from.getTime() + intervalSeconds * 1000).toISOString();
};

export const getBackupSettings = async () => {
  await ensureBackupSettingsTable();
  const result = await pool.query(`SELECT * FROM backup_settings WHERE id = 1`);
  return result.rows[0];
};

const scheduleFromSettings = async (settings) => {
  const state = getSchedulerState();
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  if (!settings?.enabled) {
    return;
  }

  const intervalSeconds = normalizeIntervalSeconds(settings.interval_seconds);
  if (!intervalSeconds) {
    return;
  }

  state.intervalId = setInterval(async () => {
    await runAutoBackup();
  }, intervalSeconds * 1000);
};

export const updateBackupSettings = async ({ enabled, interval_seconds }) => {
  await ensureBackupSettingsTable();

  const intervalSeconds = normalizeIntervalSeconds(interval_seconds);
  if (!intervalSeconds) {
    throw new Error(`Interval must be a number >= ${DEFAULT_INTERVAL_SECONDS}`);
  }

  const nextRun = enabled ? calculateNextRun(intervalSeconds) : null;

  await pool.query(
    `UPDATE backup_settings
     SET enabled = $1,
         interval_seconds = $2,
         next_run = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [enabled, intervalSeconds, nextRun]
  );

  const settings = await getBackupSettings();
  await scheduleFromSettings(settings);
  return settings;
};

export const recordBackupRun = async ({ success, error }) => {
  try {
    const settings = await getBackupSettings();
    const intervalSeconds = normalizeIntervalSeconds(settings?.interval_seconds);
    const nextRun = settings?.enabled && intervalSeconds
      ? calculateNextRun(intervalSeconds)
      : null;

    await pool.query(
      `UPDATE backup_settings
       SET last_run = CURRENT_TIMESTAMP,
           next_run = $1,
           last_error = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [nextRun, success ? null : error || "Unknown error"]
    );
  } catch (err) {
    console.error("Failed to record backup run:", err);
  }
};

const runAutoBackup = async () => {
  const state = getSchedulerState();
  if (state.running) return;

  state.running = true;
  try {
    await performBackup();
    await recordBackupRun({ success: true });
  } catch (error) {
    await recordBackupRun({ success: false, error: error.message });
  } finally {
    state.running = false;
  }
};

export const restoreAutoBackup = async () => {
  const settings = await getBackupSettings();
  await scheduleFromSettings(settings);
  return settings;
};
