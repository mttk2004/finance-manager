import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const isError = params?.error === "invalid";

  async function loginAction(formData: FormData) {
    "use server";
    
    const password = formData.get("password") as string;
    const APP_PASSWORD = process.env.APP_PASSWORD;

    if (!APP_PASSWORD) {
      throw new Error("APP_PASSWORD is not set. Please configure it in .env");
    }

    if (password === APP_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("auth_status", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      redirect("/");
    } else {
      redirect("/login?error=invalid");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-neutral-200 font-sans p-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900/50 p-8 border border-white/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 border border-white/10">
            <svg
              className="h-5 w-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-sm text-neutral-400 text-balance">
            Enter your personal password to access your finance dashboard.
          </p>
        </div>
        
        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              name="password"
              placeholder="Enter password..."
              required
              className="w-full h-11 bg-neutral-800/50 border-white/5 text-white focus:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-neutral-500"
              autoFocus
            />
            {isError && (
              <p className="text-sm font-medium text-rose-500 text-center">
                Incorrect password. Please try again.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full h-11 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            UNLOCK
          </Button>
        </form>
      </div>
    </div>
  );
}
