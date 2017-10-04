
import {
  isEqual,
} from 'lodash/fp'

export const isTest = isEqual('node-test')
export const isDev = isEqual('develop')
export const isProd = isEqual('production')
