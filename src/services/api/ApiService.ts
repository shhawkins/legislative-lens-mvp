import { API_CONFIG, API_KEY } from './config';
import { ApiResponse, Bill, Member, Committee } from './types';

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
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

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

  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    params?: Record<string, any>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });
      }

      const response = await fetch(url.toString(), {
        ...options,
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (retries > 0 && error instanceof ApiError && (error.status || 0) >= 500) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.fetchWithRetry(endpoint, options, params, retries - 1);
      }
      throw error;
    }
  }

  private formatEndpoint(endpoint: string, params: Record<string, string>): string {
    return endpoint.replace(/\{(\w+)\}/g, (_, key) => params[key] || '');
  }

  // Bill endpoints
  public async getBills(
    congress: number = 118,
    offset: number = 0,
    limit: number = 20
  ): Promise<ApiResponse<Bill>> {
    try {
      return await this.fetchWithRetry<ApiResponse<Bill>>(
        `/bill/${congress}`,
        {
          method: 'GET'
        },
        {
          offset,
          limit
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch bills',
        500,
        error
      );
    }
  }

  public async getBillById(
    congress: number,
    billType: string,
    billNumber: string
  ): Promise<ApiResponse<Bill>> {
    try {
      return await this.fetchWithRetry<ApiResponse<Bill>>(
        `/bill/${congress}/${billType}/${billNumber}`,
        {
          method: 'GET'
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch bill',
        500,
        error
      );
    }
  }

  // Member endpoints
  public async getMembers(
    congress: number = 118,
    chamber: 'house' | 'senate',
    offset: number = 0,
    limit: number = 20
  ): Promise<ApiResponse<Member>> {
    try {
      return await this.fetchWithRetry<ApiResponse<Member>>(
        `/member/${chamber}/${congress}`,
        {
          method: 'GET'
        },
        {
          offset,
          limit
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch members',
        500,
        error
      );
    }
  }

  public async getMemberById(bioguideId: string): Promise<ApiResponse<Member>> {
    try {
      return await this.fetchWithRetry<ApiResponse<Member>>(
        `/member/${bioguideId}`,
        {
          method: 'GET'
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch member',
        500,
        error
      );
    }
  }

  // Committee endpoints
  public async getCommittees(
    congress: number = 118,
    type: 'house' | 'senate' | 'joint',
    offset: number = 0,
    limit: number = 20
  ): Promise<ApiResponse<Committee>> {
    try {
      return await this.fetchWithRetry<ApiResponse<Committee>>(
        `/committee/${type}/${congress}`,
        {
          method: 'GET'
        },
        {
          offset,
          limit
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch committees',
        500,
        error
      );
    }
  }

  public async getCommitteeById(
    congress: number,
    type: string,
    committeeId: string
  ): Promise<ApiResponse<Committee>> {
    try {
      return await this.fetchWithRetry<ApiResponse<Committee>>(
        `/committee/${type}/${congress}/${committeeId}`,
        {
          method: 'GET'
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to fetch committee',
        500,
        error
      );
    }
  }
} 