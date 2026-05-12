import { useEffect } from "react";
import { useLocation } from "wouter";

// Register redirects to the unified auth page (login.tsx handles both modes)
export default function Register() {
  const [, nav] = useLocation();
  useEffect(() => { nav("/login"); }, []);
  return null;
}
