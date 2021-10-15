import { inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminMainOverviewComponent } from './admin-main-overview.component';
import { ChangeDetectorRef } from '@angular/core';
import { RESTService, Param, Func, List, Path } from '../../Services/rest.service';
import { Router, NavigationExtras } from '@angular/router';
import { CalcService } from '../../Services/calc.service';
import { NgxSpinnerService } from 'ngx-spinner';

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

class MockCalcService extends CalcService {
}

class Mockspinner extends NgxSpinnerService {
  public show() { }
  public hide() { }
}

class MockRestService extends RESTService {

  public static readonly MOCKSETUPS: JSON[] = [JSON.parse('{ "id": 1, "name": "setup1", "creationTime": 1, "iterations": 1,' +
    '"feedbackMode": "user" }'), JSON.parse('{ "id": 2, "name": "setup2", "creationTime": 2, "iterations": 1, "feedbackMode":"user" }')];

  public static readonly MOCKSESSIONS: JSON[] = [JSON.parse('{ "id": 1, "name": "session1", "iteration": 0, "finished": false,' +
    '"inProgress": 0, "setup": 1 }'),
    JSON.parse('{ "id": 2, "name": "session2", "iteration": 0, "finished": false, "inProgress": 0, "setup": 2 }')];

  public static readonly MOCKDATASETS: JSON[] = [JSON.parse('{ "id": 1, "name": "dataset1" }'),
    JSON.parse('{"id": 2, "name": "dataset2" }')];

  public static readonly MOCKUSERS: JSON[] = [JSON.parse('{ "id": 1, "name": "user1" }'), JSON.parse('{"id": 2, "name": "user2" }')];

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
}

describe('AdminMainOverviewComponent: load lists', () => {
  let component: AdminMainOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminMainOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminMainOverviewComponent);
    component.ngOnInit();
  });

  // creating component
  it('should create AdminMainOverviewComponent', inject([AdminMainOverviewComponent], (adminMain: AdminMainOverviewComponent) => {
    expect(adminMain).toBeTruthy();
  }));

  // setup list
  it('setupList is initialized correctly', () => {
    expect(component.getDisplayedSetupList()).toEqual(MockRestService.MOCKSETUPS.sort((a, b) => b['creationTime'] - a['creationTime']));
  });

  // session list
  it('session list is initialized correctly', () => {
    expect(component.getSessionList()).toEqual(MockRestService.MOCKSESSIONS.sort((a, b) => b['id'] - a['id']));
  });

  // dataset list
  it('dataset list is initialized correctly', () => {
    expect(component.getDatasetList()).toEqual(MockRestService.MOCKDATASETS.sort((a, b) => b['id'] - a['id']));
  });

  // user list
  it('user list is initialized correctly', () => {
    expect(component.getUserList()).toEqual(MockRestService.MOCKUSERS.sort((a, b) => b['id'] - a['id']));
  });
});
