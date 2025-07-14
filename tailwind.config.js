/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float1: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-24px) scale(1.08)" },
        },
        float2: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(22px) scale(1.06)" },
        },
        float3: {
          "0%, 100%": { transform: "translateX(0) scale(1)" },
          "50%": { transform: "translateX(18px) scale(1.05)" },
        },
        lightning1: {
          "0%, 100%": { opacity: 0.45, filter: "blur(0px)" },
          "35%": { opacity: 1, filter: "blur(2.3px)" },
          "60%": { opacity: 0.9, filter: "blur(1.3px)" },
        },
        lightning2: {
          "0%, 100%": { opacity: 0.37, filter: "blur(0px)" },
          "55%": { opacity: 1, filter: "blur(1.7px)" },
          "70%": { opacity: 0.7, filter: "blur(1px)" },
        }
      },
      animation: {
        float1: "float1 7s ease-in-out infinite",
        float2: "float2 8.5s ease-in-out infinite",
        float3: "float3 8.2s ease-in-out infinite",
        lightning1: "lightning1 2.9s linear infinite",
        lightning2: "lightning2 3.3s linear infinite",
      }
    }
  }
  ,
  plugins: [],
}
