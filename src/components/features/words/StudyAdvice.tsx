import { BookOpen } from "lucide-react";
import { shouldCollapseText } from "@/lib/word-detail-disclosure";
import { WordDetailSection } from "./WordDetailSection";

type Props = {
  level?: 'important' | 'medium' | 'high';
};

export function StudyAdvice({ level }: Props) {
  if (!level) return null;

  const advice = {
    important: {
      title: "基礎語の確認",
      content: "当サイトの学習順で基礎に分類した語です。まず主な意味を思い出し、例文のどこで使われているかを確認しましょう。音声を一度聞いてから同じ文を音読し、意味を説明できるか試してください。分類は公式の出題頻度や得点保証ではありません。"
    },
    medium: {
      title: "組み合わせを覚える",
      content: "訳語だけでなく、目的語・前置詞・よく使う表現を例文から一つ選んで覚えましょう。類義語は常に置き換えられるわけではありません。意味や文型の違いを確認し、自分が迷った表現をお気に入りに残してください。"
    },
    high: {
      title: "文脈を確かめる",
      content: "専門的な場面や細かな意味の違いに注意して読みたい語です。どの場面で何を指すのかを例文から説明してみましょう。基礎語に不安がある場合は、ランクにかかわらず模試で間違えた語を優先してください。"
    }
  };

  const { title, content } = advice[level];

  return (
    <WordDetailSection
      id="study-advice"
      title={`学習アドバイス（${title}）`}
      accentClassName="bg-pink-500"
      collapsible={shouldCollapseText(content)}
      preview={content}
    >
      <div className="bg-pink-50/50 rounded-lg p-4 border border-pink-100 flex gap-3 items-start">
        <BookOpen className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">
          {content}
        </p>
      </div>
    </WordDetailSection>
  );
}
