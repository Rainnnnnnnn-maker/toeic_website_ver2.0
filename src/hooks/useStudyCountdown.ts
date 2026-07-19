import { useEffect, useRef, useState } from "react";
import { getNavigationType } from "@/lib/study-utils";

/**
 * 学習カードの「2→1→0」カウントダウンとヒントボタン表示を管理するフック。
 * BFCache 復元（戻るボタン）時は、ヒントボタン表示中またはカード裏返し中でなければ
 * カウントダウンをリセットする。
 */
export function useStudyCountdown(isFlipped: boolean) {
    const [countdownValue, setCountdownValue] = useState<number | null>(null);
    const [countdownKey, setCountdownKey] = useState(0);
    const [showHintButton, setShowHintButton] = useState(false);
    const timeoutsRef = useRef<number[]>([]);

    useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            // 戻るボタンでの遷移時、既にヒントボタンが表示されているか
            // カードが裏返っている場合は状態をリセットしない
            //（BFCache で復元された場合でもヒントボタンの状態を維持するため）。
            if (showHintButton || isFlipped) return;
            if (event.persisted || getNavigationType() === "back_forward") {
                for (const id of timeoutsRef.current) {
                    clearTimeout(id);
                }
                timeoutsRef.current = [];
                setCountdownValue(null);
                setShowHintButton(false);
            }
        };

        window.addEventListener("pageshow", onPageShow);
        // アンマウント時にカウントダウンをクリアすると、戻るボタンで戻った時に
        // ヒントボタンが消えてしまうため、リスナー解除のみ行う。
        return () => window.removeEventListener("pageshow", onPageShow);
    }, [showHintButton, isFlipped]);

    const startCountdown = () => {
        for (const id of timeoutsRef.current) {
            clearTimeout(id);
        }
        timeoutsRef.current = [];

        // 2 からカウントダウンし、終了後にヒントボタンを表示する
        setCountdownValue(2);
        setShowHintButton(false);
        setCountdownKey((k) => k + 1);

        const t1 = window.setTimeout(() => {
            setCountdownValue(1);
            setCountdownKey((k) => k + 1);
        }, 1000);
        const t0 = window.setTimeout(() => {
            setCountdownValue(0);
            setCountdownKey((k) => k + 1);
        }, 2000);
        const th = window.setTimeout(() => {
            setCountdownValue(null);
            setShowHintButton(true);
        }, 2060); // 2s + 60ms

        timeoutsRef.current = [t1, t0, th];
    };

    return {
        countdownValue,
        countdownKey,
        showHintButton,
        setShowHintButton,
        startCountdown,
    };
}
