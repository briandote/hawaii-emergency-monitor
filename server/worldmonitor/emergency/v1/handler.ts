/**
 * Emergency service handler -- thin composition of per-RPC modules.
 *
 * RPCs:
 *   - ListActiveAlerts   (NWS weather/emergency alerts for Hawaii)
 *   - ListStreamGauges   (USGS stream gauge readings)
 *   - ListShelters        (Emergency shelter locations)
 *   - ListRoadClosures    (Active road closures and detours)
 *   - ListPowerOutages    (Current power outage reports)
 *   - ListTideGauges      (NOAA tide gauge readings)
 */

import type { EmergencyServiceHandler } from '../../../../src/generated/server/worldmonitor/emergency/v1/service_server';
import { listActiveAlerts } from './list-active-alerts';
import { listStreamGauges } from './list-stream-gauges';
import { listShelters } from './list-shelters';
import { listRoadClosures } from './list-road-closures';
import { listPowerOutages } from './list-power-outages';
import { listTideGauges } from './list-tide-gauges';

export const emergencyHandler: EmergencyServiceHandler = {
  listActiveAlerts,
  listStreamGauges,
  listShelters,
  listRoadClosures,
  listPowerOutages,
  listTideGauges,
};
