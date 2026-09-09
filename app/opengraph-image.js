import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#020617",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "9999px",
              backgroundColor: "#f4711f",
            }}
          />
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Circle T
          </span>
        </div>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            flexDirection: "column",
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          <span>Monitoring armada truk</span>
          <span>berbasis AI</span>
        </div>
        <div
          style={{
            marginTop: "24px",
            fontSize: "30px",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size }
  );
}
