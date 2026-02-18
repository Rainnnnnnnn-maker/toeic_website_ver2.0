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
  etymology?: string;
  usageNotes?: {
    commonCollocations?: string[];
    register?: string;
    regionalVariations?: string;
  };
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
  usageNotes?: {
    commonCollocations?: string[];
    register?: string;
    regionalVariations?: string;
  };
};
