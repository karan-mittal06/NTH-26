import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import archiver from "archiver";
import { google } from "googleapis";
import pool from "@/lib/db";

const REQUIRED_ENVS = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_DRIVE_FOLDER_ID",
  "BACKUP_TOKEN",
];

const assertEnv = () => {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

const getOAuthTokens = async () => {
  const result = await pool.query(
    `SELECT access_token, refresh_token, expiry_date 
     FROM drive_oauth_tokens 
     ORDER BY id DESC 
     LIMIT 1`
  );

  if (result.rows.length === 0) {
    throw new Error("No OAuth tokens found. Please connect Google Drive first.");
  }

  return result.rows[0];
};

const refreshAccessToken = async (oauth2Client, refreshToken) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  
  // Update tokens in database
  await pool.query(
    `UPDATE drive_oauth_tokens 
     SET access_token = $1, expiry_date = $2, updated_at = NOW() 
     WHERE id = 1`,
    [credentials.access_token, credentials.expiry_date]
  );

  return credentials;
};

const getDriveClient = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  const tokens = await getOAuthTokens();
  
  // Check if token is expired or about to expire (within 5 minutes)
  const isExpired = !tokens.expiry_date || 
    new Date(tokens.expiry_date) < new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired && tokens.refresh_token) {
    const newTokens = await refreshAccessToken(oauth2Client, tokens.refresh_token);
    oauth2Client.setCredentials(newTokens);
  } else {
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });
  }

  return google.drive({ version: "v3", auth: oauth2Client });
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
  const drive = await getDriveClient();

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
