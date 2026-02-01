import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { startAutoBackup, stopAutoBackup, getAutoBackupSettings } from "@/lib/timer";

// GET - Get current auto-backup settings
export async function GET() {
  try {
    const settings = await getAutoBackupSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching auto-backup settings:", error);
    return NextResponse.json(
      { message: "Failed to fetch settings", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Start auto-backup with interval
export async function POST(request) {
  try {
    const { interval_seconds } = await request.json();

    if (!interval_seconds || interval_seconds < 600) {
      return NextResponse.json(
        { message: "interval_seconds must be at least 600 (10 minutes)" },
        { status: 400 }
      );
    }

    await startAutoBackup(interval_seconds);

    return NextResponse.json(
      { message: `Auto-backup started with ${interval_seconds}s interval` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting auto-backup:", error);
    return NextResponse.json(
      { message: "Failed to start auto-backup", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Stop auto-backup
export async function DELETE() {
  try {
    await stopAutoBackup();
    return NextResponse.json(
      { message: "Auto-backup stopped" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error stopping auto-backup:", error);
    return NextResponse.json(
      { message: "Failed to stop auto-backup", error: error.message },
      { status: 500 }
    );
  }
}
