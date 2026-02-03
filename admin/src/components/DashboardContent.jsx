"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const DashboardContent = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [message, setMessage] = useState(null);
  const [showBackups, setShowBackups] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupSecondsInput, setAutoBackupSecondsInput] = useState("600");
  const [autoBackupSaving, setAutoBackupSaving] = useState(false);
  const [autoBackupMessage, setAutoBackupMessage] = useState(null);
  const [autoBackupStatus, setAutoBackupStatus] = useState(null);

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/superusers-admin/api/backup", {
        headers: {
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setBackups(data.backups || []);
        setShowBackups(true);
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    }
  }, []);

  const createBackup = useCallback(async () => {
    setBackupLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/superusers-admin/api/backup", {
        method: "POST",
        headers: {
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: `Backup created: ${data.file?.name}` });
        if (showBackups) fetchBackups();
      } else {
        setMessage({ type: "error", text: data.message || "Backup failed" });
      }
    } catch (error) {
      console.error("Backup failed:", error);
      setMessage({ type: "error", text: "Backup failed" });
    } finally {
      setBackupLoading(false);
    }
  }, [fetchBackups, showBackups]);

  const autoBackupSeconds = useMemo(() => Number(autoBackupSecondsInput), [autoBackupSecondsInput]);
  const autoBackupSecondsValid = Number.isFinite(autoBackupSeconds) && autoBackupSeconds >= 600;

  const loadAutoBackupSettings = useCallback(async () => {
    setAutoBackupSaving(true);
    try {
      const res = await fetch("/superusers-admin/api/backup/settings", {
        headers: {
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAutoBackupEnabled(Boolean(data.enabled));
        setAutoBackupSecondsInput(String(data.interval_seconds ?? 600));
        setAutoBackupStatus(data);
      } else {
        setAutoBackupMessage({ type: "error", text: data.message || "Failed to load auto-backup settings" });
      }
    } catch (error) {
      setAutoBackupMessage({ type: "error", text: "Failed to load auto-backup settings" });
    } finally {
      setAutoBackupSaving(false);
    }
  }, []);

  useEffect(() => {
    loadAutoBackupSettings();
  }, [loadAutoBackupSettings]);

  const saveAutoBackupSettings = async () => {
    if (!autoBackupSecondsValid) {
      setAutoBackupMessage({ type: "error", text: "Invalid value. Enter a number ≥ 600." });
      return;
    }

    setAutoBackupSaving(true);
    try {
      const res = await fetch("/superusers-admin/api/backup/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
        body: JSON.stringify({
          enabled: autoBackupEnabled,
          interval_seconds: autoBackupSeconds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAutoBackupStatus(data);
        setAutoBackupMessage({
          type: "success",
          text: `Auto backup ${data.enabled ? "enabled" : "disabled"}.`,
        });
      } else {
        setAutoBackupMessage({ type: "error", text: data.message || "Failed to save auto-backup settings" });
      }
    } catch (error) {
      setAutoBackupMessage({ type: "error", text: "Failed to save auto-backup settings" });
    } finally {
      setAutoBackupSaving(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center pb-24 gap-8">
      <p className="md:text-9xl text-5xl">NTH Admin</p>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex gap-3">
          <Button onClick={createBackup} disabled={backupLoading} variant="default">
            {backupLoading ? "Creating Backup..." : "Create Backup"}
          </Button>
          <Button onClick={fetchBackups} variant="outline">
            View Backups
          </Button>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <label className="text-sm font-medium" htmlFor="auto-backup-seconds">
            Auto Backup (seconds)
          </label>
          <input
            id="auto-backup-seconds"
            type="text"
            inputMode="numeric"
            className="w-32 rounded border px-2 py-1 text-sm bg-transparent"
            value={autoBackupSecondsInput}
            onChange={(e) => {
              setAutoBackupSecondsInput(e.target.value);
              setAutoBackupEnabled(false);
              setAutoBackupMessage({
                type: "info",
                text: "Interval changed. Toggle and apply to enable auto backup.",
              });
            }}
          />
          <Button
            type="button"
            variant={autoBackupEnabled ? "default" : "outline"}
            onClick={() => setAutoBackupEnabled((prev) => !prev)}
          >
            {autoBackupEnabled ? "Enabled" : "Enable"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={saveAutoBackupSettings}
            disabled={autoBackupSaving}
          >
            {autoBackupSaving ? "Saving..." : "Apply"}
          </Button>
        </div>
        {!autoBackupSecondsValid ? (
          <p className="text-xs text-red-500">Invalid value. Enter a number ≥ 600.</p>
        ) : (
          <p className="text-xs text-gray-500">Minimum interval is 600 seconds.</p>
        )}

        {autoBackupMessage && (
          <div
            className={`mt-2 px-3 py-2 rounded text-sm ${
              autoBackupMessage.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : autoBackupMessage.type === "info"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {autoBackupMessage.text}
          </div>
        )}

        {autoBackupStatus && (
          <div className="mt-2 text-xs text-gray-500">
            <div>Status: {autoBackupStatus.enabled ? "Enabled" : "Disabled"}</div>
            <div>Last Run: {autoBackupStatus.last_run ? new Date(autoBackupStatus.last_run).toLocaleString() : "Never"}</div>
            <div>Next Run: {autoBackupStatus.next_run ? new Date(autoBackupStatus.next_run).toLocaleString() : "—"}</div>
            {autoBackupStatus.last_error && (
              <div className="text-red-500">Last Error: {autoBackupStatus.last_error}</div>
            )}
          </div>
        )}

        {message && (
          <div
            className={`mt-4 px-4 py-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {showBackups && (
          <div className="mt-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Recent Backups (GitHub)</h3>
            {backups.length === 0 ? (
              <p className="text-gray-500">No backups found</p>
            ) : (
              <ul className="space-y-2">
                {backups.slice(0, 10).map((backup) => (
                  <li key={backup.sha} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="text-sm truncate">{backup.name}</span>
                    <a
                      href={backup.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
