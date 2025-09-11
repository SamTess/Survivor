declare module 'pg' {
  export class Client {
    constructor(config: { connectionString: string });
    connect(): Promise<void>;
  query(sql: string): Promise<unknown>;
    on(event: 'notification', cb: (msg: { payload?: string }) => void): void;
  on(event: 'error', cb: (err: unknown) => void): void;
    on(event: 'end', cb: () => void): void;
  }
  export interface Notification { payload?: string }
}
