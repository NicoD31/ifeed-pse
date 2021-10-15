import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CalcService } from '../../Services/calc.service';
import { RESTService, List, Path } from '../../Services/rest.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { PersonService } from '../../Services/person.service';
import { MatDialog } from '@angular/material';
import { DeletionDialogComponent } from '../../Utility/deletion-dialog/deletion-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css']
})

/**
 * Component for the User management page. This page gives an logged in Admin the possibility
 * to manage (create/delete/view) the registered Users.
 */
export class AdminUserManagementComponent extends BaseComponent implements OnInit {

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

// ===============================================Attributes===============================================

  public readonly USERLIST = 'listuser';

  public readonly ADMINLIST = 'listadmins';

  /** List containing all registered Users. */
  private userList: JSON[];

  /** the list which is used to display the users (used for fitering) */
  private displayUserList: JSON[];

  /** List containg all registered admins */
  private adminList: JSON[];

  /** The list which is used to display the admins (used for filtering) */
  private displayAdminList: JSON[];

  /** The message which may be displayed */
  private message: string;

  /** The message which may be displayed after a successful action */
  private successMessage: string;

// ===============================================Public Methods===============================================

  /**
   * Browses a list for any person which correlates with the given filter String (the name contains/matches the filter).
   * @param lists string which list should be filter. Use constants USERLIST and ADMINLIST
   * @param filter: the String for which the list should be searched.
   * @return JSON[]: Contains all persons with the filter String in their name, as JSONs.
   */
  public filterList(lists: string, filter: string) {
    switch (lists) {
      case this.USERLIST:
        // filter users
        this.displayUserList = this.calc.filterListName(this.userList, filter);
        break;
      case this.ADMINLIST:
        // filter admins
        this.displayAdminList = this.calc.filterListName(this.adminList, filter);
        break;
      default:
        return;
    }
    this.cd.markForCheck();
  }

  /**
   * Activates the routing to the PersonCreateComponent, so that the admin can create a new Person
   */
  public createUser() {
    this.router.navigate(['/user/create']);
  }

  /**
   * Deletes a Person by removing them from the list. Also sends the information about the deletion via
   * the RESTService to the server.
   * @param lists the list from which the person should be remove. Use constants USERLIST and ADMINLIST
   * @param id: id which clearly identifies the Person who should be deleted.
   * @return true: if deletion was successful. false: if an error occurd during deletion.
   */
  public deleteUser(lists: string, id: number): boolean {
    let list;
    let displayList;
    let url;
    let prefix;
    switch (lists) {
      case this.USERLIST:
        // delete an user
        list = this.userList;
        displayList = this.displayUserList;
        url = List.USER;
        prefix = 'User';
        break;
      case this.ADMINLIST:
        // delete an admin
        list = this.adminList;
        displayList = this.displayAdminList;
        url = List.ADMIN;
        prefix = 'Admin';
        break;
      default:
        return;
    }
    if (id === this.personService.getId()) {
      // prevent an admin from deleting himself
      this.message = 'You are not allowed to delete your own account.';
      this.successMessage = '';
      return false;
    }
    const user = this.getUser(lists, id);
    if (user == null) {
      // invalid id
      this.message = 'Unknown person';
      this.successMessage = '';
      return false;
    }
    // ask the admin, whether he really wants to delete the person
    this.deletionDialog(url, user, list, displayList, lists, prefix);
    return true;
  }

  /**
   * Checks the list for a Person with the id given as parameter.
   * @param lists: the list which should be looked through. Use constants USERLIST and ADMINLIST
   * @param id: id which should be checked.
   * @return true: if Person with id exists. false: if Person with id does not exist.
   */
  public exists(lists: string, id: number): boolean {
    let list;
    switch (lists) {
      case this.USERLIST:
        list = this.userList;
        break;
      case this.ADMINLIST:
        list = this.adminList;
        break;
      default:
        return;
    }
    for (let user of list) {
      if (user['id'] === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Deactivates the Person with the given id.
   * @param lists the list from which the person should be deactivated. Use constants USERLIST and ADMINLIST
   * @param id The unique id of an Person which should be deactivated.
   * @return true, if the Person was successfully deactivated, else false.
   */
  public deactivateUser(lists: string, id: number): boolean {
    let list;
    let displayList;
    let url;
    let prefix;
    switch (lists) {
      case this.USERLIST:
        list = this.userList;
        displayList = this.displayUserList;
        url = List.USER;
        prefix = 'User';
        break;
      case this.ADMINLIST:
        list = this.adminList;
        displayList = this.displayAdminList;
        url = List.ADMIN;
        prefix = 'Admin';
        break;
      default:
        return;
    }
    if (id === this.personService.getId()) {
      this.message = 'You are not allowed to deactivate your own account.';
      this.successMessage = '';
      return false;
    }
    let user = this.getUser(lists, id);
    if (user == null) {
      this.message = 'Unknown person';
      this.successMessage = '';
      return false;
    }
    if (user['isDeactivated']) {
      this.message = prefix + ' ' + user['name'] + ' already deactivated.';
      this.successMessage = '';
    }
    const index = list.indexOf(user);
    this.spinner.show();
    this.rest.getServerData(url, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [id] }], data => {
      user = <JSON>data;
      user['isDeactivated'] = true;
      this.rest.alterDataFromServer(url, [Path.ITEM, Path.WITHOUT_BIG_DATA], user, [{ id: 'id', val: [id] }]).then(datum => {
        list[index] = user;
        displayList = list;
        this.successMessage = prefix + ' ' + user['name'] + ' deactivated succesfully';
        this.message = '';
        this.cd.markForCheck();
        this.spinner.hide();
        return true;
      });
    });
    return true;
  }

  /**
   * Activates the Person with the given id.
   * @param lists the list from which the person should be activated. Use constants USERLIST and ADMINLIST
   * @param id The unique id of an Person which should be activated.
   * @return true, if the Person was successfully activated, else false.
   */
  public activateUser(lists: string, id: number): boolean {
    let list;
    let displayList;
    let url;
    let prefix;
    switch (lists) {
      case this.USERLIST:
        list = this.userList;
        displayList = this.displayUserList;
        url = List.USER;
        prefix = 'User';
        break;
      case this.ADMINLIST:
        list = this.adminList;
        displayList = this.displayAdminList;
        url = List.ADMIN;
        prefix = 'Admin';
        break;
      default:
        return;
    }
    let user = this.getUser(lists, id);
    if (user == null) {
      this.message = 'Unknown person';
      this.successMessage = '';
      return false;
    }
    if (!user['isDeactivated']) {
      this.message = prefix + ' ' + user['name'] + ' already activated.';
      this.successMessage = '';
      return false;
    }
    const index = list.indexOf(user);
    this.spinner.show();
    this.rest.getServerData(url, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [id] }], data => {
      user = <JSON>data;
      user['isDeactivated'] = false;
      this.rest.alterDataFromServer(url, [Path.ITEM, Path.WITHOUT_BIG_DATA], user, [{ id: 'id', val: [id] }]).then(datum => {
        list[index] = user;
        displayList = list;
        this.successMessage = prefix + ' ' + user['name'] + ' activated succesfully';
        this.message = '';
        this.cd.markForCheck();
        this.spinner.hide();
        return true;
      });
    });
    return true;
  }

// ===============================================Private Methods===============================================

  /**
   * Method for opening a dialog, whether the person really should be deleted.
   * Also executes the deletion, after admin confirms deletrequest.
   * @param url List, which contains the url, via which the list in the backend can be accessed. (Use constants from RESTService)
   * @param user json, which represents the person, which should be deleted.
   * @param list json[], the local list, from which the person should be deleted.
   * @param displayList json[], the local list, which contains all persons, which are currently displayed.
   * @param lists string, contains information, whether the person is an user or an admin.
   * @param prefix string: which should be used for writing messages to the user
   */
  private deletionDialog(url: List, user: JSON, list: JSON[], displayList: JSON[], lists: string, prefix: string): boolean {
    // create the dialog
    const dialogRef = this.dialog.open(DeletionDialogComponent, {
      data: {
        person: user,
        isSetup: false,
        isSession: false,
        isPerson: true,
        isDataset: false
      }
    });
    // when admin confirms deletion, execute the deletion
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // display spinner
        this.spinner.show();
        // rest-request for deletion
        this.rest.deleteDataFromServer(url, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [user['id']] }]).then(data => {
          const index = list.indexOf(user);
          if (index === -1) {
            // user is not in list
            this.spinner.hide();
            this.message = 'Unknown error occurd during deletion.';
            this.successMessage = '';
            return false;
          }
          // remove person from list
          list.splice(index, 1);
          // update displayed List and message
          displayList = list;
          this.successMessage = prefix + ' ' + user['name'] + ' deleted succesfully';
          this.message = '';
          // hide spinner
          this.spinner.hide();
          this.cd.markForCheck();
          return true;
        });
      } else {
        // admin aborted the deletion
        this.message = 'Deletion aborted.';
        this.successMessage = '';
        return false;
      }
    });
    return true;
  }

  /**
   * Searches through the list for the name of Person with the id.
   * @param lists the list which should be looked through. Use constants USERLIST and ADMINLIST
   * @param id: id to which the Person name should be searched.
   * @return the name of the Person with the id. Returns a empty String, if there is no such Person in the list.
   */
  private getUserName(lists: string, id: number): string {
    let list;
    switch (lists) {
      case this.USERLIST:
        list = this.userList;
        break;
      case this.ADMINLIST:
        list = this.adminList;
        break;
      default:
        return;
    }
    for (let user of list) {
      if (user['id'] === id) {
        return user['name'];
      }
    }
    return '';
  }

  /**
   * Searches through the list for the Person with the id.
   * @param lists the list which should be looked through. Use constants USERLIST and ADMINLIST
   * @param id: id to which the Person should be searched.
   * @return the Person with the id. Returns a empty String, if there is no such Person in the list.
   */
  private getUser(lists: string, id: number): JSON {
    let list;
    switch (lists) {
      case this.USERLIST:
        list = this.userList;
        break;
      case this.ADMINLIST:
        list = this.adminList;
        break;
      default:
        return;
    }
    let result: JSON;
    for (let user of list) {
      if (user['id'] === id) {
        result = user;
      }
    }
    return result;
  }

  /**
   * Copys an given Array and returns the copy
   * @param array: the Array which should be copied
   * @returns any[]: the copy of the given Array array
   */
  private copyArray(array: any[]): any[] {
    const copy = [];
    for (let e of array) {
      copy.push(e);
    }
    return copy;
  }

// ===============================================Getter & Setter===============================================

  /**
   * Getter for the attribute displayUserList
   * @returns JSON[]: copy of the attribute displayUserList
   */
  public getDisplayUserList(): JSON[] {
    return this.copyArray(this.displayUserList);
  }

  /**
   * Getter for the attribute displayAdminList
   * @returns JSON[]: copy of the attribute displayAdminList
   */
  public getDisplayAdminList(): JSON[] {
    return this.copyArray(this.displayAdminList);
  }

  /**
   * Getter for the attribute message
   * @returns string: attribute message
   */
  public getMessage(): string {
    return this.message;
  }

  /**
   * Getter for the attribute successMessage
   * @returns string: the attribute successMessage
   */
  public getSuccessMessage(): string {
    return this.successMessage;
  }

// ===============================================Constructor & ngInInit===============================================

  constructor(private router: Router, private calc: CalcService, private rest: RESTService
    , private personService: PersonService, private dialog: MatDialog, public spinner: NgxSpinnerService
    , public cd: ChangeDetectorRef) {
      super(rest, spinner, cd, ['user', 'admin']);
  }

  ngOnInit() {
    this.userList = [];
    this.displayUserList = [];
    this.adminList = [];
    this.displayAdminList = [];
    this.spinner.show();

    // fetch users from server
    this.loadServerData(List.USER, [Path.WITHOUT_BIG_DATA], [{id: 'fields', val: ['id', 'name', 'isDeactivated'] }]
    , e => {
      this.userList = [...this.userList, ...e];
    }, e => {
      this.displayUserList = this.userList;
      this.setDataValueIsReady('user');
    }, this.rest);

    // fetch admins from server
    this.loadServerData(List.ADMIN, [Path.WITHOUT_BIG_DATA], [{id: 'fields', val: ['id', 'name', 'isDeactivated'] }]
    , e => {
      this.adminList = [...this.adminList, ...e];
    }, e => {
      this.displayAdminList = this.adminList;
      this.setDataValueIsReady('admin');
    }, this.rest);

  }
}
