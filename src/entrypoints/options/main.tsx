import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '~/components/App';

if (!window.location.hash) {
    window.location.hash = '#/settings';
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
