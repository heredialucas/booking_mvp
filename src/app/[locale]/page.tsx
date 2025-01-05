"use client";

import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function WorkScheduleContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

export default function WorkSchedule() {
  return (
    <AuthProvider>
      <WorkScheduleContent />
    </AuthProvider>
  );
} 