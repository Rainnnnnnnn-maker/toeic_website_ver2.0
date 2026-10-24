import { useRef, useState } from "react";
import { fetchWordDetail } from "@/actions/word";
import type { WordDetails } from "@/types/word";

/** 学習カードの答え（訳・例文）の取得状態 */
export type StudyDetailState =
    | { status: "loading" }
    | { status: "ready"; detail: WordDetails }
    | { status: "error" };

/**
 * 学習カードに出す単語詳細を slug ごとに取得・保持するフック。
 * 取得中・取得済みの単語は再要求せず、失敗した単語だけ再試行できる。
 */
export function useStudyWordDetails() {
    const [detailBySlug, setDetailBySlug] = useState<Record<string, StudyDetailState>>({});
    const requestedSlugsRef = useRef(new Set<string>());

    const loadDetail = async (slug: string): Promise<void> => {
        if (requestedSlugsRef.current.has(slug)) return;
        requestedSlugsRef.current.add(slug);
        setDetailBySlug((prev) => ({ ...prev, [slug]: { status: "loading" } }));

        let next: StudyDetailState = { status: "error" };
        try {
            const detail = await fetchWordDetail(slug);
            if (detail) next = { status: "ready", detail };
        } catch (e) {
            console.error(e);
        }
        if (next.status === "error") requestedSlugsRef.current.delete(slug);
        setDetailBySlug((prev) => ({ ...prev, [slug]: next }));
    };

    return { detailBySlug, loadDetail };
}
