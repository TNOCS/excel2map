interface Credentials {
      name: string;
      pass: string;
}
declare function auth(req: any): Credentials;
declare module "basic-auth" {
    export = auth;
}