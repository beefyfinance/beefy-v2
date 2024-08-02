export async function getErrorMessageFromResponse(res: Response): Promise<string | undefined> {
  try {
    if (res.headers.get('Content-Type')?.includes('application/json')) {
      const json = await res.json();
      if (json.error && json.description) {
        const { error: title, description } = json;
        return `${title}: ${description}`;
      }
    }
  } catch {
    /* ignore */
  }

  return undefined;
}
