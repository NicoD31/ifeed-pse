import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';

/* Tests for method: downloadJSON ---------------------------------------------------------------------- */
describe('ExportService: downloadJSON', () => {
  let exportService: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportService,
      ]
    });
    exportService = TestBed.get(ExportService);
  });

  /* invalid cases */

  // input null
  it('should return false if null', () => {
    const mockJSON = null;
    expect(exportService.downloadJSON(mockJSON)).toEqual(false);
  });

  // input undefined
  it('should return false if undefined', () => {
    const mockJSON = undefined;
    expect(exportService.downloadJSON(mockJSON)).toEqual(false);
  });

  // JSON empty
  it('should return false if no property name', () => {
    const mockJSON = '{}';
    expect(exportService.downloadJSON(JSON.parse(mockJSON))).toEqual(false);
  });

  /* valid cases */

  // valid format
  it('should return true if JSON object has name', () => {
    const mockJSON = '{ "name":"downloadJsonTest" }';
    expect(exportService.downloadJSON(JSON.parse(mockJSON))).toEqual(true);
  });
});

/* Tests for method: downloadSessionLabels ---------------------------------------------------------------------- */
describe('ExportService: downloadSessionLabels', () => {
  let exportService: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportService,
      ]
    });
    exportService = TestBed.get(ExportService);
  });

  /* invalid cases */

  // input null
  it('should return false if null', () => {
    const mockSession = null;
    expect(exportService.downloadSessionLabels(mockSession)).toEqual(false);
  });

  // input undefined
  it('should return false if null', () => {
    const mockSession = undefined;
    expect(exportService.downloadSessionLabels(mockSession)).toEqual(false);
  });

  // invalid JSON properties
  it('should return false if wrong properties', () => {
    const mockSession = '{ "a":"a", "b":"b" }';
    expect(exportService.downloadSessionLabels(JSON.parse(mockSession))).toEqual(false);
  });

  // only one valid property
  it('should return false if no finalLabels', () => {
    const mockSession = '{ "name":"downloadSessionLabelsTestInvalid" }';
    expect(exportService.downloadSessionLabels(JSON.parse(mockSession))).toEqual(false);
  });

  // only one valid property
  it('should return false if no name', () => {
    const mockSession = '{ "finalLabels":"[]" }';
    expect(exportService.downloadSessionLabels(JSON.parse(mockSession))).toEqual(false);
  });

  /* valid cases */

  // valid format
  it('should return true if JSON object has finalLabels and name', () => {
    const mockSession = '{ "name":"downloadSessionLabelsTestValid", "finalLabels":"[]" }';
    expect(exportService.downloadSessionLabels(JSON.parse(mockSession))).toEqual(true);
  });
});
