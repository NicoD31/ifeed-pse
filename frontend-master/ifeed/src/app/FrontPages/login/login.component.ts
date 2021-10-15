import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PersonService } from '../../Services/person.service';
import { RESTService, List, Path } from '../../Services/rest.service';
import { EnumService } from '../../Services/enum.service';
import { BaseComponent } from '../../base.component';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

/**
 * This component serves the purpose of modeling the Login-Site, which is being shown to every Person who is accessing the iFeeD website.
 * If the Person is a User, the login process is finished after the name has been entered and the website is showing the User overview.
 * Otherwise, if the Person is an Admin, a password field is being shown in addition and the Admin has to successfully enter his password
 * to get to his overview page.
 */
export class LoginComponent extends BaseComponent implements OnInit {

  /* User input */
  private nameForm: FormGroup;
  private passwordForm: FormGroup;

  /* Check attributes for convenient html implementation */
  private errorMessage: string;
  private nameNotValid: boolean;
  private passwordNotValid: boolean;
  private isAdmin: boolean;
  private dataLoaded: boolean;

  /* Reduces the amount of REST requests at login */
  private admin: JSON;

  /**
   * This method is executed if a new input has been made and is making the name and password validation.
   */
  public onSubmit() {
    const name = this.getNameForm().controls.loginName.value;
    this.checkName(name);

    if (this.getIsAdmin()) {
      const password = this.personService.hash(this.getPasswordForm().controls.password.value);
      this.checkNamePasswordCombination(name, password);
    }
  }

  /* constructor and ngOnInit ------------------------------------------------------------- */

  /**
   * Constructor for the LoginComponent.
   *
   * @param nameFormBuilder form for the login name imput field.
   * @param passwordFormBuilder form for the password input field.
   * @param router router used for routing to User and Admin Overview pages.
   * @param personService used to log in the respective User and Admin after successful validation.
   * @param restService used for REST requests needed at login.
   */
  public constructor(public nameFormBuilder: FormBuilder, private passwordFormBuilder: FormBuilder, private router: Router,
    private personService: PersonService, private enumService: EnumService, public restService: RESTService,
    public cd: ChangeDetectorRef, public spinner: NgxSpinnerService) {

    super(restService, spinner, cd, ['history', 'labels', 'feedbackmode', 'datasetTypes']);
  }

  /**
   * Used to initialize the forms at page initialization.
   */
  ngOnInit() {
    this.setNameForm(this.nameFormBuilder.group({
      loginName: ['']
    }));

    this.setPasswordForm(this.passwordFormBuilder.group({
      password: ['']
    }));

    let historymodes: JSON[] = [];
    let labels: JSON[] = [];
    let feedbackmodes: JSON[] = [];
    let datasetTypes: JSON[] = [];

    this.loadServerData(List.HISTORY, [Path.WITHOUT_BIG_DATA], [], history => {
      historymodes = [...historymodes, ...history];
    }, a => {
      this.enumService.setHistoryModes(historymodes);
      this.setDataValueIsReady('history');

      this.loadServerData(List.LABELS, [Path.WITHOUT_BIG_DATA], [], label => {
        labels = [...labels, ...label];
      }, b => {
        this.enumService.setLabels(labels);
        this.setDataValueIsReady('labels');

        this.loadServerData(List.FEEDBACKMODE, [Path.WITHOUT_BIG_DATA], [], feedback => {
          feedbackmodes = [...feedbackmodes, ...feedback];
        }, c => {
          this.enumService.setFeedbackModes(feedbackmodes);
          this.setDataValueIsReady('feedbackmode');
          this.loadServerData(List.DATASETTYPE, [Path.WITHOUT_BIG_DATA], [], datasettype => {
            datasetTypes = [...datasetTypes, ...datasettype];
          }, c => {
            this.enumService.setDatasetTypes(datasetTypes);
            this.setDataValueIsReady('datasetTypes');
          }, this.restService);
        }, this.restService);
      }, this.restService);
    }, this.restService);
  }

  /* private methods ------------------------------------------------------------- */

  /**
   * Checks if the entered name is part of the system. If the name belongs to a User, he is being logged in and routed to
   * the UserMainOverview.
   * If the name belongs to an Admin the password input is being prepared and the isAdmin attribute is being set to true.
   * If the input is not valid a message is being displayed via errorMessage and nameNotValid.
   *
   * @param name the entered login name.
   * @returns true if the name is belonging to a respective Person in the system, false if not or the Person has been deactivated.
   */
  private checkName(name: string): boolean {
    // checks for leading and trailing white space
    const nameNoWhiteSpace: string = name.trim();
    if (nameNoWhiteSpace !== name) {
      this.setNameNotValid(true);
      this.setErrorMessage('Unknown login name');
      return false;
    }

    this.restService.getServerData(List.PERSON, [Path.WITHOUT_BIG_DATA], [{ id: 'name', val: [name] }], personData => {
      if (personData['count'] === 0 || personData['count'] > 1) {
        // if there is no such name
        this.setNameNotValid(true);
        this.setErrorMessage('Unknown login name');
        return false;
      } else {
        if (personData['results'][0]['isDeactivated']) {
          // person is existing, but deactivated
          this.setNameNotValid(true);
          this.setErrorMessage('This Person has been deactivated');
          return false;
        }
      }

      this.restService.getServerData(List.ADMIN, [Path.WITHOUT_BIG_DATA], [{ id: 'name', val: [name] }], adminData => {
        if (adminData['count'] === 1) {
          const tempAdmin = adminData['results'][0];
          if (tempAdmin.name === name) {
            // person is Admin
            this.setIsAdmin(true);
            this.setNameNotValid(false);
            this.admin = adminData['results'][0];
            return true;
          }
        }
      });

      this.restService.getServerData(List.USER, [Path.WITHOUT_BIG_DATA], [{ id: 'name', val: [name] }], userData => {
        if (userData['count'] === 1) {
          const tempUser = userData['results'][0];
          if (tempUser['name'] === name) {
            // person is User
            this.setNameNotValid(false);
            this.personService.logIn(name, tempUser['id'], PersonService.USER);
            this.router.navigate(['/usermain']);
            return true;
          }
        }
      });
    });
    return false;
  }

  /**
   * Cross checks the entered password to the entered Admin. If the password is valid the Admin is being logged in and
   * routed to the AdminMainOverview.
   * If the input is not valid a message is being shown via errorMessage.
   *
   * @param password the entered password.
   * @returns true if the name and password combination is valid, false if not.
   */
  private checkNamePasswordCombination(name: string, password: string): boolean {
    if (name !== this.admin['name']) {
      this.setPasswordNotValid(true);
      this.setErrorMessage('Unknown login name');
      return false;
    }

    if (password === this.admin['password']) {
      this.personService.logIn(name, this.admin['id'], PersonService.ADMIN);
      this.router.navigate(['/adminmain']);
      return true;
    } else {
      if (!this.getNameNotValid()) {
        this.setPasswordNotValid(true);
        this.setErrorMessage('Invalid name and password combination');
      }
      return false;
    }
  }

  /* get and set methods ------------------------------------------------------------- */

  /**
   * Getter for the name form.
   * @returns the name form.
   */
  public getNameForm(): FormGroup {
    return this.nameForm;
  }

  /**
   * Setter for the name form.
   * @param nameForm the name form which is setted.
   */
  public setNameForm(nameForm: FormGroup) {
    this.nameForm = nameForm;
  }

  /**
   * Getter for the password form.
   * @returns the password form.
   */
  public getPasswordForm(): FormGroup {
    return this.passwordForm;
  }

  /**
   * Setter for the password form.
   * @param passwordForm the password form which is setted.
   */
  public setPasswordForm(passwordForm: FormGroup) {
    this.passwordForm = passwordForm;
  }

  /**
   * Getter for the error message.
   * @returns the error message.
   */
  public getErrorMessage(): string {
    return this.errorMessage;
  }

  /**
   * Setter for the error message.
   * @param errorMessage the error message which is setted.
   */
  public setErrorMessage(errorMessage: string) {
    this.errorMessage = errorMessage;
  }

  /**
   * Getter for the name not valid attribute.
   * @returns true if the name is not valid, false otherwise.
   */
  public getNameNotValid(): boolean {
    return this.nameNotValid;
  }

  /**
   * Setter for the name not valid attribute.
   * @param nameNotValid true if the name is not valid false otherwise.
   */
  public setNameNotValid(nameNotValid: boolean) {
    this.nameNotValid = nameNotValid;
  }

  /**
   * Getter for the password not valid attribute.
   * @returns true if the password is not valid, false otherwise.
   */
  public getPasswordNotValid(): boolean {
    return this.passwordNotValid;
  }

  /**
   * Setter for the password not valid attribute.
   * @param passwordNotValid true if the password is not valid false otherwise.
   */
  public setPasswordNotValid(passwordNotValid: boolean) {
    this.passwordNotValid = passwordNotValid;
  }

  /**
   * Getter for the is admin attribute.
   * @returns true if the person is an Admin, false if not.
   */
  public getIsAdmin(): boolean {
    return this.isAdmin;
  }

  /**
   * Setter for the is admin attribute
   * @param isAdmin true if the person is an Admin, false if not.
   */
  public setIsAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin;
  }

  /**
   * Getter for the data loaded attribute.
   * @returns true if the data has been loaded, false if not.
   */
  public getDataLoaded(): boolean {
    return this.dataLoaded;
  }

  /**
   * Setter for the data loaded attribute.
   * @param dataLoaded true if the data has been loaded, false if not.
   */
  public setDataLoaded(dataLoaded: boolean) {
    this.dataLoaded = dataLoaded;
  }
}
