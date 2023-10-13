import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        lightTheme: {
          primary: "#2c5af4",
          secondary: "#edd607",
          accent: "#3910a8",
          neutral: "#231b31",
          "base-100": "#e7e1ea",
          info: "#a3b2e1",
          success: "#1f894a",
          warning: "#efb86b",
          error: "#e25074",
        },
      },
    ],
  },
};
export default config;
