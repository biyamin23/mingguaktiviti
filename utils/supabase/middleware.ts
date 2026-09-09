import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Create an unmodified response that passes the request through
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Defensive guard:
  // If environment variables are missing (e.g., in Vercel before environment variables
  // are configured in Project Settings, or in preview/branch deployments),
  // return early rather than calling createServerClient with undefined/invalid URLs.
  // Calling createServerClient(undefined!, undefined!) throws an unhandled exception
  // that crashes the Vercel Edge Runtime with MIDDLEWARE_INVOCATION_FAILED (500).
  if (
    !supabaseUrl ||
    !supabaseKey ||
    !supabaseUrl.startsWith("http") ||
    supabaseUrl.includes("your-project")
  ) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: Refresh session auth token safely
    await supabase.auth.getUser();
  } catch (error) {
    // Graceful error recovery:
    // If a network error, auth failure, or cookie parsing issue occurs,
    // log the warning and return the safe unmodified response.
    // Never let an unhandled error escape middleware to cause MIDDLEWARE_INVOCATION_FAILED!
    console.warn("Supabase middleware session refresh skipped:", error);
  }

  return supabaseResponse;
}

// Alias for backwards-compatibility with quickstart tutorials
export const createClient = updateSession;
