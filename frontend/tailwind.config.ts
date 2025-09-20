import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(60px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(-5px) rotate(-1deg)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" }
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
          "70%": { transform: "scale(0.9)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "slide-up": {
          "0%": { transform: "translateY(100px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "rotate-in": {
          "0%": { transform: "rotate(-180deg) scale(0)", opacity: "0" },
          "100%": { transform: "rotate(0deg) scale(1)", opacity: "1" }
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" }
        },
        "morph": {
          "0%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" },
          "100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" }
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        },
        "flip-in": {
          "0%": { transform: "rotateY(-90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" }
        },
        "zoom-in": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "1" }
        },
        "elastic": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up": "fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-left": "fade-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-right": "fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "bounce-in": "bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "slide-up": "slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "rotate-in": "rotate-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "morph": "morph 8s ease-in-out infinite",
        "text-shimmer": "text-shimmer 2s linear infinite",
        "breathe": "breathe 3s ease-in-out infinite",
        "flip-in": "flip-in 0.6s ease-out",
        "zoom-in": "zoom-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "elastic": "elastic 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)"
      },
      boxShadow: {
        "card": "var(--shadow-card)",
        "floating": "var(--shadow-floating)",
        "glow": "var(--shadow-glow)",
        "soft": "var(--shadow-soft)"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
