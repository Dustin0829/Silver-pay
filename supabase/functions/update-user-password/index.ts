import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user making the request
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the request body
    const { user_id, new_password } = await req.json()

    if (!user_id || !new_password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and new_password' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if the requesting user is a moderator or admin
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Only allow moderators and admins to update passwords
    if (!['moderator', 'admin'].includes(userProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only moderators and admins can update passwords.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the target user exists
    const { data: targetUser, error: targetUserError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (targetUserError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create admin client for password update
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Update the user's password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update password', details: updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the user profile to record the change
    const { error: profileUpdateError } = await adminClient
      .from('user_profiles')
      .update({ 
        updated_at: new Date().toISOString(),
        password_updated_by: user.id,
        password_updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      // Don't fail the request if profile update fails, password was already updated
    }

    // Log the password change for audit purposes
    console.log(`Password updated for user ${user_id} by ${user.id} (${userProfile.role})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully',
        user_id: user_id,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
