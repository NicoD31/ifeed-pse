import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RESTService, Path, List  } from '../../Services/rest.service';
import { CalcService } from '../../Services/calc.service';
import { FormControl } from '@angular/forms';
import { StatisticsService } from '../../Services/statistics.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';
import { DeletionDialogComponent } from '../../Utility/deletion-dialog/deletion-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-admin-setup-overview',
  templateUrl: './admin-setup-overview.component.html',
  styleUrls: ['./admin-setup-overview.component.css']
})

/**
 * Component for the Setup overview page. This page is representing the entry point to the Setup configuration.
 * Setups can be edited, created, Sessions can be started and compared.
 */
export class AdminSetupOverviewComponent extends BaseComponent implements OnInit {

  /* default values */
  private static readonly DEFAULT_MATRIX_VALUE = '0';
  private static readonly DEFAULT_RGB_VALUE = 'ffffff';
  private static readonly DEFAULT_NUMBER_BASIS = 10;

  /* Matrix dimensions meaning the number of rows and columns */
  private static readonly MATRIX_DIMENSIONS = 4;

  /* Lists which are being displaied in this Component */
  private setupList: JSON[];
  private userList: JSON[];
  private datasetList: JSON[];

  /* Used to ensure that data is only being shown if correctly loaded from the server */
  private sessionsLoaded: boolean;

  /* Temporarily used to store Sessions to a respective Setup */
  private sessionList: JSON[];

  /* Matrix computation */
  private selectedRow: string[];
  private selectedCol: string[];
  private colorMatrix: string[][];
  private cappaMatrix: number[][];

  /* User input and attributes for convenient html implementation */
  private filteredSetups: JSON[];
  private selectedSetup: JSON;

  /* Used to display additional windows if statistics or session creation is being executed */
  private isStatSelected: boolean;
  private statisticsMessage: string;
  private creationMessage: string;
  private deletionMessage: string;
  private displayDeletionMessage: boolean;
  private displayCreationMessage: boolean;
  private isSessionCreationSelected: boolean;
  private selectedUsers: FormControl;

  /**
   * Filters the given Setup list on behalf of the provided input. Serves as a search function in the Setup overview.
   *
   * @param filter the string through which the Setups are being searched.
   * @returns an array of JSON objects, meaning all Setups which contain the provided string in their names.
   */
  public filterSetupList(filter: string): JSON[] {
    this.setFilteredSetups(this.calcService.filterListName(this.setupList, filter));
    return this.getFilteredSetups();
  }

  /**
   * Opens the SetupDetailComp with detailed information to the selected Setup.
   *
   * @param id the unique Setup id.
   */
  public openSetup(id: number) {
    this.router.navigate(['/setup/detail/' + id]);
  }

  /**
   * Opens the create Setup page to edit the Setup.
   * @param id the unique Setup id.
   */
  public editSetup(id: number) {
    this.router.navigate(['/setup/create/' + id]);
  }

  /**
   * Opens the create Setup page to create a new Setup.
   */
  public openCreateSetup() {
    this.router.navigate(['/setup/create/0']);
  }

  /**
   * Deletes an existing Setup and all respective Sessions.
   *
   * @param setup the setup to be deleted.
   */
  public deleteSetup(setup: JSON) {
    // open dialog for deletion confirmation
    const dialogRef = this.deleteDialog.open(DeletionDialogComponent, {
      data: {
        setup: setup,
        isSetup: true,
        isSession: false,
        isPerson: false,
        isDataset: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // result of dialog
      if (result) {
        this.spinner.show();

        // Setup will be deleted
        this.restService.deleteDataFromServer(List.SETUP, [Path.ITEM], [{ id: 'id', val: [setup['id']] }]).then( data => {
          const index = this.setupList.indexOf(setup);

          if (index === -1) {
            this.spinner.hide();
            return;
          }

          this.setupList.splice(index, 1);

          this.updateFilteredSetups(this.setupList);

          // set deletion message
          this.setDisplayDeletionMessage(true);
          this.setDeletionMessage('Setup ' + setup['name'] + ' deleted succesfully');

          this.spinner.hide();
        });
      }
    });
  }

  /**
   * Finishes the creation process of this Setup.
   *
   * @param setup the entered Setup.
   */
  public finishCreation(setup: JSON) {
    let completeSetup: JSON;

    this.spinner.show();
    this.restService.getServerData(List.SETUP, [Path.ITEM], [{ id: 'id', val: [setup['id']] }], setupData => {
      completeSetup = <JSON>setupData;
      completeSetup['finishedCreation'] = true;
      // update database
      this.restService.alterDataFromServer(List.SETUP, [Path.ITEM], completeSetup, [{ id: 'id',
        val: [completeSetup['id']] }]).then(updateData => {

        // update list in comp
        this.setupList[this.setupList.indexOf(setup)]['finishedCreation'] = true;
        this.updateFilteredSetups(this.setupList);
        this.spinner.hide();
      });
    });
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

  /**
   * Selects a certain Setup for Session creation. This method prepares the Session creation.
   *
   * @param setup the Setup which is being selected.
   * @returns if selection was successful, false if not.
   */
  public selectSetupForSessionCreation(setup: JSON): boolean {
    if (!setup) {
      return false;
    }

    // flush seletion field
    this.setSelectedUsers(new FormControl());

    // set html booleans
    this.setSelectedSetup(setup);
    this.setIsSessionCreationSelected(true);
    this.setDisplayCreationMessage(false);
    this.setDisplayDeletionMessage(false);
    this.setIsStatSelected(false);
    return true;
  }

  /**
   * Submits the entered Users and executes the Session creation.
   */
  public submitSelection() {
    this.executeSessionCreation(this.getSelectedUsers().value);
  }

  /**
   * Executes the Session creation.
   * @param value the entered Users for creation.
   * @return the created Sessions.
   */
  public executeSessionCreation(value: JSON[]): JSON[] {
    if (!value || value.length === 0) {
      this.setDisplayCreationMessage(true);
      this.setCreationMessage('At least one User must be selected');
    } else {
      return this.createSessions(this.getSelectedSetup(), value);
    }
  }

  /**
   * Selects a certain Setup to display statistics.
   *
   * @param setup the setup which has been selected.
   */
  public selectSetupForStatistics(setup: JSON) {
    // flush matrix for new computation
    const defValue = AdminSetupOverviewComponent.DEFAULT_MATRIX_VALUE;

    this.setSelectedRow([defValue, defValue, defValue, defValue]);
    this.setSelectedCol([defValue, defValue, defValue, defValue]);

    this.sessionList = [];
    this.setSessionsLoaded(false);
    this.spinner.show();
    this.restService.getServerPages(List.SESSION, [Path.WITHOUT_BIG_DATA], [{ id: 'setup', val: [setup['id']] },
         { id: 'fields', val: ['id', 'name', 'finalLabels', 'iteration']}], sessions => {

      this.sessionList = [...this.sessionList, ...sessions];
    }, e => {
      // filter for sessions that have already been started
      this.sessionList = this.sessionList.filter(a => a['iteration'] !== 0);

      // sort in reversed order, newest session first
      this.sessionList = this.calcService.sortNewestFirst(this.sessionList);

      this.setSelectedSetup(setup);
      this.setSessionsLoaded(true);
      this.setIsStatSelected(true);
      this.setIsSessionCreationSelected(false);
      this.setDisplayDeletionMessage(false);
      this.setDisplayCreationMessage(false);
      this.initalizeMatrices();

      this.spinner.hide();
    });
  }

  /**
   * Initializes the matrices with default values.
   */
  public initalizeMatrices() {
    this.computeMatrices();
    this.setStatisticsMessage('Please select Sessions in rows and columns for comparison');
  }

  /**
   * Updates the matrices to compare Sessions with each other.
   */
  public updateMatrices() {
    this.computeMatrices();
    this.setStatisticsMessage('Color saturation implicates correlation, the number is the computed cappa value');
  }

  /* constructor and ngOnInit ------------------------------------------------------------- */

  /**
   * Constructor for the AdminSetupOverviewComponent.
   *
   * @param router used to route to other Components.
   * @param restService used for REST requests.
   * @param calcService used to filter lists or sort them.
   * @param statisticsService used to compute matrix entries.
   * @param cd needed for spinner.
   * @param spinner the actual spinner.
   */
  public constructor(private router: Router, public restService: RESTService, private calcService: CalcService,
    private statisticsService: StatisticsService, public cd: ChangeDetectorRef, public spinner: NgxSpinnerService,
    public deleteDialog: MatDialog) {

    super(restService, spinner, cd, ['setup', 'user', 'dataset']);
  }

  /**
   * Used to request setupList, userList, datasetList at initialization.
   */
  ngOnInit() {
    this.spinner.show();
    this.loadSetups();
    this.loadUser();
    this.loadDatasets();
  }

  /* private methods ------------------------------------------------------------- */

  /* loading methods for REST requests */
  private loadSetups() {
    this.setupList = [];
    this.loadServerData(List.SETUP, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'creationTime',
        'iterations', 'dataset', 'finishedCreation'] }], e => {

      this.setupList = [...this.setupList, ...e];
    }, e => {
      this.setupList = this.setupList.sort((a, b) => b['creationTime'] - a['creationTime']);
      this.setFilteredSetups(this.setupList);
      this.setDataValueIsReady('setup');
    }, this.restService);
  }

  private loadUser() {
    this.userList = [];
    this.loadServerData(List.USER, [Path.WITHOUT_BIG_DATA], [{ id: 'isDeactivated', val: [false] },
        { id: 'fields', val: ['id', 'name'] }], e => {

      this.userList = [...this.userList, ...e];
    }, e => {
      this.userList = this.calcService.sortNewestFirst(this.userList);
      this.setDataValueIsReady('user');
    }, this.restService);
  }

  private loadDatasets() {
    this.datasetList = [];
    this.loadServerData(List.DATASET, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'dataset'] }], e => {
      this.datasetList = [...this.datasetList, ...e];
    }, e => {
      this.setDataValueIsReady('dataset');
    }, this.restService);
  }

  /**
   * Creates a new Session for a User to an existing Setup.
   *
   * @param setup the Setup to the Session which will be created.
   * @param userId the User which belongs to this Session.
   * @return the created Session
   */
  private createSession(setup: JSON, user: JSON): JSON {
    let numFinalLabels: number;

    // checks for the max amount of data points, which can be labeled on this dataset.
    for (const dataset of this.datasetList) {
      if (dataset['id'] === setup['dataset']) {
        numFinalLabels = dataset['dataset']['values'].length;
      }
    }

    const session = JSON;

    session['inProgress'] = 0;
    session['iteration'] = 0;
    session['pauses'] = 0;
    session['rewinds'] = 0;
    session['history'] = [];
    session['heatmaps'] = [];
    session['labels'] = [];

    // initializes final labels array (needed for Ocal API)
    for (let i = 0; i < numFinalLabels; i++) {
      session['labels'].push('U');
    }

    session['finalLabels'] = [];
    session['finished'] = false;
    session['setup'] = setup['id'];
    session['user'] = user['id'];
    session['userlabelMatchesAPI'] = [];

    this.restService.addDataToServer(List.SESSION, session).then(data => {
    });
    return session;
  }

  /**
   * Creates multiple Sessions for multiple Users to an existing Setup.
   *
   * @param setup the Setup to which the Sessions should be created.
   * @param users the array of Users to which the created Sessions are belonging.
   * @returns the created Session objects.
   */
  private createSessions(setup: JSON, users: JSON[]): JSON[] {
    const sessions: JSON[] = [];
    // creates Sessions to the selected Users
    for (const user of users) {
      sessions.push(this.createSession(setup, user));
    }

    this.setCreationMessage('Session creation successful');
    this.setDisplayCreationMessage(true);
    return sessions;
  }

  /**
   * Computes the color matrix and cappa matrix on behalf of the selected Sessions.
   */
  private computeMatrices() {
    this.spinner.show();

    this.colorMatrix = [];
    this.cappaMatrix = [];
    for (let i = 0; i < AdminSetupOverviewComponent.MATRIX_DIMENSIONS; i++) {
      this.colorMatrix[i] = [];
      this.cappaMatrix[i] = [];
      for (let j = 0; j < AdminSetupOverviewComponent.MATRIX_DIMENSIONS; j++) {
        if (this.selectedRow[i] === undefined) {
          // if row is unselected again
          this.selectedRow[i] = AdminSetupOverviewComponent.DEFAULT_MATRIX_VALUE;
        }
        if (this.selectedCol[j] === undefined) {
          // if col is unselected again
          this.selectedCol[j] = AdminSetupOverviewComponent.DEFAULT_MATRIX_VALUE;
        }

        if (this.selectedRow[i] !== AdminSetupOverviewComponent.DEFAULT_MATRIX_VALUE
          && this.selectedCol[j] !== AdminSetupOverviewComponent.DEFAULT_MATRIX_VALUE) {

          const basis = AdminSetupOverviewComponent.DEFAULT_NUMBER_BASIS;
          this.colorMatrix[i][j] = this.computeColorEntry(parseInt(this.selectedRow[i], basis), parseInt(this.selectedCol[j], basis));
          this.cappaMatrix[i][j] = this.computeCappaEntry(parseInt(this.selectedRow[i], basis), parseInt(this.selectedCol[j], basis));
        } else {
          this.colorMatrix[i][j] = AdminSetupOverviewComponent.DEFAULT_RGB_VALUE;
          this.cappaMatrix[i][j] = 0;
        }
      }
    }

    this.cd.markForCheck();
    this.spinner.hide();
  }

  /**
   * Computes the color which is being set as a background color in each table point of the matrix.
   *
   * @param session1Id the unique Session id.
   * @param session2Id the unique Session id.
   * @returns the color as a hexadecimal value;
   */
  private computeColorEntry(session1Id: number, session2Id: number): string {
    let session1, session2: JSON;

    for (const session of this.sessionList) {
      if (session['id'] === session1Id) {
        session1 = session;
      }
      // two identical sessions can be compared
      if (session['id'] === session2Id) {
        session2 = session;
      }
    }

    return this.statisticsService.matrixColorEntry(session1, session2);
  }

  /**
   * Computes the cappa value for the two corresponding Sessions.
   *
   * @param session1Id the unique Session id.
   * @param session2Id the unique Session id.
   * @returns the cappa value as described in the StatisticsService.
   */
  private computeCappaEntry(session1Id: number, session2Id: number): number {
    let session1, session2: JSON;

    for (const session of this.sessionList) {
      if (session['id'] === session1Id) {
        session1 = session;
      }
      // two identical sessions can be compared
      if (session['id'] === session2Id) {
        session2 = session;
      }
    }

    return this.statisticsService.cohensKappa(session1, session2);
  }

  /**
   * Updates the displayed list.
   */
  private updateFilteredSetups(updatedList: JSON[]) {
    this.filteredSetups = [...updatedList];
  }

  /* get and set methods ------------------------------------------------------------- */

  /**
   * Getter for the selected rows.
   * @returns the rows selection array.
   */
  public getSelectedRow(): string[] {
    return this.selectedRow;
  }

  /**
   * Setter for the selected rows.
   * @param selectedRow an array of the selected rows.
   */
  public setSelectedRow(selectedRow: string[]) {
    this.selectedRow = selectedRow;
  }

  /**
   * Getter for the selected columns.
   * @returns the columns selection array.
   */
  public getSelectedCol(): string[] {
    return this.selectedCol;
  }

  /**
   * Setter for the selected columns.
   * @param selectedCol an array of the selected columns.
   */
  public setSelectedCol(selectedCol: string[]) {
    this.selectedCol = selectedCol;
  }

  /**
   * Getter for the color matrix.
   * @returns the color matrix used for Session comparison.
   */
  public getColorMatrix(): string[][] {
    return this.colorMatrix;
  }

  /**
   * Setter for the color matrix.
   * @param colorMatrix an array containing hexadecimal values which represent colors.
   */
  public setColorMatrix(colorMatrix: string[][]) {
    this.colorMatrix = colorMatrix;
  }

  /**
   * Getter for the cappa matrix.
   * @returns the cappa matrix used for Session comparison
   */
  public getCappaMatrix(): number[][] {
    return this.cappaMatrix;
  }

  /**
   * Setter for the cappa matrix.
   * @param cappaMatrix an array of number values between 0 and 1, representing the specific cappa values.
   */
  public setCappaMatrix(cappaMatrix: number[][]) {
    this.cappaMatrix = cappaMatrix;
  }

  /**
   * Getter for the filtered Setups.
   * @returns the filtered Setups.
   */
  public getFilteredSetups(): JSON[] {
    return this.filteredSetups;
  }

  /**
   * Setter for the filtered Setups.
   * @param filteredSetups the filtered Setups as an array.
   */
  public setFilteredSetups(filteredSetups: JSON[]) {
    this.filteredSetups = filteredSetups;
  }

  /**
   * Getter for the selected Setup.
   * @returns the selected Setup.
   */
  public getSelectedSetup(): JSON {
    return this.selectedSetup;
  }

  /**
   * Setter for the selected Setup.
   * @param selectedSetup the selected Setup to be set.
   */
  public setSelectedSetup(selectedSetup: JSON) {
    this.selectedSetup = selectedSetup;
  }

  /**
   * Getter for the is statistics selected attribute.
   * @returns true if the statistics menu is selected, false if not.
   */
  public getIsStatSelected(): boolean {
    return this.isStatSelected;
  }

  /**
   * Setter for the is statistics selected attribute.
   * @param isStatSelected true if the statistics menu is selected, false if not.
   */
  public setIsStatSelected(isStatSelected: boolean) {
    this.isStatSelected = isStatSelected;
  }

  /**
   * Getter for the is Session creation selected attribute.
   * @returns true if the Session creation menu is active, false if not.
   */
  public getIsSessionCreationSeleted(): boolean {
    return this.isSessionCreationSelected;
  }

  /**
   * Setter for the is Session creation selected attribute.
   * @param isSessionCreationSelected true if the Session creation menu is active, false if not.
   */
  public setIsSessionCreationSelected(isSessionCreationSelected: boolean) {
    this.isSessionCreationSelected = isSessionCreationSelected;
  }

  /**
   * Getter for the statistics message.
   * @returns the message which is being shown in the statistics menu.
   */
  public getStatisticsMessage(): string {
    return this.statisticsMessage;
  }

  /**
   * Setter for the statistics message.
   * @param statisticsMessage the message which is being shown in the statistics menu.
   */
  public setStatisticsMessage(statisticsMessage: string) {
    this.statisticsMessage = statisticsMessage;
  }

  /**
   * Getter for the creation message.
   * @returns the message which is being shown in the Session creation menu after Session creation.
   */
  public getCreationMessage(): string {
    return this.creationMessage;
  }

  /**
   * Setter for the creation message.
   * @param creationMessage the message which is being shown in the Session creation menu after Session creation.
   */
  public setCreationMessage(creationMessage: string) {
    this.creationMessage = creationMessage;
  }

  /**
   * Getter for the display creation message attribute.
   * @returns true if the creation message is being shown, false if not.
   */
  public getDisplayCreationMessage(): boolean {
    return this.displayCreationMessage;
  }

  /**
   * Setter for the display creation message.
   * @param displayCreationMessage true if the creation message is being shown, false if not.
   */
  public setDisplayCreationMessage(displayCreationMessage: boolean) {
    this.displayCreationMessage = displayCreationMessage;
  }

  /**
   * Getter for the selected users.
   * @returns a form control containing all selected users for Session creation.
   */
  public getSelectedUsers(): FormControl {
    return this.selectedUsers;
  }

  /**
   * Setter for the selected users.
   * @returns the selected users as a form control.
   */
  public setSelectedUsers(selectedUsers: FormControl) {
    this.selectedUsers = selectedUsers;
  }

  /**
   * Getter for the Sessions loaded attribute.
   * @returns true if the Sessions have been loaded, false if not.
   */
  public getSessionsLoaded(): boolean {
    return this.sessionsLoaded;
  }

  /**
   * Setter for the Sessions loaded attribute.
   * @param sessionsLoaded true if the Sessions have been loaded, false if not.
   */
  public setSessionsLoaded(sessionsLoaded: boolean) {
    this.sessionsLoaded = sessionsLoaded;
  }

  /**
   * Getter for the message.
   * @returns the message.
   */
  public getDeletionMessage(): string {
    return this.deletionMessage;
  }

  /**
   * Setter for the message.
   * @param deletionMessage the message which is being setted.
   */
  public setDeletionMessage(deletionMessage: string) {
    this.deletionMessage = deletionMessage;
  }

  /**
   * Getter for the display deletion message attribute.
   * @returns true if the deletion message is being shown, false if not.
   */
  public getDisplayDeletionMessage(): boolean {
    return this.displayDeletionMessage;
  }

  /**
   * Setter for the display deletion message.
   * @param displayDeletionMessage true if the deletion message is being shown, false if not.
   */
  public setDisplayDeletionMessage(displayDeletionMessage: boolean) {
    this.displayDeletionMessage = displayDeletionMessage;
  }
}
