import {Component} from '@angular/core';
import {CanActivate} from '@angular/router';

export class JSONRouter {
  path: string;

  component: Component;

  canActivate: CanActivate;
}
