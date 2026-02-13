import { useState, useRef, useEffect, useCallback } from "react";

type TTSState = {
    audioUrl?: string;
    cachedWord?: string;
    audioLoading: boolean;
    sentenceAudioUrls: Record<string, string>;
    sentenceAudioLoading: string | null;
};

export function useTTS() {
    const [state, setState] = useState<TTSState>({
        audioLoading: false,
        sentenceAudioUrls: {},
        sentenceAudioLoading: null,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playAudio = useCallback((url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
        };

        audio.play().catch((e) => console.error("Audio play failed", e));
    }, []);

    const fetchTTS = useCallback(async (text: string, language: string): Promise<string> => {
        const response = await fetch("/api/tts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-App-Source": "toeic-client",
            },
            body: JSON.stringify({ text, language }),
        });

        if (!response.ok) throw new Error("Failed to synthesize speech");

        const json = (await response.json()) as { audioContent?: string };
        if (!json.audioContent) throw new Error("Missing audio content");

        return `data:audio/mp3;base64,${json.audioContent}`;
    }, []);

    const handlePlayAudio = useCallback(async (word: string, currentAudioUrl?: string, language: string = "en") => {
        if (currentAudioUrl) {
            playAudio(currentAudioUrl);
            return;
        }
        // If we already have it in state for the SAME word, play it
        if (state.audioUrl && state.cachedWord === word) {
            playAudio(state.audioUrl);
            return;
        }

        setState((prev) => ({ ...prev, audioLoading: true }));

        try {
            const audioUrl = await fetchTTS(word, language);
            setState((prev) => ({
                ...prev,
                audioUrl,
                cachedWord: word,
                audioLoading: false
            }));
            playAudio(audioUrl);
        } catch {
            setState((prev) => ({ ...prev, audioLoading: false }));
            alert("音声の生成に失敗しました。時間をおいて再度お試しください。");
        }
    }, [state.audioUrl, state.cachedWord, playAudio, fetchTTS]);

    const handlePlaySentenceAudio = useCallback(async (text: string, id: string, language: string = "en") => {
        if (state.sentenceAudioUrls[id]) {
            playAudio(state.sentenceAudioUrls[id]);
            return;
        }

        setState((prev) => ({ ...prev, sentenceAudioLoading: id }));

        try {
            const audioUrl = await fetchTTS(text, language);
            setState((prev) => ({
                ...prev,
                sentenceAudioUrls: { ...prev.sentenceAudioUrls, [id]: audioUrl },
                sentenceAudioLoading: null,
            }));
            playAudio(audioUrl);
        } catch {
            setState((prev) => ({ ...prev, sentenceAudioLoading: null }));
            alert("音声の生成に失敗しました。時間をおいて再度お試しください。");
        }
    }, [state.sentenceAudioUrls, playAudio, fetchTTS]);

    return {
        ...state,
        handlePlayAudio,
        handlePlaySentenceAudio,
    };
}
