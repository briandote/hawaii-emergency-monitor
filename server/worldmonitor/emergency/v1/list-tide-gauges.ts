/**
 * RPC: ListTideGauges -- reads seeded NOAA tide gauge data from Redis seed cache.
 * All external NOAA API calls happen in the seed pipeline on Railway.
 */

import type {
  ServerContext,
  ListTideGaugesRequest,
  ListTideGaugesResponse,
} from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';

import { getCachedJson } from '../../../_shared/redis';

const SEED_CACHE_KEY = 'emergency:tides:v1';

export async function listTideGauges(
  _ctx: ServerContext,
  _req: ListTideGaugesRequest,
): Promise<ListTideGaugesResponse> {
  try {
    const result = await getCachedJson(SEED_CACHE_KEY, true) as ListTideGaugesResponse | null;
    return { gauges: result?.gauges || [] };
  } catch {
    return { gauges: [] };
  }
}
