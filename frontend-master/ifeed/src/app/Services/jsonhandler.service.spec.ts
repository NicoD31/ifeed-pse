import { TestBed } from '@angular/core/testing';

import { JSONHandlerService } from './jsonhandler.service';

describe('JSONHandlerService: Initialization', () => {
  let service: JSONHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(JSONHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('JSONHandlerService: CSVtoJSON()', () => {
  let service: JSONHandlerService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(JSONHandlerService);
  });

  it('should convert dataset correctly', () => {
    let csv = 'title1,title2\n1,2\n3,4\n';
    let json: JSON = service.CSVtoJSON(csv, JSONHandlerService.VALUE_TYPE_DATASET);
    expect(json['titles']).toEqual(['title1','title2']);
    expect(json['values']).toEqual([[1,2] , [3,4]]);
  });

  it('should return undefined on different sized rows', () => {
    let csv = 'title1,title2\n1,2\n3,4,5\n';
    let json: JSON = service.CSVtoJSON(csv, JSONHandlerService.VALUE_TYPE_DATASET);
    expect(json).toEqual(undefined);
  });

  it('should convert groundtruth correctly', () => {
    let csv = 'labels\ninlier\noutlier\ninlier\ninlier\n';
    let json: JSON = service.CSVtoJSON(csv, JSONHandlerService.VALUE_TYPE_GROUNDTRUTH);
    console.log(json);
    expect(json['values'][0]).toEqual(['inlier', 'outlier', 'inlier', 'inlier']);
  });

  it('should convert number correctly', () => {
    let csv = 'title1,title2\n1,2\n3,4\n';
    let json: JSON = service.CSVtoJSON(csv, JSONHandlerService.VALUE_TYPE_NUMBER);
    expect(json['titles']).toEqual(['title1','title2']);
    expect(json['values']).toEqual([[1,3] , [2,4]]);
  });

  it('should return undefined on invalid groundtruth', () => {
    let csv = 'title1,title2\n1,2\n3,4\n';
    let json: JSON = service.CSVtoJSON(csv, JSONHandlerService.VALUE_TYPE_GROUNDTRUTH);
    expect(json).toEqual(undefined);
  });

  it('should return undefined on invalid number', () => {
    let csv = 'labels\ninlier\noutlier\ninlier\ninlier\n';
    let json: JSON = service.CSVtoJSON(csv, JSONHandlerService.VALUE_TYPE_NUMBER);
    expect(json).toEqual(undefined);
  })
});
