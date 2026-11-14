import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#061420",
        panel: "#102538",
        lagoon: "#68e3d5",
        foam: "#def9f1",
        warning: "#ffd07a",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
