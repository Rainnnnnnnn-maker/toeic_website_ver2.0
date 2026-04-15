import { BookOpen } from "lucide-react";

type Props = {
  level?: 'important' | 'medium' | 'high';
};

export function StudyAdvice({ level }: Props) {
  if (!level) return null;

  const advice = {
    important: {
      title: "600点突破のコツ",
      content: "この単語はTOEIC頻出の最重要語です。Part 1（写真描写）からPart 7（長文読解）まであらゆるパートで登場します。まずは「英単語を見たら1秒で日本語の意味が浮かぶ」状態を目指し、例文の音声を聞きながら音読（シャドーイング）を繰り返しましょう。"
    },
    medium: {
      title: "730〜800点突破のコツ",
      content: "このレベルの単語は、Part 7の長文読解において言い換え（パラフレーズ）問題のキーになることが多いです。単語単体ではなく、類義語やコロケーション（よく使われるフレーズ）とセットで覚えることで、読解スピードと正答率が飛躍的に向上します。"
    },
    high: {
      title: "800点以上を目指す方へ",
      content: "出現頻度はやや下がりますが、長文の決定的な手がかりになる上級単語です。ビジネスの専門的な文脈（法律、金融、人事など）で使われることが多いため、AI解説の「ニュアンス」や「場面」をしっかり確認し、実際のTOEIC形式の長文を意識して学習しましょう。"
    }
  };

  const { title, content } = advice[level];

  return (
    <section className="flex flex-col gap-2 mt-2">
      <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
        <span className="w-0.5 h-2.5 bg-pink-500 rounded-full"></span>
        学習アドバイス（{title}）
      </h2>
      <div className="bg-pink-50/50 rounded-lg p-4 border border-pink-100 flex gap-3 items-start">
        <BookOpen className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">
          {content}
        </p>
      </div>
    </section>
  );
}
