import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSessionOverviewComponent } from './admin-session-overview.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { RESTService, Param, Func, List, Path } from '../../../Services/rest.service';
import { Router, NavigationExtras } from '@angular/router';
import { CalcService } from '../../../Services/calc.service';
import { PersonService } from '../../../Services/person.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogModule, MatDialog } from '@angular/material';
import { MatDialogRef } from '@angular/material';

class MockMatDialogRef {

}

class MockMatDialog {

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
class MockCalcService extends CalcService {
  public static readonly FILTERED = [JSON.parse('{"result": "filtered"}')];
  public filterListName(list: JSON[], filter: string): JSON[] {
    if (filter === '') {
      return list;
    } else {
      return MockCalcService.FILTERED;
    }
  }
}
class MockPersonService extends PersonService {
  public static readonly USERID = 1;
  public static readonly ADMINID = 2;
  public getId() {
    return MockPersonService.USERID;
  }
}
class Mockspinner extends NgxSpinnerService {
  public show() { }
  public hide() { }
}

class MockRestService extends RESTService {

  public static readonly VALID_SETUP_ID = 1;
  public static readonly MOCKSESSIONS: JSON[] = [JSON.parse('{ "user": 1, "id": 0, "name": "setup_user1" }')];
  public static readonly MOCKSETUPS: JSON[] = [JSON.parse('{ "id": 1,"name": "setup" }'), JSON.parse('{"id": 2, "name": "setup2"}')];
  private static readonly RESULTS = 'results';

  public getServerData(list: List, path: Path[], params: Param, dataHandler: Func) {
    let result: any;
    if (list === List.SESSION) {

    } else if (list === List.SETUP) {

    }
    return new Promise(res => { id: 1 }).then(dataHandler);
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data: any;
    if (list === List.SESSION) {
      data = MockRestService.MOCKSESSIONS;
    } else if (list === List.SETUP) {
      data = MockRestService.MOCKSETUPS;
    }
    dataHandler(data);
    if (data[MockRestService.RESULTS] != null) {
      this.getServerPages(list, path, params, dataHandler, endFunction);
    } else {
      endFunction(data);
    }
  }
}

describe('AdminSessionOverviewComponent: creation', () => {
  let component: AdminSessionOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSessionOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef }
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminSessionOverviewComponent);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('AdminSessionOverviewComponent: methods', () => {
  let component: AdminSessionOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSessionOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef }
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminSessionOverviewComponent);
    component.ngOnInit();
  });

  it('should should return false with a null session', () => {
    expect(component.deleteSession(null)).toBeFalsy();
  });

  it('should should return -1 with a null session', () => {
    expect(component.createPercentFinishedInfo(null)).toBe(-1);
  });

  it('should should return false with a null session', () => {
    expect(component.getStatus(null)).toBeFalsy();
  });
});
