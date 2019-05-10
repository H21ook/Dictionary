import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Word } from '../models/word.model';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  words: Word[] = [];
  word: Word;
  constructor(
    private db: DatabaseService
  ) { }

  ngOnInit() {
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getWords().subscribe(words => {
          this.words = words;
        })
      }
    });
  }

  /*readData() {
    if(this.words.length <= 0) {

      let query = "CREATE TABLE IF NOT EXISTS word(" 
          + "id INTEGER PRIMARY KEY AUTOINCREMENT, " 
          + "eng TEXT, " 
          + "mon TEXT, " 
          + "eng_desc TEXT, " 
          + "mon_desc TEXT, " 
          + "abb TEXT, " 
          + "desc TEXT);\n";

      for(let i = 0; i < this.db.dataT.length; i++) {
        this.word = {id: i + 1, eng: "", mon: "", eng_desc: "", mon_desc: "", abb: "", desc: "" };
        if(this.db.dataT[i].english){
          this.word.eng = this.db.dataT[i].english
        }
        if(this.db.dataT[i].mongolian){
          this.word.mon = this.db.dataT[i].mongolian;
        } 
        if(this.db.dataT[i].english_description){
          this.word.eng_desc = this.db.dataT[i].english_description
        }
        if(this.db.dataT[i].mongolian_description){
          this.word.mon_desc = this.db.dataT[i].mongolian_description;
        }
        if(this.db.dataT[i].abbreviation){
          this.word.abb = this.db.dataT[i].abbreviation;
        }
        if(this.db.dataT[i].description){
          this.word.desc = this.db.dataT[i].description
        }
        query += "INSERT or IGNORE INTO word(id, eng, mon, eng_desc, mon_desc, abb, desc) VALUES (" 
            + this.word.id + ", " 
            + "\"" + this.word.eng + "\"" + ", " 
            + "\"" + this.word.mon + "\"" +  ", " 
            + "\"" + this.word.eng_desc + "\"" + ", " 
            + "\"" + this.word.mon_desc + "\"" + ", " 
            + "\"" + this.word.abb + "\"" + ", " 
            + "\"" + this.word.desc + "\");\n";
      }
      console.log("query", query);
    }
  }*/

  addWord() {
    this.db.addWord(this.word.eng, this.word.mon, this.word.eng_desc, this.word.mon_desc, this.word.abb, this.word.desc)
    .then(_ => {
      this.word = null;
    });
  }
}
