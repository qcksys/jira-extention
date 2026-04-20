import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/state/query-client';
import { DEFAULT_SETTINGS, getSettings, setSettings } from '~/utils/config';
import type { Settings } from '~/utils/types';

export function useSettings() {
    return useQuery({
        queryKey: queryKeys.settings,
        queryFn: getSettings,
        placeholderData: DEFAULT_SETTINGS,
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (next: Settings) => {
            await setSettings(next);
            return next;
        },
        onSuccess: (next) => {
            queryClient.setQueryData(queryKeys.settings, next);
        },
    });
}

export type ActiveTarget = { kind: 'jira'; tabId: number; origin: string } | { kind: 'none' };

const JIRA_HOST_RE = /\.atlassian\.net$/;

export function useActiveTarget() {
    return useQuery({
        queryKey: queryKeys.activeTarget,
        queryFn: async (): Promise<ActiveTarget> => {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id || !tab.url) return { kind: 'none' };
            const url = new URL(tab.url);
            if (JIRA_HOST_RE.test(url.hostname)) {
                return { kind: 'jira', tabId: tab.id, origin: url.origin };
            }
            return { kind: 'none' };
        },
        staleTime: 0,
        refetchOnMount: true,
    });
}
