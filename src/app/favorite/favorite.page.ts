import { Component, OnInit } from '@angular/core';
import { Word } from '../models/word.model';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
})
export class FavoritePage implements OnInit {

  words: Word[] = [];
  listLength: number;
  
  constructor(
    private db: DatabaseService
  ) { 
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getWords().subscribe(words => {
          this.words = words;
          this.listLength = this.words.length;
        })
      }
    });
  }

  ngOnInit() {
  }

}
