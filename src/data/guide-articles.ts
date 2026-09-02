import { TODAY_WORDS_COUNT } from "@/lib/word-select";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "wordLinks"; intro?: string; words: string[] };

export type GuideSource = {
  title: string;
  publisher: string;
  url: string;
  note?: string;
};

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
  sources?: GuideSource[];
  /** false の記事は内容確認が終わるまで一覧・sitemap・検索対象から外す。 */
  indexable?: boolean;
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "toeic-vocab-by-score",
    title: "TOEIC スコア別 単語学習戦略｜600・730・860 点の優先順位",
    description:
      "TOEIC の目標スコアごとに、どの層の単語を優先するか、派生語やコロケーションをどこまで学ぶかを整理しました。600 点・730 点・860 点それぞれの学習順序を解説します。",
    category: "学習戦略",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "TOEIC L&R は、Listening 100 問と Reading 100 問を合計約 2 時間で解く試験です。本記事では、公式の語彙数基準ではなく、当サイトの 3 段階分類を使った学習の優先順位を整理します。",
      },
      { type: "h2", text: "スコア帯ごとの学習優先度（当サイトの目安）" },
      {
        type: "table",
        headers: ["目標スコア", "優先する層", "学習の焦点"],
        rows: [
          ["〜600 点", "important（基礎）", "基本動詞・名詞を見てすぐ意味が出る状態"],
          ["600〜730 点", "important＋mid（中級）", "派生語・品詞・基本コロケーション"],
          ["730〜860 点", "mid を中心に high へ", "Part 7 の言い換え・複数語義"],
          ["860 点以上", "全層から弱点を選ぶ", "専門語・ニュアンス・処理速度"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "IIBC・ETS は、各スコアに必要な語彙数や当サイトのランク区分を公式基準として公表していません。上表は学習順序を決めるための当サイト独自の目安で、現在の得意・不得意に合わせて調整してください。",
      },
      { type: "h2", text: "600 点を目指す段階：基礎語彙＋ビジネス入門語" },
      {
        type: "p",
        text: "600 点を目指す段階では、まず important（基礎）から、ビジネス場面の基本動詞・名詞を確認します。Part 1 の動作、Part 2 の応答、Part 5 の品詞など、模試で実際に迷った語を優先してください。",
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
      { type: "h2", text: "730 点を目指す段階：派生語と Part 5・Part 7 対策" },
      {
        type: "p",
        text: "730 点を目指す学習では、「知っている単語の派生形を判別できるか」と「Part 7（長文読解）で語彙が原因で止まらないか」を確認します。Part 5 の品詞問題（短文穴埋め）に備え、同じ語幹から派生する動詞・名詞・形容詞・副詞を整理して覚えると効率的です。",
      },
      {
        type: "ul",
        items: [
          "派生語の整理：例 — analyze（動）／ analysis（名）／ analytical（形）／ analytically（副）",
          "コロケーション意識：例 — make a decision、reach an agreement、submit a proposal",
          "Part 7 用の抽象名詞：implementation、initiative、procedure、provision など",
        ],
      },
      { type: "h2", text: "860 点を目指す段階：専門語・抽象語まで広げる" },
      {
        type: "p",
        text: "860 点以上を目指す段階では、基礎語の取りこぼしを減らしつつ、契約・人事・経理・物流・マーケティングなどの専門語や、facilitate、leverage、streamline といった抽象動詞にも学習範囲を広げます。",
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
          "覚えにくい単語は「お気に入り」に登録し、間隔を空けて数日後・1 週間後に復習する",
          "1 ヶ月ごとに模試を再受験して、語彙の伸びをスコアで確認する",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "important（基礎）／ mid（中級）／ high（上級）は、学習順を決めやすくするためのサイト独自分類です。公式の難易度区分ではなく、模試で見つけた弱点を優先するための目安として利用してください。",
      },
      { type: "h2", text: "まとめ" },
      {
        type: "p",
        text: "語彙数だけを追うのではなく、模試で止まった語や、意味を取り違えた語を優先すると学習範囲を具体化できます。基礎語を固め、派生形やコロケーションまで確認してから上位語彙へ進むのが、本記事で提案する順序です。",
      },
    ],
    sources: [
      {
        title: "テストの形式と構成",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/about/format.html",
        note: "問題数・試験時間の確認",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "word-rank-criteria"],
  },
  {
    slug: "part5-frequent-words",
    title: "TOEIC Part 5 の語彙・語形変化を解くための確認手順",
    description:
      "TOEIC Part 5（短文穴埋め問題）に向けて、品詞・語彙・文法を見分ける手順、派生語の覚え方、練習時の時間配分例をまとめました。",
    category: "Part 別対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 5 は短文穴埋め 30 問です。公式にパート別の制限時間はなく、Reading 75 分をどう配分するかは受験者が決めます。本記事では、Part 6・7 に時間を残すための当サイトの練習例として、品詞・語彙・文法の判断手順を整理します。",
      },
      { type: "h2", text: "練習時に分けて確認したい 3 タイプ" },
      {
        type: "table",
        headers: ["タイプ", "主な手掛かり", "復習する内容"],
        rows: [
          ["品詞", "同じ語幹の異なる形が並ぶ", "空所前後の構造と派生語"],
          ["語彙", "同じ品詞の異なる語が並ぶ", "文脈・目的語・コロケーション"],
          ["文法", "機能語や語形が並ぶ", "時制・代名詞・関係詞・接続詞など"],
        ],
      },
      { type: "h2", text: "品詞問題：まず空所前後の構造を見る" },
      {
        type: "p",
        text: "品詞を問う問題では、空所前後の構造が選択肢を絞る手掛かりになります。ただし、複合名詞や補語など例外もあるため、最後は文全体の意味が通るか確認します。",
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
        text: "-tion / -ment / -ity は名詞、-ive / -ous / -al は形容詞になることが多く、語尾は品詞を推測する手掛かりです。-ly で終わる形容詞などの例外もあるので、語尾だけで確定しないでください。",
      },
      { type: "h2", text: "語彙問題で確認したいテーマ" },
      {
        type: "p",
        text: "語の意味だけで選べないときは、前後の語との組み合わせや目的語が判断材料になります。次の 4 領域に分けて復習すると、迷った理由を整理できます。",
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
        text: "1 つの語幹を動詞・名詞・形容詞・副詞のセットで整理すると、選択肢の違いを見分ける練習になります。存在しない形や意味の異なる派生語もあるため、例文と一緒に確認してください。",
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
      { type: "h2", text: "Part 5 対策で確認したい単語の例" },
      {
        type: "wordLinks",
        intro: "語形やコロケーションを確認できる収録語の例：",
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
      { type: "h2", text: "練習時の時間配分例" },
      {
        type: "ol",
        items: [
          "まず時間を測り、30 問を解くのにかかる現在の時間を把握する",
          "選択肢を見て品詞問題と判断したら、文の意味は読まず構造のみで判断",
          "語彙問題で 30 秒以上悩んだら印をつけて次へ進む",
          "Part 6・7 に時間を残すことを最優先",
        ],
      },
      {
        type: "p",
        text: "時間目標は固定せず、Part 7 を含む Reading 全体の模試結果から調整してください。誤答した問題は、品詞・語彙・文法のどこで判断を誤ったかを記録すると、次に確認する内容が明確になります。",
      },
    ],
    sources: [
      {
        title: "テストの形式と構成",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/about/format.html",
        note: "Part 5 の問題数と Reading の試験時間を確認",
      },
    ],
    relatedSlugs: ["toeic-vocab-by-score", "business-vocab-essentials"],
  },
  {
    slug: "forgetting-curve",
    title: "忘却曲線と間隔反復を TOEIC 単語復習に取り入れる方法",
    description:
      "忘却曲線を固定の忘却率として扱わず、間隔を空けて思い出す練習を TOEIC 単語復習へ取り入れる方法を解説します。お気に入り・復習モードの使い方も紹介します。",
    category: "学習法",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "一度覚えた単語を後で思い出せないことは珍しくありません。本記事では、エビングハウスの研究を『誰にでも当てはまる忘却率』として使わず、間隔を空けた復習を始めるための考え方として紹介します。",
      },
      { type: "h2", text: "エビングハウスの忘却曲線とは" },
      {
        type: "p",
        text: "エビングハウスは、自身が無意味綴りを学習・再学習した実験から、時間経過と保持の関係を示しました。よく紹介されるパーセント値は、その条件での『再学習に要する時間の節約』を単純化したもので、TOEIC 単語を全員が同じ割合で忘れるという意味ではありません。",
      },
      {
        type: "table",
        headers: ["復習のタイミング例", "確認すること", "次の間隔"],
        rows: [
          ["当日〜翌日", "意味を見ずに思い出せるか", "難しければ短くする"],
          ["数日後", "例文の中でも意味が取れるか", "思い出せれば延ばす"],
          ["1〜2 週間後", "音声からも認識できるか", "弱い語だけ再登録"],
          ["模試の後", "実際に迷った語は何か", "ランクより弱点を優先"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "最適な間隔は、既知度・難しさ・試験日までの期間によって変わります。固定日程を守ることより、思い出せた語の間隔を延ばし、思い出せなかった語を早めに再確認する運用が実用的です。",
      },
      { type: "h2", text: "間隔反復学習（SRS）の基本タイミング" },
      {
        type: "p",
        text: "間隔反復では、同じ内容を連続して見るのではなく、時間を空けて思い出します。次は開始例です。難しい語は間隔を短くし、容易な語は長くしてください。",
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
          `「今日のおすすめ ${TODAY_WORDS_COUNT} 単語」で毎日 ${TODAY_WORDS_COUNT} 語を確認（同じ日には同じ語が表示される）`,
          "詰まった単語は「お気に入り」に追加（ローカル保存）",
          "「学習モード」でランダム出題し、覚えていない単語にチェック",
          "「復習モード」でお気に入り単語のみを集中学習（ログインが必要）",
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
          "翌日に復習できない量を一度に追加する",
          "長く間を空けた後も、すべて覚えている前提で先へ進む",
          "意味だけを見て、例文や音声で認識できるかを一度も確認しない",
          "ノートに書き写すだけで、出題形式での想起練習をしない（再認はできても再生ができない状態）",
        ],
      },
      {
        type: "p",
        text: "一律の忘却率に合わせる必要はありません。思い出す練習を行い、その結果に応じて次の復習間隔を調整することが、継続しやすい復習計画の出発点です。",
      },
    ],
    sources: [
      {
        title: "Memory: A Contribution to Experimental Psychology, Chapter VII",
        publisher: "Classics in the History of Psychology（York University）",
        url: "https://psychclassics.yorku.ca/Ebbinghaus/memory7.htm",
        note: "エビングハウスの保持・再学習実験",
      },
      {
        title: "Spacing effects in learning: a temporal ridgeline of optimal retention",
        publisher: "Psychological Science / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/19076480/",
        note: "復習間隔と保持期間の関係",
      },
    ],
    relatedSlugs: ["toeic-vocab-by-score", "word-rank-criteria"],
  },
  {
    slug: "business-vocab-essentials",
    title: "TOEIC 学習で確認したいビジネス語彙｜契約・会議・メール表現",
    description:
      "契約・会議・メール・経理の 4 領域に分け、ビジネス文書や会話を読むときに確認したい語と基本的な組み合わせを整理しました。",
    category: "語彙集",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 7 では、メールや告知など、日常・ビジネス場面の文書を読む問題があります。本記事では、場面と語の組み合わせを確認できるよう、当サイトの収録語から例を 4 領域に分けて整理します。",
      },
      { type: "h2", text: "1. 契約・取引に関する語彙" },
      {
        type: "p",
        text: "契約書や取引メールを想定した英文では、条件・納期・請求などの語が文意を取る手掛かりになります。単語だけでなく、右列の組み合わせも確認してください。",
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
        text: "会議を扱う英文に備え、議題・議事録・予定変更・司会などの運営語彙をまとめます。音声でも認識できるか、詳細ページで発音を確認してください。",
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
        text: "メールや社内通知を読むときは、件名・添付・確認・通知などの語から、送信の目的と依頼内容を整理できます。定型的な組み合わせを例文の中で確認します。",
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
        text: "決算報告や売上資料を想定した英文では、数値の増減を示す動詞と、収支に関する名詞をセットで確認します。",
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
        text: "『会議で使う』『メールで使う』のように場面を添えると、同じ日本語訳を持つ語の使い分けを整理しやすくなります。",
      },
      {
        type: "p",
        text: "本記事の約 30 語は、場面別に学習を始めるための例であり、公式の頻度ランキングではありません。詳細ページの例文・音声を確認し、模試で迷った語を追加してください。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "toeic-vocab-by-score"],
  },
  {
    slug: "word-rank-criteria",
    title: "当サイトの単語選定基準と推奨学習フロー",
    description:
      "TOEIC 重要単語で使う「important / mid / high」の 3 段階が当サイト独自の学習目安であること、AI 解説の生成・確認方法、ランクの使い方を説明します。",
    category: "サイト紹介",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 5,
    blocks: [
      {
        type: "p",
        text: "当サイトでは、学習範囲を選びやすくするために収録語を 3 段階に分類しています。この分類は IIBC・ETS 公式の頻度表やスコア別語彙基準ではなく、当サイト独自の学習目安です。模試で見つけた弱点を優先し、範囲を絞る補助として利用してください。",
      },
      { type: "h2", text: "3 段階ランクの定義" },
      {
        type: "table",
        headers: ["ランク", "画面上の目安", "学習時の扱い"],
        rows: [
          [
            "important（基礎）",
            "600 点",
            "最初に意味を確認したい基本動詞・名詞など",
          ],
          [
            "mid（中級）",
            "730〜800 点",
            "基礎語の次に広げる語、派生形やコロケーション",
          ],
          [
            "high（上級）",
            "800 点以上",
            "専門的な場面や細かなニュアンスまで確認する語",
          ],
        ],
      },
      { type: "h2", text: "選定の根拠" },
      {
        type: "p",
        text: "ランクは学習順を示す編集上の分類です。特定の公式問題集・市販教材・コーパスについて、版や集計手順を公開できる頻度データは現在用いていません。そのため『このランクを覚えれば特定スコアに届く』とは保証していません。",
      },
      {
        type: "ul",
        items: [
          "important：基礎として先に確認する層",
          "mid：基礎の次に学習範囲を広げる層",
          "high：専門語や抽象語まで広げる層",
          "実際の模試で間違えた語は、表示ランクにかかわらず優先",
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
        text: "各単語の詳細ページに表示される意味・ニュアンス・例文は、Google Gemini（gemini-2.5-flash-lite）で生成し、Next.js の Data Cache と Upstash Redis を利用して配信しています。全ページの人手確認が完了しているわけではなく、次の手順で形式確認と段階的な修正を行っています。",
      },
      {
        type: "ol",
        items: [
          "TOEIC のビジネス文脈に限定したプロンプト設計（一般会話例文を排除）",
          "出力後の自動検証（必須フィールド・例文数・形式の整合性チェック）",
          "優先度の高いページや指摘を受けたページを運営者が目視確認",
          "誤りを確認した場合、対象キャッシュを更新して再生成内容を確認",
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
          `毎日「今日のおすすめ ${TODAY_WORDS_COUNT} 単語」で少量ずつ確認`,
          "詳細ページで例文 3〜5 個を音声付きで確認",
          "復習モードでお気に入り単語のみを集中復習（ログインが必要）",
        ],
      },
      { type: "h3", text: "上級者（730 点以上）" },
      {
        type: "ol",
        items: [
          "模試で間違えた語を優先し、必要に応じて high ランクまで範囲を広げる",
          "聞き流しモード（/today-words/listen）で耳からのインプットを強化",
          "ニュアンスや類義語の使い分けを詳細ページで確認",
          "Part 7 模試で未知語が出た際は、ランダム検索（/words）から該当語を引き、その場で詳細を確認",
        ],
      },
      { type: "h2", text: "更新方針" },
      {
        type: "ul",
        items: [
          "収録漏れや学習上の必要性を確認し、単語の追加・削除を随時実施",
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
    sources: [
      {
        title: "公式教材・問題集",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/support/prep.html",
        note: "公式教材の案内。スコア別語彙数の公式基準ではありません",
      },
    ],
    relatedSlugs: ["toeic-vocab-by-score", "forgetting-curve"],
  },
  {
    slug: "exam-day-essentials",
    title: "TOEIC 試験当日の持ち物・流れ・時間配分まとめ",
    description:
      "TOEIC L&R 公開テスト当日の持ち物、午前／午後の公式スケジュール、Reading 75 分の時間配分例、会場での注意事項を公式案内に沿って整理しました。",
    category: "試験対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC L&R は、Listening 約 45 分・Reading 75 分の合計約 2 時間で 200 問に答える試験です。当日の規定は更新される可能性があるため、本記事に加えて、受験票と IIBC 公式の『テスト当日のご案内』を必ず確認してください。",
      },
      { type: "h2", text: "必須の持ち物" },
      {
        type: "ul",
        items: [
          "受験票",
          "受験票の規定を満たす証明写真 1 枚",
          "IIBC が認める、有効期限内・顔写真付きの本人確認書類の原本",
          "HB の鉛筆またはシャープペンシル、消しゴム",
          "腕時計（スマートウォッチ、携帯電話、置時計などは時計として使用不可）",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "本人確認書類として認められる種類は国籍などにより異なり、コピーや画面撮影は使えません。証明写真と指定の本人確認書類を両方持参できない場合は受験できないため、公式ページで自分の条件を確認してください。",
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
      { type: "h2", text: "当日の公式スケジュール" },
      {
        type: "table",
        headers: ["内容", "午前実施", "午後実施"],
        rows: [
          ["受付", "9:25〜9:55", "14:05〜14:35"],
          ["試験の説明・音テスト", "9:55〜10:20", "14:35〜15:00"],
          ["試験開始〜終了", "10:20〜12:20", "15:00〜17:00"],
          ["問題・解答用紙の回収", "12:20〜12:35", "17:00〜17:15"],
          ["解散予定", "12:35", "17:15"],
        ],
      },
      {
        type: "p",
        text: "受付時間終了までに受付へ到着できない場合は受験できません。交通経路を事前に確認し、受験票に記載された会場案内に従って余裕を持って向かってください。",
      },
      { type: "h2", text: "Reading セクションの時間配分の目安" },
      {
        type: "p",
        text: "Reading 75 分にはパート別の公式制限時間がありません。次の表は合計 75 分にする当サイトの練習例です。現在の得意・不得意に合わせ、模試を通して調整してください。",
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
        text: "Part 5 の語彙・品詞問題を復習するときは、正解だけでなく判断にかかった時間も記録すると、自分に合う配分を決めやすくなります。",
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
          "受験票・証明写真・本人確認書類・筆記用具・腕時計を再確認",
          "会場と受付終了時刻を再確認",
          "確認するなら、事前に絞った少量の弱点語だけにする",
          "トイレを済ませる",
        ],
      },
      { type: "h2", text: "試験後にすべきこと" },
      {
        type: "p",
        text: "IIBC の案内では、通常は試験日から 17 日後にインターネットでスコア表示、19 日後にデジタル公式認定証を発行します。紙の公式認定証は、申込時に発行を希望した方へ 30 日以内に発送されます。日米の祝日などで遅れる場合があるため、受験回ごとの予定を公式ページで確認してください。",
      },
      {
        type: "p",
        text: "忘れ物と受付時刻の勘違いを避けるため、前日までに公式案内と受験票を照合してください。当日は試験官の指示を優先し、規定に変更がある場合は最新の案内に従ってください。",
      },
    ],
    sources: [
      {
        title: "テスト当日のご案内",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/guide02.html",
        note: "持ち物・受付時刻・注意事項",
      },
      {
        title: "テストの形式と構成",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/about/format.html",
        note: "問題数・試験時間",
      },
      {
        title: "テスト結果について",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/guide04.html",
        note: "スコア表示・公式認定証の予定",
      },
    ],
    relatedSlugs: ["last-week-plan", "toeic-vocab-by-score"],
  },
  {
    slug: "part7-speed-reading",
    title: "TOEIC Part 7 の読み方とディスコースマーカーの確認",
    description:
      "TOEIC Part 7（読解）の文書と設問を読む手順、therefore、moreover、nevertheless など、文章の関係を示す表現の確認方法を解説します。",
    category: "Part 別対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 7 は 54 問です。Reading 75 分にパート別の公式制限時間はないため、Part 5・6 を含む模試で自分の配分を決めます。本記事では、文書と設問を行き来する読み方と、文章の関係を示す表現を整理します。",
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
      { type: "h2", text: "ディスコースマーカーの分類例" },
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
        text: "逆接は前後の関係が変わる目印です。直後だけが必ず解答根拠になるわけではないため、逆接の前後を一組として読みます。",
      },
      { type: "h2", text: "論理関係を示す収録語" },
      {
        type: "wordLinks",
        intro: "接続関係を確認できる収録語の例：",
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
        text: "読み方は設問タイプと現在の読解速度に合わせて調整します。根拠箇所を探す読み方だけで文意を取り違える場合は、段落全体へ戻って確認してください。模試では正答数と所要時間の両方を記録します。",
      },
    ],
    sources: [
      {
        title: "テストの形式と構成",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/about/format.html",
        note: "Part 7 の問題数と Reading の試験時間",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "toeic-vocab-by-score"],
  },
  {
    slug: "listening-pre-read",
    title: "TOEIC リスニング Part 3・4｜設問を先に確認する練習手順",
    description:
      "TOEIC Part 3（会話問題）・Part 4（説明文問題）で、設問を先に確認する練習手順、5W1Hの見方、設問例をまとめました。",
    category: "Part 別対策",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "TOEIC Part 3 は 39 問、Part 4 は 30 問です。設問を先に確認する方法が合うかどうかは、読む速度や現在の聴き方で異なります。本記事の手順を公式教材で試し、正答数と聞き逃しの変化を比較してください。",
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
      { type: "h2", text: "設問パターンの例" },
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
      { type: "h2", text: "Part 4 で扱われる場面の例" },
      {
        type: "wordLinks",
        intro: "案内・説明の場面を確認できる収録語：",
        words: ["announce", "conference", "instruction", "inform", "focus"],
      },
      {
        type: "table",
        headers: ["場面例", "設問例"],
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
        text: "先読み中に音声を聞き逃す場合は、設問だけを読み、長い選択肢は無理に読み切らない方法も試せます。練習前後の正答数を比較し、自分に合わなければ音声への集中を優先してください。",
      },
    ],
    sources: [
      {
        title: "テストの形式と構成",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/test/lr/about/format.html",
        note: "Part 3・4 の問題形式と問題数",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "part7-speed-reading"],
  },
  {
    slug: "synonym-pairs-15",
    title: "ビジネス英語の類義語 15 ペア｜用法と組み合わせを比較",
    description:
      "accept/admit、improve/enhance など、意味が近い英単語 15 ペアについて、通常の用法とコロケーションを比較します。",
    category: "語彙集",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 8,
    blocks: [
      {
        type: "p",
        text: "意味の近い語は、日本語訳だけでは使い分けに迷うことがあります。本記事では、当サイトの収録語から 15 ペアを選び、目的語やよく使われる組み合わせを比較します。",
      },
      { type: "h2", text: "なぜ類義語の使い分けが問われるのか" },
      {
        type: "p",
        text: "たとえば accept と admit は日本語訳が重なることがありますが、accept an offer と admit a mistake では対象が異なります。訳語だけでなく、前後の語と文全体の意図を確認します。",
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
        text: "類義語は、ニュアンスの説明だけでなく、目的語や前置詞を含む例文で確認してください。単純な二分ルールには例外があるため、最後は文脈に戻ります。",
      },
      {
        type: "p",
        text: "本記事は公式の出題頻度一覧ではなく、使い分けを練習するための例です。各単語の詳細ページで複数の例文を確認し、模試で迷った組み合わせを自分の復習リストへ追加してください。",
      },
    ],
    relatedSlugs: ["part5-frequent-words", "business-vocab-essentials"],
  },
  {
    slug: "last-week-plan",
    title: "TOEIC 直前 1 週間の単語復習プラン｜既習語を中心に総点検",
    description:
      "TOEIC 試験の 7 日前から当日までに、模試で迷った語や既習語を再確認する日次プランです。得点幅を保証せず、弱点整理と当日の準備に焦点を当てます。",
    category: "学習法",
    publishedAt: "2026-04-26",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "試験 1 週間前は、限られた時間をどこへ使うか迷いやすい時期です。本記事では、模試で迷った語と既に学んだ語を中心に、当日までの確認内容を 7 日間の例として整理します。学習による得点の変化には個人差があり、向上幅を保証するプランではありません。",
      },
      { type: "h2", text: "前提：直前期の鉄則" },
      {
        type: "ul",
        items: [
          "新出語を無制限に増やさず、既習語と模試の弱点を優先する",
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
          "朝 15 分：当サイトの「復習モード」でお気に入り単語をフラッシュチェック（ログインが必要）",
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
          "受験票・証明写真・本人確認書類など、公式案内の持ち物を確認",
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
      { type: "h2", text: "このプランの狙い" },
      {
        type: "p",
        text: "狙いは、既習語をすぐ思い出せる状態へ戻し、語彙が原因の取りこぼしを減らすことです。新出語にも必要なものはありますが、直前期は模試で実際に迷った語を優先すると、確認範囲を具体的にできます。",
      },
      {
        type: "p",
        text: "この計画は開始例です。学習時間、現在の弱点、体調に合わせて量を減らして構いません。睡眠と当日の持ち物確認を優先し、最後の 1 週間で無理に全範囲を終わらせようとしないでください。",
      },
    ],
    sources: [
      {
        title: "公式教材・問題集",
        publisher: "IIBC（TOEIC Program 公式）",
        url: "https://www.iibc-global.org/toeic/support/prep.html",
        note: "本番形式を確認する公式教材の案内",
      },
      {
        title: "Spacing effects in learning: a temporal ridgeline of optimal retention",
        publisher: "Psychological Science / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/19076480/",
        note: "復習間隔と保持期間の関係",
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
    indexable: false,
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
  {
    slug: "semantic-search-guide",
    title: "「意味で探す」AI 検索の使い方｜日本語のイメージから TOEIC 単語にたどり着く",
    description:
      "単語一覧ページの「意味で探す」タブでは、「延期する」のような和訳や「感謝を伝えるメールで使う単語」のような場面の説明から、意味の近い収録単語を AI が探し出します。使い方と検索のコツ、利用時の注意点をまとめました。",
    category: "サイト紹介",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "「あの単語、日本語なら思い出せるのに英語が出てこない」。当サイトの「意味で探す」は、収録 1,300 語以上から意味の近い候補を検索する機能です。和訳だけでなく、使いたい場面を日本語で書いて検索することもできます。",
      },
      { type: "h2", text: "「意味で探す」でできること" },
      {
        type: "p",
        text: "検索窓に入れるのは単語そのものでなくて構いません。代表的な使い方は次の 3 パターンです。",
      },
      {
        type: "table",
        headers: ["入力の仕方", "入力例", "ヒットする単語の例"],
        rows: [
          ["和訳から探す", "「延期する」", "postpone など"],
          [
            "場面・目的から探す",
            "「感謝を伝えるメールで使う単語」",
            "appreciate など",
          ],
          [
            "カテゴリから探す",
            "「お金の払い戻しに関する単語」",
            "refund、reimburse など",
          ],
        ],
      },
      {
        type: "p",
        text: "キーワードの文字一致ではなく意味の近さで探すため、収録語の和訳と同じ言葉でなくても候補が表示されることがあります。「集まりを後の日にずらす」のような説明文でも試せます。",
      },
      { type: "h2", text: "使い方" },
      {
        type: "ol",
        items: [
          "単語一覧ページを開き、検索エリアのタブを「英単語で探す」から「意味で探す」に切り替える",
          "日本語（または英語）で、探したい意味や場面を入力して検索する",
          "関連度順に最大 10 語のカードが並ぶので、気になる単語をタップして詳細ページへ",
        ],
      },
      {
        type: "p",
        text: "トップページの上部にも同じ検索の入口を置いています。思い立ったときはそちらからどうぞ。",
      },
      { type: "h2", text: "仕組みをざっくり" },
      {
        type: "p",
        text: "裏側では、収録単語それぞれの語義・類義語・例文を AI（Google の embedding モデル）で数値のベクトルに変換し、専用のデータベースに保存しています。検索時は入力文も同じ方法でベクトル化し、意味が近い順に候補を返す仕組みです。いわゆるセマンティック検索で、英単語そのものを知らなくても目的の語にたどり着けるのはこのためです。",
      },
      {
        type: "callout",
        tone: "info",
        text: "検索した文章は、ベクトル化のために Google Gemini API へ送信されます。氏名やメールアドレスなどの個人情報、業務上の機密を含む文章は入力しないでください。",
      },
      { type: "h2", text: "ヒットしないときのコツ" },
      {
        type: "ul",
        items: [
          "一度に 1 つの意味だけを入れる。「延期して謝罪する」で候補が合わなければ、「延期する」「謝罪する」と分けて試す",
          "抽象的すぎる場合は少し具体的に。「ビジネスの単語」ではなく「値段の交渉で使う単語」",
          "関連度の低い候補しか出ないときは、収録 1,300 語以上の範囲外の可能性もあるため、近い意味に言い換えて再検索",
        ],
      },
      {
        type: "p",
        text: "レート制限は 1 分あたり 20 回です。普通に使う分には意識しなくて大丈夫ですが、同じ検索を連打してもヒットの質は変わらないので、言い換えを工夫する方が近道です。",
      },
      {
        type: "wordLinks",
        intro: "「意味で探す」の練習台にちょうどいい、逆引きしにくい単語たち：",
        words: [
          "postpone",
          "appreciate",
          "apologize",
          "refund",
          "reimburse",
          "negotiate",
          "notify",
          "confirm",
        ],
      },
      { type: "h2", text: "類義語の整理にも使える" },
      {
        type: "p",
        text: "単語の詳細ページを読んだあと、その和訳で「意味で探す」を検索してみてください。収録語の中から意味の近い候補が並ぶことがあるので、各詳細ページを開いて用法の違いを確認できます。検索結果は類義語辞典そのものではなく、関連度にもばらつきがあります。",
      },
    ],
    relatedSlugs: ["synonym-pairs-15", "word-rank-criteria"],
  },
  {
    slug: "listen-mode-guide",
    title: "聞き流しモード活用ガイド｜移動時間に TOEIC 単語を音声で確認",
    description: `「今日の ${TODAY_WORDS_COUNT} 単語」とお気に入りページの聞き流しモードは、単語→英語例文→日本語訳の順に音声を自動再生します。操作方法と復唱練習への取り入れ方を紹介します。`,
    category: "学習法",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 6,
    blocks: [
      {
        type: "p",
        text: "まとまった学習時間を取りにくいときにも使えるよう、聞き流しモードを用意しています。再生を 1 回押すと、単語・英語例文・日本語訳が順番に流れます。移動中など、画面を見続けにくい場面での確認に利用できます。",
      },
      { type: "h2", text: "聞き流しモードはどこにある？" },
      {
        type: "table",
        headers: ["場所", "再生対象", "向いている使い方"],
        rows: [
          [
            `「今日の ${TODAY_WORDS_COUNT} 単語」→ 聞き流し`,
            `その日の推奨 ${TODAY_WORDS_COUNT} 単語`,
            "朝のインプット。毎日入れ替わるので習慣にしやすい",
          ],
          [
            "「お気に入り」→ 聞き流し（ログインが必要）",
            "自分でお気に入り登録した単語",
            "覚えにくい単語だけを狙って反復",
          ],
        ],
      },
      {
        type: "p",
        text: "再生順はどちらも共通で、単語の発音 → 英語例文 → 例文の日本語訳。1 語分が終わると自動で次の単語に進みます。",
      },
      { type: "h2", text: "音と綴りの対応を確認する" },
      {
        type: "p",
        text: "綴りから想像した発音と実際の音が違うと、意味を知っていても音声では気づけないことがあります。単語と例文を続けて再生し、音と綴り、文中での聞こえ方を照合する練習に使ってください。",
      },
      {
        type: "wordLinks",
        intro: "音と綴りのギャップが大きく、耳から覚える価値が特に高い単語の例：",
        words: [
          "itinerary",
          "warranty",
          "venue",
          "colleague",
          "representative",
          "laboratory",
        ],
      },
      { type: "h2", text: "シャドーイングに発展させる" },
      {
        type: "ol",
        items: [
          "1 周目はただ聞く。知らない単語があっても止めない",
          "2 周目は英語例文の直後に、聞こえたままを小声で復唱する（テキストは見ない）",
          "口が回らなかった単語は詳細ページを開き、再生ボタンで単語と例文を個別に繰り返す",
          "数日後に同じリストをもう一度流して、口が覚えているか確かめる",
        ],
      },
      {
        type: "p",
        text: "周囲の安全や迷惑にならない場所で、無理のない範囲で復唱してください。口に出せない環境では、テキストを見ながら音と綴りを照合するだけでも構いません。後で静かな場所で発音を確認できます。",
      },
      {
        type: "callout",
        tone: "tip",
        text: "お気に入りが増えたら、まず少数の語で 1 周して所要時間を確認してください。長すぎる場合は、現在覚えにくい語だけをお気に入りに残すなど、扱いやすい量へ調整できます。",
      },
      { type: "h2", text: "おすすめの 1 日ルーティン" },
      {
        type: "p",
        text: `朝に「今日の ${TODAY_WORDS_COUNT} 単語」を 1 周し、後で学習モードを使って意味を思い出せるか確認する、という組み合わせから始められます。所要時間は語数・例文・再生回数で変わるため、続けられる回数に調整してください。聞き流しだけで覚えたと判断せず、答えを隠して思い出す確認も組み合わせます。`,
      },
    ],
    relatedSlugs: ["listening-pre-read", "forgetting-curve"],
  },
  {
    slug: "confusing-word-pairs",
    title: "紛らわしい英単語 12 グループ｜adapt と adopt、assure と ensure",
    description:
      "綴りが似ている、意味が重なるなど、当サイトの収録語から混同しやすい 12 グループを取り上げ、通常の用法と見分ける手掛かりを整理しました。",
    category: "語彙集",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 8,
    blocks: [
      {
        type: "p",
        text: "TOEIC の語彙問題では、「知らない単語」より「知っているつもりの単語」で失点するパターンがあります。adapt を選ぶべき所で adopt を選ぶ、といった取り違えです。ここでは当サイトの収録語を中心に、混同事故が起きやすい 12 組をまとめました。",
      },
      { type: "h2", text: "綴りが似ていて事故る 6 組" },
      { type: "h3", text: "adapt（適応させる）／ adopt（採用する）" },
      {
        type: "p",
        text: "adapt は環境や状況に合わせて「変える」、adopt は案や方針を「取り入れる」。adapt to a new environment（新しい環境に適応する）、adopt a new policy（新方針を採用する）。真ん中が a なら adjust の仲間（合わせる）、o なら choose の仲間（選び取る）と覚えると混ざりません。",
      },
      { type: "h3", text: "expand（拡大する）／ expend（費やす）" },
      {
        type: "p",
        text: "expand は事業や規模を広げる（expand the business）、expend は時間やエネルギーを費やすフォーマルな語です。名詞形 expansion も一緒に確認し、a と e の綴りを区別してください。",
      },
      { type: "h3", text: "personal（個人の）／ personnel（人事・職員）" },
      {
        type: "p",
        text: "綴りは n の数と l の位置、音はアクセントで区別します。personal は最初、personnel は最後を強く読みます。personal information（個人情報）と personnel department（人事部）のように、名詞との組み合わせで確認できます。",
      },
      { type: "h3", text: "principal（主要な）／ principle（原則）" },
      {
        type: "p",
        text: "-pal で終わる principal には『主要な』という形容詞用法があり、principal reason は『主な理由』です。-ple の principle は『原則・主義』という名詞です。文中で必要な品詞と意味の両方を確認します。",
      },
      { type: "h3", text: "complement（補完する）／ compliment（褒め言葉）" },
      {
        type: "p",
        text: "e の complement は complete（完全にする）の親戚で、足りない部分を補う意味。i の compliment は褒め言葉です。ワインが料理を complement する、上司から compliment をもらう、と場面ごと覚えてしまいましょう。",
      },
      { type: "h3", text: "proceed（進む）／ precede（先行する）" },
      {
        type: "p",
        text: "proceed は『進む』、precede は『先行する』です。Please proceed to Gate 12（12 番ゲートへお進みください）、The meeting will be preceded by lunch（会議に先立って昼食があります）のように、方向と順序の違いを例文で確認します。",
      },
      { type: "h2", text: "意味が重なって迷う 4 組" },
      { type: "h3", text: "assure ／ ensure ／ insure" },
      {
        type: "p",
        text: "assure は人を安心させる、ensure は結果を確実にする、insure は保険をかける、というのがよくある型です。I assure you、ensure the quality、insure the building のように目的語との組み合わせを確認してください。文脈による用法もあるため、人・事だけで機械的に確定はしません。",
      },
      { type: "h3", text: "affect（影響する：動詞）／ effect（影響：名詞）" },
      {
        type: "p",
        text: "一般的な用法では affect は動詞、effect は名詞です。affect sales と have an effect on sales のように対応させて覚えられます。effect にも『もたらす』という動詞用法があるため、品詞だけでなく文脈も確認します。",
      },
      { type: "h3", text: "considerable（かなりの）／ considerate（思いやりのある）" },
      {
        type: "p",
        text: "considerable expense は『かなりの出費』、considerate person は『思いやりのある人』です。considerate action のように配慮のある言動も表せるため、『人にだけ使う』とは限りません。量・程度か、配慮かを文脈で分けます。",
      },
      { type: "h3", text: "economic（経済の）／ economical（経済的な・お得な）" },
      {
        type: "p",
        text: "economic growth（経済成長）は国や市場の話、economical car（燃費のいい車）は家計にやさしいという話。日本語の「経済的」が後者に引っ張られやすいので、economic ＝「経済という分野の」と直訳気味に押さえておくと安全です。",
      },
      { type: "h2", text: "語尾が同じで意味が違う形容詞 2 組" },
      { type: "h3", text: "efficient ／ sufficient ／ proficient" },
      {
        type: "p",
        text: "efficient は『効率的な』、sufficient は『十分な』、proficient は『熟達した』（be proficient in 〜）です。語尾が似ていても意味が異なるため、efficient process、sufficient time、proficient in English のように後ろの語まで含めて確認します。",
      },
      { type: "h3", text: "extensive（広範な）／ intensive（集中的な）" },
      {
        type: "p",
        text: "ex-（外へ広く）と in-（内へ濃く）。extensive research は範囲の広い調査、intensive training は短期集中の研修です。広さの extensive、濃さの intensive と対で覚えてしまうのが早道です。",
      },
      {
        type: "callout",
        tone: "tip",
        text: "似た語で迷ったら、①空所に必要な品詞、②目的語や修飾先、③文全体の意味、の順で候補を絞ります。単純な暗記ルールには例外があるため、最後に文脈が自然かを確認してください。",
      },
      {
        type: "wordLinks",
        intro:
          "今回取り上げた単語のうち当サイトに収録があるもの（詳細ページで例文と音声を確認できます）：",
        words: [
          "adapt",
          "adopt",
          "expand",
          "personnel",
          "principal",
          "complement",
          "compliment",
          "proceed",
          "assure",
          "ensure",
          "affect",
          "considerable",
          "economic",
          "efficient",
          "sufficient",
          "proficient",
          "extensive",
          "intensive",
        ],
      },
    ],
    relatedSlugs: ["synonym-pairs-15", "part5-frequent-words"],
  },
  {
    slug: "prefix-suffix-guide",
    title: "接頭辞・接尾辞で TOEIC 語彙を増やす｜初見の単語を「推測できる」武器にする",
    description:
      "pre- は「前もって」、sub- は「下に」——パーツの意味を知っていると、初見の単語でも意味の見当がつきます。当サイトの収録語から例を挙げながら、語彙を点ではなく面で増やす方法をまとめました。",
    category: "語彙集",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "収録 1,300 語以上を学ぶとき、接頭辞・語根・接尾辞は、未知語の意味や品詞を推測する手掛かりになります。推測だけで答えを確定せず、文脈と辞書的な意味を確認する前提で使います。",
      },
      { type: "h2", text: "まず押さえたい接頭辞 8 つ" },
      {
        type: "table",
        headers: ["接頭辞", "核のイメージ", "収録語の例"],
        rows: [
          [
            "pre-",
            "前もって",
            "predict（予測する）、prevent（防ぐ）、preliminary（予備の）",
          ],
          [
            "re-",
            "再び・元へ",
            "renew（更新する）、revise（改訂する）、refund（返金する）",
          ],
          [
            "ex-",
            "外へ",
            "export（輸出する）、exceed（超える）、exclude（除外する）",
          ],
          [
            "sub-",
            "下に",
            "submit（提出する）、subsequent（その後の）、subsidiary（子会社）",
          ],
          [
            "trans-",
            "越えて移す",
            "transfer（移す・異動する）、transform（一変させる）、transaction（取引）",
          ],
          [
            "pro-",
            "前へ",
            "promote（昇進させる）、propose（提案する）、prospect（見込み）",
          ],
          [
            "con- / com-",
            "共に",
            "confirm（確認する）、comply（従う）、consolidate（統合する）",
          ],
          [
            "in- / im-",
            "中へ",
            "include（含める）、impose（課す）、inspect（詳しく調べる）",
          ],
        ],
      },
      {
        type: "p",
        text: "re- には『再び・元へ』というイメージがあり、renew（更新する）、revise（改訂する）、reschedule（予定を組み直す）などを関連付ける手掛かりになります。ただし、現代の綴りを単純に分割できない語もあるため、暗記用の仮説として使ってください。",
      },
      { type: "h2", text: "品詞を見分ける接尾辞" },
      {
        type: "p",
        text: "接尾辞は品詞を推測する手掛かりになります。例外や複数の品詞を持つ語もあるため、空所の位置と文全体の意味を合わせて確認してください。",
      },
      {
        type: "table",
        headers: ["接尾辞", "品詞", "収録語の例"],
        rows: [
          [
            "-tion / -sion",
            "名詞になることが多い",
            "transaction（取引）、reservation（予約）",
          ],
          [
            "-ent / -ient",
            "形容詞が中心",
            "efficient（効率的な）、sufficient（十分な）、proficient（熟達した）",
          ],
          [
            "-able / -ible",
            "形容詞になることが多い",
            "available（利用できる）、eligible（資格がある）、favorable（好意的な）",
          ],
          [
            "-ive",
            "形容詞になることが多い",
            "extensive（広範な）、intensive（集中的な）、alternative（代わりの）",
          ],
          ["-ize", "動詞になることが多い", "emphasize（強調する）"],
        ],
      },
      { type: "h2", text: "「推測」の練習をしてみる" },
      {
        type: "p",
        text: "たとえば preliminary の pre- から『本番より前の段階』を連想し、『予備の』という意味を推測できます。推測は仮説にとどめ、詳細ページや辞書で答え合わせをしてください。推測が外れた語ほど、例文と一緒に記録しておくと次の確認点になります。",
      },
      {
        type: "callout",
        tone: "warning",
        text: "接頭辞の知識は万能ではありません。たとえば invaluable は「価値がない」ではなく「計り知れないほど貴重な」です。推測はあくまで仮説として、語義を確認する習慣とセットで使ってください。",
      },
      {
        type: "wordLinks",
        intro: "本文で取り上げた収録語（クリックで語義・例文・音声を確認できます）：",
        words: [
          "predict",
          "prevent",
          "preliminary",
          "renew",
          "revise",
          "refund",
          "reimburse",
          "submit",
          "subsequent",
          "subsidiary",
          "transfer",
          "transform",
          "transaction",
          "exceed",
          "exclude",
          "promote",
          "propose",
          "efficient",
          "eligible",
          "emphasize",
        ],
      },
    ],
    relatedSlugs: ["part5-frequent-words", "toeic-vocab-by-score"],
  },
  {
    slug: "toeic-collocations",
    title: "コロケーションで覚えるビジネス英語｜単語を組み合わせで確認",
    description:
      "submit a proposal、issue a refund、extend the deadline など、ビジネス場面で使われる動詞と名詞の組み合わせを、当サイトの収録語をもとに整理しました。",
    category: "語彙集",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    estimatedReadingMin: 7,
    blocks: [
      {
        type: "p",
        text: "単語の意味を知っていても、どの名詞・動詞と自然に組み合わさるか迷うことがあります。ビジネス英語で使われる一定の語の組み合わせ（コロケーション）をまとまりで確認すると、例文の文脈を理解する手掛かりになります。",
      },
      { type: "h2", text: "会議・予定の場面" },
      {
        type: "table",
        headers: ["コロケーション", "意味", "使用場面"],
        rows: [
          ["attend a conference", "会議に出席する", "会議・研修"],
          ["schedule an appointment", "面会の予定を入れる", "日程調整"],
          ["postpone the meeting", "会議を延期する", "予定変更"],
          ["reschedule the appointment", "予定を組み直す", "予定変更"],
          ["confirm a reservation", "予約を確認する", "予約・出張"],
        ],
      },
      { type: "h2", text: "書類・契約の場面" },
      {
        type: "table",
        headers: ["コロケーション", "意味", "使用場面"],
        rows: [
          ["submit a proposal", "企画書を提出する", "提案"],
          ["revise the contract", "契約書を修正する", "契約"],
          ["sign the agreement", "契約書に署名する", "契約"],
          ["issue an invoice", "請求書を発行する", "請求"],
          ["follow the procedure", "手順に従う", "業務手順"],
        ],
      },
      { type: "h2", text: "お金の場面" },
      {
        type: "table",
        headers: ["コロケーション", "意味", "使用場面"],
        rows: [
          ["issue a refund", "返金する", "返金対応"],
          ["reimburse travel expenses", "出張費を払い戻す", "経費精算"],
          ["exceed the budget", "予算を超える", "予算管理"],
          ["negotiate a contract", "契約条件を交渉する", "交渉"],
          ["ask for an estimate", "見積もりを依頼する", "見積もり"],
        ],
      },
      { type: "h2", text: "顧客対応の場面" },
      {
        type: "table",
        headers: ["コロケーション", "意味", "使用場面"],
        rows: [
          ["handle a complaint", "苦情に対応する", "顧客対応"],
          ["apologize for the delay", "遅れを詫びる", "謝罪"],
          ["extend the deadline", "締め切りを延長する", "納期調整"],
          ["meet the deadline", "締め切りに間に合わせる", "進捗管理"],
          ["notify customers of the change", "変更を顧客に知らせる", "告知"],
        ],
      },
      {
        type: "p",
        text: "meet the deadline と extend the deadline のように、同じ名詞を軸に複数の動詞を並べると違いを比較できます。例文では、誰が期限に間に合わせるのか、誰が期限を延長するのかも確認してください。",
      },
      { type: "h2", text: "コロケーションの覚え方" },
      {
        type: "p",
        text: "当サイトの単語詳細ページには、ビジネス場面を想定した AI 生成例文と音声再生ボタンがあります。表で気になった単語は詳細ページを開き、前後の語を含めて確認してください。聞き流しモードでは例文の音も続けて再生できます。",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Part 5 では、空所前後の語との組み合わせが判断材料になる場合があります。ただし、コロケーションだけで確定せず、品詞・文法・文全体の意味も合わせて確認してください。",
      },
      {
        type: "wordLinks",
        intro: "表に登場した収録語の一覧：",
        words: [
          "attend",
          "conference",
          "schedule",
          "appointment",
          "postpone",
          "reschedule",
          "confirm",
          "reservation",
          "submit",
          "proposal",
          "revise",
          "contract",
          "agreement",
          "issue",
          "invoice",
          "procedure",
          "refund",
          "reimburse",
          "exceed",
          "budget",
          "expense",
          "negotiate",
          "estimate",
          "complaint",
          "apologize",
          "extend",
          "deadline",
          "notify",
        ],
      },
    ],
    relatedSlugs: ["business-vocab-essentials", "part5-frequent-words"],
  },
];

export function getGuideArticleBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return getPublishedGuideArticles().map((a) => a.slug);
}

export function getPublishedGuideArticles(): GuideArticle[] {
  return GUIDE_ARTICLES.filter((article) => article.indexable !== false);
}

export const PUBLISHED_GUIDE_ARTICLE_COUNT =
  getPublishedGuideArticles().length;

export function getLatestGuideArticles(
  limit = PUBLISHED_GUIDE_ARTICLE_COUNT,
): GuideArticle[] {
  return getPublishedGuideArticles()
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
