const MOCK_API_BASE_URL = "https://sg-mock-api.lalamove.com";

type PostResponse =
  | {
      status: "SUCCESS";
      token: string;
    }
  | {
      status: "ERROR";
      errorMessage: string;
    };

export const postMockApi = async (
  origin: string,
  destination: string
): Promise<PostResponse> => {
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

export const getRouteByToken = async () => {};
