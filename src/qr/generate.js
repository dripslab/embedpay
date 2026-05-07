import QRCode from 'qrcode';

export function buildStellarPaymentUri(address, options = {}) {
  if (!address) {
    throw new Error('A Stellar destination address is required.');
  }

  const params = new URLSearchParams({ destination: address });

  if (options.amount) params.set('amount', options.amount);
  if (options.asset) params.set('asset_code', options.asset);
  if (options.memo) params.set('memo', options.memo);

  return `web+stellar:pay?${params.toString()}`;
}

export async function generateQrCode(address, options = {}) {
  const uri = buildStellarPaymentUri(address, options);
  const dataUrl = await QRCode.toDataURL(uri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: options.width ?? 256
  });

  return {
    uri,
    dataUrl
  };
}
