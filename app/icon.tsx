import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon drawn from the brand mark: a wicket whose middle stump is a 1. */
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
          background: "#070c0b",
          border: "2px solid #f5a524",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <path d="M9.5 11v10M22.5 11v10" stroke="#f4f1e8" strokeWidth="2.5" />
          <path d="M8.5 10h15" stroke="#6f8278" strokeWidth="2" />
          <path d="M13.5 11 16 8.5V21" stroke="#f5a524" strokeWidth="3" />
        </svg>
      </div>
    ),
    size,
  );
}
