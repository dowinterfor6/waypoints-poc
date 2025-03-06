import { Coordinate } from "@/types";
import {
  API_RESPONSE_STATUS,
  getRoutePathByToken,
  getRouteToken,
} from "@/utils/api";
import { isError } from "@/utils/utils";
import { noop } from "lodash";
import React, {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

export type RouteData = {
  distance: number;
  time: number;
} | null;

export type DrawerError = string | null;

export type ContextValue = {
  setWaypoints: Dispatch<SetStateAction<Array<Coordinate> | null>>;
  isMobileViewport: boolean;
  setIsMobileDrawerOpen: Dispatch<SetStateAction<boolean>>;
  routeData: RouteData;
  startingLocation: string;
  setStartingLocation: Dispatch<SetStateAction<string>>;
  dropoffLocation: string;
  setDropoffLocation: Dispatch<SetStateAction<string>>;
  inputIsRequiredError: [boolean, boolean];
  setInputIsRequiredError: Dispatch<SetStateAction<[boolean, boolean]>>;
  error: string | null;
  isLoading: boolean;
  onSubmit: () => Promise<void>;
  onReset: () => void;
};

export const defaultContextValue: ContextValue = {
  setWaypoints: noop,
  isMobileViewport: false,
  setIsMobileDrawerOpen: noop,
  routeData: null,
  startingLocation: "",
  setStartingLocation: noop,
  dropoffLocation: "",
  setDropoffLocation: noop,
  inputIsRequiredError: [false, false],
  setInputIsRequiredError: noop,
  error: null,
  isLoading: false,
  onSubmit: async () => noop(), // short handing a Promise return
  onReset: noop,
};

export const DrawerContext = createContext<ContextValue>(defaultContextValue);

type Props = {
  children: React.ReactNode;
  setWaypoints: Dispatch<SetStateAction<Array<Coordinate> | null>>;
  isMobileViewport: boolean;
  setIsMobileDrawerOpen: Dispatch<SetStateAction<boolean>>;
};

const DrawerContextProvider: FC<Props> = ({
  children,
  setWaypoints,
  isMobileViewport,
  setIsMobileDrawerOpen,
}) => {
  const [routeData, setRouteData] = useState<RouteData>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startingLocation, setStartingLocation] = useState<string>("");
  const [dropoffLocation, setDropoffLocation] = useState<string>("");
  const [inputIsRequiredError, setInputIsRequiredError] = useState<
    [boolean, boolean]
  >([false, false]);

  // Prevent rerenders from recreating new instances of this function if dependencies
  // haven't changes to reduce unnecessary context rerenders
  const onSubmit = useCallback(async (): Promise<void> => {
    if (!startingLocation || !dropoffLocation) {
      setInputIsRequiredError([!startingLocation, !dropoffLocation]);

      return;
    }

    setRouteData(null);
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
      const defaultError = "Failed to fetch route data";

      setError(isError(error) ? error.message : defaultError);

      setWaypoints(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    startingLocation,
    dropoffLocation,
    isMobileViewport,
    setIsMobileDrawerOpen,
    setWaypoints,
  ]);

  // Prevent rerenders from recreating new instances of this function if dependencies
  // haven't changes to reduce unnecessary context rerenders
  const onReset = useCallback((): void => {
    setError(null);
    setStartingLocation("");
    setDropoffLocation("");
    setRouteData(null);
    setWaypoints(null);
    setInputIsRequiredError([false, false]);
  }, [setWaypoints]);

  /**
   * @see GoogleMapsApiContext.tsx for why useMemo is necessary
   */
  const contextValue: ContextValue = useMemo(
    () => ({
      setWaypoints,
      setIsMobileDrawerOpen,
      routeData,
      isMobileViewport,
      startingLocation,
      setStartingLocation,
      inputIsRequiredError,
      setInputIsRequiredError,
      dropoffLocation,
      setDropoffLocation,
      error,
      isLoading,
      onSubmit,
      onReset,
    }),
    [
      startingLocation,
      dropoffLocation,
      error,
      routeData,
      isMobileViewport,
      inputIsRequiredError,
      isLoading,
      onSubmit,
      onReset,
      setIsMobileDrawerOpen,
      setWaypoints,
    ]
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
    </DrawerContext.Provider>
  );
};

export default DrawerContextProvider;
