import type { Config } from "tailwindcss";

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
        "surface-container-lowest": "#100d16",
        "on-tertiary-fixed": "#301400",
        "outline-variant": "#4a4455",
        "on-error": "#690005",
        "primary-container": "#7c3aed",
        "surface-container-low": "#1d1a24",
        "on-secondary-fixed": "#001a42",
        "inverse-surface": "#e8dfee",
        "secondary-fixed": "#d8e2ff",
        "on-secondary": "#002e6a",
        "on-primary-container": "#ede0ff",
        "primary-fixed": "#eaddff",
        "inverse-on-surface": "#332f39",
        "surface-bright": "#3c3742",
        "surface-variant": "#37333e",
        "on-secondary-fixed-variant": "#004395",
        "on-background": "#e8dfee",
        "error": "#ffb4ab",
        "primary": "#d2bbff",
        "on-primary": "#3f008e",
        "on-surface-variant": "#ccc3d8",
        "surface-tint": "#d2bbff",
        "tertiary-container": "#a15100",
        "surface-container-high": "#2c2833",
        "tertiary-fixed": "#ffdcc6",
        "tertiary-fixed-dim": "#ffb784",
        "outline": "#958da1",
        "on-secondary-container": "#e6ecff",
        "surface-dim": "#15121b",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "background": "#15121b",
        "secondary-container": "#0566d9",
        "on-tertiary": "#4f2500",
        "on-primary-fixed-variant": "#5a00c6",
        "surface": "#15121b",
        "secondary-fixed-dim": "#adc6ff",
        "on-surface": "#e8dfee",
        "on-tertiary-container": "#ffe0cd",
        "inverse-primary": "#732ee4",
        "primary-fixed-dim": "#d2bbff",
        "on-primary-fixed": "#25005a",
        "surface-container-highest": "#37333e",
        "surface-container": "#221e28",
        "tertiary": "#ffb784",
        "secondary": "#adc6ff",
        "on-tertiary-fixed-variant": "#713700"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "20px",
        "container-max": "1280px",
        "unit": "8px",
        "margin-desktop": "48px",
        "gutter": "24px"
      },
      fontFamily: {
        "display-xl": ["Outfit"],
        "label-sm": ["JetBrains Mono"],
        "body-lg": ["Inter"],
        "headline-lg-mobile": ["Outfit"],
        "body-md": ["Inter"],
        "headline-md": ["Outfit"],
        "headline-lg": ["Outfit"]
      },
      fontSize: {
        "display-xl": ["64px", {"lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "headline-lg-mobile": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "500"}],
        "headline-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.01em", "fontWeight": "600"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};

export default config;
