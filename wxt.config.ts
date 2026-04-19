import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-react'],
    vite: () => ({
        plugins: [tailwindcss()],
    }),
    manifest: {
        name: 'Jira Time Logger',
        description: 'Bulk-log worklogs on Jira from a text block.',
        permissions: ['storage', 'activeTab', 'scripting'],
        host_permissions: ['*://*.atlassian.net/*'],
        action: {
            default_title: 'Jira Time Logger',
        },
    },
});
