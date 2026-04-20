import { createContext, useContext, useState, type ReactNode } from 'react';

interface ComposerState {
    input: string;
    setInput: (v: string) => void;
}

const ComposerContext = createContext<ComposerState | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
    const [input, setInput] = useState('');

    return (
        <ComposerContext.Provider value={{ input, setInput }}>{children}</ComposerContext.Provider>
    );
}

export function useComposer(): ComposerState {
    const ctx = useContext(ComposerContext);
    if (!ctx) throw new Error('useComposer must be used inside ComposerProvider');
    return ctx;
}
