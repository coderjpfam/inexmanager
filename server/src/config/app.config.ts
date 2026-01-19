export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  clientUrl: string;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  supportEmail: string;
  companyAddress: string;
  facebookLink: string;
  twitterLink: string;
  instagramLink: string;
}

export interface DatabaseConfig {
  uri: string;
}

export interface AllConfig {
  app: AppConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  database: DatabaseConfig;
}
