import React, { FC, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MenuOpenOutlined, MenuOutlined } from "@mui/icons-material";
import DrawerContent from "./DrawerContent";
import { Loader } from "@googlemaps/js-api-loader";
import MapContainer from "./MapContainer";
import { Coordinate } from "@/types";

const MainContent: FC = () => {
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("sm"));

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(true);
  const [waypoints, setWaypoints] = useState<Array<Coordinate> | null>(null);

  /**
   * Ensure all required google maps libraries are loaded before attempting
   * to load dependent functionality. In a production app, this can be done in
   * a context to provide components, or evaluate the existing (React) wrapper
   * component/api packages for google maps.
   */
  const [googleMapsLibrary, setGoogleMapsLibrary] =
    useState<google.maps.MapsLibrary | null>(null);
  const [googleMarkerLibrary, setGoogleMarkerLibrary] =
    useState<google.maps.MarkerLibrary | null>(null);
  const [googleLibrary, setGoogleLibrary] = useState<typeof google | null>(
    null
  );

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

      // Helps with production build to ensure it's not trying to load a global
      // variable that doesn't exist.
      setGoogleLibrary(window.google);

      setIsGoogleMapsInitialized(true);
    } catch {
      console.error("Failed to initialize required google maps libraries");
      // We'll just show an infinite loader in the event of an error. Show a 
      // descriptive error/failure page for an actual web app.
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

  const additionalStyleProps = isMobileViewport
    ? {}
    : { display: "grid", gridTemplateColumns: "300px 1fr" };

  return (
    <Box
      component="main"
      className="main-content-container"
      sx={{ height: "100%", ...additionalStyleProps }}
    >
      {isMobileViewport && (
        <IconButton
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          sx={{
            zIndex: 1300,
            position: "absolute",
            top: 5,
            left: 5,
            backgroundColor: "#FFFFFFDD",
          }}
          size="large"
          disableRipple
        >
          {isMobileDrawerOpen ? <MenuOpenOutlined /> : <MenuOutlined />}
        </IconButton>
      )}
      <Drawer
        open={!isMobileViewport || isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        sx={{
          width: "80%",
          maxWidth: 300,
        }}
        slotProps={{
          paper: { sx: { width: "80%", maxWidth: 300 } },
          root: { keepMounted: true },
        }}
        variant={isMobileViewport ? "temporary" : "persistent"}
      >
        <DrawerContent
          setWaypoints={setWaypoints}
          isMobileViewport={isMobileViewport}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
        />
      </Drawer>
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        {isGoogleMapsInitialized &&
        googleLibrary &&
        googleMapsLibrary &&
        googleMarkerLibrary ? (
          <MapContainer
            googleLibrary={googleLibrary}
            mapsApi={googleMapsLibrary}
            markerApi={googleMarkerLibrary}
            waypoints={waypoints}
          />
        ) : (
          <CircularProgress size="50px" />
        )}
      </Box>
    </Box>
  );
};

export default MainContent;
