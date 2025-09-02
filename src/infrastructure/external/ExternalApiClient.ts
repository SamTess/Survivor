export class ExternalApiClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
    const url = new URL(path.replace(/^-?\//, ""), this.baseUrl.endsWith("/") ? this.baseUrl : this.baseUrl + "/");
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  async getJson<T>(path: string, query?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    const res = await fetch(this.buildUrl(path, query), {
      headers: { "X-Group-Authorization": this.apiKey },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`External API GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async getBinary(path: string): Promise<Buffer> {
    const res = await fetch(this.buildUrl(path), {
      headers: { "X-Group-Authorization": this.apiKey },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`External API GET(binary) ${path} failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
