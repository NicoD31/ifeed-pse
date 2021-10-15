import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RESTService, List, Path } from '../../Services/rest.service';
import { CalcService } from '../../Services/calc.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-admin-main-overview',
  templateUrl: './admin-main-overview.component.html',
  styleUrls: ['./admin-main-overview.component.css']
})

/**
 * This component implements the overview menu which is shown to the Admin after login. It provides an overview of the
 * last created Setups, imported Datasets, Users in the system and currently running or finished Sessions.
 */
export class AdminMainOverviewComponent extends BaseComponent implements OnInit {

  /* number of elements per list */
  private static readonly MAX_LIST_ELEMENTS = 5;

  /* A list containing all Setups in the system. */
  private setupList: JSON[];

  /* A list containing all Sessions in the system. */
  private sessionList: JSON[];

  /* A list containing all Datasets in the system. */
  private datasetList: JSON[];

  /* A list containing all Users in the system. */
  private userList: JSON[];

  /* The list of setups which are being displayed */
  private displayedSetups: JSON[];

  /**
   * Opens the Setup overview page.
   */
  public openSetups() {
    this.router.navigate(['/setup']);
  }

  /**
   * Opens the Session overview page.
   */
  public openSessions() {
    this.router.navigate(['/session']);
  }

  /**
   * Opens the User overview page.
   */
  public openUser() {
    this.router.navigate(['/user']);
  }

  /**
   * Opens the Dataset overview page.
   */
  public openDatasets() {
    this.router.navigate(['/datasets']);
  }

  /**
   * Creates the progress value in percent which is being displayed in the Session list.
   *
   * @param session the entered Session to be calculated.
   * @returns the computed percent value.
   */
  public createPercentFinishedInfo(session: JSON): number {
    return this.calcService.calcPercentFinished(this.searchSetup(session), session);
  }

  /**
   * Creates the Session status for a Session.
   *
   * @param session the entered Session to be calculated.
   * @returns the status as defined in the SessionStatus enum.
   */
  public createSessionStatusInfo(session: JSON): string {
    return this.calcService.calcSessionStatus(this.searchSetup(session), session);
  }

  /**
   * Creates the time since the Setup was created.
   *
   * @param setup the entered Setup to be calculated.
   * @returns a string containing "created <x> <time> ago" while x is an integer
   * and time is a value of seconds/minutes/hours or days after creation.
   */
  public createSetupTimeInfo(setup: JSON): string {
    return this.calcService.calcSetupTimeMessage(setup);
  }

  /* constructor and ngOnInit ------------------------------------------------------------- */

  /**
   * Constructor for the AdminMainOverviewComponent.
   *
   * @param router used for routing to other Components.
   * @param restService used for REST requests.
   * @param calcService used to compute information regarding Sessions or Setups.
   * @param cd needed for progress spinner.
   * @param spinner the actual spinner.
   */
  public constructor(private router: Router, public restService: RESTService, private calcService: CalcService,
    public cd: ChangeDetectorRef, public spinner: NgxSpinnerService) {

    super(restService, spinner, cd, ['session', 'setup', 'user', 'dataset']);
  }

  /**
   * Used to request setupList, sessionList, userList and datasetList at initialization.
   */
  ngOnInit() {
    this.spinner.show();
    this.loadSetups();
    this.loadSessions();
    this.loadUser();
    this.loadDatasets();
  }

  /* private methods ------------------------------------------------------------- */

  private searchSetup(session: JSON): JSON {
    for (const setup of this.setupList) {
      if (setup['id'] === session['setup']) {
        return setup;
      }
    }
  }

  private loadSetups() {
    this.setupList = [];
    this.loadServerData(List.SETUP, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'creationTime',
      'iterations', 'feedbackMode'] }], e => {

      this.setupList = [...this.setupList, ...e];
    }, e => {
      this.setupList = this.setupList.sort((a, b) => b['creationTime'] - a['creationTime']);
      this.setDisplayedSetupList(this.calcService.sliceListFirstElements(this.setupList, AdminMainOverviewComponent.MAX_LIST_ELEMENTS));
      this.setDataValueIsReady('setup');
    }, this.restService);
  }

  private loadSessions() {
    this.sessionList = [];
    this.loadServerData(List.SESSION, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'iteration',
      'finished', 'inProgress', 'setup'] }], e => {

      this.sessionList = [...this.sessionList, ...e];
    }, e => {
      this.setSessionList(this.calcService.sortNewestFirst(this.getSessionList()));
      this.setSessionList(this.calcService.sliceListFirstElements(this.getSessionList(), AdminMainOverviewComponent.MAX_LIST_ELEMENTS));
      this.setDataValueIsReady('session');
    }, this.restService);
  }

  private loadUser() {
    this.userList = [];
    this.loadServerData(List.USER, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name'] }], e => {
      this.userList = [...this.userList, ...e];
    }, e => {
      this.setUserList(this.calcService.sortNewestFirst(this.getUserList()));
      this.setUserList(this.calcService.sliceListFirstElements(this.getUserList(), AdminMainOverviewComponent.MAX_LIST_ELEMENTS));
      this.setDataValueIsReady('user');
    }, this.restService);
  }

  private loadDatasets() {
    this.datasetList = [];
    this.loadServerData(List.DATASET, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name'] }], e => {
      this.datasetList = [...this.datasetList, ...e];
    }, e => {
      this.setDatasetList(this.calcService.sortNewestFirst(this.getDatasetList()));
      this.setDatasetList(this.calcService.sliceListFirstElements(this.getDatasetList(), AdminMainOverviewComponent.MAX_LIST_ELEMENTS));
      this.setDataValueIsReady('dataset');
    }, this.restService);
  }

  /* get and set methods ------------------------------------------------------------- */

  /**
   * Getter for the display Setup list.
   * @returns the requested setup list.
   */
  public getDisplayedSetupList(): JSON[] {
    return this.displayedSetups;
  }

  /**
   * Setter for the display Setup list.
   * @param displayedSetups the Setup list which is setted.
   */
  public setDisplayedSetupList(displayedSetups: JSON[]) {
    this.displayedSetups = displayedSetups;
  }

  /**
   * Getter for the Session list.
   * @returns the requested Session list.
   */
  public getSessionList(): JSON[] {
    return this.sessionList;
  }

  /**
   * Setter for the Session list.
   * @param sessionList the Session list which is setted.
   */
  public setSessionList(sessionList: JSON[]) {
    this.sessionList = sessionList;
  }

  /**
   * Getter for the Dataset list.
   * @returns the requested Dataset list.
   */
  public getDatasetList(): JSON[] {
    return this.datasetList;
  }

  /**
   * Setter for thee Dataset list.
   * @param datasetList the Dataset list which is setted.
   */
  public setDatasetList(datasetList: JSON[]) {
    this.datasetList = datasetList;
  }

  /**
   * Getter for the User list.
   * @returns the requested User list.
   */
  public getUserList(): JSON[] {
    return this.userList;
  }

  /**
   * Setter for the User list.
   * @param userList the User list which is setted.
   */
  public setUserList(userList: JSON[]) {
    this.userList = userList;
  }
}
