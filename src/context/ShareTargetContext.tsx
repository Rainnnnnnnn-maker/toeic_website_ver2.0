"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

type ShareTargetContextType = {
    shareTarget: HTMLElement | null;
    setShareTarget: Dispatch<SetStateAction<HTMLElement | null>>;
};

const ShareTargetContext = createContext<ShareTargetContextType | undefined>(undefined);

export function ShareTargetProvider({ children }: { children: ReactNode }) {
    const [shareTarget, setShareTarget] = useState<HTMLElement | null>(null);

    return (
        <ShareTargetContext.Provider value={{ shareTarget, setShareTarget }}>
            {children}
        </ShareTargetContext.Provider>
    );
}

export function useShareTarget() {
    const context = useContext(ShareTargetContext);
    if (context === undefined) {
        throw new Error("useShareTarget must be used within a ShareTargetProvider");
    }
    return context;
}
