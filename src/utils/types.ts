export type TimeUnit = 'hours' | 'minutes' | 'days';
export type StartTimeMode = 'fixed' | 'sequential';

export interface Settings {
    dateRegex: string;
    entryRegex: string;
    timeUnit: TimeUnit;
    hoursPerDay: number;
    startTimeMode: StartTimeMode;
    startTime: string;
}

export interface ParsedEntry {
    date: string;
    key: string;
    seconds: number;
    comment: string;
    started: string;
}

export interface ParseError {
    line: number;
    text: string;
    reason: string;
}

export interface ParseResult {
    entries: ParsedEntry[];
    errors: ParseError[];
}

export interface LogResult {
    key: string;
    ok: boolean;
    status?: number;
    error?: string;
    worklogId?: string;
}

export type WorklogRequest = { type: 'log-worklogs'; entries: ParsedEntry[] };
export type WorklogResponse = { results: LogResult[] };
