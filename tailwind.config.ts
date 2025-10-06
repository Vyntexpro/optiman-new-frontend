import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2F4058",
        gray: "#3E4553",
        red: "#FF746C",
        lightred: "#ffd5d359",
        lightgray: "#F1F5F9",
        light: "#7c7c7cff",
        softgreen: "#70c77791",
        darkgreen: "#309939ff",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".page-container": {
          "@apply overflow-auto min-h-screen px-[50px] pb-10 pt-[20px] ml-[210px] bg-slate-50":
            {},
        },
        ".input-style": {
          "@apply w-full !h-[40px] px-2 !text-[10px] mt-[2px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-primary placeholder:text-[10px] placeholder-slate-500":
            {},
        },
        ".nodatatext": {
          "@apply text-[10px] text-slate-500 font-medium py-2 px-2": {},
        },

        ".select-style": {
          "@apply w-full !cursor-pointer !text-[10px] hover:bg-slate-200/50 data-[highlighted]:bg-slate-200/50 data-[state=checked]:bg-slate-200/50":
            {},
        },
      });
    },
  ],
} satisfies Config;
