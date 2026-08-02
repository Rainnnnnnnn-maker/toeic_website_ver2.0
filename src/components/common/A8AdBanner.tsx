import { isAdsenseReviewMode } from "@/lib/adsense-review";

export const A8AdBanner468x60 = () => {
  // AdSense審査モード中はアフィリエイトバナーを出さない
  if (isAdsenseReviewMode()) {
    return null;
  }
  return (
    <div className="w-full flex justify-center my-6 px-4">
      <div
        className="relative inline-block w-full max-w-[468px] text-center"
        style={{ aspectRatio: "468 / 60" }}
      >
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B3N6X+FRE4AA+40GA+609HT"
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            style={{ border: 0 }}
            width="468"
            height="60"
            alt=""
            src="https://www28.a8.net/svt/bgt?aid=260510505953&wid=001&eno=01&mid=s00000018721001009000&mc=1"
            className="w-full h-auto"
          />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          style={{ border: 0, position: "absolute", width: 1, height: 1 }}
          width="1"
          height="1"
          src="https://www15.a8.net/0.gif?a8mat=4B3N6X+FRE4AA+40GA+609HT"
          alt=""
        />
      </div>
    </div>
  );
};

export const A8AdBanner728x90 = () => {
  if (isAdsenseReviewMode()) {
    return null;
  }
  return (
    <div className="w-full flex justify-center my-8 px-4">
      <div
        className="relative inline-block w-full max-w-[728px] text-center"
        style={{ aspectRatio: "728 / 90" }}
      >
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B3N6Y+6JSFM+3AQG+C3QQ9"
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            style={{ border: 0 }}
            width="728"
            height="90"
            alt=""
            src="https://www25.a8.net/svt/bgt?aid=260510506011&wid=001&eno=01&mid=s00000015388002033000&mc=1"
            className="w-full h-auto"
          />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          style={{ border: 0, position: "absolute", width: 1, height: 1 }}
          width="1"
          height="1"
          src="https://www18.a8.net/0.gif?a8mat=4B3N6Y+6JSFM+3AQG+C3QQ9"
          alt=""
        />
      </div>
    </div>
  );
};
