import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Stitch Corporate Modern Light Theme ──────────────────────
        "surface":                   "#f7f9fb",
        "surface-dim":               "#d8dadc",
        "surface-bright":            "#f7f9fb",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#f2f4f6",
        "surface-container":         "#eceef0",
        "surface-container-high":    "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface":                "#191c1e",
        "on-surface-variant":        "#45464d",
        "inverse-surface":           "#2d3133",
        "inverse-on-surface":        "#eff1f3",
        "outline":                   "#76777d",
        "outline-variant":           "#c6c6cd",
        "surface-tint":              "#565e74",
        "surface-variant":           "#e0e3e5",
        "background":                "#f7f9fb",
        "on-background":             "#191c1e",

        // ── Primary: Deep Black (nav / headings) ─────────────────────
        "primary":                   "#000000",
        "on-primary":                "#ffffff",
        "primary-container":         "#131b2e",
        "on-primary-container":      "#7c839b",
        "inverse-primary":           "#bec6e0",
        "primary-fixed":             "#dae2fd",
        "primary-fixed-dim":         "#bec6e0",
        "on-primary-fixed":          "#131b2e",
        "on-primary-fixed-variant":  "#3f465c",

        // ── Secondary: Vibrant Purple (AI / CTA) ─────────────────────
        "secondary":                 "#712ae2",
        "on-secondary":              "#ffffff",
        "secondary-container":       "#8a4cfc",
        "on-secondary-container":    "#fffbff",
        "secondary-fixed":           "#eaddff",
        "secondary-fixed-dim":       "#d2bbff",
        "on-secondary-fixed":        "#25005a",
        "on-secondary-fixed-variant":"#5a00c6",

        // ── Tertiary: Electric Cyan (data / success) ──────────────────
        "tertiary":                  "#000000",
        "on-tertiary":               "#ffffff",
        "tertiary-container":        "#001f26",
        "on-tertiary-container":     "#0090a9",
        "tertiary-fixed":            "#acedff",
        "tertiary-fixed-dim":        "#4cd7f6",
        "on-tertiary-fixed":         "#001f26",
        "on-tertiary-fixed-variant": "#004e5c",

        // ── Error ─────────────────────────────────────────────────────
        "error":                     "#ba1a1a",
        "on-error":                  "#ffffff",
        "error-container":           "#ffdad6",
        "on-error-container":        "#93000a",
      },
      borderRadius: {
        "sm":      "0.25rem",
        "DEFAULT": "0.5rem",
        "md":      "0.75rem",
        "lg":      "1rem",
        "xl":      "1.5rem",
        "full":    "9999px",
      },
      spacing: {
        "xs":            "4px",
        "sm":            "12px",
        "md":            "24px",
        "lg":            "48px",
        "xl":            "80px",
        "base":          "8px",
        "gutter":        "24px",
        "container-max": "1440px",
        // keep legacy aliases so existing pages don't break
        "margin-mobile":  "20px",
        "margin-desktop": "48px",
        "unit":           "8px",
      },
      fontFamily: {
        // ── Geist replaces Outfit / Inter ──────────────────────────
        "display-lg":         ["Geist", "sans-serif"],
        "headline-lg":        ["Geist", "sans-serif"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "headline-md":        ["Geist", "sans-serif"],
        "body-lg":            ["Geist", "sans-serif"],
        "body-md":            ["Geist", "sans-serif"],
        // ── JetBrains Mono for labels / data points ────────────────
        "label-md":           ["JetBrains Mono", "monospace"],
        "label-sm":           ["JetBrains Mono", "monospace"],
        // legacy aliases
        "display-xl":         ["Geist", "sans-serif"],
      },
      fontSize: {
        "display-lg":         ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg":        ["32px", { lineHeight: "1.2",  letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.2",  letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md":        ["24px", { lineHeight: "1.3",  letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg":            ["18px", { lineHeight: "1.6",  letterSpacing: "0em",     fontWeight: "400" }],
        "body-md":            ["16px", { lineHeight: "1.6",  letterSpacing: "0em",     fontWeight: "400" }],
        "label-md":           ["14px", { lineHeight: "1.4",  letterSpacing: "0.05em",  fontWeight: "500" }],
        "label-sm":           ["12px", { lineHeight: "1.4",  letterSpacing: "0.08em",  fontWeight: "500" }],
        // legacy
        "display-xl":         ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "600" }],
      },
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
};

export default config;
