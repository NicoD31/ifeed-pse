import { Injectable } from '@angular/core';
import { SessionStatus } from '../Utility/SessionStatus';
import { EnumService } from './enum.service';
import { Time} from '../Utility/Time';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

/**
 * Manages the calculation of data which is needed to visualize states of completion.
 */
export class CalcService {
  /* percent value for unlimited iteration time */
  private static readonly UNLIMITEDPERCENT = 49;

  // the values used to access enum values
  private static readonly SYSTEM = 0;
  private static readonly USER = 1;
  private static readonly HYBRID = 2;

  /**
   * Calculates the finished part of the Session in percent.
   *
   * @param setup the Setup to the respective Session.
   * @param session the Session to be calculated.
   * @returns the percentage, meaning a number value between 0 and 100 or -1 in case of error.
   * If there are no maxIterations selected, no percantages can be computed and the value 49 is returned (if the Session has been started).
   */
  public calcPercentFinished(setup: JSON, session: JSON): number {
    if (!setup || !session) {
      return -1;
    }
    if (!setup.hasOwnProperty('iterations') || !session.hasOwnProperty('iteration')) {
      return -1;
    }

    const numCompIt = session['iteration'];
    const numTotalIt = setup['iterations'];

    if (setup['iterations'] === -1) {
      // no max iterations defined
      if (session['iteration'] === 0) {
        return 0;
      } else if (session['finished']) {
        return 100;
      }
      return CalcService.UNLIMITEDPERCENT;
    }

    if (numCompIt < 0 || numTotalIt === 0 || numCompIt > numTotalIt) {
      return -1;
    }

    return Math.round((numCompIt / numTotalIt) * 100);
  }

  /**
   * Calculates the current Session status, which can be one of the following provided in SessionStatus.
   *
   * @param setup the Setup to the respective Session.
   * @param session the Session to be calculated.
   * @returns the Session status as defined in the SessionStatus enum, or the feedback mode if no maxIterations are defined.
   */
  public calcSessionStatus(setup: JSON, session: JSON): string {
    if (!setup || !session) {
      return null;
    }
    if (!setup.hasOwnProperty('iterations') || !session.hasOwnProperty('iteration') || !setup.hasOwnProperty('feedbackMode')) {
      return null;
    }

    const percentFinished = this.calcPercentFinished(setup, session);
    const feedbackmodes = this.enumService.getFeedbackModes();

    if (setup['iterations'] === -1) {
      // no max iterations defined
      switch (setup['feedbackMode']) {
        case feedbackmodes[CalcService.SYSTEM]['value']:
          return feedbackmodes[CalcService.SYSTEM]['value'] + ' mode';
        case feedbackmodes[CalcService.USER]['value']:
          return feedbackmodes[CalcService.USER]['value'] + ' mode';
        case feedbackmodes[CalcService.HYBRID]['value']:
          return feedbackmodes[CalcService.HYBRID]['value'] + ' mode';
        default:
          return 'Unknown feedback mode';
      }
    }

    if (percentFinished === 100) {
      return SessionStatus.FINISHED;
    } else if (percentFinished === 0) {
      return SessionStatus.NOT_STARTED;
    } else if (percentFinished > 0 && percentFinished < 100) {
      return SessionStatus.ACTIVE;
    } else {
      return 'Failure while computing Session status';
    }
  }

  /**
   * Calculates the time since Setup creation.
   *
   * @param setup the Setup to be calculated.
   * @returns the time in seconds.
   */
  public calcSetupTime(setup: JSON): number {
    if (!setup || !setup.hasOwnProperty('creationTime')) {
      return -1;
    }

    const creationTime = setup['creationTime'];
    const currentTime = Math.round((new Date()).getTime() / 1000);
    return currentTime - creationTime;
  }

  /**
   * Creates the time since creation message.
   *
   * @param timeSinceCreation the time since creation as a number.
   * @param message the string containing the time and the message.
   */
  public calcTimeMessage(timeSinceCreation: number, message: string): string {
    if (!message || timeSinceCreation < 0) {
      return null;
    }

    return 'created ' + timeSinceCreation + ' ' + message + '(s) ago';
  }

  /**
   * Creates the time since the Setup was created.
   *
   * @param setup the entered Setup to be calculated.
   * @returns a string containing "created <x> <time> ago" while x is an integer
   * and time is a value of seconds/minutes/hours or days after creation.
   */
  public calcSetupTimeMessage(setup: JSON): string {
    const timeSinceCreation = this.calcSetupTime(setup);
    if (timeSinceCreation < 0) {
      return null;
    } else if (timeSinceCreation <= 60) {
      // seconds
      return this.calcTimeMessage(timeSinceCreation, Time.SECOND);
    } else if (timeSinceCreation > 60 && timeSinceCreation <= 3600) {
      // minutes
      return this.calcTimeMessage(Math.round(timeSinceCreation / 60), Time.MINUTE);
    } else if (timeSinceCreation > 3600 && timeSinceCreation <= 86400) {
      // hours
      return this.calcTimeMessage(Math.round(timeSinceCreation / 3600), Time.HOUR);
    } else {
      // days
      return this.calcTimeMessage(Math.round(timeSinceCreation / 86400), Time.DAY);
    }
  }

  /**
   * Calculates the average time needed by a User to complete a Session.
   *
   * @param sessions the Sessions to be averaged.
   * @returns the average time in seconds.
   */
  public calcAverageTimeSession(sessions: JSON[]): number {
    if (!sessions) {
      return -1;
    }

    let finishedSessionsCounter = 0;
    let progressTime = 0;

    for (const session of sessions) {
      if (!session || !session.hasOwnProperty('finished') || !session.hasOwnProperty('inProgress')) {
        return -1;
      }

      if (session['finished'] === true) {
        // session is finished
        progressTime += session['inProgress'];
        finishedSessionsCounter++;
      }
    }

    if (finishedSessionsCounter === 0) {
      // if there are no finished Sessions
      return 0;
    }

    return Math.round(progressTime / finishedSessionsCounter);
  }

  /**
   * Calculates the average time a User has spent in one iteration.
   *
   * @param session the Session to be calculated.
   */
  public calcAverageTimeIteration(session: JSON): number {
    if (!session || !session.hasOwnProperty('inProgress') || !session.hasOwnProperty('iteration')) {
      return -1;
    }

    const totalTime = session['inProgress'];
    const currentIteration = session['iteration'];

    if (currentIteration < 0 || totalTime < 0 || (currentIteration !== 0 && totalTime === 0)) {
      return -1;
    }

    if (currentIteration === 0 && totalTime === 0 || (currentIteration === 0 && totalTime !== 0)) {
      return 0;
    }

    return Math.floor(totalTime / currentIteration);
  }

  /**
   * Sorts the input list in decending order on behalf of their id.
   *
   * @param imputList the list to be sorted.
   * @returns the sorted list.
   */
  public sortNewestFirst(inputList: JSON[]): JSON[] {
    if (!inputList) {
      // list null or undefined
      return null;
    }
    for (const input of inputList) {
      if (!input || !input.hasOwnProperty('id')) {
        // list elements are not valid
        return null;
      }
    }

    return inputList.sort((a, b) => b['id'] - a['id']);
  }

  /**
   * Filters the given list on behalf of the given filter. This filter operation is not case sensitive.
   *
   * @param inputList the list to be filtered.
   * @returns the filtered list. If the filter is empty, the whole list is being returned.
   */
  public filterListName(inputList: JSON[], filter: string): JSON[] {
    if (!inputList) {
      // list null or undefined
      return null;
    }
    for (const input of inputList) {
      if (!input || !input.hasOwnProperty('name')) {
        // list elements are not valid
        return null;
      }
    }

    if (filter === '') {
      return inputList;
    } else {
      return inputList.filter(e => e['name'].toLowerCase().match(filter.toLowerCase()));
    }
  }

  /**
   * Removes all elements from a list except the first ones (if there are any).
   *
   * @param list the list to be changed.
   * @param numOfElements the number of elements which should remain in the list.
   * @returns the sliced list.
   */
  public sliceListFirstElements(list: JSON[], numOfElements: number): JSON[] {
    if (!list || numOfElements < 1) {
      return null;
    }

    if (list.length <= numOfElements) {
      return list;
    } else {
      return list.slice(0, numOfElements);
    }
  }

  /**
   * Creates a time string with hours minutes and seconds.
   *
   * @param time the time in seconds.
   * @returns the time as a string.
   */
  public getTimeAsString(time: number): string {
    if (time === undefined || time === null || time <= 0)  {
      return null;
    }

    const tmpDate = new Date(1970, 1, 1).getTime();
    const convertedTime = new Date().setTime(tmpDate + (time * 1000));

    const format = 'HH:mm:ss';
    const locale = 'en-US';
    return formatDate(convertedTime, format, locale);
  }

  /**
   * Constructor for the CalcService
   *
   * @param enumService needed to get feedbackmode enum.
   */
  public constructor(private enumService: EnumService) { }
}
