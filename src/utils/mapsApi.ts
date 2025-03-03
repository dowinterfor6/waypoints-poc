import { Coordinate } from "@/types";
import { get } from "lodash";

export const getAutocompleteSuggestions = async (
  searchTerm: string
): Promise<Array<string> | null> => {
  const apiUrl = "https://places.googleapis.com/v1/places:autocomplete";

  const body = {
    input: searchTerm,
    locationBias: {
      circle: {
        center: {
          latitude: 22.302711,
          longitude: 114.177216,
        },
        radius: 50000.0,
      },
    },
  };

  try {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      throw new Error("Failed to get google maps api key");
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append(
      "X-Goog-Api-Key",
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    );

    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }

    const json = await res.json();

    if (!("suggestions" in json) || !Array.isArray(json.suggestions)) {
      throw new Error("Unexpected response shape");
    }

    const placePredictionSuggestions: Array<{
      placePrediction: { text: { text: string } };
    }> = json.suggestions.filter(
      (suggestion: unknown) => !!get(suggestion, "placePrediction.text.text")
    );

    const suggestions = placePredictionSuggestions.map(
      (suggestion) => suggestion.placePrediction.text.text
    );

    return suggestions;
  } catch {
    return null;
  }
};

export const getRoutePolyline = async (
  waypoints: Array<Coordinate>
): Promise<string | null> => {
  const formattedWaypoints = waypoints.map(([latitude, longitude]) => ({
    location: {
      latLng: {
        latitude,
        longitude,
      },
    },
  }));

  const origin = formattedWaypoints.shift();
  const destination = formattedWaypoints.pop();

  const apiUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";

  const body = {
    origin,
    destination,
    intermediates: formattedWaypoints,
    travelMode: "DRIVE",
    computeAlternativeRoutes: false,
  };

  try {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      throw new Error("Failed to get google maps api key");
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append(
      "X-Goog-Api-Key",
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    );
    headers.append("X-Goog-FieldMask", "routes.polyline.encodedPolyline");

    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }

    const json = await res.json();

    if (
      !("routes" in json) ||
      !Array.isArray(json.routes) ||
      json.routes.length === 0
    ) {
      throw new Error("Unexpected response shape");
    }

    const routePolyline = get(json.routes[0], "polyline.encodedPolyline");

    if (typeof routePolyline !== "string") {
      throw new Error("No encoded polyline returned");
    }

    return routePolyline;
  } catch (error) {
    console.error("Failed to get route polyline: ", error);

    return null;
  }
};
