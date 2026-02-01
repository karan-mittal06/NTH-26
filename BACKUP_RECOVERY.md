# NTH Database Backup & Recovery Guide

## Overview

The NTH backup system creates JSON exports of all database tables, compresses them into a ZIP file, and uploads to Google Drive. This allows for easy recovery in case of data loss.

---

## Setup: Google Cloud & Drive

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Give it a name like `nth-backup-service`
4. Click "Create and Continue"
5. Skip the optional steps, click "Done"
6. Click on the newly created service account
7. Go to "Keys" tab
8. Click "Add Key" → "Create new key" → "JSON"
9. Save the downloaded JSON file securely

### 3. Get Credentials from JSON

From the downloaded JSON, extract:
- `client_email` → Use as `GOOGLE_CLIENT_EMAIL`
- `private_key` → Use as `GOOGLE_PRIVATE_KEY`

### 4. Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g., "NTH Backups")
3. Right-click the folder → "Share"
4. Share with the `client_email` from step 3 (give "Editor" access)
5. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Use this ID as `GOOGLE_DRIVE_FOLDER_ID`

### 5. Set Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_EMAIL=nth-backup-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1ABC123xyz_your_folder_id
BACKUP_TOKEN=your-secure-random-token-here
```

> ⚠️ **Important**: The `GOOGLE_PRIVATE_KEY` must include `\n` characters for line breaks, wrapped in quotes.

---

## Manual Backup

### Via Admin Dashboard

1. Go to `/dashboard/timer` in the admin panel
2. Click the **"Manual Backup"** button
3. Wait for the backup to complete
4. The backup will appear in your Google Drive folder

### Via API

```bash
curl -X POST https://your-admin-domain/api/backup \
  -H "Authorization: Bearer YOUR_BACKUP_TOKEN"
```

---

## Auto-Backup

### Enable via Dashboard

1. Go to `/dashboard/timer` in the admin panel
2. Toggle **"Auto Backup"** to enabled
3. Set the interval (minimum 600 seconds = 10 minutes)
4. Click **"Save"**

### File Naming

- Manual backups: `nth-backup-DD-MM-YYYY_HH-MM.zip`
- Auto backups: `nth-autobackup-DD-MM-YYYY_HH-MM.zip`

---

## Recovery Procedure

### Step 1: Download the Backup

1. Go to Google Drive
2. Navigate to your backup folder
3. Download the ZIP file you want to restore

### Step 2: Run Recovery Script

#### Option A: Using the Recovery Script

```bash
cd /path/to/NTH-26/admin

# Install dependencies if not already done
npm install pg

# Run recovery
DATABASE_URL="postgresql://nth:nthDB@123@localhost:6969/nthdatabase" node recovery.js path/to/backup.zip
```

#### Option B: Manual Recovery

1. Extract the ZIP file:
   ```bash
   unzip nth-backup-01-02-2025_14-30.zip -d backup-restore/
   ```

2. Connect to PostgreSQL:
   ```bash
   psql postgresql://nth:nthDB@123@localhost:6969/nthdatabase
   ```

3. For each table, you can use Python or Node.js to read the JSON and insert:

   **Using psql with JSON (example for users table):**
   ```sql
   -- First, clear existing data if needed
   TRUNCATE users CASCADE;
   
   -- Then use COPY or INSERT statements
   -- (See recovery.js for programmatic approach)
   ```

### Step 3: Verify Recovery

```bash
psql postgresql://nth:nthDB@123@localhost:6969/nthdatabase

# Check row counts
SELECT 'users' as table, COUNT(*) FROM users
UNION ALL SELECT 'questions', COUNT(*) FROM questions
UNION ALL SELECT 'answers', COUNT(*) FROM answers;
```

---

## Docker Recovery

If running in Docker:

### 1. Copy backup into container

```bash
docker cp backup.zip nth-26-admin-1:/app/backup.zip
```

### 2. Run recovery inside container

```bash
docker exec -it nth-26-admin-1 sh -c "cd /app && node recovery.js backup.zip"
```

### Alternative: Direct PostgreSQL Recovery

```bash
# Copy JSON files to postgres container
docker cp backup-folder/. nth-26-postgres-1:/tmp/backup/

# Connect to postgres
docker exec -it nth-26-postgres-1 psql -U nth -d nthdatabase

# Use \copy or write a script to import
```

---

## Backup Contents

Each backup ZIP contains:
- `_metadata.json` - Backup timestamp and table list
- `users.json` - User accounts
- `questions.json` - Quiz questions
- `answers.json` - User answers/submissions
- `leaderboard.json` - Leaderboard data
- `timer.json` - Event timer settings
- `backup_settings.json` - Auto-backup configuration

---

## Troubleshooting

### "Insufficient permissions" error
- Ensure the service account email has Editor access to the Drive folder
- Re-share the folder with the service account

### "Invalid private key" error
- Check that `GOOGLE_PRIVATE_KEY` includes proper `\n` line breaks
- The key should be wrapped in quotes in `.env`

### Recovery script fails
- Ensure `DATABASE_URL` is set correctly
- Check that the database is accessible
- Verify the ZIP file is not corrupted

### Auto-backup not running
- Check the admin logs for errors
- Verify Google credentials are set
- Ensure minimum interval is 600 seconds

---

## Best Practices

1. **Regular Backups**: Enable auto-backup with at least 1-hour intervals during events
2. **Test Recovery**: Periodically test the recovery process on a staging database
3. **Multiple Copies**: Download backups locally periodically as an additional safeguard
4. **Monitor Drive Storage**: Ensure your Google Drive has sufficient space
5. **Secure Credentials**: Never commit `.env` or service account keys to git
