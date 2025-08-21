# Update User Password Edge Function

This Supabase Edge Function allows moderators and admins to update user passwords in real-time.

## Features

- ✅ **Secure Authentication**: Only authenticated users can access the function
- ✅ **Role-Based Authorization**: Only moderators and admins can update passwords
- ✅ **Real-time Updates**: Passwords are updated immediately in Supabase Auth
- ✅ **Audit Trail**: All password changes are logged with user details
- ✅ **Error Handling**: Comprehensive error handling and validation

## Deployment

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy update-user-password
   ```

## Environment Variables

Make sure your Supabase project has these environment variables set:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Usage

The function is called automatically when a moderator or admin updates a user's password through the dashboard.

### API Endpoint
```
POST https://your-project.supabase.co/functions/v1/update-user-password
```

### Request Body
```json
{
  "user_id": "user-uuid",
  "new_password": "new-password"
}
```

### Response
```json
{
  "success": true,
  "message": "Password updated successfully",
  "user_id": "user-uuid",
  "updated_by": "moderator-uuid",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## Security

- Only moderators and admins can update passwords
- All requests are authenticated using Supabase Auth
- Password changes are logged for audit purposes
- Uses service role key for admin operations

## Database Schema

The function expects these columns in the `user_profiles` table:
- `user_id` (UUID)
- `role` (text)
- `updated_at` (timestamp)
- `password_updated_by` (UUID, optional)
- `password_updated_at` (timestamp, optional)

If the optional columns don't exist, the function will still work but won't record the audit trail.
