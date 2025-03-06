import { DrawerContext } from "@/pages/context/DrawerContext";
import { Box, Stack, Typography } from "@mui/material";
import React, { FC, useContext } from "react";

const InfoSection: FC = () => {
  const { isMobileViewport, routeData, error } = useContext(DrawerContext);

  const typographyVariant = isMobileViewport ? "body2" : "body1";

  return (
    <Box
      component="section"
      sx={{
        justifyContent: "flex-end",
        display: "flex",
        flexDirection: "column",
        height: "200px",
      }}
    >
      <Stack>
        <Stack>
          {!!routeData &&
            Number.isFinite(routeData.distance) &&
            Number.isFinite(routeData.time) && (
              <>
                <Typography variant={typographyVariant}>
                  Total Distance: {routeData.distance}
                </Typography>
                <Typography variant={typographyVariant}>
                  Total Time: {routeData.time}
                </Typography>
              </>
            )}
        </Stack>
        <Box>
          {error !== null && (
            <Typography variant={typographyVariant} sx={{ color: "red" }}>
              {error}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default InfoSection;
