# Password Update API Setup

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://dywstsoqrnqyihlntndl.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Vite Environment Variables (for frontend)
VITE_SUPABASE_URL=https://dywstsoqrnqyihlntndl.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## How to Get Your Supabase Keys

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dywstsoqrnqyihlntndl
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: `https://dywstsoqrnqyihlntndl.supabase.co`
   - **anon public**: This is your `SUPABASE_ANON_KEY`
   - **service_role secret**: This is your `SUPABASE_SERVICE_ROLE_KEY`

## API Endpoint

The password update API is available at:
```
POST /api/update-user-password
```

### Request Body
```json
{
  "user_id": "user-uuid",
  "new_password": "new-password",
  "moderator_token": "session-access-token"
}
```

### Response
```json
{
  "success": true,
  "message": "Password updated successfully",
  "user_id": "user-uuid",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

- ✅ **CORS Enabled**: Allows requests from any origin
- ✅ **Session Verification**: Uses moderator's session token for verification
- ✅ **Input Validation**: Validates all required fields
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Audit Logging**: Logs all password changes

## Testing

1. Make sure your environment variables are set
2. Start your development server: `npm run dev`
3. Login as a moderator
4. Go to User Management
5. Try updating a user's password
6. Check the console for success/error messages

## Deployment

When you deploy to Vercel, make sure to set the environment variables in your Vercel project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the same environment variables listed above
