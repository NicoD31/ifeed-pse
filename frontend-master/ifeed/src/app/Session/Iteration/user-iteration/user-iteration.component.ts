import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RESTService, List, Path } from '../../../Services/rest.service';
import { PlotService } from '../../../Services/plot.service';
import { ChangeDetectorRef } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { EnumService } from '../../../Services/enum.service';
import { BaseComponent } from '../../../base.component';

@Component({
  selector: 'app-user-iteration',
  templateUrl: './user-iteration.component.html',
  styleUrls: ['./user-iteration.component.css']
})
/**
  Represents an iteration in a Session, executed by a User.
*/
export class UserIterationComponent extends BaseComponent implements OnInit, OnDestroy {


  /** Placeholder string for the backend */
  public static readonly EMPTY = 'EMPTY';

  /** Indicates if the User has selected a point (only needed in self choosing feedback mode).*/
  private isPointSelected: boolean;

  /** Indicates if the User has done an evaluation of a datapoint. */
  private isPointLabeled: boolean;

  /** The session which is currently worked on */
  private session: any;

  /** setup this session is configured with */
  private setup: any;

  /** data set this session is working with */
  private dataset: any;

  /** The most recent response of the OcalAPI */
  private ocal: any;

  /** Increments the time in progress every second */
  private counter: Subscription;

  /** Minutes in progress which are displayed */
  private minutes: number;

  /** Seconds in progress which are displayed */
  private seconds: number;

  /** If the user already rewinded to this iteration */
  private rewinded: boolean;

  /** Number of dimension of the dataset */
  private dim: number;

  /** Contains the indicies of the selected points */
  private selectedPoints: number[];

  /** Contains the chosen Lables of the selected points */
  private selectedLabels: string[];

  /** Contains the chosen labels from the previous iteration */
  private previousLabels: string[];

  /** Contains the indices of the selected point from the previous iteration */
  private previousPoints: number[];

  /** The already plotted heatmaps of the current iteration */
  private heatmaps: string[];

  /** The subscription to the selectedPoint in the Heatmap */
  private subscribtion: Subscription;

  /** Time passed doing the current iteration */
  private iterationTime = 0;

  private subspaceStrings: string[];

  private displayedSubspace: string;

  constructor(private router: Router, private route: ActivatedRoute, public restService: RESTService,
    private plotService: PlotService, public cd: ChangeDetectorRef, public spinner: NgxSpinnerService, private enumService: EnumService) {
    super(restService, spinner, cd, ['everything']);
  }

  /**
    Getter method for the subspaceStrings, which represent the names of the two dimensions of a subspace.
    @return array of strings containing dim x dim strings.
  */
  public getSubspaceStrings(): string[] {
    return this.subspaceStrings;
  }
  /**
    Getter method for the setup.
    @return setup of the session.
  */
  public getSetup(): JSON {
    return this.setup;
  }

  /**
    Getter method for the session.
    @return current session
  */
  public getSession(): JSON {
    return this.session;
  }

  /**
    Getter for the minutes already passed doing this session.
    @return minutes, which passed doing the session
  */
  public getMinutes(): number {
    return this.minutes;
  }

  /**
    Getter for the seconds already passed doing this session.
    @return seconds, which passed doing the session
  */
  public getSeconds(): number {
    return this.seconds;
  }

  /**
    Getter for the time passed doing the current iteration.
    @return time passed in seconds.
  */
  public getIterationTime(): number {
    return this.iterationTime;
  }

  /**
    Getter for the maximum number of heatmaps.
    @return the amount of subspaces of this session.
  */
  public getDimension(): number {
    return this.dim;
  }

  /**
    Getter for rewinded
    @return true if already rewinded, else false
  */
  public didRewind(): boolean {
    return this.rewinded;
  }

  /**
    Returns if a point is currently labled.
    @return if a point is curretly labled
  */
  public isLabeled(): boolean {
    return this.isPointLabeled;
  }

  /**
    Returns whether a point is selected.
    @return whether a point is selected
  */
  public isSelected(): boolean {
    return this.isPointSelected;
  }

  /**
    Getter for the object containing the response of the ocal api.
    @return response of ocal api.
  */
  public getOcal(): JSON {
    return this.ocal;
  }

  /**
    Getter for the dataset.
    @return dataset object
  */
  public getDataset(): JSON {
    return this.dataset;
  }

  /**
    Getter for the currently selected points.
    @return array of selected points
  */
  public getSelectedPoints(): number[] {
    return this.selectedPoints;
  }

  /**
    Getter for the currently selected lables. Can contain 'U', 'LIN', 'LOUT'.
    @return array of selected labels
  */
  public getSelectedLabels(): string[] {
    return this.selectedLabels;
  }

  /**
    Getter for the Heatmaps for the current iteration, not yet generated entries are set to 'EMPTY'.
    @return array of json heatmap objects stringified.
  */
  public getHeatmaps(): string[] {
    return this.heatmaps;
  }

  /**
    Resets all values specific to one iteration to their default value
  */
  private resetIterationData() {
    this.iterationTime = 0;
    this.isPointLabeled = false;
    this.isPointSelected = false;
    this.selectedPoints = [];
    this.selectedLabels = [];
    this.heatmaps = Array.apply(null, Array(this.setup.subspacesShown)).map(() => UserIterationComponent.EMPTY);
  }

  /**
    Increments the time in progress every second
  */
  private timestep() {
    this.session.inProgress++;
    this.minutes = Math.floor(this.session.inProgress / 60);
    this.seconds = this.session.inProgress - this.minutes * 60;
    this.iterationTime++;
    // whether the time is over, in case maxAnswerTime == -1 it is never met.
    if (this.iterationTime === this.setup.maxAnswerTime) {
      const diff = this.selectedPoints.length - this.selectedLabels.length;
      if (diff > 0) {
        for (let i = this.selectedPoints.length - diff; i < this.selectedPoints.length; i++) {
          this.selectedLabels.push(this.enumService.labelToUserLabel(this.ocal.ocal.prediction_global[this.selectedPoints[i]]));
        }
      }
      this.continue(false);
    }
  }

  /**
    Saves the data from the current iteration and gets data for the new iteration from the OcalAPI.
   */
  private saveDataAndOcal() {
    this.counter.unsubscribe();
    this.spinner.show();
    this.restService.alterDataFromServer(List.SESSION, [Path.OCAL, Path.WITH_BIG_DATA],
      this.session, [{ id: 'id', val: [this.session.id] }]).then(data => {
        this.ocal = data['body'];
        if (this.ocal.ocal.detail !== undefined) { // OcalAPI didn't respond
          this.router.navigate(['/usermain']);
          alert('OcalAPI: ' + this.ocal.ocal.detail);
        } else if (this.ocal.ocal.error) { // error in OcalAPI
          this.router.navigate(['/usermain']);
          alert('OcalAPI: ' + this.ocal.ocal.error);
        } else {
          this.showHeatmap(this.subspaceStrings.indexOf(this.displayedSubspace));
          this.session.finalLabels = [...this.ocal.ocal.prediction_global];
          this.cd.markForCheck();
          this.spinner.hide();
          this.counter = interval(1000).subscribe(() => this.timestep());
        }
      });
  }

  /**
    plots the subspace with the given index.
    @param index index of the subspace to display in the subspace list of the setup.
    @return whether it was successfull
  */
  public showHeatmap(index: number): boolean {
    if (index === null || index === undefined || index < 0 || index >= this.setup.subspacesShown
      || !this.ocal || !this.setup || !this.dataset) {
      return false;
    }
    let heatmap: JSON;
    heatmap = this.plotService.generateHeatmap(this.dataset, this.setup,
      [...this.ocal.ocal.prediction_subspaces[index]], [...this.setup.subspaces[index]],
      this.ocal.ocal.query_ids[0], [...this.ocal.ocal.score_subspace_grids[index]],
      [...this.setup.subspaceGrids[index]]);
    if (this.heatmaps[index] === UserIterationComponent.EMPTY) {
      this.heatmaps[index] = JSON.stringify(heatmap);
    }
    return true;
  }

  /**
    Continues the Session with the next iteration, if a point has been selected and labled.
    @param finish whether this should be the lasst iteration
    @return whether the continue was successfull
  */
  public continue(finish: boolean): boolean {
    if (this.selectedPoints.length === 0 || this.selectedLabels.length === 0 || this.heatmaps.length === 0) {
      return false;
    }
    this.iterationTime = 0;
    this.session.userlabelMatchesAPI.push(this.calculateMatches());
    this.session.history.push(this.selectedPoints);
    this.previousPoints = [...this.selectedPoints];
    this.previousLabels = [];
    for (let i = 0; i < this.selectedPoints.length; i++) {
      this.previousLabels.push(this.session.labels[this.selectedPoints[i]]);
      this.session.labels[this.selectedPoints[i]] = this.selectedLabels[i];
    }
    this.session.heatmaps = [...this.session.heatmaps, this.heatmaps];
    if (finish || this.session.iteration >= this.setup.iterations && this.setup.iterations !== -1) { // finish the session
      this.session.finished = true;
      // Save data to the backend
      this.restService.alterDataFromServer(List.SESSION, [Path.ITEM, Path.WITH_BIG_DATA],
        this.session, [{ id: 'id', val: [this.session.id] }]);
      this.router.navigate(['/session/detail/' + this.session.id]);
    } else { // continue the session
      this.session.iteration++;
      this.saveDataAndOcal();
      this.rewinded = false;
      this.resetIterationData();
    }
    return true;
  }

  /**
    Lets the user redo the last iteration. Therefore undos the changes from the last iteration.
    @return whether the rewind was successfull
  */
  public rewind(): boolean {
    if (this.rewinded || !this.setup.rewindable || this.session.iteration < 2) {
      return false;
    }
    this.rewinded = true;
    this.session.rewinds++;
    this.session.iteration--;
    this.session.history.pop();
    this.session.userlabelMatchesAPI.pop();
    for (let i = 0; i < this.selectedPoints.length; i++) {
      this.session.labels[this.previousPoints[i]] = this.previousLabels[i];
    }
    this.session.heatmaps.pop();
    this.saveDataAndOcal();
    this.rewinded = true;
    this.resetIterationData();
    return true;
  }

  /**
    Selects a label to a selected point.
    @param label one of the dened labels: inlier, outlier and u for default value.
    @return whether the label was set successfully
  */
  public selectLabel(index: number): boolean {
    const labels = this.enumService.getLabels();
    if (index === null || index === undefined || index < 0 || index >= labels.length) {
      return false;
    }
    const label = labels[index]['value']['user'];
    if (this.selectedLabels === []) {
      this.selectedLabels.push(label);
    } else {
      this.selectedLabels[0] = label;
    }
    this.isPointLabeled = true;
    return true;
  }

  /**
    calculates whether the user labeled the selected points the same as the OcalAPI
    @return array of boolean, with true if they matched false if not.
  */
  private calculateMatches(): boolean[] {
    const matches: boolean[] = [];
    for (let i = 0; i < this.selectedPoints.length; i++) {
      matches.push(this.selectedLabels[i] === this.enumService.getLabels()[1]['value'].user
        && this.session.finalLabels[this.selectedPoints[i]] === this.enumService.getLabels()[1]['value'].final
        || this.selectedLabels[i] === this.enumService.getLabels()[2]['value'].user
        && this.session.finalLabels[this.selectedPoints[i]] === this.enumService.getLabels()[2]['value'].final);
    }
    return matches;
  }

  /**
    Checks if the type of the dataset matches the given string.
    @param input string to compare to the type of the dataset
    @return whether type of the dataset equals the given string
  */
  public dataRdyTypename(dataset: JSON, input: string): boolean {
    return (dataset && dataset['typename'] && dataset['typename'] === input);
  }

  /**
    Is invoked when the component is generated.
    Gets all the neccessary data for the initionalisation from the backend. Initializes the data for the iteration.
  */
  ngOnInit() {
    this.spinner.show();
    // To stop Users from rewinding when they reopen a Session.
    this.rewinded = true;
    const id = this.route.snapshot.paramMap.get('id');

    // Request for sessiondata
    this.restService.getServerData(List.SESSION, [Path.ITEM, Path.WITH_BIG_DATA], [{ id: 'id', val: [id] }],
      sessionData => {
        this.session = sessionData;
        if (this.session.iteration > 0) {
          this.session.pauses++;
        } else {
          this.session.iteration = 1;
        }

        // Request for setupdata
        this.restService.getServerData(List.SETUP, [Path.ITEM, Path.WITH_BIG_DATA], [{ id: 'id', val: [this.session.setup] }],
          setupData => {
            this.setup = setupData;
            this.dim = this.setup.subspacesShown;
            this.resetIterationData();
            this.cd.markForCheck();

            // Request for dataSet
            this.restService.getServerData(List.DATASET, [Path.ITEM, Path.WITH_BIG_DATA], [{ id: 'id', val: [this.setup.dataset] }],
              datasetData => {
                this.dataset = datasetData;
                this.subspaceStrings = [];
                for (let i = 0; i < this.setup.subspacesShown; i++) {
                  const subspace = this.setup.subspaces[i];
                  this.subspaceStrings.push(this.dataset.dataset.titles[subspace[0] - 1]
                    + ' x ' + this.dataset.dataset.titles[subspace[1] - 1]);
                }
                this.displayedSubspace = this.subspaceStrings[0];

                // Ocal-API request
                this.restService.getServerData(List.SESSION, [Path.OCAL, Path.WITH_BIG_DATA], [{ id: 'id', val: [id] }],
                  ocalData => {
                    this.ocal = ocalData;
                    if (this.ocal.ocal.detail !== undefined) { // OcalAPI didn't respond
                      this.router.navigate(['/usermain']);
                      alert('OcalAPI: ' + this.ocal.ocal.detail);
                    } else if (this.ocal.ocal.error) { // error in OcalAPi
                      this.router.navigate(['/usermain']);
                      alert('OcalAPI: ' + this.ocal.ocal.error);
                    } else { // OcalAPI responded normally
                      this.setDataValueIsReady('everything');
                      this.cd.markForCheck();
                      this.spinner.hide();
                      this.counter = interval(1000).subscribe(() => this.timestep());
                      this.showHeatmap(0);
                    }
                    // Observe the index of the point selected on the heatmap
                    this.subscribtion = this.plotService.pointIndex.subscribe(value => {
                      if (value !== undefined && value !== null && value >= 0 && value < this.dataset.rawData.length) {
                        this.selectedPoints[0] = value;
                        this.isPointSelected = true;
                      }
                      this.cd.markForCheck();
                    });
                  }); // End of ocal
              }); // End of dataset
          }); // End of setup
      }); // End of session
  }

  /**
    Is invoked when the component is destroyed. Unsubscribes from observables.
  */
  ngOnDestroy() {
    if (this.counter !== undefined) {
      this.counter.unsubscribe();
    }
    if (this.subscribtion !== undefined) {
      this.subscribtion.unsubscribe();
    }
  }
}
