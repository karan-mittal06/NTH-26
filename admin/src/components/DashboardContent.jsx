"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const DashboardContent = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupSecondsInput, setAutoBackupSecondsInput] = useState("600");
  const [autoBackupSaving, setAutoBackupSaving] = useState(false);
  const [autoBackupMessage, setAutoBackupMessage] = useState(null);
  const [autoBackupStatus, setAutoBackupStatus] = useState(null);

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
      } else {
        setMessage({ type: "error", text: data.message || "Backup failed" });
      }
    } catch (error) {
      console.error("Backup failed:", error);
      setMessage({ type: "error", text: "Backup failed" });
    } finally {
      setBackupLoading(false);
    }
  }, []);

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
          <Button asChild variant="outline">
            <a
              href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO || ""}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Backups
            </a>
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

      </div>
    </div>
  );
};

export default DashboardContent;
