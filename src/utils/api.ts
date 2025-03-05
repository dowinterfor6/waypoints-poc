import { Coordinate } from "@/types";
import Ajv, { JSONSchemaType } from "ajv";

const ajv = new Ajv();

const MOCK_API_BASE_URL = "https://sg-mock-api.lalamove.com";

const isError = (error: unknown): error is Error =>
  !!error &&
  typeof error === "object" &&
  "message" in error &&
  typeof error.message === "string";

const getErrorResponse = (
  error: unknown,
  defaultErrorMessage: string
): ErrorResponse => ({
  status: API_RESPONSE_STATUS.ERROR,
  errorMessage: isError(error) ? error.message : defaultErrorMessage,
});

/**
 * @throws Validation error
 */
const validateResponseWithSchema = <T = Record<string, unknown>>(
  schema: JSONSchemaType<T>,
  response: Record<string, unknown>
) => {
  const validate = ajv.compile(schema);

  const isValid = validate(response);

  if (!isValid && validate.errors) {
    throw new Error(validate.errors.map((error) => error.message).toString());
  }
};

export enum API_RESPONSE_STATUS {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

type ErrorResponse = {
  status: API_RESPONSE_STATUS.ERROR;
  errorMessage: string;
};

export type PostRouteResponse =
  | {
      status: API_RESPONSE_STATUS.SUCCESS;
      token: string;
    }
  | ErrorResponse;

type GetRouteTokenResponse = {
  token: string;
};

const getRouteTokenSchema: JSONSchemaType<GetRouteTokenResponse> = {
  type: "object",
  properties: {
    token: { type: "string" },
  },
  required: ["token"],
  additionalProperties: false,
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

    validateResponseWithSchema(getRouteTokenSchema, json);

    return {
      status: API_RESPONSE_STATUS.SUCCESS,
      token: json.token,
    };
  } catch (error) {
    const errorMessage = `Failed to fetch route token for origin: ${origin}, and destination: ${destination}`;

    return getErrorResponse(error, errorMessage);
  }
};

export type GetRouteResponse =
  | {
      status: API_RESPONSE_STATUS.SUCCESS;
      path: Array<Coordinate>;
      totalDistance: number;
      totalTime: number;
    }
  | ErrorResponse;

type GetRoutePathByTokenResponse = {
  status: string;
  path: Array<Coordinate>;
  total_distance: number;
  total_time: number;
};

const getRoutePathByTokenSchema: JSONSchemaType<GetRoutePathByTokenResponse> = {
  type: "object",
  properties: {
    status: { type: "string" },
    path: {
      type: "array",
      items: {
        type: "array",
        items: [{ type: "string" }, { type: "string" }],
        minItems: 2,
        maxItems: 2,
      },
      minItems: 1,
    },
    total_distance: { type: "number" },
    total_time: { type: "number" },
  },
  required: ["status", "path", "total_distance", "total_time"],
  additionalProperties: false,
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

    validateResponseWithSchema(getRoutePathByTokenSchema, json);

    const { path, total_distance: totalDistance, total_time: totalTime } = json;

    return {
      status: API_RESPONSE_STATUS.SUCCESS,
      path,
      totalDistance,
      totalTime,
    };
  } catch (error) {
    const errorMessage = "Failed to fetch route";

    return getErrorResponse(error, errorMessage);
  }
};
