-- Create table for storing bank status data
CREATE TABLE IF NOT EXISTS bank_status (
  id SERIAL PRIMARY KEY,
  application_id VARCHAR(255) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  updated_by VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, bank_name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bank_status_application_id ON bank_status(application_id);
CREATE INDEX IF NOT EXISTS idx_bank_status_bank_name ON bank_status(bank_name); 