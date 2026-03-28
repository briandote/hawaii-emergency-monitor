export const config = { runtime: 'edge' };

import { createDomainGateway, serverOptions } from '../../../server/gateway';
import { createEmergencyServiceRoutes } from '../../../src/generated/server/worldmonitor/emergency/v1/service_server';
import { emergencyHandler } from '../../../server/worldmonitor/emergency/v1/handler';

export default createDomainGateway(
  createEmergencyServiceRoutes(emergencyHandler, serverOptions),
);
