import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Component {...pageProps} />
    </div>
  );
}