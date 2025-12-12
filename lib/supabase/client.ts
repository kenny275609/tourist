import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  // 在瀏覽器端檢查環境變數
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. See SUPABASE_SETUP.md for instructions.'
      )
    }
    
    // 檢查 API key 格式
    if (supabaseAnonKey && supabaseAnonKey !== 'placeholder-key') {
      if (!supabaseAnonKey.startsWith('eyJ') && !supabaseAnonKey.startsWith('sb_')) {
        console.warn('API key format may be incorrect. Expected format: eyJ... or sb_...')
      }
    }
  }
  
  // 確保 URL 和 Key 都不為空
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || 
      !supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
    console.error('Supabase configuration is missing or invalid')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

