import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router, NavigationExtras } from '@angular/router';
import { PersonService } from '../../Services/person.service';
import { RESTService, List, Path, Param, Func, IdValPair } from '../../Services/rest.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { EnumService } from '../../Services/enum.service';
import { AdminSetupCreateComponent } from './admin-setup-create.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

class MockPersonService extends PersonService {
  public static readonly USERID = 1;
  public static readonly ADMINID = 2;
  public getId() {
    return MockPersonService.USERID;
  }
}

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

class MockRestService {

  public static readonly MOCKSETUP1: JSON = require('src/assets/testobjects/SetupForSetupCreate.json');
  public static readonly PARAMS: JSON = require('src/assets/testobjects/Params.json');
  public static readonly MOCKDATASET1: JSON = require('src/assets/testobjects/DatasetForSetupCreate.json');
  private static readonly RESULTS = 'results';

  public addDataToServer(list: List, object: JSON) {
    return new Promise(res => {});
  }

  public getServerData(list: List, path: Path[], params: IdValPair[], dataHandler: Func) {
    if (list === List.SETUP) {
      dataHandler(MockRestService.MOCKSETUP1);
    } else if (list === List.DATASET) {
      dataHandler(MockRestService.MOCKDATASET1['results'][0]);
    } else {
    }
  }

  public alterDataFromServer(list: List, path: Path[], object: JSON, param: Param) {
    return new Promise(res => {});
  }

  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    let data;
    if (list === List.PARAM) {
      data = MockRestService.PARAMS;
    } else if (list === List.DATASET) {
      data = MockRestService.MOCKDATASET1;
    } else {
      return;
    }
    dataHandler(data['results']);
    endFunction(data);
  }
}

class MockEnumService extends EnumService {
  public static readonly FEEDBACKMODE = [
    JSON.parse('{"value": "system", "name": "SYSTEM"}'),
    JSON.parse('{"value": "user", "name": "USER"}'),
    JSON.parse('{"value": "hybrid", "name": "HYBRID"}')
  ];
  public static readonly HISTORYMODE = [
    JSON.parse('{"value": "noHistory", "name": "NO_HISTORY"}'),
    JSON.parse('{"value": "decisions", "name": "DECISIONS"}'),
    JSON.parse('{"value": "heatmaps", "name": "HEATMAPS"}')
  ];
  public static readonly LABEL = [
    JSON.parse('{ "value": { "user": "U", "final": "NOT DEFINED" }, "name": "U" }'),
    JSON.parse('{ "value": { "user": "Lin", "final": "inlier" }, "name": "INLIER" }'),
    JSON.parse('{ "value": { "user": "Lout", "final": "outlier" }, "name": "OUTLIER" }')
  ];
  public getFeedbackModes(): JSON[] {
    return MockEnumService.FEEDBACKMODE;
  }
  public getHistoryModes(): JSON[] {
    return MockEnumService.HISTORYMODE;
  }
  public getLabels(): JSON[] {
    return MockEnumService.LABEL;
  }
}

describe('AdminSetupCreateComponent: Initializations id 0', () => {
  let component: AdminSetupCreateComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: '0'
      })
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSetupCreateComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef } ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminSetupCreateComponent);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('id should be 0', () => {
    expect(component.getRouteId()).toEqual('0');
  });

  it('should have empty setupForm', () => {
    expect(component.getSetupForm().controls.name.value).toEqual('');
  });

  it('should create new setup', () => {
    expect(component.getSetup()['name']).toEqual('');
  });
});

describe('AdminSetupCreateComponent: Initializations id 1', () => {
  let component: AdminSetupCreateComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: '1'
      })
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSetupCreateComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef } ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminSetupCreateComponent);
    component.ngOnInit();
  });

  it('id should be 1', () => {
    expect(component.getRouteId()).toEqual('1');
  });

  it('should set wasFinished', () => {
    expect(component.getWasFinished()).toEqual(true);
  });

  it('should set name in Form', () => {
    expect(component.getSetupForm().controls.name.value).toEqual('DOG Time');
  });

  it('should store existing setup local', () => {
    expect(component.getSetup()['name']).toEqual('DOG Time');
  });
});

describe('AdminSetupCreateComponent: invalid inputs', () => {
  let component: AdminSetupCreateComponent;
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({
        id: '0'
      })
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSetupCreateComponent,
        { provide: Router, useClass: MockRouter },
        { provide: RESTService, useClass: MockRestService },
        { provide: PersonService, useClass: MockPersonService },
        { provide: NgxSpinnerService, useClass: Mockspinner },
        { provide: EnumService, useClass: MockEnumService },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef } ],
      imports: [HttpClientTestingModule]
    });
    component = TestBed.get(AdminSetupCreateComponent);
    component.ngOnInit();
  });

  it('should display error message, if no values at all entered', () => {
    component.onSubmit();
    expect(component.getMessage()).toEqual('Name field may not left blank');
  });

  it('should display error message, if no values at all entered(0)', () => {
    component.getSetupForm().controls.name.setValue('01234567890123456789012345678901234567890123456789');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Name to long. Maximum 30 symbols');
  });

  it('should display error message on insufficient entry(1)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Description field may not left blank');
  });

  it('should display error message on insufficient entry(2)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue(null);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Parameter C may not left blank');
  });

  it('should display error message on insufficient entry(3)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue(2.0);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid value in Parameter C');
  });

  it('should display error message on insufficient entry(4)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue(null);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Parameter gamma may not left blank');
  });

  it('should display error message on insufficient entry(5)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('-1');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid value in Parameter gamma');
  });

  it('should display error message on insufficient entry(6)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Subspaces may not be left blank');
  });

  it('should display error message on insufficient entry(7)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('abc');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in subspaces');
  });

  it('should display error message on insufficient entry(8)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in subspaces');
  });

  it('should display error message on insufficient entry(9)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.onSubmit();
    expect(component.getMessage()).toEqual('Amount of gridpoints may not left blank');
  });

  it('should display error message on insufficient entry(10)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(1.5);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in amount of gridpoints');
  });

  it('should display error message on insufficient entry(11)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(null);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in amount of iterations');
  });

  it('should display error message on insufficient entry(12)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(1.5);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in amount of iterations');
  });

  it('should display error message on insufficient entry(13)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-2);
    component.onSubmit();
    expect(component.getSetupForm().controls.iterations.value).toEqual(-1);
  });

  it('should display error message on insufficient entry(14)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(0);
    component.onSubmit();
    expect(component.getMessage()).toEqual('0 is no valid amount of iterations');
  });

  it('should display error message on insufficient entry(15)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(null);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in maximum answertime');
  });

  it('should display error message on insufficient entry(16)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(1.5);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Invalid format in maximum answertime');
  });

  it('should display error message on insufficient entry(17)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(2);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Maximum answertime in between 0 and 4 is not valid');
  });

  it('should display error message on insufficient entry(18)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-2);
    component.onSubmit();
    expect(component.getSetupForm().controls.maxAnswerTime.value).toEqual(-1);
  });

  it('should display error message on insufficient entry(19)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-1);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Dataset has been left blank');
  });

  it('should display error message on insufficient entry(20)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-1);
    component.getSetupForm().controls.dataset.setValue(1);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Feedbackmode has been left blank');
  });

  it('should display error message on insufficient entry(21)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-1);
    component.getSetupForm().controls.dataset.setValue(1);
    component.getSetupForm().controls.feedbackMode.setValue(1);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Historymode has been left blank');
  });

  it('should display error message on insufficient entry(22)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-1);
    component.getSetupForm().controls.dataset.setValue(1);
    component.getSetupForm().controls.feedbackMode.setValue(1);
    component.getSetupForm().controls.historyMode.setValue(1);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Querystrategy has been left blank');
  });

  it('should display error message on insufficient entry(23)', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-1);
    component.getSetupForm().controls.dataset.setValue(1);
    component.getSetupForm().controls.feedbackMode.setValue(1);
    component.getSetupForm().controls.historyMode.setValue(1);
    component.getSetupForm().controls.queryStrategy.setValue(1);
    component.onSubmit();
    expect(component.getMessage()).toEqual('Classifier has been left blank');
  });

  it('should display nothing on correct information', () => {
    component.getSetupForm().controls.name.setValue('Name');
    component.getSetupForm().controls.description.setValue('desc');
    component.getSetupForm().controls.C.setValue('0.05');
    component.getSetupForm().controls.gamma.setValue('2');
    component.getSetupForm().controls.subspaces.setValue('1,2;3,4');
    component.getSetupForm().controls.subspacesGrids.setValue(10);
    component.getSetupForm().controls.iterations.setValue(-1);
    component.getSetupForm().controls.maxAnswerTime.setValue(-1);
    component.getSetupForm().controls.dataset.setValue(1);
    component.getSetupForm().controls.feedbackMode.setValue(1);
    component.getSetupForm().controls.historyMode.setValue(1);
    component.getSetupForm().controls.queryStrategy.setValue(1);
    component.getSetupForm().controls.classifier.setValue(1);
    component.onSubmit();
    expect(component.getMessage()).toEqual('');
  });
});
