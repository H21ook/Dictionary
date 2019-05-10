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
    }, err => {
      this.presentToast(err);
      this.navCtrl.navigateRoot('home');
    });
  }

  addFavorite() {
    this.isFavorite = !this.isFavorite;
    if(this.isFavorite)
      this.favoriteIcon = "star";
    else
      this.favoriteIcon = "star-outline";
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'middle',
      duration: 2000
    });
    toast.present();
  }
} 
