import { TestBed, async, inject } from '@angular/core/testing';

import { MixedGuard } from './mixed.guard';
import { PersonService } from '../../Services/person.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

class MockPersonServiceTrue {
  getLoggedIn() { return true; }
}

class MockPersonServiceFalse {
  getLoggedIn() { return false; }
}

class MockRouter {
  navigate(routes: string[]) { }
}

describe('MixedGuard: canActivate', () => {
  let mixedGuard: MixedGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MixedGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceTrue }
      ]
    });
    mixedGuard = TestBed.get(MixedGuard);
  });

  it('should create', inject([MixedGuard], (guard: MixedGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('returns true when logged in', () => {
    expect(mixedGuard.canActivate(next, state)).toBeTruthy();
  });
});


describe('MixedGuard: canActivate', () => {
  let mixedGuard: MixedGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MixedGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceFalse }
      ]
    });
    mixedGuard = TestBed.get(MixedGuard);
  });

  it('returns false when not logged in', () => {
    expect(mixedGuard.canActivate(next, state)).toBeFalsy();
  });
});
