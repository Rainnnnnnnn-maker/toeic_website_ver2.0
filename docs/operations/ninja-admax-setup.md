# 忍者AdMax 導入手順

忍者AdMax（https://admax.shinobi.jp/）を本サイトに導入するための手順書。

- **最終更新日**: 2026-06-12
- **対象プロジェクト**: toeic_website_ver2.0（Next.js 16 App Router / React 19 / Vercel）

---

## 1. 忍者AdMaxとは

忍者ツールズが提供するクリック/インプレッション報酬型の広告配信サービス。

| 項目 | 内容 |
|---|---|
| 審査 | **サイト審査なし**（登録後すぐ広告配信可能、最短5分） |
| 配信方式 | 30社以上の広告会社とリアルタイムオークションで単価を最大化 |
| 対応デバイス | PC / スマートフォン両対応 |
| 報酬 | 1ポイント = 1円 |
| 換金 | 銀行振込・PeX等。最低支払額が低く（数百円程度）少額でも出金しやすい |
| Google AdSenseとの比較 | 審査不要で導入が容易な分、単価は低め。AdSense審査前のつなぎや併用に向く |

---

## 2. アカウント登録

1. https://admax.shinobi.jp/ にアクセスし「無料登録」をクリック
2. 以下のいずれかの方法で登録する
   - メールアドレス（パスワード・生年月日・性別・画像認証を入力）
   - 外部アカウント連携: Google / Twitter / Yahoo! / 忍者ツールズアカウント
3. 確認メールのリンクをクリックして登録完了
4. ログインして管理画面（パブリッシャー管理画面）に入る

> 💡 報酬受け取り用の銀行口座（または PeX 口座）情報は登録時には不要。換金申請時までに「会員情報」から登録すればよい。

---

## 3. 広告枠の作成

管理画面の「新しい広告枠を追加する」から作成する。

1. **サイト情報を入力**
   - サイト名: 例「TOEIC英単語学習サイト」
   - サイトURL: 本番ドメイン（例: `https://<本番ドメイン>`）
   - カテゴリ: 「学習・教育」系を選択
2. **デバイスを選択**: PC用 / スマートフォン用は**別々の広告枠**として作成する
3. **広告サイズを選択**（推奨サイズ）

   | 用途 | サイズ |
   |---|---|
   | 記事内・コンテンツ下（PC） | 300×250（レクタングル）※最も案件が多い |
   | ヘッダー・フッター（PC） | 728×90（ビッグバナー） |
   | サイドバー（PC） | 160×600（ワイドスカイスクレイパー） |
   | スマホ用 | 320×50 / 300×250 |

4. **オーバーレイ広告**: UX を損なうため「**表示しない**」を推奨
5. 作成すると**広告タグ（JavaScriptコード）が即時発行**される

> 💡 設置場所ごとに広告枠を分けて作ると、管理画面で枠別の収益レポートを確認できる。

---

## 4. 本プロジェクト（Next.js App Router）への設置

発行されるタグは `<script>` を直接埋め込む形式のため、App Router では**クライアントコンポーネント**として実装する。

### 4-1. 広告コンポーネントの作成

`src/components/NinjaAdMax.tsx` を新規作成する:

```tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** 忍者AdMax管理画面で発行された広告枠ID */
  admaxId: string;
  /** 広告サイズ（レイアウトシフト防止用） */
  width: number;
  height: number;
};

export default function NinjaAdMax({ admaxId, width, height }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    // 忍者AdMaxの非同期タグを動的に挿入する
    const div = document.createElement("div");
    div.className = "admax-switch";
    div.dataset.admaxId = admaxId;
    div.style.display = "inline-block";
    containerRef.current.appendChild(div);

    (window as any).admaxads = (window as any).admaxads || [];
    (window as any).admaxads.push({ admax_id: admaxId, type: "switch" });

    const script = document.createElement("script");
    script.src = "https://adm.shinobi.jp/st/t.js";
    script.async = true;
    containerRef.current.appendChild(script);
  }, [admaxId]);

  return (
    <div
      ref={containerRef}
      style={{ minWidth: width, minHeight: height }}
      className="flex justify-center"
    />
  );
}
```

> ⚠️ 上記は「スイッチ広告（PC/スマホ自動切替）」タグの例。実際に管理画面で発行されたタグの形式（`admax_id` の値、`t.js` の URL）を必ず確認し、それに合わせること。

### 4-2. ページへの配置

広告を表示したいサーバーコンポーネントから呼び出す:

```tsx
import NinjaAdMax from "@/components/NinjaAdMax";

// 例: 単語詳細ページのコンテンツ下
<NinjaAdMax admaxId="発行されたID" width={300} height={250} />
```

配置候補:

- `src/app/words/[word]/page.tsx` — 単語詳細の本文下（PVが最も多い想定）
- `src/app/words/page.tsx` — 単語一覧の下部
- トップページのコンテンツ下

### 4-3. 本プロジェクト固有の注意点

| 項目 | 注意点 |
|---|---|
| **Server/Client境界** | 広告タグは必ず `"use client"` コンポーネント内で扱う。`server-only` モジュールには入れない |
| **広告枠IDの管理** | 秘密情報ではないのでハードコード可。環境変数にする場合は `NEXT_PUBLIC_ADMAX_ID_*` 形式にする（クライアントで使うため） |
| **SPA遷移** | App Router のクライアント遷移では広告スクリプトが再実行されない場合がある。表示されない場合は `usePathname()` を key にしてコンポーネントを再マウントさせる |
| **CLS対策** | `minWidth` / `minHeight` で広告サイズ分の領域を予約し、レイアウトシフトを防ぐ |
| **React Compiler** | 自動メモ化が有効だが、`useEffect` + `ref` のパターンには影響しない |
| **CSP** | もし将来 Content-Security-Policy を設定する場合、`adm.shinobi.jp` 等のドメイン許可が必要 |

### 4-4. 動作確認

1. `npm run dev` で起動し、設置ページで広告（またはダミー枠）が表示されることを確認
2. ブラウザのコンソールにエラーが出ていないことを確認
3. **広告ブロッカーを無効にして確認する**（uBlock等が有効だと表示されない）
4. `npm run lint` / `npm run test` / `npm run build` が通ることを確認
5. Vercel の Preview デプロイで本番相当の表示を確認

> ⚠️ 自分で広告を意図的に何度もクリックしない（不正クリック扱いで凍結リスクあり）。

---

## 5. ads.txt の設置（推奨）

なりすまし（広告枠の不正転売）防止のため、忍者AdMaxは IAB Tech Lab 標準の **ads.txt の設置を推奨**している。未設置でも広告は配信されるが、ads.txt 必須の案件が配信対象から外れ収益が下がる可能性があるため、設置しておくこと。

1. 忍者AdMax管理画面の「広告枠一覧」→「**ads.txtを取得**」をクリック
2. 表示されたテキストを**そのままコピー**する（内容を自作・改変しない）
3. 本プロジェクトでは `public/ads.txt` として保存する
   - Next.js では `public/` 直下のファイルがルートで配信されるため、`https://<ドメイン>/ads.txt` でアクセスできれば設置完了
4. デプロイ後、ブラウザで `https://<ドメイン>/ads.txt` を開いて内容が表示されることを確認

> ⚠️ ads.txt はドメインルートに**1ファイルのみ**。将来 Google AdSense 等を併用する場合は、各サービスのエントリを**1つの `public/ads.txt` に統合**して記載すること（上書きすると既存サービスの配信に影響する）。

---

## 6. 報酬の確認と換金

1. 管理画面トップで日別・広告枠別の収益（ポイント）を確認できる
2. 1ポイント = 1円。報酬が最低支払額に達したら「換金申請」が可能
3. 換金前に「会員情報」で振込先（銀行口座 / PeX）を登録しておく
4. 申請後、所定のスケジュールで振り込まれる（手数料・締め日は管理画面の最新情報を確認）

---

## 7. 運用上の注意

- **禁止事項**: 不正クリックの誘導、「広告をクリックしてください」等の文言、コンテンツと広告の誤認を招く配置
- **広告の品質**: 全年齢向け設定にしておくこと（成人向け広告の配信設定をオンにしない）
- **パフォーマンス**: 広告タグはサードパーティスクリプトのため LCP/CLS に影響しうる。設置数は1ページ2〜3枠程度に抑える
- **ドキュメント更新**: 広告コンポーネントを実装したら、リポジトリのルールに従い `README.md` と `docs/architecture.md` を同一コミット/PRで更新すること

---

## 参考リンク

- [忍者AdMax 公式](https://admax.shinobi.jp/)
- [【図解】忍者AdMaxの登録方法と使い方（プロナビ）](https://sigezo.xsrv.jp/ninja-admax-set-up)
- [忍者AdMax 解説（so-zou.jp）](https://so-zou.jp/web-app/tech/advertising/publisher/ninja-admax/)
- [忍者AdMax完全ガイド（ブログろう）](https://blogrou.com/ninja-admax/)
