/**
 * RPC: ListActiveAlerts -- reads seeded NWS alert data from Redis seed cache.
 * All external NWS API calls happen in the seed pipeline on Railway.
 */

import type {
  ServerContext,
  ListActiveAlertsRequest,
  ListActiveAlertsResponse,
} from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';

import { getCachedJson } from '../../../_shared/redis';

const SEED_CACHE_KEY = 'emergency:hawaii-alerts:v1';

export async function listActiveAlerts(
  _ctx: ServerContext,
  _req: ListActiveAlertsRequest,
): Promise<ListActiveAlertsResponse> {
  try {
    const result = await getCachedJson(SEED_CACHE_KEY, true) as ListActiveAlertsResponse | null;
    return { alerts: result?.alerts || [] };
  } catch {
    return { alerts: [] };
  }
}
