const MOCK_API_BASE_URL = "https://sg-mock-api.lalamove.com";

export type PostRouteResponse =
  | {
      status: "SUCCESS";
      token: string;
    }
  | {
      status: "ERROR";
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
      throw new Error(`Response status: ${res.status}`);
    }

    const json = await res.json();

    if (!("token" in json) || typeof json.token !== "string") {
      throw new Error("Response shape not expected, token not found");
    }

    const token = json.token;

    return {
      status: "SUCCESS",
      token,
    };
  } catch (error) {
    let errorMessage = `Failed to fetch route token for origin: ${origin}, and destination: ${destination}`;

    if (typeof error === "string") {
      errorMessage = error;
    }

    return {
      status: "ERROR",
      errorMessage,
    };
  }
};

export type GetRouteResponse =
  | {
      status: "SUCCESS";
      path: Array<[string, string]>;
      totalDistance: number;
      totalTime: number;
    }
  | {
      status: "ERROR";
      errorMessage: string;
    };

export const getRoutePathByToken = async (
  token: string
): Promise<GetRouteResponse> => {
  const apiUrl = `${MOCK_API_BASE_URL}/route/${token}`;

  try {
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
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
      throw new Error(
        "Response shape not expected, path and/or total_distance and/or total_time not found"
      );
    }

    const { path, total_distance: totalDistance, total_time: totalTime } = json;

    return {
      status: "SUCCESS",
      path,
      totalDistance,
      totalTime,
    };
  } catch (error) {
    let errorMessage = "Failed to fetch route";

    if (typeof error === "string") {
      errorMessage = error;
    }

    return {
      status: "ERROR",
      errorMessage,
    };
  }
};
