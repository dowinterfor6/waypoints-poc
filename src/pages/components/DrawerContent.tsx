import { getRoutePathByToken, getRouteToken } from "@/utils/api";
import { Box, Button, Stack, Typography } from "@mui/material";
import React, { Dispatch, FC, SetStateAction, useState } from "react";
import { LocationInput } from "./LocationInputs";
import { Coordinate } from "@/types";

type Props = {
  setWaypoints: Dispatch<SetStateAction<Array<Coordinate> | null>>;
};

const DrawerContent: FC<Props> = ({ setWaypoints }) => {
  const INITIAL_ROUTE_DATA = { distance: null, time: null };

  const [routeData, setRouteData] = useState<{
    distance: number | null;
    time: number | null;
  }>(INITIAL_ROUTE_DATA);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startingLocation, setStartingLocation] = useState<string>("");
  const [dropoffLocation, setDropoffLocation] = useState<string>("");

  const onSubmit = async (): Promise<void> => {
    setRouteData(INITIAL_ROUTE_DATA);
    setError(null);
    setIsLoading(true);

    try {
      // In a real app, add some sort of validation to the locations to ensure
      // it's somewhat valid before spending an API call
      const routeTokenResponse = await getRouteToken(
        startingLocation,
        dropoffLocation
      );

      if (routeTokenResponse.status === "ERROR") {
        throw new Error("Failed to get route token from location");
      }

      const routeToken = routeTokenResponse.token;

      const routePathResponse = await getRoutePathByToken(routeToken);

      if (routePathResponse.status === "ERROR") {
        throw new Error(routePathResponse.errorMessage);
      }

      const {
        path,
        totalDistance: distance,
        totalTime: time,
      } = routePathResponse;

      setRouteData({ distance, time });
      setWaypoints(path);
    } catch (error) {
      if (typeof error === "string") {
        setError(error);
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
  };

  return (
    <Stack spacing={6} sx={{ padding: 6, marginTop: 4 }}>
      <LocationInput
        label="Starting Location"
        value={startingLocation}
        setValue={setStartingLocation}
      />
      <LocationInput
        label="Drop-off Location"
        value={dropoffLocation}
        setValue={setDropoffLocation}
      />
      <Box
        component="section"
        sx={{
          height: 100,
          justifyContent: "flex-end",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack>
          <Stack>
            {Number.isFinite(routeData.distance) &&
              Number.isFinite(routeData.time) && (
                <>
                  <Typography variant="body1">
                    Total Distance: {routeData.distance}
                  </Typography>
                  <Typography variant="body1">
                    Total Time: {routeData.time}
                  </Typography>
                </>
              )}
          </Stack>
          <Box>
            {error !== null && (
              <Typography variant="body1" sx={{ color: "red" }}>
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
    </Stack>
  );
};

export { DrawerContent };
