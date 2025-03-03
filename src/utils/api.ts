import { Coordinate } from "@/types";

const MOCK_API_BASE_URL = "https://sg-mock-api.lalamove.com";

export enum API_RESPONSE_STATUS {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type PostRouteResponse =
  | {
      status: API_RESPONSE_STATUS.SUCCESS;
      token: string;
    }
  | {
      status: API_RESPONSE_STATUS.ERROR;
      errorMessage: string;
    };

export const getRouteToken = async (
  origin: string,
  destination: string
): Promise<PostRouteResponse> => {
  const apiUrl = `${MOCK_API_BASE_URL}/route`;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ origin, destination }),
    });

    if (!res.ok) {
      throw new Error("Server encountered an error while getting route token");
    }

    const json = await res.json();

    if (!("token" in json) || typeof json.token !== "string") {
      throw new Error("Response shape not expected, route token not found");
    }

    const token = json.token;

    return {
      status: API_RESPONSE_STATUS.SUCCESS,
      token,
    };
  } catch (error) {
    let errorMessage = `Failed to fetch route token for origin: ${origin}, and destination: ${destination}`;

    if (
      !!error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      errorMessage = error.message;
    }

    return {
      status: API_RESPONSE_STATUS.ERROR,
      errorMessage,
    };
  }
};

export type GetRouteResponse =
  | {
      status: API_RESPONSE_STATUS.SUCCESS;
      path: Array<Coordinate>;
      totalDistance: number;
      totalTime: number;
    }
  | {
      status: API_RESPONSE_STATUS.ERROR;
      errorMessage: string;
    };

export const getRoutePathByToken = async (
  token: string
): Promise<GetRouteResponse> => {
  const apiUrl = `${MOCK_API_BASE_URL}/route/${token}`;

  try {
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(
        "Server encountered an error while getting route path by token"
      );
    }

    const json = await res.json();

    if ("status" in json && json.status === "in progress") {
      /**
       * In a production environment I'd implement some sort of
       * sleep/wait so as to reduce server load by constantly pinging
       * while "in progress", but for this I'll retry on "in progress"
       * immediately
       */
      return await getRoutePathByToken(token);
    }

    if (
      !("path" in json) ||
      !Array.isArray(json.path) ||
      !("total_distance" in json) ||
      typeof json.total_distance !== "number" ||
      !("total_time" in json) ||
      typeof json.total_time !== "number"
    ) {
      let error =
        "Response shape not expected, path and/or total_distance and/or total_time not found";

      if ("error" in json && typeof json.error === "string") {
        error = json.error;
      }

      throw new Error(error);
    }

    const { path, total_distance: totalDistance, total_time: totalTime } = json;

    return {
      status: API_RESPONSE_STATUS.SUCCESS,
      path,
      totalDistance,
      totalTime,
    };
  } catch (error) {
    let errorMessage = "Failed to fetch route";

    if (
      !!error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      errorMessage = error.message;
    }

    return {
      status: API_RESPONSE_STATUS.ERROR,
      errorMessage,
    };
  }
};
