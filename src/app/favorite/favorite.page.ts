import { Component, OnInit } from '@angular/core';
import { Word } from '../models/word.model';
import { DatabaseService } from '../services/database.service';
import { Favorite } from '../models/favorite.model';
import { MiddlewareService } from '../services/middleware.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
})
export class FavoritePage implements OnInit {

  favorites: any = [];
  listLength: number;
  lang: boolean;
  constructor(
    private db: DatabaseService,
    private middleWare: MiddlewareService
  ) { 
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getFavorites().subscribe(favorites => {
          this.favorites = Object.values(this.groupBy(favorites, 'viewed_time'));
          this.listLength = this.favorites.length;
        })
      }
    });
  }

  ngOnInit() {
    this.middleWare.language.subscribe(lang => {
      this.lang = lang;
    });
  }

  groupBy(array, key) {
    return array.reduce(function(element, x) {
      (element[x[key]] = element[x[key]] || []).push(x);
      return element;
    }, {});
  }
}
