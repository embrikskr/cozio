import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Two jobs on every dashboard request: refresh the Supabase session so it does
// not expire mid-visit, and bounce anyone without one to the login page.
//
// The refresh has to happen here because server components cannot set cookies,
// so middleware is the only place a rotated token can be written back.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Without Supabase configured there is no session to check. Letting the
  // request through keeps local dev usable; the pages behind this still require
  // a user of their own accord, so it is not a way in.
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
