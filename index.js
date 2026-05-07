import { fetchAccountInfo, getHorizonServer } from './src/core/horizon.js';
import { generateQrCode, buildStellarPaymentUri } from './src/qr/generate.js';
import { mountPaymentWidget } from './src/ui/widget.js';

const EmbedPay = {
  init(config) {
    return mountPaymentWidget(config);
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
