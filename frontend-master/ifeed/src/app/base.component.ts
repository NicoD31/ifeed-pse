import { RESTService, Func, Param, List, Path } from './Services/rest.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';



export abstract class BaseComponent {


  /* Lists are being displayed only after all data is loaded */
  private dataRdy: { [id: string]: boolean; } = {};
  private booleans: string[];

  constructor(public restService: RESTService, public spinner: NgxSpinnerService, public cd: ChangeDetectorRef, booleans: string[]) {
    this.setDataRdy(booleans);
  }

  /**
   * @param booleans list of boolean which must be set true with the method setDataValueIsReady.
   */
  public setDataRdy(booleans: string[]): void {
    for (const b in booleans) {
      this.dataRdy[booleans[b]] = false;
    }
    this.booleans = booleans;
  }

  /**
   * @param value Name of boolean
   */
  public setDataValueIsReady(value: string): void {
    this.dataRdy[value] = true;
  }

  /**
   * @returns boolean if Data is loaded.
   */
  public isDataRdy(): boolean {
    for (const b in this.booleans) {
      if (!this.dataRdy[this.booleans[b]]) {
        return false;
      }
    }
    return true;
  }

  /**
  * Generates an valid request to the server with more than one page.
  * @param list name of the list.
  * @param path list of path-objects to specify the url.
  * @param params params list on the end of the url as attributes.
  * @param dataHandler function which specify the data handling.
  * @param endFunction function executed after loading.
  * @param rest Restserver
  */
  public loadServerData(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: (e: {}) => void, rest: RESTService) {
    const f = (e: {}) => {
      endFunction(e);
      if (this.isDataRdy()) {
        this.spinner.hide();
        this.cd.markForCheck();
      }
    };
    rest.getServerPages(list, path, params, dataHandler, f);
  }
}
