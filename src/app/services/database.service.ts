import { Injectable } from '@angular/core';

//Custom add
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Word } from '../models/word.model';
import { Favorite } from '../models/favorite.model';
import { Recently } from '../models/recently.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
 
  words = new BehaviorSubject([]);
  favorites = new BehaviorSubject([]);
  recentles = new BehaviorSubject([]);

  constructor(
    private platfrom: Platform,
    private sqlitePorter: SQLitePorter, 
    private sqlite: SQLite,
    private http: HttpClient
  ) { 

    this.platfrom.ready().then(() => {
        this.sqlite.create({
            name: 'words.db',
            location: 'default'
        })
        .then((db: SQLiteObject) => {
            this.database = db;
            this.seedDatabase();
        });
    });

  }

  seedDatabase() {
    this.http.get('assets/seed.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.loadWords();
          this.loadFavorites();
          this.loadRecentles();
          this.dbReady.next(true);
        })
        .catch(e => console.error(e));
    });
  }
 
  getDatabaseState() {
    return this.dbReady.asObservable();
  }
  
  getWords(): Observable<Word[]> {
    return this.words.asObservable();
  }

  loadWords() {
    return this.database.executeSql('SELECT * FROM word', []).then(data => {
      let words: Word[] = [];
 
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          words.push({ 
            id: data.rows.item(i).id,
            eng: data.rows.item(i).eng,
            mon: data.rows.item(i).mon,
            eng_desc: data.rows.item(i).eng_desc,
            mon_desc: data.rows.item(i).mon_desc,
            abb: data.rows.item(i).abb,
            desc: data.rows.item(i).text_desc
           });
        }
      }
      this.words.next(words);
    });
  }
 
  addWord(eng, mon, eng_desc, mon_desc, abb, desc) {
    let data = [eng, mon, eng_desc, mon_desc, abb, desc];
    return this.database.executeSql('INSERT INTO word (eng, mon, eng_desc, mon_desc, abb, text_desc) VALUES (?, ?, ?, ?, ?, ?)', data).then(data => {
      this.loadWords();
    });
  }
 
  getWord(id): Promise<Word> {
    return this.database.executeSql('SELECT * FROM word WHERE id = ?', [id]).then(data => {
      return {
        id: data.rows.item(0).id,
        eng: data.rows.item(0).eng,
        mon: data.rows.item(0).mon,
        eng_desc: data.rows.item(0).eng_desc,
        mon_desc: data.rows.item(0).mon_desc,
        abb: data.rows.item(0).abb,
        desc: data.rows.item(0).text_desc
      }
    });
  }
 
  deleteWord(id) {
    return this.database.executeSql('DELETE FROM word WHERE id = ?', [id]).then(_ => {
      this.loadWords();
    });
  }
 
  updateWord(word: Word) {
    let data = [word.eng, word.mon, word.eng_desc, word.mon_desc, word.abb, word.desc];
    return this.database.executeSql(`UPDATE word SET eng = ?, mon = ?, eng_desc = ?, mon_desc = ?, abb = ?, text_desc = ? WHERE id = ${word.id}`, data).then(data => {
      this.loadWords();
    })
  }

  //FAVORITE
  getFavorites(): Observable<Favorite[]> {
    return this.favorites.asObservable();
  }

  loadFavorites() {
    return this.database.executeSql('SELECT * FROM favorite ORDER BY viewed_time DESC', []).then(data => {
      let favorites: Favorite[] = [];
 
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          favorites.push({ 
            id: data.rows.item(i).id,
            eng: data.rows.item(i).eng,
            mon: data.rows.item(i).mon,
            eng_desc: data.rows.item(i).eng_desc,
            mon_desc: data.rows.item(i).mon_desc,
            abb: data.rows.item(i).abb,
            desc: data.rows.item(i).text_desc,
            viewed_time: data.rows.item(i).viewed_time
           });
        }
      }
      this.favorites.next(favorites);
    });
  }

  addFavorite(id, eng, mon, eng_desc, mon_desc, abb, desc, viewed_time) {
    let data = [id, eng, mon, eng_desc, mon_desc, abb, desc, viewed_time];
    return this.database.executeSql('INSERT INTO favorite (id, eng, mon, eng_desc, mon_desc, abb, text_desc, viewed_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data).then(data => {
      this.loadFavorites();
    });
  }
 
  getFavorite(id): Promise<Favorite> {
    return this.database.executeSql('SELECT * FROM favorite WHERE id = ?', [id]).then(data => {
      return {
        id: data.rows.item(0).id,
        eng: data.rows.item(0).eng,
        mon: data.rows.item(0).mon,
        eng_desc: data.rows.item(0).eng_desc,
        mon_desc: data.rows.item(0).mon_desc,
        abb: data.rows.item(0).abb,
        desc: data.rows.item(0).text_desc,
        viewed_time: data.rows.item(0).viewed_time
      }
    });
  }
 
  deleteFavorite(id) {
    return this.database.executeSql('DELETE FROM favorite WHERE id = ?', [id]).then(_ => {
      this.loadFavorites();
    });
  }
 
  updateFavorite(favorite: Favorite) {
    let data = [favorite.eng, favorite.mon, favorite.eng_desc, favorite.mon_desc, favorite.abb, favorite.desc, favorite.viewed_time];
    return this.database.executeSql(`UPDATE favorite SET eng = ?, mon = ?, eng_desc = ?, mon_desc = ?, abb = ?, text_desc = ?, viewed_time = ? WHERE id = ${favorite.id}`, data).then(data => {
      this.loadFavorites();
    })
  }

  //RECENTLY
  getRecentles(): Observable<Recently[]> {
    return this.recentles.asObservable();
  }

  loadRecentles() {
    return this.database.executeSql('SELECT * FROM recently ORDER BY viewed_time DESC', []).then(data => {
      let recentles: Favorite[] = [];
 
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          recentles.push({ 
            id: data.rows.item(i).id,
            eng: data.rows.item(i).eng,
            mon: data.rows.item(i).mon,
            eng_desc: data.rows.item(i).eng_desc,
            mon_desc: data.rows.item(i).mon_desc,
            abb: data.rows.item(i).abb,
            desc: data.rows.item(i).text_desc,
            viewed_time: data.rows.item(i).viewed_time
           });
        }
      }
      this.recentles.next(recentles);
    });
  }

  addRecently(eng, mon, eng_desc, mon_desc, abb, desc, viewed_time) {
    let data = [eng, mon, eng_desc, mon_desc, abb, desc, viewed_time];
    return this.database.executeSql('INSERT INTO recently (eng, mon, eng_desc, mon_desc, abb, text_desc, viewed_time) VALUES (?, ?, ?, ?, ?, ?, ?)', data).then(data => {
      this.loadRecentles();
    });
  }
 
  getRecently(id): Promise<Recently> {
    return this.database.executeSql('SELECT * FROM recently WHERE id = ?', [id]).then(data => {
      return {
        id: data.rows.item(0).id,
        eng: data.rows.item(0).eng,
        mon: data.rows.item(0).mon,
        eng_desc: data.rows.item(0).eng_desc,
        mon_desc: data.rows.item(0).mon_desc,
        abb: data.rows.item(0).abb,
        desc: data.rows.item(0).text_desc,
        viewed_time: data.rows.item(0).viewed_time
      }
    });
  }
 
  deleteRecently(id) {
    return this.database.executeSql('DELETE FROM recently WHERE id = ?', [id]).then(_ => {
      this.loadRecentles();
    });
  }
 
  updateRecently(recently: Recently) {
    let data = [recently.eng, recently.mon, recently.eng_desc, recently.mon_desc, recently.abb, recently.desc, recently.viewed_time];
    return this.database.executeSql(`UPDATE recently SET eng = ?, mon = ?, eng_desc = ?, mon_desc = ?, abb = ?, text_desc = ?, viewed_time = ? WHERE id = ${recently.id}`, data).then(data => {
      this.loadRecentles();
    })
  }
}
