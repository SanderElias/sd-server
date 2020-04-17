import {discoverGateway} from 'node-tradfri-client';

export async function tradfri() {
  console.log('discover');
  const result = await discoverGateway();
  console.log(result);
}
