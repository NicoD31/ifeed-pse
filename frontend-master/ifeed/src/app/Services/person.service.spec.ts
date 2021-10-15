import { TestBed } from '@angular/core/testing';

import { PersonService } from './person.service';

describe('PersonService', () => {
  let service: PersonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    });
    service = TestBed.get(PersonService);
    service.logOut();
  });

  it('should return true for valid login', () => {
    const user = 'admin';
    const id = 1;
    expect(service.logIn(user, id, PersonService.ADMIN)).toEqual(true);
  });

  it('should return true for valid logout', () => {
    const user = 'admin';
    const id = 1;
    service.logIn(user, id, PersonService.ADMIN);
    expect(service.logOut()).toEqual(true);
  });

  it('should return true for logged in admin', () => {
    const user = 'admin';
    const id = 1;
    service.logIn(user, id, PersonService.ADMIN);
    expect(service.isAdmin()).toEqual(true);
  });

  it('should return false for logged in user', () => {
    const user = 'admin';
    const id = 1;
    service.logIn(user, id, PersonService.ADMIN);
    expect(service.isUser()).toEqual(false);
  });

  it('should return true for logged in user', () => {
    const user = 'user';
    const id = 1;
    service.logIn(user, id, PersonService.USER);
    expect(service.isUser()).toEqual(true);
  });

  it('should return false for logged in user', () => {
    const user = 'user';
    const id = 1;
    service.logIn(user, id, PersonService.USER);
    expect(service.isAdmin()).toEqual(false);
  });

  it('should return false for no logged in person', () => {
    expect(service.isAdmin()).toEqual(false);
  });

  it('should return false for no logged in person', () => {
    expect(service.isUser()).toEqual(false);
  });

  it('should return false for unsufficient information', () => {
    expect(service.logIn(null, null, null)).toEqual(false);
  });

  it('should return false for partially unsufficient information', () => {
    const user = 'admin';
    expect(service.logIn(user, null, null)).toEqual(false);
  });

  it('should return false for partially unsufficient information', () => {
    const id = 1;
    expect(service.logIn(null, id, null)).toEqual(false);
  });

  it('should return false for partially unsufficient information', () => {
    const rank = 0;
    expect(service.logIn(null, null, rank)).toEqual(false);
  });

  it('should return false for partially unsufficient information', () => {
    const user = 'admin';
    const id = 1;
    expect(service.logIn(user, id, null)).toEqual(false);
  });

  it('should return false for partially unsufficient information', () => {
    const user = 'admin';
    const rank = 0;
    expect(service.logIn(user, null, rank)).toEqual(false);
  });

  it('should return false for partially unsufficient information', () => {
    const id = 1;
    const rank = 10;
    expect(service.logIn(null, id, rank)).toEqual(false);
  });

  it('should return false by default', () => {
    expect(service.getLoggedIn()).toEqual(false);
  });

  it('should return false for double login', () => {
    const user1 = 'admin';
    const user2 = 'user';
    const id1 = 1;
    const id2 = 2;
    const rank1 = 0;
    const rank2 = 10;
    service.logIn(user1, id1, rank1);
    expect(service.logIn(user2, id2, rank2)).toEqual(false);
  });
});
