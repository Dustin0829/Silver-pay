-- Create maybank_application table
CREATE TABLE IF NOT EXISTS maybank_application (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  email TEXT NOT NULL,
  mobile_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'submitted', 'turn-in')),
  agent TEXT,
  encoder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS maybank_application_status_idx ON maybank_application(status);
CREATE INDEX IF NOT EXISTS maybank_application_agent_idx ON maybank_application(agent);
CREATE INDEX IF NOT EXISTS maybank_application_encoder_idx ON maybank_application(encoder);
CREATE INDEX IF NOT EXISTS maybank_application_created_at_idx ON maybank_application(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE maybank_application ENABLE ROW LEVEL SECURITY;

-- Create policies for maybank_application table
-- Allow all authenticated users to read maybank applications
CREATE POLICY "Allow authenticated users to read maybank applications" ON maybank_application
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert maybank applications
CREATE POLICY "Allow authenticated users to insert maybank applications" ON maybank_application
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update maybank applications
CREATE POLICY "Allow authenticated users to update maybank applications" ON maybank_application
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_maybank_application_updated_at
  BEFORE UPDATE ON maybank_application
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO maybank_application (first_name, last_name, middle_name, email, mobile_number, status, agent, encoder) VALUES
('John', 'Doe', 'Smith', 'john.doe@example.com', '+639123456789', 'pending', 'Agent A', 'Encoder 1'),
('Jane', 'Smith', 'Marie', 'jane.smith@example.com', '+639987654321', 'approved', 'Agent B', 'Encoder 2'),
('Michael', 'Johnson', 'David', 'michael.johnson@example.com', '+639555123456', 'rejected', 'Agent C', 'Encoder 1'),
('Sarah', 'Williams', 'Anne', 'sarah.williams@example.com', '+639777888999', 'submitted', 'Agent A', 'Encoder 3'),
('Robert', 'Brown', 'James', 'robert.brown@example.com', '+639111222333', 'turn-in', 'Agent B', 'Encoder 2'); 