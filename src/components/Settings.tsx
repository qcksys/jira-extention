import { type ReactNode, useState } from 'react';
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
import { useSettings, useUpdateSettings } from '~/state/hooks';
import { DEFAULT_SETTINGS } from '~/utils/config';
import type { Settings as SettingsT } from '~/utils/types';

export function Settings() {
    const settingsQuery = useSettings();
    if (settingsQuery.isPlaceholderData || !settingsQuery.data) {
        return <p className="text-muted-foreground text-sm">Loading…</p>;
    }
    return <SettingsForm stored={settingsQuery.data} />;
}

interface SettingsFormProps {
    stored: SettingsT;
}

function SettingsForm({ stored }: SettingsFormProps) {
    const updateSettings = useUpdateSettings();
    const [draft, setDraft] = useState<SettingsT>(stored);
    const [fieldSaveState, setFieldSaveState] = useState<'idle' | 'saved' | 'error'>('idle');

    async function persist(next: SettingsT) {
        try {
            await updateSettings.mutateAsync(next);
            setFieldSaveState('saved');
        } catch {
            setFieldSaveState('error');
        }
    }

    function updateField<K extends keyof SettingsT>(key: K, value: SettingsT[K]) {
        setDraft((prev) => ({ ...prev, [key]: value }));
        setFieldSaveState('idle');
    }

    function commitField<K extends keyof SettingsT>(key: K, value: SettingsT[K]) {
        if (stored[key] === value) return;
        void persist({ ...stored, ...draft, [key]: value });
    }

    function reset() {
        setDraft(DEFAULT_SETTINGS);
        void persist(DEFAULT_SETTINGS);
    }

    return (
        <div className="flex flex-col gap-5">
            <Section title="Parsing">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dateRegex">
                        Date regex (named group: <code className="font-mono text-xs">date</code>)
                    </Label>
                    <Input
                        id="dateRegex"
                        value={draft.dateRegex}
                        onChange={(e) => updateField('dateRegex', e.target.value)}
                        onBlur={(e) => commitField('dateRegex', e.target.value)}
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
                        onChange={(e) => updateField('entryRegex', e.target.value)}
                        onBlur={(e) => commitField('entryRegex', e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                        The <code className="font-mono">hours</code> group is interpreted using the
                        time unit selected below.
                    </p>
                </div>
            </Section>

            <Section title="Time">
                <div className="flex flex-col gap-1.5">
                    <Label>Time unit</Label>
                    <Select
                        value={draft.timeUnit}
                        onValueChange={(value) => {
                            const next = value as SettingsT['timeUnit'];
                            updateField('timeUnit', next);
                            commitField('timeUnit', next);
                        }}
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
                            onChange={(e) => updateField('hoursPerDay', Number(e.target.value))}
                            onBlur={(e) => commitField('hoursPerDay', Number(e.target.value))}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <Label>Start-time mode</Label>
                    <Select
                        value={draft.startTimeMode}
                        onValueChange={(value) => {
                            const next = value as SettingsT['startTimeMode'];
                            updateField('startTimeMode', next);
                            commitField('startTimeMode', next);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">
                                fixed (all entries at the same time)
                            </SelectItem>
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
                        onChange={(e) => updateField('startTime', e.target.value)}
                        onBlur={(e) => commitField('startTime', e.target.value)}
                    />
                </div>
            </Section>

            <Section title="Jira">
                <div className="flex flex-col gap-1.5">
                    <Label>Reporting format</Label>
                    <Select
                        value={draft.reportingFormat}
                        onValueChange={(value) => {
                            const next = value as SettingsT['reportingFormat'];
                            updateField('reportingFormat', next);
                            commitField('reportingFormat', next);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="seconds">
                                seconds (exact — sends timeSpentSeconds)
                            </SelectItem>
                            <SelectItem value="days">
                                days (e.g. 0.3d — sends timeSpent as Xd)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                        Choose <strong>days</strong> so a decimal-day entry posts to Jira as{' '}
                        <code className="font-mono">0.3d</code> rather than{' '}
                        <code className="font-mono">timeSpentSeconds</code>. Jira converts{' '}
                        <code className="font-mono">Xd</code> using its own configured day length.
                    </p>
                </div>
            </Section>

            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={reset} type="button">
                    Reset to defaults
                </Button>
                {updateSettings.isPending && (
                    <span className="text-muted-foreground text-sm">Saving…</span>
                )}
                {!updateSettings.isPending && fieldSaveState === 'saved' && (
                    <span className="text-muted-foreground text-sm">Saved.</span>
                )}
                {!updateSettings.isPending && fieldSaveState === 'error' && (
                    <span className="text-destructive text-sm">Save failed.</span>
                )}
            </div>
        </div>
    );
}

interface SectionProps {
    title: string;
    children: ReactNode;
}

function Section({ title, children }: SectionProps) {
    return (
        <section className="flex flex-col gap-3 border-t pt-3 first:border-t-0 first:pt-0">
            <h2 className="text-sm font-semibold">{title}</h2>
            {children}
        </section>
    );
}
