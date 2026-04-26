export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "wordLinks"; intro?: string; words: string[] };

export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  estimatedReadingMin: number;
  blocks: ArticleBlock[];
  relatedSlugs?: string[];
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "toeic-vocab-by-score",
    title: "TOEIC スコア別 必要語彙数と学習戦略｜600・730・860 点突破",
    description:
      "TOEIC のスコア帯ごとに必要となる語彙数と、優先して覚えるべき単語の傾向、効率的な学習順序をまとめました。600 点・730 点・860 点それぞれの戦略を解説します。",
    category: "学習戦略",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "TOEIC は全 200 問・約 7,400 語の英文を 2 時間で処理する試験で、語彙力がスコアに直結します。本記事では、目標スコアごとに必要となる語彙数の目安と、どの分野の単語から優先して覚えるべきかを整理します。",
      },
      { type: "h2", text: "スコア帯ごとの必要語彙数（目安）" },
      {
        type: "table",
        headers: ["目標スコア", "必要語彙数", "対応レベル", "学習期間の目安"],
        rows: [
          ["470 点", "約 3,000 語", "中学卒業〜高校基礎", "3〜6 ヶ月"],
          ["600 点", "約 4,000〜5,000 語", "高校標準＋ビジネス入門", "6〜9 ヶ月"],
          ["730 点", "約 6,000〜7,000 語", "高校上位＋ビジネス頻出", "9〜12 ヶ月"],
          ["860 点", "約 8,000〜10,000 語", "派生・専門・抽象語彙", "1〜2 年"],
          ["900 点超", "10,000 語以上", "ニュアンス・コロケーション", "2 年以上"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "上記はあくまで目安です。同じ語彙数でも「読んで意味がわかる（受信語彙）」と「使いこなせる（発信語彙）」では難度が異なり、TOEIC で必要なのは前者中心の語彙力です。",
      },
      { type: "h2", text: "600 点突破：基礎語彙＋ビジネス入門語" },
      {
        type: "p",
        text: "600 点を目指す段階では、TOEIC 全 7 パートで共通して登場する「ビジネス基本動詞」と「日常頻出名詞」を最優先で固めるのが近道です。Part 1（写真描写）の動作動詞、Part 2（応答問題）の疑問詞表現、Part 5 の品詞識別に必要な基本語が中心になります。",
      },
      {
        type: "wordLinks",
        intro: "600 点帯で押さえたい代表的な単語例：",
        words: [
          "schedule",
          "deliver",
          "submit",
          "confirm",
          "notify",
          "available",
          "additional",
          "approximately",
        ],
      },
      { type: "h2", text: "730 点突破：派生語と Part 5・Part 7 対策" },
      {
        type: "p",
        text: "730 点突破の壁は、「知っている単語の派生形を瞬時に判別できるか」と「Part 7（長文読解）で語彙が原因で詰まらないか」の 2 点に集約されます。Part 5 の品詞問題（短文穴埋め）では、同じ語幹から派生する 4 品詞（動詞・名詞・形容詞・副詞）を整理して覚えることが必須です。",
      },
      {
        type: "ul",
        items: [
          "派生語の整理：例 — analyze（動）／ analysis（名）／ analytical（形）／ analytically（副）",
          "コロケーション意識：例 — make a decision、reach an agreement、submit a proposal",
          "Part 7 用の抽象名詞：implementation、initiative、procedure、provision など",
        ],
      },
      { type: "h2", text: "860 点突破：低頻出だが差がつく語彙" },
      {
        type: "p",
        text: "860 点以上では、出題頻度はそれほど高くないものの、知らないと文意を見失う「ビジネス専門語」と「抽象語彙」の習熟が決定打になります。具体的には、契約・人事・経理・物流・マーケティングの専門用語、および新聞英語に近い抽象動詞（facilitate、leverage、streamline 等）が中心です。",
      },
      {
        type: "wordLinks",
        intro: "860 点帯で差がつく単語例：",
        words: [
          "consolidate",
          "facilitate",
          "comprehensive",
          "simultaneously",
          "preliminary",
          "subsequent",
          "implement",
          "endorse",
        ],
      },
      { type: "h2", text: "効率的な学習順序" },
      {
        type: "ol",
        items: [
          "公式問題集または模試を 1 回解き、現在のスコアと未知語の傾向を把握する",
          "未知語を「全パート共通の基礎語」「Part 別頻出語」「専門語」に分類する",
          "基礎語から順に、当サイトの「学習モード」でランダム出題により暗記を進める",
          "覚えた単語は「お気に入り」に登録し、忘却曲線に沿って数日後・1 週間後に復習する",
          "1 ヶ月ごとに模試を再受験して、語彙の伸びをスコアで確認する",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "当サイトの単語は important（基礎）／ mid（中級）／ high（上級）の 3 段階に分類されています。スコア 600 までは important、730 までは mid、860 以上は high を中心に学習するのが目安です。",
      },
      { type: "h2", text: "まとめ" },
      {
        type: "p",
        text: "TOEIC のスコアアップに必要なのは、語彙数の絶対量より「自分の目標スコア帯に最適化された語彙」を優先的に覚えることです。基礎語を確実に固め、派生形まで含めて運用できる状態にしてから、上位語彙に進むという順序を守れば、最短ルートでスコアを伸ばすことができます。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "word-rank-criteria"],
  },
  {
    slug: "part5-frequent-words",
    title: "TOEIC Part 5 頻出語彙と語形変化問題の攻略法",
    description:
      "TOEIC Part 5（短文穴埋め問題）で頻出する語彙の傾向と、品詞問題・語彙問題の解き方を体系的にまとめました。派生語の覚え方や時短テクニックも紹介します。",
    category: "Part 別対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 5 は 30 問を約 10 分で解くことが推奨される、リーディングセクションの「時短ゾーン」です。出題は大きく「品詞問題」「語彙問題」「文法問題」の 3 タイプに分かれ、語彙力と品詞識別力が解答速度を決めます。",
      },
      { type: "h2", text: "Part 5 の出題タイプと配分" },
      {
        type: "table",
        headers: ["タイプ", "配分の目安", "判断基準"],
        rows: [
          ["品詞問題", "約 8〜12 問", "選択肢が同じ語幹の異なる品詞"],
          ["語彙問題", "約 10〜15 問", "選択肢が意味の異なる同品詞"],
          ["文法問題", "約 5〜10 問", "時制・代名詞・関係詞・接続詞など"],
        ],
      },
      { type: "h2", text: "品詞問題の解き方：5 秒で空所の品詞を特定する" },
      {
        type: "p",
        text: "品詞問題は、空所の前後の構造から必要な品詞を特定すれば、選択肢の意味を知らなくても解けます。判断のポイントは以下の 4 つです。",
      },
      {
        type: "ul",
        items: [
          "空所の直後が名詞 → 形容詞 or 名詞（複合名詞）",
          "空所の直後が動詞 → 副詞",
          "be 動詞・冠詞の直後 → 名詞 or 形容詞",
          "完全な文の前後 → 副詞（修飾要素）",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "「-tion / -ment / -ity」で終わる選択肢は名詞、「-ly」は副詞、「-ive / -ous / -al」は形容詞、と語尾でアタリをつける癖をつけると解答速度が上がります。",
      },
      { type: "h2", text: "語彙問題の頻出テーマ" },
      {
        type: "p",
        text: "語彙問題で問われるのは、ビジネスシーンで意味の取り違えが起こりやすい単語です。特に以下の 4 領域は出題率が高く、優先的に押さえるべきです。",
      },
      {
        type: "ol",
        items: [
          "コロケーション（make a reservation、place an order、reach a consensus 等）",
          "類義語の使い分け（accept / approve / endorse、postpone / delay / suspend 等）",
          "ビジネス動詞の目的語パターン（implement a policy、submit a proposal 等）",
          "前置詞を伴う表現（comply with、result in、refrain from 等）",
        ],
      },
      { type: "h2", text: "派生語の効率的な覚え方" },
      {
        type: "p",
        text: "1 つの語幹を「動詞・名詞・形容詞・副詞」の 4 品詞セットで覚える「派生語マッピング」は、Part 5 品詞問題の正答率を最も効率的に上げる学習法です。",
      },
      {
        type: "table",
        headers: ["動詞", "名詞", "形容詞", "副詞"],
        rows: [
          ["analyze", "analysis / analyst", "analytical", "analytically"],
          ["compete", "competition / competitor", "competitive", "competitively"],
          ["produce", "product / production", "productive", "productively"],
          ["succeed", "success / succession", "successful", "successfully"],
          ["consider", "consideration", "considerable", "considerably"],
        ],
      },
      { type: "h2", text: "Part 5 頻出単語の例" },
      {
        type: "wordLinks",
        intro: "Part 5 で頻出する単語の一例（クリックで詳細解説と例文）：",
        words: [
          "submit",
          "approve",
          "implement",
          "comply",
          "schedule",
          "establish",
          "announce",
          "complete",
        ],
      },
      { type: "h2", text: "解答時間の目安と時短戦略" },
      {
        type: "ol",
        items: [
          "1 問あたり 20 秒、30 問で 10 分以内が目標",
          "選択肢を見て品詞問題と判断したら、文の意味は読まず構造のみで判断",
          "語彙問題で 30 秒以上悩んだら印をつけて次へ進む",
          "Part 6・7 に時間を残すことを最優先",
        ],
      },
      {
        type: "p",
        text: "Part 5 は知識量がスコアに直結する分、対策の費用対効果が最も高いパートです。語彙と派生語をセットで固め、空所の前後構造から品詞を瞬時に判別できる状態にすることで、リーディングセクション全体の得点が安定します。",
      },
    ],
    relatedSlugs: ["toeic-vocab-by-score", "business-vocab-essentials"],
  },
  {
    slug: "forgetting-curve",
    title: "忘却曲線を活用した TOEIC 単語の効率的な暗記法",
    description:
      "エビングハウスの忘却曲線に基づく復習タイミングと、間隔反復学習（SRS）を TOEIC 単語暗記に応用する方法を解説します。当サイトの「お気に入り」「復習モード」を使った実践フローも紹介します。",
    category: "学習法",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "「単語帳を一周したのに、ほとんど忘れている」——これは記憶の仕組みから見れば自然な現象です。本記事では、19 世紀末にエビングハウスが提唱した忘却曲線を踏まえ、TOEIC 単語学習における最適な復習タイミングと、その実践方法を解説します。",
      },
      { type: "h2", text: "エビングハウスの忘却曲線とは" },
      {
        type: "p",
        text: "エビングハウスの実験によれば、人間は新しく覚えた情報を 20 分後に 42%、1 時間後に 56%、1 日後には 74% 忘れるとされます。ただし重要なのは、復習を行うとその都度「再記憶までの時間」と「次に忘れるまでの時間」が伸びる、という点です。",
      },
      {
        type: "table",
        headers: ["経過時間", "未復習の場合の忘却率", "復習後の節約率"],
        rows: [
          ["20 分後", "約 42% 忘却", "—"],
          ["1 時間後", "約 56% 忘却", "—"],
          ["1 日後", "約 74% 忘却", "1 回目復習で大幅減"],
          ["1 週間後", "約 77% 忘却", "2 回目復習で再延長"],
          ["1 ヶ月後", "約 79% 忘却", "3 回目復習でほぼ定着"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "ポイントは「忘れる前ではなく、忘れかけた瞬間に復習する」ことで記憶が最も強化される点です。完全に忘れてからの再学習は、初回学習とほぼ同じコストがかかります。",
      },
      { type: "h2", text: "間隔反復学習（SRS）の基本タイミング" },
      {
        type: "p",
        text: "忘却曲線をベースに体系化された学習法が、間隔反復学習（Spaced Repetition System、SRS）です。新出単語を以下の間隔で復習することで、長期記憶への定着率が大きく向上します。",
      },
      {
        type: "ol",
        items: [
          "覚えた当日の夜（5〜10 時間後）",
          "翌日（24 時間後）",
          "3 日後",
          "1 週間後",
          "2 週間後",
          "1 ヶ月後",
        ],
      },
      { type: "h2", text: "TOEIC 単語学習への応用：1 日 30 分のサイクル例" },
      {
        type: "p",
        text: "1 日 30 分を語彙学習に割けるとして、SRS の考え方を取り入れた典型的なサイクルは以下の通りです。",
      },
      {
        type: "ul",
        items: [
          "10 分：当日の新出単語 10 語をインプット（意味・例文・音声をセットで）",
          "10 分：前日に覚えた単語の復習（学習モードでランダム出題）",
          "5 分：3 日前・1 週間前・2 週間前の単語をフラッシュチェック",
          "5 分：覚えにくい単語を「お気に入り」に追加し、後日重点復習",
        ],
      },
      { type: "h2", text: "当サイトの機能を使った実践フロー" },
      {
        type: "ol",
        items: [
          "「今日のおすすめ 5 単語」で毎日 5 語をインプット（同じ日には同じ 5 語が表示される）",
          "詰まった単語は「お気に入り」に追加（ローカル保存）",
          "「学習モード」でランダム出題し、覚えていない単語にチェック",
          "「復習モード」でお気に入り単語のみを集中学習",
          "1 週間後に同じ単語を再度「学習モード」で確認し、定着度をチェック",
        ],
      },
      { type: "h2", text: "覚えにくい単語の例" },
      {
        type: "wordLinks",
        intro: "発音と意味のギャップが大きく、定着しにくい代表例：",
        words: [
          "thorough",
          "subsequent",
          "preliminary",
          "consequence",
          "reluctant",
          "facilitate",
        ],
      },
      { type: "h2", text: "やってはいけない学習法" },
      {
        type: "ul",
        items: [
          "1 日に 100 語以上を新規インプットする（翌日に 70 語以上忘れて非効率）",
          "1 ヶ月以上間を空けて単語帳を再開する（再学習コストが初回と同等になる）",
          "意味の暗記だけで例文・音声を確認しない（Part 1・2 で音声から意味を引けない）",
          "ノートに書き写すだけで、出題形式での想起練習をしない（再認はできても再生ができない状態）",
        ],
      },
      {
        type: "p",
        text: "忘却は欠陥ではなく、脳が情報の優先順位をつける自然な仕組みです。重要なのは「忘れる前提で、忘れかけた瞬間に復習を入れる」設計を、日々の学習サイクルに組み込むことです。",
      },
    ],
    relatedSlugs: ["toeic-vocab-by-score", "word-rank-criteria"],
  },
  {
    slug: "business-vocab-essentials",
    title: "TOEIC ビジネス英語頻出語彙｜契約・会議・メール表現",
    description:
      "TOEIC で頻出するビジネスシーン別の必須語彙を、契約・会議・メール・経理の 4 領域に分けて整理しました。Part 7 長文読解で文意を取り違えないための実用語彙集です。",
    category: "語彙集",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "TOEIC の Part 7（長文読解）で出題される文章の多くは、メール・社内通知・契約書・プレスリリースといった実務文書を模した形式です。本記事では、TOEIC のビジネス文脈で特に頻出する語彙を 4 つの領域に分けて整理します。",
      },
      { type: "h2", text: "1. 契約・取引に関する語彙" },
      {
        type: "p",
        text: "契約書や取引メールでは、「条件」「納期」「責任範囲」を示す定型語彙が繰り返し登場します。意味を取り違えると Part 7 の問題で全滅するため、必ず正確に押さえましょう。",
      },
      {
        type: "table",
        headers: ["単語", "意味", "典型的な使い方"],
        rows: [
          ["agreement", "合意・契約", "reach an agreement（合意に至る）"],
          ["contract", "契約（書）", "sign a contract"],
          ["terms", "条件", "terms and conditions"],
          ["procurement", "調達", "procurement department"],
          ["vendor", "業者・販売者", "selected vendor"],
          ["invoice", "請求書", "issue an invoice"],
          ["deadline", "締切", "meet the deadline"],
          ["amend", "修正する", "amend the contract"],
        ],
      },
      {
        type: "wordLinks",
        intro: "詳細解説と例文：",
        words: ["agreement", "contract", "vendor", "invoice", "amend"],
      },
      { type: "h2", text: "2. 会議に関する語彙" },
      {
        type: "p",
        text: "Part 3（会話問題）と Part 4（説明文問題）の頻出シーンが社内会議です。「議題」「議事録」「予定変更」「司会」といった会議運営語彙を確実に押さえることで、リスニング正答率が安定します。",
      },
      {
        type: "table",
        headers: ["単語", "意味", "典型的な使い方"],
        rows: [
          ["agenda", "議題（一覧）", "today's agenda"],
          ["minutes", "議事録", "take the minutes"],
          ["postpone", "延期する", "postpone the meeting"],
          ["reschedule", "予定変更する", "reschedule for next week"],
          ["adjourn", "（会議を）閉会する", "adjourn the meeting"],
          ["chair", "議長を務める", "chair the meeting"],
          ["attendee", "参加者", "list of attendees"],
          ["consensus", "総意", "reach a consensus"],
        ],
      },
      {
        type: "wordLinks",
        words: ["agenda", "postpone", "reschedule", "consensus"],
      },
      { type: "h2", text: "3. メール・社内通知に関する語彙" },
      {
        type: "p",
        text: "Part 7 の単一・複数文書問題で最頻出なのがビジネスメール形式です。書き出し・本文・結びの定型表現を覚えておくと、文書全体の流れが瞬時に掴めるようになります。",
      },
      {
        type: "table",
        headers: ["単語", "意味", "典型的な使い方"],
        rows: [
          ["regarding", "〜に関して", "regarding your inquiry"],
          ["enclosed", "同封の", "please find enclosed"],
          ["attached", "添付の", "see the attached file"],
          ["forward", "転送する", "forward this email to ..."],
          ["acknowledge", "受領を知らせる", "acknowledge receipt"],
          ["confirm", "確認する", "confirm your reservation"],
          ["notify", "通知する", "notify you of the change"],
          ["sincerely", "敬具", "sincerely yours"],
        ],
      },
      {
        type: "wordLinks",
        words: ["regarding", "enclosed", "forward", "acknowledge", "notify"],
      },
      { type: "h2", text: "4. 経理・財務に関する語彙" },
      {
        type: "p",
        text: "決算報告・売上資料を扱うパッセージで頻出するのが経理関連語彙です。数値の増減を示す動詞と、収支に関する名詞をセットで押さえましょう。",
      },
      {
        type: "table",
        headers: ["単語", "意味", "典型的な使い方"],
        rows: [
          ["revenue", "収益", "annual revenue"],
          ["expenditure", "支出", "operating expenditure"],
          ["budget", "予算", "stay within budget"],
          ["profit", "利益", "net profit"],
          ["forecast", "予測（する）", "sales forecast"],
          ["increase", "増加（する）", "increase by 10%"],
          ["decline", "減少（する）", "sales decline"],
          ["fiscal", "会計の", "fiscal year"],
        ],
      },
      {
        type: "wordLinks",
        words: ["revenue", "expenditure", "budget", "forecast", "fiscal"],
      },
      { type: "h2", text: "学習のコツ：シーンと一緒に覚える" },
      {
        type: "callout",
        tone: "tip",
        text: "ビジネス語彙は単語単体で覚えるより、「会議で使う」「メールで使う」といったシーン情報とセットで覚えた方が、リスニングで即座に文脈を予測できるようになります。",
      },
      {
        type: "p",
        text: "本記事で挙げた約 30 語は、TOEIC のリスニング・リーディング両方で頻出する「文意決定語」です。各単語の詳細ページから例文・発音音声を確認し、シーンとセットで定着させてください。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "toeic-vocab-by-score"],
  },
  {
    slug: "word-rank-criteria",
    title: "当サイトの単語選定基準と推奨学習フロー",
    description:
      "TOEIC 重要単語アプリで採用している「important / mid / high」の 3 段階ランクの選定基準、データソース、AI 解説の生成・検証フロー、初心者から上級者まで対応した推奨学習ルートを解説します。",
    category: "サイト紹介",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 5,
    blocks: [
      {
        type: "p",
        text: "当サイト「TOEIC 重要単語」では、収録単語を学習者の目標スコアに応じて 3 段階のランクに分類しています。本記事では、その分類基準と、各ランクをどう活用すれば効率的に学習を進められるかを説明します。",
      },
      { type: "h2", text: "3 段階ランクの定義" },
      {
        type: "table",
        headers: ["ランク", "対象スコア帯", "単語の特徴", "収録語数の目安"],
        rows: [
          [
            "important（基礎）",
            "470〜600 点",
            "全 7 パート共通の高頻出語・基本動詞・名詞",
            "約 370 語",
          ],
          [
            "mid（中級）",
            "600〜730 点",
            "ビジネス頻出語・派生形・コロケーション要注意語",
            "約 780 語",
          ],
          [
            "high（上級）",
            "730 点以上",
            "専門ビジネス語・抽象語彙・低頻度だが差がつく語",
            "約 160 語",
          ],
        ],
      },
      { type: "h2", text: "選定の根拠" },
      {
        type: "p",
        text: "単語の選定には、以下の複数ソースを組み合わせ、TOEIC 公式問題集および市販頻出語彙集の出題傾向を参照しています。",
      },
      {
        type: "ul",
        items: [
          "TOEIC 公式問題集（複数年版）に出現する語彙の頻度集計",
          "市販の TOEIC 頻出語彙集における必出ランク",
          "コーパス分析（COCA・BNC）における学術・ビジネス語彙の頻度",
          "過去の受験者がつまずきやすいと報告した単語のリスト",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "重複や誤分類が見つかった場合は、随時メンテナンスを行っています。最新の更新内容は README および技術ドキュメントの「更新履歴」で確認できます。",
      },
      { type: "h2", text: "AI 解説の生成と検証" },
      {
        type: "p",
        text: "各単語の詳細ページに表示される意味・ニュアンス・例文は、Google Gemini モデル（gemini-2.5-flash-lite）により生成され、Vercel Blob と Upstash Redis の多段キャッシュで配信しています。生成内容は以下のフローで品質を担保しています。",
      },
      {
        type: "ol",
        items: [
          "TOEIC のビジネス文脈に限定したプロンプト設計（一般会話例文を排除）",
          "出力後の自動検証（必須フィールド・例文数・形式の整合性チェック）",
          "閲覧時にエラー検知された場合は即時再生成（ユーザーには気づかれない形）",
          "報告フォーム経由で誤りを受けた場合、個別にキャッシュをクリアして再生成",
        ],
      },
      { type: "h2", text: "推奨学習フロー（レベル別）" },
      { type: "h3", text: "初心者（〜600 点目標）" },
      {
        type: "ol",
        items: [
          "important ランクの単語を、a〜z 順で 1 日 10 語ずつ学習",
          "詳細ページで意味・発音・例文 1 つを確認",
          "覚えにくい単語はお気に入りに追加",
          "1 週間ごとに学習モードでランダム出題し、定着度を確認",
        ],
      },
      { type: "h3", text: "中級者（600〜730 点目標）" },
      {
        type: "ol",
        items: [
          "important ランクの完了を確認後、mid ランクへ進む",
          "毎日「今日のおすすめ 5 単語」で新規語彙をインプット",
          "詳細ページで例文 3〜5 個を音声付きで確認",
          "復習モードでお気に入り単語のみを集中復習",
        ],
      },
      { type: "h3", text: "上級者（730 点以上）" },
      {
        type: "ol",
        items: [
          "high ランクを優先し、低頻度だが意味の取り違えが起きやすい語を重点学習",
          "聞き流しモード（/today-words/listen）で耳からのインプットを強化",
          "ニュアンスや類義語の使い分けを詳細ページで確認",
          "Part 7 模試で未知語が出た際は、ランダム検索（/words）から該当語を引き、その場で詳細を確認",
        ],
      },
      { type: "h2", text: "更新方針" },
      {
        type: "ul",
        items: [
          "新しい TOEIC 出題傾向に応じて、収録単語の追加・削除を随時実施",
          "AI 解説のプロンプトは、ユーザーからの指摘を受けて継続的に改善",
          "重複・誤分類は発見次第修正し、修正履歴を技術ドキュメントに記録",
          "サイト機能や技術スタックの変更も、すべて更新履歴に記載",
        ],
      },
      {
        type: "p",
        text: "当サイトは個人開発・無料運営ですが、収録単語の妥当性と AI 解説の品質には継続的に手を入れています。気になる点があれば、お問い合わせページ経由でご連絡ください。",
      },
    ],
    relatedSlugs: ["toeic-vocab-by-score", "forgetting-curve"],
  },
];

export function getGuideArticleBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDE_ARTICLES.map((a) => a.slug);
}
