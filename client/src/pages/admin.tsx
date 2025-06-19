import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to the new admin login page
    setLocation("/admin-login");
  }, [setLocation]);

  return null;
}
