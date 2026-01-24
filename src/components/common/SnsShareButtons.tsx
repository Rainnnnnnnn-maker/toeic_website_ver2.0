"use client";

import { XIcon, FacebookIcon } from "react-share";

type Props = {
  url: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
};

export const SnsShareButtons = ({ url, title, className, style }: Props) => {
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(title)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        gap: "12px",
        ...style,
      }}
    >
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitterでシェア"
      >
        <XIcon size={32} round />
      </a>
      <a
        href={facebookShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebookでシェア"
      >
        <FacebookIcon size={32} round />
      </a>
    </div>
  );
};
