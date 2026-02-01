import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import archiver from "archiver";
import { google } from "googleapis";
import pool from "@/lib/db";

const REQUIRED_ENVS = [
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_DRIVE_FOLDER_ID",
  "BACKUP_TOKEN",
];

const assertEnv = () => {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

const getDriveClient = () => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const zipDirectory = async (sourceDir, zipPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

const fetchTables = async () => {
  const tablesResult = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  return tablesResult.rows.map((row) => row.tablename);
};

const dumpTablesToDir = async (tables, outDir) => {
  for (const table of tables) {
    const result = await pool.query(`SELECT * FROM ${table}`);
    const filePath = path.join(outDir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
  }
};

const uploadToDrive = async (zipPath, fileName) => {
  const drive = getDriveClient();

  const createRes = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: "application/zip",
      body: fs.createReadStream(zipPath),
    },
    fields: "id, name, webViewLink",
  });

  return createRes.data;
};

// Generate filename based on type (manual or auto)
const generateBackupFileName = (isAuto = false) => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  if (isAuto) {
    return `nth-autobackup-${day}-${month}-${year}_${hours}-${minutes}.zip`;
  }
  return `nth-backup-${day}-${month}-${year}_${hours}-${minutes}.zip`;
};

// Core backup function (can be called internally for auto-backup)
export const performBackup = async (isAuto = false) => {
  assertEnv();

  const fileName = generateBackupFileName(isAuto);
  const tempDir = path.join(os.tmpdir(), `nth-backup-${Date.now()}`);
  const zipPath = path.join(os.tmpdir(), `${fileName}`);

  ensureDir(tempDir);

  const tables = await fetchTables();
  const meta = {
    generatedAt: new Date().toISOString(),
    tableCount: tables.length,
    tables,
    type: isAuto ? "auto" : "manual",
  };
  fs.writeFileSync(path.join(tempDir, "_metadata.json"), JSON.stringify(meta, null, 2));

  await dumpTablesToDir(tables, tempDir);
  await zipDirectory(tempDir, zipPath);

  const driveFile = await uploadToDrive(zipPath, fileName);

  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.rmSync(zipPath, { force: true });

  return driveFile;
};

export async function POST(request) {
  try {
    assertEnv();

    const token = request.headers.get("x-backup-token");
    if (!token || token !== process.env.BACKUP_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const driveFile = await performBackup(false);

    return NextResponse.json(
      {
        message: "Backup created and uploaded",
        file: driveFile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { message: "Backup failed", error: error.message },
      { status: 500 }
    );
  }
}
      { status: 500 }
    );
  }
}
