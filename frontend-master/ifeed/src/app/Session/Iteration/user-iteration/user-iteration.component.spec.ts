import { TestBed } from '@angular/core/testing';
import { UserIterationComponent } from './user-iteration.component';
import { ChangeDetectorRef } from '@angular/core';
import { RESTService, Param, Func, List, Path } from '../../../Services/rest.service';
import { Router, NavigationExtras, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { PlotService } from '../../../Services/plot.service';
import { EnumService } from '../../../Services/enum.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { convertToParamMap } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class MockRouter {
  public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return new Promise(res => true);
  }
}
class MockChangeDetectorRef extends ChangeDetectorRef {
  public markForCheck() { }
  public checkNoChanges() { }
  public detach() { }
  public detectChanges() { }
  public reattach() { }
}
class MockSpinner extends NgxSpinnerService {
  public show() { }
  public hide() { }
}
class MockRestService {

  public static readonly MOCKOCAL: JSON = require('src/assets/testobjects/Ocal.json');
  public static readonly MOCKDATASET: JSON = require('src/assets/testobjects/Dataset.json');
  public static readonly MOCKSESSION: JSON = require('src/assets/testobjects/Session.json');
  public static readonly MOCKSETUP: JSON = require('src/assets/testobjects/Setup.json');
  private static readonly RESULTS = 'results';

  public getServerData(list: List, path: Path[], params: Param, dataHandler: Func) {
    let result: any;
    if (list === List.SESSION) {
      if (path.includes(Path.OCAL)) {
        result = MockRestService.MOCKOCAL;
      } else {
        result = MockRestService.MOCKSESSION;
      }
    } else if (list === List.SETUP) {
      result = MockRestService.MOCKSETUP;
    } else if (list === List.DATASET) {
      result = MockRestService.MOCKDATASET;
    } else {
      result = null;
    }
    dataHandler(result);
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {

  }
  public alterDataFromServer(list: List, path: Path[], object: JSON, param: Param) {

  }
}

class MockPlotService extends PlotService {
  public static readonly MOCKHEATMAP = JSON.parse('{"mock": "test"}');
  public makeHeatmapFromJSON(plot: JSON) {

  }
  public generateHeatmap(dataset: any, setup: any, lables: String[], givenSubspace: number[], givenIndexOfSuggestedPoint: number,
    givenDistSubspace: number[], givensubspaceGrids: number[][]): JSON {
    return MockPlotService.MOCKHEATMAP;
  }
}

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

describe('UserIterationComponent: Initializations', () => {
  let component: UserIterationComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1
      })
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserIterationComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PlotService, useClass: MockPlotService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: MockSpinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      imports: [HttpClientTestingModule],
    });
    component = TestBed.get(UserIterationComponent);
    component.ngOnInit();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('dataset it set properly', () => {
    component.ngOnInit();
    expect(component.getDataset()).toEqual(MockRestService.MOCKDATASET);
  });
  it('setup it set properly', () => {
    expect(component.getSetup()).toEqual(MockRestService.MOCKSETUP);
  });
  it('session it set properly', () => {
    expect(component.getSession()).toEqual(MockRestService.MOCKSESSION);
  });
  it('ocal it set properly', () => {
    expect(component.getOcal()).toEqual(MockRestService.MOCKOCAL);
  });
  it('all iteration data is set properly', () => {
    expect(component.getIterationTime()).toEqual(0);
    expect(component.isLabeled()).toEqual(false);
    expect(component.isSelected()).toEqual(false);
    expect(component.getSelectedPoints()).toEqual([]);
    expect(component.getSelectedLabels()).toEqual([]);
    const heatmaps = component.getHeatmaps();
    expect(heatmaps[0]).toEqual(JSON.stringify(MockPlotService.MOCKHEATMAP));
    for (let i = 1; i < heatmaps.length; i++) {
      expect(heatmaps[i]).toEqual(UserIterationComponent.EMPTY);
    }
  });
});

describe('UserIterationComponent: dataRdyTypename()', () => {
  const type = 'timeline';
  let component: UserIterationComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1
      })
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserIterationComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PlotService, useClass: MockPlotService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: MockSpinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      imports: [HttpClientTestingModule],
    });
    component = TestBed.get(UserIterationComponent);
    component.ngOnInit();
  });

  it('dataset is null, type is valid, should return false', () => {
    expect(component.dataRdyTypename(null, type)).toBeFalsy();
  });
  it('dataset is undefined, type is valid, should return false', () => {
    expect(component.dataRdyTypename(undefined, type)).toBeFalsy();
  });
  it('dataset is doesnt contain typename as attribute, type is valid, should return false', () => {
    const dataset = JSON.parse('{"nottypename": "test"}');
    expect(component.dataRdyTypename(dataset, type)).toBeFalsy();
  });
  it('dataset and type are valid but different, should return false', () => {
    const dataset = JSON.parse('{"typename": "different"}');
    expect(component.dataRdyTypename(dataset, type)).toBeFalsy();
  });
  it('dataset and type are valid and the same, should return true', () => {
    const dataset = JSON.parse('{"typename": "timeline"}');
    expect(component.dataRdyTypename(dataset, type)).toBeTruthy();
  });
});

describe('UserIterationComponent: selectLabel()', () => {
  let component: UserIterationComponent;
  let enumService: EnumService;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1
      })
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserIterationComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PlotService, useClass: MockPlotService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: MockSpinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      imports: [HttpClientTestingModule],
    });
    enumService = TestBed.get(EnumService);
    component = TestBed.get(UserIterationComponent);
    component.ngOnInit();
  });
  it('index is undefined, should return false', () => {
    expect(component.selectLabel(undefined)).toBeFalsy();
  });
  it('index is null, should return false', () => {
    expect(component.selectLabel(null)).toBeFalsy();
  });
  it('index is less than zero, should return false', () => {
    expect(component.selectLabel(-1)).toBeFalsy();
  });
  it('index is too large, should return false', () => {
    expect(component.selectLabel(999)).toBeFalsy();
  });
  it('index is valid, should return true, isPointLabeled should be true', () => {
    expect(component.selectLabel(0)).toBeTruthy();
    expect(component.getSelectedLabels()[0]).toEqual(enumService.getLabels()[0]['value']['user']);
    expect(component.isLabeled()).toBeTruthy();
  });
});

describe('UserIterationComponent: rewind()', () => {
  let component: UserIterationComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1
      })
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserIterationComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PlotService, useClass: MockPlotService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: MockSpinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      imports: [HttpClientTestingModule],
    });
    component = TestBed.get(UserIterationComponent);
    component.ngOnInit();
  });
  it("rewinded is true, should return false, session should be unchanged", () => {
    const session = component.getSession();
    expect(component.rewind()).toBeFalsy();
    expect(component.getSession()).toEqual(session);
  });
});

describe('UserIterationComponent: continue()', () => {
  let component: UserIterationComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1
      })
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserIterationComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PlotService, useClass: MockPlotService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: MockSpinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      imports: [HttpClientTestingModule],
    });
    component = TestBed.get(UserIterationComponent);
    component.ngOnInit();
  });
  it("finish is set to true, selectedPoints and selectedLabels are empty, should retun false", () => {
    expect(component.continue(true)).toBeFalsy();
  });
  it("finish is set to false, selectedPoints and selectedLabels are empty, should return false", () => {
    expect(component.continue(true)).toBeFalsy();
  });
});

describe('UserIterationComponent: showHeatmap()', () => {
  let component: UserIterationComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1
      })
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserIterationComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PlotService, useClass: MockPlotService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: MockSpinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      imports: [HttpClientTestingModule],
    });
    component = TestBed.get(UserIterationComponent);
    component.ngOnInit();
  });
  it("index is null, should resturn false", () => {
    expect(component.showHeatmap(null)).toBeFalsy();
  });
  it("index is undefined, should resturn false", () => {
    expect(component.showHeatmap(undefined)).toBeFalsy();
  });
  it("index is less than zero, should resturn false", () => {
    expect(component.showHeatmap(-1)).toBeFalsy();
  });
  it("index is bigger than the amount of subspaces, should resturn false", () => {
    expect(component.showHeatmap(999)).toBeFalsy();
  });
  it("index is valid, should resturn true", () => {
    expect(component.showHeatmap(0)).toBeTruthy();
  });
});
