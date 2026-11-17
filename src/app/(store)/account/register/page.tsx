import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect("/account");
  return (
    <div className="wrap max-w-[440px] pb-24 pt-14 lg:pt-20">
      <h1 className="display t-title">Create an account</h1>
      <p className="mb-8 mt-2 text-stone">Keep track of your orders in one place.</p>
      <AuthForm
        action={registerAction}
        next={next}
        submitLabel="Create account"
        fields={[
          { name: "name", label: "Full name", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password (at least 8 characters)", type: "password", autoComplete: "new-password" },
        ]}
      />
      <p className="mt-6 text-[14px] text-stone">
        Already have an account?{" "}
        <Link href="/account/login" className="link text-espresso">
          Sign in
        </Link>
      </p>
    </div>
  );
}
