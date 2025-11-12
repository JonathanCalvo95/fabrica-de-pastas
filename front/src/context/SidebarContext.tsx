import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "sidebarCollapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Load initial state from localStorage (once on mount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        setCollapsed(raw === "true");
      }
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, []);

  // Persist to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggle: () => setCollapsed((v) => !v),
      setCollapsed,
    }),
    [collapsed]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebarCollapsed(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error(
      "useSidebarCollapsed must be used within a SidebarProvider"
    );
  }
  return ctx;
}
