/**
 * Mapping of Indian Bank names to their slugs in the self-hosted logo repo.
 * Logo source: https://github.com/keyushhh/indian-bank-logos
 */
export const BANK_SLUG_MAP: { [key: string]: string } = {
  "State Bank of India": "sbi",
  "SBI": "sbi",
  "HDFC Bank": "hdfc",
  "HDFC": "hdfc",
  "ICICI Bank": "icici",
  "ICICI": "icici",
  "Axis Bank": "axis",
  "AXIS": "axis",
  "Kotak Mahindra Bank": "kotak",
  "KOTAK": "kotak",
  "IDFC FIRST Bank": "idfc",
  "IDFC": "idfc",
  "IndusInd Bank": "indusind",
  "INDUS": "indusind",
  "Punjab National Bank": "pnb",
  "PNB": "pnb",
  "Bank of Baroda": "bob",
  "BOB": "bob",
  "Canara Bank": "canara",
  "CANARA": "canara",
  "Union Bank of India": "union",
  "UBI": "union",
  "Yes Bank": "yes",
  "YES": "yes",
  "Federal Bank": "federal",
  "FED": "federal",
  "Bandhan Bank": "bandhan",
  "BANDHAN": "bandhan",
  "RBL Bank": "rbl",
  "RBL": "rbl",
  "South Indian Bank": "south-indian",
  "SIB": "south-indian",
  "Karur Vysya Bank": "karur-vysya",
  "KVB": "kvb",
  "City Union Bank": "cub",
  "CUB": "cub",
  "Dhanlaxmi Bank": "dhanlaxmi",
  "DHAN": "dhanlaxmi",
  "UCO Bank": "uco",
  "UCO": "uco",
  "Bank of Maharashtra": "maharashtra",
  "BOM": "bom",
  "Indian Bank": "indian-bank",
  "IND": "indian-bank",
  "Central Bank of India": "central-bank",
  "CBI": "central-bank",
  "Indian Overseas Bank": "iob",
  "IOB": "iob",
  "Punjab & Sind Bank": "psb",
  "PSB": "psb",
  "IDBI Bank": "idbi",
  "IDBI": "idbi",
  "Standard Chartered India": "sc",
  "SCB": "sc",
  "HSBC India": "hsbc",
  "HSBC": "hsbc",
  "DBS Bank India": "dbs",
  "DBS": "dbs",
  "Saraswat Bank": "saraswat",
  "SARAS": "saraswat",
  "SVC Bank": "svc",
  "SVC": "svc",
  "Karnataka Bank": "karnataka",
  "KARN": "karnataka",
  "Tamilnad Mercantile Bank": "tmb",
  "TMB": "tmb",
  "DCB Bank": "dcb",
  "DCB": "dcb",
  "J&K Bank": "jkb",
  "JKB": "jkb",
  "Catholic Syrian Bank": "csb",
  "Equitas Small Finance Bank": "equitas",
  "EQUITAS": "equitas",
  "AU Small Finance Bank": "au",
  "AUBANK": "au",
  "Ujjivan Small Finance Bank": "ujjivan",
  "UJJIVAN": "ujjivan",
  "Jana Small Finance Bank": "jana",
  "JANA": "jana",
  "ESAF Small Finance Bank": "esaf",
  "ESAF": "esaf",
  "Suryoday Small Finance Bank": "suryoday",
  "SURYODAY": "suryoday",
  "Capital Small Finance Bank": "capital-sfb",
  "CAPITAL": "capital-sfb",
  "North East Small Finance Bank": "north-east-sfb",
  "NESFB": "nesfb",
  "Shivalik Small Finance Bank": "shivalik",
  "SHIVALIK": "shivalik",
  "Unity Small Finance Bank": "unity",
  "UNITY": "unity",
  "Airtel Payments Bank": "airtel",
  "AIRTEL": "airtel",
  "Paytm Payments Bank": "paytm",
  "PAYTM": "paytm",
  "Jio Payments Bank": "jio",
  "JIO": "jio",
  "Slice": "slice",
  "SLICE": "slice",
};

const normalize = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/bank/g, "")
    .replace(/ltd/g, "")
    .replace(/limited/g, "")
    .replace(/india/g, "")
    .replace(/first/g, "")
    .replace(/mahndra/g, "mahindra")
    .trim();
};

export const getBankLogo = (bankName: string): string | null => {
  if (!bankName) return null;

  const getUrl = (slug: string) => `https://cdn.jsdelivr.net/gh/keyushhh/indian-bank-logos@latest/logos/${slug}.svg`;

  // 1. Direct match
  if (BANK_SLUG_MAP[bankName]) return getUrl(BANK_SLUG_MAP[bankName]);

  // 2. Normalized match
  const normalizedInput = normalize(bankName);
  for (const key in BANK_SLUG_MAP) {
    if (normalize(key) === normalizedInput) {
      return getUrl(BANK_SLUG_MAP[key]);
    }
  }

  // 3. Partial match
  for (const key in BANK_SLUG_MAP) {
    if (normalizedInput.includes(normalize(key)) || normalize(key).includes(normalizedInput)) {
      return getUrl(BANK_SLUG_MAP[key]);
    }
  }

  return null;
};
