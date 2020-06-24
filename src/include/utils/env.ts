import { equals } from 'ramda';

export const isTest = equals('node-test');
export const isDev = equals('develop');
export const isProd = equals('production');
