"use client";

import { useEffect } from "react";
import { api } from "@/app/lib/api";

/** Renders nothing — on app load, if a session token exists, quietly tries to
    refresh it once so active users don't hit the 7-day expiry wall mid-session.
    Failure (token already expired) is a silent no-op: the existing 401 handling
    in api.ts's request() still fires normally the next time a real call needs it. */
export default function AuthRefresher() {
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    api.auth.refresh(token).then((res) => {
      if (res?.access_token) localStorage.setItem("access_token", res.access_token);
    });
  }, []);

  return null;
}
