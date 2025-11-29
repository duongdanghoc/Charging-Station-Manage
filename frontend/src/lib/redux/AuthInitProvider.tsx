"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/services/authSlice";

export default function AuthInitProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.token) {
          dispatch(setCredentials(parsed));
        }
      } catch (err) {
        console.error("Failed to restore auth:", err);
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}
