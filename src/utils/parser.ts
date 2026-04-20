import type { ParseError, ParseResult, ParsedEntry, Settings } from './types';

function secondsPerUnit(settings: Settings): number {
    switch (settings.timeUnit) {
        case 'hours':
            return 3600;
        case 'minutes':
            return 60;
        case 'days':
            return settings.hoursPerDay * 3600;
    }
}

function toSeconds(raw: string, settings: Settings): number | null {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * secondsPerUnit(settings));
}

function formatStarted(date: string, hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);
    const local = new Date(`${date}T00:00:00`);
    local.setHours(h ?? 9, m ?? 0, 0, 0);
    return jiraDateFormat(local);
}

function addSeconds(iso: string, seconds: number): string {
    const d = new Date(iso);
    d.setTime(d.getTime() + seconds * 1000);
    return jiraDateFormat(d);
}

function jiraDateFormat(d: Date): string {
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    const tzMin = -d.getTimezoneOffset();
    const sign = tzMin >= 0 ? '+' : '-';
    const abs = Math.abs(tzMin);
    const tz = `${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`;
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
        `.${pad(d.getMilliseconds(), 3)}${tz}`
    );
}

export function parseLogBlock(input: string, settings: Settings): ParseResult {
    const dateRe = safeRegex(settings.dateRegex);
    const entryRe = safeRegex(settings.entryRegex);
    const entries: ParsedEntry[] = [];
    const errors: ParseError[] = [];

    if (!dateRe || !entryRe) {
        errors.push({
            line: 0,
            text: '',
            reason: !dateRe ? 'Invalid dateRegex in settings' : 'Invalid entryRegex in settings',
        });
        return { entries, errors };
    }

    let currentDate: string | null = null;
    const pendingByDate = new Map<string, ParsedEntry[]>();
    const lines = input.split(/\r?\n/);

    lines.forEach((raw, idx) => {
        const lineNum = idx + 1;
        const line = raw;
        if (!line.trim()) return;

        const dateMatch = dateRe.exec(line);
        if (dateMatch) {
            currentDate = dateMatch.groups?.date ?? dateMatch[1] ?? null;
            if (!currentDate) {
                errors.push({
                    line: lineNum,
                    text: line,
                    reason: 'Date regex matched but no `date` group',
                });
            }
            return;
        }

        const entryMatch = entryRe.exec(line);
        if (entryMatch) {
            const { key, hours, comment } = entryMatch.groups ?? {};
            if (!key || !hours || !comment) {
                errors.push({
                    line: lineNum,
                    text: line,
                    reason: 'Entry regex missing one of groups: key, hours, comment',
                });
                return;
            }
            if (!currentDate) {
                errors.push({
                    line: lineNum,
                    text: line,
                    reason: 'Entry has no preceding date line',
                });
                return;
            }
            const seconds = toSeconds(hours, settings);
            if (seconds == null) {
                errors.push({ line: lineNum, text: line, reason: `Invalid duration "${hours}"` });
                return;
            }
            const entry: ParsedEntry = {
                date: currentDate,
                key,
                seconds,
                comment: comment.trim(),
                started: '',
            };
            const bucket = pendingByDate.get(currentDate) ?? [];
            bucket.push(entry);
            pendingByDate.set(currentDate, bucket);
            entries.push(entry);
            return;
        }

        errors.push({ line: lineNum, text: line, reason: 'No regex matched' });
    });

    for (const [date, bucket] of pendingByDate) {
        if (settings.startTimeMode === 'fixed') {
            const started = formatStarted(date, settings.startTime);
            for (const entry of bucket) entry.started = started;
        } else {
            let cursor = formatStarted(date, settings.startTime);
            for (const entry of bucket) {
                entry.started = cursor;
                cursor = addSeconds(cursor, entry.seconds);
            }
        }
    }

    return { entries, errors };
}

function safeRegex(pattern: string): RegExp | null {
    try {
        return new RegExp(pattern);
    } catch {
        return null;
    }
}
