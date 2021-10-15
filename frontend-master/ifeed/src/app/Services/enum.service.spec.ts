import { TestBed } from '@angular/core/testing';

import { EnumService } from './enum.service';

describe('EnumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  // mock for localStorage
  beforeEach(() => {
    let store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string): String => {
      return store[key] || null;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): void => {
      store[key] = <string>value;
    });

    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  afterEach(() => {
    localStorage.clear();
  });
  // end mock for localStorage

  // tests if same label gets returned if a non existing label is input in labelToUserLabel
  it('should return same label with non existing label as input for labelToUserLabel', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'non existing';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.labelToUserLabel(testLabel)).toEqual(testLabel);
  });

  // tests if same label gets returned if a non existing label is input in userLabeltoLabel
  it('should return same label with non existing label as input for userLabeltoLabel', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'non existing';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.userLabeltoLabel(testLabel)).toEqual(testLabel);
  });

  // tests if correct complementing label gets returned if an existing label is input in labelToUserLabel
  it('should return U with NOT DEFINED as input', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'NOT DEFINED';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.labelToUserLabel(testLabel)).toEqual('U');
  });

  // tests if correct complementing label gets returned if an existing label is input in labelToUserLabel
  it('should return Lin with inlier as input', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'inlier';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.labelToUserLabel(testLabel)).toEqual('Lin');
  });

  // tests if correct complementing label gets returned if an existing label is input in labelToUserLabel
  it('should return Lout with outlier as input', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'outlier';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.labelToUserLabel(testLabel)).toEqual('Lout');
  });

  // tests if correct complementing label gets returned if an existing label is input in userlabelToLabel
  it('should return NOT DEFINED with U as input', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'U';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.userLabeltoLabel(testLabel)).toEqual('NOT DEFINED');
  });

  // tests if correct complementing label gets returned if an existing label is input in userlabelToLabel
  it('should return inlier with Lin as input', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'Lin';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.userLabeltoLabel(testLabel)).toEqual('inlier');
  });

  // tests if correct complementing label gets returned if an existing label is input in userlabelToLabel
  it('should return outlier with Lout as input', () => {
    const service: EnumService = TestBed.get(EnumService);

    const testLabel = 'Lout';
    const unl = '{"value": {"user": "U","final": "NOT DEFINED"},"name": "U"}';
    const inl = '{"value": {"user": "Lin","final": "inlier"},"name": "INLIER"}';
    const out = '{"value": {"user": "Lout","final": "outlier"},"name": "OUTLIER"}';

    const mockLabels = [
        JSON.parse(unl),
        JSON.parse(inl),
        JSON.parse(out)
    ];
    service.setLabels(mockLabels);
    expect(service.userLabeltoLabel(testLabel)).toEqual('outlier');
  });

});
