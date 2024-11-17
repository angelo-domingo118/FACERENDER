import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (method: string, url: string, body?: any) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.request({
          method,
          url,
          data: body,
        });
        setData(response.data);
        options.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const error = new Error(err.response?.data?.message || 'An error occurred');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    data,
    error,
    isLoading,
    execute,
  };
} 