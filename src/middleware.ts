import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith('/invite')) {
    return supabaseResponse;
  }

  if (pathname.startsWith('/login')) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const destination = profile?.role === 'platform_admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return supabaseResponse;
  }

  // Protected routes — require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Fetch role (always exists). is_active is optional — added in migration 00003.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Block deactivated users (only once migration 00003 is applied)
  try {
    const { data: profileFull } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .single();
    if (profileFull && (profileFull as { is_active?: boolean }).is_active === false) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?deactivated=1', request.url));
    }
  } catch {
    // is_active column not yet available — skip check
  }

  // Role-based routing for root
  if (pathname === '/') {
    const destination = profile?.role === 'platform_admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Guard /admin routes — only platform_admin
  if (pathname.startsWith('/admin')) {
    if (profile?.role !== 'platform_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
