import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { DEFAULT_SETTINGS, getSettings, setSettings } from '~/utils/config';
import type { Settings as SettingsT } from '~/utils/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function Settings() {
    const [draft, setDraft] = useState<SettingsT | null>(null);
    const [save, setSave] = useState<SaveState>('idle');

    useEffect(() => {
        void getSettings().then(setDraft);
    }, []);

    if (!draft) return <p className="text-muted-foreground text-sm">Loading…</p>;

    function update<K extends keyof SettingsT>(key: K, value: SettingsT[K]) {
        setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
        setSave('idle');
    }

    async function persist() {
        if (!draft) return;
        setSave('saving');
        try {
            await setSettings(draft);
            setSave('saved');
        } catch {
            setSave('error');
        }
    }

    function reset() {
        setDraft(DEFAULT_SETTINGS);
        setSave('idle');
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="dateRegex">
                    Date regex (named group: <code className="font-mono text-xs">date</code>)
                </Label>
                <Input
                    id="dateRegex"
                    value={draft.dateRegex}
                    onChange={(e) => update('dateRegex', e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="entryRegex">
                    Entry regex (named groups: <code className="font-mono text-xs">key</code>,{' '}
                    <code className="font-mono text-xs">hours</code>,{' '}
                    <code className="font-mono text-xs">comment</code>)
                </Label>
                <Input
                    id="entryRegex"
                    value={draft.entryRegex}
                    onChange={(e) => update('entryRegex', e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Time unit</Label>
                <Select
                    value={draft.timeUnit}
                    onValueChange={(value) => update('timeUnit', value as SettingsT['timeUnit'])}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hours">decimal hours (2 = 2h, .75 = 45m)</SelectItem>
                        <SelectItem value="minutes">minutes (120 = 2h, 45 = 45m)</SelectItem>
                        <SelectItem value="days">
                            days (1 = {draft.hoursPerDay}h, 0.5 = {draft.hoursPerDay / 2}h)
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {draft.timeUnit === 'days' && (
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="hoursPerDay">Hours per day</Label>
                    <Input
                        id="hoursPerDay"
                        type="number"
                        min="0.1"
                        step="0.25"
                        value={draft.hoursPerDay}
                        onChange={(e) => update('hoursPerDay', Number(e.target.value))}
                    />
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <Label>Start-time mode</Label>
                <Select
                    value={draft.startTimeMode}
                    onValueChange={(value) =>
                        update('startTimeMode', value as SettingsT['startTimeMode'])
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fixed">fixed (all entries at the same time)</SelectItem>
                        <SelectItem value="sequential">
                            sequential (back-to-back from start time)
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="startTime">Start time (HH:mm, local)</Label>
                <Input
                    id="startTime"
                    type="time"
                    value={draft.startTime}
                    onChange={(e) => update('startTime', e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={() => void persist()} disabled={save === 'saving'}>
                    {save === 'saving' ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="outline" onClick={reset} type="button">
                    Reset to defaults
                </Button>
                {save === 'saved' && <span className="text-sm text-muted-foreground">Saved.</span>}
                {save === 'error' && <span className="text-destructive text-sm">Save failed.</span>}
            </div>
        </div>
    );
}
