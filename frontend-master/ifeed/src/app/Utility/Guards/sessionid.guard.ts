import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PersonService } from '../../Services/person.service';
import { RESTService, List, Param, Path } from '../../Services/rest.service';


@Injectable({
  providedIn: 'root'
})
/**
 * The class implements the interface CanActivate. It provides a method that checks if an Admin is authorized to open an url.
 * If this is not the case, the Admin will be redirected.
 */
export class SessionIdGuard implements CanActivate {
  /**
   * Determines whether or not an Admin is authorized to view the respective page
   * @return true if the Admin is authorized, false if not.
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.personService.getRank() === PersonService.ADMIN) {
      return true;
    }
    const id = next.paramMap.get('id');
    return this.rest.getServerPromise(List.SESSION, [Path.ITEM], [{ id: 'id', val: [id] }]).then(data => {
      if (data['user'] === this.personService.getId()) {
        return true;
      } else {
        this.router.navigate(["usermain"]);
        return false;
      }
    });
  }

  constructor(private router: Router, private personService: PersonService, private rest: RESTService) {
  }
}
