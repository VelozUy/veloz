import { DashboardStatsService } from '../dashboard-stats';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

const mockDocs = (count: number, extraData: any[] = []) => {
  return {
    size: count,
    docs: Array.from({ length: count }).map((_, i) => ({
      id: `id${i}`,
      data: () => extraData[i] || { title: `Project ${i}`, createdAt: { toDate: () => new Date(2024, 0, i + 1) } },
    })),
  };
};

describe('DashboardStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct stats for all collections', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs
      .mockResolvedValueOnce(mockDocs(3)) // projects
      .mockResolvedValueOnce(mockDocs(2)) // faqs
      .mockResolvedValueOnce(mockDocs(4)) // crewMembers
      .mockResolvedValueOnce(mockDocs(1)) // adminUsers
      .mockResolvedValueOnce(mockDocs(2, [
        { title: 'Recent 1', createdAt: { toDate: () => new Date('2024-01-01') } },
        { title: 'Recent 2', createdAt: { toDate: () => new Date('2024-01-02') } },
      ])); // recent projects

    const stats = await DashboardStatsService.getDashboardStats();
    expect(stats.totalProjects).toBe(3);
    expect(stats.totalFAQs).toBe(2);
    expect(stats.totalCrewMembers).toBe(4);
    expect(stats.totalUsers).toBe(1);
    expect(stats.recentActivity.length).toBe(2);
    expect(stats.recentActivity[0].title).toBe('Recent 1');
    expect(stats.recentActivity[1].title).toBe('Recent 2');
  });

  it('throws and logs error if Firestore fails', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockRejectedValue(new Error('Firestore error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    await expect(DashboardStatsService.getDashboardStats()).rejects.toThrow('Failed to fetch dashboard statistics');
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching dashboard stats:', expect.any(Error));
    consoleSpy.mockRestore();
  });
}); 