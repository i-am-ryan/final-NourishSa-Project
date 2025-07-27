import { useState, useEffect } from 'react';
import { volunteerAPI, handleAPIResponse } from '../lib/api';

interface VolunteerTask {
  id: string;
  donation_id: string;
  volunteer_id?: string;
  status: string;
  scheduled_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  completion_notes?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  created_at: string;
  donation?: {
    title: string;
    food_category: string;
    pickup_address: string;
    estimated_meals?: number;
    donor?: {
      full_name: string;
      phone: string;
    };
  };
}

interface UseVolunteerTasksOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  status?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useVolunteerTasks = (options: UseVolunteerTasksOptions = {}) => {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        volunteerAPI.getTasks({
          lat: options.lat,
          lng: options.lng,
          radius: options.radius,
          status: options.status,
        })
      );
      setTasks(response.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        volunteerAPI.getMyTasks()
      );
      setTasks(response.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch my tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const acceptTask = async (taskId: string) => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        volunteerAPI.acceptTask(taskId)
      );
      // Update the local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: 'accepted' } : task
        )
      );
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept task';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateTask = async (taskId: string, updates: {
    status?: string;
    actual_start_time?: string;
    actual_end_time?: string;
    completion_notes?: string;
  }) => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        volunteerAPI.updateTask(taskId, updates)
      );
      // Update the local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const getLeaderboard = async () => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        volunteerAPI.getLeaderboard()
      );
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const getStats = async (volunteerId: string) => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        volunteerAPI.getStats(volunteerId)
      );
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    if (options.status === 'my-tasks') {
      await fetchMyTasks();
    } else {
      await fetchTasks();
    }
  };

  // Initial fetch
  useEffect(() => {
    if (options.status === 'my-tasks') {
      fetchMyTasks();
    } else {
      fetchTasks();
    }
  }, [options.lat, options.lng, options.radius, options.status]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.autoRefresh || !options.refreshInterval) return;

    const interval = setInterval(() => {
      if (options.status === 'my-tasks') {
        fetchMyTasks();
      } else {
        fetchTasks();
      }
    }, options.refreshInterval);
    
    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval, options.status]);

  return {
    tasks,
    loading,
    error,
    refreshing,
    fetchTasks,
    fetchMyTasks,
    acceptTask,
    updateTask,
    getLeaderboard,
    getStats,
    refresh,
  };
}; 