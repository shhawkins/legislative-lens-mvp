import { ApiService } from '../ApiService';
import { ApiResponse, Bill } from '../types';

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    apiService = ApiService.getInstance();
  });

  describe('getBills', () => {
    it('should fetch bills successfully', async () => {
      // Mock response data
      const mockResponse: ApiResponse<Bill> = {
        pagination: {
          count: 1,
          totalCount: 1
        },
        request: {
          contentType: 'application/json',
          format: 'json'
        },
        bills: [{
          congress: 118,
          number: 'HR1234',
          type: 'hr',
          title: 'Test Bill',
          originChamber: 'House',
          originChamberCode: 'H',
          introducedDate: '2023-01-01',
          latestAction: {
            actionDate: '2023-01-02',
            text: 'Introduced'
          },
          sponsors: [],
          cosponsors: {
            count: 0,
            list: []
          },
          committees: {
            count: 0,
            list: []
          },
          actions: {
            count: 0,
            list: []
          },
          summaries: {
            count: 0,
            list: []
          },
          subjects: {
            count: 0,
            policyArea: {
              name: ''
            },
            legislativeSubjects: []
          },
          textVersions: {
            count: 0,
            list: []
          },
          titles: {
            count: 0,
            list: []
          },
          relatedBills: {
            count: 0,
            list: []
          },
          laws: [],
          cboCostEstimates: [],
          committeeReports: [],
          constitutionalAuthorityStatementText: '',
          updateDate: '',
          updateDateIncludingText: ''
        }]
      };

      // Mock the fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Call the method
      const result = await apiService.getBills();

      // Verify the result
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bill/118'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      // Mock a failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' })
      });

      // Verify that the error is thrown
      await expect(apiService.getBills()).rejects.toThrow('Failed to fetch bills');
    });

    it('should retry on server errors', async () => {
      // Mock two failed responses followed by a success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal Server Error' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal Server Error' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            pagination: { count: 0, totalCount: 0 },
            request: { contentType: 'application/json', format: 'json' },
            bills: []
          })
        });

      // Call the method
      await apiService.getBills();

      // Verify that fetch was called 3 times (initial + 2 retries)
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
}); 