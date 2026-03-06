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
import { sendGAEvent } from "@next/third-parties/google";

type Props = {
  url: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
};

export const SnsShareButtons = ({ url, title, className, style }: Props) => {
  const handleTwitterClick = () => {
    sendGAEvent("event", "share", { method: "twitter", url });
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleFacebookClick = () => {
    sendGAEvent("event", "share", { method: "facebook", url });
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };

  const handleLineClick = () => {
    sendGAEvent("event", "share", { method: "line", url });
    // LineShareButton handles the window.open internally, but we can't easily intercept it without preventing default.
    // However, react-share's buttons don't expose an onClick that runs *before* opening.
    // Actually, react-share buttons accept onClick.
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

      <LineShareButton
        url={url}
        title={title}
        onClick={() => sendGAEvent("event", "share", { method: "line", url })}
      >
        <LineIcon size={32} round />
      </LineShareButton>

      {/* <HatenaShareButton url={url} title={title}>
        <HatenaIcon size={32} round />
      </HatenaShareButton> */}
    </div>
  );
};
