import Ajv, { JSONSchemaType } from "ajv";

const ajv = new Ajv();

export const isError = (error: unknown): error is Error =>
  !!error &&
  typeof error === "object" &&
  "message" in error &&
  typeof error.message === "string";

/**
 * @throws Validation error
 */
export const validateResponseWithSchema = <T = Record<string, unknown>>(
  schema: JSONSchemaType<T>,
  response: Record<string, unknown>
) => {
  const validate = ajv.compile(schema);

  const isValid = validate(response);

  if (!isValid && validate.errors) {
    throw new Error(validate.errors.map((error) => error.message).toString());
  }
};
