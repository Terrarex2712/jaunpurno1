import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Jaunpur No.1 — Jaunpur ka community cricket tournament";

/**
 * Social card generated from the site's own design tokens. No third-party or
 * sponsor artwork is used here.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(140deg, #070c0b 0%, #0e1f1a 55%, #0b1512 100%)",
          padding: "72px 80px",
          color: "#f4f1e8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 14, height: 14, background: "#f5a524" }} />
          <div style={{ fontSize: 26, color: "#a6b6ac" }}>
            Jaunpur ka community cricket tournament
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>
            JAUNPUR
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 96,
                fontWeight: 900,
                letterSpacing: -3,
                color: "#f5a524",
                border: "4px solid rgba(245,165,36,0.5)",
                padding: "4px 24px",
              }}
            >
              NO.1
            </div>
            <div style={{ fontSize: 40, color: "#a6b6ac" }}>
              Jaunpur ka cricket. Jaunpur ki awaaz.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 56,
            borderTop: "2px solid #24463a",
            paddingTop: 28,
            fontSize: 28,
            color: "#a6b6ac",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "#f5a524", fontWeight: 700 }}>9</span> Vidhan Sabha
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "#f5a524", fontWeight: 700 }}>9</span> Selected teams
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "#f5a524", fontWeight: 700 }}>1</span> Grand tournament
          </div>
        </div>
      </div>
    ),
    size,
  );
}
