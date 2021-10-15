import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PersonService } from '../../Services/person.service';

@Injectable({
  providedIn: 'root'
})
/**
 * The class implements the interface CanActivate. It provides a method that checks if an Admin is authorized to open an url.
 * If this is not the case, the Admin will be redirected.
 */
export class NotloggedGuard implements CanActivate {
  /**
   * Determines whether or not an Admin is authorized to view the respective page
   * @return true if the Admin is authorized, false if not.
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.personService.getLoggedIn()) {
      return true;
    } else {
      switch (this.personService.getRank()) {
        case PersonService.ADMIN:
          this.router.navigate(['/adminmain']);
          return false;
        case PersonService.USER:
          this.router.navigate(['/usermain']);
          return false;
        default:
          return false;
      }
    }
  }

  constructor(private router: Router, private personService: PersonService) {
  }
}
