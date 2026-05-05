"use client";

import { createContext, use, useState, ReactNode, Dispatch, SetStateAction } from "react";

type ShareTargetContextType = {
    shareTarget: HTMLElement | null;
    setShareTarget: Dispatch<SetStateAction<HTMLElement | null>>;
};

const ShareTargetContext = createContext<ShareTargetContextType | undefined>(undefined);

export function ShareTargetProvider({ children }: { children: ReactNode }) {
    const [shareTarget, setShareTarget] = useState<HTMLElement | null>(null);

    return (
        <ShareTargetContext value={{ shareTarget, setShareTarget }}>
            {children}
        </ShareTargetContext>
    );
}

export function useShareTarget() {
    const context = use(ShareTargetContext);
    if (context === undefined) {
        throw new Error("useShareTarget must be used within a ShareTargetProvider");
    }
    return context;
}
