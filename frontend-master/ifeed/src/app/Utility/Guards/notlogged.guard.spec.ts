import { TestBed, async, inject } from '@angular/core/testing';

import { NotloggedGuard } from './notlogged.guard';
import { PersonService } from '../../Services/person.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

class MockPersonServiceTrue {
  getLoggedIn() { return true; }
  getRank(): number { return 7; }
}

class MockPersonServiceFalse {
  getLoggedIn() { return false; }
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
class MockRouter {
  navigate(routes: string[]) { }
}

describe('NotloggedGuard: canActivate', () => {
  let guard: NotloggedGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotloggedGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceFalse }
      ]
    });
    guard = TestBed.get(NotloggedGuard);
  });

  it('should create', inject([NotloggedGuard], (loggedguard: NotloggedGuard) => {
    expect(loggedguard).toBeTruthy();
  }));

  it('returns true when not logged in', () => {
    expect(guard.canActivate(next, state)).toBeTruthy();
  });
});

describe('NotloggedGuard: canActivate', () => {
  let guard: NotloggedGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotloggedGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceTrue }
      ]
    });
    guard = TestBed.get(NotloggedGuard);
  });
  it('returns false when logged in and rank is not valid', () => {
    expect(guard.canActivate(next, state)).toBeFalsy();
  });
});

describe('NotloggedGuard: canActivate', () => {
  let guard: NotloggedGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotloggedGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceAdmin }
      ]
    });
    guard = TestBed.get(NotloggedGuard);
  });
  it('returns false when logged in and rank is Admin', () => {
    expect(guard.canActivate(next, state)).toBeFalsy();
  });
});

describe('NotloggedGuard: canActivate', () => {
  let guard: NotloggedGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotloggedGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceUser }
      ]
    });
    guard = TestBed.get(NotloggedGuard);
  });
  it('returns false when logged in and rank is User', () => {
    expect(guard.canActivate(next, state)).toBeFalsy();
  });
});
