module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        frndz: {
          primary: "#a78bfa",
          secondary: "#f9a8d4",
          background: "#fdf4ff",
          text: "#374151",
        },
      },
      fontFamily: {
        frndz: ["'Poppins'", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
      },
    },
  },
  plugins: [],
};
