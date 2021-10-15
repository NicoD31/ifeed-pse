import { TestBed, async, inject } from '@angular/core/testing';

import { AdminGuard } from './admin.guard';
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

describe('AdminGuard: not logged in', () => {
  let adminGuard: AdminGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceFalse }
      ]
    });
    adminGuard = TestBed.get(AdminGuard);
  });

  it('should create', inject([AdminGuard], (guard: AdminGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return false', () => {
    expect(adminGuard.canActivate(next, state)).toBeFalsy();
  });
});

describe('AdminGuard: logged in as Admin', () => {
  let adminGuard: AdminGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceAdmin }
      ]
    });
    adminGuard = TestBed.get(AdminGuard);
  });

  it('should create', inject([AdminGuard], (guard: AdminGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return true', () => {
    expect(adminGuard.canActivate(next, state)).toBeTruthy();
  });
});

describe('AdminGuard: logged in as User', () => {
  let adminGuard: AdminGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceUser }
      ]
    });
    adminGuard = TestBed.get(AdminGuard);
  });

  it('should create', inject([AdminGuard], (guard: AdminGuard) => {
    expect(guard).toBeTruthy();
  }));
  it('should return false', () => {
    expect(adminGuard.canActivate(next, state)).toBeFalsy();
  });
});

describe('AdminGuard: logged in with invalid rank', () => {
  let adminGuard: AdminGuard;
  const next: ActivatedRouteSnapshot = null;
  const state: RouterStateSnapshot = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: Router, useClass: MockRouter },
        { provide: PersonService, useClass: MockPersonServiceTrue }
      ]
    });
    adminGuard = TestBed.get(AdminGuard);
  });
  it('should return false', () => {
    expect(adminGuard.canActivate(next, state)).toBeFalsy();
  });
});
