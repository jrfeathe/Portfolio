import { headers } from "next/headers";

import { extractNonceFromHeaders, getRequestNonce } from "../csp";

jest.mock("next/headers", () => ({
  headers: jest.fn()
}));

const mockedHeaders = headers as jest.MockedFunction<typeof headers>;

describe("extractNonceFromHeaders", () => {
  it("returns the first matching header value", () => {
    const values: Record<string, string | null> = {
      "x-nextjs-csp-nonce": "skip",
      "x-csp-nonce": "nonce-123"
    };
    const stub = {
      get: (key: string) => values[key] ?? null
    };

    expect(extractNonceFromHeaders(stub)).toBe("nonce-123");
  });

  it("returns undefined when no headers available", () => {
    const stub = {
      get: () => null
    };

    expect(extractNonceFromHeaders(stub)).toBeUndefined();
    expect(extractNonceFromHeaders(null)).toBeUndefined();
  });
});

describe("getRequestNonce", () => {
  beforeEach(() => {
    mockedHeaders.mockReset();
  });

  it("reads the nonce from next headers", () => {
    mockedHeaders.mockReturnValue({
      get: (key: string) => (key === "x-csp-nonce" ? "nonce-456" : null)
    } as Headers);

    expect(getRequestNonce()).toBe("nonce-456");
  });

  it("swallows errors when headers() fails", () => {
    mockedHeaders.mockImplementation(() => {
      throw new Error("fail");
    });

    expect(getRequestNonce()).toBeUndefined();
  });
});

