import { TestBed, async, inject } from '@angular/core/testing';

import { UserGuard } from './user.guard';
import { PersonService } from '../../Services/person.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

class MockRouter {
  navigate(routes: string[]) { }
}

class MockPersonServiceFalse {
  getLoggedIn(): boolean { return false; }
}
class MockPersonServiceTrue {
  getLoggedIn() { return true; }
  getRank(): number { return 7; }
}

class MockPersonServiceAdmin {
  getLoggedIn(): boolean { return true; }
  getRank(): number { return PersonService.ADMIN; }
}

class MockPersonServiceUser {
  getLoggedIn(): boolean { return true; }
  getRank(): number { return PersonService.USER; }
}

describe('UserGuard: not logged in', () => {
  let userGuard: UserGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceFalse }
      ]
    });
    userGuard = TestBed.get(UserGuard);
  });

  it('should create', inject([UserGuard], (guard: UserGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return false', () => {
    expect(userGuard.canActivate(next, state)).toBeFalsy();
  });
});

describe('UserGuard: logged in as Admin', () => {
  let userGuard: UserGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceAdmin }
      ]
    });
    userGuard = TestBed.get(UserGuard);
  });

  it('should create', inject([UserGuard], (guard: UserGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return false', () => {
    expect(userGuard.canActivate(next, state)).toBeFalsy();
  });
});

describe('UserGuard: logged in as User', () => {
  let userGuard: UserGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceUser }
      ]
    });
    userGuard = TestBed.get(UserGuard);
  });

  it('should create', inject([UserGuard], (guard: UserGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return true', () => {
    expect(userGuard.canActivate(next, state)).toBeTruthy();
  });
});

describe('UserGuard: logged in with invalid rank', () => {
  let userGuard: UserGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceTrue }
      ]
    });
    userGuard = TestBed.get(UserGuard);
  });
  it('should return true', () => {
    expect(userGuard.canActivate(next, state)).toBeFalsy();
  });
});
