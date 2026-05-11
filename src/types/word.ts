export type RawWordPayload = {
  word: string;
  pronunciation: string;
  meanings: Array<{
    partOfSpeech: string;
    meaning: string;
    detailedMeanings: Array<{
      number: number;
      definition: string;
      example: string;
      exampleJapanese: string;
      context: string;
      frequency: string;
      synonyms: string[];
      grammarPattern?: string;
    }>;
  }>;
  wordForms: Array<{ form: string; type: string }>;
  synonyms: string[];
  nuance: string;
  toeicExamples: Array<{ english: string; japanese: string }>;
  englishDefinition: string;
  japaneseTranslation: string;
  etymology?: string; // 語源・成り立ち（例: "re(再び) + spect(見る)"）
  collocations?: string[]; // よく使われるコロケーション（例: "have an impact on"）
};

export type WordDetails = {
  word: string;
  pronunciation: string;
  meanings: Array<{
    partOfSpeech: string;
    meaning: string;
    detailedMeanings: Array<{
      number: number;
      definition: string;
      example: string;
      exampleJapanese: string;
      context: string;
      frequency: string;
      synonyms: string[];
      grammarPattern?: string;
    }>;
  }>;
  wordForms: Array<{ form: string; type: string }>;
  synonyms: string[];
  nuance: string;
  toeicExamples: Array<{ english: string; japanese: string }>;
  englishDefinition: string;
  japaneseTranslation: string;
  etymology?: string;
  collocations?: string[];
};
