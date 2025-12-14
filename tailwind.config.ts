import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nj: {
          pink: '#F48FB1', // The magic pink
          light: '#FCE4EC',
          text: '#4a4a4a',
        }
      },
    },
  },
  plugins: [],
};
export default config;