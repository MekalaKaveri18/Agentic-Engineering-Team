import { RequestValidator, ValidationSchema } from "../middleware";
import { createMockResponse } from "./helpers";

describe("RequestValidator", () => {
  const schema: ValidationSchema = {
    allowUnknown: false,
    fields: {
      name: {
        type: "string",
        required: true,
        minLength: 2,
      },
      age: {
        type: "number",
        required: true,
        coerce: true,
        minimum: 18,
      },
      subscribed: {
        type: "boolean",
        coerce: true,
      },
      email: {
        type: "string",
        pattern: ".+@.+",
        custom: (value) =>
          String(value).endsWith("@nth.ai")
            ? undefined
            : "Email must use the nth.ai domain.",
      },
    },
  };

  it("coerces primitives and applies custom validators", () => {
    const validator = new RequestValidator();
    const result = validator.validate<{
      name: string;
      age: number;
      subscribed: boolean;
      email: string;
    }>(
      {
        name: "Kaveri",
        age: "24",
        subscribed: "true",
        email: "kaveri@nth.ai",
      },
      schema
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data.age).toBe(24);
    expect(result.data.subscribed).toBe(true);
  });

  it("returns structured 400 responses for invalid payloads", () => {
    const validator = new RequestValidator();
    const middleware = validator.middleware(schema);
    const request = {
      body: {
        name: "A",
        age: "17",
        email: "builder@example.com",
        unexpected: "value",
      },
    } as never;
    const responseState = createMockResponse();
    const next = jest.fn();

    middleware(request, responseState.response, next);

    expect(next).not.toHaveBeenCalled();
    expect(responseState.getStatus()).toBe(400);
    expect(responseState.getBody()).toEqual({
      error: "Validation failed",
      details: [
        {
          path: "name",
          message: "Must be at least 2 characters.",
        },
        {
          path: "age",
          message: "Must be greater than or equal to 18.",
        },
        {
          path: "email",
          message: "Email must use the nth.ai domain.",
        },
        {
          path: "unexpected",
          message: "Unknown field.",
        },
      ],
    });
  });
});
