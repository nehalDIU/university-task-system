import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // If no Supabase config, allow access to auth pages and landing page only
    const path = request.nextUrl.pathname
    const allowedPaths = ['/', '/login', '/signup', '/reset-password']
    
    if (!allowedPaths.includes(path) && !path.startsWith('/_next') && !path.includes('.')) {
      // Redirect to landing page with a message
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('setup', 'required')
      return NextResponse.redirect(redirectUrl)
    }
    
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  const path = request.nextUrl.pathname

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/student': ['student'],
    '/section-admin': ['section-admin'],
    '/super-admin': ['super-admin'],
  }

  // Check if the current path is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    path.startsWith(route)
  )

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && (!user || error)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and accessing auth pages, redirect to appropriate dashboard
  if (user && (path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/reset-password'))) {
    const userRole = user.user_metadata?.role
    let redirectPath = '/student' // default
    
    if (userRole === 'section-admin') {
      redirectPath = '/section-admin'
    } else if (userRole === 'super-admin') {
      redirectPath = '/super-admin'
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Check role-based access for protected routes
  if (isProtectedRoute && user) {
    const userRole = user.user_metadata?.role
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
      path.startsWith(route)
    )?.[1]

    if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // If accessing root and authenticated, redirect to appropriate dashboard
  if (path === '/' && user) {
    const userRole = user.user_metadata?.role
    let redirectPath = '/student' // default
    
    if (userRole === 'section-admin') {
      redirectPath = '/section-admin'
    } else if (userRole === 'super-admin') {
      redirectPath = '/super-admin'
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
