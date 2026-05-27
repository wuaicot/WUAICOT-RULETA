const API_BASE = process.env.REACT_APP_API_BASE ||'http://localhost:8888';
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function apiFetch(endpoint: string, options: RequestInit = {}, retries = MAX_RETRIES) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      clearTimeout(id);
      
      const isLastRetry = i === retries;
      if (isLastRetry) throw err;

      // Espera exponencial (100ms, 200ms, 400ms)
      await delay(Math.pow(2, i) * 100);
    }
  }
}
