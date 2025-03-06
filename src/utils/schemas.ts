import { Coordinate } from "@/types";
import { JSONSchemaType } from "ajv";

type GetRouteTokenResponse = {
  token: string;
};

export const getRouteTokenSchema: JSONSchemaType<GetRouteTokenResponse> = {
  type: "object",
  properties: {
    token: { type: "string" },
  },
  required: ["token"],
  additionalProperties: false,
};

type GetRoutePathByTokenResponse = {
  status: string;
  path: Array<Coordinate>;
  total_distance: number;
  total_time: number;
};

export const getRoutePathByTokenSchema: JSONSchemaType<GetRoutePathByTokenResponse> =
  {
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

// Not the exact type, just what we care about
type PlacePrediction = {
  placePrediction: {
    text: {
      text: string;
    };
  };
};

type GetAutocompleteSuggestionsResponse = {
  suggestions: Array<PlacePrediction>;
};

export const getAutocompleteSuggestionsSchema: JSONSchemaType<GetAutocompleteSuggestionsResponse> =
  {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            placePrediction: {
              type: "object",
              properties: {
                text: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                    },
                  },
                  required: ["text"],
                },
              },
              required: ["text"],
              additionalProperties: true,
            },
            additionalProperties: false,
          },
          required: ["placePrediction"],
        },
      },
    },
    required: ["suggestions"],
  };

// Again, just the data we care about
type PolylineResponse = {
  polyline: {
    encodedPolyline: string;
  };
};

type GetRoutePolylineResponse = {
  routes: Array<PolylineResponse>;
};

export const getRoutePolylineSchema: JSONSchemaType<GetRoutePolylineResponse> =
  {
    type: "object",
    properties: {
      routes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            polyline: {
              type: "object",
              properties: {
                encodedPolyline: {
                  type: "string",
                },
              },
              required: ["encodedPolyline"],
            },
          },
          required: ["polyline"],
          additionalProperties: true,
        },
        minItems: 1,
      },
    },
    required: ["routes"],
    additionalProperties: true,
  };
