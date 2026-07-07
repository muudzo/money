/**
 * Shared error type for providers that require optional external
 * configuration (a GPU endpoint, a local binary, etc). The registry in
 * `index.ts` catches this specifically to fall back to the free/local
 * default instead of failing the whole render.
 */
export class NotConfiguredError extends Error {
  constructor(providerName: string, hint: string) {
    super(`${providerName} is not configured: ${hint}`);
    this.name = "NotConfiguredError";
  }
}
