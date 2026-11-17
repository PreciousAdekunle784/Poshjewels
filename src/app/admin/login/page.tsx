import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { Wordmark } from "@/components/layout/wordmark";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLogin() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");
  return (
    <div className="flex min-h-svh items-center justify-center bg-bone px-4">
      <div className="w-full max-w-[400px] bg-ivory p-8">
        <Wordmark className="text-[20px]" />
        <h1 className="mb-6 mt-6 text-[20px]">Store admin</h1>
        <AuthForm
          action={loginAction}
          admin
          next="/admin"
          submitLabel="Sign in"
          fields={[
            { name: "email", label: "Email", type: "email", autoComplete: "username" },
            { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
          ]}
        />
      </div>
    </div>
  );
}
