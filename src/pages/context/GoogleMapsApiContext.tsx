import React, {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Coordinate } from "@/types";

type ContextValue = UninitializedContext | InitializedContext;

type UninitializedContext = {
  mapsLibrary: null;
  setMapsLibrary: null;
  markerLibrary: null;
  setMarkerLibrary: null;
  googleLibrary: null;
  setGoogleLibrary: null;
  isFullyInitialized: false;
  waypoints: Array<Coordinate> | null;
};

export type InitializedContext = {
  mapsLibrary: google.maps.MapsLibrary;
  setMapsLibrary: Dispatch<SetStateAction<google.maps.MapsLibrary | null>>;
  markerLibrary: google.maps.MarkerLibrary;
  setMarkerLibrary: Dispatch<SetStateAction<google.maps.MarkerLibrary | null>>;
  googleLibrary: typeof google;
  setGoogleLibrary: Dispatch<SetStateAction<typeof google | null>>;
  isFullyInitialized: boolean;
  waypoints: Array<Coordinate> | null;
};

const defaultContextValue: ContextValue = {
  mapsLibrary: null,
  setMapsLibrary: null,
  markerLibrary: null,
  setMarkerLibrary: null,
  googleLibrary: null,
  setGoogleLibrary: null,
  isFullyInitialized: false,
  waypoints: null,
};

export const GoogleMapsApiContext =
  createContext<ContextValue>(defaultContextValue);

type Props = {
  children: React.ReactNode;
  waypoints: Array<Coordinate> | null;
};

const GoogleMapsApiProvider: FC<Props> = ({ waypoints, children }) => {
  /**
   * Ensure all required google maps libraries are loaded before attempting
   * to load dependent functionality. In a production app, this can be done in
   * a context to provide components, or evaluate the existing (React) wrapper
   * component/api packages for google maps.
   */
  const [mapsLibrary, setMapsLibrary] =
    useState<google.maps.MapsLibrary | null>(null);
  const [markerLibrary, setMarkerLibrary] =
    useState<google.maps.MarkerLibrary | null>(null);
  const [googleLibrary, setGoogleLibrary] = useState<typeof google | null>(
    null
  );

  const [isInitialized, setIsInitialized] = useState(false);

  const loadMapsLibraries = async (loader: Loader) => {
    try {
      // IIFE to shorthand create multiple promises to Promise.all
      await Promise.all([
        (async (): Promise<void> => {
          const maps = await loader.importLibrary("maps");
          setMapsLibrary(maps);
        })(),
        (async (): Promise<void> => {
          const marker = await loader.importLibrary("marker");
          setMarkerLibrary(marker);
        })(),
      ]);

      // Helps with production build to ensure it's not trying to load a global
      // variable that doesn't exist.
      setGoogleLibrary(window.google);

      setIsInitialized(true);
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

  // Memoized so that the object reference doesn't change for each rerender
  const contextValue: ContextValue = useMemo(() => {
    const isFullyInitialized =
      isInitialized && !!googleLibrary && !!mapsLibrary && !!markerLibrary;

    if (!isFullyInitialized) {
      return {
        ...defaultContextValue,
        isFullyInitialized: false,
        waypoints,
      };
    }

    return {
      mapsLibrary,
      setMapsLibrary,
      markerLibrary,
      setMarkerLibrary,
      googleLibrary,
      setGoogleLibrary,
      isFullyInitialized: true,
      waypoints,
    };
  }, [mapsLibrary, markerLibrary, googleLibrary, isInitialized, waypoints]);

  return (
    <GoogleMapsApiContext.Provider value={contextValue}>
      {children}
    </GoogleMapsApiContext.Provider>
  );
};

export default GoogleMapsApiProvider;
