import { useEffect, useState } from "react";

export type Role = "mentee" | "mentor";

const KEY = "mm.role";

function read(): Role | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "mentor" || v === "mentee" ? v : null;
}

export function useRole(): { role: Role | null; setRole: (r: Role | null) => void; ready: boolean } {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoleState(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setRoleState(read());
    };
    const onCustom = () => setRoleState(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("mm:role-change", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mm:role-change", onCustom);
    };
  }, []);

  const setRole = (r: Role | null) => {
    if (typeof window === "undefined") return;
    if (r) window.localStorage.setItem(KEY, r);
    else window.localStorage.removeItem(KEY);
    setRoleState(r);
    window.dispatchEvent(new Event("mm:role-change"));
  };

  return { role, setRole, ready };
}

export function getStoredRole(): Role | null {
  return read();
}
