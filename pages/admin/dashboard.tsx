import { AdminDashboard } from "@/components/ui/admin-dashboard";

export default function DashboardPage() {
  const handleLogout = () => {
    // Logout logic (example: redirect to login page)
    window.location.href = "/admin/login";
  };

  // Pass the required prop
  return <AdminDashboard onLogout={handleLogout} />;
}