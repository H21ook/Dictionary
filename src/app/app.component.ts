import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MiddlewareService } from './services/middleware.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public lang: boolean = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private middleWare: MiddlewareService
  ) {
    this.splashScreen.show();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString("#4C89C8");
      this.changeLang();
    });
  }

  changeLang() {
    this.middleWare.language.next(!this.lang);
    this.lang = !this.lang;
  }
}
