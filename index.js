import { fetchAccountInfo as loadAccountInfo, getHorizonServer } from './src/core/horizon.js';
import { generateQrCode, buildStellarPaymentUri } from './src/qr/generate.js';
import { mountPaymentWidget } from './src/ui/widget.js';

const HORIZON_ERROR_NAMES = new Set(['BadResponseError', 'NetworkError', 'NotFoundError']);

function getHorizonErrorDetails(error) {
  const response = error?.response;
  const data = response?.data ?? error?.data;
  const status = response?.status ?? error?.status;
  const title = data?.title ?? error?.title;
  const detail = data?.detail ?? error?.message;
  const extras = data?.extras;

  return {
    status,
    title,
    detail,
    extras
  };
}

function isHorizonApiError(error) {
  return Boolean(
    error?.response ||
      error?.data ||
      error?.isAxiosError ||
      HORIZON_ERROR_NAMES.has(error?.name)
  );
}

function formatHorizonApiError(error) {
  const { status, title, detail, extras } = getHorizonErrorDetails(error);
  const parts = ['EmbedPay Horizon API error'];

  if (status) {
    parts.push(`status ${status}`);
  }

  if (title) {
    parts.push(title);
  }

  if (detail && detail !== title) {
    parts.push(detail);
  }

  if (extras?.result_codes) {
    parts.push(`result codes: ${JSON.stringify(extras.result_codes)}`);
  }

  return parts.join(' - ');
}

function logHorizonApiError(error, context) {
  if (!isHorizonApiError(error)) {
    return;
  }

  console.error(`${formatHorizonApiError(error)} (${context})`, error);
}

async function fetchAccountInfo(accountId, options = {}) {
  try {
    return await loadAccountInfo(accountId, options);
  } catch (error) {
    logHorizonApiError(error, `fetchAccountInfo account ${accountId || 'unknown'}`);
    throw error;
  }
}

const EmbedPay = {
  async init(config) {
    try {
      return await mountPaymentWidget(config);
    } catch (error) {
      logHorizonApiError(error, `init destination ${config?.destination || 'unknown'}`);
      throw error;
    }
  },
  fetchAccountInfo,
  generateQrCode,
  buildStellarPaymentUri,
  getHorizonServer
};

export default EmbedPay;
export {
  buildStellarPaymentUri,
  fetchAccountInfo,
  generateQrCode,
  getHorizonServer,
  mountPaymentWidget
};
