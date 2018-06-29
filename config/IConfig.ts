export interface IConfig {
  /**
   * MongoDB connection string
   *
   * @type {string}
   * @memberOf IConfig
    */
  mongodb: string;
  
  adminUser: string;
  
  adminPassword: string;

  nodeAuthSecretKey: string;
}