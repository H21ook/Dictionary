import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Word } from '../models/word.model';
import { IonInfiniteScroll, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  words: Word[] = [];
  displayWords: Word[] = [];
  word: Word;
  index: number = 0;

  constructor(
    private db: DatabaseService,
    private toastController: ToastController
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

  loadData(event) {
    setTimeout(() => {
      this.presentToast('Done');
      event.target.complete();

      if (this.words.length == 1000) {
        event.target.disabled = true;
      }
    });
  }

  getPaginateData() {
    if(this.words.length > 0 && this.index < this.words.length) {
      this.displayWords = this.words.slice(this.index + 20);
    }
  }
  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }
  
  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
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
