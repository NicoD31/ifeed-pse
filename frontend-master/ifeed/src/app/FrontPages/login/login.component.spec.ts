import { TestBed, inject } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { Router, NavigationExtras } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RESTService, Param, Func, List, Path } from '../../Services/rest.service';
import { EnumService } from '../../Services/enum.service';
import { PersonService } from '../../Services/person.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';

class MockRestService {

  private static readonly MOCKPERSON_TWO = [JSON.parse('{ "id": 1,"name": "admin1", "isDeactivated":false}'),
    JSON.parse('{ "id": 2,"name": "admin2", "isDeactivated":false}')];

  private static readonly MOCKADMIN = [JSON.parse('{ "id": 1,"name": "admin1", "password":"right", "isDeactivated":false}')];
  private static readonly MOCKUSER = [JSON.parse('{ "id": 1,"name": "user1", "isDeactivated":false}')];
  private static readonly MOCKPERSON_DEACTIVATED = [JSON.parse('{ "id": 2,"name": "admin2", "isDeactivated":true}')];

  private static resultPerson: JSON = JSON.parse('{"count":0, "results":0}');
  private static resultAdmin: JSON = JSON.parse('{"count":0, "results":0}');
  private static resultUser: JSON = JSON.parse('{"count":0, "results":0}');

  public static readonly DEACTIVATED_PERSON = 'deactivatedPerson';
  public static readonly INVALID_PERSON = 'invalidPerson';
  public static readonly DOUBLE_NAME = 'doubleName';
  public static readonly ADMIN = 'admin';
  public static readonly USER = 'user';

  static init(testCase: string) {

    switch (testCase) {
      case MockRestService.DEACTIVATED_PERSON:
        MockRestService.resultPerson['count'] = 1;
        MockRestService.resultPerson['results'] = MockRestService.MOCKPERSON_DEACTIVATED;
        break;
      case MockRestService.INVALID_PERSON:
        MockRestService.resultPerson['count'] = 0;
        MockRestService.resultPerson['results'] = [];
        break;
      case MockRestService.DOUBLE_NAME:
        MockRestService.resultPerson['count'] = 2;
        MockRestService.resultPerson['results'] = MockRestService.MOCKPERSON_TWO;
        break;
      case MockRestService.ADMIN:
        MockRestService.resultAdmin['count'] = 1;
        MockRestService.resultAdmin['results'] = MockRestService.MOCKADMIN;
        MockRestService.resultPerson = MockRestService.resultAdmin;
        break;
      case MockRestService.USER:
        MockRestService.resultUser['count'] = 1;
        MockRestService.resultUser['results'] = MockRestService.MOCKUSER;
        MockRestService.resultPerson = MockRestService.resultUser;
        break;
      default:
        break;
    }
  }

  public getServerData(list: List, path: Path[], params: Param, dataHandler: Func) {
    let result: any;

    switch (list) {
      case List.PERSON:
        result = MockRestService.resultPerson;
        break;
      case List.ADMIN:
        result = MockRestService.resultAdmin;
        break;
      case List.USER:
        result = MockRestService.resultUser;
        break;
      default:
        break;
    }

    dataHandler(result);
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {

  }
}

class MockChangeDetectorRef {

}

class MockPersonService extends PersonService {
  public hash(input: string): string {
    return input;
  }
}

class MockEnumService extends EnumService {

}

class MockRouter {
  public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return new Promise(res => true);
  }
}

describe('LoginComponent: onSubmit', () => {
  let loginComp: LoginComponent;

  const nameFormBuilder: FormBuilder = new FormBuilder();
  const passwordFormBuilder: FormBuilder = new FormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoginComponent,
        { provide: RESTService, useClass: MockRestService },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: FormBuilder, useValue: nameFormBuilder },
        { provide: FormBuilder, useValue: passwordFormBuilder },
        { provide: EnumService, useClass: MockEnumService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: Router, useClass: MockRouter }
      ],
      imports: [ReactiveFormsModule, HttpClientTestingModule]
    });
    loginComp = TestBed.get(LoginComponent);
  });

  // creating component
  it('should create LoginComponent', inject([LoginComponent], (login: LoginComponent) => {
    expect(login).toBeTruthy();
  }));

  // creating component
  it('should correctly do ngOnInit', () => {
    loginComp.ngOnInit();
    expect(loginComp.getNameForm()).toBeDefined();
    expect(loginComp.getPasswordForm()).toBeDefined();
  });

  /* invalid cases */

  // invalid name
  it('should not login if name unknown', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['invalidtest']
    }));

    MockRestService.init(MockRestService.INVALID_PERSON);
    loginComp.onSubmit();
    expect(loginComp.getNameNotValid()).toEqual(true);
    expect(loginComp.getErrorMessage()).toEqual('Unknown login name');
  });

  // invalid name
  it('should not login if name double', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['invalidtest']
    }));

    MockRestService.init(MockRestService.DOUBLE_NAME);
    loginComp.onSubmit();
    expect(loginComp.getNameNotValid()).toEqual(true);
    expect(loginComp.getErrorMessage()).toEqual('Unknown login name');
  });

  // invalid name
  it('should not login if name with trailing white space', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['admin1 ']
    }));

    MockRestService.init(MockRestService.ADMIN);
    loginComp.onSubmit();
    expect(loginComp.getNameNotValid()).toEqual(true);
    expect(loginComp.getErrorMessage()).toEqual('Unknown login name');
  });

  // deactivated person
  it('should not login if Person is deactivated', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['admin2']
    }));

    MockRestService.init(MockRestService.DEACTIVATED_PERSON);
    loginComp.onSubmit();
    expect(loginComp.getNameNotValid()).toEqual(true);
    expect(loginComp.getErrorMessage()).toEqual('This Person has been deactivated');
  });

  // right name wrong password
  it('should not login if wrong password entered', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['admin1']
    }));

    loginComp.setPasswordForm(loginComp.nameFormBuilder.group({
      password: ['wrong']
    }));

    MockRestService.init(MockRestService.ADMIN);
    loginComp.onSubmit();
    expect(loginComp.getIsAdmin()).toEqual(true);
    expect(loginComp.getPasswordNotValid()).toEqual(true);
    expect(loginComp.getErrorMessage()).toEqual('Invalid name and password combination');
  });

  /* valid cases */

  // valid admin
  it('should login Admin if correct name and password entered', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['admin1']
    }));

    loginComp.setPasswordForm(loginComp.nameFormBuilder.group({
      password: ['right']
    }));

    MockRestService.init(MockRestService.ADMIN);
    loginComp.onSubmit();
    expect(loginComp.getIsAdmin()).toEqual(true);
    expect(loginComp.getNameNotValid()).toEqual(false);
  });

  // valid user
  it('should login User if correct name entered', () => {
    loginComp.setNameForm(loginComp.nameFormBuilder.group({
      loginName: ['user1']
    }));

    MockRestService.init(MockRestService.USER);
    loginComp.onSubmit();
    expect(loginComp.getNameNotValid()).toEqual(false);
  });
});
