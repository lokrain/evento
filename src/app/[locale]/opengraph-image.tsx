import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { readFile } from "fs/promises";
import path from "path";

import { OG_IMAGE_SIZE } from "@/lib/seo";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";
export const runtime = "nodejs";

const displayFontData = readFile(
  path.join(process.cwd(), "src/assets/fonts/PlovdivDisplay-Bold.otf"),
);
const sansFontData = readFile(
  path.join(process.cwd(), "src/assets/fonts/PlovdivSans.otf"),
);

type Stat = { label: string; value: string };

export default async function OpenGraphImage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "OpenGraphImage" });
  const [displayFont, sansFont] = await Promise.all([displayFontData, sansFontData]);

  const highlights = (t.raw("highlights") as string[] | undefined) ?? [];
  const stats = (t.raw("stats") as Stat[] | undefined) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          padding: "48px 56px",
          color: "#e2e8f0",
          background:
            "radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.18), transparent 30%), linear-gradient(135deg, #0b1021 0%, #0f172a 45%, #0b1536 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Plovdiv Sans",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 120%, rgba(147, 51, 234, 0.12), transparent 45%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 35%)",
          }}
        />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 40 }}>
          <div style={{ flex: 1.15, display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                width: "fit-content",
              }}
            >
              <span style={{ color: "#a5b4fc", fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>{t("pill")}</span>
              <span style={{ color: "#cbd5f5", fontSize: 16, letterSpacing: 0.4 }}>{t("eyebrow")}</span>
            </div>

            <div style={{ fontFamily: "Plovdiv Display", fontSize: 96, lineHeight: 1, color: "#f8fafc" }}>
              {t("title")}
            </div>

            <div style={{ fontSize: 32, color: "#c7d2fe", fontWeight: 700, letterSpacing: 0.5 }}>{t("tagline")}</div>
            <div style={{ fontSize: 22, color: "#cbd5f5", maxWidth: 640, lineHeight: 1.4 }}>{t("subtitle")}</div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {highlights.map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(12, 18, 40, 0.65)",
                    fontSize: 16,
                    letterSpacing: 0.2,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 0.9,
              background: "rgba(12,18,40,0.85)",
              borderRadius: 24,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ color: "#c7d2fe", fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
              {t("panelTitle")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: 14, letterSpacing: 0.4 }}>{stat.label}</div>
                  <div style={{ color: "#e2e8f0", fontSize: 26, fontWeight: 700, marginTop: 6 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#a5b4fc",
                boxShadow: "0 0 24px 6px rgba(165,180,252,0.45)",
              }}
            />
            <span style={{ color: "#c7d2fe", fontSize: 18, letterSpacing: 0.6 }}>{t("cta")}</span>
          </div>
          <span style={{ color: "#94a3b8", fontSize: 15, letterSpacing: 0.5 }}>{t("footerLine")}</span>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        {
          name: "Plovdiv Display",
          data: displayFont,
          weight: 700,
          style: "normal",
        },
        {
          name: "Plovdiv Sans",
          data: sansFont,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
