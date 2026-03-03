---
name: "sync-words-from-blob"
description: "Vercel Blobから単語ファイルをダウンロードし、ローカルの/__doc__フォルダを更新し、変更ログを記録します。ユーザーが単語ファイルの同期や更新を求めた時に呼び出します。"
---

# Sync Words from Vercel Blob

このスキルは、Vercel Blob ストレージから最新の単語ファイルを取得し、ローカル環境を更新するためのものです。

## 実行手順

1.  **環境変数の確認**:
    *   `.env.local` ファイルから `BLOB_URL_IMPORTANT`, `BLOB_URL_MEDIUM`, `BLOB_URL_HIGH` または `BLOB_READ_WRITE_TOKEN` を読み込みます。
    *   直接URL（`BLOB_URL_*`）が設定されている場合はそれを使用し、設定されていない場合は `BLOB_READ_WRITE_TOKEN` を使用して一覧取得を行います。
    *   どちらも利用できない場合はエラー終了します。

2.  **スクリプトの作成と実行**:
    *   プロジェクトルートに一時的な Node.js スクリプト（例: `sync-blob.mjs`）を作成します。
    *   スクリプト内で以下の処理を実装します:
        1.  `.env.local` から環境変数を読み込みます。
        2.  `BLOB_URL_IMPORTANT`, `BLOB_URL_MEDIUM`, `BLOB_URL_HIGH` が全て存在する場合:
            *   それぞれのURLをダウンロード対象とします。
        3.  上記が存在しない場合:
            *   `@vercel/blob` の `list` メソッドを使用してファイル情報を取得し、ダウンロード対象とします。
        4.  `fetch` を使用してファイルの内容をダウンロードします。
        5.  ローカルの `__doc__/word.txt` 等を読み込み、ダウンロードした内容と比較します。
        6.  差異がある場合:
            *   ファイルを上書き保存します。
            *   `__doc__` フォルダ内に `change_log_yyyymmddhhmiss.log` を作成し、変更内容を記録します。
        7.  差異がない場合:
            *   「変更なし」とログに出力します。

3.  **クリーンアップ**:
    *   作成した一時スクリプトを削除します。

## スクリプトの例 (sync-blob.mjs)

```javascript
import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// .env.local から環境変数を読み込む簡易実装
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const loadEnv = (key) => {
    const regex = new RegExp(`${key}=["']?([^"'\n]+)["']?`);
    const match = envContent.match(regex);
    if (match) {
      process.env[key] = match[1].trim();
    }
  };
  loadEnv('BLOB_READ_WRITE_TOKEN');
  loadEnv('BLOB_URL_IMPORTANT');
  loadEnv('BLOB_URL_MEDIUM');
  loadEnv('BLOB_URL_HIGH');
}

const DOC_DIR = path.resolve(process.cwd(), '__doc__');
const TARGET_FILES = [
  { name: 'word.txt', env: 'BLOB_URL_IMPORTANT', key: 'words-file/word.txt' },
  { name: 'word_mid.txt', env: 'BLOB_URL_MEDIUM', key: 'words-file/word_mid.txt' },
  { name: 'word_high.txt', env: 'BLOB_URL_HIGH', key: 'words-file/word_high.txt' }
];
const PREFIX = 'words-file/';

async function main() {
  try {
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(DOC_DIR)) {
      fs.mkdirSync(DOC_DIR, { recursive: true });
    }

    let downloadTargets = [];
    const importantUrl = process.env.BLOB_URL_IMPORTANT;
    const mediumUrl = process.env.BLOB_URL_MEDIUM;
    const highUrl = process.env.BLOB_URL_HIGH;

    // Check if direct URLs are available (all or nothing logic similar to src/data/words.ts)
    if (importantUrl && mediumUrl && highUrl) {
      console.log('Using direct Blob URLs from environment variables...');
      downloadTargets = TARGET_FILES.map(f => ({
        name: f.name,
        url: process.env[f.env]
      }));
    } else {
      // Fallback to list()
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('Error: BLOB_READ_WRITE_TOKEN not found (and direct URLs are missing)');
        process.exit(1);
      }

      console.log('Fetching blob list...');
      // prefixでフィルタリングしてリスト取得
      const { blobs } = await list({ prefix: PREFIX, limit: 100, token: process.env.BLOB_READ_WRITE_TOKEN });
      
      downloadTargets = TARGET_FILES.map(f => {
        const blob = blobs.find(b => b.pathname === f.key);
        if (!blob) {
            console.warn(`Warning: Blob not found for ${f.key}`);
            return null;
        }
        return {
            name: f.name,
            url: blob.url
        };
      }).filter(Boolean);
    }

    let hasChanges = false;
    let logContent = `Update Log: ${new Date().toISOString()}\n\n`;

    for (const target of downloadTargets) {
      console.log(`Downloading ${target.name} from ${target.url}...`);
      const response = await fetch(target.url);
      if (!response.ok) {
        console.error(`Failed to download ${target.name}: ${response.statusText}`);
        continue;
      }
      const newContent = await response.text();
      
      const localFilePath = path.join(DOC_DIR, target.name);
      let oldContent = '';
      if (fs.existsSync(localFilePath)) {
        oldContent = fs.readFileSync(localFilePath, 'utf-8');
      }

      if (newContent !== oldContent) {
        console.log(`Updating ${target.name}...`);
        fs.writeFileSync(localFilePath, newContent, 'utf-8');
        hasChanges = true;
        logContent += `Updated: ${target.name}\n`;
        logContent += `Blob URL: ${target.url}\n`;
        logContent += `Size: ${newContent.length} bytes\n\n`;
      } else {
        console.log(`No changes for ${target.name}`);
      }
    }

    if (hasChanges) {
      // yyyymmddhhmiss 形式のタイムスタンプ
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
        
      const logFileName = `change_log_${timestamp}.log`;
      fs.writeFileSync(path.join(DOC_DIR, logFileName), logContent, 'utf-8');
      console.log(`Changes logged to ${logFileName}`);
    } else {
      console.log('All files are up to date.');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```
