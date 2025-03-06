import { Box, Stack, Typography } from "@mui/material";
import React, { FC, useContext } from "react";
import LocationInput from "../LocationInput";
import InfoSection from "./InfoSection";
import ButtonGroup from "./ButtonGroup";
import { DrawerContext } from "@/pages/context/DrawerContext";

const DrawerContent: FC = () => {
  const {
    isMobileViewport,
    startingLocation,
    setStartingLocation,
    inputIsRequiredError,
    setInputIsRequiredError,
    dropoffLocation,
    setDropoffLocation,
  } = useContext(DrawerContext);

  return (
    <Stack
      spacing={6}
      sx={{
        padding: isMobileViewport ? "24px" : "72px 32px 24px",
        marginTop: isMobileViewport ? "50px" : "32px",
        height: "100%",
      }}
    >
      <LocationInput
        label="Starting Location"
        value={startingLocation}
        setValue={setStartingLocation}
        isRequiredError={inputIsRequiredError[0]}
        clearIsRequiredError={() =>
          setInputIsRequiredError([false, inputIsRequiredError[1]])
        }
      />
      <LocationInput
        label="Drop-off Location"
        value={dropoffLocation}
        setValue={setDropoffLocation}
        isRequiredError={inputIsRequiredError[1]}
        clearIsRequiredError={() =>
          setInputIsRequiredError([inputIsRequiredError[0], false])
        }
      />
      <InfoSection />
      <ButtonGroup />
      <Box
        component="div"
        sx={{ display: "flex", alignItems: "flex-end", height: "100%" }}
      >
        <Typography variant="caption">
          Powered by Google, ©2025 Google
        </Typography>
      </Box>
    </Stack>
  );
};

export default DrawerContent;
