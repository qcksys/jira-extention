import { storage } from '#imports';
import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
    dateRegex: String.raw`^\s*(?<date>\d{4}-\d{2}-\d{2})\s*$`,
    entryRegex: String.raw`^\s*(?<key>[A-Z][A-Z0-9_]+-\d+)\s*\|\s*(?<hours>[\d.]+)\s*\|\s*(?<comment>.+?)\s*$`,
    timeUnit: 'hours',
    hoursPerDay: 8,
    startTimeMode: 'fixed',
    startTime: '09:00',
};

const KEY = 'local:settings';

export async function getSettings(): Promise<Settings> {
    const stored = await storage.getItem<Partial<Settings>>(KEY);
    return { ...DEFAULT_SETTINGS, ...stored };
}

export async function setSettings(settings: Settings): Promise<void> {
    await storage.setItem(KEY, settings);
}

export function watchSettings(cb: (settings: Settings) => void) {
    return storage.watch<Settings>(KEY, (newValue) => {
        cb({ ...DEFAULT_SETTINGS, ...newValue });
    });
}
