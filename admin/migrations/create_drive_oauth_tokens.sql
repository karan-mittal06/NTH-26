-- Create table to store Google Drive OAuth tokens
CREATE TABLE IF NOT EXISTS drive_oauth_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_drive_oauth_expiry ON drive_oauth_tokens(expiry_date);

-- Insert placeholder row (will be updated on first OAuth)
INSERT INTO drive_oauth_tokens (id, access_token, refresh_token, expiry_date)
VALUES (1, '', '', NULL)
ON CONFLICT (id) DO NOTHING;
