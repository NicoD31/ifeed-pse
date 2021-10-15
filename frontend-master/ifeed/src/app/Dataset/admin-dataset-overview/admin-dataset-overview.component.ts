import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RESTService, List, Path, IdFuncPair } from '../../Services/rest.service';
import { CalcService } from '../../Services/calc.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JSONHandlerService } from '../../Services/jsonhandler.service';
import { DeletionDialogComponent } from '../../Utility/deletion-dialog/deletion-dialog.component';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';
import { DatasetDialogComponent } from '../../Utility/dataset-dialog/dataset-dialog.component';


@Component({
  selector: 'app-admin-dataset-overview',
  templateUrl: './admin-dataset-overview.component.html',
  styleUrls: ['./admin-dataset-overview.component.css']
})

/**
 * Component for the Dataset management page. This page gives an logged in Admin the
 * possibility to manage (upload/delete/import groundtruth/view) all Datasets.
 */
export class AdminDatasetOverviewComponent extends BaseComponent implements OnInit {

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

// ===============================================Attributes===============================================

  /** List of all JSONs, with each representing a Dataset. Every Dataset is represented only once. */
  private datasetList: JSON[];

  /** List used for displaying the datasets (used for filtering) */
  private displayList: JSON[];

  /** Message which will be displayed */
  private message: string;

  /** Message which will be displayed on success */
  private successMessage: string;

  /** Attribute for temporary store the groundtruth */
  private groundtruth: string[];

  /** The dataset which is being uploaded */
  private dataset: JSON;

  /** The rawData which is currently selected */
  private rawData: JSON[];

  /** The list which contains the datasettypes */
  private typeList: JSON[];

  /** The formGroup for handling user input */
  private datasetForm: FormGroup;

  /** Temporary store the normalizeFactors */
  private normalizeFactors: any[];

  private datasetForNormalize: JSON;

// ===============================================Public Methods===============================================

  /**
   * Opens a dialog, so the User can select a Dataset-file on his computer. Adds this Dataset to the
   * datasetList and sends it via RESTService to the server.
   * @return true: upload was successful and Dataset has been send to the server.
   * false: An error occured during the uploading process.
   */
  public uploadDataset(): boolean {
    this.spinner.show();
    if (!this.validateDataset()) {
      this.spinner.hide();
      return false;
    }
    if (this.dataset['titles'][0] === 'id') {
      this.dataset['preInformation'] = this.dataset['preInformation'].splice(1, this.dataset['preInformation'].length);
      this.dataset['titles'] = this.dataset['titles'].splice(1, this.dataset['titles'].length);
      this.dataset['values'] = this.dataset['values'].splice(1, this.dataset['values'].length);
    }

    const datasetJSON = <JSON>{};
    datasetJSON['name'] = this.datasetForm.controls.name.value;
    datasetJSON['type'] = this.datasetForm.controls.type.value;
    datasetJSON['description'] = this.datasetForm.controls.description.value;
    datasetJSON['dataset'] = this.dataset;
    datasetJSON['datasetNormalized'] = this.normalizeDataset(this.datasetForNormalize);
    datasetJSON['rawData'] = this.rawData;
    datasetJSON['groundtruth'] = {};
    datasetJSON['normalizeFactor'] = this.normalizeFactors;

    const errorHandler: IdFuncPair[] = [
      {
      id: [400], func: err => {
        if (err['error']['name']) {
          this.message = err['error']['name'][0];
        } else {
          this.message = 'The server has rejected your request due to a bad request.';
        }
        this.successMessage = '';
        this.spinner.hide();
        return false;
      }
    }];
    this.rest.addDataToServer(List.DATASET, datasetJSON, errorHandler).then(data => {
      this.datasetList.push(data['body']);
      this.displayList = this.datasetList;
      this.successMessage = 'Dataset uploaded successfully';
      this.message = '';
      this.cd.markForCheck();
      this.dataset = null;
      this.rawData = null;
      this.datasetForm.controls.name.setValue(null);
      this.datasetForm.controls.type.setValue(null);
      this.datasetForm.controls.description.setValue(null);
      this.spinner.hide();
      return true;
    });
    return false;
  }

  /**
   * Opens a file-explorer, so the User can select a groundtruth-file. Adds this groudtruth to the corresponding Dataset and
   * uploads it via the RESTService to the server.
   * @param dataset: The name of the Dataset to which a groundtruth should be imported.
   * @return true: if the upload-process was successful and the groundtruth has been send to the server
   * false: if an error occured during the upload-process.
   */
  public importGroundTruth(id: number): boolean {
    let dataset: JSON;
    if (this.groundtruth == null || this.groundtruth === undefined) {
      this.message = 'Error, no groundtruth-file selected';
      this.successMessage = '';
      return false;
    }
    this.spinner.show();
    this.rest.getServerData(List.DATASET, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [id] }], data => {
      dataset = <JSON>data;
      dataset['groundtruth'] = this.groundtruth;
      this.rest.alterDataFromServer(List.DATASET, [Path.ITEM, Path.WITHOUT_BIG_DATA], dataset, [{ id: 'id', val: [id] }]).then(datum => {
        this.successMessage = 'Groundtruth added successfully to dataset ' + dataset['name'];
        this.message = '';
        for (let set of this.datasetList) {
          if (set['id'] === id) {
            set['groundtruth'] = this.groundtruth;
            this.cd.markForCheck();
          }
        }
        this.groundtruth = null;
        this.spinner.hide();
        return true;
      });
    });
    return true;
  }

  /**
   * Browses the datasetList for any Dataset which correlates with the given filter String (the name contains/matches the filter).
   * @param filter: the String for which the datasetList should be searched.
   * @return json array which contains all Datasets with the filter String in their name, as JSONs.
   */
  public filterDatasetList(filter: string): JSON[] {
    this.displayList = this.calc.filterListName(this.datasetList, filter);
    return this.displayList;
  }

  /**
   * Deletes a Dataset by removing them from the datasetList. Also sends the information about the deletion
   * via the RESTService to the server.
   * @param dataset: name of the Dataset which should be deleted.
   * @return true: if deletion was successful. false: if an error occurred during deletion.
   */
  public deleteDataset(id: number): boolean {
    const dataset = this.getDatasetById(id);
    if (dataset == null) {
      this.message = 'Unknown dataset';
      this.successMessage = '';
      return false;
    }
    const dialogRef = this.dialog.open(DeletionDialogComponent, {
      data: {
        dataset: dataset,
        isSetup: false,
        isSession: false,
        isPerson: false,
        isDataset: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        this.rest.deleteDataFromServer(List.DATASET, [Path.ITEM, Path.WITHOUT_BIG_DATA], [{ id: 'id', val: [dataset['id']] }]).then(
         data => {
          const index = this.datasetList.indexOf(dataset);
          if (index === -1) {
            return false;
          }
          this.datasetList.splice(index, 1);
          this.displayList = this.datasetList;
          this.successMessage = 'Dataset ' + dataset['name'] + ' deleted succesfully';
          this.message = '';
          this.cd.markForCheck();
          this.spinner.hide();
          return true;
        });
      } else {
        this.message = 'Deletion aborted';
        this.successMessage = '';
        return false;
      }
    });
    return true;
  }

  /**
   * Sets the attribute groundtruth to the content of the file which is being uploaded
   * @param files: the file which is being uploaded and contains the new data
   */
  public groundtruthChange(files: FileList) {
    const file: File = files.item(0);
    // read the content of the file
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (file.name.endsWith('.csv')) {
        // convert a csv to a json
        const tmp = this.handler.CSVtoJSON(text as string, JSONHandlerService.VALUE_TYPE_GROUNDTRUTH);
        if (!tmp) {
          this.message = 'Invalid groundtruthformat';
          this.successMessage = '';
          return false;
        }
        // only need the labels
        this.groundtruth = tmp['values'][0];
      } else {
        // it is already a json
        const tmp2 = JSON.parse(text as string);
        let attribute;
        for (let stamp in tmp2) {
          for (let mark of tmp2[stamp]) {
            if (mark !== 'outlier' && mark !== 'inlier') {
              this.message = 'Invalid groundtruthformat';
              this.successMessage = '';
              return false;
            }
          }
          attribute = stamp;
        }
        this.groundtruth = tmp2[attribute];
        this.message = '';
      }
    };
    reader.readAsText(file);
  }

  /**
   * Sets the attribute rawData to the content of the file which is being uploaded
   * @param files: the file which is being uploaded and contains the new data
   */
  public rawDataChange(files: FileList) {
    const file: File = files.item(0);
    // read the content of the file
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (file.name.endsWith('.csv')) {
        // convert a csv to a json
        const rawData = this.handler.CSVtoJSON(text as string, JSONHandlerService.VALUE_TYPE_NUMBER);
        let rawArray: JSON[];
        rawArray = [];
        for (let i = 0; rawData['titles'].length; i++) {
          const tmp = <JSON>{};
          tmp[rawData['titles'][i]] = rawData['values'][i];
          rawArray.push(tmp);
        }
        this.rawData = rawArray;
      } else {
        // it is already a json
        let rawArray: JSON[];
        rawArray = [];
        const tmpJson = JSON.parse(text as string);
        const name = this.getTypeById(this.datasetForm.controls.type.value);
        switch (name) {
          case 'image':
            for (let array of tmpJson) {
              const json = <JSON>{};
              json['data'] = array;
              rawArray.push(json);
            }
            // rawData should only be set, if valid dataset type already selected, so in each case explicit
            this.rawData = rawArray;
            break;
          case 'timeline':
            for (let stamp in tmpJson) {
              rawArray.push(tmpJson[stamp]);
            }
            // rawData should only be set, if valid dataset type already selected, so in each case explicit
            this.rawData = rawArray;
            break;
          default:
          this.message = 'Please first select dataset type, before uploading rawData.';
          this.successMessage = '';
            break;
        }
      }
    };
    reader.readAsText(file);
  }

  /**
   * Sets the attribute dataset to the content of the file which is being uploaded
   * @param files: the file which is being uploaded and contains the new data
   */
  public datasetChange(files: FileList) {
    const file: File = files.item(0);
    // read the content of the file
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (file.name.endsWith('.csv')) {
        // convert csv to json
        this.dataset = this.handler.CSVtoJSON(text as string, JSONHandlerService.VALUE_TYPE_DATASET);
        this.datasetForNormalize = this.handler.CSVtoJSON(text as string, JSONHandlerService.VALUE_TYPE_NUMBER);
      } else {
        // it is already a json
        this.dataset = JSON.parse(text as string);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Opens an alert window, which displays the description of the dataset with the given id
   * @param id :number, the unique id of a dataset
   */
  public alertDescription(id: number) {
    let ground: string;
    switch (this.hasGroundtruth(id)) {
      case true:
        ground = 'yes';
        break;
      case false:
        ground = 'no';
        break;
      default:
        ground = 'Error';
        break;
    }
    const dialogRef = this.dialog.open(DatasetDialogComponent, {
      data: {
        name: this.getDatasetById(id)['name'],
        description: this.getDatasetById(id)['description'],
        groundtruth: ground
      }
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  /**
   * Checks, whether a dataset with the given id has a groundtruth or not
   * @param id :number, unique id of a dataset
   * @returns boolean: true, dataset has a groundtruth. false else
   */
  public hasGroundtruth(id: number): boolean {
    if (this.getDatasetById(id)['groundtruth'][0] !== undefined) {
      return true;
    }
    return false;
  }

// ===============================================Private Methods===============================================

  /**
   * searches through the datasetList for a dataset with the submitted id
   * @param id: number which represents the id of the dataset which should be returned
   * @returns JSON: the dataset if found, else undefined
   */
  private getDatasetById(id: number): JSON {
    let result: JSON;
    this.datasetList.forEach(dataset => {
      if (dataset['id'] === id) {
        result = dataset;
      }
    });
    return result;
  }

  /**
   * Normalizes a dataset
   * @param dataset the JSON which contains the dataset which should be normalized
   * @returns JSON: the normalized dataset
   */
  private normalizeDataset(dataset: JSON): JSON {
    const result = <JSON>{};
    // titles stay the same
    let titles: string[];
    titles = dataset['titles'];
    result['titles'] = titles;
    const arr1 = [];
    for (let i = 0; i < dataset['values'].length; i++) {
      // get max and min
      let max = dataset['values'][i][0];
      let min = dataset['values'][i][0];
      for (let j = 0; j < dataset['values'][i].length; j++) {
        if (max < dataset['values'][i][j]) {
          max = dataset['values'][i][j];
        } else if (min > dataset['values'][i][j]) {
          min = dataset['values'][i][j];
        }
      }
      const arr = [];
      // convert them, so they match the requirements of the backend
      arr.push(this.alignNumber(min));
      arr.push(this.alignNumber(max));
      // store normalizeFactors
      this.normalizeFactors.push(arr);
    }
    // normalize 'em
    for (let i = 0; i < this.dataset['values'].length; i++) {// objects
      let arr2: number[];
      arr2 = [];
      for (let j = 0; j < this.dataset['values'][i].length; j++) {// dimension
        let value;
        const minT = this.normalizeFactors[j][0];
        const maxT = this.normalizeFactors[j][1];
        if ((maxT - minT) === 0) {
          // if all values are the same, everything is normalized 1, because everything is the maximum
          value = 1;
        } else {
          value = (this.dataset['values'][i][j] - minT) / (maxT - minT);
          if (value > 1.0) {
            value = 1.0;
          } else if (value < 0.0) {
            value = 0.0;
          } else if (value < 0.0000000000000001) {
            value = 0.0;
          }
        }
        arr2.push(this.alignNumber(value));
      }
      arr1.push(arr2);
    }
    result['values'] = arr1;
    return result;
  }

  /**
   * Validates the currently entered content of a dataset
   * @returns boolean: true: dataset is valid
   *                   false: dataset is not valid
   */
  private validateDataset(): boolean {
    if (!this.dataset) {
      this.message = 'No dataset selected';
      this.successMessage = '';
      return false;
    }
    if (!(this.dataset['titles'].length === this.dataset['values'][0].length)) {
      this.message = 'Amount of titles and dimensions doesnt match';
      this.successMessage = '';
      return false;
    }
    if (!this.datasetForm.controls.name.value) {
      this.message = 'No name entered';
      this.successMessage = '';
      return false;
    }
    if (this.datasetForm.controls.name.value.length > 30) {
      this.message = 'Name to long. Maximum 30 symbols';
      this.successMessage = '';
      return false;
    }
    if (!/\S/.test(this.datasetForm.controls.name.value)) {
      this.message = 'Name must contain at least one non whitespace character';
      this.successMessage = '';
      return false;
    }
    if (!this.datasetForm.controls.description.value) {
      this.message = 'No description entered';
      this.successMessage = '';
      return false;
    }
    if (!/\S/.test(this.datasetForm.controls.description.value)) {
      this.message = 'Description must contain at least one non whitespace character';
      this.successMessage = '';
      return false;
    }
    if (!this.datasetForm.controls.type.value) {
      this.message = 'No type selected';
      this.successMessage = '';
      return false;
    }
    if (!this.rawData) {
      this.message = 'No rawData entered';
      this.successMessage = '';
      return false;
    }
    return true;
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

  /**
   * Searches through the attribute typeList for the type with the provided id
   * @param id number: the id, for which the name of the type should be searched
   * @returns string: the name of the id with the given id
   */
  private getTypeById(id: number): string {
    let result: string;
    for (let type of this.typeList) {
      if (type['id'] === id) {
        result = type['name'];
      }
    }
    return result;
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
 * Getter for the attribute displayList
 * @returns JSON[]: copy of the attribute displayList
 */
public getDisplayList(): JSON[] {
  return this.copyArray(this.displayList);
}

/**
 * Getter for the attribute message
 * @returns string: attribute message
 */
public getMessage(): string {
  return this.message;
}

/**
 * Getter for the attribute typeList
 * @returns JSON[]: copy of the attribute typeList
 */
public getTypeList(): JSON[] {
  return this.copyArray(this.typeList);
}

/**
 * Getter for the attribute datasetForm
 * @returns FormGroup: attribute datasetForm
 */
public getDatasetForm(): FormGroup {
  return this.datasetForm;
}

/**
 * Getter for the attribute successMessage
 * @returns string: the attribute successMessage
 */
public getSuccessMessage(): string {
  return this.successMessage;
}

/**
 * Setter for the attribute dataset
 * @param set the new value of the attribute dataset
 */
public setDataset(set: JSON) {
  this.dataset = set;
}

// ===============================================Constructor & ngOnInit===============================================

  constructor(private router: Router, private rest: RESTService, private calc: CalcService
    , private handler: JSONHandlerService, private dialog: MatDialog, private formBuilder: FormBuilder
    , public spinner: NgxSpinnerService, public cd: ChangeDetectorRef) {
    super(rest, spinner, cd, ['dataset', 'datasetType']);
  }

  ngOnInit() {
    // Initialise json which should be uploaded to the server. null so you can check, whether every necessary
    // information has been submited

    // Get lists from server
    this.datasetList = [];
    this.displayList = [];
    this.typeList = [];
    this.normalizeFactors = [];
    this.spinner.show();

    // get datasets from database
    this.loadServerData(List.DATASET, [Path.WITHOUT_BIG_DATA], [{id: 'fields', val: ['id', 'name', 'description', 'groundtruth'] }]
    , e => {
      this.datasetList = [...this.datasetList, ...e];
    }, e => {
      this.displayList = this.datasetList;
      this.setDataValueIsReady('dataset');
    }, this.rest);

    // get datasetTypes from backend
    this.loadServerData(List.DATASETTYPE, [Path.WITHOUT_BIG_DATA], [{id: 'fields', val: ['id', 'name'] }]
    , e => {
      this.typeList = [...this.typeList, ...e];
    }, e => {
      this.setDataValueIsReady('datasetType');
    }, this.rest);

    // initialize formgroup
    this.datasetForm = this.formBuilder.group({
      name: new FormControl(),
      description: new FormControl(),
      type: new FormControl()
    });
  }
}
