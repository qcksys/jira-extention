import { QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, NavLink, Route, Routes } from 'react-router';
import { Logger } from '~/components/Logger';
import { Settings } from '~/components/Settings';
import { ScrollArea } from '~/components/ui/scroll-area';
import { cn } from '~/lib/utils';
import { ComposerProvider } from '~/state/composer';
import { queryClient } from '~/state/query-client';
import '~/styles/globals.css';

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ComposerProvider>
                <HashRouter>
                    <div className="flex h-[600px] min-w-[360px] max-w-[520px] flex-col overflow-hidden bg-background">
                        <nav className="flex gap-4 border-b px-3 py-3 text-sm">
                            <NavLink to="/" end className={navLinkClass}>
                                Logger
                            </NavLink>
                            <NavLink to="/settings" className={navLinkClass}>
                                Settings
                            </NavLink>
                        </nav>
                        <ScrollArea className="min-h-0 flex-1">
                            <main className="px-3 py-3">
                                <Routes>
                                    <Route path="/" element={<Logger />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </main>
                        </ScrollArea>
                    </div>
                </HashRouter>
            </ComposerProvider>
        </QueryClientProvider>
    );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(
        'no-underline transition-colors',
        isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
    );
}
