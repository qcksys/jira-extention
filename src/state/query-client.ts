import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
    },
});

export const queryKeys = {
    settings: ['settings'] as const,
    activeTarget: ['active-target'] as const,
};
