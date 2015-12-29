declare module "basic-auth" {
  interface Credentials {
      name: string;
      pass: string;
  }
    /** Authenticate request */
  export function auth(req: any): Credentials;
}
