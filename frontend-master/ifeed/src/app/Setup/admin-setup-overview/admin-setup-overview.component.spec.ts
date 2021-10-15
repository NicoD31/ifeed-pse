import { inject, TestBed } from '@angular/core/testing';
import { Router, NavigationExtras } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminSetupOverviewComponent } from './admin-setup-overview.component';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material';
import { MatDialogRef } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { RESTService, Param, Func, List, Path } from '../../Services/rest.service';
import { CalcService } from '../../Services/calc.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StatisticsService } from 'src/app/Services/statistics.service';

class MockMatDialogRef {
}

class MockMatDialog {
}

class MockCalcService extends CalcService {
}

class MockChangeDetectorRef extends ChangeDetectorRef {
  public markForCheck() { }
  public checkNoChanges() { }
  public detach() { }
  public detectChanges() { }
  public reattach() { }
}

class MockRouter {
  public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return new Promise(res => true);
  }
}

class Mockspinner extends NgxSpinnerService {
  public show() { }
  public hide() { }
}

class MockStatisticsService {
  public compareSessions(session1: JSON, session2: JSON): number {
    return 1;
  }

  public cohensKappa(session1: JSON, session2: JSON): number {
    return 0.5;
  }

  public matrixColorEntry(session1: JSON, session2: JSON): string {
    return 'ffcccc';
  }
}

class MockRestService extends RESTService {

  public static readonly MOCKSETUPS: JSON[] = [JSON.parse('{ "id": 1, "name": "setup1", "creationTime": 1, "iterations": 1,' +
    '"feedbackMode": "user" }'),
    JSON.parse('{ "id": 2, "name": "setup2", "creationTime": 2, "iterations": 1, "feedbackMode":"user" }')];
  public static readonly MOCKSESSIONS: JSON[] = [JSON.parse('{ "id": 1, "name": "session1", "iteration": 1 }'),
    JSON.parse('{ "id": 2, "name": "session2", "iteration": 2}')];

  public static readonly MOCKDATASETS: JSON[] = [JSON.parse('{ "id": 1, "name": "dataset1", "dataset": {"values":[1,2]} }'),
    JSON.parse('{"id": 2, "name": "dataset2", "dataset": {"values":[1,2]} }')];

  public static readonly MOCKUSERS: JSON[] = [JSON.parse('{ "id": 1, "name": "user1", "isDeactivated":false }'),
    JSON.parse('{"id": 2, "name": "user2", "isDeactivated":false }')];

  public static readonly MOCKSETUP: JSON = JSON.parse('{ "id": 1, "name": "setup1", "creationTime": 1, "iterations": 1,' +
    '"feedbackMode": "user", "dataset":1 }');

  private static readonly RESULTS = 'results';

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data: any;

    switch (list) {
      case List.SETUP:
        data = MockRestService.MOCKSETUPS;
        break;
      case List.SESSION:
        data = MockRestService.MOCKSESSIONS;
        break;
      case List.DATASET:
       data = MockRestService.MOCKDATASETS;
        break;
      case List.USER:
        data = MockRestService.MOCKUSERS;
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

  public addDataToServer(list: List, object: JSON) {
    return new Promise(res => { id: 1 }).then();
  }
}

describe('AdminSetupOverviewComponent', () => {
  let adminSetupOvwComp: AdminSetupOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupOverviewComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupOvwComp = TestBed.get(AdminSetupOverviewComponent);
  });

  // creating component
  it('should create AdminSetupOverviewComponent', inject([AdminSetupOverviewComponent], (adminSetupOvw: AdminSetupOverviewComponent) => {
    expect(adminSetupOvw).toBeTruthy();
  }));
});

describe('AdminSetupOverviewComponent: methods', () => {
  let adminSetupOvwComp: AdminSetupOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupOverviewComponent,
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule]
    });
    adminSetupOvwComp = TestBed.get(AdminSetupOverviewComponent);
  });

  /* Invalid cases */

  // input null
  it('selectSetupForSessionCreation: should return false if Setup null', () => {
    const mockSetup = null;
    expect(adminSetupOvwComp.selectSetupForSessionCreation(mockSetup)).toEqual(false);
  });

  // input undefined
  it('selectSetupForSessionCreation: should return false if Setup undefined', () => {
    const mockSetup = undefined;
    expect(adminSetupOvwComp.selectSetupForSessionCreation(mockSetup)).toEqual(false);
  });

  // no User selected
  it('submitSelection: should not create of no User selected', () => {
    const mockSetup = '{"test": "test"}';
    adminSetupOvwComp.selectSetupForSessionCreation(JSON.parse(mockSetup));
    adminSetupOvwComp.submitSelection();

    expect(adminSetupOvwComp.getIsStatSelected()).toEqual(false);
    expect(adminSetupOvwComp.getDisplayCreationMessage()).toEqual(true);
    expect(adminSetupOvwComp.getCreationMessage()).toEqual('At least one User must be selected');
  });

  /* Valid cases */

  it('selectSetupForSessionCreation: should return true if Setup valid and correctly set', () => {
    const mockSetup = '{"test": "test"}';
    const retValue = adminSetupOvwComp.selectSetupForSessionCreation(JSON.parse(mockSetup));

    expect(adminSetupOvwComp.getSelectedUsers().value).toEqual(null);
    expect(adminSetupOvwComp.getSelectedSetup()).toEqual(JSON.parse(mockSetup));
    expect(adminSetupOvwComp.getIsSessionCreationSeleted()).toEqual(true);
    expect(adminSetupOvwComp.getDisplayCreationMessage()).toEqual(false);
    expect(adminSetupOvwComp.getIsStatSelected()).toEqual(false);
    expect(retValue).toEqual(true);
  });

  it('submitSelection: should set message and attributes correctly', () => {
    const mockSetup = '{"test": "test"}';
    adminSetupOvwComp.selectSetupForSessionCreation(JSON.parse(mockSetup));

    const userFormBuilder = new FormBuilder();
    adminSetupOvwComp.setSelectedUsers(userFormBuilder.control({
      user: ['user1', 'user2']
    }));

    adminSetupOvwComp.submitSelection();
    expect(adminSetupOvwComp.getIsStatSelected()).toEqual(false);
    expect(adminSetupOvwComp.getDisplayCreationMessage()).toEqual(true);
    expect(adminSetupOvwComp.getCreationMessage()).toEqual('Session creation successful');
  });

  it('selectSetupForStatistics: should set matrix default values and attributes correctly', () => {
    adminSetupOvwComp.selectSetupForStatistics(MockRestService.MOCKSETUP);

    expect(adminSetupOvwComp.getSelectedRow()).toEqual(['0', '0', '0', '0']);
    expect(adminSetupOvwComp.getSelectedCol()).toEqual(['0', '0', '0', '0']);
    expect(adminSetupOvwComp.getSelectedSetup()).toEqual(MockRestService.MOCKSETUP);
    expect(adminSetupOvwComp.getSessionsLoaded()).toEqual(true);
    expect(adminSetupOvwComp.getIsStatSelected()).toEqual(true);
    expect(adminSetupOvwComp.getIsSessionCreationSeleted()).toEqual(false);
    expect(adminSetupOvwComp.getDisplayCreationMessage()).toEqual(false);
    expect(adminSetupOvwComp.getDisplayDeletionMessage()).toEqual(false);
  });
});

describe('AdminSetupOverviewComponent: ngOnInit', () => {
  let adminSetupOvwComp: AdminSetupOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupOvwComp = TestBed.get(AdminSetupOverviewComponent);
    adminSetupOvwComp.ngOnInit();
  });

  // setup list
  it('setupList is initialized correctly', () => {
    expect(adminSetupOvwComp.getFilteredSetups()).toEqual(MockRestService.MOCKSETUPS.sort((a, b) => b['creationTime'] - a['creationTime']));
  });
});

describe('AdminSetupOverviewComponent: matrices', () => {
  let adminSetupOvwComp: AdminSetupOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
        { provide: StatisticsService, useClass: MockStatisticsService },
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupOvwComp = TestBed.get(AdminSetupOverviewComponent);
    adminSetupOvwComp.selectSetupForStatistics(MockRestService.MOCKSETUP);
    adminSetupOvwComp.ngOnInit();
  });

  it('should initialize matrices correctly', () => {
    adminSetupOvwComp.initalizeMatrices();
    expect(adminSetupOvwComp.getStatisticsMessage()).toEqual('Please select Sessions in rows and columns for comparison');
    expect(adminSetupOvwComp.getColorMatrix()).toEqual([['ffffff', 'ffffff', 'ffffff', 'ffffff'],
      ['ffffff', 'ffffff', 'ffffff', 'ffffff'], ['ffffff', 'ffffff', 'ffffff', 'ffffff'],
      ['ffffff', 'ffffff', 'ffffff', 'ffffff']]);

    expect(adminSetupOvwComp.getCappaMatrix()).toEqual([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  });

  it('should update matrices correctly', () => {
    adminSetupOvwComp.setSelectedRow(['1', '0', '0', '0']);
    adminSetupOvwComp.setSelectedCol(['2', '0', '0', '0']);

    adminSetupOvwComp.updateMatrices();
    expect(adminSetupOvwComp.getStatisticsMessage()).toEqual('Color saturation implicates correlation, the number is the ' +
      'computed cappa value');

    expect(adminSetupOvwComp.getColorMatrix()).toEqual([['ffcccc', 'ffffff', 'ffffff', 'ffffff'],
    ['ffffff', 'ffffff', 'ffffff', 'ffffff'], ['ffffff', 'ffffff', 'ffffff', 'ffffff'],
    ['ffffff', 'ffffff', 'ffffff', 'ffffff']]);

    expect(adminSetupOvwComp.getCappaMatrix()).toEqual([[0.5, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  });

  it('should update matrices after selection gets unselected again', () => {
    adminSetupOvwComp.setSelectedRow(['1', '0', '0', '0']);
    adminSetupOvwComp.setSelectedCol(['2', '0', '0', '0']);
    adminSetupOvwComp.updateMatrices();

    expect(adminSetupOvwComp.getColorMatrix()).toEqual([['ffcccc', 'ffffff', 'ffffff', 'ffffff'],
    ['ffffff', 'ffffff', 'ffffff', 'ffffff'], ['ffffff', 'ffffff', 'ffffff', 'ffffff'],
    ['ffffff', 'ffffff', 'ffffff', 'ffffff']]);

    expect(adminSetupOvwComp.getCappaMatrix()).toEqual([[0.5, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);

    adminSetupOvwComp.setSelectedRow([undefined, '0', '0', '0']);
    adminSetupOvwComp.setSelectedCol([undefined, '0', '0', '0']);
    adminSetupOvwComp.updateMatrices();

    expect(adminSetupOvwComp.getColorMatrix()).toEqual([['ffffff', 'ffffff', 'ffffff', 'ffffff'],
    ['ffffff', 'ffffff', 'ffffff', 'ffffff'], ['ffffff', 'ffffff', 'ffffff', 'ffffff'],
    ['ffffff', 'ffffff', 'ffffff', 'ffffff']]);

    expect(adminSetupOvwComp.getCappaMatrix()).toEqual([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  });
});

describe('AdminSetupOverviewComponent: createSessions', () => {
  let adminSetupOvwComp: AdminSetupOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSetupOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule, MatDialogModule]
    });
    adminSetupOvwComp = TestBed.get(AdminSetupOverviewComponent);
    adminSetupOvwComp.ngOnInit();
    adminSetupOvwComp.selectSetupForSessionCreation(MockRestService.MOCKSETUP);
  });

  // setup list
  it('should create Sessions correctly', () => {
    const result = adminSetupOvwComp.executeSessionCreation(MockRestService.MOCKUSERS);
    expect(result.length).toEqual(MockRestService.MOCKUSERS.length);

    for(let i = 0; i < result.length; i++) {
      expect(result[i]['inProgress']).toEqual(0);
      expect(result[i]['iteration']).toEqual(0);
      expect(result[i]['pauses']).toEqual(0);
      expect(result[i]['rewinds']).toEqual(0);
      expect(result[i]['history']).toEqual([]);
      expect(result[i]['heatmaps']).toEqual([]);
      expect(result[i]['labels']).toEqual(['U', 'U']);
      expect(result[i]['finalLabels']).toEqual([]);
      expect(result[i]['finished']).toEqual(false);
      expect(result[i]['setup']).toEqual(MockRestService.MOCKSETUP['id']);
      expect(result[i]['userlabelMatchesAPI']).toEqual([]);
    }
  });
});