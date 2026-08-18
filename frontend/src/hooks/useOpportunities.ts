"use client";

import { useCallback, useEffect, useState } from "react";
import { opportunityAPI } from "@/lib/api";
import type { Opportunity } from "@/types";

export function useOpportunities(options?: { taskId?: number; limit?: number; autoLoad?: boolean }) {
  const autoLoad = options?.autoLoad ?? true;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await opportunityAPI.list({
        task_id: options?.taskId,
        limit: options?.limit ?? 20,
      });
      setOpportunities(res.data.data ?? []);
    } catch {
      setError("Unable to load opportunities");
    } finally {
      setLoading(false);
    }
  }, [options?.taskId, options?.limit]);

  useEffect(() => {
    if (autoLoad) void fetchOpportunities();
  }, [autoLoad, fetchOpportunities]);

  return { opportunities, loading, error, fetchOpportunities };
}

export function useOpportunity(id?: number) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setOpportunity(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    opportunityAPI
      .get(id)
      .then((res) => {
        if (mounted) setOpportunity(res.data.data ?? null);
      })
      .catch(() => {
        if (mounted) setError("Unable to load opportunity");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { opportunity, loading, error };
}
