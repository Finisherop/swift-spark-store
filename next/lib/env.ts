export function getSupabaseEnv() {
	const projectId = process.env.NEXT_SUPABASE_PROJECT_ID
	const explicitUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL
	const derivedUrl = projectId ? `https://${projectId}.supabase.co` : undefined
	const url = explicitUrl || derivedUrl

	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_PUBLISHABLE_KEY

	return { url, anon }
}

