import { Component, OnInit } from '@angular/core';
import { Word } from '../models/word.model';
import { DatabaseService } from '../services/database.service';
import { Favorite } from '../models/favorite.model';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
})
export class FavoritePage implements OnInit {

  favorites: any = [];
  listLength: number;
  
  constructor(
    private db: DatabaseService
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
  }

  groupBy(array, key) {
    return array.reduce(function(element, x) {
      (element[x[key]] = element[x[key]] || []).push(x);
      return element;
    }, {});
  }
}
