'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export function useNotes(sort = 'latest', page = 1, limit = 12) {
  return useQuery({
    queryKey: ['notes', sort, page, limit],
    queryFn: () =>
      apiRequest(`/notes?sort=${sort}&page=${page}&limit=${limit}`).then(
        (r) => r.data
      ),
    placeholderData: (previousData) => previousData,
  });
}

export function useTrendingNotes() {
  return useQuery({
    queryKey: ['notes', 'trending'],
    queryFn: () => apiRequest('/notes/trending').then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useNote(id) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: () => apiRequest(`/notes/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiRequest('/notes', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiRequest(`/notes/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest(`/notes/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
