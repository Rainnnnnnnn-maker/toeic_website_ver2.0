# @google/genai への移行プラン

## 概要
現在使用している旧SDK (`@google/generative-ai`) から新SDK (`@google/genai`) への移行手順の記録。
修正箇所は `package.json` と `src/data/word-detail.ts` のみであり、短時間で安全に移行可能。

## 事前準備
- **Google API Key**: **そのまま使用可能**。AI Studio から発行されている既存の `GEMINI_API_KEY` 環境変数をそのまま利用できるため、GCP側の再設定等は不要。

## 移行手順

### 1. パッケージの入れ替え
`package.json` の依存関係を更新する。
```bash
npm uninstall @google/generative-ai
npm install @google/genai
```

### 2. `src/data/word-detail.ts` のリファクタリング
新SDKの仕様に合わせてコードを修正する。

#### インポートの変更
```typescript
// Before
import { GoogleGenerativeAI } from "@google/generative-ai";
// After
import { GoogleGenAI } from "@google/genai";
```

#### クライアントの初期化
```typescript
// Before
const client = new GoogleGenerativeAI(apiKey);
// After
const client = new GoogleGenAI({ apiKey });
```

#### API呼び出しメソッドの変更
旧SDKの `getGenerativeModel` を経由する呼び出しから、新SDKの `models.generateContent` を使用した直接呼び出しに変更する。
※ 既存の `buildModel` 関数は不要になるため削除する。

```typescript
// Before
const model = client.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { temperature: 0.2, maxOutputTokens, responseMimeType: "application/json" }
});
const result = await model.generateContent(attempt.prompt);
const text = result.response.text();

// After
const response = await client.models.generateContent({
  model: "gemini-2.5-flash-lite",
  contents: attempt.prompt,
  config: {
    temperature: 0.2,
    maxOutputTokens: attempt.maxOutputTokens,
    responseMimeType: "application/json",
  }
});
const text = response.text; // プロパティへの直接アクセス
```

### 3. 動作確認
1. 開発サーバー (`npm run dev`) を起動する。
2. 単語詳細ページ (`/words/[slug]`) にアクセスする。
3. Gemini経由でのデータ生成、および Redis (Upstash) へのキャッシュ保存が正常に行われるか確認する。
