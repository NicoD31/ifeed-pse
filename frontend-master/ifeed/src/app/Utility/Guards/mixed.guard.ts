import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PersonService } from '../../Services/person.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Determines whether or not a Person is authorized to view the respective page.
 * @return true if someone is logged in false if not.
 */
export class MixedGuard implements CanActivate {
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.personService.getLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }

  constructor(private router: Router, private personService: PersonService) { }
}
