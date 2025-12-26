import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 48,
  height: 48,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e40af",
          borderRadius: 10,
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        T
      </div>
    ),
    size
  );
}

