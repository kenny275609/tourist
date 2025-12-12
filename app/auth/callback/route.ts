import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const token = requestUrl.searchParams.get('token')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // 處理 Email 確認
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Email 確認成功，重定向到首頁並顯示成功訊息
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('confirmed', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 處理舊版確認連結（使用 token 參數）
  if (token && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token,
    })

    if (!error) {
      // Email 確認成功，重定向到首頁並顯示成功訊息
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('confirmed', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 如果沒有 token，可能是直接訪問，檢查 session 是否已確認
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.email_confirmed_at) {
    // 用戶已確認，重定向到首頁並顯示成功訊息
    const redirectUrl = new URL('/', requestUrl.origin)
    redirectUrl.searchParams.set('confirmed', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  // 如果確認失敗，重定向到首頁
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

