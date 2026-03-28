/**
 * RPC: ListRoadClosures -- reads seeded road closure data from Redis seed cache.
 * All external data ingestion happens in the seed pipeline on Railway.
 */

import type {
  ServerContext,
  ListRoadClosuresRequest,
  ListRoadClosuresResponse,
} from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';

import { getCachedJson } from '../../../_shared/redis';

const SEED_CACHE_KEY = 'emergency:road-closures:v1';

export async function listRoadClosures(
  _ctx: ServerContext,
  _req: ListRoadClosuresRequest,
): Promise<ListRoadClosuresResponse> {
  try {
    const result = await getCachedJson(SEED_CACHE_KEY, true) as ListRoadClosuresResponse | null;
    return { closures: result?.closures || [] };
  } catch {
    return { closures: [] };
  }
}
