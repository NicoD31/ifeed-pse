import { TestBed } from '@angular/core/testing';
import { AdminUserManagementComponent } from './admin-user-management.component';
import { List, Path, IdValPair, Func, Param, RESTService, IdFuncPair } from '../../Services/rest.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material';
import { PersonService } from '../../Services/person.service';

class MockPersonService extends PersonService {
  public static readonly USERID = 1;
  public static readonly ADMINID = 2;
  public getId() {
    return MockPersonService.ADMINID;
  }
}

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

class Mockspinner extends NgxSpinnerService {
  public show() { }
  public hide() { }
}

class MockMatDialog {

}

class MockRestService {

  public static readonly MOCKADMINS: JSON = require('src/assets/testobjects/Adminlist.json');
  public static readonly MOCKADMINS_FOR_INIT: JSON = require('src/assets/testobjects/AdminlistForInit.json');
  public static readonly MOCKUSER: JSON = require('src/assets/testobjects/Userlist.json');
  private static readonly RESULTS = 'results';

  public addDataToServer(list: List, object: JSON) {
    return new Promise(res => {});
  }

  public getServerData(list: List, path: Path[], params: IdValPair[], dataHandler: Func, errorHandler?: IdFuncPair[]) {
    if (list === List.ADMIN) {
      if (params['page']) {
        dataHandler(MockRestService.MOCKADMINS_FOR_INIT);
      }
      if (params[0].val[0] === 1) {
        dataHandler(MockRestService.MOCKADMINS['results'][0]);
      } else {
        dataHandler(MockRestService.MOCKADMINS['results'][1]);        
      }
    } else if (list === List.USER) {
      if (params['page']) {
        dataHandler(MockRestService.MOCKUSER);
      }
      if (params[0].val[0] === 3) {
        dataHandler(MockRestService.MOCKUSER['results'][0]);
      } else {
        dataHandler(MockRestService.MOCKUSER['results'][1]);
      }
    } else {
    }
  }

  public alterDataFromServer(list: List, path: Path[], object: JSON, param: Param, errorHandler?: IdFuncPair[]) {
    return new Promise(() => {});
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data;
    if (list === List.ADMIN) {
      data = MockRestService.MOCKADMINS_FOR_INIT;
    } else if (list === List.USER) {
      data = MockRestService.MOCKUSER;
    } else {
      return;
    }
    dataHandler(data['results']);
    endFunction(data);
  }
}

describe('AdminUserManagementComponent: Initialization', () => {
  let component: AdminUserManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserManagementComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: MatDialog, useClass: MatDialog},
        { provide: PersonService, useClass: MockPersonService},
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminUserManagementComponent);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init adminlist', () => {
    let admin1 = <JSON>{};
    let admin2 = <JSON>{};
    admin1['id'] = 1;
    admin1['name'] = 'admin1';
    admin1['isDeactivated'] = true;
    admin2['id'] = 2;
    admin2['name'] = 'admin2';
    admin2['isDeactivated'] = false;
    let arr:JSON[] = [];
    arr.push(admin1);
    arr.push(admin2);
    expect(component.getDisplayAdminList()).toEqual(arr);
  });

  it('should init userist', () => {
    let user1 = <JSON>{};
    let user2 = <JSON>{};
    user1['id'] = 3;
    user1['name'] = 'user1';
    user1['isDeactivated'] = true;
    user2['id'] = 4;
    user2['name'] = 'user2';
    user2['isDeactivated'] = false;
    let arr:JSON[] = [];
    arr.push(user1);
    arr.push(user2);
    expect(component.getDisplayUserList()).toEqual(arr);
  });
});

describe('AdminUserManagementComponent: activateUser()', () => {
  let component: AdminUserManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserManagementComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: MatDialog, useClass: MatDialog},
        { provide: PersonService, useClass: MockPersonService},
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminUserManagementComponent);
    component.ngOnInit();
  });

  it('should display error if user already activate', () => {
    component.activateUser(component.USERLIST, 4);
    expect(component.getMessage()).toEqual('User user2 already activated.');
  });

  it ('should be display error on unknown id', () => {
    component.activateUser(component.USERLIST, 5);
    expect(component.getMessage()).toEqual('Unknown person');
  });

  it ('should be display error on wrong list', () => {
    component.activateUser(component.ADMINLIST, 3);
    expect(component.getMessage()).toEqual('Unknown person');
  });
});

describe('AdminUserManagementComponent: activateUser()', () => {
  let component: AdminUserManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserManagementComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: MatDialog, useClass: MatDialog},
        { provide: PersonService, useClass: MockPersonService},
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminUserManagementComponent);
    component.ngOnInit();
  });

  it('should not deactivate own account', () => {
    component.deactivateUser(component.ADMINLIST, 2);
    expect(component.getMessage()).toEqual('You are not allowed to deactivate your own account.');
  });

  it('should display error if user already deactivated', () => {
    component.deactivateUser(component.USERLIST, 3);
    expect(component.getMessage()).toEqual('User user1 already deactivated.');
  });

  it ('should be display error on unknown id', () => {
    component.deactivateUser(component.USERLIST, 5);
    expect(component.getMessage()).toEqual('Unknown person');
  });

  it ('should be display error on wrong list', () => {
    component.deactivateUser(component.ADMINLIST, 3);
    expect(component.getMessage()).toEqual('Unknown person');
  });
});

describe('AdminUserManagementComponent: exists()', () => {
  let component: AdminUserManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserManagementComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: MatDialog, useClass: MatDialog},
        { provide: PersonService, useClass: MockPersonService},
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminUserManagementComponent);
    component.ngOnInit();
  });

  it('should return true on valid user', () => {
    console.log(component.getDisplayUserList());
    expect(component.exists(component.USERLIST, 3)).toEqual(true);
  });

  it('should return true on valid admin', () => {
    console.log(component.getDisplayAdminList());
    expect(component.exists(component.ADMINLIST, 1)).toEqual(true);
  });

  it('should return false on invalid user', () => {
    expect(component.exists(component.USERLIST, 5)).toEqual(false);
  });

  it('should return false on invalid admin', () => {
    expect(component.exists(component.ADMINLIST, 5)).toEqual(false);
  });

  it('should return false on valid user in adminlist', () => {
    expect(component.exists(component.ADMINLIST, 3)).toEqual(false);
  });

  it('should return false on valid admin in user', () => {
    expect(component.exists(component.USERLIST, 1)).toEqual(false);
  });
});

describe('AdminUserManagementComponent: deleteUser()', () => {
  let component: AdminUserManagementComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserManagementComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: MatDialog, useClass: MatDialog},
        { provide: PersonService, useClass: MockPersonService},
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminUserManagementComponent);
    component.ngOnInit();
  });

  it('should be prevent admin from deleting their own account', () => {
    component.deleteUser(component.ADMINLIST, 2);
    expect(component.getMessage()).toEqual('You are not allowed to delete your own account.');
  });

  it ('should display error on unknown user', () => {
    component.deleteUser(component.USERLIST, 5);
    expect(component.getMessage()).toEqual('Unknown person');
  });

  it ('should display error on unknown admin', () => {
    component.deleteUser(component.ADMINLIST, 5);
    expect(component.getMessage()).toEqual('Unknown person');
  });

  it ('should display error on valid user for adminlist', () => {
    component.deleteUser(component.ADMINLIST, 4);
    expect(component.getMessage()).toEqual('Unknown person');
  });

  it ('should display error on valid admin for userlist', () => {
    component.deleteUser(component.USERLIST, 1);
    expect(component.getMessage()).toEqual('Unknown person');
  });
});
