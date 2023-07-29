/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: { fontFamily: {
      lato: ["Lato", " sans-serif"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
     cred: {DEFAULT:"#661120"}
    },},
  },
  plugins: [],
}