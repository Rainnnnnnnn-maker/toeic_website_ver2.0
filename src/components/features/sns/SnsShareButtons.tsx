"use client";

import {
  TwitterShareButton,
  FacebookShareButton,
  LineShareButton,
  XIcon,
  FacebookIcon,
  LineIcon,
  // HatenaShareButton,
  // HatenaIcon,
} from "react-share";

type Props = {
  url: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
};

export const SnsShareButtons = ({ url, title, className, style }: Props) => {
  const handleTwitterClick = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleFacebookClick = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        gap: "12px",
        ...style,
      }}
    >
      <TwitterShareButton
        url={url}
        title={title}
        openShareDialogOnClick={false}
        onClick={handleTwitterClick}
      >
        <XIcon size={32} round />
      </TwitterShareButton>

      <FacebookShareButton
        url={url}
        openShareDialogOnClick={false}
        onClick={handleFacebookClick}
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <LineShareButton url={url} title={title}>
        <LineIcon size={32} round />
      </LineShareButton>

      {/* <HatenaShareButton url={url} title={title}>
        <HatenaIcon size={32} round />
      </HatenaShareButton> */}
    </div>
  );
};
