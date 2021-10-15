import { Component, OnInit } from '@angular/core';
import { Router, Route } from '@angular/router';
import { RESTService, List, IdFuncPair } from '../../Services/rest.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { PersonService } from '../../Services/person.service';

@Component({
  selector: 'app-admin-person-create',
  templateUrl: './admin-person-create.component.html',
  styleUrls: ['./admin-person-create.component.css']
})

/**
 * Component for the User creation page. Opens up when an Admin wants to create an new User/Admin.
 * Contains all information currently given during the creation process. Also checks all input on validation.
 */
export class AdminPersonCreateComponent implements OnInit {

// ===============================================Attributes===============================================

  /** Contains the currently entered information about the User. Is updated every time an information is changed.
   * Will be send via RESTSerivce to the server when creation is finished. */
  private person: JSON;

  /** Whether the current person is an Admin. */
  private isAdmin: boolean;

  /** the currently entered password */
  private password: string;

  /** the error which will be displayed in case of error */
  private message: string;

  /** the currently entered name */
  private name: string;

  /** the input for confirming the entered password */
  private passwordConfirm: string;

// ===============================================Public Methods===============================================

  /**
   * Creates an new User with the information provided within the User JSON. If the JSON is not filled with sufficient
   * information an error will be displayed.
   * @return boolean: true: User creation was successful. Closes the page for User creation.
   *                  false: error occurred during User creation. Page will not be closed.
   */
  public finishCreation(): boolean {
    if (this.name === '') {
      this.message = 'Name field may not be left blank';
      return false;
    }
    if (!/\S/.test(this.name)) {
      this.message = 'Name must contain at least one non whitespace character';
      return false;
    }
    const errorHandler: IdFuncPair[] = [
      {
      id: [400], func: err => {
        if (err['error']['name']) {
          this.message = err['error']['name'][0];
        }
        this.message = 'The server has rejected your request due to a bad request.';
        this.spinner.hide();
        return false;
      }
    }];
    this.person['isDeactivated'] = false;
    if (this.name.length > 40) {
      this.message = 'Name is to long (max 40 symbols)';
      return false;
    }
    if (this.isAdmin) {
      if (this.checkPassword(this.password)) {
        if (!(this.password === this.passwordConfirm)) {
          this.message = 'Entered wrong password for confirmation';
          return false;
        }
        this.person['password'] = this.personService.hash(this.password);
        this.spinner.show();
        // add the new admin to the adminlist
        this.rest.addDataToServer(List.ADMIN, this.person, errorHandler).then(data => {
          this.message = 'Admin creation successful';
          this.router.navigate(['/user']);
          this.spinner.hide();
          return true;
        });
      } else {
        // invalid password entered
        return false;
      }
    } else {
      this.spinner.show();
      // add the new user to the userlist
      this.rest.addDataToServer(List.USER, this.person, errorHandler).then(data => {
        this.message = 'User creation successful';
        this.router.navigate(['/user']);
        this.spinner.hide();
        return true;
      });
    }
    // default return true, because of asynch functions
    return true;
  }

  /**
   * Checks whether or not a valid password has been entered. A password must contain at least 8 characters.
   * @param password The string which contains the password to be checked
   * @return boolean: true if password is valid, false if not.
   */
  public checkPassword(password: string): boolean {
    if (password == null || password === undefined) {
      this.message = 'Password field may not be empty';
      return false;
    }
    if (!this.isAdmin) {
      if (password.length > 0) {
        this.message = 'Password-field must be empty for users';
        return false;
      } else {
        this.message = '';
        return true;
      }
    }
    if (password.length > 7) {
      const pw = password.replace(' ', '');
      if (pw.length < 8) {
        this.message = 'Password must containt at least 8 non whitespace characters';
        return false;
      }
      if (password.length > 128) {
        this.message = 'Password is to long (max 128 symbols)';
        return false;
      }
      this.password = password;
      this.message = '';
      return true;
    } else {
      this.message = 'Password is to short. Must be at least 8 symbols';
      return false;
    }
  }

// ===============================================Private Methods===============================================



// ===============================================Getter & Setter===============================================

  /**
  * Getter for the attribute isAdmin
  * @returns boolean: attribute isAdmin
  */
  public getIsAdmin(): boolean {
    return this.isAdmin;
  }

  /**
   * Getter for the attribute message
   * @returns string: attribute message
   */
  public getMessage(): string {
    return this.message;
  }

  /**
   * Changes the value of isAdmin to the opposite of what the current value is
   * @param value The event which triggered the method. Is not used in the code
   */
  public setIsAdmin(value: any) {
    this.message = '';
    this.password = '';
    this.isAdmin = !this.isAdmin;
  }

  /**
   * Sets the username in the person-JSON to a certain value
   * @param name: the string which contains the username which should be stored
   */
  public setUsername(name: string) {
    this.person['name'] = name;
    this.name = name;
  }

  /**
   * Getter for the attribute name
   * @returns string: the attribute name
   */
  public getUsername(): string {
    return this.name;
  }

  /**
   * Getter for the attribute password
   * @returns string: the attribute password
   */
  public getPassword(): string {
    return this.password;
  }

  /**
   * Sets the attribute password
   * @param pw string: the value which should be stored in the attribute password
   */
  public setPassword(pw: string) {
    this.password = pw;
  }

  /**
   * Sets the attribute passwordConfirm
   * @param pw  string: the value which should be stored in the attribute passwordConfirm
   */
  public setPasswordConfirm(pw: string) {
    this.passwordConfirm = pw;
  }

  /**
   * Getter for the attribute passwordConfirm
   * @returns string: the attribute passwordConfirm
   */
  public getPasswordConfirm(): string {
    return this.passwordConfirm;
  }

// ===============================================Constructor & ngOnInit===============================================

  constructor(private router: Router, private rest: RESTService, private spinner: NgxSpinnerService
    , private personService: PersonService) {

  }

  ngOnInit() {
    // initialise the attriubutes, so they can be used
    this.message = '';
    // checkbox is by default not selected
    this.isAdmin = false;
    this.person = JSON;
    this.password = '';
    this.passwordConfirm = '';
    this.name = '';
  }

}
