import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // 處理 Email 確認（使用 token_hash，這是 Supabase 推薦的方式）
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as 'email',
        token_hash,
      })

      if (!error) {
        // Email 確認成功，重定向到首頁並顯示成功訊息
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('confirmed', 'true')
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // 如果驗證失敗，繼續執行下面的邏輯
      console.error('Email verification error:', error)
    }
  }

  // 如果沒有 token_hash，可能是直接訪問，檢查 session 是否已確認
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.email_confirmed_at) {
    // 用戶已確認，重定向到首頁並顯示成功訊息
    const redirectUrl = new URL('/', requestUrl.origin)
    redirectUrl.searchParams.set('confirmed', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  // 如果確認失敗或沒有 token，重定向到首頁
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

