import type { Response } from "express";

export interface MockResponseState {
  response: Response;
  headers: Map<string, string>;
  getStatus: () => number;
  getBody: () => unknown;
}

export const createMockResponse = (): MockResponseState => {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: unknown;

  const response = {
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return response;
    },
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(payload: unknown) {
      body = payload;
      return response;
    },
  } as unknown as Response;

  return {
    response,
    headers,
    getStatus: () => statusCode,
    getBody: () => body,
  };
};
