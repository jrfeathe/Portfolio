import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";

type OgImageOptions = {
  kicker?: string;
  title: string;
  description?: string;
};

const backgroundColor = "#0f1318";
const foregroundColor = "#f5f1e8";
const mutedColor = "#c6bfb1";
const accentColor = "#f0b24a";

const domainLabel = "jrfeathe.com";

export function buildOgImage({
  kicker,
  title,
  description
}: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor,
          color: foregroundColor
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {kicker ? (
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: accentColor
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              marginTop: kicker ? 24 : 0,
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                marginTop: 24,
                fontSize: 28,
                lineHeight: 1.4,
                color: mutedColor,
                maxWidth: "900px"
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ fontSize: 18, color: mutedColor }}>{domainLabel}</div>
          <div
            style={{
              width: 160,
              height: 6,
              backgroundColor: accentColor
            }}
          />
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_SIZE.width,
      height: OG_IMAGE_SIZE.height
    }
  );
}
