'use client'; // required for useRouter in Next.js 13+

import { useRouter } from 'next/router';
import { AdminLogin } from "../../src/components/ui/admin-login";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt", email, password);

    // Example login check — replace with real auth
    if (email === "admin@example.com" && password === "123456") {
      // Redirect to Admin Dashboard after successful login
      router.push("/admin/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return <AdminLogin onLogin={handleLogin} />;
}