import { NextResponse } from "next/server";
import { getBackupSettings, updateBackupSettings } from "@/lib/backupScheduler";

const requireToken = (request) => {
  const token = request.headers.get("x-backup-token");
  if (!token || token !== process.env.BACKUP_TOKEN) {
    return false;
  }
  return true;
};

export async function GET(request) {
  try {
    if (!requireToken(request)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const settings = await getBackupSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Fetch backup settings error:", error);
    return NextResponse.json(
      { message: "Failed to fetch backup settings", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!requireToken(request)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const enabled = Boolean(body.enabled);
    const intervalSeconds = body.interval_seconds;

    const settings = await updateBackupSettings({
      enabled,
      interval_seconds: intervalSeconds,
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Update backup settings error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update backup settings" },
      { status: 400 }
    );
  }
}
