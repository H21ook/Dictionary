import { Component, OnInit } from '@angular/core';
import { Word } from '../models/word.model';
import { DatabaseService } from '../services/database.service';
import { Recently } from '../models/recently.model';

@Component({
  selector: 'app-recently',
  templateUrl: './recently.page.html',
  styleUrls: ['./recently.page.scss'],
})
export class RecentlyPage implements OnInit {

  recentles: any = [];
  listLength: number;
  
  constructor(
    private db: DatabaseService
  ) { 
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getRecentles().subscribe(recentles => {
          this.recentles = Object.values(this.groupBy(recentles, 'viewed_time'));
          this.listLength = this.recentles.length;
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
