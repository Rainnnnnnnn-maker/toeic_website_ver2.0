'use client';

import { useEffect, useRef } from 'react';

type Props = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** 縮小を始める最大フォントサイズ（px）。className の font-size と揃える */
  maxSize?: number;
};

// 親要素の幅に収まるまでフォントサイズを段階的に縮小するテキスト。
// 最小サイズまで縮小しても収まらない場合は折り返しに切り替える。
export default function AutoResizingText({ text, className, style, maxSize = 48 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const adjustSize = () => {
      const el = ref.current;
      if (!el) return;

      const parent = el.parentElement;
      if (!parent || parent.clientWidth === 0) return;

      // 自然な幅を正確に測るため、幅制限や省略記号のスタイルを一時的に解除する
      el.style.maxWidth = 'none';
      el.style.overflow = 'visible';
      el.style.textOverflow = 'clip';
      el.style.whiteSpace = 'nowrap';

      let size = maxSize;
      el.style.fontSize = `${size}px`;

      const maxWidth = parent.clientWidth - 10;

      while (el.scrollWidth > maxWidth && size > 16) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }

      // 最小サイズでも収まらない場合は折り返す
      if (el.scrollWidth > maxWidth) {
        el.style.whiteSpace = 'normal';
        el.style.wordBreak = 'break-word';
      }
      el.style.maxWidth = '100%';
    };

    adjustSize();
    window.addEventListener('resize', adjustSize);
    return () => window.removeEventListener('resize', adjustSize);
  }, [text, maxSize]);

  return <span ref={ref} className={className} style={style}>{text}</span>;
}
