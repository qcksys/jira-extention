import { useMutation } from '@tanstack/react-query';
import { Check, Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/lib/utils';
import { useComposer } from '~/state/composer';
import { type ActiveTarget, useActiveTarget, useSettings } from '~/state/hooks';
import { parseLogBlock } from '~/utils/parser';
import type {
    LogResult,
    ParsedEntry,
    ReportingFormat,
    Settings,
    WorklogRequest,
    WorklogResponse,
} from '~/utils/types';

interface SubmitPayload {
    entries: ParsedEntry[];
    target: ActiveTarget;
    reportingFormat: ReportingFormat;
}

async function postJira(
    tabId: number,
    entries: ParsedEntry[],
    reportingFormat: ReportingFormat,
): Promise<LogResult[]> {
    const req: WorklogRequest = { type: 'log-worklogs', entries, reportingFormat };
    const resp = (await browser.tabs.sendMessage(tabId, req)) as WorklogResponse | undefined;
    if (!resp) {
        throw new Error('No response from Jira content script. Refresh the tab.');
    }
    return resp.results;
}

export function Logger() {
    const { data: settings } = useSettings();
    const { input, setInput } = useComposer();
    const targetQuery = useActiveTarget();
    const target = targetQuery.data;
    const [results, setResults] = useState<LogResult[] | null>(null);

    const submitMutation = useMutation({
        mutationFn: async ({ entries, target, reportingFormat }: SubmitPayload) => {
            if (target.kind !== 'jira') {
                throw new Error('Open a Jira Cloud tab (*.atlassian.net) in the active window.');
            }
            return postJira(target.tabId, entries, reportingFormat);
        },
        onSuccess: (r) => setResults(r),
    });

    const preview = useMemo(() => {
        if (!settings) return null;
        return parseLogBlock(input, settings);
    }, [input, settings]);

    const entryCount = preview?.entries.length ?? 0;
    const canSubmit =
        !submitMutation.isPending &&
        !!preview &&
        preview.entries.length > 0 &&
        preview.errors.length === 0 &&
        target?.kind === 'jira';

    function submit() {
        if (!preview || !settings || !target || target.kind !== 'jira') return;
        setResults(null);
        submitMutation.mutate({
            entries: preview.entries,
            target,
            reportingFormat: settings.reportingFormat,
        });
    }

    const placeholderDate = useMemo(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Target:</span>
                {target?.kind === 'jira' ? (
                    <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-accent-foreground">
                        Jira
                    </span>
                ) : (
                    <span className="text-destructive">
                        No Jira tab is active — switch to{' '}
                        <code className="font-mono">*.atlassian.net</code>.
                    </span>
                )}
            </div>

            <Textarea
                className="font-mono text-xs"
                placeholder={`${placeholderDate}\nTICKET-1 | 1 | Note\nTICKET-2 | 2.5 | Note Two`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
            />

            {preview && (preview.entries.length > 0 || preview.errors.length > 0) && settings && (
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
                                        {formatDuration(e, settings)} · {e.date}{' '}
                                        {timePart(e.started)} · {e.comment}
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

            <Button disabled={!canSubmit} onClick={submit}>
                {submitMutation.isPending ? (
                    <>
                        <Loader2 className="size-4 animate-spin" /> Logging {entryCount}{' '}
                        {entryCount === 1 ? 'entry' : 'entries'}…
                    </>
                ) : target?.kind === 'jira' ? (
                    'Log time to Jira'
                ) : (
                    'Log time'
                )}
            </Button>

            {submitMutation.isPending && (
                <p className="text-muted-foreground text-xs">Posting — don't close the popup.</p>
            )}

            {submitMutation.error && (
                <p className="text-destructive text-sm">
                    {(submitMutation.error as Error).message}
                </p>
            )}

            {results && (
                <ul className="flex flex-col gap-1 text-xs">
                    {results.map((r, i) => (
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

function formatDuration(entry: ParsedEntry, settings: Settings): string {
    if (settings.reportingFormat === 'days') return `${trimDays(entry.days)}d`;
    const h = Math.floor(entry.seconds / 3600);
    const m = Math.round((entry.seconds % 3600) / 60);
    if (h && m) return `${h}h${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}

function trimDays(days: number): string {
    const fixed = days.toFixed(4);
    return fixed.replace(/\.?0+$/, '') || '0';
}

function timePart(iso: string): string {
    return iso ? iso.slice(11, 16) : '';
}
