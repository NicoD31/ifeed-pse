import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CalcService } from '../../Services/calc.service';
import { RESTService, Path, List } from '../../Services/rest.service';
import { ExportService } from '../../Services/export.service';
import { DeletionDialogComponent } from '../../Utility/deletion-dialog/deletion-dialog.component';
import { MatDialog } from '@angular/material';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-admin-setup-detail',
  templateUrl: './admin-setup-detail.component.html',
  styleUrls: ['./admin-setup-detail.component.css']
})

/**
 * Component for the detailed view of a Setup. It serves its purpose in maintaining the Setup and the respective Sessions.
 */
export class AdminSetupDetailComponent extends BaseComponent implements OnInit {

  /* The configuration file to the Setup which is being displayed. */
  private setup: JSON;

  /* Needed to find clones in the Setup list */
  private setupList: JSON[];

  /* A list of all created Sessions to this specific Setup. */
  private sessionList: JSON[];

  /* Used to filter Sessions for search */
  private filteredSessions: JSON[];

  /* Attributes for convenient html implementiation */
  private message: string;
  private showAverageTime: boolean;
  private averageTime: string;
  private setupLoaded: boolean;

  /**
   * Filters the given Session list on behalf of the provided input. Serves as a search function in the SetupDetailComponent.
   *
   * @param filter the string through which the Sessions are being searched.
   * @returns an array of JSON objects, meaning all Sessions which contain the provided string in their names.
   */
  public filterSessionList(filter: string) {
    this.setFilteredSessions(this.calcService.filterListName(this.sessionList, filter));
    return this.getFilteredSessions();
  }

  /**
   * Creates the progress value in percent which is being displayed in the Session list.
   *
   * @param session the entered Sesison to be calculated.
   * @returns the computed percent value.
   */
  public createPercentFinishedInfo(session: JSON): number {
    return this.calcService.calcPercentFinished(this.getSetup(), session);
  }

  /**
   * Creates the Session status for a Session.
   *
   * @param session the entered Session to be calculated.
   * @returns the status as defined in the SessionStatus enum.
   */
  public createSessionStatusInfo(session: JSON): string {
    return this.calcService.calcSessionStatus(this.getSetup(), session);
  }

  /**
   * Shows details to the selected Session. If the Session is finished, the summary is shown.
   *
   * @param id the unique Session id.
   */
  public openSessionDetail(id: number) {
    this.router.navigate(['/session/detail/' + id]);
  }

  /**
   * Opens the Setup creation page to give information to the selected Setup, which can not be modified.
   */
  public openSetupConfig() {
    this.router.navigate(['/setup/create/' + this.getSetup()['id']]);
  }

  /**
   * Creates an identical copy of the provided Setup.
   *
   * @returns the clone of the requested Setup.
   */
  public cloneSetup(): JSON {
    const deepCopy = JSON;

    for (const p in this.getSetup()) {
      if (this.getSetup().hasOwnProperty(p) && p !== 'id' && p !== 'name' && p !== 'creationTime' && p !== 'sessions'
          && p !== 'finishedCreation') {
        // clone Setup except for id, name, Sessions, creation time and finished creation
        deepCopy[p] = this.getSetup()[p];
      }
    }

    const posOfCopy = this.getSetup()['name'].search('_copy_');
    let setupNameNoCopy: string = this.getSetup()['name'];

    if (posOfCopy !== -1) {
      // setup is already a clone
      setupNameNoCopy = this.getSetup()['name'].substr(0, posOfCopy);
    }

    let copyCounter = 0;
    for (const itSetup of this.setupList) {
      if (itSetup['name'].search(setupNameNoCopy) !== -1 && itSetup['name'].search('_copy_') !== -1) {
        // itSetup is a copy of setupNameNoCopy
        copyCounter++;
      }
    }
    copyCounter++;

    deepCopy['name'] = setupNameNoCopy + '_copy_' + copyCounter;
    deepCopy['creationTime'] = Math.round((new Date()).getTime() / 1000);
    deepCopy['sessions'] = [];
    deepCopy['finishedCreation'] = false;

    this.spinner.show();
    this.restService.addDataToServer(List.SETUP, deepCopy).then(data => {
      this.restService.getServerData(List.SETUP, [Path.WITHOUT_BIG_DATA],
        [{ id: 'name', val: [deepCopy['name']] }, { id: 'fields', val: ['id'] }], requestedSetup => {

        this.router.navigate(['/setup/create/' + requestedSetup['results'][0]['id']]);
        this.spinner.hide();
      });
    });
    return deepCopy;
  }

  /**
   * Deletes an existing Setup and all respective Sessions.
   *
   */
  public deleteSetup() {
    // open dialog for deletion confirmation
    const dialogRef = this.deleteDialog.open(DeletionDialogComponent, {
      data: {
        setup: this.getSetup(),
        isSetup: true,
        isSession: false,
        isPerson: false,
        isDataset: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // result of dialog
      if (result) {
        // Setup will be deleted
        this.restService.deleteDataFromServer(List.SETUP, [Path.ITEM], [{ id: 'id', val: [this.getSetup()['id']] }]).then( data => {
          this.router.navigate(['/setup']);
        });
      }
    });
  }

  /**
   * Deletes the selected Session from the system.
   *
   * @param session the Session to be deleted.
   */
  public deleteSession(session: JSON) {

    // open dialog for Session deletion
    const dialogRef = this.deleteDialog.open(DeletionDialogComponent, {
      data: {
        session: session,
        isSetup: false,
        isSession: true,
        isPerson: false,
        isDataset: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // result of dialog
      if (result) {
        this.spinner.show();

        // Session will be deleted
        this.restService.deleteDataFromServer(List.SESSION, [Path.ITEM], [{ id: 'id', val: [session['id']] }]).then(data => {
          const index = this.sessionList.indexOf(session);
          if (index === -1) {
            this.spinner.hide();
            return;
          }
          // update lists
          this.sessionList.splice(index, 1);

          this.updateFilteredSessions(this.sessionList);

          // set message
          this.setMessage('Session ' + session['name'] + ' deleted succesfully');
          // hide spinner
          this.spinner.hide();
        });
      }
    });
  }

  /**
   * Downloads the Setup.
   *
   * @returns true if download was successful, false if not.
   */
  public downloadSetup(): boolean {
    return this.exportService.downloadJSON(this.getSetup());
  }

  /**
   * Downloads the Session.
   *
   * @param session the selected session.
   * @returns true if download was successful, false if not.
   */
  public downloadSession(session: JSON): boolean {
    this.restService.getServerData(List.SESSION, [Path.ITEM], [{ id: 'id', val: [session['id']] },
      { id: 'fields!', val: ['heatmaps'] }], sessionsData => {

      return this.exportService.downloadJSON(<JSON>sessionsData);
    });
    return false;
  }

  /**
   * Downloads the Session labels (finalLabels).
   *
   * @param session the selected session.
   * @returns true if download was successful, false if not.
   */
  public downloadSessionLabels(session: JSON): boolean {
    this.restService.getServerData(List.SESSION, [Path.ITEM], [{ id: 'id', val: [session['id']] },
      { id: 'fields', val: ['name', 'finalLabels'] }], sessionsData => {

      return this.exportService.downloadSessionLabels(<JSON>sessionsData);
    });
    return false;
  }

  /* constructor and ngOnInit ------------------------------------------------------------- */

  /**
   * Constructor for the AdminSetupDetailComp.
   *
   * @param router used to route to other components.
   * @param calcService used to filter the session list.
   * @param restService used for REST requests.
   * @param exportService used to download Sessions/Setups.
   * @param matDialog used for the deletion dialog window.
   * @param cd needed for spinner.
   * @param spinner the actual spinner.
   */
  public constructor(private router: Router, private route: ActivatedRoute, private calcService: CalcService,
    public restService: RESTService, private exportService: ExportService, public deleteDialog: MatDialog,
    public cd: ChangeDetectorRef, public spinner: NgxSpinnerService) {

    super(restService, spinner, cd, ['session', 'setup']);
  }

  /**
   * Used to request setup and sessionList at initialization.
   */
  ngOnInit() {
    const setupId = this.route.snapshot.paramMap.get('id');

    this.spinner.show();

    this.loadSetup(setupId);
    this.loadSessions(setupId);
    this.loadSetups();
  }

  /* private methods ------------------------------------------------------------- */

  /* loading methods for REST requests */
  private loadSetup(id: string) {
    this.restService.getServerData(List.SETUP, [Path.ITEM], [{ id: 'id', val: [id] }], setup => {
      this.setSetup(<JSON>setup);
      this.setSetupLoaded(true);

      if (setup['finishedCreation'] === false) {
        // if invalid accedd to this page through url manipulation
        this.router.navigate(['/setup']);
      }
    });
  }

  private loadSetups() {
    this.setupList = [];
    this.loadServerData(List.SETUP, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'creationTime', 'iterations'] }], e => {
      this.setupList = [...this.setupList, ...e];
    }, e => {
      this.setDataValueIsReady('setup');
    }, this.restService);
  }

  private loadSessions(setupId: string) {
    this.sessionList = [];
    this.loadServerData(List.SESSION, [Path.WITHOUT_BIG_DATA], [{id: 'setup', val: [setupId]},
        { id: 'fields', val: ['id', 'name', 'iteration', 'finished', 'inProgress', 'setup'] }], e => {

      this.sessionList = [...this.sessionList, ...e];
    }, e => {
      this.sessionList = this.calcService.sortNewestFirst(this.sessionList);
      this.setFilteredSessions(this.sessionList);
      this.createAverageTimeSessionInfo();
      this.setDataValueIsReady('session');
    }, this.restService);
  }

  /**
   * Creates the average time needed to complete a Session.
   */
  private createAverageTimeSessionInfo() {
    const result = this.calcService.calcAverageTimeSession(this.sessionList);
    if (result > 0) {
      this.setShowAverageTime(true);
      this.setAverageTime('average time per Session: ' + this.calcService.getTimeAsString(result));
    } else {
      this.setShowAverageTime(true);
      this.setAverageTime('not enough data for average time');
    }
  }

  private updateFilteredSessions(updatedList: JSON[]) {
    this.filteredSessions = [...updatedList];
  }

  /* get and set methods ------------------------------------------------------------- */

  /**
   * Getter for the Setup.
   * @returns the Setup.
   */
  public getSetup(): JSON {
    return this.setup;
  }

  /**
   * Setter for the Setup.
   * @param setup the Setup which is setted.
   */
  public setSetup(setup: JSON) {
    this.setup = setup;
  }

  /**
   * Getter for the filtered Sessions.
   * @returns the filtered Sessions array.
   */
  public getFilteredSessions(): JSON[] {
    return this.filteredSessions;
  }

  /**
   * Setter for the filtered Sessions.
   * @param filteredSessions the filtered Sessions to be setted.
   */
  public setFilteredSessions(filteredSessions: JSON[]) {
    this.filteredSessions = filteredSessions;
  }

  /**
   * Getter for the message.
   * @returns the message.
   */
  public getMessage(): string {
    return this.message;
  }

  /**
   * Setter for the message.
   * @param message the message which is being setted.
   */
  public setMessage(message: string) {
    this.message = message;
  }

  /**
   * Getter for the show average time attribute.
   * @returns true if the average time is being shown, false if not.
   */
  public getShowAverageTime(): boolean {
    return this.showAverageTime;
  }

  /**
   * Setter for the show average time attribute.
   * @param showAverageTime true if the average time should be shown, false if not.
   */
  public setShowAverageTime(showAverageTime: boolean) {
    this.showAverageTime = showAverageTime;
  }

  /**
   * Getter for the average time.
   * @returns the average time as a string.
   */
  public getAverageTime(): string {
    return this.averageTime;
  }

  /**
   * Setter for the  average time attribute.
   * @param averageTime the time to be setted.
   */
  public setAverageTime(averageTime: string) {
    this.averageTime = averageTime;
  }

  /**
   * Getter for the Setup loaded attribute.
   * @returns true if the Setup was loaded, false if not.
   */
  public getSetupLoaded(): boolean {
    return this.setupLoaded;
  }

  /**
   * Setter for the Setup loaded attribute.
   * @param setupLoaded true if the setup has been loaded, false if not.
   */
  public setSetupLoaded(setupLoaded: boolean) {
    this.setupLoaded = setupLoaded;
  }

  /**
   * Getter for the Setup list.
   * @returns the Setup list.
   */
  public getSetupList(): JSON[] {
    return this.setupList;
  }

  /**
   * Setter for the Setu list.
   * @param setupList the Setup list which is setted.
   */
  public setSetupList(setupList: JSON[]) {
    this.setupList = setupList;
  }
}
