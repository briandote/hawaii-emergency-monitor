/**
 * RPC: ListPowerOutages -- reads seeded power outage data from Redis seed cache.
 * All external data ingestion happens in the seed pipeline on Railway.
 */

import type {
  ServerContext,
  ListPowerOutagesRequest,
  ListPowerOutagesResponse,
} from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';

import { getCachedJson } from '../../../_shared/redis';

const SEED_CACHE_KEY = 'emergency:power-outages:v1';

export async function listPowerOutages(
  _ctx: ServerContext,
  _req: ListPowerOutagesRequest,
): Promise<ListPowerOutagesResponse> {
  try {
    const result = await getCachedJson(SEED_CACHE_KEY, true) as ListPowerOutagesResponse | null;
    return { outages: result?.outages || [] };
  } catch {
    return { outages: [] };
  }
}
