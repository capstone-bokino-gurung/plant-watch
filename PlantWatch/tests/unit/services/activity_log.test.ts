import { getPlantLogs, createLog, formatTimestamp } from '@/services/activity_log';
import { supabase } from '@/util/supabase';

jest.mock('@/util/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockUserId = 'user-123';
const mockPlantId = 'plant-456';

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: { id: mockUserId } },
    error: null,
  });
});

describe('formatTimestamp', () => {
  it('combines date and time into a valid ISO string', () => {
    const date = new Date('2026-04-15T00:00:00.000Z');
    const time = new Date('2025-04-15T14:30:00.000Z');
    const result = formatTimestamp(date, time);
    const parsed = new Date(result);
    expect(parsed.getUTCHours()).toBe(14);
    expect(parsed.getUTCMinutes()).toBe(30);
    expect(parsed.toISOString()).toBe(result);
  });
});

describe('getPlantLogs', () => {
  it('returns logs for a given plant', async () => {
    const mockLogs = [
      { id: 'l1', plant_id: mockPlantId, user_id: mockUserId, activity: 'Watering', notes: '', time: '2026-04-15T10:00:00Z' },
      { id: 'l2', plant_id: mockPlantId, user_id: mockUserId, activity: 'Soil Change', notes: '', time: '2026-04-14T08:00:00Z' },
    ];

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockLogs, error: null }),
    });

    const { data, error } = await getPlantLogs(mockPlantId);

    expect(supabase.from).toHaveBeenCalledWith('activity_log');
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });

  it('returns empty array when plant has no logs', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const { data, error } = await getPlantLogs(mockPlantId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('returns error when query fails', async () => {
    const dbError = { message: 'Query failed' };

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: dbError }),
    });

    const { data, error } = await getPlantLogs(mockPlantId);

    expect(data).toBeNull();
    expect(error).toEqual(dbError);
  });
});

describe('createLog', () => {
  it('inserts a log and returns the created record', async () => {
    const mockLog = { id: 'l1', plant_id: mockPlantId, user_id: mockUserId, activity: 'Watering', notes: '', time: '2026-04-15T10:00:00Z' };

    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockLog, error: null }),
    });

    const { data, error } = await createLog(mockPlantId, 'Watering', '', 'mockTime');

    expect(supabase.from).toHaveBeenCalledWith('activity_log');
    expect(error).toBeNull();
    expect(data).toMatchObject({ activity: 'Watering' });
  });

  it('returns not authenticated when user is null', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { error } = await createLog(mockPlantId, 'Watering', '', 'mockTime');

    expect(error).toBe('Not authenticated');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns error when insert fails', async () => {
    const dbError = { message: 'Insert failed' };

    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: dbError }),
    });

    const { data, error } = await createLog(mockPlantId, 'Watering', '', 'mockTime');

    expect(data).toBeNull();
    expect(error).toEqual(dbError);
  });
});
