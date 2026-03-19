/**
 * Mapping of Indian Bank names to official logo URLs (mostly from Wikimedia Commons)
 * This list covers major public, private, small finance, and payments banks in India.
 */
export const BANK_LOGO_MAP: { [key: string]: string } = {
  // User-provided Bank List (using Google Favicon API for reliable fetching)
  "State Bank of India": "https://www.google.com/s2/favicons?domain=onlinesbi.sbi&sz=128",
  "SBI": "https://www.google.com/s2/favicons?domain=onlinesbi.sbi&sz=128",
  "HDFC Bank": "https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128",
  "HDFC": "https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128",
  "ICICI Bank": "https://www.google.com/s2/favicons?domain=icici.bank.in&sz=128",
  "ICICI": "https://www.google.com/s2/favicons?domain=icici.bank.in&sz=128",
  "Axis Bank": "https://www.vectorlogo.zone/logos/axisbank/axisbank-icon.svg",
  "AXIS": "https://www.vectorlogo.zone/logos/axisbank/axisbank-icon.svg",
  "Kotak Mahindra Bank": "https://www.vectorlogo.zone/logos/kotak/kotak-icon.svg",
  "KOTAK": "https://www.vectorlogo.zone/logos/kotak/kotak-icon.svg",
  "IDFC FIRST Bank": "https://www.google.com/s2/favicons?domain=idfcfirst.bank.in&sz=128",
  "IDFC": "https://www.google.com/s2/favicons?domain=idfcfirst.bank.in&sz=128",
  "IndusInd Bank": "https://www.google.com/s2/favicons?domain=indusind.bank.in&sz=128",
  "INDUS": "https://www.google.com/s2/favicons?domain=indusind.bank.in&sz=128",
  "Punjab National Bank": "https://www.google.com/s2/favicons?domain=pnb.bank.in&sz=128",
  "PNB": "https://www.google.com/s2/favicons?domain=pnb.bank.in&sz=128",
  "Bank of Baroda": "https://www.google.com/s2/favicons?domain=bankofbaroda.in&sz=128",
  "BOB": "https://www.google.com/s2/favicons?domain=bankofbaroda.in&sz=128",
  "Canara Bank": "https://www.google.com/s2/favicons?domain=canarabank.bank.in&sz=128",
  "CANARA": "https://www.google.com/s2/favicons?domain=canarabank.bank.in&sz=128",
  "Union Bank of India": "https://www.google.com/s2/favicons?domain=www.unionbankofindia.co.in&sz=128",
  "UBI": "https://www.google.com/s2/favicons?domain=www.unionbankofindia.co.in&sz=128",
  "Yes Bank": "https://www.google.com/s2/favicons?domain=yes.bank.in&sz=128",
  "YES": "https://www.google.com/s2/favicons?domain=yes.bank.in&sz=128",
  "Federal Bank": "https://www.google.com/s2/favicons?domain=www.federal.bank.in&sz=128",
  "FED": "https://www.google.com/s2/favicons?domain=www.federal.bank.in&sz=128",
  "Bandhan Bank": "https://www.google.com/s2/favicons?domain=bandhan.bank.in&sz=128",
  "BANDHAN": "https://www.google.com/s2/favicons?domain=bandhan.bank.in&sz=128",
  "RBL Bank": "https://www.google.com/s2/favicons?domain=rbl.bank.in&sz=128",
  "RBL": "https://www.google.com/s2/favicons?domain=rbl.bank.in&sz=128",
  "South Indian Bank": "https://www.google.com/s2/favicons?domain=southindianbank.bank.in&sz=128",
  "SIB": "https://www.google.com/s2/favicons?domain=southindianbank.bank.in&sz=128",
  "Karur Vysya Bank": "https://www.google.com/s2/favicons?domain=kvb.bank.in&sz=128",
  "KVB": "https://www.google.com/s2/favicons?domain=kvb.bank.in&sz=128",
  "City Union Bank": "https://www.google.com/s2/favicons?domain=cityunionbank.bank.in&sz=128",
  "CUB": "https://www.google.com/s2/favicons?domain=cityunionbank.bank.in&sz=128",
  "Dhanlaxmi Bank": "https://www.google.com/s2/favicons?domain=dhan.bank.in&sz=128",
  "DHAN": "https://www.google.com/s2/favicons?domain=dhan.bank.in&sz=128",
  "UCO Bank": "https://www.google.com/s2/favicons?domain=www.uco.bank.in&sz=128",
  "UCO": "https://www.google.com/s2/favicons?domain=www.uco.bank.in&sz=128",
  "Bank of Maharashtra": "https://www.google.com/s2/favicons?domain=bankofmaharashtra.bank.in&sz=128",
  "BOM": "https://www.google.com/s2/favicons?domain=bankofmaharashtra.bank.in&sz=128",
  "Indian Bank": "https://www.google.com/s2/favicons?domain=indianbank.bank.in&sz=128",
  "IND": "https://www.google.com/s2/favicons?domain=indianbank.bank.in&sz=128",
  "Central Bank of India": "https://www.google.com/s2/favicons?domain=www.centralbank.bank.in&sz=128",
  "CBI": "https://www.google.com/s2/favicons?domain=www.centralbank.bank.in&sz=128",
  "Indian Overseas Bank": "https://www.google.com/s2/favicons?domain=iob.bank.in&sz=128",
  "IOB": "https://www.google.com/s2/favicons?domain=iob.bank.in&sz=128",
  "Punjab & Sind Bank": "https://www.google.com/s2/favicons?domain=punjabandsind.bank.in&sz=128",
  "PSB": "https://www.google.com/s2/favicons?domain=punjabandsind.bank.in&sz=128",
  "IDBI Bank": "https://www.google.com/s2/favicons?domain=idbi.bank.in&sz=128",
  "IDBI": "https://www.google.com/s2/favicons?domain=idbi.bank.in&sz=128",
  "Standard Chartered India": "https://www.google.com/s2/favicons?domain=sc.com/in&sz=128",
  "SCB": "https://www.google.com/s2/favicons?domain=sc.com/in&sz=128",
  "HSBC India": "https://www.google.com/s2/favicons?domain=hsbc.co.in&sz=128",
  "HSBC": "https://www.google.com/s2/favicons?domain=hsbc.co.in&sz=128",
  "DBS Bank India": "https://www.google.com/s2/favicons?domain=dbs.com/in&sz=128",
  "DBS": "https://www.google.com/s2/favicons?domain=dbs.com/in&sz=128",
  "Saraswat Bank": "https://www.google.com/s2/favicons?domain=www.saraswat.bank.in&sz=128",
  "SARAS": "https://www.google.com/s2/favicons?domain=www.saraswat.bank.in&sz=128",
  "SVC Bank": "https://www.google.com/s2/favicons?domain=www.svc.bank.in&sz=128",
  "SVC": "https://www.google.com/s2/favicons?domain=www.svc.bank.in&sz=128",
  "Karnataka Bank": "https://www.google.com/s2/favicons?domain=karnatakabank.bank.in&sz=128",
  "KARN": "https://www.google.com/s2/favicons?domain=karnatakabank.bank.in&sz=128",
  "Tamilnad Mercantile Bank": "https://www.google.com/s2/favicons?domain=www.tmb.bank.in&sz=128",
  "TMB": "https://www.google.com/s2/favicons?domain=www.tmb.bank.in&sz=128",
  "DCB Bank": "https://www.google.com/s2/favicons?domain=www.dcb.bank.in&sz=128",
  "DCB": "https://www.google.com/s2/favicons?domain=www.dcb.bank.in&sz=128",
  "J&K Bank": "https://www.google.com/s2/favicons?domain=jkb.bank.in&sz=128",
  "JKB": "https://www.google.com/s2/favicons?domain=jkb.bank.in&sz=128",
  "Catholic Syrian Bank": "https://www.google.com/s2/favicons?domain=www.csb.bank.in&sz=128",
  "Equitas Small Finance Bank": "https://www.google.com/s2/favicons?domain=equitas.bank.in&sz=128",
  "EQUITAS": "https://www.google.com/s2/favicons?domain=equitas.bank.in&sz=128",
  "AU Small Finance Bank": "https://www.google.com/s2/favicons?domain=www.au.bank.in&sz=128",
  "AUBANK": "https://www.google.com/s2/favicons?domain=www.au.bank.in&sz=128",
  "Ujjivan Small Finance Bank": "https://www.google.com/s2/favicons?domain=www.ujjivansfb.bank.in&sz=128",
  "UJJIVAN": "https://www.google.com/s2/favicons?domain=www.ujjivansfb.bank.in&sz=128",
  "Jana Small Finance Bank": "https://www.google.com/s2/favicons?domain=www.jana.bank.in&sz=128",
  "JANA": "https://www.google.com/s2/favicons?domain=www.jana.bank.in&sz=128",
  "ESAF Small Finance Bank": "https://www.google.com/s2/favicons?domain=www.esaf.bank.in&sz=128",
  "ESAF": "https://www.google.com/s2/favicons?domain=www.esaf.bank.in&sz=128",
  "Suryoday Small Finance Bank": "https://www.google.com/s2/favicons?domain=suryoday.bank.in&sz=128",
  "SURYODAY": "https://www.google.com/s2/favicons?domain=suryoday.bank.in&sz=128",
  "Capital Small Finance Bank": "https://www.google.com/s2/favicons?domain=www.capital.bank.in&sz=128",
  "CAPITAL": "https://www.google.com/s2/favicons?domain=www.capital.bank.in&sz=128",
  "North East Small Finance Bank": "https://www.google.com/s2/favicons?domain=www.nesfb.com&sz=128",
  "NESFB": "https://www.google.com/s2/favicons?domain=www.nesfb.com&sz=128",
  "Shivalik Small Finance Bank": "https://www.google.com/s2/favicons?domain=netbanking.shivalik.bank.in&sz=128",
  "SHIVALIK": "https://www.google.com/s2/favicons?domain=netbanking.shivalik.bank.in&sz=128",
  "Unity Small Finance Bank": "https://www.google.com/s2/favicons?domain=unity.bank.in&sz=128",
  "UNITY": "https://www.google.com/s2/favicons?domain=unity.bank.in&sz=128",
  "Airtel Payments Bank": "https://www.google.com/s2/favicons?domain=airtel.in&sz=128",
  "AIRTEL": "https://www.google.com/s2/favicons?domain=airtel.in&sz=128",
  "Paytm Payments Bank": "https://www.google.com/s2/favicons?domain=www.paytm.bank.in&sz=128",
  "PAYTM": "https://www.google.com/s2/favicons?domain=www.paytm.bank.in&sz=128",
  "Jio Payments Bank": "https://www.google.com/s2/favicons?domain=jio.com&sz=128",
  "JIO": "https://www.google.com/s2/favicons?domain=jio.com&sz=128",
  "Slice": "https://slice.bank.in/android-chrome-512x512.png",
  "SLICE": "https://slice.bank.in/android-chrome-512x512.png",
};

/**
 * Normalizes a bank name for better fuzzy matching.
 */
const normalize = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/bank/g, "")
    .replace(/ltd/g, "")
    .replace(/limited/g, "")
    .replace(/india/g, "")
    .replace(/first/g, "")
    .replace(/mahndra/g, "mahindra") // common typo
    .trim();
};

/**
 * Returns the logo URL for a given bank name using fuzzy matching.
 * Fallback to a generic bank icon or letter avatar can be handled by the caller.
 */
export const getBankLogo = (bankName: string): string | null => {
  if (!bankName) return null;

  // 1. Direct match
  if (BANK_LOGO_MAP[bankName]) return BANK_LOGO_MAP[bankName];

  // 2. Normalized match
  const normalizedInput = normalize(bankName);

  // Try to find a match in values or keys
  for (const key in BANK_LOGO_MAP) {
    if (normalize(key) === normalizedInput) {
      return BANK_LOGO_MAP[key];
    }
  }

  // 3. Partial match (e.g., "HDFC" matches "HDFC Bank")
  for (const key in BANK_LOGO_MAP) {
    if (normalizedInput.includes(normalize(key)) || normalize(key).includes(normalizedInput)) {
      return BANK_LOGO_MAP[key];
    }
  }

  return null;
};
