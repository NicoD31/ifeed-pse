import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PersonService } from './person.service';

/**
 * type defining id value pair
 */
export interface IdValPair { id: string; val: Object[]; }
/**
 * type defining id function pair
 */
export interface IdFuncPair { id: number[]; func: Func; }
/**
 * type definig list with IdValPair.
 */
export type Param = IdValPair[];
/**
 * Defining function to void.
 */
export type Func = (data: any) => void | boolean;
/**
 * Defining function to Predicate.
 */
export type Predicate<A> = (a: A) => boolean;
/**
 * Defining function to string.
 */
export type ToString<A> = (a: A) => string;
/**
 * Defining enum contains listnames.
 */
export enum List {
  SETUP = 'listsetups',
  SESSION = 'listsessions',
  DATASET = 'listdatasets',
  DATASETTYPE = 'listdatasettype',
  PARAM = 'listparams',
  CLASSIFIER = 'listclassifier',
  QUERY = 'listquerystrategy',
  USER = 'listuser',
  ADMIN = 'listadmins',
  PERSON = 'listpersons',
  HISTORY = 'listhistorymode',
  LABELS = 'listlabels',
  FEEDBACKMODE = 'listfeedbackmode'
}
/**
 * Allowed combinations:
 * WITHOUT_BIG_DATA
 * WITH_BIG_DATA
 * OCAL, WITHOUT_BIG_DATA
 * OCAL, WITH_BIG_DATA
 * ITEM, WITHOUT_BIG_DATA
 * ITEM, WITH_BIG_DATA
 *
 * The order in the array should be considered.
 */
export class Path {
  public static readonly ITEM = new Path('item', true);
  public static readonly OCAL = new Path('ocal', true);
  public static readonly WITHOUT_BIG_DATA = new Path('', false);
  public static readonly WITH_BIG_DATA = new Path('', false);

  private name: string;
  private idOnEnd: boolean;

  /**
   * @param name name of path.
   * @param idOnEnd boolean must id on end.
   */
  constructor(name: string, idOnEnd: boolean) {
    this.name = name;
    this.idOnEnd = idOnEnd;
  }

  /**
   * Returns name from this path.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Returns boolean if id must on end.
   */
  public mustIdOnEnd(): boolean {
    return this.idOnEnd;
  }
}

@Injectable({
  providedIn: 'root'
})
/**
 * Manages the interaction between server and client. It is responsible for addressing the REST (Representational State Transfer) API
 * to perform CRUD (create, read, update, delete) requests.
 */
export class RESTService {


  /** The host address through which the REST API is being approached. */
  public static readonly HOST = 'http://127.0.0.1:8000/api';
  public static readonly LOGIN = '/login';
  public static readonly PATH_SEPERATOR = '/';
  private static readonly PARAM_SEPERATOR = '&';
  private static readonly PARAM_START = '?';
  private static readonly VALUE_SEPERATOR = ',';
  private static readonly PARAM_INIT = '=';
  private static readonly PAGE = 'page';
  private static readonly FIRST_PAGE = 1;
  private static readonly NEXT_PAGE = 'next';
  private static readonly DATA_KEY_RESULTS = 'results';
  private static readonly RESPONSE = 'response';
  private static readonly ID = 'id';
  private static readonly DEFAULT_ID = -1;
  private static readonly ERROR404 = 'The page you were looking for was not found. You will be redirected to the main page.';
  private static readonly ERROR400 = 'The server has rejected your request due to a bad request.';
  private static readonly ERROR5XX = 'There is an error in the REST server. Please inform the owner.';
  private static readonly ERROR503 = 'The data server cannot be connected. You are now logged out.';
  private readonly ErrorHandlerList: IdFuncPair[] = [
    {
      id: [400], func: err => {
        this.router.navigate([RESTService.LOGIN]);
        alert(RESTService.ERROR400);
      }
    },
    {
      id: [404], func: err => {
        this.router.navigate([RESTService.LOGIN]);
        alert(RESTService.ERROR404);
      }
    },
    {
      id: [503], func: err => {
        this.personService.logOut();
        alert(RESTService.ERROR503);
        this.router.navigate([RESTService.LOGIN]);
      }
    },
    {
      id: [500, 501, 502], func: err => {
        this.personService.logOut();
        alert(RESTService.ERROR5XX);
        this.router.navigate([RESTService.LOGIN]);
      }
    },
    {
      id: [RESTService.DEFAULT_ID], func: err => {
        this.router.navigate([RESTService.LOGIN]);
        alert(err.statusText);
      }
    }
  ];
  private static readonly CONTAINS_PARAM_ID = (a: IdValPair) => (a.id === RESTService.ID && a.val.length === 1);


  /**
  *
  * @param err Errorobject.
  * @param errorHandler List with errorhandlers.
  */
  private errorHandler(err: any, errorHandler: IdFuncPair[]) {
    if (errorHandler) {
      const handler = errorHandler.find(a => a.id.find(s => s === err.status) !== null);
      if (handler) {
        console.log(err);
        console.log('Found handler: ' + handler.id);
        handler.func(err);
        return;
      } else {
        const defaultHandler = errorHandler.find(a => a.id.find(s => s === RESTService.DEFAULT_ID) !== null);
        if (defaultHandler) {
          console.log(err);
          console.log('Default handler');
          handler.func.apply(err);
          return;
        }
      }
    } else {
      console.log('Errhandler null');
      this.errorHandler(err, this.ErrorHandlerList);
    }
  }


  /**
   * method creates a parameter string that can be processed by the server.
   * @param params Parameter which is to be converted into a string.
   */
  private generateParam(params: Param): string {
    return RESTService.PARAM_START + params.map(a => a.id + RESTService.PARAM_INIT +
      a.val.filter(p => p !== '').join(RESTService.VALUE_SEPERATOR)).join(RESTService.PARAM_SEPERATOR) + RESTService.PARAM_SEPERATOR;
  }

  /**
   *
   * method creates a valid url to address the url.
   * @param list name of the list.
   * @param path list of path-objects to specify the url.
   * @param params params list on the end of the url as attributes.
   */
  private generateRequestString(list: List, path: Path[], params: Param): string {
    const mustIdOnEnd = path.find(a => a.mustIdOnEnd()) != null;
    const idTupel = params.find(RESTService.CONTAINS_PARAM_ID);
    if (mustIdOnEnd && idTupel == null) {
      throw new SyntaxError('The id is missing in Params.');
    }
    const mainUrl = RESTService.HOST + RESTService.PATH_SEPERATOR + list + RESTService.PATH_SEPERATOR;
    const pathUrl = path.filter(a => a.getName() !== '').map(a => a.getName()).join(RESTService.PATH_SEPERATOR);
    const suffix = mustIdOnEnd ? (idTupel.val.pop() + RESTService.PATH_SEPERATOR) : '';
    return mainUrl + (pathUrl ? pathUrl + RESTService.PATH_SEPERATOR : '') + suffix + this.generateParam(params);
  }

  /**
   *
   * Generates an valid request to the server.
   * @param list name of the list.
   * @param path list of path-objects to specify the url.
   * @param params params list on the end of the url as attributes.
   */
  public getServerPromise(list: List, path: Path[], params: Param, errorHandler?: IdFuncPair[]) {
    return new Promise(res => this.http.get(this.generateRequestString(list, path, params)).subscribe(res,
      err => this.errorHandler(err, errorHandler)));
  }

  /**
   *
   * Generates an valid request to the server.
   * @param list name of the list.
   * @param path list of path-objects to specify the url.
   * @param params params list on the end of the url as attributes.
   * @param dataHandler function which specify the data handling.
   */
  public getServerData(list: List, path: Path[], params: Param, dataHandler: Func, errorHandler?: IdFuncPair[]) {
    return new Promise(res => this.http.get(this.generateRequestString(list, path, params)).subscribe(res,
      err => this.errorHandler(err, errorHandler))).then(dataHandler);
  }

  /**
   *
   * Generates an valid request to the server with more than one page.
   * @param list name of the list.
   * @param path list of path-objects to specify the url.
   * @param params params list on the end of the url as attributes.
   * @param dataHandler function which specify the data handling.
   * @param endFunction function executed after loading.
   */
  public getServerPages(list: List, path: Path[], params: Param, dataHandler: Func, endFunction: Func) {
    const searchById = (a: IdValPair) => a.id === RESTService.PAGE;
    if (!params.find(searchById)) {
      // Id there isn't a page: Set as page first page.
      params.push({ id: RESTService.PAGE, val: [RESTService.FIRST_PAGE] });
    }
    this.getServerData(list, path, params, data => {
      dataHandler(data[RESTService.DATA_KEY_RESULTS]);
      if (data[RESTService.NEXT_PAGE] != null) {
        // load next page if exists.
        params.find(searchById).val = [data[RESTService.NEXT_PAGE]];
        this.getServerPages(list, path, params, dataHandler, endFunction);
      } else {
        endFunction(data);
      }
    });
  }

  /**
   * Method to add data to the server.
   * @param list name of the list.
   * @param object object to add to the list.
   */
  public addDataToServer(list: List, object: JSON, errorHandler?: IdFuncPair[]) {
    return new Promise(resolve => {
      this.http.post(RESTService.HOST + RESTService.PATH_SEPERATOR + list + RESTService.PATH_SEPERATOR,
        object, { observe: RESTService.RESPONSE }).subscribe(data => {
          resolve(data);
        }, err => this.errorHandler(err, errorHandler));
    });
  }

  /**
   * Method to alter data on server.
   * @param list name of the list.
   * @param path list of path-objects to specify the url.
   * @param object object with altered data.
   * @param param params list on the end of the url as attributes.
   */
  public alterDataFromServer(list: List, path: Path[], object: JSON, param: Param, errorHandler?: IdFuncPair[]) {
    return new Promise(resolve => {
      this.http.put(this.generateRequestString(list, path, param), object, { observe: RESTService.RESPONSE }).subscribe(data => {
        resolve(data);
      }, err => this.errorHandler(err, errorHandler));
    });
  }

  /**
   * Method to delete data on server.
   * @param list name of the list.
   * @param path list of path-objects to specify the url.
   * @param param  params list on the end of the url as attributes.
   */
  public deleteDataFromServer(list: List, path: Path[], param: Param, errorHandler?: IdFuncPair[]) {
    return new Promise(resolve => {
      this.http.delete(this.generateRequestString(list, path, param), { observe: RESTService.RESPONSE }).subscribe(data => {
        resolve(data);
      }, err => this.errorHandler(err, errorHandler));
    });
  }

  constructor(private http: HttpClient, private router: Router, private personService: PersonService) { }
}
