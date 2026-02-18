---
name: "deduplicate-high-mid-words"
description: "word_high.txt (or word.txt) と word_mid.txt の重複をチェックし、word_high.txt から重複を削除します。重複排除が必要な場合に呼び出します。"
---

# Deduplicate High/Mid Words

このスキルは、重要単語リスト (`word_high.txt` または `word.txt`) と中級単語リスト (`word_mid.txt`) 間の重複を検出し、重要単語リストから重複単語を削除します。これにより、学習コンテンツの重複を防ぎます。

## 実行手順

1.  **対象ファイルの確認**:
    *   プロジェクト内の `word_high.txt` (または `word.txt`) と `word_mid.txt` を探します。
    *   通常は `__doc__` または `src/data` ディレクトリにあります。

2.  **スクリプトの作成と実行**:
    *   プロジェクトルートに一時的な Node.js スクリプト（例: `deduplicate-words.mjs`）を作成します。
    *   スクリプト内で以下の処理を実装します:
        1.  対象ファイルを読み込みます。
        2.  `word_mid.txt` の単語を Set に格納します（大文字小文字を区別せず比較）。
        3.  `word_high.txt` の各行をチェックし、`word_mid.txt` に含まれる場合は削除リストに追加します。
        4.  重複が削除された新しい `word_high.txt` の内容を生成します。
        5.  元のファイルをバックアップ（例: `word_high.txt.bak`）し、新しい内容で上書きします。
        6.  削除された単語と件数をログに出力します。

3.  **クリーンアップ**:
    *   作成した一時スクリプトを削除します。

## スクリプトの例 (deduplicate-words.mjs)

```javascript
import fs from 'fs';
import path from 'path';

// 探索するファイル名の候補
const HIGH_FILENAMES = ['word_high.txt', 'word.txt'];
const MID_FILENAMES = ['word_mid.txt'];
// 探索するディレクトリの候補
const SEARCH_DIRS = ['.', '__doc__', 'src/data', '.doc'];

function findFile(filenames) {
  for (const dir of SEARCH_DIRS) {
    for (const filename of filenames) {
      const filePath = path.join(process.cwd(), dir, filename);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
  }
  return null;
}

async function main() {
  try {
    const highPath = findFile(HIGH_FILENAMES);
    const midPath = findFile(MID_FILENAMES);

    if (!highPath) {
      console.error('Error: High priority word file not found.');
      process.exit(1);
    }
    if (!midPath) {
      console.error('Error: Mid priority word file not found.');
      process.exit(1);
    }

    console.log(`Processing files:\n  High: ${highPath}\n  Mid:  ${midPath}`);

    const highContent = fs.readFileSync(highPath, 'utf-8');
    const midContent = fs.readFileSync(midPath, 'utf-8');

    const highLines = highContent.split(/\r?\n/);
    const midLines = midContent.split(/\r?\n/);

    // word_mid.txt の単語を正規化して Set に格納
    const midSet = new Set();
    midLines.forEach(line => {
      const word = line.trim().toLowerCase();
      if (word) midSet.add(word);
    });

    const newHighLines = [];
    const removedWords = [];

    highLines.forEach(line => {
      const word = line.trim();
      if (!word) {
        newHighLines.push(line); // 空行は維持
        return;
      }
      
      const normalizedWord = word.toLowerCase();
      if (midSet.has(normalizedWord)) {
        removedWords.push(word);
      } else {
        newHighLines.push(line);
      }
    });

    if (removedWords.length > 0) {
      console.log(`Found ${removedWords.length} duplicates.`);
      console.log('Removed words:', removedWords.join(', '));

      // バックアップ作成
      fs.copyFileSync(highPath, `${highPath}.bak`);
      console.log(`Backup created at ${highPath}.bak`);

      // ファイル書き込み
      fs.writeFileSync(highPath, newHighLines.join('\n'), 'utf-8');
      console.log(`Updated ${highPath} successfully.`);
    } else {
      console.log('No duplicates found.');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
```
