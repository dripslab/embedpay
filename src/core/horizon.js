import { Horizon } from 'stellar-sdk';

const HORIZON_URLS = {
  mainnet: 'https://horizon.stellar.org',
  testnet: 'https://horizon-testnet.stellar.org'
};

export function getHorizonServer(network = 'testnet') {
  const horizonUrl = HORIZON_URLS[network] ?? HORIZON_URLS.testnet;
  return new Horizon.Server(horizonUrl);
}

export async function fetchAccountInfo(accountId, options = {}) {
  if (!accountId) {
    throw new Error('A Stellar account address is required.');
  }

  const server = options.server ?? getHorizonServer(options.network);
  return server.loadAccount(accountId);
}

export { HORIZON_URLS };
