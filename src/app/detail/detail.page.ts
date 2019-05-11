import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Word } from '../models/word.model';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  isFavorite:boolean = false;
  favoriteIcon: string = "star-outline";

  id = null;
  word: Word = null;
  constructor(
    private activatedRoute: ActivatedRoute,
    private db: DatabaseService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.db.getWord(this.id).then(word => {
      this.word = word;

      this.db.addRecently(
        this.word.eng, 
        this.word.mon, 
        this.word.eng_desc, 
        this.word.mon_desc, 
        this.word.abb, 
        this.word.desc, 
        new Date().toLocaleDateString()
      ).then(()=>{
      });
      this.db.getFavorites().subscribe(data => {
        for(let i = 0; i < data.length; i++) {
          if(data[i].id == this.word.id) {
            this.isFavorite = true;
            this.favoriteIcon = "star";
          }
        }
      });
    }, err => {
      this.presentToast(err);
      this.navCtrl.navigateRoot('home');
    });
  }

  addFavorite() {
    this.isFavorite = !this.isFavorite;
    if(this.isFavorite) {
      this.favoriteIcon = "star";
      this.db.addFavorite(
        this.word.id,
        this.word.eng, 
        this.word.mon, 
        this.word.eng_desc, 
        this.word.mon_desc, 
        this.word.abb, 
        this.word.desc, 
        new Date().toLocaleDateString()
      ).then(()=>{
        this.presentToast("Added favorite list");
      });
    } else {
      this.db.deleteFavorite(this.word.id);
      this.favoriteIcon = "star-outline";
    }
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }
} 
