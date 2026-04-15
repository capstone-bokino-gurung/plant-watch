import { createGreenhouse, getUserGreenhouses, deleteGreenhouse } from '@/services/greenhouse';
import { supabase } from '@/util/supabase';

// Mock Supabase
jest.mock('@/util/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Greenhouse Service - Unit Tests', () => {
  const mockUserId = 'user-123';
  const mockGreenhouseId = 'greenhouse-456';
  const mockGreenhouseName = 'Test Greenhouse';

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  describe('createGreenhouse', () => {
    it('should successfully create a new greenhouse when no duplicates exist', async () => {
      // Mock: No existing permissions
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      // Mock: RPC call succeeds
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ greenhouse_id: mockGreenhouseId }],
        error: null,
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.error).toBeUndefined();
      expect(result.data).toBe(mockGreenhouseId);
      expect(supabase.rpc).toHaveBeenCalledWith('create_greenhouse_with_permission', {
        p_user_id: mockUserId,
        p_greenhouse_name: mockGreenhouseName,
      });
    });

    it('should return error when duplicate greenhouse name exists', async () => {
      // Mock: User has existing permissions
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ greenhouse_id: 'existing-id' }],
          error: null,
        }),
      });

      // Mock: Greenhouse with same name exists
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { greenhouse_id: 'existing-id' },
          error: null,
        }),
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.error).toBe('You already have a greenhouse with this name');
      expect(result.data).toBeUndefined();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should return error when permissions query fails', async () => {
      const mockError = { message: 'Database connection failed', code: '500' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeUndefined();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should return error when duplicate check query fails', async () => {
      const mockError = { message: 'Query failed', code: '400' };

      // Mock: User has permissions
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ greenhouse_id: 'test' }],
          error: null,
        }),
      });

      // Mock: Duplicate check fails
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeUndefined();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should return error when RPC call fails', async () => {
      const mockError = { message: 'RPC failed', code: 'test' };

      // Mock: No existing permissions
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      // Mock: RPC fails
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeUndefined();
    });

    it('should skip duplicate check when user has no permissions', async () => {
      // Mock: No existing permissions
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      // Mock: RPC succeeds
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ greenhouse_id: mockGreenhouseId }],
        error: null,
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.data).toBe(mockGreenhouseId);
      // Should only have called from() once (for permissions check)
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('should handle RPC returning empty array', async () => {
      // Mock: No existing permissions
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      // Mock: RPC returns empty array
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await createGreenhouse(mockGreenhouseName);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('getUserGreenhouses', () => {
    it('should return user greenhouses successfully', async () => {
      const mockGreenhouses = [
        { greenhouse_id: '1', name: 'Greenhouse 1', created_at: 'testdate' },
        { greenhouse_id: '2', name: 'Greenhouse 2', created_at: 'testdate' },
      ];

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [
            { greenhouses: mockGreenhouses[0] },
            { greenhouses: mockGreenhouses[1] },
          ],
          error: null,
        }),
      });

      const result = await getUserGreenhouses();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(mockGreenhouses);
      expect(supabase.from).toHaveBeenCalledWith('permissions');
    });

    it('should return empty array when user has no greenhouses', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await getUserGreenhouses();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it('should return error message when query fails', async () => {
      const mockError = { message: 'Database error', code: '500' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await getUserGreenhouses();

      expect(result.error).toBe('There was an error retrieving your greenhouses from our database. Please try again later.');
      expect(result.data).toBeUndefined();
    });

    it('should filter out null greenhouses', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [
            { greenhouses: { greenhouse_id: '1', name: 'Valid', created_at: 'testdate' } },
            { greenhouses: null },
            { greenhouses: { greenhouse_id: '2', name: 'Also Valid', created_at: 'testdate' } },
          ],
          error: null,
        }),
      });

      const result = await getUserGreenhouses();

      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual([
        { greenhouse_id: '1', name: 'Valid', created_at: 'testdate' },
        { greenhouse_id: '2', name: 'Also Valid', created_at: 'testdate' },
      ]);
    });

    it('should handle data being null', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const result = await getUserGreenhouses();

      expect(result.data).toEqual([]);
    });

    it('should flatten nested array structure', async () => {
      // Testing the .flat() functionality
      const mockData = [
        { greenhouses: [{ greenhouse_id: '1', name: 'GH1', created_at: 'testdate' }] },
        { greenhouses: [{ greenhouse_id: '2', name: 'GH2', created_at: 'testdate' }] },
      ];

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      const result = await getUserGreenhouses();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.every(item => !Array.isArray(item))).toBe(true);
    });
  });

  describe('deleteGreenhouse', () => {
    it('should successfully delete greenhouse', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const result = await deleteGreenhouse(mockGreenhouseId);

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('greenhouses');
    });

    it('should return error when delete fails', async () => {
      const mockError = { message: 'Permission denied', code: '403' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: mockError,
        }),
      });

      const result = await deleteGreenhouse(mockGreenhouseId);

      expect(result.error).toEqual(mockError);
    });

    it('should call delete with correct greenhouse_id', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: mockEq,
      });

      await deleteGreenhouse(mockGreenhouseId);

      expect(mockEq).toHaveBeenCalledWith('greenhouse_id', mockGreenhouseId);
    });

    it('should handle RLS policy blocking delete', async () => {
      const mockRLSError = { 
        message: 'new row violates row-level security policy',
        code: '42501'
      };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: mockRLSError,
        }),
      });

      const result = await deleteGreenhouse(mockGreenhouseId);

      expect(result.error).toEqual(mockRLSError);
    });
  });
});