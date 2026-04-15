import { getDevices, createDevice, deleteDevice } from '@/services/device';
import { supabase } from '@/util/supabase';

// Mock Supabase
jest.mock('@/util/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Device Service - Unit Tests', () => {
  const mockGreenhouseId = 'greenhouse-123';
  const mockDeviceId = 'device-123';

  const mockDevice = {
    device_id: mockDeviceId,
    name: 'Soil Sensor A',
    type: 'Rainpoint Soil Moisture Sensor',
    greenhouse_id: mockGreenhouseId,
    track_history: true,
    history_length: 30,
    data: null,
    created_at: 'testdate',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDevices', () => {
    it('should return devices for the given greenhouse', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [mockDevice], error: null }),
      });

      const result = await getDevices(mockGreenhouseId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([mockDevice]);
    });

    it('should return an empty array when the greenhouse has no devices', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await getDevices(mockGreenhouseId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('should return null data and error on query failure', async () => {
      const mockError = { message: 'Database connection failed', code: '500' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      const result = await getDevices(mockGreenhouseId);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('createDevice', () => {
    it('should successfully create a device with history tracking enabled', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDevice, error: null }),
      });

      const result = await createDevice(
        'Soil Sensor A',
        'Rainpoint Soil Moisture Sensor',
        mockGreenhouseId,
        true,
        30,
      );

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockDevice);
    });

    it('should successfully create a device with history tracking disabled (length 0)', async () => {
      const noHistoryDevice = { ...mockDevice, track_history: false, history_length: 0 };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: noHistoryDevice, error: null }),
      });

      const result = await createDevice(
        'Soil Sensor A',
        'Rainpoint Soil Moisture Sensor',
        mockGreenhouseId,
        false,
        0,
      );

      expect(result.error).toBeNull();
      expect(result.data).toEqual(noHistoryDevice);
    });

    it('should insert all provided fields', async () => {
      const mockInsert = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsert,
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDevice, error: null }),
      });

      await createDevice(
        'Soil Sensor A',
        'Rainpoint Soil Moisture Sensor',
        mockGreenhouseId,
        true,
        30,
      );

      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Soil Sensor A',
        type: 'Rainpoint Soil Moisture Sensor',
        greenhouse_id: mockGreenhouseId,
        track_history: true,
        history_length: 30,
      });
    });

    it('should error when insert fails', async () => {
      const mockError = { message: 'Insert failed', code: '400' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      const result = await createDevice(
        'Soil Sensor A',
        'Rainpoint Soil Moisture Sensor',
        mockGreenhouseId,
        true,
        30,
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('deleteDevice', () => {
    it('should successfully delete a device', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteDevice(mockDeviceId);

      expect(result.error).toBeNull();
    });

    it('should return error when delete fails', async () => {
      const mockError = { message: 'Permission denied', code: '403' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const result = await deleteDevice(mockDeviceId);

      expect(result.error).toEqual(mockError);
    });
  });
});
