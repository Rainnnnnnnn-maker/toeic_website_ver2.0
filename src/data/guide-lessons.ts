import type { ArticleBlock } from "./guide-articles";

/** 自作教材。実際の試験問題・受験者の体験談ではありません。 */
export const GUIDE_LESSONS: Record<string, ArticleBlock[]> = {
  "part5-frequent-words": [
    { type: "h2", text: "5問で確認：構造と意味を両方使う" },
    { type: "p", text: "以下は本サイトで作成した練習問題です。公式問題の転載ではありません。まず選択肢を選び、空所の役割と選んだ理由を説明してから解説を開いてください。" },
    { type: "exercise", question: "1. The revised schedule was ___ distributed to all staff.", options: ["prompt", "promptly", "promptness", "prompting"], answer: 1, explanation: "B: promptly。was distributed は受動態で、配布のされ方を副詞で修飾します。Aは形容詞または動詞、Cは名詞、Dは分詞で、この構造の修飾語には合いません。意味は『改訂された予定表は速やかに全職員に配布された』です。" },
    { type: "exercise", question: "2. The ___ of the new system requires staff training.", options: ["implement", "implementation", "implemented", "implements"], answer: 1, explanation: "B: implementation。The implementation of the new system が主語で、requires が動詞です。Aは動詞、Cは過去形・分詞。Dは動詞の三人称単数現在形です。ここでは導入という行為を表す名詞 implementation を使います。『新システムの導入には職員研修が必要だ』。動詞の直前でも空所は副詞とは限りません。" },
    { type: "exercise", question: "3. All contractors must comply ___ the safety rules.", options: ["to", "with", "for", "at"], answer: 1, explanation: "B: with。comply with は規則などに従うという組み合わせです。A・C・Dはこの意味の comply に続く前置詞として合いません。『すべての請負業者は安全規則に従わなければならない』。comply の訳語だけでなく with the safety rules まで覚えます。" },
    { type: "exercise", question: "4. Sales increased ___ 12 percent compared with last year.", options: ["by", "to", "at", "of"], answer: 0, explanation: "A: by。ここでは売上の増加幅が12％です。to は到達した水準を示し、利益率が12％になった場合などに使います。at はこの増加幅を表さず、of も increase という動詞にこの形では続きません。『売上は前年に比べ12％増えた』。" },
    { type: "exercise", question: "5. Once your return is accepted, the store will ___ the purchase price.", options: ["refund", "attend", "arrive", "participate"], answer: 0, explanation: "A: refund。目的語の the purchase price（購入代金）を返金するという文意です。Bは会議等に出席する、Cは到着する、Dは参加するで、この目的語と文脈には合いません。『返品が受理されると、その店は購入代金を返金する』。" },
    { type: "h3", text: "間違えた理由を次の学習につなげる" },
    { type: "table", headers: ["迷った問題", "見直す箇所", "次の練習"], rows: [["1・2", "修飾語と主語の違い", "主語・動詞に印を付け、空所の役割を一言で説明"], ["3", "前置詞を含む組み合わせ", "comply with the rules を一組で想起"], ["4", "増加幅と到達点", "increase by 12% と increase to 12% を比較"], ["5", "動詞と目的語", "refund the purchase price の目的語を確認"]] },
  ],
  "confusing-word-pairs": [
    { type: "h2", text: "同じ場面で比較する自作例文" },
    { type: "table", headers: ["例文", "意味", "取り違えるとどう変わるか"], rows: [["We adopted a new policy.", "新方針を採用した", "adapted にすると、既存方針を状況に合わせて調整したという意味になる"], ["We adapted the policy to local needs.", "現地の必要に合わせ方針を調整した", "採用した事実ではなく、調整を述べている"], ["The supervisor assured us that the files were safe.", "上司はファイルが安全だと私たちに請け合った", "assure の直後はここでは人。ensure us that とはしない"], ["The new process ensures that files are backed up.", "新手順でファイルが確実にバックアップされる", "人への説明ではなく、結果を確実にする仕組みを述べる"]] },
    { type: "exercise", question: "The manager ___ the client that the order would arrive on time.", options: ["assured", "adopted", "adapted", "expanded"], answer: 0, explanation: "A: assured。assure 人 that節で相手に請け合う形です。残りの語は、この目的語とthat節の組み合わせに合いません。『マネージャーは注文品が時間どおり届くと顧客に請け合った』。" },
    { type: "exercise", question: "The new software will have a positive ___ on productivity.", options: ["affect", "effect", "effective", "effectively"], answer: 1, explanation: "B: effect。a positive effect という名詞句で、have an effect on は『〜に影響を与える』。Aのaffectは通常は動詞で、専門的な名詞用法もこの文意には合いません。Cは形容詞、Dは副詞です。" },
    { type: "p", text: "答えを覚えた後は、元の語を入れ替えると意味が変わるのか、文法的に不自然になるのかを分けて記録してください。adapt/adoptのように両方とも文法的には使えても、伝える内容が違う場合があります。" },
  ],
  "toeic-collocations": [
    { type: "h2", text: "短いメールを読んで組み合わせを確認" },
    { type: "p", text: "次は本サイトの自作例です。Dear Ms. Lee, Thank you for your proposal. Could you revise the delivery schedule and submit the updated proposal by Friday? We can extend the deadline if you need more time. Best regards, Maya" },
    { type: "p", text: "訳：Lee様、ご提案ありがとうございます。納品予定を修正し、更新した提案書を金曜日までに提出していただけますか。時間がさらに必要であれば、締め切りを延長できます。Maya" },
    { type: "table", headers: ["本文の表現", "役割", "別の動詞との違い"], rows: [["revise the delivery schedule", "予定の内容を修正する", "submitなら提出、confirmなら確認で、修正したことは表さない"], ["submit the updated proposal", "提案書を相手に提出する", "approveなら承認。提出者と承認者の行動を区別する"], ["extend the deadline", "締め切りを後ろへ延ばす", "meetなら締め切りを守る。postpone the deadlineよりextendがこの例に自然"]] },
    { type: "exercise", question: "Our accountant will ___ an invoice after the work is completed.", options: ["issue", "attend", "comply", "arrive"], answer: 0, explanation: "A: issue an invoice で『請求書を発行する』。残りの動詞はこの意味でinvoiceを目的語に取りません。『作業完了後、担当の経理スタッフが請求書を発行する』。" },
    { type: "exercise", question: "The company will reimburse employees ___ travel expenses.", options: ["for", "at", "to", "with"], answer: 0, explanation: "A: reimburse 人 for 費用。reimburse travel expenses のように費用を直接目的語にもできます。B・C・Dはここで費用の内容を導く前置詞として合いません。『会社は従業員に出張費を払い戻す』。" },
    { type: "p", text: "復習では動詞だけを隠します。『提案書を提出』『請求書を発行』『締め切りを延長』を英語で言い、目的語まで思い出せたら次へ進みます。組み合わせを覚えた後も、時制や主語との一致は文全体で確認してください。" },
  ],
  "forgetting-curve": [
    { type: "h2", text: "同じ語を追いかける7日間の例" },
    { type: "p", text: "最初に模試などで迷った3語を選び、お気に入りに保存します。下表は手元で記録するための開始例で、最適な日程を保証するものでも、アプリの自動予定をそのまま表したものでもありません。" },
    { type: "table", headers: ["日", "作業", "記録例"], rows: [["1日目", "意味・例文・音声を確認し、画面を閉じて意味を言う", "confirm：意味○、例文△"], ["2日目", "お気に入りから同じ3語を選び、答えを見る前に確認", "迷った語は意味を確認して再挑戦"], ["3日目", "前日に迷った語だけを短く確認", "新しい語を増やしすぎない"], ["4日目", "3語を例文の中で確認", "単独なら分かるが文中では迷う語を残す"], ["5日目", "復習を休むか、弱点語だけ確認", "予定を守るために既知語を何度も読む必要はない"], ["6日目", "音声を聞き、意味を答えてから文字を見る", "聞き取り△なら発音を確認"], ["7日目", "3語を再確認し、次に練習する内容を決める", "意味○／文中○／音声△のように記録"]] },
    { type: "h3", text: "忘れたとき・予定が空いたとき" },
    { type: "p", text: "思い出せなかった語は答えを確認し、翌日など短い間隔で再挑戦します。数日休んだ場合は過去の日程を全部消化せず、今の理解を確認して予定を組み直します。知っていた語を忘れることと、初めから意味を取り違えていたことは分けて記録してください。" },
    { type: "p", text: "ログイン中はマイページの『今日の復習』を使えます。本サイトは復習段階に応じて1・3・7・14・30日後を目安に次回日を決めます。これはアプリの運用ルールで、研究が全員に推奨する唯一の日程ではありません。ゲストはお気に入り一覧と下の記録欄で同じ語を追えます。" },
    { type: "table", headers: ["単語", "確認日", "意味／文中／音声", "次に確認すること"], rows: [["confirm（記入例）", "自分の学習日を記入", "○／△／○", "confirm receipt を例文で確認"], ["自分の単語", "", "", ""]] },
  ],
  "semantic-search-guide": [
    { type: "h2", text: "候補を学習につなげる実践手順" },
    { type: "p", text: "『お金を返す』だけで意図が合わなければ、『購入代金を返金する』と『出張費を精算する』に分けて検索します。refundとreimburseが候補に現れた場合も同義と決めつけず、詳細ページでお金を返す理由と目的語を比較してください。以下は練習用の入力例で、特定の結果や順位を保証しません。" },
    { type: "table", headers: ["入力例", "比較する観点", "うまく探せない場合"], rows: [["購入代金を返金する", "商品代金の返金か、立替経費の精算か", "『返金する』と短くする、英単語検索でrefundも確認"], ["会議を来週に延期する", "予定を後ろへ延ばすか、日時全般を変更するか", "『延期する』と『予定を変更する』を分ける"], ["延期して謝罪して返金する", "複数の行動が混ざっている", "『延期する』『謝罪する』『返金する』を別々に検索"]] },
    { type: "ol", items: ["検索前に『誰が何をするか』を一文で決める", "候補の訳語だけで選ばず、例文と目的語を読む", "似た候補を二つ比べ、自分の場面に合う理由を書く", "覚えたい語をお気に入りに保存し、後で意味を見ずに思い出す"] },
    { type: "p", text: "結果が0件でも、その意味の英単語が存在しないという意味ではありません。収録範囲や類似度の判定によって表示されないことがあります。通信エラーや利用回数の案内が出たときは、検索語の良し悪しと分けて考え、画面の案内に従って時間を空けてください。" },
  ],
  "toeic-vocab-by-score": [
  {
    "type": "h2",
    "text": "今日の学習範囲を決める"
  },
  {
    "type": "p",
    "text": "模試で迷った語を5語だけ書き出し、「意味が分からない」「品詞を取り違えた」「音では分からない」に分けます。知らない語ばかりなら基礎語の意味から、意味は分かるなら派生語・例文・音声へ時間を振り分けます。"
  },
  {
    "type": "h2",
    "text": "記録の読み方"
  },
  {
    "type": "p",
    "text": "同じ問題の解き直しで正解が増えても、答えを記憶していた可能性があります。別の例文で意味を説明できるかも確認し、スコア帯の表より自分の誤答を優先してください。"
  }
],
  "business-vocab-essentials": [
  {
    "type": "h2",
    "text": "一通のメールで役割を分ける"
  },
  {
    "type": "p",
    "text": "自作例：Please check the invoice and confirm the payment date.（請求書を確認し、支払日をご確認ください。）invoiceは請求内容を示す書類で、支払った証拠のreceiptとは役割が異なります。書類名を見たら、誰が何のために発行したかを確認します。"
  },
  {
    "type": "h2",
    "text": "確認してから次へ"
  },
  {
    "type": "p",
    "text": "issue an invoice、pay an invoice、keep a receiptを比べ、発行・支払い・保存のどの行動か説明してみてください。訳語を丸暗記するより、取引のどの段階にあるかを整理できます。"
  }
],
  "word-rank-criteria": [
  {
    "type": "h2",
    "text": "分類と理解度を分ける"
  },
  {
    "type": "p",
    "text": "highにある語を知っていても、importantの多義語を取り違えることはあります。表示ランクを自分の到達度と同一視せず、今読んでいる文で意味が分かるかを基準に復習語を選んでください。"
  }
],
  "exam-day-essentials": [
  {
    "type": "h2",
    "text": "前日に作る確認メモ"
  },
  {
    "type": "p",
    "text": "受験票の会場名・受付終了時刻・利用する交通経路を書き、持ち物は公式案内と一つずつ照合します。時計の使用可否や本人確認書類に迷う場合は、一般的な持ち物記事だけで判断せず、公式窓口の案内を確認してください。"
  }
],
  "part7-speed-reading": [
  {
    "type": "h2",
    "text": "自作の短い通知で根拠を探す"
  },
  {
    "type": "p",
    "text": "The workshop was originally scheduled for Monday. However, it has been moved to Wednesday because the trainer is unavailable on Monday.（研修はもともと月曜の予定でしたが、講師が月曜に都合がつかないため水曜に変更されました。）現在の開催日はWednesday。Mondayという語が二回出ても、現在の予定とは限りません。"
  },
  {
    "type": "h2",
    "text": "根拠を記録する"
  },
  {
    "type": "p",
    "text": "誤答ノートには「Wednesdayが正解」だけでなく「originallyは旧予定、has been moved toは変更後」と書きます。次の文書でも、提案と確定、旧日時と新日時を区別する練習になります。"
  }
],
  "listening-pre-read": [
  {
    "type": "h2",
    "text": "自分に合うか比較する記録"
  },
  {
    "type": "p",
    "text": "同じ音声を繰り返すと内容を覚えるため、先読みの効果だけは測れません。初めて解く別のセットで、正答数・聞き逃した箇所・先読みの量を記録します。難しさの差もあるので、一度の点差だけで方法を決めないでください。"
  }
],
  "synonym-pairs-15": [
  {
    "type": "h2",
    "text": "置き換えを自分で確かめる"
  },
  {
    "type": "p",
    "text": "自作例：The committee rejected the proposal.（委員会は提案を退けた。）rejectは不採用にすること、declineは申し出等を受けないことを表します。強く言ったか・丁寧に言ったかだけで語が自動的に決まるわけではありません。目的語と場面を確認します。"
  }
],
  "last-week-plan": [
  {
    "type": "h2",
    "text": "予定が遅れたときの縮小版"
  },
  {
    "type": "p",
    "text": "一日分を終えられなくても翌日に倍量を追加せず、模試で迷った語から3語だけ選び直します。意味と例文を確認できたら、その日の記録を終えて構いません。前日の仕上げより、受付時刻・持ち物の確認を優先します。"
  }
],
  "listen-mode-guide": [
  {
    "type": "h2",
    "text": "再生できないときの切り分け"
  },
  {
    "type": "p",
    "text": "最初に再生ボタンを自分で押し、端末の音量を確認します。画面に通信エラーや利用制限が出た場合は案内に従って再試行してください。画面ロックや別アプリへの切り替えで再生が止まることがあるため、バックグラウンド再生を保証する機能としては使わないでください。"
  },
  {
    "type": "h2",
    "text": "聞いた後に一語だけ確認"
  },
  {
    "type": "p",
    "text": "自分で選んだ一語について、音を聞いて意味を答え、例文を見て照合します。直後の復唱はリピーティングで、音声を少し遅れて追い続けるシャドーイングとは分けて考えます。"
  }
],
  "prefix-suffix-guide": [
  {
    "type": "h2",
    "text": "推測が外れる例も記録する"
  },
  {
    "type": "p",
    "text": "unhappyのun-は否定の手掛かりですが、understandの先頭を同じ否定接頭辞として分割してはいけません。綴りの一部が似ているだけの語もあります。語源説明と、学習用の語呂合わせ・推測は区別してください。"
  }
],
};
