import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
// @ts-ignore
import { NgProgress } from 'ngx-progressbar';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PersonService } from '../../Services/person.service';
import { RESTService } from '../../Services/rest.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

/**
  Component for the menu overview. This is for Admins and Users to navigate through
  the website.
*/
export class MenuComponent implements OnInit {
  /** Is used to observe components. */
  isHandset$: Observable<boolean>;

  /** A loading bar which is used with @ViewChild in all components to visualize
  loading processes, while requesting data via the RESTService.
  */
  progress: NgProgress;

  constructor(public router: Router, public personService: PersonService, private restService: RESTService) { }

  logout() {
    this.personService.logOut();
    this.router.navigate(['/login']);
  }

  ngOnInit() {

  }

}
