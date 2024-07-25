export async function getErrorMessageFromResponse(res: Response): Promise<string> {
  if (res.headers.get('Content-Type')?.includes('application/json')) {
    const json = await res.json();
    if (json.error && json.description) {
      const { error: title, description } = json;
      return `${title}: ${description}`;
    }
  }

  return `${res.status} ${res.statusText}`;
}

export function handleFetchParams(
  params: Record<string, string | number | boolean | string[]>
): URLSearchParams {
  return new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map(i => [k, i.toString()]) : [[k, v.toString()]]
    )
  );
}
