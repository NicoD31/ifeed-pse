import { inject, TestBed } from '@angular/core/testing';
import { AdminSetupDetailComponent } from './admin-setup-detail.component';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material';
import { MatDialogRef } from '@angular/material';
import { ChangeDetectorRef } from '@angular/core';
import { RESTService, Param, Func, List, Path } from '../../Services/rest.service';
import { CalcService } from 'src/app/Services/calc.service';

class MockChangeDetectorRef extends ChangeDetectorRef {
  public markForCheck() { }
  public checkNoChanges() { }
  public detach() { }
  public detectChanges() { }
  public reattach() { }
}

class MockMatDialogRef {
}

class MockRouter {
  public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return new Promise(res => true);
  }
}

class MockActivatedRoute {
  public snapshot: MockActivatedRouteSnapshot = new MockActivatedRouteSnapshot();
}

class MockActivatedRouteSnapshot {
  public paramMap: MockParamMap = new MockParamMap();
}

class MockParamMap {
  public get(id: number) {
    return 1;
  }
}

class MockCalcService extends CalcService {
  public calcAverageTimeSession(sessionList: JSON[]) {
    return 1;
  }
}

class MockRestService {

  public static readonly MOCKSETUPS_ONE: JSON[] = [JSON.parse('{ "id": 1, "name": "setup1", "creationTime": 1, "iterations": 1,' +
    '"feedbackMode": "user"}'), JSON.parse('{ "id": 2, "name": "setup2", "creationTime": 2, "iterations": 1, "feedbackMode":"user" }')];

  public static readonly MOCKSETUPS_TWO: JSON[] = [JSON.parse('{ "id": 1, "name": "setup1", "creationTime": 1, "iterations": 1,' +
    '"feedbackMode": "user"}'), JSON.parse('{ "id": 2, "name": "setup1_copy_1", "creationTime": 2, "iterations": 1,' +
    '"feedbackMode":"user" }')];

  public static readonly MOCKSESSIONS: JSON[] = [JSON.parse('{ "id": 1, "name": "session1", "iteration": 10, "finished": false,' +
    '"inProgress": 20, "setup": 1 }'), JSON.parse('{ "id": 2, "name": "session2", "iteration": 30, "finished": false,' +
    '"inProgress": 40, "setup": 1 }')];


  public static readonly MOCKSETUP_NOTFINISHED = JSON.parse('{ "id": 1, "name": "setup1", "finishedCreation":false}');
  public static readonly MOCKSETUP_FINISHED = JSON.parse('{ "id": 1, "name": "setup1", "finishedCreation":true}');

  private static readonly RESULTS = 'results';

  private static setupSelector: string;

  static getOriginal(): JSON {
    const setup = JSON;
    setup['id'] = 1;
    setup['name'] = 'setup';
    setup['params'] = { 'C': 0.05, 'gamma': 2 };
    setup['rawData'] = true;
    setup['rewindable'] = true;
    setup['subspaces'] = [[1, 1]];
    setup['subspaceGrids'] = [[1, 1]];
    setup['iterations'] = 1;
    setup['maxAnswerTime'] = 1;
    setup['creationTime'] = 1;
    setup['dataset'] = 1;
    setup['feedbackMode'] = 'user';
    setup['historyMode'] = 'heatmaps';
    setup['creator'] = 1;
    setup['queryStrategy'] = 1;
    setup['finishedCreation'] = true;
    setup['sessions'] = [];
    setup['classifier'] = 1;

    return setup;
  }

  static getCopyOne(): JSON {
    const setup = JSON;
    setup['id'] = 1;
    setup['name'] = 'setup_copy_1';
    setup['params'] = { 'C': 0.05, 'gamma': 2 };
    setup['rawData'] = true;
    setup['rewindable'] = true;
    setup['subspaces'] = [[1, 1]];
    setup['subspaceGrids'] = [[1, 1]];
    setup['iterations'] = 1;
    setup['maxAnswerTime'] = 1;
    setup['creationTime'] = 1;
    setup['dataset'] = 1;
    setup['feedbackMode'] = 'user';
    setup['historyMode'] = 'heatmaps';
    setup['creator'] = 1;
    setup['queryStrategy'] = 1;
    setup['finishedCreation'] = true;
    setup['sessions'] = [];
    setup['classifier'] = 1;

    return setup;
  }

  static getCopyTwo(): JSON {
    const setup = JSON;
    setup['id'] = 1;
    setup['name'] = 'setup_copy_2';
    setup['params'] = { 'C': 0.05, 'gamma': 2 };
    setup['rawData'] = true;
    setup['rewindable'] = true;
    setup['subspaces'] = [[1, 1]];
    setup['subspaceGrids'] = [[1, 1]];
    setup['iterations'] = 1;
    setup['maxAnswerTime'] = 1;
    setup['creationTime'] = 1;
    setup['dataset'] = 1;
    setup['feedbackMode'] = 'user';
    setup['historyMode'] = 'heatmaps';
    setup['creator'] = 1;
    setup['queryStrategy'] = 1;
    setup['finishedCreation'] = true;
    setup['sessions'] = [];
    setup['classifier'] = 1;

    return setup;
  }

  static selectSetup(setup: string) {
    this.setupSelector = setup;
  }

  public getServerData(list: List, path: Path[], params: Param, dataHandler: Func) {
    let result: any;

    switch (list) {
      case List.SETUP:
        if (MockRestService.setupSelector === 'finishedSetup') {
          result = MockRestService.MOCKSETUP_FINISHED;
        } else if (MockRestService.setupSelector === 'notFinishedSetup') {
          result = MockRestService.MOCKSETUP_NOTFINISHED;
        }
        break;
      default:
        break;
    }

    dataHandler(result);
  }

  public addDataToServer(list: List, object: JSON) {
    return new Promise(res => { id: 1 }).then();
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data: any;

    switch (list) {
      case List.SETUP:
        data = MockRestService.MOCKSETUPS_ONE;
        break;
      case List.SESSION:
        data = MockRestService.MOCKSESSIONS;
        break;
      default:
        break;
    }

    dataHandler(data);
    if (data[MockRestService.RESULTS] != null) {
      this.getServerPages(list, path, params, dataHandler, endFunction);
    } else {
      endFunction(data);
    }
  }
}

describe('AdminSetupDetailComponent', () => {
  let adminSetupDetailComp: AdminSetupDetailComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupDetailComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupDetailComp = TestBed.get(AdminSetupDetailComponent);
  });

  // creating component
  it('should create AdminSetupDetailComponent', inject([AdminSetupDetailComponent], (adminSetupDetail: AdminSetupDetailComponent) => {
    expect(adminSetupDetail).toBeTruthy();
  }));
});

describe('AdminSetupDetailComponent: cloneSetup', () => {
  let adminSetupDetailComp: AdminSetupDetailComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupDetailComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupDetailComp = TestBed.get(AdminSetupDetailComponent);
    MockRestService.selectSetup('finishedSetup');
  });

  it('should copy the requested Setup with all its parameters and set the new name the right way', () => {
    adminSetupDetailComp.setSetupList(MockRestService.MOCKSETUPS_ONE);
    adminSetupDetailComp.setSetup(MockRestService.getOriginal());
    expect(adminSetupDetailComp.cloneSetup()).toEqual(MockRestService.getCopyOne());
  });

  it('should correctly create a copy of a copy', () => {
    adminSetupDetailComp.setSetupList(MockRestService.MOCKSETUPS_TWO);
    adminSetupDetailComp.setSetup(MockRestService.getCopyOne());
    expect(adminSetupDetailComp.cloneSetup()).toEqual(MockRestService.getCopyTwo());
  });
});

describe('AdminSetupDetailComponent: lists loading', () => {
  let adminSetupDetailComp: AdminSetupDetailComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupDetailComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupDetailComp = TestBed.get(AdminSetupDetailComponent);
    MockRestService.selectSetup('finishedSetup');
    adminSetupDetailComp.ngOnInit();
  });

  it('should initialize setup correctly', () => {
    expect(adminSetupDetailComp.getSetup()).toEqual(MockRestService.MOCKSETUP_FINISHED);
  });

  it('should load Sessions correctly', () => {
    expect(adminSetupDetailComp.getFilteredSessions()).toEqual(MockRestService.MOCKSESSIONS.sort((a, b) => b['id'] - a['id']));
  });

  it('should load Setups correctly', () => {
    expect(adminSetupDetailComp.getSetupList()).toEqual(MockRestService.MOCKSETUPS_ONE);
  });
});

describe('AdminSetupDetailComponent: lists loading', () => {
  let adminSetupDetailComp: AdminSetupDetailComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupDetailComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: CalcService, useClass: MockCalcService }
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupDetailComp = TestBed.get(AdminSetupDetailComponent);
    MockRestService.selectSetup('notFinishedSetup');
    adminSetupDetailComp.ngOnInit();
  });

  it('should initialize setup correctly', () => {
    expect(adminSetupDetailComp.getSetup()).toEqual(MockRestService.MOCKSETUP_NOTFINISHED);
  });
});
