import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { RESTService, List, Path } from '../../../Services/rest.service';
import { CalcService } from '../../../Services/calc.service';
import { DeletionDialogComponent } from '../../../Utility/deletion-dialog/deletion-dialog.component';
import { CreateDialogComponent } from '../../../Utility/create-dialog/create-dialog.component';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../../base.component';


@Component({
  selector: 'app-admin-session-overview',
  templateUrl: './admin-session-overview.component.html',
  styleUrls: ['./admin-session-overview.component.css']
})

/**
 * Component for the Session overview page. This page is representing the entry point to the Session menu.
 */
export class AdminSessionOverviewComponent extends BaseComponent implements OnInit {

  @ViewChild(CdkVirtualScrollViewport)
  private viewport: CdkVirtualScrollViewport;
  /** A list of all Sessions in this system. */
  private sessionList: JSON[];
  /**A list of all Sessions filtered by the silterSessionList method*/
  private filteredSessions: JSON[];
  /**status code of the http request used by deleteSession()*/
  private statusCode: number;
  /**message if an error accures during http request*/
  private message: string;

  private setupList: JSON[];

  /**
   * gets the sessionList
   * @return returns the sessionList
   */
  public getSessionList() {
    return this.sessionList;
  }

  /**
   * gets the filteredSessions
   * @return returns the filteredSessions
   */
  public getFilteredSessions() {
    return this.filteredSessions;
  }

  /**
   * gets the statusCode
   * @return returns the statusCode
   */
  public getStatusCode() {
    return this.statusCode;
  }

  /**
   * gets the message
   * @return returns the message
   */
  public getMessage() {
    return this.message;
  }

  /**
   * gets the setupList
   * @return returns the setupList
   */
  public getSetupList() {
    return this.setupList;
  }

  /**
   * Filters the given Session list on behalf of the provided input. Serves as a search function in the Session overview.
   * @param filter the string on which the Sessions are being searched for.
   * @return an array of JSON objects, meaning all Sessions which contain the provided string in their names.
   */
  public filterSessionList(filter: string): JSON[] {
    this.filteredSessions = this.calcService.filterListName(this.sessionList, filter);
    return this.filteredSessions;
  }

  /**
   * Opens a new window with detailed information to the selected Session.
   * @param id the unique Session id.
   */
  public openSession(id: number) {
    this.router.navigate(['/session/detail/' + id]);
  }

  /**
   * Deletes an existing Session.
   * @param session the Session object.
   */
  public deleteSession(session: JSON) {
    if (session === null) {
      return false;
    }
    // open dialog for session deletion
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
        // Session will be deleted
        this.spinner.show();
        this.restService.deleteDataFromServer(List.SESSION, [Path.ITEM], [{ id: 'id', val: [session['id']] }]).then(data => {
          const index = this.sessionList.indexOf(session);
          if (index === -1) {
            return false;
          }
          this.sessionList.splice(index, 1);
          this.filteredSessions.splice(index, 1);
          this.sessionList = [...this.sessionList];
          this.filteredSessions = [... this.filteredSessions];
          this.message = 'Session ' + session['name'] + ' deleted succesfully';
          this.cd.markForCheck();
          this.spinner.hide();
          return true;
        }, err => {
          this.message = err.message;
        });
      } else {
        // Session will not be deleted
        return false;
      }
    });
  }

  /**
   * Opens the create Session dialog, which will navigate the Admin to the SetupOvw.
   */
  public openCreateSessionDialog() {
    const dialogRef = this.createDialog.open(CreateDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // result of dialog
      if (result) {
        this.router.navigate(['/setup']);
      }
    });
  }

  /**
  * Returns the specific setup of a session
  * @param session the session of which the setup is searched for
  */
  private getSetup(session: JSON) {
    if (!session) {
      return null;
    }
    for (let i = 0; i < this.setupList.length; i++) {
      if (this.setupList[i]['id'] === session['setup']) {
        return this.setupList[i];
      }
    }
    return null;
  }

  /**
  * Gets the percentage of how much of a session is finished using the CalcService
  * @param session the session of which the info is searched
  * @return the percentage
  */
  public createPercentFinishedInfo(session: JSON): number {
    return this.calcService.calcPercentFinished(this.getSetup(session), session);
  }

  /**
  * Gets the status of a session
  * @param session the session of which the status is searched
  * @return the status
  */
  public getStatus(session: JSON): String {
    return this.calcService.calcSessionStatus(this.getSetup(session), session);
  }

  /**
  * Makes a rest request to get the setups
  */
  private loadSetups() {
    this.setupList = [];
    this.loadServerData(List.SETUP, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'creationTime', 'iterations']}]
    , e => {
      this.setupList = [...this.setupList, ...e];
    }, e => {
      this.setupList = [...this.setupList];
      this.setDataValueIsReady('setups');
    }, this.restService);
  }

  private loadSessions() {
      this.sessionList = [];
      this.filteredSessions = [];
      this.loadServerData(List.SESSION, [Path.WITHOUT_BIG_DATA],
        [{ id: 'fields', val: ['id', 'name', 'iteration', 'finished', 'inProgress', 'setup']}]
      , e => {
        this.sessionList = [...this.sessionList, ...e];
      }, e => {
        this.sessionList = [...this.sessionList];
        this.filteredSessions = [...this.sessionList];
        this.filteredSessions = [...this.filteredSessions];
        this.setDataValueIsReady('sessions');
        this.loadSetups();
      }, this.restService);
  }

  constructor(private router: Router, public restService: RESTService, private calcService: CalcService, public deleteDialog: MatDialog,
    public createDialog: MatDialog, public spinner: NgxSpinnerService, public cd: ChangeDetectorRef) {
        super(restService, spinner, cd, ['sessions', 'setups']);
     }

  /**
  * Loads lists at initialisation
  */
  ngOnInit() {
    this.spinner.show();
    this.loadSessions();
  }

}
