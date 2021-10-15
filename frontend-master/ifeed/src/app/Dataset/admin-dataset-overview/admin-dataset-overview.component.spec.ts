import { TestBed } from '@angular/core/testing';

import { AdminDatasetOverviewComponent } from './admin-dataset-overview.component';
import { NavigationExtras, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { List, Path, IdValPair, Func, IdFuncPair, Param, RESTService } from '../../Services/rest.service';
import { MatDialog } from '@angular/material';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

class MockRouter {
  public navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return new Promise(res => true);
  }
}

class MockChangeDetectorRef extends ChangeDetectorRef {
  public markForCheck() { }
  public checkNoChanges() { }
  public detach() { }
  public detectChanges() { }
  public reattach() { }
}

class Mockspinner extends NgxSpinnerService {
  public show() { }
  public hide() { }
}

class MockMatDialog {

}

class MockRestService {

  public static readonly MOCKDATASETTYPE: JSON = require('src/assets/testobjects/Datasettypes.json');
  public static readonly MOCKADMINS_FOR_INIT: JSON = require('src/assets/testobjects/AdminlistForInit.json');
  public static readonly MOCKDATASET: JSON = require('src/assets/testobjects/DatasetForSetupCreate.json');
  private static readonly RESULTS = 'results';

  public addDataToServer(list: List, object: JSON) {
    return new Promise(res => {});
  }

  public getServerData(list: List, path: Path[], params: IdValPair[], dataHandler: Func, errorHandler?: IdFuncPair[]) {
    if (list === List.DATASET) {
        dataHandler(MockRestService.MOCKDATASET);
    } else if (list === List.DATASETTYPE) {
      dataHandler(MockRestService.MOCKDATASETTYPE)
    } else {
    }
  }

  public alterDataFromServer(list: List, path: Path[], object: JSON, param: Param, errorHandler?: IdFuncPair[]) {
    return new Promise(() => {});
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data;
    if (list === List.DATASET) {
      data = MockRestService.MOCKDATASET;
    } else if (list === List.DATASETTYPE) {
      data = MockRestService.MOCKDATASETTYPE;
    } else {
      return;
    }
    dataHandler(data['results']);
    endFunction(data);
  }
}

describe('AdminDatasetOverviewComponent: Initialization', () => {
  let component: AdminDatasetOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminDatasetOverviewComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminDatasetOverviewComponent);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init datasetlist', () => {
    expect(component.getDisplayList()[0]['id']).toEqual(1);
  });

  it('should init datasettypes', () => {
    expect(component.getTypeList()[0]['name']).toEqual('image');
  });
});

describe('AdminDatasetOverviewComponent: invalid entrys', () => {
  let component: AdminDatasetOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminDatasetOverviewComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: MatDialog, useClass: MockMatDialog} ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminDatasetOverviewComponent);
    component.ngOnInit();
  });

  it('should display error on invalid inputs(0)', () => {
    component.uploadDataset();
    expect(component.getMessage()).toEqual('No dataset selected');
  });

  it('should display error on invalid inputs(1)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.uploadDataset();
    expect(component.getMessage()).toEqual('No name entered');
  });

  it('should display error on invalid inputs(2)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.getDatasetForm().controls.name.setValue('0123456789012345678901234567890123456789');
    component.uploadDataset();
    expect(component.getMessage()).toEqual('Name to long. Maximum 30 symbols');
  });

  it('should display error on invalid inputs(3)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2,4],[3,4],[5,6]];
    component.getDatasetForm().controls.name.setValue('0123456789012345');
    component.setDataset(dataset);
    component.uploadDataset();
    expect(component.getMessage()).toEqual('Amount of titles and dimensions doesnt match');
  });

  it('should display error on invalid inputs(4)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.getDatasetForm().controls.name.setValue(' ');
    component.uploadDataset();
    expect(component.getMessage()).toEqual('Name must contain at least one non whitespace character');
  });

  it('should display error on invalid inputs(5)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.getDatasetForm().controls.name.setValue('name');
    component.uploadDataset();
    expect(component.getMessage()).toEqual('No description entered');
  });

  it('should display error on invalid inputs(6)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.getDatasetForm().controls.name.setValue('name');
    component.getDatasetForm().controls.description.setValue(' ');
    component.uploadDataset();
    expect(component.getMessage()).toEqual('Description must contain at least one non whitespace character');
  });

  it('should display error on invalid inputs(7)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.getDatasetForm().controls.name.setValue('name');
    component.getDatasetForm().controls.description.setValue('desc');
    component.uploadDataset();
    expect(component.getMessage()).toEqual('No type selected');
  });

  it('should display error on invalid inputs(8)', () => {
    let dataset = <JSON>{};
    dataset['titles'] = ['title1','tilte2'];
    dataset['values'] = [[1,2],[3,4]];
    component.setDataset(dataset);
    component.getDatasetForm().controls.name.setValue('name');
    component.getDatasetForm().controls.description.setValue('desc');
    component.getDatasetForm().controls.type.setValue(1);
    component.uploadDataset();
    expect(component.getMessage()).toEqual('No rawData entered');
  });
});
