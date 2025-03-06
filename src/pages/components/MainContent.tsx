import React, { FC, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MenuOpenOutlined, MenuOutlined } from "@mui/icons-material";
import DrawerContent from "./Drawer/DrawerContent";
import MapContainer from "./Map/MapContainer";
import { Coordinate } from "@/types";
import GoogleMapsApiProvider from "../context/GoogleMapsApiContext";
import DrawerContextProvider from "../context/DrawerContext";

const MainContent: FC = () => {
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("sm"));

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(true);
  const [waypoints, setWaypoints] = useState<Array<Coordinate> | null>(null);

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
        <DrawerContextProvider
          setWaypoints={setWaypoints}
          isMobileViewport={isMobileViewport}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
        >
          <DrawerContent />
        </DrawerContextProvider>
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
        <GoogleMapsApiProvider waypoints={waypoints}>
          <MapContainer />
        </GoogleMapsApiProvider>
      </Box>
    </Box>
  );
};

export default MainContent;
