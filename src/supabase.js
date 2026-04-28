import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ogpeaghpwutdwhosdear.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGVhZ2hwd3V0ZHdob3NkZWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjcxODgsImV4cCI6MjA5MjgwMzE4OH0.NnXwNSyf1TqbUSSxfPB0s9blOgD6OD3pIEqYCCYkEHY'
export const supabase = createClient(supabaseUrl, supabaseKey)
