// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // ... suas configs existentes
  theme: {
    extend: {
      height: {
        'dvh': '100dvh',
        'svh': '100svh', 
        'lvh': '100lvh',
      },
      minHeight: {
        'dvh': '100dvh',
        'svh': '100svh',
        'lvh': '100lvh',
      },
      maxHeight: {
        'dvh': '100dvh',
        'svh': '100svh',
        'lvh': '100lvh',
      },
    },
  },
};

export default config;
