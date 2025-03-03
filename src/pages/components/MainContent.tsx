import React, { FC, useEffect, useState } from "react";
import "@/styles/main-content.css";
import { Box, IconButton, SwipeableDrawer } from "@mui/material";
import { MenuOpenRounded, MenuRounded } from "@mui/icons-material";
import { DrawerContent } from "./DrawerContent";
import { Loader } from "@googlemaps/js-api-loader";

const MainContent: FC = () => {
  const [googleMapsLibrary, setGoogleMapsLibrary] =
    useState<google.maps.MapsLibrary | null>(null);
  const [googleMarkerLibrary, setGoogleMarkerLibrary] =
    useState<google.maps.MarkerLibrary | null>(null);
  const [isGoogleMapsInitialized, setIsGoogleMapsInitialized] = useState(false);

  const loadMapsLibraries = async (loader: Loader) => {
    try {
      // IIFE to shorthand create multiple promises to Promise.all
      await Promise.all([
        (async (): Promise<void> => {
          const maps = await loader.importLibrary("maps");
          setGoogleMapsLibrary(maps);
        })(),
        (async (): Promise<void> => {
          const marker = await loader.importLibrary("marker");
          setGoogleMarkerLibrary(marker);
        })(),
      ]);
    } catch {
      console.error("Failed to initialize maps or marker libraries");
    } finally {
      setIsGoogleMapsInitialized(true);
    }
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error("Google maps API key not found");
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    loadMapsLibraries(loader);
  }, []);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  return (
    <Box component="main" className="main-content-container">
      <IconButton
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        sx={{
          zIndex: 1300,
          position: "absolute",
          top: 5,
          left: 5,
        }}
        size="large"
      >
        {isDrawerOpen ? <MenuOpenRounded /> : <MenuRounded />}
      </IconButton>
      <SwipeableDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
        className="drawer"
        slotProps={{ paper: { sx: { width: "80%", maxWidth: 300 } } }}
      >
        <DrawerContent />
      </SwipeableDrawer>
      <section className="map-container">
        {!isGoogleMapsInitialized ? "LOADING" : "MAPS API LOADED"}
      </section>
    </Box>
  );
};

export { MainContent };
