import { AdminLogin } from "../../src/components/ui/admin-login";

export default function LoginPage() {
  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt", email, password);
    // perform login logic
  };

  return <AdminLogin onLogin={handleLogin} />;
}