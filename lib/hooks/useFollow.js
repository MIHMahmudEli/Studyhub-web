'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

/**
 * Follow state + optimistic toggle for a target user.
 * Mirrors the mobile useFollow: shared via the react-query cache so every
 * place showing this user's follow state stays in sync.
 */
export function useFollow(userId) {
  const qc = useQueryClient();
  const key = ['follow-status', String(userId ?? '')];

  const statusQ = useQuery({
    queryKey: key,
    // The api interceptor already returns response.data, so this resolves to the
    // status object directly. Fall back to a safe default so React Query never
    // receives `undefined`.
    queryFn: async () =>
      (await apiRequest(`/follows/${userId}/status`)) ?? {
        following: false,
        followersCount: 0,
        followingCount: 0,
        isSelf: false,
      },
    enabled: !!userId,
    staleTime: 60_000,
  });

  const toggle = useMutation({
    mutationFn: () => apiRequest(`/follows/${userId}/toggle`, { method: 'POST' }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      if (prev) {
        qc.setQueryData(key, {
          ...prev,
          following: !prev.following,
          followersCount: Math.max(0, (prev.followersCount || 0) + (prev.following ? -1 : 1)),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(key, (old) => ({ ...(old || {}), ...data }));
    },
  });

  const s = statusQ.data || {};
  return {
    following: !!s.following,
    followersCount: s.followersCount || 0,
    isSelf: !!s.isSelf,
    loaded: statusQ.isSuccess,
    pending: toggle.isPending,
    toggle: () => toggle.mutate(),
  };
}
