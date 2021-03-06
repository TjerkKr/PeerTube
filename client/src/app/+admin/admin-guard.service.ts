import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  RouterStateSnapshot,
  CanActivate,
  Router
} from '@angular/router'

import { AuthService } from '../core'

@Injectable()
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor (
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.auth.isAdmin() === true) return true

    this.router.navigate([ '/login' ])
    return false
  }

  canActivateChild (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state)
  }
}
