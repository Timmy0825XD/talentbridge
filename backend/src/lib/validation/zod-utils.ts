export function formatFirstZodIssue(err: unknown): string {
  if (err && typeof err === 'object' && 'issues' in err) {
    const issues = (err as { issues: { message: string }[] }).issues;
    return issues[0]?.message ?? 'Datos inválidos.';
  }
  return 'Datos inválidos.';
}
