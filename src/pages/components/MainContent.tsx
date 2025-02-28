import React, { FC, useState } from "react";
import "@/styles/main-content.css";
import { Box, IconButton, SwipeableDrawer } from "@mui/material";
import { MenuOpenRounded, MenuRounded } from "@mui/icons-material";
import { DrawerContent } from "./DrawerContent";

const MainContent: FC = () => {
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
      <section className="map-container">MAP HERE</section>
    </Box>
  );
};

export { MainContent };
