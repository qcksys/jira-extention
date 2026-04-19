import ky, { HTTPError } from 'ky';
import type { LogResult, ParsedEntry } from './types';

export async function postWorklog(origin: string, entry: ParsedEntry): Promise<LogResult> {
    const url = `${origin}/rest/api/2/issue/${encodeURIComponent(entry.key)}/worklog`;
    try {
        const body = await ky
            .post(url, {
                credentials: 'include',
                headers: { 'X-Atlassian-Token': 'no-check' },
                json: {
                    timeSpentSeconds: entry.seconds,
                    started: entry.started,
                    comment: entry.comment,
                },
                retry: 0,
                timeout: 15_000,
            })
            .json<{ id?: string }>();
        return { key: entry.key, ok: true, status: 200, worklogId: body.id };
    } catch (err) {
        if (err instanceof HTTPError) {
            const text = await err.response.text().catch(() => '');
            return {
                key: entry.key,
                ok: false,
                status: err.response.status,
                error: text || err.response.statusText,
            };
        }
        return { key: entry.key, ok: false, error: (err as Error).message };
    }
}
