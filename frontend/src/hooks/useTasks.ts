"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { taskAPI } from "@/lib/api";
import type { Task, TaskCreate } from "@/types";

export function useTasks(autoLoad = true) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskAPI.list();
      setTasks(res.data.data ?? []);
    } catch (e) {
      setError("Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) void fetchTasks();
  }, [autoLoad, fetchTasks]);

  const createTask = async (payload: TaskCreate) => {
    const res = await taskAPI.create(payload);
    const task = res.data.data!;
    setTasks((items) => [task, ...items]);
    toast.success("Monitoring task created");
    return task;
  };

  const runTask = async (id: number) => {
    await taskAPI.run(id);
    toast.success("Analysis started");
    await fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await taskAPI.delete(id);
    setTasks((items) => items.filter((item) => item.id !== id));
    toast.success("Task deleted");
  };

  return { tasks, loading, error, fetchTasks, createTask, runTask, deleteTask };
}
