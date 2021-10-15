import { TestBed } from '@angular/core/testing';

import { PlotService } from './plot.service';

describe('PlotService', () => {
  let service: PlotService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(PlotService);
  });

  it('should return false with undefined input', () => {
    let label1;
    let label2;
    let name;
    expect(service.makeBarChart(label1, label2, name)).toBeFalsy();
  });

  it('should return false with undefined input', () => {
    let label1;
    let label2;
    let name = 'test';
    expect(service.makeBarChart(label1, label2, name)).toBeFalsy();
  });

  it('should return false with undefined input', () => {
    let label1;
    let label2 = ['test'];
    let name;
    expect(service.makeBarChart(label1, label2, name)).toBeFalsy();
  });

  it('should return false with undefined input', () => {
    let label1 = ['test'];
    let label2;
    let name;
    expect(service.makeBarChart(label1, label2, name)).toBeFalsy();
  });
});
