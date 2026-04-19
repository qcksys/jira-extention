import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/lib/utils';
import { getSettings } from '~/utils/config';
import { parseLogBlock } from '~/utils/parser';
import type {
    LogResult,
    ParseResult,
    Settings,
    WorklogRequest,
    WorklogResponse,
} from '~/utils/types';

type Status =
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'done'; results: LogResult[] }
    | { kind: 'error'; message: string };

const JIRA_HOST_RE = /\.atlassian\.net$/;

export function Logger() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<Status>({ kind: 'idle' });

    useEffect(() => {
        void getSettings().then(setSettings);
    }, []);

    const preview: ParseResult | null = useMemo(() => {
        if (!settings) return null;
        return parseLogBlock(input, settings);
    }, [input, settings]);

    const canSubmit =
        status.kind !== 'submitting' &&
        !!preview &&
        preview.entries.length > 0 &&
        preview.errors.length === 0;

    async function submit() {
        if (!preview) return;
        setStatus({ kind: 'submitting' });
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const host = tab?.url ? new URL(tab.url).hostname : '';
            if (!tab?.id || !JIRA_HOST_RE.test(host)) {
                setStatus({
                    kind: 'error',
                    message: 'Open a Jira Cloud tab (*.atlassian.net) in the active window.',
                });
                return;
            }
            const req: WorklogRequest = { type: 'log-worklogs', entries: preview.entries };
            const resp = (await browser.tabs.sendMessage(tab.id, req)) as
                | WorklogResponse
                | undefined;
            if (!resp) {
                setStatus({
                    kind: 'error',
                    message: 'No response from content script. Refresh the Jira tab.',
                });
                return;
            }
            setStatus({ kind: 'done', results: resp.results });
        } catch (err) {
            setStatus({ kind: 'error', message: (err as Error).message });
        }
    }

    const placeholderDate = useMemo(() => {
        const date = new Date();

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <Textarea
                className="font-mono text-xs"
                placeholder={`${placeholderDate}\nTICKET-1 | 1 | Note\nTICKET-2 | 2.5 | Note Two`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
            />

            {preview && (preview.entries.length > 0 || preview.errors.length > 0) && (
                <Card size="sm">
                    <CardHeader>
                        <CardTitle>
                            {preview.entries.length} entr
                            {preview.entries.length === 1 ? 'y' : 'ies'}
                            {preview.errors.length > 0 && (
                                <span className="text-destructive ml-1.5">
                                    · {preview.errors.length} error
                                    {preview.errors.length === 1 ? '' : 's'}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {preview.entries.length > 0 && (
                            <ul className="flex list-none flex-col gap-1 p-0 text-xs">
                                {preview.entries.map((e, i) => (
                                    <li key={i}>
                                        <code className="font-mono">{e.key}</code> ·{' '}
                                        {formatDuration(e.seconds)} · {e.date} {timePart(e.started)}{' '}
                                        · {e.comment}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {preview.errors.length > 0 && (
                            <ul className="text-destructive flex list-none flex-col gap-1 p-0 text-xs">
                                {preview.errors.map((err, i) => (
                                    <li key={i}>
                                        {err.line > 0 ? `Line ${err.line}: ` : ''}
                                        {err.reason}
                                        {err.text && (
                                            <>
                                                {' '}
                                                — <code className="font-mono">{err.text}</code>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}

            <Button disabled={!canSubmit} onClick={() => void submit()}>
                {status.kind === 'submitting' ? 'Logging…' : 'Log time'}
            </Button>

            {status.kind === 'error' && (
                <p className="text-destructive text-sm">{status.message}</p>
            )}

            {status.kind === 'done' && (
                <ul className="flex flex-col gap-1 text-xs">
                    {status.results.map((r, i) => (
                        <li
                            key={i}
                            className={cn(
                                'flex items-center gap-1.5',
                                r.ok ? 'text-foreground' : 'text-destructive',
                            )}
                        >
                            {r.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                            <code className="font-mono">{r.key}</code>
                            {!r.ok && (
                                <span>
                                    {' '}
                                    — {r.status ?? ''} {r.error ?? ''}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h && m) return `${h}h${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}

function timePart(iso: string): string {
    return iso ? iso.slice(11, 16) : '';
}
