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
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as 'email',
        token_hash,
      })

      if (error) {
        console.error('Email verification error:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        
        // 如果是 refresh token 錯誤，可能是驗證已成功但 session 建立失敗
        // 這種情況下，用戶可能已經被確認，只是無法自動登入
        if (error.message?.toLowerCase().includes('refresh token')) {
          // 重定向到首頁，讓用戶手動登入
          const redirectUrl = new URL('/', requestUrl.origin)
          redirectUrl.searchParams.set('confirmed', 'true')
          redirectUrl.searchParams.set('login_required', 'true')
          return NextResponse.redirect(redirectUrl)
        }
        
        // 其他錯誤，重定向到首頁
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('error', 'verification_failed')
        return NextResponse.redirect(redirectUrl)
      }

      // Email 確認成功
      console.log('Email verification successful:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userId: data?.user?.id,
        emailConfirmed: data?.user?.email_confirmed_at
      })

      // 檢查 session 是否已建立
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('Session created successfully after verification')
        // 確認成功且有 session，重定向到首頁並顯示成功訊息
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('confirmed', 'true')
        console.log('Redirecting to:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      } else if (data?.user) {
        console.log('User verified but no session, redirecting with login required')
        // 用戶已確認但沒有 session，需要手動登入
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('confirmed', 'true')
        redirectUrl.searchParams.set('login_required', 'true')
        console.log('Redirecting to:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      } else {
        console.log('Verification successful but no user or session')
        // 驗證成功但沒有 user 或 session
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('confirmed', 'true')
        redirectUrl.searchParams.set('login_required', 'true')
        console.log('Redirecting to:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error: any) {
      // 如果驗證失敗，記錄錯誤並重定向
      console.error('Email verification exception:', error)
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'verification_error')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 處理舊格式的 token（非 token_hash）
  const token = requestUrl.searchParams.get('token')
  if (token && type === 'signup') {
    console.log('Old format token detected, attempting verification')
    try {
      // 嘗試使用舊格式的 token 驗證
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'email',
        token,
      })

      if (error) {
        console.error('Token verification error:', error)
        // 即使驗證失敗，也重定向到首頁
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('error', 'verification_failed')
        return NextResponse.redirect(redirectUrl)
      }

      // 驗證成功
      if (data?.user || data?.session) {
        console.log('Token verification successful')
        const { data: { session } } = await supabase.auth.getSession()
        const redirectUrl = new URL('/', requestUrl.origin)
        if (session) {
          redirectUrl.searchParams.set('confirmed', 'true')
        } else {
          redirectUrl.searchParams.set('confirmed', 'true')
          redirectUrl.searchParams.set('login_required', 'true')
        }
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error: any) {
      console.error('Token verification exception:', error)
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'verification_error')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 如果沒有 token_hash 或 token，檢查 session 是否已確認
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

