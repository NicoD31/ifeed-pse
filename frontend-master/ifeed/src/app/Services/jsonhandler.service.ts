import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * Manages the convertion of file formats.
 */
export class JSONHandlerService {

  public static readonly VALUE_TYPE_DATASET = 'dataset';

  public static readonly VALUE_TYPE_NUMBER = 'number';

  public static readonly VALUE_TYPE_GROUNDTRUTH = 'groundtruth';

  /**
   * Converts a CSV (Comma-separated values) string to a JSON (JavaScript Object Notation) object.
   * @param csv the string in csv pattern.
   * @param valueType Defines whether the elements of the return JSON should be parse to a number or not:
   *                  'dataset': For parsing a dataset
   *                  'number': Elements will be parse
   *                  'groundtruth': Checks the elements on validity for a groundtruth
   *                  else : Just takes them from the csv and puts them into the JSON as they are
   * @return the converted JSON object.
   */
  CSVtoJSON(csv: string, valueType: string): JSON {
    // split the csv-string by lines
    const lines = csv.split('\n');
    // get the headers of the csv
    let headers = lines[0].split(',');
    // define some letiables
    const result = <JSON>{};
    let values = [];
    result['values'] = [];

    let pre: string[][];
    pre = [];
    // make the arrays 2d
    for (let k = 0; k < headers.length; k++) {
      let arr: number[];
      arr = [];
      let inf: string[];
      inf = [];
      values.push(arr);
      pre.push(inf);
      // remove carriage return controllsequences
      headers[k] = headers[k].replace(/[\r]/g, '');
    }
    let hadId = false;
      if (headers[0] === 'id') {
        headers = headers.slice(1, headers.length);
        hadId = true;
        pre = pre.slice(1, pre.length);
        values = values.slice(1, values.length);
      }

    if (valueType === JSONHandlerService.VALUE_TYPE_DATASET) {
      for (let i = 1; i < lines.length - 1; i++) {
        let value = lines[i].split(',');
        const valueNumber: number[] = [];
        if (hadId) {
           value = value.slice(1, value.length);
        }
        for (let element of value) {
          valueNumber.push(Number.parseFloat(element));
        }
        result['values'].push(valueNumber);
      }
      for (let arr of result['values']) {
        if (arr.length !== headers.length) {
          return;
        }
      }
    } else {
      // iterate over every element and push it on the values-array
      for (let i = 1; i < lines.length -1; i++) {// line
        let currentline = lines[i].split(',');
        if (!currentline) {
          currentline = [lines[i]];
        }
        if (hadId) {
          currentline = currentline.slice(1, currentline.length);
        }
        for (let j = 0; j < currentline.length; j++) {// line x column
          currentline[j] = currentline[j].replace(/[\r]/g, '');
          if (valueType === JSONHandlerService.VALUE_TYPE_NUMBER) {
            // parse to a number
            let number = Number.parseFloat(currentline[j]);
            if (!number) {
              return;
            }
            values[j].push(number);
          } else if (valueType === JSONHandlerService.VALUE_TYPE_GROUNDTRUTH) {
            // check groundtruth validity
            if (currentline[j] !== 'outlier' && currentline[j] !== 'inlier') {
              return;
            }
            values[j].push(currentline[j]);
          } else {
            values[j].push(currentline[j]);
          }
        }
      }
      // set datas in to the json
      result['values'] = values;
    }
    // set the titles
    result['titles'] = headers;
    result['preInformation'] = pre;
    return result;
  }

  constructor() { }
}
