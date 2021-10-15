import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserMainOverviewComponent } from './user-main-overview.component';
import { ChangeDetectorRef } from '@angular/core';
import { RESTService, Param, Func, List, Path } from '../../Services/rest.service';
import { Router, NavigationExtras } from '@angular/router';
import { CalcService } from '../../Services/calc.service';
import { PersonService } from '../../Services/person.service';
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
    return new Promise(res => { id: 1 }).then(dataHandler);
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data: any;
    if (list === List.SESSION) {
      data = JSON.parse(JSON.stringify(MockRestService.MOCKSESSIONS));
    } else if (list === List.SETUP) {
      data = JSON.parse(JSON.stringify(MockRestService.MOCKSETUPS));
    }
    dataHandler(data);
    if (data[MockRestService.RESULTS] != null) {
      this.getServerPages(list, path, params, dataHandler, endFunction);
    } else {
      endFunction(data);
    }
  }
}

describe('UserMainOverviewComponent: Initializations', () => {
  let component: UserMainOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMainOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(UserMainOverviewComponent);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setupList is initialized correctly', () => {
    expect(component.getSetupList()).toEqual(MockRestService.MOCKSETUPS);
  });

  it('filteredList is initialized correctly', () => {
    expect(component.getFilteredList()).toEqual(MockRestService.MOCKSESSIONS);
  });
  it('sessionList is initialized correctly', () => {
    expect(component.getSessionList()).toEqual(MockRestService.MOCKSESSIONS);
  });
});

describe('UserMainOverviewComponent: getSetup()', () => {
  let component: UserMainOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMainOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(UserMainOverviewComponent);
    component.ngOnInit();
  });

  it('undefined input should return null', () => {
    const setupList = component.getSetup(undefined);
    expect(setupList).toBeNull();
  });

  it('null input should return null', () => {
    const setupList = component.getSetup(null);
    expect(setupList).toBeNull();
  });

  it('negative input should return null', () => {
    const setupList = component.getSetup(-1);
    expect(setupList).toBeNull();
  });

  it('nonexisting input id should return null', () => {
    const setupList = component.getSetup(999);
    expect(setupList).toBeNull();
  });

  it('valid input id', () => {
    const setupList = component.getSetup(MockRestService.VALID_SETUP_ID);
    expect(setupList).toEqual(JSON.parse('{ "id": 1, "name": "setup" }'));
  });
});


describe('UserMainOverviewComponent: filterSessionList()', () => {
  let component: UserMainOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMainOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(UserMainOverviewComponent);
    component.ngOnInit();
  });

  it('filter is null should remain unchanged', () => {
    const filteredList = component.getFilteredList();
    component.filterSessionList(null);
    expect(filteredList).toEqual(component.getFilteredList());
  });
  it('filter is undefined should remain unchanged', () => {
    const filteredList = component.getFilteredList();
    component.filterSessionList(undefined);
    expect(filteredList).toEqual(component.getFilteredList());
  });
  it('filter is not contained in any session', () => {
    component.filterSessionList('INVALID');
    const filteredList = component.getFilteredList();
    expect(filteredList).toEqual(MockCalcService.FILTERED);
  });
  it('filter is contained in all sessions', () => {
    component.filterSessionList('u');
    const filteredList = component.getFilteredList();
    expect(filteredList).toEqual(MockCalcService.FILTERED);
  });
});

describe('UserMainOverviewComponent: onNameClick()', () => {
  let component: UserMainOverviewComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMainOverviewComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: CalcService, useClass: MockCalcService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(UserMainOverviewComponent);
    component.ngOnInit();
  });
  it('finished is true, id is negative should return false', () => {
    expect(component.onNameClick(true, -1)).toBeFalsy();
  });
  it('finished is false, id is null should return false', () => {
    expect(component.onNameClick(false, null)).toBeFalsy();
  });
  it('finished is true, id is valid should return true', () => {
    expect(component.onNameClick(true, 1)).toBeTruthy();
  });
  it('finished is false, id is valid should return true', () => {
    expect(component.onNameClick(false, 1)).toBeTruthy();
  });
});
