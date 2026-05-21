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
  {
    slug: "exam-day-essentials",
    title: "TOEIC 試験当日の持ち物・流れ・時間配分まとめ",
    description:
      "TOEIC L&R 試験当日に必要な持ち物、午前／午後それぞれの当日スケジュール、Listening 45 分・Reading 75 分の時間配分の目安、会場での注意事項を整理しました。初受験の方も安心して臨めるよう網羅的に解説します。",
    category: "試験対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC L&R は、Listening 45 分・Reading 75 分・全 200 問という高密度な試験です。本番で実力を発揮するためには、当日の持ち物・流れ・時間配分を事前に頭に入れておくことが欠かせません。本記事では初受験の方にも分かるよう、試験当日の流れを時系列でまとめます。",
      },
      { type: "h2", text: "必須の持ち物" },
      {
        type: "ul",
        items: [
          "受験票（事前にプリントアウトまたは表示準備）",
          "本人確認書類（運転免許証・パスポート・学生証など写真付き身分証）",
          "HB または B の鉛筆（複数本、シャープペンシル不可）",
          "消しゴム（鉛筆の汚れがつきにくいもの）",
          "腕時計（アナログ推奨、スマートウォッチ・音の出るもの不可）",
          "マスク（会場ルールに準拠）",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "シャープペンシル、ボールペン、シャープペン型消しゴム、デジタル腕時計の一部、スマートウォッチは使用不可です。腕時計は会場の壁時計が見えない席に当たることもあるため、必ず持参してください。",
      },
      { type: "h2", text: "持っていくと安心なもの" },
      {
        type: "ul",
        items: [
          "鉛筆削り（小型）",
          "ハンカチ・ティッシュ",
          "上着（会場の冷房・暖房調整用）",
          "事前に見直したい単語リスト（試験開始までの復習用）",
          "飲み物・軽食（試験開始前まで／会場ルールに準拠）",
        ],
      },
      { type: "h2", text: "当日のスケジュール（午前受験の例）" },
      {
        type: "table",
        headers: ["時刻", "内容"],
        rows: [
          ["9:25 まで", "受付完了（遅刻すると入室不可）"],
          ["9:25〜9:55", "試験の説明、音テスト、解答用紙記入"],
          ["9:55〜10:00", "問題冊子配布、最終確認"],
          ["10:00〜10:45", "Listening セクション（45 分・100 問）"],
          ["10:45〜12:00", "Reading セクション（75 分・100 問）"],
          ["12:00〜12:15", "回収、退室"],
        ],
      },
      {
        type: "p",
        text: "午後受験の場合は、午後 2 時頃に開始するスケジュールが一般的です。いずれの時間帯も、開始 30 分前には会場入りすることをおすすめします。",
      },
      { type: "h2", text: "Reading セクションの時間配分の目安" },
      {
        type: "p",
        text: "Reading 75 分・100 問は、1 問あたり 45 秒の計算です。パートごとの所要時間目安は以下の通りです。これを意識して練習しないと、Part 7 で時間切れになる可能性があります。",
      },
      {
        type: "table",
        headers: ["パート", "問題数", "目安時間", "1 問あたり"],
        rows: [
          ["Part 5（短文穴埋め）", "30 問", "10 分", "20 秒"],
          ["Part 6（長文穴埋め）", "16 問", "10 分", "37 秒"],
          ["Part 7（読解）", "54 問", "55 分", "61 秒"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "Part 5 を 10 分で抜けるための鍵は語彙力です。当サイトの「学習モード」で頻出語を瞬時に判断できる状態にしておくと、Reading 全体の時間に余裕が生まれます。",
      },
      { type: "h2", text: "会場での注意事項" },
      {
        type: "ol",
        items: [
          "試験中、Listening と Reading の間に休憩はありません",
          "Listening 中に Reading の問題を先読みするのは禁止",
          "解答用紙への記入は鉛筆のマークで、はみ出さないように",
          "途中退室は不可（体調不良時のみ申し出る）",
          "携帯電話は完全電源 OFF（マナーモード不可）",
        ],
      },
      { type: "h2", text: "試験前 30 分でやるべきこと" },
      {
        type: "ol",
        items: [
          "事前準備した単語リストで頻出語の最終確認",
          "深呼吸でリラックス（焦りはケアレスミスの元）",
          "リスニングのテンポに耳を慣らす（イヤホン使用可なら好きな英語音源を 5 分聴く）",
          "トイレを済ませる",
        ],
      },
      { type: "h2", text: "試験後にすべきこと" },
      {
        type: "p",
        text: "結果は約 17 日後にオンライン公開、約 30 日後に成績証明書（公式認定証）が郵送されます。試験直後は記憶が鮮明なうちに、間違えた・自信がなかった問題のジャンルをメモしておくと、次回までの学習計画が立てやすくなります。",
      },
      {
        type: "p",
        text: "試験当日は「準備が 9 割」です。当日の流れと持ち物を事前に把握し、本番では試験そのものに集中できる状態を作ることが、スコアアップへの最短ルートです。",
      },
    ],
    relatedSlugs: ["last-week-plan", "toeic-vocab-by-score"],
  },
  {
    slug: "part7-speed-reading",
    title: "TOEIC Part 7 速読のコツと頻出ディスコースマーカー",
    description:
      "TOEIC Part 7（読解）を時間内に解き切るための速読テクニックと、文章の論理構造を素早く把握するための「ディスコースマーカー」（therefore、moreover、nevertheless など）の分類と使い方を解説します。",
    category: "Part 別対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 7 は 54 問を約 55 分で解く必要があり、Reading セクションで最も時間が足りなくなりやすいパートです。本記事では、Part 7 を時間内に解き切るための速読の 3 原則と、文章の流れを瞬時に掴むための「ディスコースマーカー」を体系的に解説します。",
      },
      { type: "h2", text: "Part 7 の構成と難度" },
      {
        type: "table",
        headers: ["セクション", "問題数", "文書数", "難度"],
        rows: [
          ["Single Passage（単一文書）", "29 問", "10 文書", "★★☆"],
          ["Double Passage（2 文書）", "10 問", "2 セット", "★★★"],
          ["Triple Passage（3 文書）", "15 問", "3 セット", "★★★★"],
        ],
      },
      { type: "h2", text: "速読の 3 原則" },
      { type: "h3", text: "原則 1：設問を先に読む" },
      {
        type: "p",
        text: "本文を読み始める前に必ず設問に目を通し、何を問われるかを把握してから本文に入ります。設問のキーワード（人名、固有名詞、日付、金額など）を頭に入れると、本文中で該当箇所を見つけた瞬間に解答できます。",
      },
      { type: "h3", text: "原則 2：トピックセンテンスを優先" },
      {
        type: "p",
        text: "英語の論理構造では、各段落の最初の 1〜2 文に主題が置かれることが多く、これを読むだけで段落全体の趣旨がつかめます。詳細部分は設問で問われた箇所だけを精読する戦略が効率的です。",
      },
      { type: "h3", text: "原則 3：ディスコースマーカーで論理を追う" },
      {
        type: "p",
        text: "「順接」「逆接」「追加」「結論」を示す接続表現を意識的に拾うと、文章全体の論理構造が骨組みとして見えるようになります。これが速読力の核です。",
      },
      { type: "h2", text: "頻出ディスコースマーカーの分類" },
      {
        type: "table",
        headers: ["分類", "代表的な表現", "意味"],
        rows: [
          ["順接（だから／その結果）", "therefore, thus, as a result, accordingly", "前文の結果を示す"],
          ["逆接（しかし）", "however, nevertheless, on the other hand, whereas", "前文と反対の内容"],
          ["追加（さらに）", "moreover, furthermore, in addition, additionally", "情報の積み増し"],
          ["例示（例えば）", "for example, for instance, specifically, such as", "具体例の提示"],
          ["結論（つまり）", "in conclusion, in short, to summarize, overall", "まとめ・総括"],
          ["時間（その間）", "meanwhile, in the meantime, subsequently", "並行・後続の出来事"],
          ["対比（一方）", "in contrast, on the contrary, conversely", "対比的な情報"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "上記のうち「逆接」を見つけたら最優先でマークしましょう。設問の正解は、逆接の直後の文に隠されていることが非常に多いです。",
      },
      { type: "h2", text: "Part 7 で頻出する論理マーカー（単語ページ）" },
      {
        type: "wordLinks",
        intro: "TOEIC で実際に出題頻度の高いディスコースマーカー語：",
        words: [
          "therefore",
          "moreover",
          "furthermore",
          "nevertheless",
          "thus",
          "otherwise",
          "meanwhile",
          "whereas",
        ],
      },
      { type: "h2", text: "設問タイプ別の解き方" },
      {
        type: "ul",
        items: [
          "What is the purpose of ...?（目的） → 第 1 段落の冒頭",
          "What is mentioned about ...?（言及） → 該当キーワードを本文検索",
          "What is implied / suggested?（示唆） → 文末や逆接の直後",
          "In paragraph X, the word \"Y\" is closest in meaning to ...（語義） → 文脈から類義語選択",
        ],
      },
      { type: "h2", text: "1 文書あたりの目安時間" },
      {
        type: "ol",
        items: [
          "Single Passage: 1 文書 5〜6 分（設問 2〜4 問）",
          "Double Passage: 1 セット 8〜10 分（設問 5 問）",
          "Triple Passage: 1 セット 10〜12 分（設問 5 問）",
        ],
      },
      {
        type: "p",
        text: "Part 7 攻略の本質は「全文を精読しないこと」です。ディスコースマーカーで論理構造の骨組みを掴み、設問に関係する箇所だけを精読するスタイルを身につければ、時間切れに悩まされなくなります。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "toeic-vocab-by-score"],
  },
  {
    slug: "listening-pre-read",
    title: "TOEIC リスニング Part 3・4 攻略｜先読みテクニックの全手順",
    description:
      "TOEIC Part 3（会話問題）・Part 4（説明文問題）でスコアが伸び悩む最大の原因は「設問の先読み不足」です。本記事では、ディレクションが流れている時間を活用した先読みの具体的な手順、注目すべき 5W1H、頻出設問パターンを解説します。",
    category: "Part 別対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 3（会話問題）と Part 4（説明文問題）は、Listening セクションの中で最も配点が高く、また「先読み」の有無でスコアが大きく変わるパートです。本記事では、本番で使える先読みの具体手順と、注目すべきポイントを解説します。",
      },
      { type: "h2", text: "Part 3・Part 4 の特徴" },
      {
        type: "table",
        headers: ["パート", "問題形式", "問題数", "1 セットの設問数"],
        rows: [
          ["Part 3（会話）", "2〜3 名の会話を聴く", "39 問", "3 問"],
          ["Part 4（説明文）", "1 名のスピーチ／案内を聴く", "30 問", "3 問"],
        ],
      },
      { type: "h2", text: "なぜ「先読み」が重要なのか" },
      {
        type: "p",
        text: "Part 3・4 では、音声が一度しか流れません。設問を聴いてから本文を思い出すのではなく、「何を問われるか」を事前に頭に入れた状態で本文を聴くことで、必要な情報を狙い撃ちで拾えるようになります。これが先読みです。",
      },
      { type: "h2", text: "先読みのタイムテーブル" },
      {
        type: "table",
        headers: ["タイミング", "やること"],
        rows: [
          ["Part 3 開始のディレクション中（約 30 秒）", "最初の 1 セット（3 問）の設問を読む"],
          ["1 セット目の本文音声中", "音声に集中（先読みは禁止）"],
          ["1 セット目の設問読み上げ中（各 8 秒×3 問＝24 秒）", "解答→次セットの先読み"],
          ["以降、各セット間の 24 秒で次の先読みを繰り返す", "リズムが命"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "本文音声中に先読みすると、本文の重要部分を聞き逃します。先読みは「次のセットの設問読み上げ中」に行うのが鉄則です。",
      },
      { type: "h2", text: "先読み時に注目すべき 5W1H" },
      {
        type: "ol",
        items: [
          "Who（誰）：登場人物の役職・関係性（同僚／顧客／上司）",
          "Where（どこ）：場所（オフィス／店舗／空港）",
          "When（いつ）：時間・日付・曜日",
          "What（何）：話題（製品／サービス／問題）",
          "Why（なぜ）：理由・目的",
          "How（どのように）：手段・方法・程度",
        ],
      },
      { type: "h2", text: "頻出設問パターン" },
      {
        type: "ul",
        items: [
          "What is the conversation mainly about?（会話の主題）",
          "Where most likely is the conversation taking place?（場所推測）",
          "Who most likely is the man / woman?（人物推測）",
          "What does the speaker imply about ...?（示唆）",
          "What will the speaker probably do next?（次の行動）",
          "Look at the graphic. What ...?（図表参照）",
        ],
      },
      { type: "h2", text: "Part 4 で特に頻出のシーン" },
      {
        type: "wordLinks",
        intro: "Part 4 で頻出するシーン関連語：",
        words: ["announce", "conference", "instruction", "inform", "focus"],
      },
      {
        type: "table",
        headers: ["頻出シーン", "典型的な設問パターン"],
        rows: [
          ["社内アナウンス", "What is being announced?"],
          ["商品案内・広告", "What is the advertisement for?"],
          ["留守番電話", "Why is the speaker calling?"],
          ["観光案内・ツアー", "Where most likely is the speaker?"],
          ["天気予報・交通情報", "What problem is mentioned?"],
        ],
      },
      { type: "h2", text: "先読みを身につける練習法" },
      {
        type: "ol",
        items: [
          "公式問題集の Part 3・4 を、まずは普通に解く",
          "次に、設問だけ先に 30 秒読んでから本文を聴く",
          "「先読みあり」「先読みなし」で正答数を比較",
          "先読み時間を 30 秒 → 24 秒 → 20 秒と短縮していく",
          "最終的にディレクション中に 1 セット（3 問）を 20 秒で先読みできる状態に",
        ],
      },
      {
        type: "p",
        text: "先読みは「練習しないと本番では絶対にできない」テクニックです。1 ヶ月でも継続して練習すれば、Part 3・4 のスコアは確実に伸びます。今日からぜひ取り入れてみてください。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "part7-speed-reading"],
  },
  {
    slug: "synonym-pairs-15",
    title: "TOEIC で問われる類義語の使い分け 15 ペア",
    description:
      "TOEIC Part 5・Part 7 で頻出する類義語ペアを 15 組厳選し、ニュアンスの違い・典型的な使い方・コロケーションを解説します。accept/admit、improve/enhance、postpone/decline などの定番ペアを完全網羅。",
    category: "語彙集",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 8,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 5 の語彙問題では、「文意は通るが選択肢が複数あって迷う」シチュエーションが頻発します。これは選択肢が類義語で構成されているからです。本記事では TOEIC で特に問われやすい類義語ペアを 15 組厳選し、使い分けの基準を解説します。",
      },
      { type: "h2", text: "なぜ類義語の使い分けが問われるのか" },
      {
        type: "p",
        text: "TOEIC は「ビジネス文脈で適切な語を選べるか」を測る試験です。たとえば accept と admit はどちらも「受け入れる」と訳せますが、対象（提案 vs 過ち）が違います。こうした「文脈に最適な 1 語」を選ぶ力こそ、TOEIC が測ろうとしている語彙力です。",
      },
      { type: "h2", text: "1. accept / admit（受け入れる）" },
      {
        type: "p",
        text: "accept は「申し出・条件を受け入れる」、admit は「過ち・事実を認める」「入場・入会を許可する」。「I accept your offer.」と「He admitted his mistake.」のように使い分けます。",
      },
      { type: "wordLinks", words: ["accept", "admit"] },
      { type: "h2", text: "2. improve / enhance（改善する）" },
      {
        type: "p",
        text: "improve は「悪い・不十分なものをより良くする」、enhance は「すでに良いものをさらに高める」。改善の出発点が違います。「improve customer service」「enhance brand value」が典型です。",
      },
      { type: "wordLinks", words: ["improve", "enhance"] },
      { type: "h2", text: "3. expand / extend（広げる・延長する）" },
      {
        type: "p",
        text: "expand は「面・規模が広がる（拡大）」、extend は「線・期間が伸びる（延長）」。「expand business overseas」「extend the deadline」のように使い分けます。",
      },
      { type: "wordLinks", words: ["expand", "extend"] },
      { type: "h2", text: "4. propose / suggest（提案する）" },
      {
        type: "p",
        text: "どちらも提案ですが、propose の方が公式・正式な提案、suggest はカジュアルな示唆。「propose a plan to the board」「suggest taking a break」のニュアンス差を覚えましょう。",
      },
      { type: "wordLinks", words: ["propose", "suggest"] },
      { type: "h2", text: "5. examine / inspect（調べる）" },
      {
        type: "p",
        text: "examine は「詳細に調査・検討する」（書類・データ・身体）、inspect は「公式に検査する」（設備・現場・製品）。「examine the report」「inspect the factory」が典型例です。",
      },
      { type: "wordLinks", words: ["examine", "inspect"] },
      { type: "h2", text: "6. estimate / evaluate（見積もる・評価する）" },
      {
        type: "p",
        text: "estimate は「数量・コストを見積もる」、evaluate は「価値・パフォーマンスを評価する」。「estimate the cost」「evaluate the performance」が典型です。",
      },
      { type: "wordLinks", words: ["estimate", "evaluate"] },
      { type: "h2", text: "7. recognize / identify（認識する・特定する）" },
      {
        type: "p",
        text: "recognize は「以前見たものだと認識する」「功績を認める」、identify は「身元・問題・原因を特定する」。「recognize his face」「identify the cause」のように使い分けます。",
      },
      { type: "wordLinks", words: ["recognize", "identify"] },
      { type: "h2", text: "8. complete / finalize（完了する・確定する）" },
      {
        type: "p",
        text: "complete は「タスクを完成・修了する」、finalize は「最終決定する・取りまとめる」。「complete the form」「finalize the contract」が典型です。",
      },
      { type: "wordLinks", words: ["complete", "finalize"] },
      { type: "h2", text: "9. initiate / commence（開始する）" },
      {
        type: "p",
        text: "initiate は「（プロジェクト・手続きを）始動させる」、commence は「（イベント・式典が）正式に始まる」。commence は initiate より格式高い表現です。「initiate a project」「The ceremony will commence at 10.」",
      },
      { type: "wordLinks", words: ["initiate", "commence"] },
      { type: "h2", text: "10. replace / substitute（置き換える）" },
      {
        type: "p",
        text: "replace は「古いもの／壊れたものを新しいものに交換」、substitute は「一時的に代わりとして使う」。「replace the broken machine」「substitute butter for oil」が典型です。",
      },
      { type: "wordLinks", words: ["replace", "substitute"] },
      { type: "h2", text: "11. exceed / surpass（上回る）" },
      {
        type: "p",
        text: "exceed は「数値・基準を上回る」（中立的）、surpass は「期待・記録を凌駕する」（ポジティブ含意）。「exceed the budget」「surpass expectations」が典型です。",
      },
      { type: "wordLinks", words: ["exceed", "surpass"] },
      { type: "h2", text: "12. maintain / preserve（維持する・保存する）" },
      {
        type: "p",
        text: "maintain は「機能・品質を維持し続ける」、preserve は「劣化・消失から守る」。「maintain quality」「preserve historical buildings」が典型です。",
      },
      { type: "wordLinks", words: ["maintain", "preserve"] },
      { type: "h2", text: "13. ensure / guarantee（保証する）" },
      {
        type: "p",
        text: "ensure は「（結果を）確実にする」（プロセス重視）、guarantee は「（品質・成果を）約束する」（結果重視）。「ensure compliance」「guarantee a refund」が典型です。",
      },
      { type: "wordLinks", words: ["ensure", "guarantee"] },
      { type: "h2", text: "14. encourage / motivate（励ます・動機付ける）" },
      {
        type: "p",
        text: "encourage は「行動を促す・後押しする」、motivate は「内発的なやる気を引き出す」。「encourage employees to participate」「motivate the team」が典型です。",
      },
      { type: "wordLinks", words: ["encourage", "motivate"] },
      { type: "h2", text: "15. reject / decline（断る）" },
      {
        type: "p",
        text: "reject は「強く拒絶する」（ネガティブ）、decline は「丁寧に辞退する」（フォーマル）。「reject the proposal outright」「decline the invitation politely」が典型です。",
      },
      { type: "wordLinks", words: ["reject", "decline"] },
      { type: "h2", text: "学習のコツ" },
      {
        type: "callout",
        tone: "tip",
        text: "類義語ペアを覚えるときは「ニュアンスの違い」と「典型的なコロケーション」をセットで覚えましょう。コロケーションを 1〜2 個覚えれば、Part 5 の選択肢からその場で正解を判断できるようになります。",
      },
      {
        type: "p",
        text: "類義語の使い分けは、TOEIC のスコアを 700 → 800 に押し上げる際に最も差がつくポイントです。本記事の 15 ペアは、すべて公式問題集や市販模試で出題実績のあるものです。各単語の詳細ページで例文を確認し、自分の中に「使い分け基準」を作っていきましょう。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "business-vocab-essentials"],
  },
  {
    slug: "last-week-plan",
    title: "TOEIC 直前 1 週間で 50 点伸ばす単語復習プラン",
    description:
      "TOEIC 試験の 7 日前から当日までにやるべき単語復習を、日次プランで具体的に解説します。新規単語のインプットは控え、既習単語の再強化に絞ることで、本番で 30〜50 点のスコアアップを狙えるプランです。",
    category: "学習法",
    publishedAt: "2026-04-26",
    updatedAt: "2026-04-26",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC 試験の 1 週間前。「あと何をやればスコアが伸びるか」と悩む方は多いはずです。この時期に新出単語を 100 語増やしても、本番では 7 割以上忘れてしまい逆効果。本記事では、既に学習済みの単語を再強化することで、本番で確実に 30〜50 点のスコアアップを狙える 7 日間プランを紹介します。",
      },
      { type: "h2", text: "前提：直前期の鉄則" },
      {
        type: "ul",
        items: [
          "新規単語のインプットはやらない（既習語の再強化に集中）",
          "苦手分野・苦手語彙に時間を集中投下",
          "睡眠時間を削らない（暗記効率が下がる）",
          "本番と同じ時間帯に勉強する（生体リズムを合わせる）",
          "前日と当日朝の負荷を意図的に下げる（ピークを当日に持ってくる）",
        ],
      },
      { type: "h2", text: "Day 7（試験 7 日前）：現状診断" },
      {
        type: "ol",
        items: [
          "公式問題集 1 回分を本番と同じ時間配分で実施（午前か午後、本番と同じ時間帯で）",
          "Listening / Reading の各パート別正答率を集計",
          "間違えた問題の語彙をすべてリストアップ（30〜50 語が目安）",
          "リストの単語を当サイトの「お気に入り」に登録",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "Day 7 の模試結果は、本番スコアの予測値ではなく「弱点発見ツール」として使います。スコアに一喜一憂せず、間違いの傾向だけ見るのがポイントです。",
      },
      { type: "h2", text: "Day 6〜Day 4：苦手単語の集中復習" },
      {
        type: "p",
        text: "Day 7 で抽出した苦手単語を、3 日間で集中的に復習します。1 日あたり 60〜90 分を確保できるとベストです。",
      },
      {
        type: "ol",
        items: [
          "朝 15 分：当サイトの「復習モード」でお気に入り単語をフラッシュチェック",
          "昼 15 分：詳細ページで例文 3 つを音読、コロケーションを確認",
          "夜 30 分：苦手語を含む例文をシャドーイング（音声に被せて発音）",
          "就寝前 5 分：その日に確認した単語を見直す",
        ],
      },
      { type: "h2", text: "Day 3〜Day 2：類義語と語形変化の確認" },
      {
        type: "p",
        text: "Part 5 の品詞問題・語彙問題で迷いやすい類義語ペアと、派生語（動詞・名詞・形容詞・副詞）を確認します。",
      },
      {
        type: "ul",
        items: [
          "類義語の使い分け：accept / admit、improve / enhance、ensure / guarantee など",
          "派生語マッピング：implement / implementation / implemented",
          "コロケーション再確認：make a decision、reach an agreement、submit a proposal",
        ],
      },
      {
        type: "wordLinks",
        intro: "直前期に再確認したい派生語のある単語：",
        words: ["complete", "review", "evaluate", "prepare", "focus"],
      },
      { type: "h2", text: "Day 1（試験前日）：軽い見直しと早寝" },
      {
        type: "ol",
        items: [
          "新しいことは一切やらない",
          "お気に入り単語リストを 30 分で軽く流す",
          "持ち物を確認、受験票を準備",
          "夕食は消化の良いものを早めに",
          "23 時までには就寝（最低 7 時間睡眠を確保）",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "前日に詰め込みすぎると、当日の集中力が切れます。「もう少しやれる」と感じる程度で切り上げるのが正解です。",
      },
      { type: "h2", text: "Day 0（試験当日）：直前 30 分の最終確認" },
      {
        type: "ol",
        items: [
          "起床後すぐに英語音源を 5 分聴く（耳のウォームアップ）",
          "朝食はしっかり食べる（脳のエネルギー源）",
          "会場到着後、お気に入り単語の上位 30 語だけ確認",
          "試験開始 5 分前は深呼吸でリラックス",
        ],
      },
      { type: "h2", text: "このプランで 50 点伸びる理由" },
      {
        type: "p",
        text: "直前 1 週間の伸びの正体は、「忘れかけていた単語を本番で思い出せる状態に戻す」ことです。新出単語を 1 つ覚えるより、既に 70% 覚えている単語を 100% に押し上げる方が、Part 5・Part 7 での得点機会がはるかに増えます。本プランは「既習語の歩留まり改善」に特化しているため、コストパフォーマンスが極めて高いのです。",
      },
      {
        type: "p",
        text: "試験直前は焦りやすい時期ですが、冷静に「やるべきこと」と「やらないこと」を分けて行動すれば、確実にスコアアップにつながります。本プランを参考に、ベストコンディションで本番を迎えてください。",
      },
    ],
    relatedSlugs: ["forgetting-curve", "exam-day-essentials"],
  },
  {
    slug: "toeic-424-425-review-2026-05",
    title: "第424回・第425回TOEIC公開テスト（2026年5月17日実施）難易度・感想まとめ",
    description:
      "2026年5月17日(日)に実施された第424回（午前）・第425回（午後）TOEIC L&R 公開テストについて、講師ブログ・YouTube・SNS など複数ソースから集めた難易度評価と受験者の感想を整理。Part 別の傾向と次回受験に向けた対策ポイントを解説します。",
    category: "公開テスト振り返り",
    publishedAt: "2026-05-21",
    updatedAt: "2026-05-21",
    estimatedReadingMin: 8,
    blocks: [
      {
        type: "p",
        text: "2026 年 5 月 17 日(日)、TOEIC Listening & Reading 公開テストの第 424 回（午前）／第 425 回（午後）が全国一斉に実施されました。本記事では、990 点講師ブログ・YouTube 反省会・受験者ブログ・SNS など複数のソースから集めた情報を元に、両回の難易度・感想・傾向を整理してお届けします。結果発表までの「答え合わせ」代わりに、また次回以降の対策のヒントとしてご活用ください。",
      },
      { type: "h2", text: "1. テスト基本情報" },
      {
        type: "table",
        headers: ["項目", "第 424 回（午前）", "第 425 回（午後）"],
        rows: [
          ["実施日", "2026 年 5 月 17 日(日)", "2026 年 5 月 17 日(日)"],
          ["受付時間", "9:25 - 9:55", "14:05 - 14:35"],
          [
            "インターネットでのスコア表示",
            "試験日から 17 日後（6 月 3 日頃の見込み）",
            "同左",
          ],
          [
            "デジタル公式認定証発行予定",
            "2026 年 6 月 4 日(木) 頃",
            "2026 年 6 月 4 日(木) 頃",
          ],
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "2025 年 4 月 20 日以降の公開テストから、紙の公式認定証は申込時に「希望する」を選んだ方にのみ送付される仕様に変更されています。「届かない！」と慌てないようご注意ください。",
      },
      { type: "h2", text: "2. 第 424 回（午前）の傾向と感想" },
      {
        type: "p",
        text: "午前実施分のフォームについては、本記事執筆時点（5 月 21 日）では午前専用の詳細な講評はまだ少なめです。これは午前と午後で別フォームが使われる構造上、講師 1 人につき片方しか語れないという事情によります。それでも、SNS や YouTube ライブから判明している傾向をまとめます。",
      },
      { type: "h3", text: "体感傾向（SNS・受験者ブログ集計）" },
      {
        type: "ul",
        items: [
          "Part 1：「写真が読み取りにくい問題」がやや目立つという声。1 問目から面食らったというコメントも。",
          "Part 2：標準〜やや易だが、Yes/No 以外で受ける応答が増加傾向で、定石どおりに解くと引っかかる問題が散見。",
          "Part 3 / 4：会話・トーク自体は平均的だが、設問・選択肢の文字数が多めで先読みが追いつかなかったという声が多数。",
          "Part 5：語彙問題の難度がやや高め。「金フレ」「黒フレ」収録レベルの単語が複数登場したとの報告。",
          "Part 6 / 7：シングルパッセージは平易、ダブル／トリプルでやや時間を取られる構成。チャット形式で意図問題が出題。",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "上記は記事執筆時点の SNS・速報ベースの情報で、確定的な難易度判定ではありません。Part 別の集計記事は試験後 7〜10 日程度で各講師ブログから順次公開されるため、最終的な評価はそちらを参照するのが確実です。",
      },
      { type: "h2", text: "3. 第 425 回（午後）の傾向と感想" },
      {
        type: "p",
        text: "午後実施分（第 425 回）については、990 点を多数回取得している講師による Part 別の詳細講評が試験当日夕方には公開されています。要旨を以下にまとめます。",
      },
      {
        type: "table",
        headers: ["Part", "難易度", "コメント要旨"],
        rows: [
          ["Part 1", "普通", "選択肢の一部だけが違って他は同じという「変わった」問題が含まれる"],
          ["Part 2", "難", "この 1 年で最も難しい水準。テクニック本どおりに解くと引っかかる問題あり"],
          ["Part 3", "難", "縦 1 列が (C) で正解にならない並び。難単語が読まれる場面も"],
          ["Part 4", "普通", "1 問だけ「2 通りに解釈できる」選択肢があるが他が完全に誤りなので成立"],
          ["Part 5", "難", "TOEIC 頻出単語が、頻出ではない別の意味で使われる「ひっかけ」あり"],
          ["Part 6", "普通", "1 問、流れと反するように見えて意図的に迷わせる問題あり"],
          ["Part 7", "やや難", "設問順に答えが出てこない箇所あり。縦 1 列が (A) で正解にならない並び"],
        ],
      },
      {
        type: "p",
        text: "要点をひと言で言えば、「問題作成者が変わったと思わせるほど、定石を外しに来た回」。普段ならテクニックで素早く処理できる箇所で時間を取られた受験者が多かったようです。",
      },
      { type: "h3", text: "詳細所見からのポイント" },
      {
        type: "ul",
        items: [
          "受験票・受付書類が前回（第 422・423 回／4 月 19 日実施）からデザイン変更され、第 424・425 回でも継続。",
          "問題作成チームの交代が示唆される構成で、リスニング・リーディング双方で「変わり種」が増加。",
          "Part 5 の正解語が Part 7 にそのまま登場する「セルフリーク」現象は今回も健在。後半で焦らず取り組めば拾える設計。",
        ],
      },
      { type: "h2", text: "4. 過去回との比較で見える「最近の傾向」" },
      {
        type: "table",
        headers: ["回", "実施日", "総合難易度傾向"],
        rows: [
          ["第 420・421 回", "2026 年 3 月 15 日", "Part 1 やや難・Part 5 やや易 — 全体としては標準"],
          ["第 422・423 回", "2026 年 4 月 19 日", "稀に見る難回との声多数。リスニング冒頭から手強い"],
          [
            "第 424・425 回",
            "2026 年 5 月 17 日",
            "午後は 1 年で最も難しい Part 2。問題作成者の交代を感じさせる",
          ],
        ],
      },
      {
        type: "p",
        text: "ここ数回は明確に難化傾向にあります。第 425 回もその流れを引き継ぎつつ、出題スタイルそのものが変わってきた可能性があり、今後の回でも同じ傾向が続くかは要観察です。",
      },
      { type: "h2", text: "5. 参考にした主要な情報源" },
      {
        type: "p",
        text: "本記事は次のような情報源を参考にしています。スコア確定までの「答え合わせ」に役立つサイト・チャンネルとして、ブックマーク推奨です。",
      },
      { type: "h3", text: "ブログ・Web 記事" },
      {
        type: "ul",
        items: [
          "IIBC 公式サイトの年間テスト日程（試験日・結果発行日の一次情報）",
          "大阪英語特訓道場ブログ（990 点多数回ホルダー講師による Part 別詳細講評）",
          "TOEIC 連続 990 点講師 花田徹也氏（花田塾）のブログ — 午前フォーム講評の定番",
          "English Route（イングルート）— 直近回ごとに「難易度調査」記事を継続更新",
          "ふみ英語 — 受験者目線でのレビュー",
          "TOEIC 人気ブログランキング（にほんブログ村）— 直近の感想ブログを横断検索",
        ],
      },
      { type: "h3", text: "YouTube／SNS" },
      {
        type: "ul",
        items: [
          "試験当日夜に配信される YouTube 反省会 LIVE（複数チャンネル）",
          "Morite2 English Channel（990 点を 120 回以上取得している森田鉄也氏）",
          "Hina -TOEIC 満点- YouTube — 受験者層と近い視点での解説",
          "ウィズイングリッシュアカデミー — TOEIC 速報 YouTube LIVE の常連",
          "TOEIC 公式 X（@TOEIC_japan）— 公式の運営インフォメーション",
        ],
      },
      { type: "h2", text: "6. 結果発表までの過ごし方と次回対策" },
      {
        type: "p",
        text: "第 424・425 回の結果は、2026 年 6 月 3 日(水) 頃にインターネットでスコア表示、6 月 4 日(木) にデジタル公式認定証発行の見込みです。約 3 週間の待ち時間こそ伸び盛り。次回受験に向けて手を動かしておきましょう。",
      },
      { type: "h3", text: "今回の出題から見える 3 つの対策ポイント" },
      {
        type: "ol",
        items: [
          "Part 2 の「変則応答」への耐性を上げる：Yes/No で返さない応答、質問を質問で返す応答、間接的な情報で答える応答が増加。応答の「型」を覚えるのではなく、文脈で「ありうる返答かどうか」を判定する練習が効きます。",
          "Part 5 で語彙の「2nd meaning」まで押さえる：第 425 回では「TOEIC 頻出単語が珍しい別の意味で出題された」との報告。定番教材を語義 1 つで止めず、辞書で別義まで確認しておくと安全です。",
          "Part 3 / 4 の先読みリズムを整える：設問・選択肢の文字数増は今後も続く可能性あり。「設問だけ先読み→選択肢は聞きながら処理」など、自分なりの省力化ルートを固めておく。",
        ],
      },
      { type: "h3", text: "復習ルーティンの提案" },
      {
        type: "p",
        text: "試験から数日経った今、まずやっておきたいのは「忘れる前のメモ化」です。覚えている範囲で、引っかかった単語・言い回し・場面設定を A5 ノート 1 ページにメモするだけで、次回直前の見直し材料が手に入ります。完璧を目指す必要はありません。「あの設問の選択肢、何だったっけ？」と気になっている粒度のものを書き出すだけで十分です。",
      },
      { type: "h2", text: "まとめ" },
      {
        type: "p",
        text: "第 424 回・第 425 回 TOEIC 公開テスト（2026 年 5 月 17 日実施）は、特に午後実施の第 425 回で「テクニック対策本どおりに解くと外す」「Part 2 がここ 1 年で最難」と評される、印象的な回となりました。問題作成チームの交代を感じさせる変化が起きている可能性があります。結果通知は 6 月 3 日頃のオンライン表示、6 月 4 日のデジタル認定証発行が見込まれています。それまでの期間、本記事で紹介した講師ブログ・YouTube ライブ・受験者 note 等を巡って傾向を掴み、次回に活かしていきましょう。",
      },
      {
        type: "callout",
        tone: "info",
        text: "本記事は TOEIC 公開テスト直後の受験者コメント・講師ブログ・YouTube 配信を元に編集部がまとめたものであり、IIBC および ETS が公式に発表する見解ではありません。問題の具体的内容（設問文・選択肢の引用等）は秘密保持規則に従い、本記事では再現しておりません。",
      },
    ],
    relatedSlugs: ["exam-day-essentials", "last-week-plan"],
  },
];

export function getGuideArticleBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDE_ARTICLES.map((a) => a.slug);
}

export function getLatestGuideArticles(limit = GUIDE_ARTICLES.length): GuideArticle[] {
  return GUIDE_ARTICLES
    .map((article, index) => ({ article, index }))
    .sort((a, b) => {
      const updatedAtOrder = b.article.updatedAt.localeCompare(a.article.updatedAt);
      if (updatedAtOrder !== 0) return updatedAtOrder;

      const publishedAtOrder = b.article.publishedAt.localeCompare(a.article.publishedAt);
      if (publishedAtOrder !== 0) return publishedAtOrder;

      return b.index - a.index;
    })
    .slice(0, limit)
    .map(({ article }) => article);
}
