export function parseOptionalDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('INVALID_DATE');
  return date;
}
