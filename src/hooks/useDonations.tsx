import { useState, useEffect } from 'react';
import { donationsAPI, handleAPIResponse } from '../lib/api';

interface Donation {
  id: string;
  title: string;
  description?: string;
  food_category: string;
  quantity: string;
  expiry_date?: string;
  pickup_time_start: string;
  pickup_time_end: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  status: string;
  images?: string[];
  dietary_info?: any;
  allergen_info?: string[];
  special_instructions?: string;
  estimated_meals?: number;
  donor?: {
    full_name: string;
    phone: string;
    user_type: string;
  };
  claimed_user?: {
    full_name: string;
    phone: string;
  };
  created_at: string;
}

interface UseDonationsOptions {
  status?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useDonations = (options: UseDonationsOptions = {}) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = async () => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        donationsAPI.getDonations({
          status: options.status,
          category: options.category,
          lat: options.lat,
          lng: options.lng,
          radius: options.radius,
        })
      );
      setDonations(response.donations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch donations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createDonation = async (donationData: Omit<Donation, 'id' | 'created_at' | 'status'>) => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        donationsAPI.createDonation(donationData)
      );
      // Refresh the donations list
      await fetchDonations();
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create donation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateDonation = async (id: string, updates: Partial<Donation>) => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        donationsAPI.updateDonation(id, updates)
      );
      // Update the local state
      setDonations(prev => 
        prev.map(donation => 
          donation.id === id ? { ...donation, ...updates } : donation
        )
      );
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update donation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const claimDonation = async (id: string) => {
    try {
      setError(null);
      const response = await handleAPIResponse(
        donationsAPI.claimDonation(id)
      );
      // Update the local state
      setDonations(prev => 
        prev.map(donation => 
          donation.id === id ? { ...donation, status: 'claimed' } : donation
        )
      );
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim donation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteDonation = async (id: string) => {
    try {
      setError(null);
      await handleAPIResponse(
        donationsAPI.deleteDonation(id)
      );
      // Remove from local state
      setDonations(prev => prev.filter(donation => donation.id !== id));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete donation';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchDonations();
  };

  // Initial fetch
  useEffect(() => {
    fetchDonations();
  }, [options.status, options.category, options.lat, options.lng, options.radius]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.autoRefresh || !options.refreshInterval) return;

    const interval = setInterval(fetchDonations, options.refreshInterval);
    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval]);

  return {
    donations,
    loading,
    error,
    refreshing,
    fetchDonations,
    createDonation,
    updateDonation,
    claimDonation,
    deleteDonation,
    refresh,
  };
}; 