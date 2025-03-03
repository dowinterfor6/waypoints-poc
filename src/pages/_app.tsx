import "@/styles/globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import type { AppProps } from "next/app";

import dynamic from "next/dynamic";
import React from "react";

/**
 * Used for globally accessible components, layouts, styles and structures
 */
const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

// Disable SSR since this is a simple SPA with lots of browser API dependency
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
