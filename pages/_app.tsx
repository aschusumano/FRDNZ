import "../styles/globals.css";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-frndz-background text-frndz-text font-frndz">
      <header className="px-6 py-4 shadow bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-frndz-primary">FRNDZ</h1>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
