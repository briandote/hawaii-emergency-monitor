/**
 * RPC: ListShelters -- reads seeded emergency shelter data from Redis seed cache.
 * All external data ingestion happens in the seed pipeline on Railway.
 */

import type {
  ServerContext,
  ListSheltersRequest,
  ListSheltersResponse,
} from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';

import { getCachedJson } from '../../../_shared/redis';

const SEED_CACHE_KEY = 'emergency:shelters:v1';

export async function listShelters(
  _ctx: ServerContext,
  _req: ListSheltersRequest,
): Promise<ListSheltersResponse> {
  try {
    const result = await getCachedJson(SEED_CACHE_KEY, true) as ListSheltersResponse | null;
    return { shelters: result?.shelters || [] };
  } catch {
    return { shelters: [] };
  }
}
