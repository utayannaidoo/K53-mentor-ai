import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      screens: {
        // The landing "How it works" board pins two columns to the viewport, so
        // it needs tablet width *and* enough height to hold them without
        // clipping. A width-only `lg` check left iPad portrait (820px wide,
        // ~1060 tall) on the cramped stacked layout while a short landscape
        // window at 1100px got the board and clipped it.
        //
        // The floor is width-dependent, because how much height the board needs
        // depends on how wide its two columns are: at 1366px the step bodies
        // sit on two lines and the row is ~405px tall (~477px with the nav
        // offset), while at 768px they wrap to three and it grows to ~488px
        // (~560px). One flat 620px floor priced desktops out of a layout they
        // fit comfortably — a short laptop window got the phone stack — so wide
        // viewports now qualify from 500px of height and only genuinely narrow
        // ones still have to clear 600px.
        board: {
          raw: "(min-width: 1024px) and (min-height: 500px), (min-width: 768px) and (min-height: 600px)",
        },
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          light: "hsl(var(--primary-light) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1rem" }],
        xs: ["0.8125rem", { lineHeight: "1.125rem" }],
        sm: ["0.875rem", { lineHeight: "1.375rem" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.5rem", { lineHeight: "1.3" }],
        "2xl": ["2rem", { lineHeight: "1.2" }],
        "3xl": ["2.5rem", { lineHeight: "1.15" }],
        "4xl": ["3.5rem", { lineHeight: "1.05" }],
      },
      boxShadow: {
        soft: "0 1px 2px hsl(222 45% 24% / 0.05), 0 6px 20px -8px hsl(222 45% 24% / 0.10)",
        "soft-lg": "0 2px 6px hsl(222 45% 24% / 0.06), 0 18px 48px -16px hsl(222 45% 24% / 0.14)",
        glass: "inset 0 1px 0 hsl(0 0% 100% / 0.5), 0 14px 38px -22px hsl(222 45% 24% / 0.5)",
        elevate: "0 24px 50px -26px hsl(222 45% 24% / 0.5)",
        float: "inset 0 1px 0 hsl(0 0% 100% / 0.55), 0 34px 80px -36px hsl(222 45% 24% / 0.5)",
        ring: "0 0 0 4px hsl(var(--primary) / 0.14)",
      },
      transitionTimingFunction: {
        glass: "cubic-bezier(0.22, 1, 0.36, 1)",
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.3, 0.64, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "blur-in": {
          from: { opacity: "0", filter: "blur(10px)", transform: "translateY(8px)" },
          to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        "route-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "flip-in": {
          from: { transform: "rotateY(90deg)", opacity: "0" },
          to: { transform: "rotateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        // The road moves, the vehicle holds. Travelling exactly one dash period
        // (12px dash + 12px gap) means the strip lands where it started, so the
        // loop has no visible reset — and no base transform to restore, which
        // is what keeps it correct once reduced motion stops it dead.
        drive: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-24px)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-1.5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "blur-in": "blur-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "flip-in": "flip-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        route: "route-in 0.24s cubic-bezier(0.22, 1, 0.36, 1) both",
        "modal-in": "scale-in 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        drive: "drive 0.6s linear infinite",
        bob: "bob 0.9s ease-in-out infinite",
        // Held invisible for 350ms so a warm route — which resolves in about
        // 100–300ms — shows nothing at all rather than one frame of vehicle.
        // `both` is what keeps it at opacity 0 through the delay.
        "fade-in-delayed": "fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
