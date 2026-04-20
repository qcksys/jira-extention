import { defineContentScript } from '#imports';
import { postWorklog } from '~/utils/jira';
import type { LogResult, WorklogRequest, WorklogResponse } from '~/utils/types';

export default defineContentScript({
    matches: ['*://*.atlassian.net/*'],
    runAt: 'document_idle',
    main() {
        browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
            if (!isWorklogRequest(message)) return false;
            void (async () => {
                const results: LogResult[] = [];
                for (const entry of message.entries) {
                    results.push(
                        await postWorklog(window.location.origin, entry, message.reportingFormat),
                    );
                }
                const response: WorklogResponse = { results };
                sendResponse(response);
            })();
            return true;
        });
    },
});

function isWorklogRequest(msg: unknown): msg is WorklogRequest {
    if (typeof msg !== 'object' || msg === null) return false;
    const m = msg as { type?: unknown; entries?: unknown; reportingFormat?: unknown };
    return (
        m.type === 'log-worklogs' &&
        Array.isArray(m.entries) &&
        (m.reportingFormat === 'seconds' || m.reportingFormat === 'days')
    );
}
