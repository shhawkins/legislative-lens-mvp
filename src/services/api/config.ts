export const API_CONFIG = {
  BASE_URL: 'https://api.congress.gov/v3',
  ENDPOINTS: {
    BILL: '/bill/{congress}/{type}/{number}',
    MEMBER: '/member/{bioguideId}',
    COMMITTEE: '/committee/{congress}/{chamber}/{code}'
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

export const API_KEY = process.env.REACT_APP_CONGRESS_API_KEY || '';

if (!API_KEY) {
  console.warn('Congress.gov API key not found. Please set REACT_APP_CONGRESS_API_KEY environment variable.');
} 