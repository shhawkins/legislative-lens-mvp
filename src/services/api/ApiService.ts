import { API_CONFIG, API_KEY } from './config';
import { ApiResponse, Bill } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private headers: HeadersInit;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.headers = {
      ...API_CONFIG.DEFAULT_HEADERS,
      'X-API-Key': API_KEY
    };
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      throw new ApiError(
        `API request failed with status ${response.status}`,
        response.status,
        await response.json()
      );
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      message: 'Success'
    };
  }

  private formatEndpoint(endpoint: string, params: Record<string, string>): string {
    let formattedEndpoint = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      formattedEndpoint = formattedEndpoint.replace(`{${key}}`, value);
    });
    return formattedEndpoint;
  }

  /**
   * Fetches bill information from the Congress.gov API
   * @param congress - Congress number (e.g., 117)
   * @param type - Bill type (e.g., 'hr' for House Bill)
   * @param number - Bill number
   * @returns Promise with bill data
   */
  public async getBill(congress: string, type: string, number: string): Promise<ApiResponse<Bill>> {
    try {
      const endpoint = this.formatEndpoint(API_CONFIG.ENDPOINTS.BILL, {
        congress,
        type,
        number
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.headers
      });

      return this.handleResponse<Bill>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch bill data',
        500,
        error
      );
    }
  }

  // Example usage:
  // const api = ApiService.getInstance();
  // const bill = await api.getBill('117', 'hr', '3076');
} 