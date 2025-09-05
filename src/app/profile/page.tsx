"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function MainProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();

  if (isAuthenticated && currentUser) {
    router.push(`/profile/${currentUser.id}`);
  } else {
    router.push(`/login?callback=/profile`);
  }
  return null;
}
