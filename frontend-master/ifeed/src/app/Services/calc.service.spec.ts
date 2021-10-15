import { TestBed } from '@angular/core/testing';
import { CalcService } from './calc.service';
import { EnumService } from './enum.service';

class MockEnumService extends EnumService {
  public static readonly FEEDBACKMODE = [
    JSON.parse('{"value": "system", "name": "SYSTEM"}'),
    JSON.parse('{"value": "user", "name": "USER"}'),
    JSON.parse('{"value": "hybrid", "name": "HYBRID"}')
  ];
  public static readonly HISTORYMODE = [
    JSON.parse('{"value": "noHistory", "name": "NO_HISTORY"}'),
    JSON.parse('{"value": "decisions", "name": "DECISIONS"}'),
    JSON.parse('{"value": "heatmaps", "name": "HEATMAPS"}')
  ];
  public static readonly LABEL = [
    JSON.parse('{ "value": { "user": "U", "final": "NOT DEFINED" }, "name": "U" }'),
    JSON.parse('{ "value": { "user": "Lin", "final": "inlier" }, "name": "INLIER" }'),
    JSON.parse('{ "value": { "user": "Lout", "final": "outlier" }, "name": "OUTLIER" }')
  ];
  public getFeedbackModes(): JSON[] {
    return MockEnumService.FEEDBACKMODE;
  }
  public getHistoryModes(): JSON[] {
    return MockEnumService.HISTORYMODE;
  }
  public getLabels(): JSON[] {
    return MockEnumService.LABEL;
  }
}

/* Tests for method: calcPercentFinished ---------------------------------------------------------------------- */
describe('CalcService: calcPercentFinished', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // input null
  it('should return -1 if Setup and Session null', () => {
    const mockSetup = null;
    const mockSession = null;
    expect(calcService.calcPercentFinished(mockSetup, mockSession)).toEqual(-1);
  });

  // Session null
  it('should return -1 if Setup null', () => {
    const mockSetup = null;
    const mockSession = '{ "iteration":2 }';
    expect(calcService.calcPercentFinished(mockSetup, JSON.parse(mockSession))).toEqual(-1);
  });

  // Setup null
  it('should return -1 if Session null', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = null;
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  // input undefined
  it('should return -1 if Setup and Session undefined', () => {
    const mockSetup = undefined;
    const mockSession = undefined;
    expect(calcService.calcPercentFinished(mockSetup, mockSession)).toEqual(-1);
  });

  // Setup undefined
  it('should return -1 if Setup undefined', () => {
    const mockSetup = undefined;
    const mockSession = '{ "iteration":2 }';
    expect(calcService.calcPercentFinished(mockSetup, JSON.parse(mockSession))).toEqual(-1);
  });

  // Session undefined
  it('should return -1 if Session undefined', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = undefined;
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), mockSession)).toEqual(-1);
  });

  // Setup has no property iterations
  it('should return -1 if Setup has no property iterations', () => {
    const mockSetup = '{}';
    const mockSession = '{ "iteration":10 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  // Session has no property iteration
  it('should return -1 if Session has no property iteration', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = '{}';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  // iteration is bigger than iterations
  it('should return -1 if more iteration than iterations', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = '{ "iteration":11 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  // both zero
  it('should return -1 if iteration and iterations 0', () => {
    const mockSetup = '{ "iterations":0 }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  // iteration is smaller than zero
  it('should return -1 if iteration negative', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = '{ "iteration":-1 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  // iterations is smaller than -1
  it('should return -1 if iterations smaller than -1', () => {
    const mockSetup = '{ "iterations":-2 }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(-1);
  });

  /* valid cases */

  // no max Iterations and Session has not been started
  it('should return 0 if no maxIt and Session not started', () => {
    const mockSetup = '{ "iterations":-1 }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(0);
  });

  // no max Iterations and Session has been started
  it('should return 49 if no maxIt and Session started', () => {
    const mockSetup = '{ "iterations":-1 }';
    const mockSession = '{ "iteration":1 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(49);
  });

  // valid percent value
  it('should return 50 if Session is half finshed', () => {
    const mockSetup = '{ "iterations":50 }';
    const mockSession = '{ "iteration":25 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(50);
  });

  // valid percent value
  it('should return 0 if Session is not started', () => {
    const mockSetup = '{ "iterations":50 }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(0);
  });

  // valid percent value
  it('should return 100 if Session is finshed', () => {
    const mockSetup = '{ "iterations":50 }';
    const mockSession = '{ "iteration":50 }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(100);
  });

  // valid percent value
  it('should return 100 if Session is finshed', () => {
    const mockSetup = '{ "iterations":-1 }';
    const mockSession = '{ "iteration":50, "finished":true }';
    expect(calcService.calcPercentFinished(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(100);
  });
});

/* Tests for method: calcSessionStatus ---------------------------------------------------------------------- */
describe('CalcService: calcSessionStatus', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
        { provide: EnumService, useClass: MockEnumService },
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // input null
  it('should return null if Setup and Session null', () => {
    const mockSetup = null;
    const mockSession = null;
    expect(calcService.calcSessionStatus(mockSetup, mockSession)).toEqual(null);
  });

  // Session null
  it('should return null if Setup null', () => {
    const mockSetup = null;
    const mockSession = '{ "iteration":2 }';
    expect(calcService.calcSessionStatus(mockSetup, JSON.parse(mockSession))).toEqual(null);
  });

  // Setup null
  it('should return null if Session null', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = null;
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(null);
  });

  // input undefined
  it('should return null if Setup and Session undefined', () => {
    const mockSetup = undefined;
    const mockSession = undefined;
    expect(calcService.calcSessionStatus(mockSetup, mockSession)).toEqual(null);
  });

  // Setup undefined
  it('should return null if Setup undefined', () => {
    const mockSetup = undefined;
    const mockSession = '{ "iteration":2 }';
    expect(calcService.calcSessionStatus(mockSetup, JSON.parse(mockSession))).toEqual(null);
  });

  // Session undefined
  it('should return null if Session undefined', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = undefined;
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), mockSession)).toEqual(null);
  });

  // Setup has no property iterations
  it('should return null if Setup has no property iterations', () => {
    const mockSetup = '{}';
    const mockSession = '{ "iteration":10 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(null);
  });

  // Session has no property iteration
  it('should return null if Session has no property iteration', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = '{}';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(null);
  });

  // Session has no property feedbackMode
  it('should return null if Session has no property feedbackMode', () => {
    const mockSetup = '{ "iterations":10 }';
    const mockSession = '{ "iteration":5 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual(null);
  });

  /* valid cases */

  // no maxIt and user mode
  it('should return user mode if Session is unlimited and in user mode', () => {
    const mockSetup = '{ "iterations":-1, "feedbackMode":"user" }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('user mode');
  });

  // no maxIt and system mode
  it('should return system mode if Session is unlimited and in system mode', () => {
    const mockSetup = '{ "iterations":-1, "feedbackMode":"system" }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('system mode');
  });

  // no maxIt and hybrid mode
  it('should return hybrid mode if Session is unlimited and in hybrid mode', () => {
    const mockSetup = '{ "iterations":-1, "feedbackMode":"hybrid" }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('hybrid mode');
  });

  // no maxIt and unknown mode
  it('should return error if Session is unlimited and in undefined mode', () => {
    const mockSetup = '{ "iterations":-1, "feedbackMode":"a" }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('Unknown feedback mode');
  });

  // Session finished
  it('should return finished if Session is finished', () => {
    const mockSetup = '{ "iterations":10, "feedbackMode":"a" }';
    const mockSession = '{ "iteration":10 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('finished');
  });

  // Session not started
  it('should return not started if Session is not started', () => {
    const mockSetup = '{ "iterations":10, "feedbackMode":"user" }';
    const mockSession = '{ "iteration":0 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('not started');
  });

  // Session active
  it('should return active if Session is active', () => {
    const mockSetup = '{ "iterations":10, "feedbackMode":"user" }';
    const mockSession = '{ "iteration":5 }';
    expect(calcService.calcSessionStatus(JSON.parse(mockSetup), JSON.parse(mockSession))).toEqual('active');
  });
});

/* Tests for method: calcSetupTime ---------------------------------------------------------------------- */
describe('CalcService: calcSetupTime', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // Setup null
  it('should return -1 if Setup is null', () => {
    const mockSetup = null;
    expect(calcService.calcSetupTime(mockSetup)).toEqual(-1);
  });

  // Setup undefined
  it('should return -1 if Setup is undefined', () => {
    const mockSetup = undefined;
    expect(calcService.calcSetupTime(mockSetup)).toEqual(-1);
  });

  // Setup has no property creationTime
  it('should return -1 if no property creationTime', () => {
    const mockSetup = '{}';
    expect(calcService.calcSetupTime(JSON.parse(mockSetup))).toEqual(-1);
  });

  /* valid cases */

  // created instantly
  it('should return 0 if created instantly', () => {
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const mockSetup = '{ "creationTime":' + currentTime + ' }';
    expect(calcService.calcSetupTime(JSON.parse(mockSetup))).toEqual(0);
  });
});

/* Tests for method: calcAverageTimeSession ---------------------------------------------------------------------- */
describe('CalcService: calcAverageTimeSession', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // Sessions null
  it('should return -1 if Sessions null', () => {
    const mockSessionList = null;
    expect(calcService.calcAverageTimeSession(JSON.parse(mockSessionList))).toEqual(-1);
  });

  // Sessions undefined
  it('should return -1 if Sessions undefined', () => {
    const mockSessionList = undefined;
    expect(calcService.calcAverageTimeSession(mockSessionList)).toEqual(-1);
  });

  // Sessions with invalid entry
  it('should return -1 if Sessions has invalid entry', () => {
    const mockSessionList = '[{ "inProgress":1, "finished":false }, { "inProgress":2, "finished":false }]';
    const jsonMocklist = JSON.parse(mockSessionList);
    jsonMocklist[0] = null;
    expect(calcService.calcAverageTimeSession(jsonMocklist)).toEqual(-1);
  });

  // Sessions with missing property inProgress
  it('should return -1 if Sessions has no property inProgress', () => {
    const mockSessionList = '[{ "finished":true }]';
    expect(calcService.calcAverageTimeSession(JSON.parse(mockSessionList))).toEqual(-1);
  });

  // Sessions with missing property finished
  it('should return -1 if Sessions has no property finished', () => {
    const mockSessionList = '[{ "inProgress":1 }]';
    expect(calcService.calcAverageTimeSession(JSON.parse(mockSessionList))).toEqual(-1);
  });

  /* valid cases */

  // Sessions are not finished
  it('should return 0 if Sessions are not finished', () => {
    const mockSessionList = '[{ "inProgress":2, "finished":false }, { "inProgress":2, "finished":false }]';
    expect(calcService.calcAverageTimeSession(JSON.parse(mockSessionList))).toEqual(0);
  });

  // Sessions are partly not finished
  it('should return 1 if Sessions are partly not finished', () => {
    const mockSessionList = '[{ "inProgress":5, "finished":true }, { "inProgress":10, "finished":false }]';
    expect(calcService.calcAverageTimeSession(JSON.parse(mockSessionList))).toEqual(5);
  });

  // Sessions with vaild entries
  it('should return 2 if Sessions are valid', () => {
    const mockSessionList = '[{ "inProgress":2, "finished":true }, { "inProgress":2, "finished":true }]';
    expect(calcService.calcAverageTimeSession(JSON.parse(mockSessionList))).toEqual(2);
  });

});

/* Tests for method: calcAverageTimeIteration ---------------------------------------------------------------------- */
describe('CalcService: calcAverageTimeIteration', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // Session null
  it('should return -1 if null', () => {
    const mockSession = null;
    expect(calcService.calcAverageTimeIteration(mockSession)).toEqual(-1);
  });

  // Session undefined
  it('should return -1 if undefined', () => {
    const mockSession = undefined;
    expect(calcService.calcAverageTimeIteration(mockSession)).toEqual(-1);
  });

  // Session has no properties
  it('should return -1 if no properties', () => {
    const mockSession = '{}';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(-1);
  });

  // Session has no property inProgress
  it('should return -1 if no property inProgress', () => {
    const mockSession = '{ "iteration":1 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(-1);
  });

  // Session has no property iteration
  it('should return -1 if no property iteration', () => {
    const mockSession = '{ "inProgress":20 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(-1);
  });

  // iteration is smaller than 0
  it('should return -1 if iteration smaller than 0', () => {
    const mockSession = '{ "inProgress":10, "iteration":-1 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(-1);
  });

  // inProgress is smaller than 0
  it('should return -1 if inProgress smaller than 0', () => {
    const mockSession = '{ "inProgress":-1, "iteration":10 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(-1);
  });

  // iterations started, but no time
  it('should return -1 if iterations but 0 time in progress', () => {
    const mockSession = '{ "inProgress":0, "iteration":1 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(-1);
  });

  /* valid cases */

  // Session has not been started
  it('should return 0 if Session not started', () => {
    const mockSession = '{ "inProgress":0, "iteration":0 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(0);
  });

  // Session has been started, but no iteration done
  it('should return 0 if Session has been started but no iterations', () => {
    const mockSession = '{ "inProgress":1, "iteration":0 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(0);
  });

  // valid property values
  it('should return 10 if Session valid', () => {
    const mockSession = '{ "inProgress":300, "iteration":30 }';
    expect(calcService.calcAverageTimeIteration(JSON.parse(mockSession))).toEqual(10);
  });
});

/* Tests for method: sortNewestFirst ---------------------------------------------------------------------- */
describe('CalcService: sortNewestFirst', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // list null
  it('should return null if list null', () => {
    const mockList = null;
    expect(calcService.sortNewestFirst(mockList)).toEqual(null);
  });

  // list undefined
  it('should return null if list undefined', () => {
    const mockList = undefined;
    expect(calcService.sortNewestFirst(mockList)).toEqual(null);
  });

  // list with invalid entry
  it('should return null if invalid entry', () => {
    const mockList = '[{ "id":1 }, { "id":2 }]';
    const jsonMocklist = JSON.parse(mockList);
    jsonMocklist[0] = null;
    expect(calcService.sortNewestFirst(jsonMocklist)).toEqual(null);
  });

  // list with invalid entry
  it('should return null if invalid property', () => {
    const mockList = '[{ "test":"a" }, { "id":2 }]';
    expect(calcService.sortNewestFirst(JSON.parse(mockList))).toEqual(null);
  });

  /* valid cases */

  // list with valid entries
  it('should return correctSort if valid entries', () => {
    const mockList = '[{ "id":1 }, { "id":2 }]';
    const correctSort = '[{ "id":2 }, { "id":1 }]';
    expect(calcService.sortNewestFirst(JSON.parse(mockList))).toEqual(JSON.parse(correctSort));
  });

  // sorted list
  it('should return same list if already sorted', () => {
    const mockList = '[{ "id":2 }, { "id":1 }]';
    expect(calcService.sortNewestFirst(JSON.parse(mockList))).toEqual(JSON.parse(mockList));
  });
});

/* Tests for method: filterListName ---------------------------------------------------------------------- */
describe('CalcService: filterListName', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // list null
  it('should return null if list null', () => {
    const mockList = null;
    expect(calcService.filterListName(mockList, '')).toEqual(null);
  });

  // list undefined
  it('should return null if list undefined', () => {
    const mockList = undefined;
    expect(calcService.filterListName(mockList, '')).toEqual(null);
  });

  // list with invalid entry
  it('should return null if invalid entry', () => {
    const mockList = '[{ "name":"a" }, { "name":"b" }]';
    const jsonMocklist = JSON.parse(mockList);
    jsonMocklist[0] = null;
    expect(calcService.filterListName(jsonMocklist, '')).toEqual(null);
  });

  // list with invalid entry
  it('should return null if invalid property', () => {
    const mockList = '[{ "test":"a" }, { "name":"b" }]';
    expect(calcService.filterListName(JSON.parse(mockList), '')).toEqual(null);
  });

  /* valid cases */

  // list with valid entry
  it('should return same list if filter empty', () => {
    const mockList = '[{ "name":"a" }, { "name":"b" }]';
    expect(calcService.filterListName(JSON.parse(mockList), '')).toEqual(JSON.parse(mockList));
  });

  // list with valid filter
  it('should return filtered list', () => {
    const mockList = '[{ "name":"a" }, { "name":"b" }]';
    const filteredMockList = '[{ "name":"a" }]';
    expect(calcService.filterListName(JSON.parse(mockList), 'a')).toEqual(JSON.parse(filteredMockList));
  });

  // substring filter
  it('should return filtered list if filter is substring', () => {
    const mockList = '[{ "name":"testa" }, { "name":"testb" }, { "name":"c" }]';
    const filteredMockList = '[{ "name":"testa" }, { "name":"testb" }]';
    expect(calcService.filterListName(JSON.parse(mockList), 'test')).toEqual(JSON.parse(filteredMockList));
  });

  // case insensitive filter
  it('should return filtered if case insensitive', () => {
    const mockList = '[{ "name":"TEsta" }, { "name":"teSTb" }, { "name":"c" }]';
    const filteredMockList = '[{ "name":"TEsta" }, { "name":"teSTb" }]';
    expect(calcService.filterListName(JSON.parse(mockList), 'TeSt')).toEqual(JSON.parse(filteredMockList));
  });
});

/* Tests for method: sliceListFirstElements ---------------------------------------------------------------------- */
describe('CalcService: sliceListFirstElements', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // list null
  it('should return null if list null', () => {
    const mockList = null;
    expect(calcService.sliceListFirstElements(mockList, 0)).toEqual(null);
  });

  // list undefined
  it('should return null if list undefined', () => {
    const mockList = undefined;
    expect(calcService.sliceListFirstElements(mockList, 0)).toEqual(null);
  });

  // numOfElements invalid
  it('should return null if numOfElements invalid', () => {
    const mockList = '[{ "name":"testa" }, { "name":"testb" }, { "name":"testc" }]';
    expect(calcService.sliceListFirstElements(JSON.parse(mockList), -1)).toEqual(null);
  });

  /* valid cases */

  // sliced list
  it('should return sliced list', () => {
    const mockList = '[{ "name":"testa" }, { "name":"testb" }, { "name":"testc" }]';
    const mockSlicedList = '[{ "name":"testa" }, { "name":"testb" }]';
    expect(calcService.sliceListFirstElements(JSON.parse(mockList), 2)).toEqual(JSON.parse(mockSlicedList));
  });

  // list smaller than requested slice
  it('should return inputList if numOfElements bigger than slice', () => {
    const mockList = '[{ "name":"testa" }, { "name":"testb" }, { "name":"testc" }]';
    expect(calcService.sliceListFirstElements(JSON.parse(mockList), 4)).toEqual(JSON.parse(mockList));
  });
});

/* Tests for method: getTimeAsString ---------------------------------------------------------------------- */
describe('CalcService: getTimeAsString', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // time null
  it('should return null if time null', () => {
    const mocktime = null;
    expect(calcService.getTimeAsString(mocktime)).toEqual(null);
  });

  // time undefined
  it('should return null if time undefined', () => {
    const mocktime = undefined;
    expect(calcService.getTimeAsString(mocktime)).toEqual(null);
  });

  // time < 0
  it('should return null if time is less than zero', () => {
    const mocktime = -1;
    expect(calcService.getTimeAsString(mocktime)).toEqual(null);
  });

  it('should return null if time 0', () => {
    const mocktime = 0;
    expect(calcService.getTimeAsString(mocktime)).toEqual(null);
  });

  /* valid cases */

  // correct hour
  it('should return correct double digit hour in 24 format', () => {
    const mocktime = 13 * 3600;
    expect(calcService.getTimeAsString(mocktime)).toEqual('13:00:00');
  });

  // correct hour
  it('should return correct hour at overflow', () => {
    const mocktime = 24 * 3600;
    expect(calcService.getTimeAsString(mocktime)).toEqual('00:00:00');
  });

  // correct hour
  it('should return correct hour at overflow', () => {
    const mocktime = 25 * 3600;
    expect(calcService.getTimeAsString(mocktime)).toEqual('01:00:00');
  });

  // correct minute
  it('should return correct minute 1', () => {
    const mocktime = 1 * 60;
    expect(calcService.getTimeAsString(mocktime)).toEqual('00:01:00');
  });

  // correct minute
  it('should return correct double digit minute 10', () => {
    const mocktime = 10 * 60;
    expect(calcService.getTimeAsString(mocktime)).toEqual('00:10:00');
  });

  // correct minute
  it('should return correct minute at overflow', () => {
    const mocktime = 61 * 60;
    expect(calcService.getTimeAsString(mocktime)).toEqual('01:01:00');
  });

  // correct second
  it('should return correct second 1', () => {
    const mocktime = 1;
    expect(calcService.getTimeAsString(mocktime)).toEqual('00:00:01');
  });

  // correct second
  it('should return correct double digit second 10', () => {
    const mocktime = 10;
    expect(calcService.getTimeAsString(mocktime)).toEqual('00:00:10');
  });

  // correct second
  it('should return correct second at overflow', () => {
    const mocktime = 61;
    expect(calcService.getTimeAsString(mocktime)).toEqual('00:01:01');
  });

  // correct hour, minute, second
  it('should return correct one digit time', () => {
    const mocktime = 3600 + 60 + 1;
    expect(calcService.getTimeAsString(mocktime)).toEqual('01:01:01');
  });

  // correct hour, minute, second
  it('should return correct two digit time', () => {
    const mocktime = 10 * 3600 + 10 * 60 + 10;
    expect(calcService.getTimeAsString(mocktime)).toEqual('10:10:10');
  });

});

/* Tests for method: calcSetupTimeMessage ---------------------------------------------------------------------- */
describe('CalcService: calcSetupTimeMessage', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* invalid cases */

  // message null
  it('should return null if message null', () => {
    const mocktime = 3;
    const message = null;
    expect(calcService.calcTimeMessage(mocktime, message)).toEqual(null);
  });

  // time < 0
  it('should return null if time < 0', () => {
    const mocktime = -1;
    const message = 'test';
    expect(calcService.calcTimeMessage(mocktime, message)).toEqual(null);
  });

  // message undefined
  it('should return null if message undefined', () => {
    const mocktime = 3;
    const message = undefined;
    expect(calcService.calcTimeMessage(mocktime, message)).toEqual(null);
  });

  /* valid cases */

  // sould return correct string
  it('should return correct string', () => {
    const mocktime = 3;
    const message = 'second';
    expect(calcService.calcTimeMessage(mocktime, message)).toEqual('created 3 second(s) ago');
  });
});


/* Tests for method: calcSetupTimeMessage ---------------------------------------------------------------------- */
describe('CalcService: calcSetupTimeMessage', () => {
  let calcService: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CalcService,
      ]
    });
    calcService = TestBed.get(CalcService);
  });

  /* valid cases */

  // created instantly
  it('should return 0 seconds ago if created instantly', () => {
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const mockSetup = '{ "creationTime":' + currentTime + ' }';
    expect(calcService.calcSetupTimeMessage(JSON.parse(mockSetup))).toEqual('created 0 second(s) ago');
  });

  // created seconds ago
  it('should return seconds string if created seconds ago', () => {
    let currentTime = Math.round((new Date()).getTime() / 1000);
    currentTime -= 1;
    const mockSetup = '{ "creationTime":' + currentTime + ' }';
    expect(calcService.calcSetupTimeMessage(JSON.parse(mockSetup))).toEqual('created 1 second(s) ago');
  });

  // created minutes ago
  it('should return minutes string if created minutes ago', () => {
    let currentTime = Math.round((new Date()).getTime() / 1000);
    currentTime -= 61;
    const mockSetup = '{ "creationTime":' + currentTime + ' }';
    expect(calcService.calcSetupTimeMessage(JSON.parse(mockSetup))).toEqual('created 1 minute(s) ago');
  });

  // created hours ago
  it('should return hours string if created hours ago', () => {
    let currentTime = Math.round((new Date()).getTime() / 1000);
    currentTime -= 3601;
    const mockSetup = '{ "creationTime":' + currentTime + ' }';
    expect(calcService.calcSetupTimeMessage(JSON.parse(mockSetup))).toEqual('created 1 hour(s) ago');
  });

  // created days ago
  it('should return days string if created days ago', () => {
    let currentTime = Math.round((new Date()).getTime() / 1000);
    currentTime -= 86401;
    const mockSetup = '{ "creationTime":' + currentTime + ' }';
    expect(calcService.calcSetupTimeMessage(JSON.parse(mockSetup))).toEqual('created 1 day(s) ago');
  });
  /* invalid cases */

  // input null
  it('should return null if Setup null', () => {
    const mockSetup = null;
    expect(calcService.calcSetupTimeMessage(mockSetup)).toEqual(null);
  });

  // input undefined
  it('should return null if Setup undefined', () => {
    const mockSetup = undefined;
    expect(calcService.calcSetupTimeMessage(mockSetup)).toEqual(null);
  });
});
