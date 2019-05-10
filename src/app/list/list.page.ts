import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Word } from '../models/word.model';
import { IonInfiniteScroll, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  words: Word[] = [];         //Oorchlogdohgui
  libWords: Word[] = [];      //Hailt hiiwel hailtiin ilerts awah zereg oorchlogdono
  displayWords: Word[] = [];  //delgetsend haragdah ugnuud
  LIMIT = 20;                 //neg udaa unshih hyzgaar
  word: Word;
  index: number = 0;
  searchField: string = "eng";  //hailt hiih talbar
  
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(
    private db: DatabaseService,
    private toastController: ToastController,
    private splashScreen: SplashScreen
  ) { }

  ngOnInit() {
    this.infiniteScroll.disabled = true;
    this.db.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.db.getWords().subscribe(words => {
          this.splashScreen.hide();
          this.words = words;
          this.getDefaultValue();
        })
      }
    });
  }

  getDefaultValue() {
    this.libWords = this.words;
    this.index = 0;
    this.displayWords = this.words.slice(this.index, this.index + this.LIMIT);
    this.index += this.LIMIT;
    if(this.libWords.length > 20) {
      this.infiniteScroll.disabled = false;
    }
  }

  loadData(event) {
    setTimeout(() => {
        event.target.complete();
      if(this.libWords.length > 0 && this.index <= this.libWords.length) {
        this.getPaginateData();
        this.index += this.LIMIT;
      } else {
        if((this.index - this.libWords.length) > 0 && this.libWords.length > 0) {
          this.getPaginateData();
        }
        event.target.disabled = true;
      }
    }, 1000);
  }

  getPaginateData() {
    this.displayWords = this.displayWords.concat(this.libWords.slice(this.index, this.index + this.LIMIT));
  }
  
  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }

  search(e) {
    var search = e.target.value;
    this.infiniteScroll.disabled = true;
    this.index = 0;
    this.displayWords = [];
    this.libWords = [];

    if (!search) {
      this.getDefaultValue();
      this.presentToast("hooson");
    } else {
      this.words.filter(data => {
        if (data[this.searchField].trim().toLowerCase().includes(search.trim().toLowerCase())) {
          this.libWords.push(data);
        }
      });
      this.presentToast("lib urt: " + this.libWords.length);
      this.displayWords = this.libWords.slice(this.index, this.index + this.LIMIT);
      this.index += this.LIMIT;

      if(this.libWords.length > 20) {
        this.infiniteScroll.disabled = false;
      } 
      
    }
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
