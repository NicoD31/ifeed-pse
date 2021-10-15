import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { RESTService, Path, List } from '../../Services/rest.service';
import { CalcService } from '../../Services/calc.service';
import { PersonService } from '../../Services/person.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-user-main-overview',
  templateUrl: './user-main-overview.component.html',
  styleUrls: ['./user-main-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/**
  Component for the main overview page of the User. The currently running Sessions and
  finished ones are being shown here.
*/
export class UserMainOverviewComponent extends BaseComponent implements OnInit {
  /** A list of all Sessions, available to this User. */
  private sessionList: JSON[] = [];
  /* *The list of Sessions which is actually displayed */
  private filteredList: JSON[] = [];
  /** A list of Setups needed to calculate the progress */
  private setupList: any[] = [];
  /** The pagenumber of the next batch of  Sessions to load */
  private nextSession = 1;
  /** The pagenumber of the next batch of Setups to load */
  private nextSetup = 1;

  /**
    Getter method for the filteredList.
    @return A copy of the filteredList
  */
  public getFilteredList(): JSON[] {
    return [...this.filteredList];
  }

  public getSetupList(): JSON[] {
    return this.setupList;
  }

  public getSessionList(): JSON[] {
    return this.sessionList;
  }

  /**
    Getter method for the Router.
    @return the router.
  */
  public getRouter(): Router {
    return this.router;
  }

  public onNameClick(finished: boolean, id: number): boolean {
    if (id === null || id === undefined || id < 0) {
      return false;
    }
    if (finished) {
      this.router.navigate(['/session/detail/' + id]);
    } else {
      this.router.navigate(['/iterate/' + id]);
    }
    return true;
  }

  /**
    Filters the given Session list on behalf of the provided input.
    Serves as a search function in the User overview.
    @param filter the string through which the Sessions are being searched.
        '', null, undefined return the list unchanged.
  */
  public filterSessionList(filter: string) {
    if (!filter) {
      filter = '';
    }
    this.filteredList = this.calcService.filterListName(this.sessionList, filter);
  }

  /**
    Return the Setup with the given id
    @param id id of the Setup to return
    @return The Setu with the given id
  */
  public getSetup(id: number): JSON {
    if (id === null || id === undefined || id < 0) {
      return null;
    }
    for (let i = 0; i < this.setupList.length; i++) {
      if (this.setupList[i].id === id) {
        return this.setupList[i];
      }
    }
    return null;
  }

  constructor(private router: Router, public restService: RESTService, private calcService: CalcService,
    private personService: PersonService, public cd: ChangeDetectorRef, public spinner: NgxSpinnerService) {
    super(restService, spinner, cd, ['session', 'setup']);
  }

  /**
    Loads all Sessions and Setus for the user, when the page is initialized.
  */
  ngOnInit() {
    this.spinner.show();
    this.loadSessions();
    this.loadSetups();
  }

  /** loads the sessions of the current user via the REST-Service*/
  private loadSessions() {
    this.loadServerData(List.SESSION, [Path.WITHOUT_BIG_DATA], [{ id: 'user', val: [this.personService.getId()] },
    { id: 'fields', val: ['id', 'name', 'finished', 'id', 'setup', 'iteration'] }], e => {
      this.sessionList = [...this.sessionList, ...e];
    }, e => {
      this.filteredList = [...this.sessionList];
      this.setDataValueIsReady('session');
    }, this.restService);
  }

  /** Loads all setups via the REST-Service*/
  private loadSetups() {
    this.loadServerData(List.SETUP, [Path.WITHOUT_BIG_DATA], [{ id: 'fields', val: ['id', 'iterations'] }], e => {
      this.setupList = [...this.setupList, ...e];
    }, e => {
      this.setDataValueIsReady('setup');
    }, this.restService);
  }
}
