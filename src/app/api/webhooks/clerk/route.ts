import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client directly in this file to avoid import issues
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

export async function POST(req: Request) {
    // Get the webhook secret from environment
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET')
        return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
    }

    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: WebhookEvent

    // Verify the payload
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 })
    }

    // Handle the webhook
    const eventType = evt.type
    const supabase = getAdminClient()

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data
        const email = email_addresses?.[0]?.email_address || ''
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || null

        // Create profile in Supabase
        const { error } = await supabase
            .from('profiles')
            .insert({
                clerk_user_id: id,
                email,
                full_name: fullName,
            })

        if (error) {
            console.error('Error creating profile:', error)
            return NextResponse.json({ error: 'Error creating profile' }, { status: 500 })
        }

        console.log(`Profile created for user ${id}`)
    }

    if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name } = evt.data
        const email = email_addresses?.[0]?.email_address || ''
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || null

        // Update profile in Supabase
        const { error } = await supabase
            .from('profiles')
            .update({
                email,
                full_name: fullName,
            })
            .eq('clerk_user_id', id)

        if (error) {
            console.error('Error updating profile:', error)
            return NextResponse.json({ error: 'Error updating profile' }, { status: 500 })
        }

        console.log(`Profile updated for user ${id}`)
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data

        // Delete profile in Supabase (cascade will delete jobs/applicants)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('clerk_user_id', id as string)

        if (error) {
            console.error('Error deleting profile:', error)
            return NextResponse.json({ error: 'Error deleting profile' }, { status: 500 })
        }

        console.log(`Profile deleted for user ${id}`)
    }

    return NextResponse.json({ success: true })
}
