import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonService } from '../../Services/person.service';
import { RESTService, List, Path } from '../../Services/rest.service';
import { CalcService } from '../../Services/calc.service';
import { PlotService } from '../../Services/plot.service';
import { SessionStatus } from '../../Utility/SessionStatus';
import { DeletionDialogComponent } from '../../Utility/deletion-dialog/deletion-dialog.component';
import { MatDialog } from '@angular/material';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';


@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.css']
})

/**
 * Component for the detailed view of a Session. Provides information to this Session if its
 * active, when its finished a detailed summary is shown.
*/
export class SessionDetailComponent extends BaseComponent implements OnInit {
  /** The JSON object containing all data to this Session. */
  private session: any;

  /** The Setup configuration file for this Session.*/
  private setup: any;
  private message: String;
  private name: String;
  private iterationSummary = JSON;
  private totalTime: number;
  private currentIteration: number;
  private averageTime: number;
  private pauses: number;
  private heatmaps: JSON[][];
  private status: String;
  private ocalLable: String[];
  private ocalLoading = false;
  private groundTruthLable: String[];
  private ocalName = 'Ocal';
  private gtName = 'Groundtruth';

  /**
   * gets the setup
   * @return returns the setup
   */
  public getSetup() {
    return this.setup;
  }

  /**
   * gets the session
   * @return returns the session
   */
  public getSession() {
    return this.session;
  }

  /**
   * gets the message
   * @return returns the message
   */
  public getMessage() {
    return this.message;
  }

  /**
   * gets the name
   * @return returns the name
   */
  public getName() {
    return this.name;
  }

  /**
   * gets the iterationSummary
   * @return returns the iterationSummary
   */
  public getIterationSummary() {
    return this.iterationSummary;
  }

  /**
   * gets the totalTime
   * @return returns the totalTime
   */
  public getTotalTime() {
    return this.totalTime;
  }

  /**
   * gets the currentIteration
   * @return returns the currentIteration
   */
  public getCurrentIteration() {
    return this.currentIteration;
  }

  /**
   * gets the averageTime
   * @return returns the averageTime
   */
  public getAverageTime() {
    return this.averageTime;
  }


  /**
   * gets the number of pauses
   * @return returns the pauses
   */
  public getPauses() {
    return this.pauses;
  }

  /**
   * gets the heatmaps
   * @return returns the heatmaps
   */
  public getHeatmaps() {
    return this.heatmaps;
  }

  /**
   * gets the status
   * @return returns the status
   */
  public getStatus() {
    return this.status;
  }

  /**
   * gets the ocalLabel
   * @return returns the ocalLable
   */
  public getOcalLabel() {
    return this.ocalLable;
  }

  /**
   * returns if ocal is loadng
   * @return returns ocalLoading
   */
  public getOcalLoading() {
    return this.ocalLoading;
  }

  /**
   * gets the groundTruthLabel
   * @return returns the groundTruthLable
   */
  public getGroundTruthLabel() {
    return this.groundTruthLable;
  }

  /**
   * gets the name for graph in comparision with ocal data
   * @return returns the ocalName
   */
  public getOcalName() {
    return this.ocalName;
  }

  /**
   * gets the name for graph in comparision with groudtruth data
   * @return returns the gtName
   */
  public getGroundTruthName() {
    return this.gtName;
  }

  /**
  *  Deletes a Session from the system.
  */
  public deleteSession() {
    // open dialog for session deletion
    const dialogRef = this.dialog.open(DeletionDialogComponent, {
      data: {
        session: this.session,
        isSetup: false,
        isSession: true,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // result of dialog
      if (result) {
        // Session will be deleted
        this.restService.deleteDataFromServer(List.SESSION, [Path.ITEM], [{ id: 'id', val: [this.session['id']] }]).then(data => {
          this.message = 'Session ' + this.session['name'] + ' deleted succesfully';
          this.router.navigate(['/session']);
        }, err => {
          alert(err.status);
        });
      } else {
        // Session will not be deleted
        return false;
      }
    });
  }

  /**
  * returns weather or not this session is finished
  * @return false if finished, true if not
  */
  public isNotFinished(): boolean {
    if (this.setup) {
      const percentFinished = this.calcService.calcPercentFinished(this.setup, this.session);
      const finish = (percentFinished === 100) ? false : true;
      return finish;
    } else {
      return null;
    }
  }

  /**
  * Gets the percentage of how much of a session is finished using the CalcService
  * @param session the session of which the info is searched
  * @return the percentage
  */
  public createPercentFinishedInfo(session: JSON): number {
    let finishedInfo = 0;
    if (this.session && this.setup) {
      finishedInfo = this.calcService.calcPercentFinished(this.setup, session);
    } else {
      return -1;
    }
    return finishedInfo;
  }

  public makeGroundtruthPlot() {
    if (!this.isNotFinished()) {
      if (this.groundTruthLable && this.groundTruthLable.length !== 0) {
        const tmp = this.plotService.makeBarChart(this.session['finalLabels'], this.groundTruthLable, this.gtName);
        if (!tmp) {
          this.message = 'Failed to compare, the data might not be correct';
        }
      } else {
        this.message = 'Failed to compare, the data might not be correct';
      }
    }
  }

  public makeOcalPlot() {
    if (!this.isNotFinished()) {
      if (this.ocalLable && this.ocalLable.length !== 0) {
        const tmp = this.plotService.makeBarChart(this.session['finalLabels'], this.ocalLable, this.ocalName);
        if (!tmp) {
          this.message = 'Failed to compare, the data might not be correct';
        }
      } else {
        this.message = 'Failed to compare, connection to ocal migth have failed';
      }
    }
  }

  /**
    Checks if the current Person is an Admin.
    @return true if the Person is an Admin, false if not.
  */
  public isAdmin(): boolean {
    return this.personService.isAdmin();
  }

  /**
  * Checks if the session has been started
  * @return true if session has been started, false if not
  */
  public isStarted(): boolean {
    const started = (this.status === SessionStatus.NOT_STARTED) ? false : true;
    return started;
  }

  constructor(private plotService: PlotService, private route: ActivatedRoute, private calcService: CalcService, private router: Router,
    private personService: PersonService, public restService: RESTService, public dialog: MatDialog, public cd: ChangeDetectorRef,
    public spinner: NgxSpinnerService) {
    super(restService, spinner, cd, ['session', 'setup', 'groundtruth']);
  }

  /**
  * Loads lists at initialisation
  */
  ngOnInit() {
    this.ocalLable = [];
    this.groundTruthLable = [];
    this.spinner.show();
    this.loadSession();
  }

  private loadSession() {
    const idData = this.route.snapshot.paramMap.get('id');
    this.restService.getServerData(List.SESSION, [Path.ITEM], [{ id: 'id', val: [idData]}]
    , sessionData => {
      this.session = sessionData;
      this.name = this.session['name'];
      this.totalTime = this.session['inProgress'];
      this.currentIteration = this.session['iteration'];
      this.averageTime = this.calcService.calcAverageTimeIteration(this.session);
      this.pauses = this.session['pauses'];
      this.heatmaps = this.session['heatmaps'];
      this.setDataValueIsReady('session');
      this.loadSetup();
    });
  }

  private loadSetup() {
    this.restService.getServerData(List.SETUP, [Path.ITEM], [{ id: 'id',
    val: [this.session['setup']]}]
    , setupData => {
      this.setup = setupData;
      this.status = this.calcService.calcSessionStatus(this.setup, this.session);
      this.setDataValueIsReady('setup');
      this.loadDataset();
    });
  }

  public loadOcal() {
    this.ocalLoading = true;
    this.restService.getServerData(List.SETUP, [Path.OCAL], [{ id: 'id', val: [this.setup['id']]}]
    , ocalData => {
      this.ocalLable = ocalData['ocal']['prediction_global'];
      this.ocalLoading = false;
      this.makeOcalPlot();
    });
  }

  private loadDataset() {
    this.restService.getServerData(List.DATASET, [Path.ITEM], [{ id: 'id', val: [this.setup['dataset']]}]
    , datasetData => {
      for (let i in datasetData['groundtruth']) {
        this.groundTruthLable.push(datasetData['groundtruth'][i]);
      }
      this.setDataValueIsReady('groundtruth');
      if (this.isDataRdy()) {
       this.spinner.hide();
       this.cd.markForCheck();
      }
    });
  }

}
