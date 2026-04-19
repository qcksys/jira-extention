import { HashRouter, NavLink, Route, Routes } from 'react-router';
import { cn } from '~/lib/utils';
import { Logger } from './Logger';
import { Settings } from './Settings';
import '~/styles/globals.css';

export function App() {
    return (
        <HashRouter>
            <div className="flex min-w-[360px] max-w-[520px] flex-col gap-3 px-3 py-3">
                <nav className="flex gap-4 border-b pb-2 text-sm">
                    <NavLink to="/" end className={navLinkClass}>
                        Logger
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClass}>
                        Settings
                    </NavLink>
                </nav>
                <main>
                    <Routes>
                        <Route path="/" element={<Logger />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(
        'no-underline transition-colors',
        isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
    );
}
