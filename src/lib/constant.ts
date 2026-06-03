import { env } from '@/env';

export const DATABASE_URL = env.DATABASE_URL;
export const NODE_ENV = env.NODE_ENV;

export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';
