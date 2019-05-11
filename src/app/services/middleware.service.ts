import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiddlewareService {

  public language: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }
}
