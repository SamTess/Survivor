"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function MainProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.push(`/profile/${currentUser.id}`);
    } else {
      router.push(`/login?callback=/profile`);
    }
  }, [router, isAuthenticated, currentUser]);

  return null;
}
