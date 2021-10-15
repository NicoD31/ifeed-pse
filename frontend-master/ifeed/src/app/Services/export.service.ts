import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * Manages the export of the results.
 */
export class ExportService {

  /**
   * Downloads a JSON object as .json in the local download folder.
   *
   * @param object JSON object to be downloaded (note: JSON object requires attribute name).
   * @returns false if the object was not valid for download, true if download was successful.
   */
  public downloadJSON(object: JSON): boolean {
    if (!object || !object.hasOwnProperty('name')) {
      return false;
    }

    this.downloadObjectAsJson(object, object['name']);
    return true;
  }

  /**
   * Downloads a JSON object as .json containing the labels of the entered Session.
   *
   * @param session the entered session to be downloaded.
   * @returns true if download was successful, false if not.
   */
  public downloadSessionLabels(session: JSON): boolean {
    if (!session || !session.hasOwnProperty('finalLabels') || !session.hasOwnProperty('name')) {
      return false;
    }

    const labelobj = {
      'finalLabels': session['finalLabels']
    };
    this.downloadObjectAsJson(labelobj, session['name'] + '_labels');
    return true;
  }

  /* private methods ------------------------------------------------------------- */

  private downloadObjectAsJson(exportObj, exportName) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', exportName + '.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}
