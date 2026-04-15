import {
  getGreenhousePlants,
  addGreenhousePlant,
  deleteGreenhousePlant,
  scanPlant,
  getDescription,
  deleteScan,
  getScans,
} from '@/services/plant';

import { supabase } from '@/util/supabase';
import { PlantScanResult } from '@/interfaces/plant';  

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// mock supabase for unit testing
jest.mock('@/util/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
        from: jest.fn(),
    },
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockUserId = 'u1';
const mockFrom = supabase.from as jest.Mock;
const mockStorageFrom = supabase.storage.from as jest.Mock;

beforeAll(() => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: { id: mockUserId } },
    error: null,
  });
});

function buildChain(result: { data?: unknown; error?: unknown; count?: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'single', 'order', 'limit'];
  methods.forEach(m => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  Object.assign(chain, result);
  return chain;
}

function buildStorageChain(result: { data?: unknown; error?: unknown }) {
    const chain: Record<string, jest.Mock> = {};
    const methods = ['upload', 'remove', 'getPublicUrl'];
    methods.forEach(m => {
        chain[m] = jest.fn().mockReturnValue(result);
    });
    return chain;
}

beforeEach(() => jest.clearAllMocks());

describe('getGreenhousePlants', () => {
  it('returns plants for a valid greenhouse id', async () => {
    const mockPlants = [
      { plant_id: 'p1', greenhouse_id: 'gh1', label: 'Orange', common_name: 'Orange', scientific_name: 'Citrus Aurantium', notes: '', count: 1, image_url: null },
      { plant_id: 'p2', greenhouse_id: 'gh1', label: 'Basil', common_name: 'Basil', scientific_name: 'Ocimum basilicum', notes: '', count: 3, image_url: null },
    ];

    const chain = buildChain({ data: mockPlants, error: null });
    mockFrom.mockReturnValue(chain);

    const { data, error } = await getGreenhousePlants('gh1');

    expect(mockFrom).toHaveBeenCalledWith('plants');
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.eq).toHaveBeenCalledWith('greenhouse_id', 'gh1');
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data![0].label).toBe('Orange');
  });

  it('returns an empty array when greenhouse has no plants', async () => {
    const chain = buildChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { data, error } = await getGreenhousePlants('gh-empty');

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('returns an error when the query fails', async () => {
    const dbError = { message: 'Connection timeout' };
    const chain = buildChain({ data: null, error: dbError });
    mockFrom.mockReturnValue(chain);

    const { data, error } = await getGreenhousePlants('gh1');

    expect(data).toBeNull();
    expect(error).toEqual(dbError);
  });
});

describe('addGreenhousePlant', () => {
  const newPlant = {
    plant_id: 'p99',
    greenhouse_id: 'gh1',
    common_name: 'Mint',
    scientific_name: 'Mentha',
    notes: 'Grows',
    label: 'My Mint',
    count: 2,
    image_url: null,
  };

  it('inserts a plant and returns the created record', async () => {
    const chain = buildChain({ data: newPlant, error: null });
    mockFrom.mockReturnValue(chain);

    const { data, error } = await addGreenhousePlant(
      'gh1',
      'Mint',
      'Mentha',
      'Grows',
      'My Mint',
      2,
    );

    expect(mockFrom).toHaveBeenCalledWith('plants');
    expect(chain.insert).toHaveBeenCalledWith({
      greenhouse_id: 'gh1',
      common_name: 'Mint',
      scientific_name: 'Mentha',
      notes: 'Grows',
      label: 'My Mint',
      count: 2,
      image_url: null,         
    });
    expect(error).toBeNull();
    expect(data).toMatchObject({ plant_id: 'p99', label: 'My Mint' });
  });

  it('stores the provided image URL', async () => {
    const withImage = { ...newPlant, image_url: 'https://example.com/mint.jpg' };
    const chain = buildChain({ data: withImage, error: null });
    mockFrom.mockReturnValue(chain);

    const { data } = await addGreenhousePlant(
      'gh1', 'Mint', 'Mentha', '', 'My Mint', 1, 'https://example.com/mint.jpg',
    );

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ image_url: 'https://example.com/mint.jpg' }),
    );
    expect(data!.image_url).toBe('https://example.com/mint.jpg');
  });

  it('returns an error when insert fails', async () => {
    const dbError = { message: 'Unique constraint violation' };
    const chain = buildChain({ data: null, error: dbError });
    mockFrom.mockReturnValue(chain);

    const { data, error } = await addGreenhousePlant(
      'gh1', 'Mint', 'Mentha', '', 'My Mint', 1,
    );

    expect(data).toBeNull();
    expect(error).toEqual(dbError);
  });
});

describe('deleteGreenhousePlant', () => {
  it('deletes a plant by id and returns no error', async () => {
    const chain = buildChain({ error: null });
    mockFrom.mockReturnValue(chain);

    const { error } = await deleteGreenhousePlant('p1');

    expect(mockFrom).toHaveBeenCalledWith('plants');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('plant_id', 'p1');
    expect(error).toBeNull();
  });

  it('returns an error when deletion fails', async () => {
    const dbError = { message: 'Row not found' };
    const chain = buildChain({ error: dbError });
    mockFrom.mockReturnValue(chain);

    const { error } = await deleteGreenhousePlant('non-existent-id');

    expect(error).toEqual(dbError);
  });
});

describe('scanPlant', () => {
    it('returns scan results for a valid image', async () => {
        const mockResult: PlantScanResult = {
            imageUri: 'file://path/to/image.jpg',
            commonName: 'Mint',
            genus: 'Mentha',
            family: 'Lamiaceae',
            scientificName: 'Mentha',
            confidenceScore: '0.95',
            description: 'A fragrant herb used in cooking and teas.',
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
        });

        const { data, error } = await scanPlant('file://path/to/image.jpg');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(error).toBeUndefined();
        expect(data).toEqual(mockResult);
    });

    it('returns an error when the API call fails', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        const { data, error } = await scanPlant('file://path/to/image.jpg');

        expect(data).toBeNull();
        expect(error).toBe('Failed to identify plant');
    });

    it('returns an error when fetch throws an exception', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const { data, error } = await scanPlant('file://path/to/image.jpg');

        expect(data).toBeNull();
        expect(error).toBe('Network error');
    });
});

describe('getDescription', () => {
    it('returns a description for a valid scientific name', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ description: 'A fragrant herb used in cooking and teas.' }),
    });

    const { data } = await getDescription('Mint');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(data).toBe('A fragrant herb used in cooking and teas.');
    });

    it('returns an error when the API call fails', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        const { data, error } = await getDescription('Mint');

        expect(data).toBeNull();
        expect(error).toBe('Failed to fetch description');
    });

    it('returns an error when fetch throws an exception', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const { data, error } = await getDescription('Mint');
       
        expect(data).toBeNull();
        expect(error).toBe('Network error');
    });
});

describe('getScans', () => {
    it('returns a list of scans for a greenhouse', async () => {
        const mockScans = [
            { scan_id: 's1', user_id: 'u1', common_name: 'Mint', created_at: '04-10-2026' },
            { scan_id: 's2', user_id: 'u2', common_name: 'Basil', created_at: '04-10-2026' }, 
           ];

        const chain = buildChain({ data: mockScans, error: null });
        mockFrom.mockReturnValue(chain);

        const data = await getScans();

        expect(mockFrom).toHaveBeenCalledWith('scan_history');
        expect(chain.eq).toHaveBeenCalledWith('user_id', mockUserId);
        expect(data).toHaveLength(2);
        expect(data[0].common_name).toBe('Mint');
    });

    it('throws when the query fails', async () => {
    const chain = buildChain({ data: null, error: { message: 'Query failed' } });
    mockFrom.mockReturnValue(chain);
 
    await expect(getScans()).rejects.toThrow('Failed to get user scans: Query failed');
  });
});

describe('deleteScan', () => {
  it('deletes scan and its image from storage', async () => {
    const scanData = { scan_img_url: 'https://storage.example.com/plant_images/u1/photo.jpg' };
 
    const fetchChain = buildChain({ data: scanData, error: null });
    const deleteChain = buildChain({ data: null, error: null });
    mockFrom
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(deleteChain);
 
    const storageChain = buildStorageChain({ error: null });
    mockStorageFrom.mockReturnValue(storageChain);
 
    await expect(deleteScan('s1')).resolves.not.toThrow();
 
    expect(storageChain.remove).toHaveBeenCalled();
    expect(deleteChain.delete).toHaveBeenCalled();
  });
 
  it('throws when fetching the scan record fails', async () => {
    const chain = buildChain({ data: null, error: { message: 'Not found' } });
    mockFrom.mockReturnValue(chain);
 
    await expect(deleteScan('s1')).rejects.toThrow('Failed to fetch scan: Not found');
  });
 
  it('throws when storage deletion fails', async () => {
    const scanData = { scan_img_url: 'https://storage.example.com/plant_images/u1/photo.jpg' };
    const fetchChain = buildChain({ data: scanData, error: null });
    mockFrom.mockReturnValue(fetchChain);
 
    const storageChain = buildStorageChain({ error: { message: 'Storage error' } });
    mockStorageFrom.mockReturnValue(storageChain);
 
    await expect(deleteScan('s1')).rejects.toThrow('Failed to delete image: Storage error');
  });
});
 