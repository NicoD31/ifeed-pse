import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PersonService } from '../../Services/person.service';

@Injectable({
  providedIn: 'root'
})
/**
 * The class implements the interface CanActivate. It provides a method that checks if an User is authorized to open an url.
 * If this is not the case, the User will be redirected.
 */
export class UserGuard implements CanActivate {
  /**
   * Determines whether or not an User is authorized to view the respective page
   * @return true if the User is authorized, false if not.
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // Redirect to login, if no person is logged in
    if (!this.personService.getLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    } else {
      switch (this.personService.getRank()) {
        // admins are being redirected to their MainOverview
        case PersonService.ADMIN:
          this.router.navigate(['/adminmain']);
          return false;
        // users can proceed
        case PersonService.USER:
          return true;
        // If unknown rank just block it
        default:
          return false;
      }
    }
  }

  constructor(private router: Router, private personService: PersonService) {
  }
}
