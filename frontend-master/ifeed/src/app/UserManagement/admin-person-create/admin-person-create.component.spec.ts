import { TestBed } from '@angular/core/testing';
import { RESTService, List } from '../../Services/rest.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { PersonService } from '../../Services/person.service';
import { AdminPersonCreateComponent } from './admin-person-create.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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

  public addDataToServer(list: List, object: JSON) {
    return new Promise(res => {});
  }

}

describe('AdminPersonCreateComponent: Initializations', () => {
  let component: AdminPersonCreateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminPersonCreateComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: NgxSpinnerService, useClass: Mockspinner }, ],
      imports: [RouterTestingModule, HttpClientTestingModule]
    });
    component = TestBed.get(AdminPersonCreateComponent);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('inits message correct', () => {
    expect(component.getMessage()).toEqual('');
  });

  it('inits isAdmin correct', () => {
    expect(component.getIsAdmin()).toEqual(false);
  });

  it('inits password correct', () => {
    expect(component.getPassword()).toEqual('');
  });

  it('inits passwordConfirm correct', () => {
    expect(component.getPasswordConfirm()).toEqual('');
  });

  it('inits name correct', () => {
    expect(component.getUsername()).toEqual('');
  });
});

describe('AdminPersonCreateComponent: checkPassword()', () => {
  let component: AdminPersonCreateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminPersonCreateComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: NgxSpinnerService, useClass: Mockspinner }, ],
      imports: [RouterTestingModule, HttpClientTestingModule]
    });
    component = TestBed.get(AdminPersonCreateComponent);
    component.ngOnInit();
  });

  it('should return false on null', () => {
    component.setIsAdmin(null);
    expect(component.checkPassword(null)).toEqual(false);
  });

  it('should return false for to long password', () => {
    component.setIsAdmin(null);
    component.setUsername('admin');
    component.setPassword('0123456789012345678901234567890123456789012345678901234567'
    + '890123456789012345678901234567890123456789012345678901234567890123456789');
    expect(component.checkPassword(null)).toEqual(false);
  });

  it('should return false on empty string', () => {
    component.setIsAdmin(null);
    expect(component.checkPassword('')).toEqual(false);
  });

  it('should return false on string with length 7', () => {
    component.setIsAdmin(null);
    expect(component.checkPassword('1234567')).toEqual(false);
  });

  it('should return false for !isAdmin and length 1', () => {
    expect(component.checkPassword('1')).toEqual(false);
  });

  it('should return true for !isAdmin and length 0', () => {
    expect(component.checkPassword('')).toEqual(true);
  });
});

describe('AdminPersonCreateComponent: finishCreation()', () => {
  let component: AdminPersonCreateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminPersonCreateComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: NgxSpinnerService, useClass: Mockspinner }, ],
      imports: [RouterTestingModule, HttpClientTestingModule]
    });
    component = TestBed.get(AdminPersonCreateComponent);
    component.ngOnInit();
  });

  it('should return false on admin with empty password', () => {
    component.setIsAdmin(null);
    component.setUsername('name');
    expect(component.finishCreation()).toEqual(false);
  });

  it('should return false on to long username', () => {
    component.setUsername('01234567890123456789012345678901234567890123456789');
      expect(component.finishCreation()).toEqual(false);
  });

  it('should return false on empty name', () => {
    expect(component.finishCreation()).toEqual(false);
  });

  it('should return true on valid name for user', () => {
    component.setUsername('Name');
    expect(component.finishCreation()).toEqual(true);
  });

  it('should return true on valid name and password & confirmation for admin', () => {
    component.setUsername('Admin');
    component.setPassword('12345678');
    component.setPasswordConfirm('12345678');
    expect(component.finishCreation()).toEqual(true);
  });

  it('should return false on valid name and invalid password for admin', () => {
    component.setUsername('Admin');
    component.setIsAdmin(null);
    expect(component.finishCreation()).toEqual(false);
  });

  it('should return false on valid name and valid password but false confirmation for admin', () => {
    component.setUsername('Admin');
    component.setIsAdmin(null);
    component.setPassword('12345678');
    expect(component.finishCreation()).toEqual(false);
  });

  it('should return false on valid name and invalid password but something entered for confirmation for admin', () => {
    component.setUsername('Admin');
    component.setIsAdmin(null);
    component.setPasswordConfirm('12345678');
    expect(component.finishCreation()).toEqual(false);
  });
});
