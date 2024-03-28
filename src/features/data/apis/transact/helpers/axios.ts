import type { AxiosError } from 'axios';

export function axiosErrorToString(error: AxiosError): string {
  try {
    if (error.response?.data?.error && error.response.data?.description) {
      const { error: title, description } = error.response.data;
      return `${title}: ${description}`;
    }
  } catch {
    // ignore
  }

  return error.message;
}
