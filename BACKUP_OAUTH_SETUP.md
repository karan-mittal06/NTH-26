# NTH Database Backup & Recovery Guide (OAuth 2.0)

## Overview

The NTH backup system creates JSON exports of all database tables, compresses them into a ZIP file, and uploads to Google Drive using **OAuth 2.0** with your personal Google account. **No paid Google Workspace needed!**

---

## Setup: Google Cloud OAuth 2.0

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted to configure OAuth consent screen:
   - Choose **"External"** (free for personal use)
   - Fill in app name (e.g., "NTH Backup System")
   - Add your email as developer contact
   - Under "Scopes", click "Add or Remove Scopes":
     - Add: `https://www.googleapis.com/auth/drive.file`
   - Add test users (add your own email)
   - Save and continue
4. Back to "Create OAuth client ID":
   - Application type: **Web application**
   - Name: `NTH Backup Client`
   - **Authorized redirect URIs**: Add your callback URL(s):
     - Local dev: `http://localhost:3000/api/drive-oauth/callback`
     - Production: `https://your-azure-vm-domain.com/api/drive-oauth/callback`
   - Click **"Create"**
5. Copy the **Client ID** and **Client Secret** (you'll need these!)

### 3. Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g., "NTH Backups")
3. Open the folder and copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - The `FOLDER_ID_HERE` part is what you need

### 4. Set Environment Variables

Add to your `.env` file (admin folder):

```env
# Google OAuth 2.0 (Personal Account - FREE!)
GOOGLE_OAUTH_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-your_secret_here
GOOGLE_OAUTH_REDIRECT_URI=https://your-domain.com/api/drive-oauth/callback
GOOGLE_DRIVE_FOLDER_ID=1ABC123xyz_your_folder_id

# Backup Security Token (generate a random string)
BACKUP_TOKEN=your-secure-random-token-here

# Optional: For frontend backup button
NEXT_PUBLIC_BACKUP_TOKEN=your-secure-random-token-here
```

> 💡 **Tip**: Use `openssl rand -hex 32` to generate a secure random token

### 5. Run Database Migration

Create the OAuth tokens table:

```bash
cd /Users/deathknight1/Coding/nth/NTH-26
psql -U your_user -d your_database -f admin/migrations/create_drive_oauth_tokens.sql
```

Or run manually in your database:

```sql
CREATE TABLE IF NOT EXISTS drive_oauth_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);
```

---

## How to Use

### First Time Setup

1. **Start your admin app**:
   ```bash
   cd admin
   npm run dev
   ```

2. **Navigate to Dashboard**: `http://localhost:3000/dashboard`

3. **Connect Google Drive**:
   - Click "Connect Google Drive" button
   - You'll be redirected to Google OAuth consent screen
   - Sign in with your Google account
   - Click "Allow" to grant Drive access
   - You'll be redirected back to dashboard

4. **Create Backups**:
   - Once connected, click "Create Backup" button
   - Backup will be uploaded to your Google Drive folder

### Manual Backup (API)

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "x-backup-token: your-backup-token"
```

### Auto Backup Setup

```bash
# Start auto-backup (every 10 minutes = 600 seconds)
curl -X POST http://localhost:3000/api/auto-backup \
  -H "Content-Type: application/json" \
  -d '{"interval_seconds": 600}'

# Stop auto-backup
curl -X DELETE http://localhost:3000/api/auto-backup
```

---

## Deployment to Azure Linux VM

### Environment Variables on Azure

1. Add environment variables to your Azure VM:
   ```bash
   sudo nano /etc/environment
   ```

2. Or use Azure App Service Configuration if using Azure Web Apps

3. Make sure to update `GOOGLE_OAUTH_REDIRECT_URI` to your production URL:
   ```
   GOOGLE_OAUTH_REDIRECT_URI=https://your-actual-domain.com/api/drive-oauth/callback
   ```

4. **Important**: Add this redirect URI to your Google Cloud OAuth credentials!

### Token Refresh

- OAuth tokens automatically refresh using the refresh token
- Refresh tokens typically last forever unless revoked
- Access tokens expire after 1 hour but auto-refresh
- If refresh fails, just reconnect Drive from the dashboard

---

## Troubleshooting

### "No OAuth tokens found" Error

- Connect Google Drive from the dashboard first
- Check if the `drive_oauth_tokens` table exists
- Verify OAuth redirect URI matches in both Google Cloud and `.env`

### "Redirect URI Mismatch" Error

- Make sure the redirect URI in Google Cloud Console matches exactly with `GOOGLE_OAUTH_REDIRECT_URI`
- Include both http://localhost:3000 (dev) and https://your-domain.com (prod) in Google Cloud

### Token Expired / Not Refreshing

- Disconnect and reconnect Google Drive from dashboard
- Check if refresh token exists in database:
  ```sql
  SELECT refresh_token FROM drive_oauth_tokens LIMIT 1;
  ```

---

## Recovery Process

(Same as before - check original BACKUP_RECOVERY.md for recovery steps)

---

## Security Notes

- **Never commit `.env` files** to git
- Keep `BACKUP_TOKEN` secure - treat it like a password
- OAuth tokens are stored in database - secure your database access
- Use HTTPS in production to protect OAuth flow
- Regularly test your backup/recovery process

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/drive-oauth/authorize` | GET | Get OAuth authorization URL |
| `/api/drive-oauth/callback` | GET | OAuth callback (handle auth code) |
| `/api/drive-oauth/status` | GET | Check if Drive is connected |
| `/api/drive-oauth/revoke` | DELETE | Disconnect Google Drive |
| `/api/backup` | POST | Create manual backup |
| `/api/auto-backup` | POST | Start auto-backup |
| `/api/auto-backup` | DELETE | Stop auto-backup |
| `/api/auto-backup` | GET | Get auto-backup status |

---

## Why OAuth vs Service Account?

| Feature | OAuth 2.0 | Service Account |
|---------|-----------|-----------------|
| **Cost** | ✅ FREE | ❌ Requires Google Workspace ($) |
| **Setup** | Easy | Moderate |
| **Permissions** | User's Drive | Shared folder only |
| **Token Refresh** | Automatic | N/A |
| **Best For** | Personal/small teams | Enterprise |

**TL;DR**: OAuth is perfect for your use case - free, easy, and works with personal Google accounts! 🎉
