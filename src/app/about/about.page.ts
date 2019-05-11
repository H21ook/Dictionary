import { Component, OnInit } from '@angular/core';
import { MiddlewareService } from '../services/middleware.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  lang: boolean;
  constructor(
    private middleWare: MiddlewareService
  ) { }

  ngOnInit() {
    this.middleWare.language.subscribe(lang => {
      this.lang = lang;
    });
  }

}
