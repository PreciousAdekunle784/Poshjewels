import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next?.startsWith("/") ? next : "/account");
  return (
    <div className="wrap max-w-[440px] pb-24 pt-14 lg:pt-20">
      <h1 className="display text-[40px]">Sign in</h1>
      <p className="mb-8 mt-2 text-stone">See your orders and check out faster.</p>
      <AuthForm
        action={loginAction}
        next={next}
        submitLabel="Sign in"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
      />
      <p className="mt-6 text-[14px] text-stone">
        New to Posh Jewel?{" "}
        <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link text-espresso">
          Create an account
        </Link>
      </p>
    </div>
  );
}
