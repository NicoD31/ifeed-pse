import { Injectable } from '@angular/core';
import { EnumService } from './enum.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Manages the computation of statistics. These are used to compare Sessions and to visualize the Session summary.
 */
export class StatisticsService {
  // need to acces label[number]['value']['final'] (number: 0->U 1->inlier 2->outlier)
  label = this.enumService.getLabels();

  /**
   * Compares two Sessions on behalf of their labels.
   * @param ld1 the labeled data in Session1.
   * @param ld2 the labeled data in Session2.
   * @return a result vector: (io: number, oi: number, e: number) its an array
   * io: meaning the number of evaluations inlier to outlier.
   * oi: meaning the number of evaluations outlier to inlier.
   * ei: meaning equal inlier evaluations.
   * eo: meaning equal outlier evaluations.
   */
  compareLabledData(ld1: String[], ld2: String[]): number[] {
    if (!ld1 || !ld2 || ld1 === [] || ld2 === [] || ld1.length !== ld2.length) {
      return null;
    }
    let io = 0;
    let oi = 0;
    let ei = 0;
    let eo = 0;

    for (let key in ld1) {
      if (ld1[key] === this.label[1]['value']['final'] && ld2[key] === this.label[1]['value']['final']) {
        ei++;
      } else if (ld1[key] === this.label[2]['value']['final'] && ld2[key] === this.label[2]['value']['final']) {
        eo++;
      } else if (ld1[key] === this.label[1]['value']['final'] && ld2[key] === this.label[2]['value']['final']) {
        io++;
      } else {
        oi++;
      }
    }

    return [io, oi, ei, eo];
  }

  /**
   * Compares two Sessions of one Setup to each other.
   * @param session1 the JSON of the column in the compare matrix.
   * @param session2 the JSON of the row in the compare matrix.
   * @return the result of the Session comparison: number of equal labels / number of all lables, -1 if error occured
   */
  compareSessions(session1: JSON, session2: JSON): number {
    let lables1: String[];
    let lables2: String[];
    lables1 = session1['finalLabels'];
    lables2 = session2['finalLabels'];
    const comparison = this.compareLabledData(lables1, lables2);
    if (!comparison) {
      return -1;
    }
    let relativeEqual = new Number((comparison[2] + comparison[3]) / (comparison[0] + comparison[1] + comparison[2] + comparison[3]));
    return parseFloat(relativeEqual.toPrecision(3));
  }

  /**
   * Compares two Sessions of one Setup to each other.
   * @param session1 the JSON of the column in the compare matrix.
   * @param session2 the JSON of the row in the compare matrix.
   * @return cohens-kappa-coefizient, -1 if an error occured.
   */
  cohensKappa(session1: JSON, session2: JSON): number {
    let ld1: String[];
    let ld2: String[];
    ld1 = session1['finalLabels'];
    ld2 = session2['finalLabels'];
    const lable = this.compareLabledData(ld1, ld2);
    if (!lable) {
      return -1;
    }
    const sum = lable[0] + lable[1] + lable[2] + lable[3];
    if (lable[2] === sum || lable[3] === sum) {
      return 1;
    }
    const p0 = (lable[2] + lable[3]) / sum;
    const pIn = ((lable[2] + lable[0]) / sum) * ((lable[2] + lable[1]) / sum);
    const pOut = ((lable[1] + lable[3]) / sum) * ((lable[0] + lable[3]) / sum);
    const pe = pIn + pOut;
    let num = new Number((p0 - pe) / (1 - pe));
    return parseFloat(num.toPrecision(3));
  }


  /**
   * Computes the color which is supporting the comparison of two sessions.
   *
   * @param session1 the first session.
   * @param session2 the second session.
   * @returns the color as a hexadecimal value.
   */
  public matrixColorEntry(session1: JSON, session2: JSON): string {
    const result = this.compareSessions(session1, session2);
    let rgbValue: string;

    if (result < 0.250) {
      rgbValue = 'ffffff';
    } else if (result < 0.500) {
      rgbValue = 'ffcccc';
    } else if (result < 0.750) {
      rgbValue = 'ff8080';
    } else if (result <= 1.000) {
      rgbValue = 'e60000';
    } else {
      rgbValue = '000000';
    }

    return rgbValue;
  }

  constructor(private enumService: EnumService) { }
}
