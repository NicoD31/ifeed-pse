import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonService } from '../../Services/person.service';
import { RESTService, List, Path, IdFuncPair } from '../../Services/rest.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { EnumService } from '../../Services/enum.service';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-admin-setup-create',
  templateUrl: './admin-setup-create.component.html',
  styleUrls: ['./admin-setup-create.component.css']
})

/**
 * Component for the creation of a new Setup which is being done by the Admin.
 */
export class AdminSetupCreateComponent extends BaseComponent implements OnInit {

  // ===============================================Attributes===============================================

  /** Indicates if the Admin has selected a query strategy. */
  private queryNeeded: boolean;

  /** Shows the amount of subspaces the Admin has chosen. */
  private numberSubspaces: number;

  /** The Setup configuration file as a JSON object. */
  private setup: JSON;

  /** The Datasets currently stored in the database */
  private datasetList: JSON[];

  /** The parameters currently stored in the database */
  private paramList: JSON[];

  /** The values entered for each parameter */
  private paramValueList: number[];

  /** The classifiers currently stored in the database */
  private classifierList: JSON[];

  /** The querystrategies currently stored in the database */
  private queryStrategyList: JSON[];

  /** The form used to manage the input of the user */
  private setupForm: FormGroup;

  /** The feedbackModes currently available */
  private feedbackModes: JSON[];

  /** The historyMode currently available */
  private historyModes: JSON[];

  /** If a old setup is loaded, whether it was already finished */
  private wasFinished: boolean;

  /** The id provided by the routing path */
  private id: string;

  /** Message for displaying infos to the user */
  private message: string;

  // ===============================================Public Methods===============================================

  /**
  * Performs the submit of the FormGroup
  */
  public onSubmit() {
    // setup was already finished, so nothing to do
    if (this.wasFinished) {
      this.router.navigate(['/setup/detail/' + this.id]);
      return;
    }
    if (!this.validateSetup()) {
      return false;
    }

    this.spinner.show();
    this.rest.getServerData(List.DATASET, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [this.setupForm.controls.dataset.value] }]
      , data => {
        let index: number;
        this.datasetList.forEach(e => {
          if (e['id'] === this.setupForm.controls.dataset.value) {
            index = this.datasetList.indexOf(e);
          }
        });
        if (index == null || index === undefined) {
          this.message = 'Unknown error, during dataset handling.';
          this.spinner.hide();
          return;
        }
        this.datasetList[index] = <JSON>data;

        // set form values
        this.setup['name'] = this.setupForm.controls.name.value;
        this.setup['description'] = this.setupForm.controls.description.value;
        this.setup['params'] = {};
        if (this.setupForm.controls.C.value != null) {
          this.setup['params']['C'] = this.setupForm.controls.C.value;
        }
        if (this.setupForm.controls.gamma.value != null) {
          this.setup['params']['gamma'] = this.setupForm.controls.gamma.value;
        }
        this.setup['rawData'] = this.setupForm.controls.rawData.value;
        this.setup['rewindable'] = this.setupForm.controls.rewindable.value;
        this.setup['subspaceGrids'] = [];
        this.setup['iterations'] = this.setupForm.controls.iterations.value;
        this.setup['maxAnswerTime'] = this.setupForm.controls.maxAnswerTime.value;
        this.setup['dataset'] = this.setupForm.controls.dataset.value;
        const tmp = this.transformSubspaces(this.setupForm.controls.subspaces.value);
        if (!tmp) {
          this.spinner.hide();
          return;
        }
        this.setup['subspaces'] = tmp;
        this.setup['subspacesShown'] = tmp.length;
        this.setup['subspaceGrids'] = this.transformSubspaceGrids(this.setupForm.controls.subspacesGrids.value, tmp);
        const grids = this.normalizeSubspaceGrids(this.setup['subspaceGrids']);
        if (!grids) {
          this.message = 'Error occurd during normalizing the gridpoints';
          this.spinner.hide();
          return;
        }
        this.setup['subspaceGridsNormalized'] = grids;
        this.setup['feedbackMode'] = this.setupForm.controls.feedbackMode.value;
        this.setup['historyMode'] = this.setupForm.controls.historyMode.value;
        this.setup['queryStrategy'] = this.setupForm.controls.queryStrategy.value;
        this.setup['finishedCreation'] = this.setupForm.controls.finishedCreation.value;
        this.setup['classifier'] = this.setupForm.controls.classifier.value;

        this.createSetup();
      });
  }

  // ===============================================Private Methods===============================================

  /**
   * Validates the correctness of an entered Setup.
   * @return true if the Setup is valid, false if not.
   */
  private validateSetup(): boolean {
    if (this.setupForm.controls.name.value === '') {
      this.message = 'Name field may not left blank';
      return false;
    }
    if (this.setupForm.controls.name.value.length > 30) {
      this.message = 'Name to long. Maximum 30 symbols';
      return false;
    }
    if (!/\S/.test(this.setupForm.controls.name.value)) {
      this.message = 'Name must contain at least one non whitespace character';
      return false;
    }
    if (this.setupForm.controls.description.value === '') {
      this.message = 'Description field may not left blank';
      return false;
    }
    if (!/\S/.test(this.setupForm.controls.description.value)) {
      this.message = 'Description must contain at least one non whitespace character';
      return false;
    }
    if (this.setupForm.controls.C.value == null || this.setupForm.controls.C.value === undefined) {
      this.message = 'Parameter C may not left blank';
      return false;
    }
    if (this.setupForm.controls.C.value < 0 || this.setupForm.controls.C.value > 1) {
      this.message = 'Invalid value in Parameter C';
      return false;
    }
    if (this.setupForm.controls.gamma.value == null || this.setupForm.controls.gamma.value === undefined) {
      this.message = 'Parameter gamma may not left blank';
      return false;
    }
    if (this.setupForm.controls.gamma.value < 0) {
      this.message = 'Invalid value in Parameter gamma';
      return false;
    }
    if (!this.setupForm.controls.subspaces.value) {
      this.message = 'Subspaces may not be left blank';
      return false;
    }
    if (!this.checkSubspaces(this.setupForm.controls.subspaces.value)) {
      this.message = 'Invalid format in subspaces';
      return false;
    }
    if (!this.setupForm.controls.subspacesGrids.value) {
      this.message = 'Amount of gridpoints may not left blank';
      return false;
    }
    if (!this.checkSubspaceGrids(this.setupForm.controls.subspacesGrids.value)) {
      this.message = 'Invalid format in amount of gridpoints';
      return;
    }
    if (this.setupForm.controls.iterations.value == null || !Number.isInteger(this.setupForm.controls.iterations.value)) {
      this.message = 'Invalid format in amount of iterations';
      return false;
    }
    if (this.setupForm.controls.iterations.value < -1) {
      this.setupForm.controls.iterations.setValue(-1);
    }
    if (this.setupForm.controls.iterations.value === 0) {
      this.message = '0 is no valid amount of iterations';
      return false;
    }
    if (this.setupForm.controls.maxAnswerTime.value == null || !Number.isInteger(this.setupForm.controls.maxAnswerTime.value)) {
      this.message = 'Invalid format in maximum answertime';
      return false;
    }
    if (this.setupForm.controls.maxAnswerTime.value >= 0 && this.setupForm.controls.maxAnswerTime.value <= 4) {
      this.message = 'Maximum answertime in between 0 and 4 is not valid';
      return false;
    }
    if (this.setupForm.controls.maxAnswerTime.value < -1) {
      this.setupForm.controls.maxAnswerTime.setValue(-1);
    }
    if (!this.setupForm.controls.dataset.value) {
      this.message = 'Dataset has been left blank';
      return false;
    }
    if (!this.setupForm.controls.feedbackMode.value) {
      this.message = 'Feedbackmode has been left blank';
      return false;
    }
    if (!this.setupForm.controls.historyMode.value) {
      this.message = 'Historymode has been left blank';
      return false;
    }
    if (!this.setupForm.controls.queryStrategy.value) {
      this.message = 'Querystrategy has been left blank';
      return false;
    }
    if (!this.setupForm.controls.classifier.value) {
      this.message = 'Classifier has been left blank';
      return false;
    }
    this.message = '';
    return true;
  }

  /**
   * Creates a new Setup according to the entered configuration file.
   * @return true if the creation was successful, false if not.
   */
  private createSetup(): boolean {
    if (this.id !== '0') {
      this.spinner.show();
      this.rest.alterDataFromServer(List.SETUP, [Path.ITEM, Path.WITHOUT_BIG_DATA], this.setup
        , [{ id: 'id', val: [Number.parseInt(this.id)] }]).then(data => {
          this.router.navigate(['/setup']);
          this.spinner.hide();
          return true;
        });
    } else {
      // create a new setup
      const errorHandler: IdFuncPair[] = [
        {
        id: [400], func: err => {
          if (err['error']['name']) {
            this.message = err['error']['name'][0];
          } else {
            this.message = 'The server has rejected your request due to a bad request.';
          }
          this.spinner.hide();
          return false;
        }
      }];
      const date = new Date();
      this.setup['creationTime'] = Math.round((date.getTime() / 1000));
      this.spinner.show();
      this.rest.addDataToServer(List.SETUP, this.setup, errorHandler).then(data => {
        this.router.navigate(['/setup']);
        this.spinner.hide();
        return true;
      });
    }
    return false;
  }

  /**
   * Transforms the subspaces from an string, which matches a certain pattern, to a array
   * @param input the string which should be converted to an array
   * @returns array which contains the data extracted from the string
   */
  private transformSubspaces(input: string): any[] {
    // check syntax
    if (!this.checkSubspaces(input)) {
      this.message = 'Invalid format in subspaces';
      return;
    }
    const subspaces = input.split(';');
    let result: any[];
    result = [];
    // get the dataset
    let dataset: JSON;
    this.datasetList.forEach(e => {
      if (e['id'] === this.setup['dataset']) {
        dataset = e;
      }
    });
    if (!dataset) {
      this.message = 'Error during handling dataset while transforming subspaces';
      return;
    }
    for (let i = 0; i < subspaces.length; i++) {
      const tmp = subspaces[i].split(',');
      let tmpConv: any[];
      tmpConv = [];
      for (let j = 0; j < tmp.length; j++) {
        if (Number.parseInt(tmp[j]) < 1 || Number.parseInt(tmp[j]) > dataset['dataset']['titles'].length) {
          // subspaces must be between 1 and dim(dataset)
          this.message = 'Subspaces doesnt match the dimension of the dataset';
          return;
        }
        tmpConv.push(Number.parseInt(tmp[j]));
      }
      if (tmpConv[0] === tmpConv[1]) {
        // subspaces x and y may not be the same
        this.message = 'You may not select the same dimension for x and y axis of one subspace';
        return;
      }
      result.push(tmpConv);
    }
    return result;
  }

  /**
   * checks a string on validity for a subspace representation
   * @param input the string which should be checked
   * @return boolean: true: input is valid
   *                  false: input is not valid
   */
  private checkSubspaces(input: string): boolean {
    const digit = '[0-9]+';
    const subspace = digit + '[,]' + digit;
    const subspaces = input.split(';');
    for (let e of subspaces) {
      if (!e.match(new RegExp(subspace))) {
        return false;
      } else if (e.match(new RegExp(subspace + '[,]'))) {
        	return false;
      }
    }
    return true;
  }

  /**
   * Computes the subspaceGrids from an string, which contains the amount of points per axis
   * @param input the number which contains the amount of points per axis
   * @param subspaces number[]: the subspaces, for which the grid should be computed
   * @returns array which contains the data extracted from the string
   */
  private transformSubspaceGrids(input: number, subspaces: number[]): any[] {
    // check syntax
    if (!this.checkSubspaceGrids(input)) {
      this.message = 'Invalid format in amount of gridpoints';
      return;
    }

    let dataset: JSON;
    for (let set of this.datasetList) {
      if (set['id'] === this.setupForm.controls.dataset.value) {
        dataset = set;
      }
    }
    if (!dataset) {
      this.message = 'Unknown error occurd during selecting dataset';
      return;
    }
    const result = [];
    for (let k = 0; k < subspaces.length; k++) {// subspace
      const gridPoints = [];
      const minMaxArrX = dataset['normalizeFactor'][subspaces[k][0] - 1];
      const minMaxArrY = dataset['normalizeFactor'][subspaces[k][1] - 1];
      const amount = input;
      const scaleX = (minMaxArrX[1] - minMaxArrX[0]) / amount;
      const scaleY = (minMaxArrY[1] - minMaxArrY[0]) / amount;
      let i = minMaxArrX[0] - scaleX;
      for (let m = 0; m <= amount + 2; m++) {// x dimension
        let j = minMaxArrY[0] - scaleY;
        for (let l = 0; l <= amount + 2; l++) {// y dimension
          const point = [];
          point.push(this.alignNumber(i));
          point.push(this.alignNumber(j));
          gridPoints.push(point);
          j += scaleY;
        }
        i += scaleX;
      }
      result.push(gridPoints);
    }
    return result;
  }

  /**
   * Checks the correctness of an string for the syntax which is required for converting
   * @param input number which should be checked
   * @returns boolean: true: input is valid
   *                   false: input is not valid
   */
  private checkSubspaceGrids(input: number): boolean {
    if (!Number.isInteger(input)) {
      return false;
    }
    if (input <= 0) {
      return false;
    }
    return true;
  }

  /**
   * normalizes the subspaceGrids
   * @param input the subspaceGrids which should be normalized
   * @returns array, which contains the normalized subspaceGrids
   */
  private normalizeSubspaceGrids(input: any[]): any[] {
    if (!input) {
      return;
    }
    const result = [];
    // get the dataset
    let dataset: JSON;
    this.datasetList.forEach(e => {
      if (e['id'] === this.setup['dataset']) {
        dataset = e;
      }
    });
    if (!dataset) {
      return;
    }

    for (let i = 0; i < input.length; i++) {// subspace
      const tmpConv = [];
      for (let j = 0; j < input[i].length; j++) {// gridpoints
        const tmp = [];
        for (let k = 0; k < input[i][j].length; k++) {// [x,y] axis
          const subspace = this.setup['subspaces'][i];
          const dim = subspace[k];
          const min = dataset['normalizeFactor'][dim - 1][0];
          const max = dataset['normalizeFactor'][dim - 1][1];
          // normalize it
          let normGrid;
          if (max === min) {
            // all values in the dataset dimension are the same
            normGrid = 1;
          } else {
            normGrid = (input[i][j][k] - min) / (max - min);
            if (normGrid < 0.0 || normGrid < 0) {
              normGrid = 0;
            }
            if (normGrid > 1.0 || normGrid > 1) {
              normGrid = 1;
            }
            normGrid = this.alignNumber(normGrid);
            if (normGrid < 0.0000000000000001) {
              // correct to small numbers
              normGrid = 0;
            }
          }
          tmp.push(normGrid);
        }
        tmpConv.push(tmp);
      }
      result.push(tmpConv);
    }
    return result;
  }

  /**
   * Initializes the FormGroup setupForm with default values
   * @param id string, url-parameter from routing
   */
  private initFormGroup(id: string) {
    this.setupForm = this.formBuilder.group({
      name: new FormControl(''),
      description: new FormControl(''),
      C: new FormControl(0.0),
      gamma: new FormControl(0.0),
      rawData: new FormControl(false),
      rewindable: new FormControl(false),
      subspaces: new FormControl(''),
      subspacesGrids: new FormControl(''),
      iterations: new FormControl(-1),
      maxAnswerTime: new FormControl(-1),
      dataset: new FormControl(null),
      feedbackMode: new FormControl(null),
      historyMode: new FormControl(null),
      queryStrategy: new FormControl(null),
      finishedCreation: new FormControl(false),
      classifier: new FormControl(null)
    });

    if (id === '0') {
      // create a new setup
      this.setup = <JSON>{};
      this.setup['name'] = '';
      this.setup['description'] = '';
      this.setup['params'] = {};
      this.setup['rawData'] = false;
      this.setup['rewindable'] = false;
      this.setup['subspacesShown'] = null;
      this.setup['subspaces'] = [];
      this.setup['subspaceGrids'] = [];
      this.setup['iterations'] = -1;
      this.setup['maxAnswerTime'] = -1;
      this.setup['creationTime'] = 0;
      this.setup['dataset'] = null;
      this.setup['feedbackMode'] = null;
      this.setup['historyMode'] = null;
      this.setup['creator'] = this.person.getId();
      this.setup['queryStrategy'] = null;
      this.setup['finishedCreation'] = false;
      this.setup['sessions'] = [];
      this.setup['classifier'] = null;
      this.wasFinished = false;
    } else {
      // load an already existing setup
      this.rest.getServerData(List.SETUP, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [id] }], data => {
        this.wasFinished = data['finishedCreation'];
        this.setup = <JSON>data;
        if (this.wasFinished) {
          for (let a in this.setupForm.controls) {
            this.setupForm.controls[a].disable();
            this.setupForm.controls[a].setValidators(Validators.required);
          }
          this.setupForm.controls.C.disable();
          this.setupForm.controls.C.setValidators(Validators.required);
          this.setupForm.controls.gamma.disable();
          this.setupForm.controls.gamma.setValidators(Validators.required);
        }
        // fill in values fetched from backend
        for (let a in this.setupForm.controls) {
          this.setupForm.controls[a].setValue(this.setup[a]);
        }
        this.setupForm.controls.C.setValue(this.setup['params']['C']);
        this.setupForm.controls.gamma.setValue(this.setup['params']['gamma']);
        this.setupForm.controls.subspaces.setValue(this.subspacesToString(this.setup['subspaces']));
        let i = 0;
        while (this.setup['subspaceGrids'][0][i][1] < this.setup['subspaceGrids'][0][i + 1][1]) {
          i++;
        }
        i -= 2;
        this.setupForm.controls.subspacesGrids.setValue(i);
      });
    }
  }

  /**
   * Method for converting a 2D-Array containt the subspaces into a string for displaying it
   * @param arr The 2D-Array which should be converted
   * @returns string: the string representation of the subspace array. second dimension divided by ',' first dimension divided by ';'
   */
  private subspacesToString(arr: [][]): string {
    let subspaces = '';
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        subspaces += arr[i][j] + ',';
      }
      subspaces = subspaces.slice(0, subspaces.length - 1);
      subspaces += ';';
    }
    subspaces = subspaces.slice(0, subspaces.length - 1);
    return subspaces;
  }

  /**
   * aligns a number, so it machtes the format given by the backend (max 30 digits, max 20 after decimal)
   * @param num number to be aligned
   * @returns number, which has nearly the same value but matches the backend specs
   */
  private alignNumber(num: number): number {
    let tmp = Number.parseFloat(num.toString().slice(0, 30));
    const decimal = tmp.toString().split('.');
    tmp = decimal[1] ? Number.parseFloat(decimal[0] + '.' + decimal[1].slice(0, 20)) : Number.parseFloat(decimal[0]);
    return tmp;
  }

  // ===============================================Getter & Setter===============================================

  /**
   * Getter for the attribute setupForm
   * @returns FormGroup: attribute setupForm
   */
  public getSetupForm(): FormGroup {
    return this.setupForm;
  }

  /**
   * Getter for the attribute datasetList
   * @returns JSON[]: copy of the attribute datasetList
   */
  public getDatasetList(): JSON[] {
    return this.datasetList;
  }

  /**
   * Getter for the attribute feedbackModes
   * @returns JSON[]: copy of the attribute feedbackModes
   */
  public getFeedbackModes(): JSON[] {
    return this.feedbackModes;
  }

  /**
   * Getter for the attribute historyModes
   * @returns JSON[]: copy of the attribute historyModes
   */
  public getHistoryModes(): JSON[] {
    return this.historyModes;
  }

  /**
   * Getter for the attribute queryStrategyList
   * @returns JSON[]: copy of the attribute queryStrategyList
   */
  public getQueryStrategyList(): JSON[] {
    return this.queryStrategyList;
  }

  /**
   * Getter for the attribute classifierList
   * @returns JSON[]: copy of the attribute classifierList
   */
  public getClassifierList(): JSON[] {
    return this.classifierList;
  }

  /** Getter for the attribute id
   * @returns string: the attribute id
   */
  public getRouteId(): string {
    return this.id;
  }

  /**
   * Getter for the attribute message
   * @returns string: the attribute message
   */
  public getMessage(): string {
    return this.message;
  }

  /**
   * Setter for the attribute message
   * @param ms string: the new value for the attribute message
   */
  public setMessage(ms: string) {
    this.message = ms;
  }

  /**
   * Getter for the attribute wasFinished
   * @returns boolean: the attribute wasFinished
   */
  public getWasFinished(): boolean {
    return this.wasFinished;
  }

  /**
   * Getter for the attribute setup
   * @returns JSON: the attribute setup
   */
  public getSetup(): JSON {
    return this.setup;
  }

// ===============================================Constructor & ngOnInit===============================================

  constructor(private router: Router, private person: PersonService, private rest: RESTService
    , private formBuilder: FormBuilder, public route: ActivatedRoute, public spinner: NgxSpinnerService
    , private enumService: EnumService, public cd: ChangeDetectorRef) {
    super(rest, spinner, cd, ['param', 'dataset', 'classifier', 'query']);
  }

  ngOnInit() {
    // initialize values
    this.paramValueList = [];
    this.datasetList = [];
    this.paramList = [];
    this.classifierList = [];
    this.queryStrategyList = [];
    this.numberSubspaces = 0;
    this.feedbackModes = this.enumService.getFeedbackModes();
    this.historyModes = this.enumService.getHistoryModes();
    this.message = '';

    // get url parameter
    this.id = this.route.snapshot.paramMap.get('id');

    this.spinner.show();
    // get parameters from database
    this.loadServerData(List.PARAM, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'regex'] }]
      , e => {
        this.paramList = [...this.paramList, ...e];
      }, e => {
        this.paramValueList = [this.paramList.length];
        this.setDataValueIsReady('param');
        if (this.isDataRdy()) {
          this.spinner.hide();
        }
      }, this.rest);

    // get classifiers from database
    this.loadServerData(List.CLASSIFIER, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name', 'params'] }]
      , e => {
        this.classifierList = [...this.classifierList, ...e];
      }, e => {
        this.setDataValueIsReady('classifier');
        if (this.isDataRdy()) {
          this.spinner.hide();
        }
      }, this.rest);

    // get queryStrategys from database
    this.loadServerData(List.QUERY, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name'] }]
      , e => {
        this.queryStrategyList = [...this.queryStrategyList, ...e];
      }, e => {
        this.setDataValueIsReady('query');
        if (this.isDataRdy()) {
          this.spinner.hide();
        }
      }, this.rest);

    // get datasets from database
    this.loadServerData(List.DATASET, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'name'] }]
      , e => {
        this.datasetList = [...this.datasetList, ...e];
      }, e => {
        this.setDataValueIsReady('dataset');
        if (this.isDataRdy()) {
          this.spinner.hide();
        }
      }, this.rest);

    // initialize fromgroup
    this.initFormGroup(this.id);
  }

}
