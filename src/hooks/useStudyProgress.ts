import { useEffect, useState } from "react";
import {
    addUnique,
    removeValue,
    uniqueStrings,
    parsePersistedStudyState,
    type PersistedStudyStateV1,
} from "@/lib/study-utils";

// モジュールスコープに置くことで useEffect の依存配列に含める必要をなくしている
function writePersistedState(
    storageKey: string,
    slug: string,
    remembered: string[],
    forgotten: string[],
    later: string[],
    count: number,
): void {
    if (typeof window === "undefined") return;
    try {
        const nextState: PersistedStudyStateV1 = {
            v: 1,
            currentSlug: slug,
            rememberedSlugs: remembered,
            forgottenSlugs: forgotten,
            laterSlugs: later,
            consecutiveRememberCount: count,
            updatedAt: Date.now(),
        };
        window.sessionStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch {}
}

/** sessionStorage から学習状態を読み出す。不正・未保存なら null。 */
export function readPersistedState(storageKey: string): PersistedStudyStateV1 | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(storageKey);
        if (!raw) return null;
        return parsePersistedStudyState(raw);
    } catch {
        return null;
    }
}

/** sessionStorage の学習状態を破棄する。 */
export function clearPersistedState(storageKey: string): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.removeItem(storageKey);
    } catch {}
}

/**
 * 覚えた / 覚えていない / あとで の学習進捗と連続正解カウントを管理し、
 * 変更を sessionStorage へ自動永続化するフック。
 */
export function useStudyProgress(storageKey: string, currentSlug: string | null) {
    const [rememberedSlugs, setRememberedSlugs] = useState<string[]>([]);
    const [forgottenSlugs, setForgottenSlugs] = useState<string[]>([]);
    const [laterSlugs, setLaterSlugs] = useState<string[]>([]);
    const [consecutiveRememberCount, setConsecutiveRememberCount] = useState(0);

    useEffect(() => {
        if (!currentSlug) return;
        writePersistedState(storageKey, currentSlug, rememberedSlugs, forgottenSlugs, laterSlugs, consecutiveRememberCount);
    }, [storageKey, currentSlug, rememberedSlugs, forgottenSlugs, laterSlugs, consecutiveRememberCount]);

    /** 「覚えている」: 連続カウントを増やし、増加後のカウントを返す */
    const markRemembered = (slug: string): number => {
        setRememberedSlugs((prev) => addUnique(prev, slug));
        setForgottenSlugs((prev) => removeValue(prev, slug));
        setLaterSlugs((prev) => removeValue(prev, slug));
        const newCount = consecutiveRememberCount + 1;
        setConsecutiveRememberCount(newCount);
        return newCount;
    };

    /**
     * 「覚えていない」: 連続カウントをリセットする。
     * 直後の router.push でアンマウントされ useEffect が走らない可能性があるため、
     * ここで同期的に永続化する。
     */
    const markForgot = (slug: string): void => {
        const newForgot = addUnique(forgottenSlugs, slug);
        const newRemembered = removeValue(rememberedSlugs, slug);
        const newLater = removeValue(laterSlugs, slug);

        setForgottenSlugs(newForgot);
        setRememberedSlugs(newRemembered);
        setLaterSlugs(newLater);
        setConsecutiveRememberCount(0);

        writePersistedState(storageKey, slug, newRemembered, newForgot, newLater, 0);
    };

    /** 「あとで」: 判断保留なので連続カウントはリセットしない */
    const markLater = (slug: string): void => {
        setLaterSlugs((prev) => addUnique(prev, slug));
        setRememberedSlugs((prev) => removeValue(prev, slug));
        setForgottenSlugs((prev) => removeValue(prev, slug));
    };

    /** sessionStorage から復元した状態を反映する */
    const restoreProgress = (persisted: PersistedStudyStateV1): void => {
        setRememberedSlugs(uniqueStrings(persisted.rememberedSlugs));
        setForgottenSlugs(uniqueStrings(persisted.forgottenSlugs));
        setLaterSlugs(uniqueStrings(persisted.laterSlugs ?? []));
        if (persisted.consecutiveRememberCount !== undefined) {
            setConsecutiveRememberCount(persisted.consecutiveRememberCount);
        }
    };

    /** 進捗をすべて破棄する（リロード時） */
    const resetProgress = (): void => {
        setRememberedSlugs([]);
        setForgottenSlugs([]);
        setLaterSlugs([]);
    };

    return {
        laterSlugs,
        consecutiveRememberCount,
        markRemembered,
        markForgot,
        markLater,
        restoreProgress,
        resetProgress,
    };
}
