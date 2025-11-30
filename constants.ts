
export const TIMEFRAMES = [
  'Scalping (1m - 5m)',
  'Intraday (15m - 1h)',
  'Swing (4h - Daily)',
  'Position (Weekly)'
];

export const RISK_LEVELS = [
  'Conservative',
  'Moderate',
  'Aggressive'
];

// PayPal Configuration
export const PAYPAL_MERCHANT_ID = "WGUC39QX6EGBG";
export const PAYPAL_DISPLAY_NAME = "Mazen Huissen";
export const PAYPAL_EMAIL = "mezzohuissen@gmail.com";

// Base Payment URL (Standard Checkout)
// Using Merchant ID is the most robust method for Business accounts
export const OWNER_PAYPAL_LINK = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_MERCHANT_ID}&currency_code=USD&no_shipping=1&no_note=1`;
