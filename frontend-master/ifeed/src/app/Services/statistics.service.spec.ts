import { TestBed } from '@angular/core/testing';

import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  // ld1 is undefined
  it('should return null if ld1 is undefined', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    let mockLd1;
    const mockLd2 = ['inlier', 'outlier'];
    expect(service.compareLabledData(mockLd1, mockLd2)).toBeNull();
  });

  // ld2 is undefined
  it('should return null if ld2 is undefined', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockLd1 = ['inlier', 'outlier'];
    let mockLd2;
    expect(service.compareLabledData(mockLd1, mockLd2)).toBeNull();
  });

  // ld1 is empty
  it('should return null if ld1 is empty', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockLd1 = [];
    const mockLd2 = ['inlier', 'outlier'];
    expect(service.compareLabledData(mockLd1, mockLd2)).toBeNull();
  });

  // ld2 is empty
  it('should return null if ld2 is empty', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockLd1 = ['inlier', 'outlier'];
    const mockLd2 = [];
    expect(service.compareLabledData(mockLd1, mockLd2)).toBeNull();
  });

  // ld1 and ld2 have different length
  it('should return null if ld1 is undefined', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockLd1 = ['inlier'];
    const mockLd2 = ['inlier', 'outlier'];
    expect(service.compareLabledData(mockLd1, mockLd2)).toBeNull();
  });

  // ld1 and ld2 have correct vaulues
  // it('should return [2,2,3,3] with these values', () => {
  //   const service: StatisticsService = TestBed.get(StatisticsService);
  //   const mockLd1 = ['inlier', 'inlier', 'inlier', 'inlier', 'inlier', 'outlier', 'outlier', 'outlier', 'outlier', 'outlier'];
  //   const mockLd2 = ['inlier', 'inlier', 'inlier', 'outlier', 'outlier', 'inlier', 'inlier', 'outlier', 'outlier', 'outlier'];
  //   var testArray = service.compareLabledData(mockLd1, mockLd2);
  //   const checkArray = [2,2,3,3];
  //   for (var i = 0; i < testArray.length; i++) {
  //     expect(testArray[i]).toEqual(checkArray[i]);
  //   }
  // });

  // session1 has no finalLabels
  it('should return -1 if session1 has no finalLabels', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockSession1 = '{}';
    const mockSession2 = '{"finalLabels": ["inlier", "outlier"]}';
    expect(service.compareSessions(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(-1);
  });

  // session2 has no finalLabels
  it('should return -1 if session2 has no finalLabels', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockSession1 = '{"finalLabels": ["inlier", "outlier"]}';
    const mockSession2 = '{}';
    expect(service.compareSessions(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(-1);
  });

  // session1 and session2 have finalLabels with different length
  it('should return -1 if session1 and session2 have finalLabels with different length', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockSession1 = '{"finalLabels": ["inlier", "outlier", "inlier", "outlier"]}';
    const mockSession2 = '{"finalLabels": ["inlier", "outlier"]}';
    expect(service.compareSessions(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(-1);
  });

  // session1 and session2 have valid finalLabels
  // it('should return 0.6 with these values', () => {
  //   const service: StatisticsService = TestBed.get(StatisticsService);
  //   const mockSession1 = '{"finalLabels": ["inlier", "outlier", "inlier", "outlier", "inlier",
  //        "outlier", "inlier", "outlier", "inlier", "outlier"]}';
  //   const mockSession2 = '{"finalLabels": ["inlier", "outlier", "inlier", "outlier", "inlier",
  //        "outlier", "outlier", "inlier", "outlier", "inlier"]}';
  //   expect(service.compareSessions(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(0.6);
  // });

  // session1 has no finalLabels
  it('should return -1 if session1 has no finalLabels', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockSession1 = '{}';
    const mockSession2 = '{"finalLabels": ["inlier", "outlier"]}';
    expect(service.cohensKappa(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(-1);
  });

  // session2 has no finalLabels
  it('should return -1 if session2 has no finalLabels', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockSession1 = '{"finalLabels": ["inlier", "outlier"]}';
    const mockSession2 = '{}';
    expect(service.cohensKappa(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(-1);
  });

  // session1 and session2 have finalLabels with different length
  it('should return -1 if session1 and session2 have finalLabels with different length', () => {
    const service: StatisticsService = TestBed.get(StatisticsService);
    const mockSession1 = '{"finalLabels": ["inlier", "outlier", "inlier", "outlier"]}';
    const mockSession2 = '{"finalLabels": ["inlier", "outlier"]}';
    expect(service.cohensKappa(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(-1);
  });

  // session1 and session2 have valid finalLabels
  // it('should return 0.2 with these values', () => {
  //   const service: StatisticsService = TestBed.get(StatisticsService);
  //   const mockSession1 = '{"finalLabels": ["inlier", "outlier", "inlier", "outlier", "inlier",
  //        "outlier", "inlier", "outlier", "inlier", "outlier"]}';
  //   const mockSession2 = '{"finalLabels": ["inlier", "outlier", "inlier", "outlier", "inlier",
  //        "outlier", "outlier", "inlier", "outlier", "inlier"]}';
  //   expect(service.cohensKappa(JSON.parse(mockSession1), JSON.parse(mockSession2))).toBe(0.2);
  // });
});
