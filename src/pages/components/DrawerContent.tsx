import {
  API_RESPONSE_STATUS,
  getRoutePathByToken,
  getRouteToken,
} from "@/utils/api";
import { Box, Button, Stack, Typography } from "@mui/material";
import React, { Dispatch, FC, SetStateAction, useState } from "react";
import LocationInput from "./LocationInputs";
import { Coordinate } from "@/types";

type Props = {
  setWaypoints: Dispatch<SetStateAction<Array<Coordinate> | null>>;
  isMobileViewport: boolean;
  setIsMobileDrawerOpen: Dispatch<SetStateAction<boolean>>;
};

const DrawerContent: FC<Props> = ({
  setWaypoints,
  isMobileViewport,
  setIsMobileDrawerOpen,
}) => {
  const INITIAL_ROUTE_DATA = { distance: null, time: null };

  const [routeData, setRouteData] = useState<{
    distance: number | null;
    time: number | null;
  }>(INITIAL_ROUTE_DATA);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startingLocation, setStartingLocation] = useState<string>("");
  const [dropoffLocation, setDropoffLocation] = useState<string>("");
  const [inputIsRequiredError, setInputIsRequiredError] = useState<
    [boolean, boolean]
  >([false, false]);

  const onSubmit = async (): Promise<void> => {
    if (!startingLocation || !dropoffLocation) {
      setInputIsRequiredError([!startingLocation, !dropoffLocation]);

      return;
    }

    setRouteData(INITIAL_ROUTE_DATA);
    setError(null);
    setIsLoading(true);

    try {
      // In a real app, add some sort of validation to the locations to ensure
      // it's somewhat valid before sending an API call
      const routeTokenResponse = await getRouteToken(
        startingLocation,
        dropoffLocation
      );

      if (routeTokenResponse.status === API_RESPONSE_STATUS.ERROR) {
        throw new Error(routeTokenResponse.errorMessage);
      }

      const routeToken = routeTokenResponse.token;

      const routePathResponse = await getRoutePathByToken(routeToken);

      if (routePathResponse.status === API_RESPONSE_STATUS.ERROR) {
        throw new Error(routePathResponse.errorMessage);
      }

      const {
        path,
        totalDistance: distance,
        totalTime: time,
      } = routePathResponse;

      setRouteData({ distance, time });
      setWaypoints(path);

      if (isMobileViewport) {
        setIsMobileDrawerOpen(false);
      }
    } catch (error) {
      if (
        !!error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setError(error.message);
      } else {
        setError("Failed to fetch route data");
      }
      setWaypoints(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = (): void => {
    setError(null);
    setStartingLocation("");
    setDropoffLocation("");
    setRouteData(INITIAL_ROUTE_DATA);
    setWaypoints(null);
    setInputIsRequiredError([false, false]);
  };

  const typographyVariant = isMobileViewport ? "body2" : "body1";

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
            {Number.isFinite(routeData.distance) &&
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
      <Box component="section">
        <Stack
          direction="row"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          {/* The UX on this is subjective, but for a simple experience disallowed
          actions while loading will just be disabled */}
          <Button variant="contained" onClick={onSubmit} loading={isLoading}>
            Submit
          </Button>
          <Button variant="contained" onClick={onReset} disabled={isLoading}>
            Reset
          </Button>
        </Stack>
      </Box>
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
