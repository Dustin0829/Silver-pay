#!/bin/bash

# Deploy Supabase Edge Functions
echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

# Deploy the update-user-password function
echo "📦 Deploying update-user-password function..."
supabase functions deploy update-user-password

if [ $? -eq 0 ]; then
    echo "✅ update-user-password function deployed successfully!"
else
    echo "❌ Failed to deploy update-user-password function"
    exit 1
fi

echo "🎉 All functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test the password update functionality in your moderator dashboard"
echo "2. Check the Supabase dashboard for function logs"
echo "3. Verify that passwords are being updated in real-time"
