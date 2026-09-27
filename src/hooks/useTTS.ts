import { useState, useRef, useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

type AudioRequest = {
    text: string;
    language: string;
    wordSlug: string;
    target: string;
    type: "word" | "sentence";
    currentAudioUrl?: string;
};

export type AudioError = { target: string; wordSlug: string; message: string };

// Stable identity: the listen player uses this function in its playback effect.
async function fetchTTS(text: string, language: string, wordSlug?: string): Promise<string> {
    const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-App-Source": "toeic-client" },
        body: JSON.stringify({ text, language, wordSlug }),
    });
    if (!response.ok) throw new Error(`Failed to synthesize speech (status: ${response.status})`);
    const json = (await response.json()) as { audioContent?: string };
    if (!json.audioContent) throw new Error("Missing audio content");
    return `data:audio/mp3;base64,${json.audioContent}`;
}

export function useTTS(scope?: string) {
    const [loadingScope, setLoadingScope] = useState<string | undefined>(undefined);
    const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
    const [audioError, setAudioError] = useState<AudioError | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef<AudioRequest | null>(null);
    const sequenceRef = useRef(0);
    const cacheRef = useRef(new Map<string, string>());

    useEffect(() => () => {
        sequenceRef.current += 1;
        requestRef.current = null;
        setLoadingTarget(null);
        setAudioError(null);
        if (audioRef.current) {
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, [scope]);

    const runRequest = async (request: AudioRequest) => {
        const sequence = ++sequenceRef.current;
        const isCurrent = () => sequenceRef.current === sequence;
        requestRef.current = request;
        setAudioError(null);
        setLoadingTarget(request.target);
        setLoadingScope(scope);
        if (audioRef.current) {
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current = null;
        }
        const cacheKey = JSON.stringify([request.text, request.language, request.wordSlug]);
        const fail = (message: string, playback = false) => {
            if (!isCurrent()) return;
            if (playback) cacheRef.current.delete(cacheKey);
            setLoadingTarget(null);
            setAudioError({ target: request.target, wordSlug: request.wordSlug, message });
        };
        let phase: "generation" | "playback" = "generation";
        try {
            const url = request.currentAudioUrl ?? cacheRef.current.get(cacheKey)
                ?? await fetchTTS(request.text, request.language, request.wordSlug);
            if (!isCurrent()) return;
            cacheRef.current.set(cacheKey, url);
            phase = "playback";
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onerror = () => fail("音声を再生できませんでした。もう一度お試しください。", true);
            audio.onended = () => {
                if (audioRef.current === audio) audioRef.current = null;
            };
            await audio.play();
            if (!isCurrent()) return;
            setLoadingTarget(null);
            sendGAEvent("event", "audio_play", request.type === "word"
                ? { type: "word", word: request.text, language: request.language }
                : { type: "sentence", id: request.target, language: request.language });
        } catch {
            fail(phase === "generation"
                ? "音声を取得できませんでした。通信環境を確認し、時間をおいて再度お試しください。"
                : "音声を再生できませんでした。もう一度お試しください。", phase === "playback");
        }
    };

    const handlePlayAudio = (word: string, currentAudioUrl?: string, language = "en", wordSlug = word.toLowerCase()) =>
        runRequest({ text: word, language, wordSlug, target: `word:${word}`, type: "word", currentAudioUrl });
    const handlePlaySentenceAudio = (text: string, id: string, language = "en", wordSlug = "") =>
        runRequest({ text, language, wordSlug, target: id, type: "sentence" });
    const retryAudio = () => {
        if (requestRef.current) void runRequest(requestRef.current);
    };

    return {
        audioLoading: loadingScope === scope && (loadingTarget?.startsWith("word:") ?? false),
        sentenceAudioLoading: loadingScope !== scope || loadingTarget?.startsWith("word:") ? null : loadingTarget,
        // Callers pass either the term or the slug as scope/wordSlug; compare case-insensitively.
        audioError: scope && audioError?.wordSlug.toLowerCase() !== scope.toLowerCase() ? null : audioError,
        retryAudio,
        handlePlayAudio,
        handlePlaySentenceAudio,
        fetchTTS,
    };
}
