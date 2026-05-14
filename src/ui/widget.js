import { fetchAccountInfo } from '../core/horizon.js';
import { generateQrCode } from '../qr/generate.js';

const DEFAULTS = {
  amount: '',
  asset: 'XLM',
  network: 'testnet',
  memo: ''
};

/**
 * Resolve a container selector or element to a DOM element.
 *
 * @param {string | Element | null | undefined} container - CSS selector or existing DOM element.
 * @returns {Element | null | undefined} Matching DOM element, the provided element, or null when a selector does not match.
 */
function resolveContainer(container) {
  if (typeof container === 'string') {
    return document.querySelector(container);
  }

  return container;
}

/**
 * Render the payment widget into its shadow root.
 *
 * @param {ShadowRoot} shell - Shadow root that owns the widget markup.
 * @param {{
 *   amount?: string | number,
 *   asset: string,
 *   network: string,
 *   destination: string,
 *   status?: string,
 *   error?: string,
 *   loading?: boolean,
 *   qr?: string
 * }} state - Current widget display state.
 * @returns {void}
 */
function render(shell, state) {
  shell.innerHTML = `
    <style>
      :host {
        all: initial;
        color: #15202b;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .embedpay-widget {
        box-sizing: border-box;
        max-width: 320px;
        border: 1px solid #d8e1e8;
        border-radius: 8px;
        padding: 16px;
        background: #ffffff;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
      }

      .embedpay-title {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 700;
      }

      .embedpay-meta,
      .embedpay-status {
        margin: 0;
        color: #536471;
        font-size: 14px;
        line-height: 1.45;
      }

      .embedpay-status-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .embedpay-spinner {
        box-sizing: border-box;
        flex: 0 0 auto;
        width: 16px;
        height: 16px;
        border: 2px solid #d8e1e8;
        border-top-color: #1d9bf0;
        border-radius: 50%;
        animation: embedpay-spin 0.8s linear infinite;
      }

      @keyframes embedpay-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .embedpay-qr {
        display: block;
        width: 220px;
        height: 220px;
        margin: 16px auto;
      }

      .embedpay-address {
        box-sizing: border-box;
        width: 100%;
        overflow-wrap: anywhere;
        border-radius: 6px;
        background: #f4f7f9;
        padding: 10px;
        color: #23313d;
        font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
        font-size: 12px;
      }

      .embedpay-error {
        color: #b42318;
      }
    </style>
    <section class="embedpay-widget" aria-live="polite">
      <h2 class="embedpay-title">Pay with Stellar</h2>
      <p class="embedpay-meta">${state.amount ? `${state.amount} ${state.asset}` : state.asset} on ${state.network}</p>
      ${
        state.error
          ? `<p class="embedpay-status embedpay-error">${state.error}</p>`
          : `<div class="embedpay-status-row">
              ${state.loading ? '<span class="embedpay-spinner" aria-hidden="true"></span>' : ''}
              <p class="embedpay-status">${state.status}</p>
            </div>`
      }
      ${state.qr ? `<img class="embedpay-qr" src="${state.qr}" alt="Stellar payment QR code">` : ''}
      <p class="embedpay-address">${state.destination}</p>
    </section>
  `;
}

/**
 * Mount an EmbedPay Stellar payment widget into a DOM container.
 *
 * @param {{
 *   container: string | Element,
 *   destination: string,
 *   amount?: string | number,
 *   asset?: string,
 *   network?: 'mainnet' | 'testnet',
 *   memo?: string,
 *   onReady?: (result: {accountId: string, paymentUri: string}) => void,
 *   onError?: (error: Error) => void
 * }} config - Widget configuration.
 * @returns {Promise<ShadowRoot>} Shadow root containing the mounted widget.
 * @throws {Error} When the container cannot be found, the destination is missing, or account/QR generation fails.
 */
export async function mountPaymentWidget(config) {
  const options = { ...DEFAULTS, ...config };
  const container = resolveContainer(options.container);

  if (!container) {
    throw new Error('EmbedPay container was not found.');
  }

  if (!options.destination) {
    throw new Error('EmbedPay destination is required.');
  }

  const shadowRoot = container.attachShadow({ mode: 'open' });

  render(shadowRoot, {
    ...options,
    status: 'Preparing payment request...',
    loading: false
  });

  try {
    await fetchAccountInfo(options.destination, { network: options.network });
    const qr = await generateQrCode(options.destination, options);

    render(shadowRoot, {
      ...options,
      qr: qr.dataUrl,
      status: 'Waiting for payment confirmation...',
      loading: true
    });

    options.onReady?.({ accountId: options.destination, paymentUri: qr.uri });
    return shadowRoot;
  } catch (error) {
    render(shadowRoot, {
      ...options,
      status: '',
      loading: false,
      error: error.message
    });

    options.onError?.(error);
    throw error;
  }
}
