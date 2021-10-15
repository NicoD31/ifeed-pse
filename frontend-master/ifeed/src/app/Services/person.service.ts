import { Injectable } from '@angular/core';
import sha256 from 'fast-sha256';

@Injectable({
  // necessary, so that a person stays loggedin during navigation through the system
  providedIn: 'root'
})

/**
 * Manages the Person which is currently logged into the system. Both Users and Admins are being held in here but can be distinguished.
 */
export class PersonService {

  public static readonly ADMIN = 0;
  public static readonly USER = 10;


  private static readonly ID = 'ID';
  private static readonly NAME = 'NAME';
  private static readonly RANK = 'RANK';
  private static readonly LOGGED = 'LOGGED';

  /**
   * Getter for the Person’s unique id.
   * @return the id as an integer.
   */
  getId(): number {
    return Number.parseInt(sessionStorage.getItem(PersonService.ID));
  }

  /**
   * Setter for the Person’s unique id.
   * @param number the unique id.
   * @return boolean: true: setting attribute was successful
   *                  false: else
   */
  private setId(id: number): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    sessionStorage.setItem(PersonService.ID, id + '');
    return true;
  }

  /**
   * Getter for the Person’s name.
   * @return the name represented as a string.
   */
  getName(): string {
    return sessionStorage.getItem(PersonService.NAME);
  }

  /**
   * Setter for the Person’s name.
   * @param name the name as a string.
   * @return boolean: true: setting attribute was successful
   *                  false: else
   */
  private setName(name: string): boolean {
    if (!name) {
      return false;
    }
    sessionStorage.setItem(PersonService.NAME, name);
    return true;
  }

  /**
   * Getter for the Person’s rank. The rank 0 implicates an Admin, and rank 10 implicates a User. Several more ranks can be added
   * for sophisticated permission modes (e.g. if there should be a new Person which has some rights of the Admin and some of the User).
   * @return the rank of the Person.
   */
  getRank(): number {
    if (sessionStorage.getItem(PersonService.RANK) === null) {
      return -1;
    }
    return Number.parseInt(sessionStorage.getItem(PersonService.RANK));
  }

  /**
   * Setter for the Person’s rank. The rank 0 implicates an Admin, and rank 10 implicates a User. Several more ranks can be added
   * for sophisticated permission modes (e.g. if there should be a new Person which has some rights of the Admin and some of the User).
   * @param rank the new rank of the Person.
   * @return boolean: true: setting attribute was successful
   *                  false: else
   */
  private setRank(rank: number): boolean {
    // null-check
    if (rank === null || rank === undefined) {
      return false;
    }
    // check rank on validity
    let validRank = false;
    validRank = PersonService.ADMIN === rank || PersonService.USER === rank;
    if (!validRank) {
      return false;
    }
    sessionStorage.setItem(PersonService.RANK, rank + '');
    return true;
  }

  /**
   * Getter for attribute loggedIn
   * @return boolean: true: there is someone currently logged in
   *                  false: else
   */
  getLoggedIn(): boolean {
    return sessionStorage.getItem(PersonService.LOGGED) === PersonService.LOGGED;
  }

  /**
   * Setter for attribute loggedIn
   * @param val boolean, which contains the new value for the attribute
   * @return boolean: true: setting attribute was successful
   *                  false: else
   */
  private setLog(val: boolean): boolean {
    if (!val) {
      return false;
    }
    sessionStorage.setItem(PersonService.LOGGED, val ? PersonService.LOGGED : '');
    return true;
  }

  /**
   * Method for logging in an user/admin
   * @param name string, which contains the name of the person which should be logged in
   * @param id number, which represents the id of the person which should be logged in
   * @param rank number, the rank of the person which should be logged in. Use constant ADMIN or USER
   * @return boolean: true: login was successful
   *                  false: else
   */
  logIn(name: string, id: number, rank: number): boolean {
    // null-check
    if (!name || id == null || rank == null) {
      return false;
    }
    // check if there is already a person logged in
    if (this.getLoggedIn()) {
      return false;
    }
    // "login" person
    const check = [];
    check.push(this.setName(name));
    check.push(this.setRank(rank));
    check.push(this.setId(id));
    check.push(this.setLog(true));
    if (check.includes(false)) {
      return false;
    }
    return true;
  }

  /**
   * Method for logging out the currently logged in user/admin
   * @return boolean: true: logout was successful
   *                  false: else
   */
  logOut(): boolean {
    sessionStorage.removeItem(PersonService.ID);
    sessionStorage.removeItem(PersonService.LOGGED);
    sessionStorage.removeItem(PersonService.NAME);
    sessionStorage.removeItem(PersonService.RANK);
    return true;
  }

  /**
   * Checks, whether the currently logged in person is an admin
   * @return boolean: true: currently logged in person is an admin
   *                  false: else
   */
  isAdmin(): boolean {
    return this.getRank() === PersonService.ADMIN;
  }

  /**
   * Checks, whether the currently logged in person is an user
   * @return boolean: true: currently logged in person is an user
   *                  false: else
   */
  isUser(): boolean {
    return this.getRank() === PersonService.USER;
  }

  /**
   * Method for hashing an string
   * @param input string, which should be hashed
   * @return string, which contains the hash of input
   */
  hash(input: string): string {
    const enc = new TextEncoder();
    const arr = enc.encode(input);
    const hashArr = sha256(arr);
    return hashArr.toString();
  }

  constructor() {
    // no one is logged in by default
    this.setLog(false);
  }
}
