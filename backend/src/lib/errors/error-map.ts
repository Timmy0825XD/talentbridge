export type ErrorResponse = {
  status: number;
  body: Record<string, unknown>;
};

export type ErrorMap = Record<string, ErrorResponse>;

export function getErrorCode(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  return null;
}
