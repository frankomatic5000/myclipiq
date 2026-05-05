/**
 * Polyfills for Node test environment
 */
import '@testing-library/jest-dom';

class MockHeaders {
  private _h = new Map<string, string>();
  constructor(init?: any) {
    if (init) {
      if (typeof init === 'object' && !Array.isArray(init)) {
        Object.entries(init).forEach(([k, v]) => this._h.set(k.toLowerCase(), String(v)));
      } else if (Array.isArray(init)) {
        init.forEach(([k, v]: [string, string]) => this._h.set(k.toLowerCase(), String(v)));
      }
    }
  }
  get(name: string) { return this._h.get(name.toLowerCase()) ?? null; }
  has(name: string) { return this._h.has(name.toLowerCase()); }
  set(name: string, value: string) { this._h.set(name.toLowerCase(), value); }
  append(name: string, value: string) {
    const key = name.toLowerCase();
    this._h.set(key, this._h.has(key) ? `${this._h.get(key)}, ${value}` : value);
  }
  delete(name: string) { this._h.delete(name.toLowerCase()); }
  forEach(cb: (value: string, key: string) => void) {
    this._h.forEach((v, k) => cb(v, k));
  }
  entries() { return this._h.entries(); }
  keys() { return this._h.keys(); }
  values() { return this._h.values(); }
  [Symbol.iterator]() { return this._h.entries(); }
}

class MockResponse {
  body: any;
  status: number;
  headers: any;
  ok: boolean;
  url: string;
  type: string;
  constructor(body?: any, init?: any) {
    this.body = body ?? null;
    this.status = init?.status ?? 200;
    this.headers = new MockHeaders(init?.headers ?? {});
    this.ok = this.status >= 200 && this.status < 300;
    this.url = '';
    this.type = 'default';
  }
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
  async blob() { return new Blob([this.body]); }
  async arrayBuffer() {
    const enc = new TextEncoder();
    return enc.encode(this.body).buffer;
  }
  clone() { return new MockResponse(this.body, { status: this.status, headers: this.headers }); }
  static json(data: any, init?: any) {
    return new MockResponse(JSON.stringify(data), {
      status: init?.status ?? 200,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  }
  static redirect(url: string, status = 302) {
    return new MockResponse(null, { status, headers: { Location: url } });
  }
}

class MockRequest {
  url: string;
  method: string;
  headers: any;
  body: any;
  constructor(input?: any, init?: any) {
    this.url = typeof input === 'string' ? input : '';
    this.method = init?.method ?? 'GET';
    this.headers = new MockHeaders(init?.headers ?? {});
    this.body = init?.body ?? null;
  }
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  async text() {
    return typeof this.body === 'string' ? this.body : '';
  }
  async blob() { return new Blob([this.body]); }
  async arrayBuffer() {
    const enc = new TextEncoder();
    return enc.encode(this.body).buffer;
  }
  clone() { return new MockRequest(this.url, { method: this.method, headers: this.headers, body: this.body }); }
}

if (typeof globalThis.Response === 'undefined' || !(globalThis.Response as any).json) {
  (globalThis as any).Response = MockResponse;
}
if (typeof globalThis.Request === 'undefined') {
  (globalThis as any).Request = MockRequest;
}
if (typeof globalThis.Headers === 'undefined' || !(globalThis.Headers.prototype.get)) {
  (globalThis as any).Headers = MockHeaders;
}
