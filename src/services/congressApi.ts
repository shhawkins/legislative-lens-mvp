import axios from 'axios';

const API_KEY = process.env.REACT_APP_CONGRESS_API_KEY;
const BASE_URL = 'https://cors.sh/https://api.congress.gov/v3';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  params: {
    api_key: API_KEY,
    format: 'json'
  }
});

export interface ApiResponse<T> {
  pagination: {
    count: number;
    totalCount: number;
  };
  request: {
    contentType: string;
    format: string;
  };
  bills?: T[];
  members?: T[];
  committees?: T[];
}

export const congressApi = {
  // Bills
  async getBills(congress: number = 118, offset: number = 0, limit: number = 20) {
    const response = await api.get<ApiResponse<any>>(`/bill/${congress}`, {
      params: {
        offset,
        limit
      }
    });
    return response.data;
  },

  async getBillById(congress: number, billType: string, billNumber: number) {
    const response = await api.get<ApiResponse<any>>(`/bill/${congress}/${billType}/${billNumber}`);
    return response.data;
  },

  // Members
  async getMembers(congress: number = 118, chamber: 'house' | 'senate', offset: number = 0, limit: number = 20) {
    const response = await api.get<ApiResponse<any>>(`/member/${chamber}/${congress}`, {
      params: {
        offset,
        limit
      }
    });
    return response.data;
  },

  async getMemberById(bioguideId: string) {
    const response = await api.get<ApiResponse<any>>(`/member/${bioguideId}`);
    return response.data;
  },

  // Committees
  async getCommittees(congress: number = 118, type: 'house' | 'senate' | 'joint', offset: number = 0, limit: number = 20) {
    const response = await api.get<ApiResponse<any>>(`/committee/${type}/${congress}`, {
      params: {
        offset,
        limit
      }
    });
    return response.data;
  },

  async getCommitteeById(congress: number, type: string, committeeId: string) {
    const response = await api.get<ApiResponse<any>>(`/committee/${type}/${congress}/${committeeId}`);
    return response.data;
  }
};

export default congressApi; 