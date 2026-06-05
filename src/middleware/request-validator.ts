import type { NextFunction, Request, Response } from "express";

export type SchemaType = "string" | "number" | "boolean";
export type RequestSource = "body" | "query" | "params";

export interface FieldRule {
  type: SchemaType;
  required?: boolean;
  coerce?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: RegExp | string;
  enum?: unknown[];
  custom?: (
    value: unknown,
    payload: Record<string, unknown>
  ) => string | undefined | null;
}

export interface ValidationSchema {
  fields: Record<string, FieldRule>;
  allowUnknown?: boolean;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult<T extends Record<string, unknown>> {
  valid: boolean;
  data: T;
  errors: ValidationError[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const coerceValue = (value: unknown, type: SchemaType): unknown => {
  if (type === "number" && typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  if (type === "boolean" && typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  if (type === "string" && value !== undefined && value !== null) {
    return String(value);
  }

  return value;
};

const matchesType = (value: unknown, type: SchemaType): boolean => {
  if (type === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }

  return typeof value === type;
};

export class RequestValidator {
  validate<T extends Record<string, unknown>>(
    input: unknown,
    schema: ValidationSchema
  ): ValidationResult<T> {
    const errors: ValidationError[] = [];
    const normalized: Record<string, unknown> = {};

    if (!isRecord(input)) {
      return {
        valid: false,
        data: normalized as T,
        errors: [{ path: "$", message: "Expected an object payload." }],
      };
    }

    for (const [field, rule] of Object.entries(schema.fields)) {
      const rawValue = input[field];
      const missing = rawValue === undefined || rawValue === null;

      if (missing) {
        if (rule.required) {
          errors.push({
            path: field,
            message: "Field is required.",
          });
        }
        continue;
      }

      const value = rule.coerce ? coerceValue(rawValue, rule.type) : rawValue;

      if (!matchesType(value, rule.type)) {
        errors.push({
          path: field,
          message: `Expected ${rule.type}.`,
        });
        continue;
      }

      if (
        rule.type === "string" &&
        typeof value === "string" &&
        rule.minLength !== undefined &&
        value.length < rule.minLength
      ) {
        errors.push({
          path: field,
          message: `Must be at least ${rule.minLength} characters.`,
        });
      }

      if (
        rule.type === "string" &&
        typeof value === "string" &&
        rule.maxLength !== undefined &&
        value.length > rule.maxLength
      ) {
        errors.push({
          path: field,
          message: `Must be at most ${rule.maxLength} characters.`,
        });
      }

      if (
        rule.type === "string" &&
        typeof value === "string" &&
        rule.pattern !== undefined &&
        !(typeof rule.pattern === "string"
          ? new RegExp(rule.pattern)
          : rule.pattern
        ).test(value)
      ) {
        errors.push({
          path: field,
          message: "Value does not match the required pattern.",
        });
      }

      if (
        rule.type === "number" &&
        typeof value === "number" &&
        rule.minimum !== undefined &&
        value < rule.minimum
      ) {
        errors.push({
          path: field,
          message: `Must be greater than or equal to ${rule.minimum}.`,
        });
      }

      if (
        rule.type === "number" &&
        typeof value === "number" &&
        rule.maximum !== undefined &&
        value > rule.maximum
      ) {
        errors.push({
          path: field,
          message: `Must be less than or equal to ${rule.maximum}.`,
        });
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          path: field,
          message: "Value is not in the allowed set.",
        });
      }

      if (rule.custom) {
        const customMessage = rule.custom(value, input);
        if (customMessage) {
          errors.push({
            path: field,
            message: customMessage,
          });
        }
      }

      normalized[field] = value;
    }

    if (!schema.allowUnknown) {
      for (const key of Object.keys(input)) {
        if (!schema.fields[key]) {
          errors.push({
            path: key,
            message: "Unknown field.",
          });
        }
      }
    } else {
      Object.assign(normalized, input);
    }

    return {
      valid: errors.length === 0,
      data: normalized as T,
      errors,
    };
  }

  middleware<T extends Record<string, unknown>>(
    schema: ValidationSchema,
    source: RequestSource = "body"
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const payload = (
        req as unknown as Record<RequestSource, unknown>
      )[source] ?? {};
      const result = this.validate<T>(payload, schema);

      if (!result.valid) {
        res.status(400).json({
          error: "Validation failed",
          details: result.errors,
        });
        return;
      }

      (req as unknown as Record<RequestSource, unknown>)[source] = result.data;
      next();
    };
  }
}
