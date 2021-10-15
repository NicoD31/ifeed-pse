import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarComponent } from './progressbar.component';
import { PlotService } from '../../Services/plot.service';
import { EnumService } from '../../Services/enum.service';

class MockPlotService extends PlotService {
  makeHeatmapFromJSON(json: JSON) {
  }
}
class MockEnumService extends EnumService {

  private static readonly HISTORYMODES = [
    JSON.parse('{"value": "noHistory", "name": "NO_HISTORY"}'),
    JSON.parse('{"value": "decisions","name": "DECISIONS"}'),
    JSON.parse('{"value": "heatmaps", "name": "HEATMAPS"}')
  ];

  getHistoryModes(): JSON[] {
    return MockEnumService.HISTORYMODES;
  }
}

describe('ProgressbarComponent: initializations', () => {
  let component: ProgressbarComponent;
  let enumService: EnumService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressbarComponent,
        { provide: PlotService, useClass: MockPlotService },
        { provide: EnumService, useClass: MockEnumService }
      ]
    });
    component = TestBed.get(ProgressbarComponent);
    component.heatmaps = null;
    component.matches = null;
    component.ngOnInit();
    enumService = TestBed.get(EnumService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('heatmaps is null, visible should be false', () => {
    expect(component.isVisible()).toBeFalsy();
  });

  it('mode is not set, should be equal to heatmaps', () => {
    expect(component.mode).toEqual(enumService.getHistoryModes()[2]['value']);
  });

  it('mode is properly set to decisions', () => {
    component.mode = 'decisions';
    expect(component.mode).toEqual('decisions');
  });
});

describe('ProgressbarComponent: setVisible()', () => {
  let component: ProgressbarComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressbarComponent,
        { provide: PlotService, useClass: MockPlotService },
        { provide: EnumService, useClass: MockEnumService }
      ]
    });
    component = TestBed.get(ProgressbarComponent);
    component.heatmaps = null;
    component.matches = null;
    component.ngOnInit();
  });

  it('right mode, but set to false should be false', () => {
    component.setVisible(false);
    expect(component.isVisible()).toBeFalsy();
  });
  it('wrong mode, but set to true should be false', () => {
    component.mode = 'decisions';
    component.setVisible(true);
    expect(component.isVisible()).toBeFalsy();
  });
  it('right mode and set to true should be true', () => {
    component.setVisible(true);
    expect(component.isVisible()).toBeTruthy();
  });
});

describe('ProgressbarComponent: showHeatmap()', () => {
  let component: ProgressbarComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressbarComponent,
        { provide: PlotService, useClass: MockPlotService },
        { provide: EnumService, useClass: MockEnumService }
      ]
    });
    component = TestBed.get(ProgressbarComponent);
    component.heatmaps = null;
    component.matches = null;
    component.ngOnInit();
  });

  it('heatmaps is null, should return false', () => {
    expect(component.showHeatmap(1)).toBeFalsy();
  });
  it('heatmaps is empty, should return false', () => {
    component.heatmaps = [];
    expect(component.showHeatmap(1)).toBeFalsy();
    expect(component.isVisible()).toBeFalsy();
  });
  it('heatmaps is undefined, should return false', () => {
    component.heatmaps = undefined;
    expect(component.showHeatmap(1)).toBeFalsy();
    expect(component.isVisible()).toBeFalsy();
  });
  it('negative index, should return false', () => {
    component.heatmaps = [['test']];
    expect(component.showHeatmap(-1)).toBeFalsy();
  });
  it('index too big, should return false', () => {
    component.heatmaps = [['test']];
    expect(component.showHeatmap(999)).toBeFalsy();
  });
  it('index is null, should return false', () => {
    component.heatmaps = [['test']];
    expect(component.showHeatmap(null)).toBeFalsy();
  });
  it('index is undefined, should return false', () => {
    component.heatmaps = [['test']];
    expect(component.showHeatmap(999)).toBeFalsy();
  });
  it('index and heatmap ok, should return true', () => {
    component.heatmaps = [['{"test1": 1}'], ['{"test2": 2}']];
    expect(component.showHeatmap(0)).toBeTruthy();
    expect(component.isVisible()).toBeTruthy();
  });
});

describe('ProgressbarComponent: setColors()', () => {
  let component: ProgressbarComponent;
  let enumService: EnumService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressbarComponent,
        { provide: PlotService, useClass: MockPlotService },
        { provide: EnumService, useClass: MockEnumService }
      ]
    });
    component = TestBed.get(ProgressbarComponent);
    component.heatmaps = null;
    component.matches = [[true, false, true, true, true]];
    component.ngOnInit();
    enumService = TestBed.get(EnumService);
  });
  it('historymode is set to noHistory, should return ProgressbarComponent.SAME', () => {
    component.mode = enumService.getHistoryModes()[0]['value'];
    expect(component.setColors(0)).toEqual(ProgressbarComponent.SAME);
  });
  it('index is null, should return null', () => {
    expect(component.setColors(null)).toEqual(null);
  });
  it('index is undefined, should return null', () => {
    expect(component.setColors(undefined)).toEqual(null);
  });
  it('matches is null, should return null', () => {
    component.matches = null;
    expect(component.setColors(0)).toEqual(null);
  });
  it('matches is undefined, should return null', () => {
    component.matches = undefined;
    expect(component.setColors(0)).toEqual(null);
  });
  it('matches contains more true than false, should ProgressbarComponent.MATCH', () => {
    component.matches = [[true, false, true, true, true]];
    expect(component.setColors(0)).toEqual(ProgressbarComponent.MATCH);
  });
  it('matches contains more false than true, should ProgressbarComponent.DIFFER', () => {
    component.matches = [[false, false, false, true, true]];
    expect(component.setColors(0)).toEqual(ProgressbarComponent.DIFFER);
  });
  it('matches contains an equal amount of true and false, should ProgressbarComponent.SAME', () => {
    component.matches = [[false, false, false, true, true, true]];
    expect(component.setColors(0)).toEqual(ProgressbarComponent.SAME);
  });
});
