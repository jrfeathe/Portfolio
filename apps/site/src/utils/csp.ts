import { headers } from "next/headers";

const NONCE_HEADER_CANDIDATES = [
  "x-csp-nonce",
  "x-nextjs-csp-nonce",
  "x-nonce"
];

type MinimalHeaders = Pick<Headers, "get">;

export function extractNonceFromHeaders(
  headerList: MinimalHeaders | null | undefined
): string | undefined {
  if (!headerList) {
    return undefined;
  }

  for (const key of NONCE_HEADER_CANDIDATES) {
    const value = headerList.get(key);
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function getRequestNonce() {
  try {
    return extractNonceFromHeaders(headers());
  } catch {
    return undefined;
  }
}
