# GA4 Event Tracking Spec

## Why
GA4の導入が完了しましたが、デフォルトのページビュー計測だけではユーザーの詳細な行動（音声再生、お気に入り登録、SNSシェアなど）を把握できません。
これらのインタラクションをカスタムイベントとして計測することで、ユーザーエンゲージメントを分析し、コンテンツ改善に役立てます。

## What Changes
以下のユーザーアクションに対してGA4イベントを送信するように実装を変更します。

1.  **音声再生 (`audio_play`)**:
    *   単語の発音再生時
    *   例文の再生時
2.  **お気に入り操作 (`favorite_toggle`)**:
    *   お気に入り追加時
    *   お気に入り解除時
3.  **SNSシェア (`share`)**:
    *   Twitter (X) シェア時
    *   Facebook シェア時
    *   LINE シェア時

## Impact
- **Affected specs**: Analytics
- **Affected code**:
    - `src/hooks/useTTS.ts`
    - `src/context/FavoritesContext.tsx`
    - `src/components/features/sns/SnsShareButtons.tsx`

## ADDED Requirements
### Requirement: Audio Play Tracking
システムはユーザーが音声を再生した際に `audio_play` イベントを送信しなければならない。
- **Parameters**:
    - `type`: "word" (単語) または "sentence" (例文)
    - `word`: 再生された単語（または例文に関連する単語slug）

### Requirement: Favorite Tracking
システムはユーザーがお気に入りを操作した際に `favorite_toggle` イベントを送信しなければならない。
- **Parameters**:
    - `action`: "add" または "remove"
    - `word`: 対象の単語slug

### Requirement: Share Tracking
システムはユーザーがSNSシェアボタンをクリックした際に `share` イベントを送信しなければならない。
- **Parameters**:
    - `method`: "twitter", "facebook", "line"
    - `content_type`: "word" (単語ページ) または "website" (トップページなど)
    - `item_id`: シェアされたURLまたは単語slug

## MODIFIED Requirements
### Requirement: Existing Components
既存の `useTTS`, `FavoritesContext`, `SnsShareButtons` コンポーネントにイベント送信ロジックを追加する。
