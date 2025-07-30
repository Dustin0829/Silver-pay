-- Create a function to insert a user profile while bypassing foreign key constraints
-- This is for demonstration purposes only and should NOT be used in production
CREATE OR REPLACE FUNCTION create_user_profile_demo(
  user_name TEXT,
  user_email TEXT,
  user_role TEXT,
  user_bank_codes TEXT
) RETURNS JSONB AS $$
DECLARE
  new_id UUID;
  result JSONB;
BEGIN
  -- Generate a new UUID for the user profile
  new_id := gen_random_uuid();
  
  -- Insert directly using SQL to bypass foreign key constraints
  EXECUTE 'INSERT INTO user_profiles (id, name, email, role, bank_codes, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW()) RETURNING id, name, email, role'
    USING new_id, user_name, user_email, user_role, user_bank_codes::jsonb
    INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;