/**
 * RPC: ListStreamGauges -- reads seeded USGS stream gauge data from Redis seed cache.
 * All external USGS API calls happen in the seed pipeline on Railway.
 */

import type {
  ServerContext,
  ListStreamGaugesRequest,
  ListStreamGaugesResponse,
} from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';

import { getCachedJson } from '../../../_shared/redis';

const SEED_CACHE_KEY = 'emergency:stream-gauges:v1';

export async function listStreamGauges(
  _ctx: ServerContext,
  _req: ListStreamGaugesRequest,
): Promise<ListStreamGaugesResponse> {
  try {
    const result = await getCachedJson(SEED_CACHE_KEY, true) as ListStreamGaugesResponse | null;
    return { gauges: result?.gauges || [] };
  } catch {
    return { gauges: [] };
  }
}
