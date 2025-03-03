import Head from "next/head";
import React, { FC } from "react";
import { MainContent } from "./components/MainContent";

const Home: FC = () => {
  return (
    <>
      <Head>
        <title>Waypoints POC</title>
        <meta
          name="description"
          content="Proof of concept learning new technology: Bun, Nextjs, and Google Maps API."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContent />
    </>
  );
};

export default Home;
