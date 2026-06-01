"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store";

/** Redirect to dashboard with stocks module active */
export default function StocksPage() {
  const router = useRouter();
  const { setActiveModule } = useDashboardStore();

  useEffect(() => {
    setActiveModule("stocks");
    router.replace("/dashboard");
  }, [router, setActiveModule]);

  return null;
}
