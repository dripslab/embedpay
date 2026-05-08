import { Horizon } from 'stellar-sdk';

const HORIZON_URLS = {
  mainnet: 'https://horizon.stellar.org',
  testnet: 'https://horizon-testnet.stellar.org'
};

/**
 * Create a Stellar Horizon server client for the requested network.
 *
 * @param {'mainnet' | 'testnet'} [network='testnet'] - Stellar network to connect to.
 * @returns {Horizon.Server} Configured Horizon server instance.
 */
export function getHorizonServer(network = 'testnet') {
  const horizonUrl = HORIZON_URLS[network] ?? HORIZON_URLS.testnet;
  return new Horizon.Server(horizonUrl);
}

/**
 * Load account details from Horizon.
 *
 * @param {string} accountId - Stellar account public key to fetch.
 * @param {{network?: 'mainnet' | 'testnet', server?: Horizon.Server}} [options={}] - Horizon lookup options.
 * @returns {Promise<import('stellar-sdk').AccountResponse>} Account details returned by Horizon.
 * @throws {Error} When no Stellar account address is provided.
 */
export async function fetchAccountInfo(accountId, options = {}) {
  if (!accountId) {
    throw new Error('A Stellar account address is required.');
  }

  const server = options.server ?? getHorizonServer(options.network);
  return server.loadAccount(accountId);
}

export { HORIZON_URLS };
