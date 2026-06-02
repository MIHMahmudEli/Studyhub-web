'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export function useResources(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['resources', page, limit],
    queryFn: () =>
      apiRequest(`/resources?page=${page}&limit=${limit}`).then((r) => r.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useCourses(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['resources', 'courses', page, limit],
    queryFn: () =>
      apiRequest(`/resources/courses?page=${page}&limit=${limit}`).then(
        (r) => r.data
      ),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60_000,
  });
}

export function useResource(id) {
  return useQuery({
    queryKey: ['resources', id],
    queryFn: () => apiRequest(`/resources/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/resources', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
