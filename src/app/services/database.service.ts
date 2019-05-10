import { Injectable } from '@angular/core';

//Custom add
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Word } from '../models/word.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
 
  words = new BehaviorSubject([]);

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
            desc: data.rows.item(i).desc
           });
        }
      }
      this.words.next(words);
    });
  }
 
  addWord(eng, mon, eng_desc, mon_desc, abb, desc) {
    let data = [eng, mon, eng_desc, mon_desc, abb, desc];
    return this.database.executeSql('INSERT INTO word (eng, mon, eng_desc, mon_desc, abb, desc) VALUES (?, ?, ?, ?, ?, ?)', data).then(data => {
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
        desc: data.rows.item(0).desc
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
    return this.database.executeSql(`UPDATE word SET eng = ?, mon = ?, eng_desc = ?, mon_desc = ?, abb = ?, desc = ? WHERE id = ${word.id}`, data).then(data => {
      this.loadWords();
    })
  }

  dataT = [
    {
        "SrNo": "1",
        "english": "A digital network working on a frequency of 1800 MHz.",
        "abbreviation": "GSM 1800",
        "english_description": "It is used in Europe, Asia-Pacific and Australia. Also known as DCS 1800 or PCN."
    },
    {
        "SrNo": "2",
        "english": "A digital network working on a frequency of 1900 MHz",
        "abbreviation": "GSM 1900",
        "english_description": "It is used in the US and Canada and is scheduled for parts of Latin America and Africa. Also known as PCS 1900."
    },
    {
        "SrNo": "3",
        "english": "Abend",
        "mongolian": "Хэвийн бус төгсгөл ",
        "mongolian_description": "Abnormal End-ийн товчилсон хэлбэр"
    },
    {
        "SrNo": "4",
        "english": "Abnormal end (abend)",
        "mongolian": "Хэвийн бус төгсгөл",
        "mongolian_description": "Бүрэн дуусгахын өнмөх үйл явцын төгсгөл"
    },
    {
        "SrNo": "5",
        "english": "Abort",
        "mongolian": "Таслах зогсоох",
        "mongolian_description": "Программ эсвэл системийн үйл ажилгааг гүйцэд дуусахаас өмнө үйл ажилгааг зогсоох,тасалдуулах ажилгаа нь программаар үйлдлийн системээр эсвэл хэрэглэгчээр хийгдэж болно."
    },
    {
        "SrNo": "6",
        "english": "Absolute address",
        "mongolian": "Зөвшөөрөгдсөн хаяг ",
        "mongolian_description": "Программын заавар өгөгдлийн хэсэг бүр компьютерийн санах ойгоос салангад агуулагддаг.Энэ нь адресс хаяг дотор агуулагдаж байршина.Адрес хаяг нь дугаар болон үгийг гол санах ойдоо байрлуулна.Энэ дугаар ялангуяа программын байршлийг тогтоох, аль өгөгдлийн төрөл агуулагдаж байгаа, программын бүтцийн код хэзээ үүсэж салаалсанг агуулна.Хэрэв хаяг нь жинхэнэ хаяг бол компьютерийн дотоод электрон хэсгүүдтэй хамтран хэрэглэгдэнэ.Энэ нь алдартай учир жинхэнэ зөвшөөрөлтэй хаяг юм."
    },
    {
        "SrNo": "7",
        "english": "Absolute code",
        "mongolian": "Бүрэн төгс код",
        "mongolian_description": "Кодон доторх аль нэг хаяг бүрэн төгс байна."
    },
    {
        "SrNo": "8",
        "english": "Absolute instruction",
        "mongolian": "Бүрэн төгс заавар",
        "mongolian_description": "Компьютерын заавар доторх аль нэг хаяг нь бүрэн төгс байна. Жишээ нь: шууд заавар% ашигтай заавар, шуурхай заавар, шууд бус заавар"
    },
    {
        "SrNo": "9",
        "english": "Absolute loader",
        "mongolian": "Бүрэн төгс ачаалах төхөөрөмж",
        "mongolian_description": "Ачааллах төхөөрөмж нь машины санах ойг эхлүүлж, сүлжээн дэх хаягаас код оруулах юм уу эсвэл ассемблерийг цуглуулж хийх үйлдлийг тааруулна."
    },
    {
        "SrNo": "10",
        "english": "Absolute Radio Frequency Channel Numbers",
        "abbreviation": "ARFCN",
        "english_description": "A channel numbering scheme used to identify specific RF channels in a GSM radio system."
    },
    {
        "SrNo": "11",
        "english": "Absolute reference",
        "mongolian": "Абсолют жишиг",
        "mongolian_description": "Хүснэгттэй ажиллах програм нь нэг нүдэнд нь томъёог хувилах(хуулбарлах)  үед абсолют жишиг ашиглаж болно.Нэр томъёо үргэлж үүрэнд хамааруулна энэ нь чи тайлбарыг үүрэнд байлгах үгүй юу гэдгээ нарийн мэдэж байх ёстой гэсэн үг юм.Эсвэл өөрөө хүсч байвал тайлбарыг өөрийн хүсэннээр дурын мөр баганалуу хөдөлгөж зөөж болно."
    },
    {
        "SrNo": "12",
        "english": "Abstract class",
        "mongolian": "Абстракт класс",
        "mongolian_description": "Энэ анги нь бие даан үүсгэгддэггүй."
    },
    {
        "SrNo": "13",
        "english": "Abstract data type",
        "mongolian": "Хийсвэр өгөгдлийн хэв шинж",
        "mongolian_description": "Хийсвэр өгөгдөл нь зөвхөн өгөгдлийн үйл ажиллагааг гүйцэтгэдэг. Гүйцэтгэлийн шинж нь онцгой холбоотой болж шинжийг яаж илэрхийлсэн, яаж үйлдлийг гүйцэтгэсэнийг шалгана"
    },
    {
        "SrNo": "14",
        "english": "Abstract design",
        "mongolian": "Хийсвэр загвар",
        "mongolian_description": "Мэргэжлийн (дараагийн ажлын дизайн) буюу шаардлагатай ерөнхий хэлбэр нь тодорхой загварыг гаргана."
    },
    {
        "SrNo": "15",
        "english": "Abstraction",
        "mongolian": "Хийсвэрлэл",
        "mongolian_description": "Бусад мэдээллийг үл тоог системийн бүрэлдэхүүнийг шалгах. Үйл явцыг томьёолох шыл ажиллагааг гүйцэтгэдэг."
    },
    {
        "SrNo": "16",
        "english": "Accept (a mailing list posting)",
        "mongolian": "Хүлээн авах,зөвшөөрөх",
        "mongolian_description": "Илгээж байгаа захидал нь moderator-ийн хүлээн зөвшөөрсөн үед,Энэ нь үүнийг шалгагч гишүүн хийж дууссан бол мэйл-н боломжтой болсныг харуулна."
    },
    {
        "SrNo": "17",
        "english": "Accept (a mailing list posting)",
        "mongolian": "Хүлээн авах,зөвшөөрөх",
        "mongolian_description": "Илгээж байгаа захидал нь moderator-ийн хүлээн зөвшөөрсөн үед,Энэ нь үүнийг шалгагч гишүүн хийж дууссан бол мэйл-н боломжтой болсныг харуулна."
    },
    {
        "SrNo": "18",
        "english": "Acceptable use policy",
        "abbreviation": "AUP",
        "mongolian_description": "Хууль журамыг компьютер хэрэглэгч  мэдэхээр бол (хуулийн эсвэл шийдэх албан байгуулага) компьютерынхоо системийг ашиглан,мэйл-р,интернет гэх мэтээр үзэж болно. "
    },
    {
        "SrNo": "19",
        "english": "Acceptable use policy-AUP",
        "mongolian_description": "Хууль журамыг компьютер хэрэглэгч  мэдэхээр бол (хуулийн эсвэл шийдэх албан байгуулага) компьютерынхоо системийг ашиглан,мэйл-р,интернет гэх мэтээр үзэж болно. "
    },
    {
        "SrNo": "20",
        "english": "Acceptance criteria",
        "mongolian": "Хүлээн авах шалгуур",
        "mongolian_description": "Байгууллага хэрэглэгчийн зөвшөөрлийг дэс дараатай системийн бүрэлдэхүүнд оруулах үүрэгтэй. Гол шаардлага нь: тайлбарлахдаа хийсвэрлэх"
    },
    {
        "SrNo": "21",
        "english": "Acceptance test ",
        "mongolian": "Хүлээн авах үеийн шалгалт",
        "mongolian_description": "Гэрээгээр хүлээсэн шаардлагыг хангасан батлагааг өгөхөөр борлуулагч тал суулгасаны дараа худалдан авагч тал хүлээн авахдаа ихэнхдээ системийн болон функционал нэгжийн тест хийдэг. "
    },
    {
        "SrNo": "22",
        "english": "Acceptance testing ",
        "mongolian": "Хүлээн авалтын үеийн шалгалт ",
        "mongolian_description": "Тест нь систем хүлээн зөвшөөрөх шалгуурыг хангасан болон харилцагч системийг хүлээн авахад чиглэгдсэн юм."
    },
    {
        "SrNo": "23",
        "english": "Access",
        "mongolian": "Хандалт",
        "mongolian_description": "Нөөцийг /resource/ -г ашиглахыг эрхтэй."
    },
    {
        "SrNo": "24",
        "english": "Access facility ",
        "mongolian": "Хандах хэрэгсэл",
        "mongolian_description": "Сувгаар дамжуулах өгөгдлийг боловсруулахад ашиглах хийсвэр болон дамжуулах синтакс –г нийцүүлэх үйлчилгээний багц. "
    },
    {
        "SrNo": "25",
        "english": "Access Grant Channel",
        "abbreviation": "AGCH",
        "english_description": "A downlink control channel used in GSM systems to assign mobiles to a SDCCH for initial assignment."
    },
    {
        "SrNo": "26",
        "english": "Access method ",
        "mongolian": "Хандах арга",
        "mongolian_description": "Өгөгдлийг ашиглах техник, өгөгдөл унших болон бичихэд ашиглах санах ойн хэрэглээ, өгөгдлийг дамжуулах сувгийн оролт гаралтын хэрэглээ. "
    },
    {
        "SrNo": "27",
        "english": "Access rights",
        "mongolian": "Хандалтын эрх",
        "mongolian_description": "Хэр зэрэг  удирдаж ашиглаж чадахаас буюу тухайн хэрэглэгч программын өгөгдлийн файлыг засварлаж өөрчилж болно. Хэрэглэгч бүр хэрэглэгч эсэхийг тодорхойлох хандалтын эрхтэй байна:"
    },
    {
        "SrNo": "28",
        "english": "Access rights",
        "mongolian": "Хандалтын эрх",
        "mongolian_description": "Хэр зэрэг  удирдаж ашиглаж чадахаас буюу тухайн хэрэглэгч программын өгөгдлийн файлыг засварлаж өөрчилж болно. Хэрэглэгч бүр хэрэглэгч эсэхийг тодорхойлох хандалтын эрхтэй байна:"
    },
    {
        "SrNo": "29",
        "english": "Access route ",
        "mongolian": "Хандах урсгал ",
        "mongolian_description": "Далд өгөгдлийн бүтэц –рүү хандах урсгалаар хангах."
    },
    {
        "SrNo": "30",
        "english": "Access transparency ",
        "mongolian": "Хандалтын ил тод байдал",
        "mongolian_description": "Объектүүд хооронд хамтран ажиллах боломж олгох механизмын халхлалтыг ил тод дэлгэх "
    },
    {
        "SrNo": "31",
        "english": "Accessibility ",
        "mongolian": "Хялбар байх, хүртэмж",
        "mongolian_description": "Хүмүүс бүтээгдэхүүнийг хэрэглэхэд хялбар байх, үйлчилгээ, орчин эсвэл хөнгөлөлт, өргөн цар хүрээтэй боломжууд. "
    },
    {
        "SrNo": "32",
        "english": "Accessibility option",
        "mongolian": "Хүртээмжтэй байдал сонголт",
        "mongolian_description": "Браузер болон бусад програм байдаг онцлог,Эдгээрнь нэг сонголт,харин сонголтууд хуртээмжийг нэмэгдүүлдэг  ,жишээлбэл фонт хэмжээг өөрчлөх"
    },
    {
        "SrNo": "33",
        "english": "Accident ",
        "mongolian": "Гэнэтийн осол",
        "mongolian_description": "Төлөвлөгдөөгүй хэрэг явдал,зогсоход хүргэх үйлдлүүдийн дараалал, гэмтэл, эрүүл бус байдал, орчин тойрны гэмдэл, тоног төхөөрөмж болон эд хөрөнгийн гэмтэл."
    },
    {
        "SrNo": "34",
        "english": "Accuracy ",
        "mongolian": "Нарийвчлал",
        "mongolian_description": "Үнэн зөв чанарын үнэлгээ, алдаагүй байдал, алдааны чанарын хэмжигдэхүүн."
    },
    {
        "SrNo": "35",
        "english": "Accuracy of measurement ",
        "mongolian": "Хэмжилтийн нарийвчлал ",
        "mongolian_description": "Хэмжүүрийн үр дүн ба зөв хэмжилтийн утга хооронд зөвшөөрсөн нарийвчлал "
    },
    {
        "SrNo": "36",
        "english": "Acquire project team ",
        "mongolian": "Төслийн баг олж авах",
        "mongolian_description": "Төслийн даалгаврыг гүйцэтгэх багт хэрэгцээтэй хүний нөөцийг хайж олох."
    },
    {
        "SrNo": "37",
        "english": "Acquirer",
        "mongolian": "Эзэмшигч/ худалдан авагч",
        "mongolian_description": "Хувьцаа эзэмшигчид, бүтээгдэхүүн худалдан авагчид,нийлүүлэгчээс үзүүлэх үйлчилгээ."
    },
    {
        "SrNo": "38",
        "english": "Acquisition ",
        "mongolian": "Худалдан авалт",
        "mongolian_description": "Систем, програм хангамжийн бүтээгдэхүүн болон програм хангамжийн үйлчилгээ авах."
    },
    {
        "SrNo": "39",
        "english": "Acquisition strategy ",
        "mongolian": "Худалдан авалтын стратеги ",
        "mongolian_description": "Эх сурвалжаар хангах шийдэлд суурилсан бүтээгдэхүүн болон үйлчилгээ авахыг тодорхой авч үзэх, худалдан авах арга замууд,зохих техникийн шаардлагууд,зохих гэрээ зөвшилцөл болон холбогдох худалдан авалтын эрсдэлүүд."
    },
    {
        "SrNo": "40",
        "english": "Action ",
        "mongolian": "Үйлдэл",
        "mongolian_description": "Үйл ажиллагаан дунд хэрэглэгчийн гүйцэтгэх хэсэг, ажиллагааны тайлбар."
    },
    {
        "SrNo": "41",
        "english": "Action entry ",
        "mongolian": "Үйлдэлд оролцох",
        "mongolian_description": "Тодорхой дүрэм журамтай хамааралтай үзүүлэлтүүд"
    },
    {
        "SrNo": "42",
        "english": "Action of interest ",
        "mongolian": "Ашгийн хувь",
        "mongolian_description": "Ашгийн хүү"
    },
    {
        "SrNo": "43",
        "english": "Action stub ",
        "mongolian": "Дэлгэрэнгүй",
        "mongolian_description": "Асуудлыг шийдвэрлэхэд авах бүх үйлдлүүдийн жагсаалт "
    },
    {
        "SrNo": "44",
        "english": "Activation",
        "mongolian": "Идэвхжүүлэлт ",
        "mongolian_description": " Функцын нэг тохиолдол бол хувиргалтын дэд төрлийн зарим оролтуудыг нэг бүлэг болгож гаралт болгоно. хэл "
    },
    {
        "SrNo": "45",
        "english": "Activation constraint",
        "mongolian": "Идэвхжүүлэлтийн хязгаарлалт ",
        "mongolian_description": "Зэргэлдээх обьектыг хоосон эсэхийг тогтоож тодорхой үйл ажиллагаанд нэг чиглэлд тодорхойлж зарим функцыг идэвхжүүлэх нь функцын үйл ажиллагаанд шаардлагатай. "
    },
    {
        "SrNo": "46",
        "english": "Active area",
        "mongolian": "Идэвхтэй бүс ",
        "mongolian_description": "Хэрэглэгчийн оролтонд хариу үйлдэл үзүүлэх "
    },
    {
        "SrNo": "47",
        "english": "Active interconnection",
        "mongolian": "Идэвхтэй харилцан холболт ",
        "mongolian_description": "Физик харилцан механизм нь үйл ажиллагаанд өөрчлөлт оруулах эсвэл өөр бусад үйлдлийг зөвшөөрдөг."
    },
    {
        "SrNo": "48",
        "english": "Active redundancy",
        "mongolian": "Идэвхтэй цомхтгол ",
        "mongolian_description": "Алдаатай давхцсан элементүүдийг ашиглахаас урьдчилан сэргийлэх болон алдаа доголдолыг  дахин засварлах "
    },
    {
        "SrNo": "49",
        "english": "Active satellite",
        "english_description": "A satellite carrying a station intended to transmit or retransmit radiocommunication signals."
    },
    {
        "SrNo": "50",
        "english": "Active sensor",
        "english_description": "A measuring instrument in the Earth exploration-satellite service or in the space research service by means of which information is obtained by transmission and reception of electromagnetic waves",
        "description": "Note – The definitions given in RR Nos. 1.182 and 1.183 are modified by changing the phrase “radio waves” to “electromagnetic waves”. From a technical point of view, the change is necessary because some remote sensors make measurements at wavelengths that correspond to frequencies above the upper limit of radio waves, conventionally fixed at 3 000 GHz."
    },
    {
        "SrNo": "51",
        "english": "Active server page",
        "mongolian_description": "ASP нь HTML хуудас ба хуудсыг хэрэглэгчрүү илгээхээс өмнө Microsoft web server дээр боловсруулж нэг болон хэд хэдэн скриптийг багтаадаг."
    },
    {
        "SrNo": "52",
        "english": "Active server page",
        "mongolian_description": "ASP нь HTML хуудас ба хуудсыг хэрэглэгчрүү илгээхээс өмнө Microsoft web server дээр боловсруулж нэг болон хэд хэдэн скриптийг багтаадаг."
    },
    {
        "SrNo": "53",
        "english": "Active text",
        "mongolian": "Идэвхтэй текст ",
        "mongolian_description": "Текст нь хэрэглэгчийн оролтын дэлгэц дээр гарна. "
    },
    {
        "SrNo": "54",
        "english": "Active white space",
        "mongolian": "Идэвхтэй цагаан зай",
        "mongolian_description": "Текстэн болон график элементүүдийн орчин, аль нэг текст хүртэл зогсоох , сэдэв  болон дод сэдэв ангиллалаар салгадаг , онцолсон мэдээлэл болон текстийг уншихад илүү хялбар болгоно . "
    },
    {
        "SrNo": "55",
        "english": "Active window",
        "mongolian": "Идвэхитэй цонх ",
        "mongolian_description": "Цонх нь түр зуурын дэлэгцэнд харагддаг бөгөөд ялангуяа программуудыг нүүр зургыг харуулдаг.Зөвхөн нэг цонхыг ямар ч үед нэг удаа гаргах боломжтой юм.Аль програмтай хамтран ажилахыг хэрэглэгч идвэхтэй цонхноос өөрөө харж болдог."
    },
    {
        "SrNo": "56",
        "english": "Activity",
        "mongolian": "Идэвхжүүлэх",
        "mongolian_description": "Багцын нэгдсэн ажилуудын үйл явц."
    },
    {
        "SrNo": "57",
        "english": "Activity attributes",
        "mongolian": "Идэвхтэй шинж чанарууд ",
        "mongolian_description": "Жагсаалтанд байх идэвхтэй олон шинж чанараас хуваарийн дагуу оруулж болно. Идэвхтэй шинж чанарыг кодийг идэвхжүүлэх , өмнөх үеийн замчлагчийг идэвхжүүлэх , логик харилцаа , сэлгэлт болон хоцролт таамаглал . "
    },
    {
        "SrNo": "58",
        "english": "Activity code",
        "mongolian": "Код идэвхжүүлэх ",
        "mongolian_description": "Нэг болон хэд хэдэн тоон болон текстэн утгуудыг тодорхойлж хуваарь болон тайланд тусгадаг. "
    },
    {
        "SrNo": "59",
        "english": "Activity duration",
        "mongolian": "Хугацааны идэвхжүүлэлт ",
        "mongolian_description": "Цаг хугацаа болон календар хооронд хуваарийн дагуу идэвхжүүлэлт эхэлнэ. "
    },
    {
        "SrNo": "60",
        "english": "Activity group",
        "mongolian": "Хэсэг идэвхжүүлэх ",
        "mongolian_description": "Холбогдох үйл ажиллагаа тусгагдаж байгаа программ хангамжын ажиллах хугацаа мөчлөг "
    },
    {
        "SrNo": "61",
        "english": "Activity identifier",
        "mongolian": "Үйл ажиллагаа идэвхжүүлэх ",
        "mongolian_description": "Богино тоон болон текстэн мэдээлэл нь тодорхой оноосон хугацааны дагуу ялгаатай. Ерөнхий онцгой аль нэг төсөл нь схем хүрээнд хуваарилагдана. "
    },
    {
        "SrNo": "62",
        "english": "Activity list",
        "mongolian": "Жагсаалтыг идэвхжүүлэх ",
        "mongolian_description": "Баримтжуулсан үйл ажиллагааны хүснэгтэн хуваарийн дагуу нарийвчилсан цар хүрээ төслийн багийн ямар гишүүд ямар ажил хийгдэх гэдгийг ойлгож болохоор тодорхойсон байна. "
    },
    {
        "SrNo": "63",
        "english": "Activity type",
        "mongolian": "Төрөл идэвхжүүлэх ",
        "mongolian_description": "Үйл ажиллагааны ангилалыг 1 алгоритм гүйцэтгэнэ. "
    },
    {
        "SrNo": "64",
        "english": "Actor",
        "mongolian": "Жүжигчин",
        "mongolian_description": "Үүрэг нь салбар объектийг биелүүлхэд оролцох ажиллагаа."
    },
    {
        "SrNo": "65",
        "english": "Actual cost",
        "mongolian": "Бодит зардал",
        "mongolian_description": "Хувиарын дагуу тухайн цаг хугацаанд хийгдсэн ажил , ажлын бүтэц бүрэлдхүүн болон нийт гаргасан зардал , бодит зардал тэмдэглэгдсэн байна. Бодит зардал нь зарим тохиолдолд шууд дангаараа ажилласан хугацаа болон дангаар гаргасан зардал мөн шууд бус нийт зардалыг тооцсон байна ."
    },
    {
        "SrNo": "66",
        "english": "Actual duration",
        "mongolian": "Бодит үргэжлэх хугацаа",
        "mongolian_description": "Тухайн ажлын өгөгдөл бүрэлдэхүүн ажилууд нь хувиарын дагуу заагдсан хугацаанд эхэлсэн мөн төлөвлөгөөний дагуу хийгдсэн хугацаа ажил бүрэн биелэгдсэн дууссан хугацаа зэрэг нь багтана ."
    },
    {
        "SrNo": "67",
        "english": "Actual parameter",
        "mongolian": "Бодит параметр",
        "mongolian_description": "Функц, процедур нь ашиглаж байх үед,дуудаж програм түүнд параметр дамжуулах шаардлагатай.Албан ёсны параметр нь функц болон ажиллагаанд түүнийг ашиглахад дуудаж програмд өгөгдлийг холбодог.Өгөгдлийн төрөл хангагдсан,бодит параметр эсвэл аргументаар гэгдэн, локал хувьсагч рүү дамжуулдаг."
    },
    {
        "SrNo": "68",
        "english": "Adaptive Differential Pulse Code Modulation",
        "abbreviation": "ADPCM",
        "english_description": "An encoding technique using differential encoding and variable sized quantizing steps. The variance of the step sizes are based on estimates of past signal samples."
    },
    {
        "SrNo": "69",
        "english": "Adaptive equalizer",
        "english_description": "A channel equalizer whose parameters are updated automatically and adaptively during the transmission of data. These equalizers are commonly used in fading channels to improve transmission performance."
    },
    {
        "SrNo": "70",
        "english": "Adaptive maintenance",
        "mongolian": "Тааруулах засвар үйлчилгээ",
        "mongolian_description": "Программ хангамжийн бүтээгдэхүүнд нэмэлт өөрчлөлт оруулах , дамжуулсаны дараа хийх , өөрчлөгдсөн ашиглах боломжтой программ хангамжийн үр дүнг хадгалах эсвэл орчныг өөрчлөх . "
    },
    {
        "SrNo": "71",
        "english": "Additive White Gaussian Noise",
        "abbreviation": "AWGN",
        "english_description": "Statistically random radio noise characterized by a wide frequency range with regards to a signal in a communications channel."
    },
    {
        "SrNo": "72",
        "english": "Address",
        "mongolian": "Хаяг",
        "mongolian_description": "Мэйл хаяг нь мэйл явуулахад бас хүлээн авахад ашиглагддаг.Мэйл хаяг нь хэрэглэгчийн нэр, @ тэмдэг,эзэмшил буюу домэйн нэр агуулдаг  (e.g.john@nowhere.co.uk)."
    },
    {
        "SrNo": "73",
        "english": "Address book",
        "mongolian": "Хаягын жагсаалт",
        "mongolian_description": "Файлд аль мэйл хаягаа эзэмшиж байгааг жагсаадаг."
    },
    {
        "SrNo": "74",
        "english": "Address field",
        "mongolian": "Хаягын талбар",
        "mongolian_description": "Хаягууд, хаягуудыг олж авах шаардлагатай мэдээлэл зэргийг багтаасан компьютерийн удирдлагын талбарыг хаягийн талбар гэнэ. "
    },
    {
        "SrNo": "75",
        "english": "Address format",
        "mongolian": "Хаягийн хэмжээ ",
        "mongolian_description": "PC-н удирдамжин дах хаягийн талбаруудын эмх цэгцтэй дугаар "
    },
    {
        "SrNo": "76",
        "english": "Address space",
        "mongolian_description": "1.Энэ хаяглалт нь компьютерийн програмийн энэ хаяглалтаар хийдэг   2. Дэс дугаарыг санах ойн төвд боловсруулан хаяглаж чаддаг"
    },
    {
        "SrNo": "77",
        "english": "Addressing exception",
        "mongolian": "Онцгой хаяглалт ",
        "mongolian_description": "Энэ програм нь програмийн хэмжээг тоцоолох гадна талыг хэрхэн хаяглах хадгалалт болон боломжит чадлыг гаргадаг.Үүнд өгөгдлийн хасалт үйлдэлийн үгүйсгэл "
    },
    {
        "SrNo": "78",
        "english": "Adjacent channel",
        "english_description": "In a given set of radio channels, the RF channel whose characteristic frequency is situated next above or next below that of a given channel.",
        "description": "Note 1 – The adjacent channel situated above the given channel is known as the “upper adjacent channel” and the one below it as the “lower adjacent channel”. Note 2 – Two adjacent channels may have part of the frequency spectrum in common and this may be referred to as frequency overlap."
    },
    {
        "SrNo": "79",
        "english": "Adjacent channel interference",
        "english_description": "Out of band power generated in adjacent channels by transmitters operating in their assigned channel. The amount of adjacent channel interference a receiver sees is a function of transmitter and receiver filter characteristics and the number of transmitters operating in the area."
    },
    {
        "SrNo": "80",
        "english": "Adjacent Channel Interference Ratio",
        "abbreviation": "ACIR",
        "english_description": "The ratio of wanted power to the interference power from the adjacent channel(s)."
    },
    {
        "SrNo": "81",
        "english": "Adjacent Channel Leakage Ratio",
        "abbreviation": "ACLR",
        "english_description": "ACLR is a measure of transmitter performance for WCDMA. It is defined as the ratio of the transmitted power to the power measured after a receiver filter in the adjacent RF channel. This is what was formerly called Adjacent Channel Power Ratio. ACLR is specified in the 3GPP WCDMA standard."
    },
    {
        "SrNo": "82",
        "english": "Adjacent Channel Power Ratio",
        "abbreviation": "ACPR",
        "english_description": "A measurement of the amount of interference, or power, in the adjacent frequency channel. ACPR is usually defined as the ratio of the average power in the adjacent frequency channel (or offset) to the average power in the transmitted frequency channel. It is a critical measurement for CDMA transmitters and their components. It describes the amount of distortion generated due to nonlinearities in RF components. The ACPR measurement is not part of the cdmaOne standard."
    },
    {
        "SrNo": "83",
        "english": "Adjacent Channel Selectivity",
        "abbreviation": "ACS",
        "english_description": "A measurement of a receiver's ability to process a desired signal while rejecting a strong signal in an adjacent frequency channel. ACS is defined as the ratio of the receiver filter attenuation on the assigned channel frequency to the receiver filter attenuation on the adjacent channel frequency."
    },
    {
        "SrNo": "84",
        "english": "Adjusted funcfion point count ",
        "mongolian": "Засах үйл ажиллагааны үе шатын тоо",
        "abbreviation": "AFP",
        "mongolian_description": "Засваргүй  /тохируулаггүй/ үйл ажиллагааны үе шатын тоог утгын тохируулгын хүчин зүйлээр нэмэгдүүлнэ /IS.IEC 20926:2003/ Компьютеийн систем хангамжийн инжинэрчлэл- lf-PUG"
    },
    {
        "SrNo": "85",
        "english": "Adjusted size",
        "mongolian": "Тохируулгын хэмжээ",
        "mongolian_description": "Хэмжээ нь техникийн цогц засваруудыг нэмэгдүүлсэн хэмжээний үйлдлээр  тодорхойлогдоно . /ISO-IEC-:/ Компьютерийн систем хангамжийн инжинерчлэл-МК II үил ажиллагааны үе шат. Шинжилгээ: тооцооллын практик заавар . 10"
    },
    {
        "SrNo": "86",
        "english": "Admin site",
        "mongolian": "Админ сайт",
        "mongolian_description": "Сайт эсвэл  контентууд вэб сайтын нэг хэсэгийг засварлах эдитлэх нь хязгаарлагдмал байдаг зөвхөн удирддаг админ хүмүүст л нэвтрэх хийх эрх байдаг."
    },
    {
        "SrNo": "87",
        "english": "Admin site",
        "mongolian": "Админ сайт",
        "mongolian_description": "Сайт эсвэл  контентууд вэб сайтын нэг хэсэгийг засварлах эдитлэх нь хязгаарлагдмал байдаг зөвхөн удирддаг админ хүмүүст л нэвтрэх хийх эрх байдаг."
    },
    {
        "SrNo": "88",
        "english": "Adoption process",
        "mongolian": "Сонгох үил ажиллагаа"
    },
    {
        "SrNo": "89",
        "english": "Advanced Communications Technology and Services",
        "abbreviation": "ACTS",
        "english_description": "One of the groups spearheading the development of 3G technologies in Europe. ACTS succeeded RACE and is focusing on wideband multiple access techniques."
    },
    {
        "SrNo": "90",
        "english": "Advanced Intelligent Network",
        "abbreviation": "AIN",
        "english_description": "A network of equipment, software and protocols used to implement features on the network and support switching and control functions."
    },
    {
        "SrNo": "91",
        "english": "Advanced Mobile Phone System",
        "abbreviation": "AMPS",
        "english_description": "The original standard specification for analog systems. Operates in the frequency range of 800 MHz, with a bandwidth of 30kHz. Used primarily in North America, Latin America, Australia and parts of Russia and Asia."
    },
    {
        "SrNo": "92",
        "english": "Advanced Multi Rate Codec",
        "abbreviation": "AMR",
        "english_description": "During 1999, ETSI standardized this new speech codec for GSM. The codec adapts its bit-rate allocation between speech and channel coding, thereby optimizing speech quality in various radio channel conditions. For this reason, 3GPP (under which the next stage GSM speech quality will be realized) has selected the AMR codec as an essential speech codec for the next generation system. AMR was jointly developed by Nokia, Ericsson and Siemens."
    },
    {
        "SrNo": "93",
        "english": "Advanced Radio Data Information Systems",
        "abbreviation": "ARDIS",
        "english_description": "A radio system developed jointly by Motorola and IBM to provide mobile data services. The system is now operated solely by Motorola."
    },
    {
        "SrNo": "94",
        "english": "Advanced search",
        "mongolian": "Нарийвчилсан хайлт",
        "mongolian_description": "Энгийн хайлт,жишээлбэл интернетээс хөдөлгүүрийн хүрээнд хайлт хийх нэмэлт сонголтоор эхний хайлтаас илүү нарийн хийж болно."
    },
    {
        "SrNo": "95",
        "english": "Aeronautical station",
        "english_description": "A land station in the aeronautical mobile service.",
        "description": "Note – In certain instances, an aeronautical station may be located, for example, on board ship or on a platform at sea."
    },
    {
        "SrNo": "96",
        "english": "Agent",
        "mongolian": "Агент",
        "mongolian_description": "Програм хангамж нь хэрэглэчийн заасны дагуу өөрийн  вэб-с хайлт хийнэ."
    },
    {
        "SrNo": "97",
        "english": "Aggregate power flux-density",
        "english_description": "Sum of the power flux-densities produced at a point in the geostationary-satellite orbit by all the earth stations of a non-geostationary-satellite system."
    },
    {
        "SrNo": "98",
        "english": "Aggregate responsibility ",
        "mongolian": "Нэгтгэн дүгнэх үүрэг үйл ажиллагаа",
        "mongolian_description": "Мэдээллийн тусгай шинж чанар , шаардлагын эцсийн боловсруулалтыг харуулах өргөн цар хүрээ бүхий ажиллагаа юм. IEE-1320.2-1998/R2004/ стандартаар баталгаажсан ,"
    },
    {
        "SrNo": "99",
        "english": "Agreement",
        "mongolian": "Зохицол тохиргоо",
        "mongolian_description": "Ажлын чиглэл хамаарал дах нэр томъёо, төлөв байдал нь харилцан хүлээн зөвшөөрөгдсөн  байх явдал юм, /ISO/IEC 12207:2008/. /IEEE/ стандарт 12207-2006/"
    },
    {
        "SrNo": "100",
        "english": "Aircraft station",
        "english_description": "A mobile station in the aeronautical mobile service, other than a survival craft station, located on board an aircraft."
    },
    {
        "SrNo": "101",
        "english": "A-law companding",
        "english_description": "A type of non-linear (logarithmic) quantizing, companding and encoding technique for speech signals based on the Alaw. This type of compandor is used internationally and has a similar response as the m-law compandor, except it is optimized to provide a more nearly constant signal-toquantizing noise ratio at the cost of some dynamic range."
    },
    {
        "SrNo": "102",
        "english": "Algebraic Code Excited Linear Predictive",
        "abbreviation": "ACELP",
        "english_description": "An algebraic technique used to populate codebooks for CELP speech coders. This technique results in more efficient codebook search algorithms"
    },
    {
        "SrNo": "103",
        "english": "Algebraic language ",
        "mongolian_description": "Программын хэл нь мэдээллүүдийг Y=X+5 гэх мэдчилэн тооны илэрхийлэлтэй адилтгасан утгаар илэрхийлдэг"
    },
    {
        "SrNo": "104",
        "english": "Algebraic notation",
        "mongolian": "Алгебрийн бичэлт",
        "mongolian_description": "Математикийн бас логикийн үйл явц ү.а-г тодорхойлон бичэхэд ком-н програм бичнэ."
    },
    {
        "SrNo": "105",
        "english": "Algorithm",
        "mongolian": "Алгоритм",
        "mongolian_description": "Алгоритм нь ажлыг гүйцэтгэхэд хийхэд хэрэгтэй алхамуудын дараалал юм."
    },
    {
        "SrNo": "106",
        "english": "Algorithmic language",
        "mongolian": "Алгоритмын хэл",
        "mongolian_description": "Програмын хэлний боловсруулалтыг илэрхийлэх алгоритмууд Адил нэршил: Тооны хэл , дугаарлалтын хэл "
    },
    {
        "SrNo": "107",
        "english": "Alias",
        "mongolian": "Зохиомол нэршил",
        "mongolian_description": "Хоёрдогч буюу өөр нэршилүүд /байршил , оршихуй буюу домайн/ IEEE стандарт 1320,2-1998/R2004/"
    },
    {
        "SrNo": "108",
        "english": "Aliasing",
        "english_description": "A type of signal distortion that occurs when sampling frequency of a signal is less that the Nyquist rate."
    },
    {
        "SrNo": "109",
        "english": "Aligment",
        "mongolian": "Эгнүүлэх ",
        "mongolian_description": "Энэ нь текст эсвэл зургийн байршлыг тодорхойлно.Aligment зөвхөн зүүн,баруун,төв эсвэл бүхэлдэнэ хөдөлгөнө."
    },
    {
        "SrNo": "110",
        "english": "Allocated beseline",
        "mongolian": "Хувирлагдсан суурь шугам"
    },
    {
        "SrNo": "111",
        "english": "Allocated configuration identification",
        "mongolian": "Хуваарилах шаардлага ",
        "mongolian_description": "Бага түвшний архитектурын элемент буюу зураг төслийн  бүрэлдэхүүн хэсэг дээрх ажиллагаа нь дээд шатны ажиллагааг бүхэлд нь эсвэл хэсэгчлэн ноогдуулах шаардлага юм"
    },
    {
        "SrNo": "112",
        "english": "Allocation",
        "mongolian": "Хуваарилалт",
        "mongolian_description": "Систем эвсэл програмийн бүрэлдэхүүн хэсгүүдийн хоорондох шаардлагууд, нөөцүүд эсвэл бусад нэгжүүдийн боловсруулалт Функцийг зааж өгөх шийдвэр эвсэл техник хангамж, программ хангамж эсвэл хүний шийдвэр гаргах үйл явц. "
    },
    {
        "SrNo": "113",
        "english": "ALOHA",
        "english_description": "A packet-based radio access protocol developed by the University of Hawaii where every packet sent is acknowledged. Lack of an acknowledgement is an indication of a collision and results in a retransmission."
    },
    {
        "SrNo": "114",
        "english": "Alpha testing",
        "mongolian": "Алфа тест",
        "mongolian_description": "Бүтээгдэхүүнийг худалдаанд гаргах эсвэл ашиглахад бэлэн болсон эсэхийг шалгах тестийн өмнөх үе шатыг алфа тест гэж нэрлэнэ. Ихэвчлэн програмыг хөгжүүлж буй байгууллагын ажилчид туршдаг."
    },
    {
        "SrNo": "115",
        "english": "Alphanumeric",
        "mongolian_description": "Үсэг, тоо, бусад тэмдэгтүүд, цэг таслалын тэмдэгтүүд, боловсруулах хэсэг зэргээс ирсэн мэдээллийг боловсруулах. "
    },
    {
        "SrNo": "116",
        "english": "Alternate flow ",
        "mongolian_description": "Нөхцөл байдлаас хамааран гүйцэтгэх аргыг сонгох хэсэг.",
        "english_description": " The part of a use case that describes its alternative implementations. "
    },
    {
        "SrNo": "117",
        "english": "Alternate key ",
        "mongolian_description": "Өмнө хэрэглэж байсан түлхүүрийг орлуулах өөр түлхүүр.",
        "english_description": "A candidate key of an entity other that the primary key."
    },
    {
        "SrNo": "118",
        "english": "Alternated",
        "english_description": "In a given set of radio channels, this term refers to an arrangement of channels in which two adjacent channels have orthogonal polarizations."
    },
    {
        "SrNo": "119",
        "english": "altitude of the apogee [perigee]",
        "english_description": "The altitude of the apogee [perigee] above a specified hypothetical reference surface serving to represent the surface of the Earth."
    },
    {
        "SrNo": "120",
        "english": "American National Standards Institute",
        "abbreviation": "ANSI",
        "english_description": "A non-profit organization in the US which pursues standardization within the industrial sector. It is also a member of ISO (International Standard Organization). ANSI itself, however, does not establish standards. Instead, it assists in reviewing proposals put forth by various standardizing bodies in the US and accordingly assigns a category code and number after approval."
    },
    {
        "SrNo": "121",
        "english": "American National Standards Institute.",
        "mongolian": "Америкын үндэсний стандартын хүрээлэн",
        "abbreviation": "ANSI ",
        "mongolian_description": "Америкын үндэсний стандартын хүрээлэн. АНУ дахь технологийн стандартын анхдагч байгуулга юм."
    },
    {
        "SrNo": "122",
        "english": "Amplitude Modulation",
        "abbreviation": "AM",
        "english_description": "CW modulation using amplitude variation in proportion to the amplitude of the modulating signal; usually taken as DSB-LC for commercial broadcast transmissions and DSB-SC for multiplexed systems."
    },
    {
        "SrNo": "123",
        "english": "An upgrade of the SIM card.",
        "abbreviation": "USIM",
        "english_description": "This upgrade enables use with IMT-2000."
    },
    {
        "SrNo": "124",
        "english": "Analog ",
        "mongolian_description": "Үргэллжилсэн хувьсах физик хэмжигдэхүүн , үргэлжилсэн мэдээллийг боловсруулах.",
        "english_description": "Pertaining to continuously variable physical quantities or to data presented in a continuous from, as well as to processes and functional units use the data. "
    },
    {
        "SrNo": "125",
        "english": "Analog computer ",
        "mongolian_description": "Удирдлага болон бусад системийн шинж чанар , зөвшөөрөл , боловсруулалт , боловсруулсан мэдээлэл нь аналог байдаг компьютер.",
        "english_description": " A computer whose operations are analogous to the behavior of another system and that accepts, processes, and produces analog data."
    },
    {
        "SrNo": "126",
        "english": "Analog system",
        "english_description": "A transmission method or way of sending voice, video and data-using signals (such as electricity or sound waves) that are continuously variable rather than discreet units as in digital transmissions. The first networks for mobile phones, built in the 1980s, were analog. Analog systems include AMPS, NMT and ETACS."
    },
    {
        "SrNo": "127",
        "english": "Analogous estimating ",
        "mongolian_description": " Далайц , үнэлгээ , нөөц , хугацаа , хэмжээ , жин г.м өмнөх хэмжигдэхүүнүүдийн  утгыг  ашиглан цаашид хэрэглэгдэх техникийн боловсруулалт хийх.",
        "english_description": "[Technique] an estimating technique that uses the values of parameters, such as scope, cost , budget, and duration or measures of scale such as size , weight , and complexity from a previous , similar activity as  the basis for estimating the parameters or measure for a future activity. A guide to the project management body of knowledge(PMBOK GUIDE ) – Fourth Edition"
    },
    {
        "SrNo": "128",
        "english": "Analog-to-Digital Converter",
        "abbreviation": "ADC",
        "english_description": "Converter that uniquely represents all analog input values within a specified total input range by a limited number of digital output codes."
    },
    {
        "SrNo": "129",
        "english": "Analysis ",
        "mongolian_description": "Системийг үүрэг , бүрдэл хэсгүүдээр нь хэсэг болгон хувааж , хоорондын холбоо хамаарлыг тодорхойлох судалгааны системийн явц. Хэрэглэгч болон тэдгээрт шаардлагатай мэдээллийг төрөлжүүлэхэд чиглэсэн хэрэглэгчийн судалгаа , цуглуулгын үе шат.",
        "english_description": " The process of studying a system by partitioning the system into parts (functions, components, or objects) and determining how the parts relate to each other.  Investigation and collection phase of user documentation development that aims to specify types of users and their information needs."
    },
    {
        "SrNo": "130",
        "english": "Analysis model ",
        "mongolian_description": "  Нэг болон хэд хэдэн суурь баазууд , шийдвэр хэмжигдэхүүнүүдийг нэгтгэн тооцоолох.",
        "english_description": "  Algorithm or calculation combining one or more base and/or derived measures with associated decision criteria."
    },
    {
        "SrNo": "131",
        "english": "Analyst ",
        "mongolian_description": " Техникийн байгууллагын гишүүн (системийн инженер , бизнес шинжээч , програм хөгжүүлэгч г.м)  алгоритмыг илэрхийлэх , тулгарсан асуудлыг шийдэх , хянах , боловсруулах , хөгжүүлэх зэрэгт мэргэшсэн ажилтан."
    },
    {
        "SrNo": "132",
        "english": "Ancestor (of a class)",
        "mongolian_description": "Бүх class-уудын эх анги. Бүх удамшсан class-уудын эх , анхдагч ерөнхий class",
        "english_description": " A generic ancestor of the class or a parent of  the class or an ancestor of a parent of the class. "
    },
    {
        "SrNo": "133",
        "english": "Ancestral box ",
        "mongolian_description": "Хоорондоо удамшсан өвөрмөц шинжүүдээрээ  эцэг , хүү холбоосоор холбогдсон хайрцгууд.",
        "english_description": " A box related to a specific diagram by a hierarchically consecutive sequence of one or more parent/child relationships."
    },
    {
        "SrNo": "134",
        "english": "Ancestral diagram",
        "mongolian_description": "ancestral box-г агуулсан диаграм.",
        "english_description": "A diagram that contains an ancestral box."
    },
    {
        "SrNo": "135",
        "english": "Angle diversity",
        "english_description": "A technique using multiple antenna beams to receive multipath signals arriving at different angles."
    },
    {
        "SrNo": "136",
        "english": "Annotate",
        "mongolian_description": "Програм бүрийн  эх код , хувилбарын танилцуулагдсан он , бичсэн хүн г.м жагсаалтуудыг гаргахад хэрэглэгддэг команд.",
        "english_description": " A command used for listing the latest version of each program’s source code line, along with the date, the file version it was introduced, and the person who committed it."
    },
    {
        "SrNo": "137",
        "english": "Annotation ",
        "mongolian_description": "Үндсэн мэдээлэл , тайлбар материал зэргийг агуулсан дагалдах мэдээлэл.",
        "english_description": " Further documentation accompanying a requirement such as background information and/or descriptive material."
    },
    {
        "SrNo": "138",
        "english": "Announcement ",
        "english_description": "An interaction – the invocation – initiated by a  client object resulting in the conveyance of information from that client object to a server object, requesting a function to be performed by that sever object."
    },
    {
        "SrNo": "139",
        "english": "Anomaly ",
        "mongolian_description": " Хүлээлтээс зүрүүтэй нөхцөл байдал шаардлага тодорхойлолтын загварын бичигбаримт эсвэл хэн нэгний үзэл бодол болон туршлага дээр тулгуурладаг.  Хүлээлтээс зүрүүтэй юугаар ч ажиглагдсан бичиг баримт эсвэл программ хангамж системийн үйл ажилгаань шалгах программ хангамжын бүтээгдхүүн лавлах бичиг баримт эсвэл зайлшгүй шалгах шаардлагатай бусад эх үүсвэрт тулгуурласан байдаг",
        "english_description": "Condition that deviates from expectations, based on requirements specifications design documents, user documents, or standards, or from someone’s perceptions or experiences. Anything observed in the documentation or operation of software or system that deviates from expectations based on previously verified software products, reference documents, or other sources of indicative behavior."
    },
    {
        "SrNo": "140",
        "english": "Antenna",
        "english_description": "The part of a radio transmission system designed to radiate or receive electromagnetic waves."
    },
    {
        "SrNo": "141",
        "english": "Antenna beamwidth",
        "english_description": "More properly referred to as the half-power beamwidth, this is the angle of an antenna pattern or beam over which the relative power is at or above 50% of the peak power."
    },
    {
        "SrNo": "142",
        "english": "Antenna birectivity diagram",
        "mongolian": "Антенн чиглүүлэлтын диаграмм",
        "mongolian_description": "Муруй шугамыг илэрхийлэхэд туйлын дотор кординатын тэгш өнцөгт, тоо хэмжээ нь тэнцүү өсгөлт антенн чиглүүлэгийг өөр өөр хавтгай гадаргуун конусд тодорхойлно."
    },
    {
        "SrNo": "143",
        "english": "Antenna directivity",
        "english_description": "This is the relative gain of the main beam of an antenna pattern to a reference antenna, usually an isotropic or standard dipole."
    },
    {
        "SrNo": "144",
        "english": "Antenna directivity diagram",
        "english_description": "A curve representing, in polar or cartesian coordinates, a quantity proportional to the gain of antenna in the various directions in a particular plane or cone."
    },
    {
        "SrNo": "145",
        "english": "Antenna gain",
        "english_description": "The ratio, usually expressed in decibels, of the power required at the input of a loss free reference antenna to the power supplied to the input of a given antenna to produce, in a given direction, the same field strength of the same power flux-density at the same distance. When not specified otherwise, the gain refers to the direction of maximum radiation. The gain may be considered for a specified polarization. Depending on the choice of the reference antenna, a distinction is made between: (a) absolute or isotropic gain (Gi), when the reference antenna is an isotropic antenna isolated in space; (b) gain relative to a half-wave dipole (Gd), when the reference antenna is a half-wave dipole isolated in space whose equatorial plane contains the given direction; (c) gain relative to a short vertical antenna (Gv), when the reference antenna is a linear conductor, much shorter than one quarter of the wavelength, normal to the surface of a perfectly conducting plane which contains the given direction."
    },
    {
        "SrNo": "146",
        "english": "A-O context diagram",
        "mongolian_description": "IDEFO загвар нь зөвхөн контент диаграммыг шарддаг: А-О диаграмм нь нэг хайрцагийг байгуулна. Тэрхүү контент диаграмм нь дээд зэргийн загварлагдсан оролт, дохио, гаралт мөн  механизмын хайрцагтай холбогдсон бүтэн загварын нэр юм. Загварын товчилсон нэр нь зорилго үзэл бодлыг баримталсан байна."
    },
    {
        "SrNo": "147",
        "english": "Application Layer Structure",
        "mongolian": " Хэрэглээний түвшний бүтэц",
        "abbreviation": "ALS "
    },
    {
        "SrNo": "148",
        "english": "Application-Specific Integrated Circuit",
        "abbreviation": "ASIC",
        "english_description": "An integrated circuit designed to perform a specific set of functions, usually within a specific device."
    },
    {
        "SrNo": "149",
        "english": "Assigned frequency",
        "english_description": "The centre of the assigned frequency band."
    },
    {
        "SrNo": "150",
        "english": "Assigned frequency band",
        "english_description": "The frequency band within which the emission of a station is authorized; the width of the band equals the necessary bandwidth plus twice the absolute value of the frequency tolerance. Where space stations are concerned, the assigned frequency band includes twice the maximum Doppler shift that may occur in relation to any point of the Earth’s surface",
        "description": "Note 1 – For certain services, the term “Assigned channel” is equivalent. Note 2 – For the definition of “Frequency tolerance” see § D."
    },
    {
        "SrNo": "151",
        "english": "Association of Radio Industries and Businesses (Japan)",
        "abbreviation": "ARIB",
        "english_description": "An incorporated body designated by the Ministry of Posts and Communication of the Japanese government to pursue effective radio utilization in the radio communication and broadcast sector. With regard to standardization, ARIB is currently primarily engaged in standardizing procedures for IMT-2000 (next generation mobile communication system) and digital TV broadcasting."
    },
    {
        "SrNo": "152",
        "english": "Asymmetrical Digital Line Subscriber",
        "abbreviation": "ADSL",
        "english_description": "A method to increase transmission speed in a copper cable. ADSL facilitates the division of capacity into a channel with higher speed to the subscriber, typically for video transmission, and a channel with significantly lower speed in the other direction."
    },
    {
        "SrNo": "153",
        "english": "asynchronous mode",
        "english_description": "A way to send transmissions by starting and stopping transmissions with a code rather than sending transmissions at specific time intervals as in synchronous mode. Asynchronous communication devices do not have to be synchronized with a clocking signal, which is required with synchronous transmission. Also frequently referred to as ATM or Asynchronous Transfer Mode. Can also mean that there are different capacities for data transfer in each direction, for example the old 90/200 baud modems and the new ADSL. See also synchronous mode."
    },
    {
        "SrNo": "154",
        "english": "Asynchronous Transfer Mode",
        "abbreviation": "ATM",
        "english_description": "A technology for broadband transmission of high-capacity telecommunications signals. In addition to high-capacity signal transmission, ATM provides considerable flexibility, since the individual subscriber is able to adapt the capacity of a switched connection to current requirements."
    },
    {
        "SrNo": "155",
        "english": "Atomicity Consistency Isolation Durability",
        "mongolian": "Ажиллах хугацаанд холболт найдвартай байх",
        "abbreviation": "ACID",
        "mongolian_description": "-          Өгөгдлийн баазтай харилцах холболт найдвартай байх"
    },
    {
        "SrNo": "156",
        "english": "Attenuation",
        "english_description": "A decrease in signal magnitude between two points. These points may be along a radio path, transmission line or other device."
    },
    {
        "SrNo": "157",
        "english": "Attitude-stabilized satellite",
        "english_description": "A satellite with at least one axis maintained in a specified direction, e.g. toward the centre of the Earth, the Sun or a specified point in space."
    },
    {
        "SrNo": "158",
        "english": "Authentication Center",
        "abbreviation": "AUC",
        "english_description": "A device, usually located in the HLR of a GSM system that manages the authentication or encryption information associated with individual subscribers."
    },
    {
        "SrNo": "159",
        "english": "Autocorrelation",
        "english_description": "The complex inner product of a sequence with a shifted version of its self. It is a measure of how closely a signal matches a delayed version of itself shifted n units in time."
    },
    {
        "SrNo": "160",
        "english": "Automatic Gain Control",
        "abbreviation": "AGC",
        "english_description": "System which holds the gain and, accordingly, the output of a receiver substantially constant in spite of input- signal amplitude fluctuations."
    },
    {
        "SrNo": "161",
        "english": "Automatic Power Control",
        "abbreviation": "APC",
        "english_description": "A technique of measuring the performance of a radio channel and adjusting the power of the transmitter to a level appropriate for link characteristics."
    },
    {
        "SrNo": "162",
        "english": "Automatic Retransmission Request",
        "abbreviation": "ARQ",
        "english_description": "A signal used in digital communications systems used to signal the transmitting device to retransmit a block of data."
    },
    {
        "SrNo": "163",
        "english": "Average power",
        "english_description": "An indication of the peak power averaged over time. Usually applied to pulsed systems where the carrier power is switched on and off."
    },
    {
        "SrNo": "164",
        "english": "Back",
        "mongolian": "Буцах",
        "mongolian_description": "Browser-н урагш бас хойшлуулах товч нь дараагийн болон өмнө үсзсэн хуудсыг харуулна."
    },
    {
        "SrNo": "165",
        "english": "Backbone",
        "mongolian_description": "Backbone нь өндөр хурдны харилцааны холбоо хэрэглэхэд үндсэн холбоос хооронд том сүлжээнд жижиг дэд сүлжээ бий болно.Холболт нь суваган оптик кабель юм."
    },
    {
        "SrNo": "166",
        "english": "Backbone",
        "mongolian": "Цөм сүлжээ",
        "mongolian_description": "Backbone нь өндөр хурдны харилцааны холбоо хэрэглэхэд үндсэн холбоос хооронд том сүлжээнд жижиг дэд сүлжээ бий болно.Холболт нь суваган оптик кабель юм."
    },
    {
        "SrNo": "167",
        "english": "Background job",
        "mongolian_description": " Хэрэглэгч өөр ажил хийж байх үед компьютерт өөр үйлдэл хийгдэж байхыг хэлнэ.Хэвлэх үйл явц нь backround job-ийн энгийн жишээ юм ."
    },
    {
        "SrNo": "168",
        "english": "Background job",
        "mongolian_description": " Хэрэглэгч өөр ажил хийж байх үед компьютерт өөр үйлдэл хийгдэж байхыг хэлнэ.Хэвлэх үйл явц нь backround job-ийн энгийн жишээ юм ."
    },
    {
        "SrNo": "169",
        "english": "Backing store",
        "mongolian": "Арын нөөц",
        "mongolian_description": "Програмын эх хувилбарын мэдээлэл,өгөгдлийг хуулахад програм эвдэрч эсвэл алга болдог.Хэрэв систем бүтэлгүйтвэл алдагдвал дахин сэргээхэд нягт нарийн зөв өгөгдөл хийх хэрэгтэй."
    },
    {
        "SrNo": "170",
        "english": "Backing store",
        "mongolian": "Арын нөөц",
        "mongolian_description": "Энэ нь томоохон их хэмжээтэй мэдээлэл гаднаас орж ирэхэд шууд нөөцөд нэвтэрдэг.Ихэнх арын нөөц хадгаламж нь соронзон орон эсвэл оптик багтаамжинд хэрэглэдэг. "
    },
    {
        "SrNo": "171",
        "english": "Backround",
        "mongolian": "Фон",
        "mongolian_description": "Вэб дизайнд, хуудасны фон арын хэв маяг эсвэл арын фон өнгө."
    },
    {
        "SrNo": "172",
        "english": "Backup",
        "mongolian": "Нөөц",
        "mongolian_description": "Програмын эх хувилбарын мэдээлэл,өгөгдлийг хуулахад програм эвдэрч эсвэл алга болдог.Хэрэв систем бүтэлгүйтвэл алдагдвал дахин сэргээхэд нягт нарийн зөв өгөгдөл хийх хэрэгтэй."
    },
    {
        "SrNo": "173",
        "english": "Backword compatible",
        "mongolian": "Хуучинтай тохирч ажилна",
        "mongolian_description": "Компьютерийнн систем эсвэл програм хангамж загварчилагдахдаа хуучин систем эсвэл програм хангамжтай хамтран,тэхээр энэ нь техник хангамж шинийг авах шаардлаггүй гэсэн үл мөн өгөгдөл нь хуучин ком-н системтэй үргэлжилж ашиглагдана."
    },
    {
        "SrNo": "174",
        "english": "Band",
        "english_description": "In wireless communication, band refers to a frequency or contiguous range of frequencies. Currently, wireless communication service providers use the 800 MHz, 900 MHz and1900 MHz bands for transmission in the United States"
    },
    {
        "SrNo": "175",
        "english": "Band width",
        "mongolian": "Зурвасын өргөн ",
        "mongolian_description": "Зурвасын өргөн  нь холбооны сувгийн багтаамжийн хэмжигдэхүүн юм. Энэ нь сувгийн давтамжтай далайцыг гараар хийж болно. BW нь магадгүй давтамж өгдөг, иймээс 3 килогерц эсвэл дамжуулах чанарыг 1сек-н хэсэг бүрээр, тийм учир 63 кило дамжуулагчын сувгийн багтаамж. Дамжуулах чадварын сүлжээний хурдны талаар олон удаа хийдэг.Ж нь:суваг тодорхойлоход байж болох нь сүлжээний хурд энэ нь 56кг эсвэл 64к,өөрөөр хэлбэл 56 kbps эсвэл 64 kbps."
    },
    {
        "SrNo": "176",
        "english": "Band-pass filter",
        "english_description": "A radio wave filter having a specific range of frequencies it is designed to pass, while rejecting frequencies outside the pass-band."
    },
    {
        "SrNo": "177",
        "english": "Bandwidth",
        "english_description": "The information-carrying capacity of a communications channel. Usually expressed in Hertz (cycles per second) for analog circuits and in bits per second (bps) for digital circuits."
    },
    {
        "SrNo": "178",
        "english": "Bandwidth Time Product",
        "abbreviation": "BT",
        "english_description": "The result obtained by multiplying the system bandwidth by the signal duration. As a general rule, the system bandwidth must be approximately equal to the reciprocal of the signal duration to produce an output signal of the same general form as the input, i.e., BT»1."
    },
    {
        "SrNo": "179",
        "english": "Banner ad",
        "mongolian_description": "Вэб хуудсан дээр дарж дөрвөлжин хэлбэртэй зарлал гарж ирдэг"
    },
    {
        "SrNo": "180",
        "english": "Bar  Chart ",
        "mongolian": "Шугаман хүснэгт",
        "mongolian_description": "Мэдээллийг хүснэгт хэлбэрээр харуулах график арга мэдээллийн бүх хэсэг нь давхарга хэлбэртэй (төлөвтэй) урт нь мэдээллийн илэрхийллийн хэмжээтэй пропорциональ (тэнцүү)"
    },
    {
        "SrNo": "181",
        "english": "Bar code",
        "mongolian": "Шугаман код",
        "mongolian_description": "Бүтээгдэхүүн дээр хэвлэгдсэн дундаа зайтай өөр өөр давтамжтай босоо зураасан байгуулалт. Зай болон зураасан давтамж нь тоон коп ба компьютер бүтээгдэхүүнийг тодорхойлох боломжийг олгодог. Скайннер ( дүрс буулгагч ) нь кодыг уншдаг. Зураасан код нь ихэнхдээ. Нөөцийг хянадаг"
    },
    {
        "SrNo": "182",
        "english": "Base station",
        "english_description": "A land station in the land mobile service."
    },
    {
        "SrNo": "183",
        "english": "Base station",
        "english_description": "The central radio transmitter/receiver that maintains communications with a mobile radio telephone within a given range."
    },
    {
        "SrNo": "184",
        "english": "Base Station",
        "abbreviation": "BS",
        "english_description": "The equipment on the network side of a wireless communications link. The base station contains the tower, antennas and radio equipment needed to allow wireless communications devices to connect with the network."
    },
    {
        "SrNo": "185",
        "english": "Base Station Controller",
        "abbreviation": "BSC",
        "english_description": "A device and software associated with a base station that permits it to register mobile phones in the cell, assign control and traffic channels, perform handoff and process call setup and termination"
    },
    {
        "SrNo": "186",
        "english": "Base Station Identity Code",
        "abbreviation": "BSIC",
        "english_description": "A unique code contained in messages on the broadcast channels of a cell or base station that uniquely identifies the base station."
    },
    {
        "SrNo": "187",
        "english": "Base Station Subsystem",
        "abbreviation": "BSS",
        "english_description": "That portion of a GSM network that includes the base station, base station controller and transcoders (if used)."
    },
    {
        "SrNo": "188",
        "english": "Base Transceiver Station",
        "abbreviation": "BTS",
        "english_description": "Although specifications differ for each system, the BTS effects radio communication with mobile stations (MS) via its respective radio access system and transmits/receives signals to/from connected radio network controllers (RNC) located along transmission routes."
    },
    {
        "SrNo": "189",
        "english": "Baseband signal",
        "english_description": "A signal with frequency content centered around DC. Typically the modulating signal for an RF carrier."
    },
    {
        "SrNo": "190",
        "english": "Baseline",
        "mongolian": "Эхлэлийн шугам",
        "mongolian_description": "Том үсэг байрлах харагдахгүй шугам"
    },
    {
        "SrNo": "191",
        "english": "Basic MUF",
        "english_description": "The highest frequency at which a radio wave can propagate between given terminals below the ionosphere on a specified occasion, by ionospheric refraction alone.",
        "description": "Note – The acronym MUF stands for “Maximum Usable Frequency”."
    },
    {
        "SrNo": "192",
        "english": "Basic Trading Area",
        "abbreviation": "BTA",
        "english_description": "A geographic area over which a PCS operator is licensed to provide service. BTAs are a group of counties in metropolitan areas having common financial, commercial and economic ties and were first used to license PCS service in the middle '90s. BTAs are about the size of a cellular MSA and cross state lines in some instances. BTAs are used by the Rand-McNally corporation to summarize economic data. BTAs are grouped into larger areas called MTAs"
    },
    {
        "SrNo": "193",
        "english": "Basic transmission loss",
        "english_description": "The transmission loss that would occur if the antennas were replaced by isotropic antennas with the same polarization as the real antennas, the propagation path being retained, but the effects of obstacles close to the antennas being disregarded.",
        "description": "Note 1 – The basic transmission loss is equal to the ratio of the equivalent isotropically radiated power of the transmitter system and the power, available from an isotropic receiving antenna. Note 2 – The effect of the local ground close to the antenna is included in computing the antenna gain, but not in the basic transmission loss."
    },
    {
        "SrNo": "194",
        "english": "Basig",
        "mongolian": "үндсэн",
        "mongolian_description": "Бүх зориулалтанд ашиглах анхан шатны тэмдэгтэн зааварчилгааны код. Өндөр түвшний програмын хэл. Dartmouth коллежд анх үүссэн."
    },
    {
        "SrNo": "195",
        "english": "Batch file",
        "mongolian": "Батч файл",
        "mongolian_description": "Өгөгдлийн файл гэдэг нь ганц файл бөгөөд нэг эсвэл олон үйлдлийн системийн command-г багтаах. Өгөгдлийн файл нь ажилангуут бүх тушаал ( үйлдэл) нь гүйцэтгэгддэг  Гэхдээ файлийн өргөтгөл нь .bat-аар илэрхийлэгддэг."
    },
    {
        "SrNo": "196",
        "english": "Batch Mode",
        "mongolian": "Багцлах горим",
        "mongolian_description": "Бүх бүлэг нь нийлээд нэг үйл ажиллагаа болно"
    },
    {
        "SrNo": "197",
        "english": "Batch processing",
        "mongolian": "Багцлах боловсруулалт",
        "mongolian_description": "Ганц ашигтай боловсруулалт хийхээс нь өмнө бүх мэдээллийн оролтууд нь нэгдэхийг багцлах боловсруулалт гэнэ. Энэ арга нь мөн компьютер хэрэглэгч нь салангад ажилуудыг тушаасан үед нийлээд багц болон боловсруулахыг хэлнэ"
    },
    {
        "SrNo": "198",
        "english": "Batch upload",
        "mongolian": "Багцлан илгээх",
        "mongolian_description": "Олон файлийг нэг зэрэг явуулах процесс нэг нэгээр нь явуулсанаас дээр. Энгийн нь PTP."
    },
    {
        "SrNo": "199",
        "english": "Battery",
        "mongolian": "Цэнэг хураагуур",
        "mongolian_description": "Зөөврийн компьютер гэх мэт хэрэгслүүдэд ашигладаг цахилгаан тэжээлд залгаагүй ч гэсэн ажиллах боломжтой бие даасан тэжээлийн үүсгүүр."
    },
    {
        "SrNo": "200",
        "english": "Baud",
        "mongolian": "Бауд",
        "mongolian_description": "цуваа өгөгдлийг дамжуулах хурдыг хэмжихэд ашигладаг нэгж. Утасны шугамаар өгөгдөл дамжуулах хурд. Ойролцоогоор 1 секундэд 1 bit-ийн хурдта тэнцүү."
    },
    {
        "SrNo": "201",
        "english": "Baud rate",
        "mongolian": "Бауд үзүүлэлт",
        "mongolian_description": "Цуваа өгөгдөл дамжуулах хурдыг хэмжих нэгж."
    },
    {
        "SrNo": "202",
        "english": "Benchmark",
        "mongolian": "Харьцуулсан үзүүлэлт",
        "mongolian_description": "Компьютерийн үзүүлэлтийг хэмжих зорилготой компьютерийн үүрэг бүхий загвар цогц юм. Энэ үүрэг ( шинжилгээ) нь янз бүрийн програм хангамж эсвэл техник хангамжийг үзүүлэлтийн хоорогд харьцуулах. Жишээ нь : Сүлжээгээр 1mb файлийг хэр хурдан хуулах вэ, нэг минутанд хэдэн хуудас хэвлэж чадах вэ, 1000 мэдээллийн санг дискдээ хуулхад хэр их хугацаа шаардагдах вэ. Харьцуулсан үзүүлэлт нь мөн компьютерийн системийг шалгахад ашигладаг систем зогсохоос өмнөх амжилтай гүйцэтгэгдсэн үзүүлэлтийг харуулдаг."
    },
    {
        "SrNo": "203",
        "english": "Bespoke system",
        "mongolian": "Захиалгат систем",
        "mongolian_description": "Энэ систем нь тодорхой хэрэглэгчдэд зориулагдсан Энгийн биш техник хангамжийг багтаасан ба тусгайлан програмчлагдсан байдаг Энэ нь маш үнэтэй боловч маш том байгуулагуудад зориулагдсан цорын ганц арга юм"
    },
    {
        "SrNo": "204",
        "english": "Beta test",
        "mongolian": "Бета тест",
        "mongolian_description": "Бета шалгалт нь онцгой эрхтэй хэрэглэгчдэд өөрсдийн саналаа солилцох хувилбар юм.  Альфа шалгалт хийгдээд судалсаны дараа тодорхой хэмжээний өөрчлөлт оруулсаны дараах үр дүн нь Бета шалгалт юм.  Бета шалгалтын хувилбар нь ихэвчлэн бүтээгдэхүүний сүүлийн үр дүн байдаг."
    },
    {
        "SrNo": "205",
        "english": "Beta Version",
        "mongolian": "Бета хувилбар",
        "mongolian_description": "Энэ бол програм хангамжийн дуусаагүй хувилбар юм."
    },
    {
        "SrNo": "206",
        "english": "Binary",
        "mongolian": "Хоёртын тоолол",
        "mongolian_description": "2тын тоон тооллын систем 1 эсвэл 0-ээр илэрхийлэгддэг"
    },
    {
        "SrNo": "207",
        "english": "Binary operator",
        "mongolian": "Хоёртын тоололын оператор",
        "mongolian_description": "This is an operator (such as + or -) which operates on two items of data."
    },
    {
        "SrNo": "208",
        "english": "Binary Phase Shift Keying",
        "abbreviation": "BPSK",
        "english_description": "A type of phase modulation using 2 distinct carrier phases to signal ones and zeros."
    },
    {
        "SrNo": "209",
        "english": "Binary representation",
        "mongolian": "Хоёртын тоололын илэрхийлэл",
        "mongolian_description": "Тоололын систем нь 0 ба 1 гэсэн 2 тоон дээр суурилдаг. Энэ нь 2 суурьт систем ба хүмүүсийн мэдэх 10 суурьт ( 0-оос 9) системтэй харьцуулагддаг. Компьютердэх бүх мэдээлэл нь хамгийн бага түвшний хоёртын томъёололоор илэрхийлэгддэг."
    },
    {
        "SrNo": "210",
        "english": "Binary Search",
        "mongolian": "Хоёртын тоололын хайлт",
        "mongolian_description": "Мэдээллийг хайх энэ арга нь ямар нэг дараалалд багтсан алгоритмийг хайх хугацааг бууруулахын тулд хагас өгөгдлийн сонгон авч хайх ба мэдээллийг хаана байрлаж байгааг олох хүртэл давтана"
    },
    {
        "SrNo": "211",
        "english": "Binary tree",
        "mongolian": "Хоёртын тоололын мод",
        "mongolian_description": "Хоёртын тоололын мод гэдэг нь зангилагаар хийгдсэн мэдээллийн бүтэц юм. Бүх зангилаа нь эцэг зангилаатай ба хамгийн ихтэй 2 удамшсан зангилаатай байна"
    },
    {
        "SrNo": "212",
        "english": "BIOS",
        "mongolian_description": "Энгийн оролт гаралтын системийн товчилсон хэлбэр юм. Компьютерийн оролт гаралтыг зохицуулах үйлдлийн системийн хэсэг. Энэ техник хангамжийн тодорхой шинжийг ашигладаг үйлдлийн систем. Нэр нь үйлдлийн системийн нэг хэсэгтэй холбогдолтой Янз бүрийн техник хангамжийн загвар эсвэл боловсруулалтыг хэрэглэдэг олон техник хангамжийн үйлдлийн системүүд солигддог. Хэрвээ BIOS нь солигдвол энэ үйлдлийн системийн өөр хэсгүүд нь солигдох шаардлаггүй."
    },
    {
        "SrNo": "213",
        "english": "Bit",
        "mongolian": "Бит",
        "mongolian_description": "Бит бол компьютерийн өгөгдлийг тодорхойлдог хэмжигдэхүүний  хамгийн бага нэгж юм."
    },
    {
        "SrNo": "214",
        "english": "Bit Energy-to-Noise Density",
        "abbreviation": "Eb /N0",
        "english_description": "The ratio of bit energy to noise density. This value is used to specify the lower limit of operation in most digital communications systems and is also used to measure radio channel performance."
    },
    {
        "SrNo": "215",
        "english": "Bit Error Rate",
        "abbreviation": "BER",
        "english_description": "A ratio of the number of errors to data bits received on a digital circuit. BER is usually expressed in exponential form."
    },
    {
        "SrNo": "216",
        "english": "Bit Error Rate Tester",
        "abbreviation": "BERT",
        "english_description": "A device used to measure the bit error rate performance of a data circuit."
    },
    {
        "SrNo": "217",
        "english": "Bit interval",
        "english_description": "The amount of time, usually in milliseconds or microseconds, a binary one is in the \"on\" position."
    },
    {
        "SrNo": "218",
        "english": "Bitmap",
        "mongolian": "Бит зураг",
        "mongolian_description": "Мэдээллийг бүтэцийг харуулдаг битийн дүрслэл. Зурсан эсвэл будсан багц нь график дэлгэц дээр битийн буулгалтанд нөлөөлдөг эхэвчлэн дэлгэцийн буулгалт гэж нэрлэдэг бүх бүт нь дэлгэцэн дээр байрлах тусгай пикселийг харуулдаг."
    },
    {
        "SrNo": "219",
        "english": "Bitmapped graphics",
        "mongolian": "Бит зураг нь график",
        "mongolian_description": "A method of creating images where a picture is held as a bit map that is, the state of each individual pixel is stored. Text in such a picture would also be stored in the same bit map. Such drawings use a lot of storage space, because even."
    },
    {
        "SrNo": "220",
        "english": "Bits per second",
        "abbreviation": "BPS",
        "mongolian_description": "Өгөгдөл дамжуулах хурдыг хэмжих нэгж."
    },
    {
        "SrNo": "221",
        "english": "Bits per Second",
        "abbreviation": "BPS",
        "english_description": "The units usually used to express data transmission speed; the number of pieces of information transmitted per second."
    },
    {
        "SrNo": "222",
        "english": "Bitwise operator",
        "mongolian": "Ганц битийн ажиллах түвшэний оператор",
        "mongolian_description": "Янз бүрийн битийн түвшинд мэдээллийг чиглүүлэх оператор."
    },
    {
        "SrNo": "223",
        "english": "Blind Carbon Copy",
        "abbreviation": "BCC",
        "mongolian_description": "Майл хаягт хэн нэгэнд bcc mail явуулна гэдэн нь үндсэн хүлээн авагч мэдэхгүйгээр хуулбарийг явуулахын хэлнэ ( Үүнийг сайн нягтал!!!)"
    },
    {
        "SrNo": "224",
        "english": "Block code",
        "english_description": "A family of codes having a one-to-one mapping between ksymbol source words and n-symbol code words."
    },
    {
        "SrNo": "225",
        "english": "Block diagram",
        "mongolian": "Блок схем",
        "mongolian_description": "Хайрцагаар хийсэн диаграмм ба янз бүрийн техник болон програм хангамжийн эд анги ба холболтыг харуулсан шугаман хаягын диаграмм."
    },
    {
        "SrNo": "226",
        "english": "Block Error Rate",
        "abbreviation": "BLER",
        "english_description": "A ratio of the number of erroneous blocks to the total number of blocks received on a digital circuit. Block error rate (BLER) is used for W-CDMA performance requirements tests (demodulation tests in multipath conditions, etc). BLER is measured after channel deinterleaving and decoding by evaluating the Cyclic Redundancy Check (CRC) on each transport block."
    },
    {
        "SrNo": "227",
        "english": "Blocking probability",
        "english_description": "The statistical probability that a telephone connection cannot be established due to insufficient transmission resources in the network. Usually expressed as a percentage or decimal equivalent of calls blocked by network congestion during the busy hour."
    },
    {
        "SrNo": "228",
        "english": "Blog",
        "mongolian": "Блог",
        "mongolian_description": "Вэб протоколийн нэг. Энэ нь хувийн вэб дээрх тэмдэглэл бүх хэрэглэгчидэд зориулагдсан маш хурдан бас энгийн хувийн мэдээлэлээ нийтлэх боломжтой вэб хуудас юм."
    },
    {
        "SrNo": "229",
        "english": "Bluetooth",
        "mongolian_description": "Bluetooth бол техник загвар ба утасгүй төхөөрөмжүүдийг холбодог. Жишээ нь: Утас, хувийн болон суурин компьютер ба төхөөрөмжүүдийг хооронд нь холбодог байгууламж юм."
    },
    {
        "SrNo": "230",
        "english": "Bluetooth",
        "english_description": "A short range radio technology developed by Ericsson and other companies that makes it possible to transmit signals over short distances between telephones, computers and other devices without having to interconnect them with wires."
    },
    {
        "SrNo": "231",
        "english": "Bluetooth headset ",
        "mongolian": "Bluetooth чихэвч",
        "mongolian_description": "Bluetooth протокол ашигладаг утасгүй чихэвч."
    },
    {
        "SrNo": "232",
        "english": "Body text",
        "mongolian": "Эх бие",
        "mongolian_description": "Баримтан загварын үндсэн хэсэг."
    },
    {
        "SrNo": "233",
        "english": "Bold",
        "mongolian": "Тод",
        "mongolian_description": "Үсэг эсвэл үгийг өөр хэлбэрээр бичвэр дундаас тодотгож онцолж харуулах."
    },
    {
        "SrNo": "234",
        "english": "Bookmark",
        "mongolian": "Хавчуурга",
        "mongolian_description": "Өөрийн бровсер -доо янз бүрийн вэб хуудас эсвэл вэб-ийн байрлалын линк-ийг хадгалах. Bookmark эхэвчлэн Netscape -д хэрэглэгддэг,Internet Explorer -ийн хувьд Favorite-ийг хэрэглэдэг."
    },
    {
        "SrNo": "235",
        "english": "Boolean ",
        "mongolian_description": " нөхцөл шалгах нь зөв буруу гэх хоёр утгатай зүйлийн нэгийг илэрхийлжх хэмжигдхүүн юм.1 бол тийм , 0 бол үгүй гэх нөхцөл шалгах операторууд болох ба эсвэл үгүй бхо эдгээр нөхцөл шалгах хувсамхай хэмжигдхүүнийг хэрэглэгддэг "
    },
    {
        "SrNo": "236",
        "english": "Boolean algebra ",
        "mongolian_description": "нөхцөл шалгах алгебрийн тооцоолол. энэ нь бодит үнэн зөв хүснэгтиййн дагуу бодит утгуудыг боловсруулах дүрмийн багц юм."
    },
    {
        "SrNo": "237",
        "english": "Boolean field ",
        "mongolian": "Нөхцөл шалгах ажлийн талбар ",
        "mongolian_description": "хоёр утгийн нэгийг нь багтаасан мэдээллийн бааз юм. зөв буруу нэг эсвэл тэг гэх мэт "
    },
    {
        "SrNo": "238",
        "english": "Boolean operator ",
        "mongolian_description": "нөхцөл шалгах операторууд үйлдлүүд болох ба эсвэл биш бол эдгээр нь нөхцлүүдийг шалган зөв үр дүнг гаргадаг  "
    },
    {
        "SrNo": "239",
        "english": "Boot ",
        "mongolian_description": "компьютерийг асаахад ачааллах програмууд тэдгээрийн зааварын механик кодын богино дараалал.Энэ нь санах ойд хадгалагддаг ба төхөөрөмжийг асаахад идэвхжинэ,энэхүү процессийг зарим тохиолдолд ачааллах гэж нэрлэдэг.Энэ нь үйлдлийн системийг хэрэглэхэд бэлэн болгодог "
    },
    {
        "SrNo": "240",
        "english": "Boot file",
        "mongolian_description": "Энэ нь компьютер асаалттай байх үед зааврын дагуу гүйцэтгэнэ"
    },
    {
        "SrNo": "241",
        "english": "Boot up ",
        "mongolian_description": "компьютер асаах"
    },
    {
        "SrNo": "242",
        "english": "Border",
        "mongolian_description": "paragraph(шинэ бүлэг) график хүснэгт зэргийн бусад мэдээлэл, баримт бичиг ялгаж өгөхийн тулд ашигладаг.Үүнийг ихэвчлэн бичиг  баримт боловсруулах web хуудас хүснэгт ба график зэргийн хийж боло"
    },
    {
        "SrNo": "243",
        "english": "Bose-Chaudhuri-Hocquenghem Code",
        "abbreviation": "BCH code",
        "english_description": "A family of powerful cyclic block forward error correction codes used in the transmission of data."
    },
    {
        "SrNo": "244",
        "english": "Bot",
        "mongolian_description": "веб хуудсан дахь дараалал хуудас руу холбож өгдөг. автомат програм бөгөөд холбож өөрийгөө дараа хэд хэдэн үйлдлийг хийдэг жишээлбэл вэб хуудсан дахь үгсийг бичдэг."
    },
    {
        "SrNo": "245",
        "english": "Bounce",
        "mongolian_description": "е- майл илгээсэн хүлдээ буцаж мрсэн үед е-майл боунс гэдэг."
    },
    {
        "SrNo": "246",
        "english": "Branch ",
        "mongolian_description": "тестийн үр дүнгээс хамаараад дрограм өөр өөр коммандад гүйцэтгэдэг."
    },
    {
        "SrNo": "247",
        "english": "Breadcrumb trail ",
        "mongolian_description": "веб хуудас хэрэглэгчид одоо ачааллаж байгаа хуудсан дээр холбоотой веб сайт харуулдаг програмын хэсэг энэ нь хэрэглэгчдыг хааж байгаа байрлал бүрийг харуулдаг."
    },
    {
        "SrNo": "248",
        "english": "Break point ",
        "mongolian_description": " програмчлал хийх үед break point суулгаж өгснөөр хэрэглэсэн газруудад гүйцэтгэлийг зогсоож программист тэр цэг дээрх дрограмын бүтцийг шалгах боломжтой хувьсах хэмжигдхүүний утга "
    },
    {
        "SrNo": "249",
        "english": "Bridge ",
        "mongolian_description": " хоёр хязгаарлагдмал талбайтай сүлжээн хооронд холбосон хангах гүүр энэ нь бусад сиситемийн өгөгдлийг зохистой байдлаар хөрвүүлдэг. "
    },
    {
        "SrNo": "250",
        "english": "Broadband",
        "english_description": "This term has a number of meanings. It was coined originally to describe a channel having more bandwidth than needed to carry a standard voice grade channel. It is also the term for transmission equipment and media that can support a wide range of electromagnetic frequencies. Broadband frequencies can transmit more data and at a higher speed than narrowband frequencies. In general, paging services and traditional voice grade wireless phones are considered narrow-band. High speed data and video communications are usually considered broadband services and employ broadband equipment."
    },
    {
        "SrNo": "251",
        "english": "Broadcast ",
        "mongolian_description": "сүлжээнд өгөгдлийг илгээдэг сүлжээний зангиллаа(холбоос) юм. "
    },
    {
        "SrNo": "252",
        "english": "Broadcast Channels",
        "abbreviation": "BCH",
        "english_description": "A group of downlink point to multipoint logical channels used by mobiles to synchronize to and receive information necessary to access a cell in GSM, cdma2000, and WCDMA systems"
    },
    {
        "SrNo": "253",
        "english": "Broadcast Control Channel",
        "abbreviation": "BCCH",
        "english_description": "A downlink point to multipoint logical channel in GSM and cdma2000 systems used to send identification and organization information about common control channels and cell services"
    },
    {
        "SrNo": "254",
        "english": "Browse ",
        "mongolian_description": " бидний мэддэгээр интэрнет explorer гэх мэт чиглүүлэгч буюу програм хангамжийг хэрэглэн вебд өөр хуудсыг үзэх ашиглах үйлдэл."
    },
    {
        "SrNo": "255",
        "english": "Browser ",
        "mongolian_description": "коипвютэер ба дагалдах хэрэгсэл буюу принтер хоёрын хооронд компьютерийн санах ойноос өгөгдөл шилжүүлэх талбайн. компьютер нь принтерлүү өгөгдлийг принтэрлхээс хурдан дамжуулах ёстой бөгөөд принтерийн түүний хурдыг гүйцэтгэх үед мэдээлэл түр зуур хадаглагдсан байх ёстой."
    },
    {
        "SrNo": "256",
        "english": "Bullet ",
        "mongolian_description": " ямар нэг зүйлсийн жагсаалтын эхлүүлэхэд хэрэглэгддэг тэмдэг."
    },
    {
        "SrNo": "257",
        "english": "Bullet in board ",
        "mongolian_description": "хэрэглэгчид ямар нэгэн мэдээллийг хэрэглэгчид уншигдхаар байрлуулж болдог зарлалын самбарын электрон эквалент юм"
    },
    {
        "SrNo": "258",
        "english": "Bullet point ",
        "mongolian_description": "bullet ээр хэрэгжиж буй зүйлсийн жагсаалт "
    },
    {
        "SrNo": "259",
        "english": "Bus network ",
        "mongolian_description": " хягаарлагдмал талбайг хамарсан сүлжээний төрөл бөгөөд хэрэгсэл бүр нь холбооны шугамтайгаа холбогдсон байдаг  bus н дохио илгээдэг зүйл энэ нь хос шугамтай байдаг. жишээ нь зэргэлдэх кабел "
    },
    {
        "SrNo": "260",
        "english": "Button",
        "mongolian_description": "ямар нэг үйлдэл хийхийн тулд дараах товч дээр дардаг"
    },
    {
        "SrNo": "261",
        "english": "Buy",
        "mongolian": "Эвдрэл",
        "mongolian_description": "програмд алдаа зааснаар согог дутагдал гарах "
    },
    {
        "SrNo": "262",
        "english": "Byte",
        "mongolian_description": " гол төлөв 8н битээр бүр байх ба нэг таних тэмдгийг илэрхийлж байдаг. энэ нь жижиг тоог буюу илэрхийлхэд ашигладаг."
    },
    {
        "SrNo": "263",
        "english": "Cable",
        "mongolian": "Кабель",
        "mongolian_description": "Төхөөрөмжүүдийн хэд хэдэн хэсгүүдийг холбох бүлэг утсыг кабель гэнэ. Зэрэгцээ кабель нь ерөнхийдөө  принтерийг компьютерт холбодог. Цуваа кабель нь модемийг компьютерт холбодог."
    },
    {
        "SrNo": "264",
        "english": "Cable modem ",
        "mongolian": "Кабель модем",
        "mongolian_description": "Кабль модем нь өндөр хурдны интернетээр хангахын тулд  кабель телевизийн үндсэн сүлжээнд ашигладаг."
    },
    {
        "SrNo": "265",
        "english": "Cache ",
        "mongolian": "Кэш Ram",
        "mongolian_description": "Үндсэн санах ойн хэсэг ба CPU ба нөөцийн хооронд байдаг хэсэг. Энэ нь өгөгдлийн маш өндөр хурд үзүүлдэг учир программын хэсгүүд ба түүнд хамаарах өгөгдлүү энэ өндөр хурд авахын тулд кэш дээр хадгалагддаг. Кэш санах ой ашигласнаар боловсруулах хугацааг маш их хэмжээгээр багасгаж чадна."
    },
    {
        "SrNo": "266",
        "english": "Cancel ",
        "mongolian": "Цуцлах",
        "mongolian_description": "Ажиллагааг бүрэн дуусахаас өмнө зогсоох, жишээ нь хэвлэх ажиллагааг дуусгах"
    },
    {
        "SrNo": "267",
        "english": "Capacity",
        "mongolian": "Багтаамж",
        "mongolian_description": "Санах ойн хэмжээ ба килобайт (KiloByte) мегабайт(MegaByte), гегабайтаар(GigaByte)–аар хэмжигддэг."
    },
    {
        "SrNo": "268",
        "english": "Capslock",
        "mongolian": "Том үсэгний товчлуур",
        "mongolian_description": "Энэ нь бүх үсгийг томоор бичихийн тулд дардаг гарны товчлуур"
    },
    {
        "SrNo": "269",
        "english": "Capture area",
        "english_description": "Area associated with a receiving station for a given service and a specified frequency within which, under specified technical conditions, radiocommunications may be established with one or several transmitting stations.",
        "description": "Note – The notes concerning the coverage area (of a transmitting station) are valuable also, mutatis mutandis, for the capture area."
    },
    {
        "SrNo": "270",
        "english": "Capturing",
        "mongolian": "Өгөгдөл оруулалт",
        "mongolian_description": "Компьютерт оруулах өгөгдлийн цуглуулга. Дэлгүүрт бар код уншуулах, шатахууны тоолуурыг гараар бичих зэрэгт баар код автоматаар хийгдэж болно."
    },
    {
        "SrNo": "271",
        "english": "Carbon copy ",
        "mongolian": "Хуулбар хувь",
        "abbreviation": "CC",
        "mongolian_description": "майлд энэ нь илгээх гэсэн үг."
    },
    {
        "SrNo": "272",
        "english": "Card reader ",
        "mongolian": "Карт уншигч",
        "mongolian_description": "Карт уншигч картан дээрх электрон форматаар хадгалагдсан өгөгдлийг унших карт юм. Жишээлбэл автомашины зогсоолд нэвтрэх үнэмлэх гэх мэт. Өгөгдөл нь карт кодлогч картан дээрх соронзон зурвасан дээр бичигддэг. Картууд нь хялбар уншигддаг хэдий ч бага хэмжээний өгөгдлийг агуулдаг."
    },
    {
        "SrNo": "273",
        "english": "Carrier power",
        "mongolian": "Зөөгч дохионы чадал",
        "mongolian_description": "Дундаж чадалын радио давтамжийншугаман дамжууламжийн туршид антенд нэвтрүүлэх үйлдэлийн горимуудын дотор модуляцлагдахгүй."
    },
    {
        "SrNo": "274",
        "english": "Carrier power",
        "english_description": "The average power supplied to the antenna transmission line by a transmitter during one radio frequency cycle taken under the condition of no modulation",
        "description": "Note – With some types of modulating signals the concept of carrier power is meaningless."
    },
    {
        "SrNo": "275",
        "english": "Carrier recovery",
        "english_description": "A technique for extracting the RF carrier from a modulated signal so that it can be reinserted and used to recover the modulating signal."
    },
    {
        "SrNo": "276",
        "english": "Carrier-to-interference ratio",
        "abbreviation": "C/I",
        "english_description": "See carrier-to-interference ratio."
    },
    {
        "SrNo": "277",
        "english": "Carrier-to-interference ratio",
        "english_description": "The ratio of power in an RF carrier to the interference power in the channel."
    },
    {
        "SrNo": "278",
        "english": "Carrier-to-noise ratio",
        "abbreviation": "C/N",
        "english_description": "The ratio of power in an RF carrier to the noise power in the channel."
    },
    {
        "SrNo": "279",
        "english": "Cat sheet feeder",
        "mongolian": "Диаграммыг тайрч ажиллуулах ",
        "mongolian_description": "Тайрах хуудас нь хуудас тус бүрт цаасан дээр автоматаар нэрлэх боломжыг олгодог (бас салаа хуудас гэж нэрлэдэг)"
    },
    {
        "SrNo": "280",
        "english": "Catch (an exception) ",
        "mongolian": "Алдааны тайлбар ",
        "mongolian_description": "Программын кодон дотор урьдчилан бэлдсэн алдаа боловсруулах  код."
    },
    {
        "SrNo": "281",
        "english": "CD drive ",
        "mongolian": "CD агуулагч төхөөрөмж",
        "mongolian_description": "CD нь төхөөрөмжөөс өгөгдлийг унших ба түүнээс өгөгдлийг бичдэг."
    },
    {
        "SrNo": "282",
        "english": "CD writer ",
        "mongolian": "CD бичигч",
        "mongolian_description": "СD дээр өгөгдөл хадгалаад ашигладаг төхөөрөмж"
    },
    {
        "SrNo": "283",
        "english": "CDMA Development Group",
        "abbreviation": "CDG",
        "english_description": "A technical organization dedicated to developing the CDMA technology and promoting its use world-wide."
    },
    {
        "SrNo": "284",
        "english": "Cdma2000",
        "english_description": "A radio transmission technology for the evolution of narrowband cdmaOne/IS-95 to 3rd-generation adding up multiple carriers. See also W-CDMA for single carrier/direct spread technology."
    },
    {
        "SrNo": "285",
        "english": "CdmaOne",
        "english_description": "Brand name describing a complete wireless system incorporating the IS-95 CDMA air interface."
    },
    {
        "SrNo": "286",
        "english": "CD-ROM",
        "mongolian_description": "СD RОМ нь Compact Disk Read Only Memory гэсэн үгний товчлол ба энэ нь маш их хэмжээний өгөгдлийг хадгалах боломжтой ба хандахад хялбар байдаг."
    },
    {
        "SrNo": "287",
        "english": "CD-RW ",
        "mongolian": "CD уншигч бичигч",
        "mongolian_description": "Дахин бичих CD нь CD дээрх мэдээллийг арилгаад ахиж хуулж болдог. Хэдий тийм боловч урьд нь бичиж хадгалсан материалаа шинэчилсэний дараа эргээд хуулж хадгалах боломжтой."
    },
    {
        "SrNo": "288",
        "english": "Cell",
        "english_description": "The geographic area encompassing the signal range from one base station (a site containing a radio transmitter/receiver and network communication equipment). Wireless transmission networks are comprised of many hexagonal, overlapping cell sites to efficiently use radio spectrum for wireless transmissions. Also, the basis for the term \"cellular phone.\""
    },
    {
        "SrNo": "289",
        "english": "Cell Broadcast Channel",
        "abbreviation": "CBCH",
        "english_description": "A downlink point to multipoint logical channel in a GSM system used to broadcast user information from a service center to mobile stations listening in a given cell area."
    },
    {
        "SrNo": "290",
        "english": "Cell splitting",
        "english_description": "The process of splitting a cell into several smaller cells. This us usually done to make more voice channels available to accommodate traffic growth in the area covered by the original cell."
    },
    {
        "SrNo": "291",
        "english": "Cellular",
        "english_description": "In wireless communications, cellular refers most basically to the structure of the wireless transmission networks which are comprised of cells or transmission sites. Cellular is also the name of the wireless telephone system originally developed by Bell Laboratories that used low-powered analog radio equipment to transmit within cells. The terms \"cellular phone\" or \"cell phone\" are used interchangeably to refer to wireless phones. Within the wireless industry, cellular is also used to refer to non-PCS products and services."
    },
    {
        "SrNo": "292",
        "english": "Cellular ",
        "mongolian": "Үүр",
        "mongolian_description": "Үүр нь үүрэн системийн тодорхой нэг бүс нутгийг хэлнэ. Энэ нь бааз станцын хүрээнд хамрах газар нутаг гэсэн үг юм. Үүрийг геометрийн зөв дүрсээр нь (адил талт гурвалжин, квадрат, зөв зургаан өнцөгт ) гэж онолын хувьд загварчилж үздэг."
    },
    {
        "SrNo": "293",
        "english": "Cellular Digital Packet Data",
        "abbreviation": "CDPD",
        "english_description": "An open wireless transmission standard allowing two-way 19.2-Kbps packet data transmission over existing cellular telephone channels (AMPS with CDPD capability.) In essence, CDPD technology uses idle network capacity caused by pauses in phone conversations and gaps between calls placed, etc. to transmit data."
    },
    {
        "SrNo": "294",
        "english": "Cellular Geographic Service Area",
        "abbreviation": "CGSA",
        "english_description": "A general term used to describe the physical area over which a cellular carrier is licensed to provide service. See also MSA, RSA, MTA, BTA, EA and REAG"
    },
    {
        "SrNo": "295",
        "english": "cellular handoff",
        "english_description": "In cellular communications, a telephone call is switched by computers from one transmitter to the next, without disconnecting the signal, as a vehicle moves from cell to cell. The mobile remains on a specific channel until signal strength diminishes, then, is automatically told to go to another channel and pick up the transferred transmissions there."
    },
    {
        "SrNo": "296",
        "english": "Cellular Telecom Industry Association",
        "abbreviation": "CTIA",
        "english_description": "The membership-based association, located in Washington, D.C., represents the interests of the wireless telecommunications industry."
    },
    {
        "SrNo": "297",
        "english": "Centred",
        "mongolian": "Голлуулалт",
        "mongolian_description": "Текстийг голлуулах эсвэл бусад тэмдэгтүүдийг дугаарлаж хуудсын төвд байрлуулах (эсвэл хуудсын бүлэг, маягттай адил элемент, вэб хуудсан дах элемент) баруун ба зүүнээс байрлах байрлалт"
    },
    {
        "SrNo": "298",
        "english": "Channel",
        "english_description": "A general term used to describe a communications path between two systems. They may be either physical or logical depending on the application. An RF channel is a physical channel, whereas control and traffic channels within the RF channel would be considered logical channels."
    },
    {
        "SrNo": "299",
        "english": "Channel coding",
        "english_description": "The application of forward error correction codes to an RF channel to improve performance and throughput."
    },
    {
        "SrNo": "300",
        "english": "Channel equalization",
        "english_description": "The process of reducing amplitude, frequency and phase distortion in a radio channel with the intent of improving transmission performance."
    },
    {
        "SrNo": "301",
        "english": "Channel spacing",
        "english_description": "In a given set of radio channels, the difference in frequency between the characteristic frequencies of two adjacent channels."
    },
    {
        "SrNo": "302",
        "english": "Channel, RF channel",
        "english_description": "Part of the radio spectrum intended to be used for an emission and which may be defined by two specified limits, or by its centre frequency and the associated bandwidth, or by any equivalent indication.",
        "description": "Note 1 – Usually the specified part of the radio spectrum is that which corresponds to the assigned frequency band. Note 2 – A radio frequency channel may be time-shared in order to allow radiocommunication in both directions by simplex operation. Note 3 – In some countries and certain texts of the existing RR, the term “channel” (F and S: canal) is also used to denote a radio frequency circuit or, in other words, two associated radio frequency channels within the meaning of the proposed definition, each of which is used for one of the two directions of transmission. Note 4 – Recommendation ITU-R V.662 defines the general term “frequency channel”"
    },
    {
        "SrNo": "303",
        "english": "Char ",
        "mongolian": "Тэмдэгт төрөл",
        "mongolian_description": "Ганц тэмдэгтээр илэрхийлэгдэх өгөгдлийн төрөл, жишээ нь ‘a’"
    },
    {
        "SrNo": "304",
        "english": "Character ",
        "mongolian": "Тэмдэг үсэг",
        "mongolian_description": "Тэмдэгт нь нэг тэмдэгийг багц тэмдэгтээр компьютерт илэрхийлдэг. Тэмдэгт нь үсэг , тоо , зай авах, цэг таслал гаргахгүй ба тэмдэгт  чадна "
    },
    {
        "SrNo": "305",
        "english": "Character data ",
        "mongolian": "Тэмдэгт өгөгдөл",
        "mongolian_description": "Тэмдэгт төрөл нь дан ганц тэмдэгтийг компьютероор кодлогдож дүрслэгдэн илэрхийлэгдэхийг хэлнэ."
    },
    {
        "SrNo": "306",
        "english": "Character set ",
        "mongolian": "Тэмдэгтийн бүрдэл",
        "mongolian_description": "Бүх тэмдэгтүүдийн олонлогийн нэгдэл буюу эх олонлог гэж ойлгож болно. Өөрөөр хэлбэл нэг тэкст тоог хөрвүүлээд буцаагаад эх тэкст рүү хөрвүүлэхэд ямар ч мэдээлэлийн алдагдал гарахгүй."
    },
    {
        "SrNo": "307",
        "english": "Chart ",
        "mongolian": "График",
        "mongolian_description": "Chart нь өгөгдлийг илэрхийлэх график жишээ нь: line , bar , pie гэх мэт. Хүснэгт дотроос хайлт хийх."
    },
    {
        "SrNo": "308",
        "english": "Chat ",
        "mongolian": "Чат",
        "mongolian_description": "Чатын программ нь интернэт хэрэглэчийг бусад хэрэглэгчидтэй бодит хугацаанд харилцан холбогдох боломж олгодог"
    },
    {
        "SrNo": "309",
        "english": "Chat room ",
        "mongolian": "Чат өрөө",
        "mongolian_description": "Онлайнаар хэрэглэгчид компьютерээр дамжуулан хоорондоо бүлэг үүсгэн чатлах"
    },
    {
        "SrNo": "310",
        "english": "Check box",
        "mongolian": "Шалгах хайрцаг ",
        "mongolian_description": "Хэрэглэгч зөвшөөрсөн нэг буюу хэд хэдэн хувилбаруудыг сонгох боломжийг олгодог  талбай юм."
    },
    {
        "SrNo": "311",
        "english": "Check box",
        "mongolian": "Хяналтын хайрцаг ",
        "mongolian_description": "Харилцан яриа (ярианы) төрлийг хайрцаглаж харуулах мөн, сонголтын мэдээлэлд хэрэглэгдэх буюу сонголтуудаас шилж (тусгайлан) сонгох. Тэмдэглэл хайрцаг нь тодорхойлолтын аль нэгийг идэвхижүүлэх эсвэл хайрцагийг тэмдэглэх буюу идэвхигүй  болгох хайрцагийн тэмдэглэснийг цэвэрлэнэ."
    },
    {
        "SrNo": "312",
        "english": "Check sum",
        "mongolian": "Эцсийн шалгуур,шалгалтын нийлбэр",
        "mongolian_description": "Программыг хуулах үед ямар нэгэн алдаа байхгүй байгааг шалгаж баталгаажуулдаг. Эцсийн шалгуур нь хуулахын өмнө ба дараа нь энгийн хэлбэрээр бүх зааварчилгааг дугаарлалт шиг нэмэх хэрэв хоер эцсийн шалгуур таарах юм бол өгөгдөл зөв буюу амжилттай хуулагдсан байгаа."
    },
    {
        "SrNo": "313",
        "english": "Child node",
        "mongolian": "Обьектийн зангилаа (холболт)",
        "mongolian_description": "Салаалсан байгууламж нь өөр өөр өгөгдлийн түвшингээс хамаарч өөр өөр байрлалд байна Эдгээр нь.нэг түвшний элементийг түүнээс доогуур түвшний элементтэй холбох холбоос юм.Өгөгдлийг ихэнхдээ салбар  (мөчир) зангилаагаар холбоно. зангилаан магадгүй ямар нэгэн дугаар үргэлжилнэ,гэхдээ үргэлжлүүлэхдээ зөвхөн өөрийн ижил зангилаагаар үргэлжилнэ. Үүнийг ихэнхдээ комьютер дээр салаалсан диаграмыг зурахад ашиглана."
    },
    {
        "SrNo": "314",
        "english": "Child process",
        "mongolian": "Обьект үүсгэх үйл явц",
        "mongolian_description": "Одоогийн процессоор үүсгэгдэж байгаа шинэ процесс юм. Шинээр боловсруулалт хийхээс өмнөх процессоо мэдэж байх буюу обьект үүсгэхтэй ижил юм. Урьдчилсан процессийг үүсгэгч процесс гэж дуудаж болно."
    },
    {
        "SrNo": "315",
        "english": "Chip",
        "mongolian": "Микросхем ,чип, бичил схем",
        "mongolian_description": "Нэгдсэн хэлхээний түгээмэл нэршил нь (силикон) микросхем юм. Үүн дээрх хатуу биет бичил хэлхээний бүрэлдэхүүн хэсгүүд нь (транзистор болон конденсатор) маш нимгэн силикон хэрчим дотор бүрэлддэг."
    },
    {
        "SrNo": "316",
        "english": "Circuit switched",
        "english_description": "A switched circuit is only maintained while the sender and recipient are communicating, as opposed to a dedicated circuit which is held open regardless of whether data is being sent or not."
    },
    {
        "SrNo": "317",
        "english": "Class of emission",
        "english_description": "The set of characteristics of an emission, designated by standard symbols, e.g. type of modulation of the main carrier, modulating signal, type of information to be transmitted, and also if appropriate, any additional signal characteristics."
    },
    {
        "SrNo": "318",
        "english": "Clear (Screen)",
        "mongolian": "Дэлгэцийг цэвэрлэх",
        "mongolian_description": "Ихэнх програмчлалын хэл нь ажиллаж байгаа дэлгэцийг цэвэрлэх коммандтай байдаг."
    },
    {
        "SrNo": "319",
        "english": "Clear variables",
        "mongolian": "Хувьсагчуудыг арилгах",
        "mongolian_description": "Энэ  программ нь хувьсагчид оноосон утгыг арилгадаг."
    },
    {
        "SrNo": "320",
        "english": "Click",
        "mongolian": "Дарах, товчлуур дарах, товших, товшоо",
        "mongolian_description": "зарим үйлдлийг шуурхай  гүйцэтгэхийн тулд хулганы товчийг дарах үйлдлийг хийдэг."
    },
    {
        "SrNo": "321",
        "english": "Clickable",
        "mongolian": "Товших боломжтой ",
        "mongolian_description": "Текст эвсэл зураг нь товшиход боломжтой байх. Товших үйлдлийг хийх үед хэрэглэгч өөр вэб хуудас руу ордог."
    },
    {
        "SrNo": "322",
        "english": "Client",
        "mongolian": "Хэрэглэгч, үйлчлүүлэгч, хүлээн авагч",
        "mongolian_description": "Сүлжээнд үйлчлүүлэгч (клиент) нь компьютер ба серверээс үйлчилгээний хувьд зөвшөөрөл хүсдэг. Жишээ нь файл сервер эсвэл хэвлэх сервер."
    },
    {
        "SrNo": "323",
        "english": "Client side",
        "mongolian": "Клиентийн хэсэг",
        "mongolian_description": "Интернетийн хувьд клиент хэсэг нь хэрэглэгчийн компьютер юм. Жишээлбэл: Хэрэглэгчийн компьютероос гүйцэтгэгдэж байгаа учраас вэб сервэрээс илүү байдаг."
    },
    {
        "SrNo": "324",
        "english": "Clip",
        "mongolian": "Клип, хэсэг огтлоодос, огтлох тайрах, зурвас",
        "mongolian_description": "Киноны  богино хэсэг болон дууг дижитал хэлбэрээр агуулдаг ба видео клип нь бичлэгийн дарааллыг маш бага файл  агуулсан байдаг."
    },
    {
        "SrNo": "325",
        "english": "Clip art",
        "mongolian": "Клип арт, зургийн оруулга ",
        "mongolian_description": "Компьютер график програм хэрэглэгч нь өөрийн зургуудаас зурах боломжийг олгодог боловч олон захиалагч компьютерийн диск дээрх  мэргэжлийн зурсан зургийг хэрэглэгч  бүх талаар  тохируулан өөрчлөх боломжийг олгодог."
    },
    {
        "SrNo": "326",
        "english": "Clipboard",
        "mongolian": "Завсрын санах ой, түр санах ой, санадаг самбар ",
        "mongolian_description": "Өгөгдөл дээр copy, paste cut  үйл ажиллагаа хийхэд энэ өгөдөл нь түр санах ойд хадгалагддаг үүнийг завсрын санах ой гэдэг.хадгалж буй мэдээлэл нь шинэ мэдээгээр солигдох хүртэл хадгалагдаж буй газраа байсаар байх болно Тиймээс анхны хуулбарласан  мэдээллийг нэгээс олон газар хуулбарлаж болдог."
    },
    {
        "SrNo": "327",
        "english": "Clock  speed",
        "mongolian": "Цагны хурд",
        "mongolian_description": "Цагны хурд нь (цагны түвшин) үндсэн цагны хурдтай ажиллаж болно компьютер нь мегагерцээр (MHz) илэрхийлсэн байна. pulses. the их цаг хурд, (саяны нэг) үүсгэдэг бөгөөд тэр үеийн давтамж юм"
    },
    {
        "SrNo": "328",
        "english": "Clock recovery",
        "english_description": "The process of extracting the timing signals from a digitally modulated carrier wave. The recovered clock signal is then used to decode and further process the data."
    },
    {
        "SrNo": "329",
        "english": "Close window",
        "mongolian": "Цонх хаах ",
        "mongolian_description": "Энэ нь програмын ажиллаж байгаа нь цонхыг хаадаг"
    },
    {
        "SrNo": "330",
        "english": "Cluster",
        "mongolian": "Багц, бөөгнөрөл, бүлэглэл, хэсэглэл, цугларал",
        "mongolian_description": "Сүлжээн дэхь адил физик бүсүүддээ компьютерийн бүлэг байх магадлалтай. Багц хянагч нь сүлжээний эх үүсвэрийг хуваалцахдаа ихэвчлэн  бусад сүлжээнээс  бага зохион байгуулалттай хуваалцдаг. Компьютерийн багц хянагч нь багцийн хянагч болон ажиллаж байна"
    },
    {
        "SrNo": "331",
        "english": "Coast station",
        "english_description": "A land station in the maritime mobile service."
    },
    {
        "SrNo": "332",
        "english": "Coaxial cable",
        "mongolian": "Коаксиаль кабель",
        "mongolian_description": "Коаксиаль кабель нь олонлогт Антенн телевизор холбож ашиглаж байгаа кабелийн нэг төрөл юм. Нэг дотоод утас нь тусгаарлагчийн эргэн тойронд урсацтай нийлсэн олон хэсгээс бүтсэн бол хоёрдугаар нь  тусгаарлах нэг хэлхээ байж болно кабелийн төвөөс, дээрээс нь доош нь цахилгаан утас юм."
    },
    {
        "SrNo": "333",
        "english": "Co-channel",
        "english_description": "Refers to the use of the same RF channel by two or more emissions."
    },
    {
        "SrNo": "334",
        "english": "Co-channel interference",
        "english_description": "Unwanted interference within a radio channel from another transmitter using the same channel at a different location. Co-channel interference is very common in a frequency reuse system and must be carefully controlled to prevent problems."
    },
    {
        "SrNo": "335",
        "english": "Code Division Multiple Access",
        "abbreviation": "CDMA",
        "english_description": "One of several digital wireless transmission methods in which signals are encoded using a specific pseudo-random sequence, or code, to define a communication channel. A receiver, knowing the code, can use it to decode the received signal in the presence of other signals in the channel. This is one of several \"spread spectrum\" techniques, which allows multiple users to share the same radio frequency spectrum by assigning each active user an unique code. CDMA offers improved spectral efficiency over analog transmission in that it allows for greater frequency reuse. Other characteristics of CDMA systems reduce dropped calls, increase battery life and offer more secure transmission. See also IS-95."
    },
    {
        "SrNo": "336",
        "english": "Code Domain Power",
        "abbreviation": "CDP",
        "english_description": "A measurement of the power contained in each Walsh coded channel in CDMA signals. The CDP measurement is beneficial in troubleshooting CDMA transmitter designs."
    },
    {
        "SrNo": "337",
        "english": "codebook",
        "english_description": "An ordered collection of all possible values that can be assigned to a scalar or a vector variable. Each vector is called a codeword."
    },
    {
        "SrNo": "338",
        "english": "Code-Book Excited Linear Predictive",
        "abbreviation": "CELP",
        "english_description": "A powerful low-rate coding technique where a short excitation frame, typically 5ms, is modeled by a Gaussian vector chosen from a large stochastic codebook. The vector is chosen such that the error between the original and synthesized speech is minimized."
    },
    {
        "SrNo": "339",
        "english": "Codec",
        "mongolian": "Кодлох тайлах ",
        "mongolian_description": "Кодлолтын / декодчлогч нь богино. Энэ нь компьютерт хадгалах, дараа нь боловсруулах нь видео / аудио дохио үйл явц болон програм хангамж, техник хангамж гэх мэт хэрэгжүүлж болно бүрэлдэхүүн хэсэг юм. Бүх кодуудад адил үүргийг гүйцэтгэдэг хэдий ч, тэдгээр нь тэнцүү биш, нэг ТВ болон дүрс бичлэгийн видео тоглуулахад дохиог бий болгохын тулд, кодлогдсон мэдээллийг анх ашиглаж байсан нэг кодлогч нь тус декодлогдсон байх ёстой. Энэ нь видео бичлэгийг хийх чухал бүрэлдэхүүн хэсэг юм "
    },
    {
        "SrNo": "340",
        "english": "Coded Digital Verification Color Code",
        "abbreviation": "CDVCC",
        "english_description": "A unique 12 bit code word used to identify the base station. It performs the same function as the SAT in an analog system it that it is added at the base station to the downlink or forward channel. The mobile then detects and returns the code. The CDVCC is used to determine channel continuity, and only one CDVCC is usually assigned to a base station or sector."
    },
    {
        "SrNo": "341",
        "english": "Coder/Decoder",
        "abbreviation": "CODEC",
        "english_description": "An amalgam of the terms \"Coder\" and \"Decoder\". It generally signifies the encoding device/module which carries out highly efficient conversion processing from the basic digital signal to a compressed signal during digitalization of voice and picture signals. Encoding specifications for the voice CODEC and image CODEC are stipulated by the G-series and H-series ITU-T recommendations, respectively. In the case of mobile communication, encoding specifications are established by the concerned standardizing bodies."
    },
    {
        "SrNo": "342",
        "english": "Coding gain",
        "english_description": "The effective gain, usually in dB, that coding provides over an uncoded signal. Coding gain is usually measured as the dB difference in C/N ratios between a coded and uncoded signal producing the same BER."
    },
    {
        "SrNo": "343",
        "english": "Coherent detection",
        "english_description": "Also referred to as coherent demodulation, this is a technique of phase locking to the carrier wave to improve detection. Knowledge of the carrier phase improves demodulator performance."
    },
    {
        "SrNo": "344",
        "english": "Collate",
        "mongolian": "Харьцуулах, зэрэгцүүлэх, тулгах, жиших, нэгтгэх, нийлүүлэх",
        "mongolian_description": "Хэвлэгчийн чадвар зохих  зөв дарааллаар хуудаснуудыг  хэвлэх."
    },
    {
        "SrNo": "345",
        "english": "Colour palette",
        "mongolian": "Өнгөний палитр",
        "mongolian_description": "Компьютерийн систем нь үйлдвэрлэх боломжтой тусдаа өнгөний хүрээ. Ямар ч компьютерийн систем нь өнгөтэй бүх боломжит сүүдэр гаргах боломжтой болох бөгөөд палитр нь бэлэн сүүдэртэй нийт багц юм. ихэнх компьютер арван зургаан сая өнгө нь палитр нь байдаг боловч Зарим програмууд чичрэлт ашигладаг."
    },
    {
        "SrNo": "346",
        "english": "Colour printer",
        "mongolian": "Өнгөт хэвлэгч",
        "mongolian_description": "энэ хэвлэгч нь өнгө өнгийн бэх ашиглаж өнгөнүүдийн хязгаараар хэвлэдэг."
    },
    {
        "SrNo": "347",
        "english": "Column",
        "mongolian": "Багана, мөр, цуваа",
        "mongolian_description": "Мэдээлэл нь  босоо байрлалтай  жишээ нь хүснэгттэй ажиллах програм нь өгөгдлийг багана буюу хоёр ба түүнээс дээш багана болгон  боловсруулсан өгөгдлийн хуудас бэлтгэх үйл явц."
    },
    {
        "SrNo": "348",
        "english": "Comma separated value(CSV)(1)",
        "mongolian": "Таслалаар тусгаарлаж үзэх",
        "mongolian_description": "Файл юмуу хүснэгт доторх талбайг таслалаар тусгаарлаж өгдөг."
    },
    {
        "SrNo": "349",
        "english": "Commamd ",
        "mongolian": "Тушаал өгөх ,удирдах ",
        "mongolian_description": "компьютерт өгсөн заавар"
    },
    {
        "SrNo": "350",
        "english": "Command drive",
        "mongolian": "Коммандын удирдлагатай.",
        "mongolian_description": "Хэрэглэгч нь командаар системийг удирдах үйл ажиллагааны хэлбэр."
    },
    {
        "SrNo": "351",
        "english": "Command language",
        "mongolian": "Командын хэл ",
        "mongolian_description": "Командын хэлнь  шуурхай удирдахкомпьютерийн систем юм."
    },
    {
        "SrNo": "352",
        "english": "Command line interface",
        "mongolian": "Командын шугам",
        "mongolian_description": "Хэрэглэгчээс өгсөн командын төрлийг компьютер гүйцэтгэдэг. Команд нь ихэвчлэн бичвэрийн ганц мөрийг  хязгаарлах аль ч командын ямарч дарааллын  бүрдэл"
    },
    {
        "SrNo": "353",
        "english": "Command prompt",
        "mongolian": "Шуурхай команд ",
        "mongolian_description": "Команд өгч хүлээх үед  үйлдлийн системийн eg. DOS гарч ирэх магадлалтай ."
    },
    {
        "SrNo": "354",
        "english": "Comment",
        "mongolian": "Тайлбарлах",
        "mongolian_description": "Компьютерийн програмдхүмүүсийн уншигчдад тодорхой хугацаанд оруулсан мэдээ, мэдээллүүдийн хяналт ба тоо баримттай байрлуулсан мэдээний тайлбар,тодруулага өгөх зорилгоор бичигдсэн хүмүүс хоорондын  санал хүсэлтийн илэрхийлэл"
    },
    {
        "SrNo": "355",
        "english": "Comment a program",
        "mongolian": "Нэмэлт мөр бичиж тайлбарлах",
        "mongolian_description": "Хөтөлбөрийн хүрээнд ямар нэгэн програмыг гүйцэтгэхгүйгээр тухайн программын тайлбрыг өөр өөрөөр тайлбарлах. Програм: програм хангамжийн сери код нь компьютерийн үйл ажиллагаа болон бусад машины үйл ажиллагааг хянаж удирддаг. Жишээлбэл Оксфордын их сургуулийн хэвлэлийн зөвшөөрөлөөр  Е (1989) Чөлөөт зөвшөөрөл Simpson, J & Weiner, хянан тохиолдуулсан \"Оксфордын англи хэлний толь бичиг\" Инк."
    },
    {
        "SrNo": "356",
        "english": "Comment box",
        "mongolian": "Санал бичих хайрцаг",
        "mongolian_description": "Хавтасд тэмдэглэл нь нэмэгдэн ордог бөгөөд ерөнхийдөө бичвэрийг цахим төхөөрөмжөөр боловсруулсан хүснэгтийн хуудаснаас хайснаар санал хүсэлт ил гарч ирдэг."
    },
    {
        "SrNo": "357",
        "english": "Commit",
        "mongolian": "Хийх",
        "mongolian_description": "Хувийн хөгжүүлэгчдийн хийсэн эх кодуудаас харж, хэрэглэж болохыг нь авч  нэгтгэх, өөрчлөлт хийж удирдах системийн сан, хувилбар гаргах"
    },
    {
        "SrNo": "358",
        "english": "Commit privileges",
        "mongolian": "Давуу эрх эдлэх ",
        "mongolian_description": "өөрчлөлт хийх хүний эрх мэдэл  Тэмдэглэл: Заримдаа давуу эрхүүд нь тодорхой салбар эсвэл бүтээгдэхүүний тодорхой нэг хэсэгтэй холбоотой байдаг. (жишээлбэл, урлагийн бүтээл эсвэл бичиг баримт)"
    },
    {
        "SrNo": "359",
        "english": "Commit window",
        "mongolian": "Цаг үеийг тохируулах ",
        "mongolian_description": "Тодорхой салбарт зөвшөөрдөг үйлдлүүдийн үед Тэмвэглэл: Зарим хөгжүүлэлтийн орчинд үйлчилгээний салбарт зориулсан тохиромжтой цаг үе нь жилд цөөхөн удаа тохионо. "
    },
    {
        "SrNo": "360",
        "english": "Commitment",
        "mongolian": "Амлалт ",
        "mongolian_description": "Мэдээллийн технологи – Нээлттэй хуваарилалтын үйл явц- Жишиг загвар – Аж ахуй нэгжийн хэл  гэрээг гүйцэтгэх эсвэл дүрэм журмыг дагаж мөрдөн нэг болон түүнээс дээш оролцогчдын үүрэг хариуцлагын үр дүн  Тэмдэглэл: Аж ахуй нэгж амлалтын үйл ажиллагааг хэрэгжүүлэхдээ намынхаа нэрийн өмнөөс ажиллаж байгаа агентууд эсвэл намууд байж болно. Агентын амлалтын үйл ажиллагаанд оролцогчийн үүрэгтэй байдаг. "
    },
    {
        "SrNo": "361",
        "english": "Committee of European Posts & Telephones",
        "abbreviation": "CEPT",
        "english_description": "A European regulatory body responsible for coordinating telecommunications within Europe."
    },
    {
        "SrNo": "362",
        "english": "Committer",
        "mongolian": "Итгэмжлэгч",
        "mongolian_description": "Давуу эрхтэй хөгжүүлэгч "
    },
    {
        "SrNo": "363",
        "english": "Common Air Interface ",
        "abbreviation": "CAI",
        "english_description": "A set of open standards describing the physical and logical characteristics of a link between a base station and mobile station. These standards are used by infrastructure and handset manufactures to design and build equipment that is capable of interoperating with each others systems"
    },
    {
        "SrNo": "364",
        "english": "Common ancestor constraint",
        "mongolian": "Нийтлэг загварын шаардлага ",
        "mongolian_description": "Шаардлага нь тус бүрийн замаар дамжуулан ижил загварын жишээтэй холбогддог удамшлын тохиолдол болон тус бүрийн замаар дамжуулан өөр өөр загварын жишээтэй холбогддог удамшлын тохиолдлын аль алиныг тодорхойлдог , ижил загварын ангилалд хоёр болон түүнээс дээш холбоо харилцаа бүхий замуудад хамааралтай байдаг."
    },
    {
        "SrNo": "365",
        "english": "Common cause",
        "mongolian": "Нийтлэг шалтгаан ",
        "mongolian_description": "Өөрчлөлтийн эх сурвалж нь системд болон урьдчилан таамаглалд өөрчлөгдөггүй. Хяналтын зураг дээр үүнийг санамсаргүй үйл явцын өөрчлөлтөөр харуулав. (Үйл явцаас гарч буй өөрчлөлтийг албан эсвэл албан бус гэж үздэг. Мэдлэгийн Төслийн Менежментийн гарын авлага- 4-р хэвлэл) санамсаргүй шалтгаан. Үйл явцын өөрчлөлтийн эх сурвалж гэж байдаггүй учир нь тусгай шалтгаант үйл явцын бүрэлдэхүүн хэсгүүдийн хоорондын харилцан ажиллагаанаас хамаардаг. "
    },
    {
        "SrNo": "366",
        "english": "Common environment coupling",
        "mongolian": "Нийтийн орчны холбоо хамаарал ",
        "mongolian_description": "Нийтийн дата талбарт ханддаг хоёр програм хангамжийн модулиудын холбоо хамаарлын төрөл. Ижил утга: нийтлэг холбоо хамаарал, нийтийн эзэмшил-хүрээлэн буй орчны холбоо хамаарал  Агуулгын холбоо хамаарал, удирдах багж хэрэгслийн холбоо хамаарал, өгөгдлийн холбоо хамаарал, холимог холбоо хамаарал, эмгэгийн холбоо хамаарал "
    },
    {
        "SrNo": "367",
        "english": "Common gateway interface ",
        "mongolian": "Нийтлэг гарцын интерфейс",
        "mongolian_description": "Энэ нь сервер дээр байрладаг бөгөөд вэб хуудаснаас оролтыг хүлээн авдаг мөн  түүнийг боловсруулдаг жижиг программ юм."
    },
    {
        "SrNo": "368",
        "english": "Common Intermediate Format",
        "abbreviation": "CIF",
        "english_description": "A video image format using 352 horizontal pixels and 288 vertical lines. The format is adopted in multimedia communication standards"
    },
    {
        "SrNo": "369",
        "english": "Common storage",
        "mongolian": "Нийт багтаамж ",
        "mongolian_description": "Програм хангамжийн системд хоёр болон түүнээс дээш модулиуд хандалт хийж болдог үндсэн багтаамжийн хэмжээ. Ижил утга: Нэгдсэн талбай, нийтлэг хар  Глобал дата"
    },
    {
        "SrNo": "370",
        "english": "Communication interface",
        "mongolian": "Холбооны интерфейс ",
        "mongolian_description": "Завсрын обьект болон протокол обьектын аль алинтай холбогдож болдог протокол обьектын интерфейс. Мэдээллийн Технологи – Нээлттэй хуваарилттай үйл ажиллагаа – Жишиг загвар Архитектур "
    },
    {
        "SrNo": "371",
        "english": "Communication management plan",
        "mongolian": "Холбооны менежментийн төлөвлөгөө ",
        "mongolian_description": "[Гаралт Оролт] ямар форматтай мэдээллийг хэрхэн холбох, холболт бүрийг хэзээ, хаана хийж болох, холболтын төрлийн хэн хариуцах гэх мэт асуудлуудыг шийдэж холболт хэрэгтэй болохыг тодорхойлдог бичиг баримт. Холбооны менежментийн төлөвлөгөө нь төслийн менежмент төлөвлөгөөний дэд төлөвлөгөөнүүдээс бүрддэг. "
    },
    {
        "SrNo": "372",
        "english": "Communicationalcohesion",
        "mongolian": "Холболтын нэгдмэл байдал ",
        "mongolian_description": "Даалгаврыг ижил төрлийн оролтын өгөгдөл ашигладаг эсвэл ижил төрлийн гаралтын өгөгдөл боловсруулдаг програм хангамжийн модуль ашиглан гүйцэтгэх нь нэгдмэл байдлын нэг төрөл  Давхардсан нэгдмэл байдал, үйл ажиллагааны нэгдмэл байдал, логик нэгдмэл байдал, процедурийн нэгдмэл байдал, дараалсан нэгдмэл байдал, түр зуурын нэгдмэл байдал "
    },
    {
        "SrNo": "373",
        "english": "Communications domain",
        "mongolian": "Холбогдох домайн",
        "mongolian_description": "Харилцан ажиллах чадвартай протокол обьектуудын иж бүрдэл: Мэдээллийн Технологи – Нээлттэй хуваарилттай үйл ажиллагаа "
    },
    {
        "SrNo": "374",
        "english": "Communications protocol",
        "mongolian": "Төхөөрөмж хооронд дамуулах стандарт",
        "mongolian_description": "Төхөөрөмжүүдийн хооронд өгөгдлийг зөв зохистойгоор дамжуулахад ашигладаг стандарт багц юм. протоколууд нь өгөгдлийн хэлбэрийг тогтоож, дохионуудыг эхлэл, мөн шилжүүлгийн эцсийг хянадаг , жишээ нь Transmission Control Protocol."
    },
    {
        "SrNo": "375",
        "english": "Communications software ",
        "mongolian": "Програм хангамжийн харилцаа холбоо",
        "mongolian_description": "Энэ нь интернетэд холбогдох, майл хүлээж авах илгээх, Факс болон утасны холбоо гэх мэт компьютерийг ашиглах бүхий л зүйлд хэрэглэдэг."
    },
    {
        "SrNo": "376",
        "english": "Community",
        "mongolian": "Нэгдэл",
        "mongolian_description": "Зорилгод нийцэхүйц обьектуудын бүрдэл. Мэдээллийн Технологи – Нээлттэй хуваарилттай үйл ажиллагаа – Жишиг загвар Архитектур  Тэмдэглэл: Зорилго нь гэрээг илэрхийлдэг, гэрээ нь зорилгод хэрхэн нийцүүлж болохыг тодорхойлдог. "
    },
    {
        "SrNo": "377",
        "english": "Community object",
        "mongolian": "Нэгдлийн обьект ",
        "mongolian_description": "Нэгдлийг төлөөлдөг нийлмэл бүтэцтэй аж ахуй нэгж обьект. Мэдээллийн Технологи – Нээлттэй хуваарилттай үйл ажиллагаа  Тэмдэглэл: Нэгдлийн обьектуудын бүрэлдэхүүн нь нэгдлийг төлөөлдөг обьектууд юм. "
    },
    {
        "SrNo": "378",
        "english": "community reception",
        "english_description": "The reception of emissions from a space station in the broadcasting-satellite service by receiving equipment, which in some cases may be complex and have antennae larger than those used for individual reception, and intended for use: – by a group of the general public at one location; or – through a distribution system covering a limited area."
    },
    {
        "SrNo": "379",
        "english": "Compaction",
        "mongolian": "Шахалт",
        "mongolian_description": "Бичил програм нь эх хувиасаа илүү хурдан товчхон байдаг үүнтэй уялдуулан үйл ажиллагааг нь бичил програм руу хөрвүүлэх үйл явц  Локал шахалт, глобал  шахалт "
    },
    {
        "SrNo": "380",
        "english": "Comparator",
        "mongolian": "Харьцуулагч",
        "mongolian_description": "Хоёр компьютерын програмууд, файлууд болон ижил эсвэл ялгаатай өгөгдлийн иж бүрдлийг харьцуулдаг програм хангамж.  Тэмдэглэл: Харьцуулалтын энгийн обьектууд нь эх код, обьект код, өгөгдлийн сангийн файлуудын хувилбар адилхан байдаг. "
    },
    {
        "SrNo": "381",
        "english": "Comparison operator ",
        "mongolian": "Харьцуулах үйлдэл",
        "mongolian_description": "Энэ үйлдэл нь =<+,> гэх мэт тэмдэгүүд ашиглан харьцуулалт хийдэг."
    },
    {
        "SrNo": "382",
        "english": "Compatible",
        "mongolian": "Нийцтэй байх",
        "mongolian_description": "Тусгай өөрчлөлт эсвэл тохируулга хийлгүйгээр тоног төхөөрөмж мөн програм хагамжийн хэсгүүдийг хамтад нь ашиглах боломжтой."
    },
    {
        "SrNo": "383",
        "english": "Competent",
        "mongolian": "Өрсөлдөх чадвартай",
        "mongolian_description": "Ижилхэн програм хангамж болон техник хангамжийн орчинд share-лэхэд шаардлагатай функцыг ажиллуулах хоёр болон түүнээс дээш тооны системд зохицох чадвар. 2. хоёр болон түүнээс дээш тооны системд мэдээлэл солилцох чадвар 3. тодорхой интерфейсын шаардлагад нийцэх үйл ажиллагааны нэгжийн чадвар. Даалгаврыг гүйцэтгэхэд шаардлагатай зан характер, ажлын туршлага, сургалт, албан болон албан бус ур чадварууд болон мэдлэгтэй байх. "
    },
    {
        "SrNo": "384",
        "english": "Competent assessor",
        "mongolian": "Өрсөлдөх чадвартай зөвлөх ",
        "mongolian_description": "Үнэлгээний явцыг хянан баталгаажуулж, дүгнэхэд өрсөлдөх чадвартай гэдгээ харуулсан зөвлөх. "
    },
    {
        "SrNo": "385",
        "english": "Compilation error ",
        "mongolian": "Алдааг илрүүлэх",
        "mongolian_description": "Дамжуулалтын турш алдаануудыг илрүүлж, ихэвчлэн өгүүлбэр зүйн алдаануудыг илрүүлдэг"
    },
    {
        "SrNo": "386",
        "english": "Compile",
        "mongolian": "Хөрвүүлэх",
        "mongolian_description": " Бусад төрлийн хэл дээр илэрхийлсэн компьютерын програмыг машины хэл рүү хөрвүүлэх  хөрвүүлэх, тайлбарлах, дуудах "
    },
    {
        "SrNo": "387",
        "english": "Compile",
        "mongolian": "Зохион байгуулах, шалгах",
        "mongolian_description": "Боломжит кодоор гадаад хэлний өндөр түвшнийг орчуулдаг хөрвүүлэх үйл явц."
    },
    {
        "SrNo": "388",
        "english": "Compile and go",
        "mongolian": "Хөрвүүлж  үргэлжлүүлэх",
        "mongolian_description": "Компьютерийн програмыг ачаалах, холбох, гүйцэтгэх, хөрвүүлэх явцад зогсолтгүй ажиллаж байдаг арга техник"
    },
    {
        "SrNo": "389",
        "english": "Compile time ",
        "mongolian": "Шалгах хугацаа",
        "mongolian_description": "Боломжит кодоор хэлний програмчилалд хөрвүүлэгч хөрвүүлэх кодыг бичилт хийж байгаа тэрхүү цаг хугацааг хэлнэ."
    },
    {
        "SrNo": "390",
        "english": "Compiler",
        "mongolian": "Хөрвүүлэгч",
        "mongolian_description": "Энэхүү программ нь хэлний өндөр түвшин эсвэл бага түвшинг орчуулах кодны нөөцтэй бөгөөд ерөнхийдөө өндөр түвшин бүр кодын зааврын дагуу үечилдэг. Тиймээс энэхүү программ нь бие даан ажиллах боломжтой байдаг."
    },
    {
        "SrNo": "391",
        "english": "Compiler code",
        "mongolian": "Хөрвүүлэгч код ",
        "mongolian_description": "Хөрвүүлэгчийн боловсруулсан компьютерийн заавар болон өгөгдлийн тодорхойлолт дуудах код, тайлбар код, машины код "
    },
    {
        "SrNo": "392",
        "english": "Compiler directive source statement",
        "mongolian": "Хөрвүүлэгч удирдамжийн анхны илэрхийлэл",
        "mongolian_description": "Анхны илэрхийлэл, лабелуудыг тодорхойлдог кодынилэрхийлэл, гадаад кодын илэрхийлэл оруулах (include-ийн тайлбар) нөхцөлт хөрвүүлэлтийг илэрхийлэх, харин бусад төрлийн атрибутуудыг нэг бүрчлэн тодорхойлдоггүй. "
    },
    {
        "SrNo": "393",
        "english": "Complementary Cumulative Distribution Function",
        "abbreviation": "CCDF",
        "english_description": "A method used to characterize the peak power statistics of a digitally modulated signal. The CCDF curve can be used to determine design parameters for CDMA systems (such as the amount of back-off to run in a power amplifier)."
    },
    {
        "SrNo": "394",
        "english": "Compliant ",
        "mongolian": "Ажиллах",
        "mongolian_description": "Стандартаар тодорхойлогдсон арга замаар хийх үйл ажиллагаа"
    },
    {
        "SrNo": "395",
        "english": "Component",
        "mongolian": "Бүрэлдэхүүн хэсэг",
        "mongolian_description": "Системийн нэг бүрэлдэхүүн хэсэг"
    },
    {
        "SrNo": "396",
        "english": "Composite key",
        "mongolian": "Таних дугаар",
        "mongolian_description": "бичлэгийг танихын тулд ашигладаг тухайн бичлэг доторх гол түлхүүр, жишээлбэл тухайн хэрэглэгчийн  банкны дансны дугаарыг таних тэмдэг буюу бар код"
    },
    {
        "SrNo": "397",
        "english": "Compressing and Expanding",
        "english_description": "A technique for reducing the dynamic range of a baseband signal. This reduces the number of quantizing steps needed and reduces noise in the process. Most digital systems include nonlinear quantizing to achieve this effect."
    },
    {
        "SrNo": "398",
        "english": "Compuring center",
        "mongolian": "Тооцооллын төв",
        "mongolian_description": "Туслах техник хангамж, тохирсон төхөөрөмжөөр хангагдсан үйл ажиллагаа болон  олон янзын хэрэглэгчдийн компьютерийн үйлдлийг, компьютерийн үйл ажиллагааг хангахад зориулагдсан тоног төхөөрөмж юм. "
    },
    {
        "SrNo": "399",
        "english": "Computer",
        "mongolian": "Компьютер",
        "mongolian_description": "өгөгдлөөр боловсруулагдаж байгаа програмчлагдсан машин"
    },
    {
        "SrNo": "400",
        "english": "Computer aided",
        "mongolian": "Компьютерийн туслах хэрэгсэл",
        "mongolian_description": "Компьютерийн гүйцэтгэдэг ажилын үйл явц болон техникийн хамаарал зэрэг орно. "
    },
    {
        "SrNo": "401",
        "english": "Computer aided design (CAD) ",
        "mongolian": "Компьютерийн туслах хэрэгслийн дизайн",
        "mongolian_description": "Төхөөрөмж эсвэл системийг загварчлахад ашиглагддаг компьютерийн програм ба үүн дээр компьютерийн дэлгэц эсвэл принтер дээр дүрслэн, үйл ажиллагааг загварчлах ба үзүүлэлтүүдийн  статистикаар хангах боломжтой."
    },
    {
        "SrNo": "402",
        "english": "Computer aided design(CAD) ",
        "mongolian_description": "компьютерийн загвар дизайныг хийх систем CAD бол  зураг төсөл гарган боловсруулах хүснэгтийн оронд компьютерийн дэлгэцийг ашиглах боломжийг олгодог тогтолцоо юм"
    },
    {
        "SrNo": "403",
        "english": "Computer- aided software engineering ",
        "mongolian": "Компьютерийн туслах хэрэгслийн програм хангамжийн инженерчлэл",
        "mongolian_description": "Програм хангамжийн инженерчлэлийн үйл явц дахь туслах компьютерийн хэрэглээ зэрэг орно."
    },
    {
        "SrNo": "404",
        "english": "Computer based software system ",
        "mongolian": "Компьютерт суурилагдсан програм хангамжийн систем",
        "mongolian_description": "Програм хангамж нь компьютерийг ажиллуулдаг. "
    },
    {
        "SrNo": "405",
        "english": "Computer generated image CGI)",
        "mongolian_description": "кино гэх мэт зүйлсд тусгай эффект хийдэг 3D компьютер график программ"
    },
    {
        "SrNo": "406",
        "english": "Computer operator",
        "mongolian": "Хүлээн авах хүн",
        "mongolian_description": "Компьютерийн систем дэхь  хадгалалт нөөцлөлтийг  шалгаж мөн засахыг хариуцдаг хүн"
    },
    {
        "SrNo": "407",
        "english": "Computer platform",
        "mongolian": "Эх хавтан",
        "mongolian_description": "Үйлдлийн систем болон техник хангамжийн олон төрлийн холбоосууд хослон байрласан хавтан."
    },
    {
        "SrNo": "408",
        "english": "Computer resource allocation",
        "mongolian": "Компьютерийн нөөцийн хуваарилалт",
        "mongolian_description": "Одоогийн болон хүлээгдэж буй ажлуудад зориулагдсан компьютерийн нөөцийг хуваарьлах үүрэг гүйцэтгэнэ. ЖИШЭЭ: Гол санах ойн үүрэг, оролт гаралтын төхөөрөмж, компьютерийн системд нэгэн зэрэг  ажилыг хэрэгжүүлэхэд туслах тэдгээрийг агуулах."
    },
    {
        "SrNo": "409",
        "english": "Computer resources",
        "mongolian": "Компьютерийн нөөц",
        "mongolian_description": "Өгөгдсөн зорилгод нийцсэн компьютерийн тоног төхөөрөмж, багаж хэрэгсэл, програм, баримт бичиг, байгууламж, хангамж, бүрэлдэхүүн зэрэг орно."
    },
    {
        "SrNo": "410",
        "english": "Computer science ",
        "mongolian": "Компьютер шинжлэх ухаан",
        "mongolian_description": "Компьютерийн мэдээлэл боловсруулалттай  холбоотой шинжлэх ухаан, технологийн салбар. "
    },
    {
        "SrNo": "411",
        "english": "Computer software component (CSC) ",
        "mongolian": "Компьютер прогамм хангамжийн бүрэлдэхүүн хэсэг",
        "mongolian_description": "Функц болон логикийн хувьд компьютерийн програм хангамжийн тохируулгын зүйлийн хэсэг нь өөр, ерөнхийдөө 2 болон түүнээс дээш программ хангамжийн нэгжүүдийн цогц, нэгдсэн үзүүлэлт"
    },
    {
        "SrNo": "412",
        "english": "Computer software configuration item (CSCI) ",
        "mongolian": "Компьютер програм хангамжийн тохируулгын зүйл ",
        "mongolian_description": "Програм хангамжийн нэгдсэн үзүүлэлт нь тохируулгын менежментэд зориулагдан загварчлагддаг бөгөөд тохируулгын менежментийн үйл явц дахь нэгэн гэж авч үздэг."
    },
    {
        "SrNo": "413",
        "english": "Computer system",
        "mongolian": "Компьютерийн систем",
        "mongolian_description": "1 ба түүнээс дээш компьютерүүд болон нэгдсэн програм хангамжуудыг агуулдаг систем юм. "
    },
    {
        "SrNo": "414",
        "english": "Computerization",
        "mongolian": "Мэдээллийн автоматжуулалт",
        "mongolian_description": "Компьютерийн автоматжуулалт"
    },
    {
        "SrNo": "415",
        "english": "Computerize",
        "mongolian": "компьютержүүлэх, автоматжуулах",
        "mongolian_description": "Компьютероор автоматжуулах"
    },
    {
        "SrNo": "416",
        "english": "Computing system specification concept ",
        "mongolian": "Тооцооллын системийн онцлог зарчмууд",
        "mongolian_description": "Тодорхой болон тоологдох тооцооллын системийн ойлголт нь тусгаарлалт болон хамаарлын шинж чанарыг агуулсан байдаг. "
    },
    {
        "SrNo": "417",
        "english": "Computing system tool",
        "mongolian": "Тооцооллын системийн хэрэгсэл",
        "mongolian_description": "Динамик системийг хөгжүүлж бүтээхэд байгууламж болон боловсруулагчдад хэрэглэгддэг компьютерт суурилсан төхөөрөмж юм."
    },
    {
        "SrNo": "418",
        "english": "Comunications planing",
        "mongolian": "Холбооны төлөвлөлт",
        "mongolian_description": "Оролцогч талуудын холболтын хэрэгцээ шаардлага болон мэдээлэл хэрхэн нийцэж байгаагаас хамаарах процесс. Хэнд ямар холболт хэрэгтэй, тэдэнд хэзээ тухайн холболт шаардлагатай ба тэдэнд холболтыг хэрхэн хийж өгөх талаар төлөвлөлтөд багтана. "
    },
    {
        "SrNo": "419",
        "english": "Concatenated coding",
        "english_description": "The use of two codes, an inner and outer code, to further improve transmission performance. Using this technique, a data stream is encoded with the outer code and then the coded data is further encoded with the outer code. This technique is particularly effective in bursty environments. The use of concatenated codes is most common in space communications and usually involves a convolutional inner code and Reed-Solomon outer code."
    },
    {
        "SrNo": "420",
        "english": "Concatenation ",
        "mongolian": "Хэлхээ гинж цуваа",
        "mongolian_description": "2 болон түүнээс дээш цуваа утаснууд хамтдаа нэгдсэн хэлхээ процесс."
    },
    {
        "SrNo": "421",
        "english": "Concept of operations ( ConOps ) document",
        "mongolian": "Үйл апжиллагааны баримтын зарчим",
        "mongolian_description": "Хэрэглэгчид чиглэсэн баримт нь эцсийн хэрэглэгчийн байр суурьнаас системийн үйл ажиллагааны шинж чанарыг тодорхойлдог. "
    },
    {
        "SrNo": "422",
        "english": "Concept phase",
        "mongolian": "Зарчмын үе шат",
        "mongolian_description": "Системийн амьдралын цикл дэх хугацааны үечлэл нь хэрэглэгчдийн хэрэгцээ тодорхойлогдох болон системийн зарчмууд тодорхойлогдох, үнэлэгдэх зэргээр тодорхойлогдоно. "
    },
    {
        "SrNo": "423",
        "english": "Conceptual data model",
        "mongolian": "Зарчмын дата загвар",
        "mongolian_description": "Дата загвар нь хэрэглэгчдэд танигдсан дата групп мэдээллүүдэд загвар болж өгдөг. "
    },
    {
        "SrNo": "424",
        "english": "Concurrent thread",
        "mongolian": "Давхацсан утас",
        "mongolian_description": "2 болон түүнээс дээш холбогдсон шугамууд ижил цаг хугацаанд олон төрлийн үүргийг гүйцэтгэн биелүүлэх"
    },
    {
        "SrNo": "425",
        "english": "Condition",
        "mongolian": " Нөхцөл",
        "mongolian_description": "Нөхцөл, томъёоны төрөлд тухалбал ‘IF нас >17  гээд 17 оос бага нөхцөлүүд гарч ирэх"
    },
    {
        "SrNo": "426",
        "english": "Conferencing software",
        "mongolian": "Хуралдааны програм хангамж",
        "mongolian_description": "Ямар ч газраас  виртуал бага хуралд оролцох системтэй хэрэглэгчид холбогдох боломжтой байгаа нь Программ хангамж юм. Програм хангамж нь цахим бүрдэл хэсэг доторх текст мессежүүдийг хэрэглэгчид харах боломжтой юм.Хуралдааны програм хангамж нь харэглэгчид хоорондын дүрс бичлэгийн болон дуу бичлэгийн харилцааг хүртэл өөртөө багтааж байдаг."
    },
    {
        "SrNo": "427",
        "english": "Configuration",
        "mongolian": "Тохиргоо",
        "mongolian_description": "Компьютерийн систем дэхь програм хангамж болон техник хангамж зэргийг өөртөө багтаасан бүрэлдэхүүн хэсгүүдээс сонгох буюу тохиргоо хийх."
    },
    {
        "SrNo": "428",
        "english": "Configure",
        "mongolian": "Боловсронгуй хэлбэр дүрст орох үйл явц",
        "mongolian_description": "техник хангамж болон програм хангамжийн тохиргоог өөрчлөх үйл явц нь таны тооцоолж байдаг платформ эсвэл хувийн сонголтонд тань тохирохыг хэлнэ."
    },
    {
        "SrNo": "429",
        "english": "Connect ",
        "mongolian": "Холболт",
        "mongolian_description": "2 болон түүнээс дээш зүйлүүд нэгдэх тухайлбал холбогдсон компьютерууд хоорондоо   сүлжээгээр холбогдох."
    },
    {
        "SrNo": "430",
        "english": "Connection speed ",
        "mongolian": "Холболтын хурд",
        "mongolian_description": "Компьютерт нэмэлт өгөгдөл татаж суулгах хурд."
    },
    {
        "SrNo": "431",
        "english": "Constant",
        "mongolian": "Тогтмол хэмжигдхүүн",
        "mongolian_description": "Өгөгдөл нь тогтсон үнэлэмж буюу хэмжээтэй байна.Хэрэв тогтмол бус хувьсах хэмжигдхүүн байвал үүнийг ашиглан хувиргана."
    },
    {
        "SrNo": "432",
        "english": "Constellation",
        "english_description": "A graphical representation of signal states for a digital system."
    },
    {
        "SrNo": "433",
        "english": "Contacts",
        "mongolian": "Нэрсийн жагсаалт",
        "mongolian_description": "Хэрглэгчийн цахим шуудан ба нэрсүүдийн жагсаалт(Хувь хүний)-г хэлнэ."
    },
    {
        "SrNo": "434",
        "english": "Content",
        "mongolian": "Өгөгдлийн агууламж",
        "mongolian_description": "Өгөгдөлийн агууламж гэдэг нь веб хуудсанд байрлах бичвэрэн ба дүрсийн өгөгдөл юм."
    },
    {
        "SrNo": "435",
        "english": "Contention Ratio",
        "mongolian": "Хандалтын хэмжээ(хүрээ)",
        "mongolian_description": "Хандалтын хүрээ гэдэг нь илгээн түгээсэн мэдээлэл болон өгөгдлийг нэгээс олон буюу хэр олон хэрэглэгч хүлээн авч буцаан хандаж буйг илэрхийлэх хэмжигдхүүн юм.Жишээ нь Интернэт сервист холбогдон цацагдсан өгөгдлийг үзэж байгаа хэрэглэгчдийн тоо."
    },
    {
        "SrNo": "436",
        "english": "Continuous Phase Modulation",
        "abbreviation": "CPM",
        "english_description": "A phase modulation technique employing smooth transitions between signal states. This reduces sidelobe spectral energy and improves co-channel performance."
    },
    {
        "SrNo": "437",
        "english": "Continuous Stationary",
        "mongolian": "Тасралтгүй хэсэг",
        "mongolian_description": "Уг командыг ашигласнаар принтерт салангид хуудас хамт өгөгдсөн тохиолдолд дан хуудсыг хэвлэнэ."
    },
    {
        "SrNo": "438",
        "english": "Continuous Wave",
        "abbreviation": "CW",
        "english_description": "The term commonly gives to an unmodulated RF carrier."
    },
    {
        "SrNo": "439",
        "english": "Contrast(1)",
        "mongolian": "Өнгөний нарийвчлал",
        "mongolian_description": "Өнгөний нарийвчлал гэдэг нь дүрс зурагны харагдах байдлийг тохируулах,гэрэлтүүлэг ба харанхуйлалтын түвшинг нарийвчилж тодруулах үйлдэл."
    },
    {
        "SrNo": "440",
        "english": "Contrast(2) ",
        "mongolian": "Өнгөний нарийвчлал",
        "mongolian_description": "Өнгөний нарийвчлал гэдэг нь фото зурагны харагдах байдлийг тохируулах,гэрэлтүүлэг ба харанхуйлалтыг нарийвчлан сайжруулах үйл явц."
    },
    {
        "SrNo": "441",
        "english": "Control Channel",
        "abbreviation": "CCH",
        "english_description": "A general term used to describe the channels that transmit signaling and control information between the network and the mobile stations"
    },
    {
        "SrNo": "442",
        "english": "Control channel",
        "english_description": "A channel, usually logical, used to send administrative and supervisory signals between a base station and a mobile station."
    },
    {
        "SrNo": "443",
        "english": "Control Characters",
        "mongolian": "Удирдах тэмдэгтүүд",
        "mongolian_description": "Олон тэмдэгтүүд нь тус бүрдээ удирдах тэмдэгтүүдтэй байна.Эдгээрийг хэвлэгдэх боломжгүй тэмдэгтүүдийг орлуулах зорилгоор ашигладаг.Жишээ нь: Уг тэмдэгт баримт болон файлыг дуусч буйг илэрхийлдэг.Үргэлж уг ^ тэмдэгтээр илэрхийлнэ."
    },
    {
        "SrNo": "444",
        "english": "Control Panel",
        "mongolian": "Удирдах самбар",
        "mongolian_description": "Энэ хэрэгсэлээр хэрэглэгч компьютерийн программууд болон тохиргоог хялбараар хянах ба тохируулах боломжтой.Жишээ нь:Хулганыг хэр хурдан хөдөлгөх,дэлгэцийн гэрлийг(өнгө) тохируулах,чанга яригчийн түвшинг тохируулах,шинээр программ суулгах эсвэл хуучин программаа устгах гэх мэт үйлдлүүдийг хийнэ."
    },
    {
        "SrNo": "445",
        "english": "Control Unit",
        "mongolian": "Удирдах байгууламж",
        "mongolian_description": "Төв процессорын хэсэг бөгөөд байгууламжаас ирсэн командыг хянах буюу гүйцэтгэнэ.Удирдах байгууламж нь өгөгдлийг зөөвөрлөхдөө дэс дараалалд оруулдаг.Мөн удирдах төв компьютероос ирсэн дохиог дахин кодчлох буюу кодийг тайлах үүргийг гүйцэтгэнэ."
    },
    {
        "SrNo": "446",
        "english": "Control+Alt+Delete",
        "mongolian": "Контрол Алт Делете товчлууруудийн хослол",
        "mongolian_description": "Уг товчлууруудын хослол нь компьютерийн үйл ажиллагааг тасалдуулж буй программыг зогсоох эсвэл компьютероо дахин унтраах асаах үйлдлийг гүйцэтгэнэ."
    },
    {
        "SrNo": "447",
        "english": "Conversational mode(1) ",
        "mongolian": "Ярианы горим",
        "mongolian_description": "Зурвас болон дохион мэдээллийг хавтангаар дамжуулан дэлгэцэнд гаргах арга(зам).Яриаг  хугацаа ба цагын дарааллаар дэлгэцэнд харуулна."
    },
    {
        "SrNo": "448",
        "english": "Conversational mode(2) ",
        "mongolian": "Ярианы горим ",
        "mongolian_description": "Хэрэглэгч эцсийн төхөөрөмж(гар утас) ашиглан сүлжээнд нэвтрэх үед төв процессороос ярианы горимыг тодорхойлж тэр даруй холбон үргэлжлүүлнэ."
    },
    {
        "SrNo": "449",
        "english": "Converter",
        "mongolian": "Хувиргуур",
        "mongolian_description": "Хүлээн авч буй дохиог өөр дохиоруу хувиргагч төхөөрөмж.Ихэвчлэн дижитал дохионоос аналог дохио руу эсвэл эсрэгээр нь хувиргах үйл явц."
    },
    {
        "SrNo": "450",
        "english": "Convolutional code",
        "english_description": "A type of forward error correction code using a shift register containing a number of stages to shift the input bits one at a time to produce a coded output."
    },
    {
        "SrNo": "451",
        "english": "Cookie",
        "mongolian": "Хөтөчийн санах ойд хадгалагдах мэдээлэл",
        "mongolian_description": "Хөтөчийн санах ойд агуулагдах мэдээлэл нь хандалт хийсэн веб сайтын серверлүү хэрэглэгчийн мэдээллийг хөтөчөөр дамжуулан илгээдэг.Дараа нь хөтөчөө ашиглан өмнөх хандалт хийсэн сайтруугаа хандалт хийхэд веб серверээс өгөгдлийг шалган буцаан илгээдэг.Жишээ нь онлайн дэлгүүрүүд үүнийг ашигладаг бөгөөд сайт руу нэвтэрхэд хэрэглэгчийн мэдээллийг хөтөчийн санах ойгоор дамжуулан шалгаж тухайн хэрэглэгчийг таниж хариу өгөгдлийг илгээдэг."
    },
    {
        "SrNo": "452",
        "english": "Coordinated Universal Time",
        "abbreviation": "UTC",
        "english_description": "The time scale, maintained by the BIPM and the International Earth Rotation Service (IERS), which forms the basis of a coordinated dissemination of standard frequencies and time signals. UTC corresponds exactly in rate with TAI, but differs from it by an integral number of seconds. The UTC scale is adjusted by the insertion or deletion of seconds (positive or negative leap seconds) to ensure approximate agreement with UT1."
    },
    {
        "SrNo": "453",
        "english": "Co-processor",
        "mongolian": "Зэрэгцээ процессор",
        "mongolian_description": "CPU-н компьютерийн процессорийн математик үйл явцыг боловсруулдаг ө/х зорилтыг боловсруулдаг компьютерийн хоёрдогч  процессор юм"
    },
    {
        "SrNo": "454",
        "english": "Copy",
        "mongolian": "Хувилах",
        "mongolian_description": "Файл(Баримт)-ыг ижил хувилбараар хувилах процесс(үйл явц)."
    },
    {
        "SrNo": "455",
        "english": "Copy and Paste",
        "mongolian": "Хувилан хуулах",
        "mongolian_description": "Текст,зураг,архив гэх мэт өгөгдлүүдийг хувилж хуулах үйл явц.Бичиг баримт эсвэл компьютерийн бүх төрлийн өгөгдлүүдийг мөн адил хуулна."
    },
    {
        "SrNo": "456",
        "english": "Copy Protection",
        "mongolian": "Хуулбар хамгаалах",
        "mongolian_description": "Хуулбар хамгаалах нь өгөгдлийг дискрүү хуулах үед алдаа гарахаас сэргийлэн хамгаалах үйл явц."
    },
    {
        "SrNo": "457",
        "english": "Copyright",
        "mongolian": "Зохиогчийн эрх",
        "mongolian_description": "Зохиогч болон хэвлэгчид өөрсдийн зохион бүтээсэн компьютерийн программ хангамж болон мэдээллийг зөвшөөрөлгүй ашиглахаас хамгаалах хууль ёсний эрх авхыг хэлнэ.Зохиогчийн эрх нь 1988 онд загвар хийц ба зохиогчийн эрхийн гэрчилгээгээр батлагдсан."
    },
    {
        "SrNo": "458",
        "english": "Cordless Telephone 2",
        "abbreviation": "CT-2",
        "english_description": "A second generation cordless telephone system that allowed users to roam away from their home base stations and receive service in public places. Away from the home base station, the service was one way outbound from the phone to a telepoint within range."
    },
    {
        "SrNo": "459",
        "english": "Corruption",
        "mongolian": "Алдагдал",
        "mongolian_description": "Мэдээлэл эсвэл өгөгдлийг хадгалах ба хуулах үед гарах алдааг илэрхийлдэг.Энэ нь ихэнхдээ цахилгааны нөлөөлөл эсвэл эвдэрсэн төхөөрөмж гэх мэт физик нөлөөллөөс болж бий болдог."
    },
    {
        "SrNo": "460",
        "english": "Coverage area",
        "english_description": "Area associated with a space station for a given service and a specified frequency within which, under specified technical conditions, it is feasible for radiocommunications to be established with one or several earth stations, either for reception or transmission or both.",
        "description": "Note 1 – Several coverage areas may be associated with one and the same station, for example, a satellite with several antenna beams. Note 2 – The technical conditions include the following: characteristics of the equipment used both at the transmitting and receiving stations, how it is installed, quality of transmission desired, e.g., protection ratios and operating conditions. Note 3 – The following may be distinguishable: – interference free coverage area, i.e., that limited solely by natural or artificial noise; – the nominal coverage area: it is defined, when establishing a frequency plan, by taking into account the foreseen transmitters; – the actual coverage area, i.e., with allowance made for the noise and interference which exist in practice. Note 4 – The concept of “coverage area” cannot be simply applied to a space station on board a non-geostationary satellite for which further study is necessary. Note 5 – Furthermore, the term “service area” should have the same technical basis as for “coverage area”, but also include administrative aspects."
    },
    {
        "SrNo": "461",
        "english": "coverage area",
        "english_description": "Area associated with a transmitting station for a given service and a specified frequency within which, under specified technical conditions, radiocommunications may be established with one or several receiving stations.",
        "description": "Note 1 – Several coverage areas may be associated with one and the same station. Note 2 – The technical conditions include the following: characteristics of the equipment used both at the transmitting and receiving stations, how it is installed, quality of transmission desired, e.g., protection ratios and operating conditions. Note 3 – The following may be distinguishable: – interference-free coverage area, i.e., that limited solely by natural or artificial noise; – the nominal coverage area: it is defined, when establishing a frequency plan by taking into account the foreseen transmitters; – the actual coverage area, i.e., with allowance made for the noise and interference which exists in practice. Note 4 – Furthermore, the term “service area” should have the same technical basis as for “coverage area”, but also include administrative aspects."
    },
    {
        "SrNo": "462",
        "english": "Coverage area",
        "english_description": "The geographical reach of a mobile communications network or system."
    },
    {
        "SrNo": "463",
        "english": "Coverage hole",
        "english_description": "An area within the radio coverage footprint of a wireless system in which the RF signal level is below the design threshold. Coverage holes are usually caused by physical obstructions such as buildings, foliage, hills, tunnels and indoor parking garages."
    },
    {
        "SrNo": "464",
        "english": "CPU (Central proccessing unit)",
        "mongolian_description": "CPU нь бүртгэл, арифметик логик нэгж, удирдлагын нэгж зэргийг багтаасан компьютерийн үндсэн хэсэг юм. Голчлон CPU нь үндсэн санах ойн хэсэгт ажиллана. Үүнийг заримдаа төв процессор эсвэл процессор гэж нэрлэдэг. Ихэнх компьютерүүд нэгээс илүү процессортой байдаг. "
    },
    {
        "SrNo": "465",
        "english": "Cradle",
        "mongolian": "Тулгуур",
        "mongolian_description": "Хувын дижитал туслах гэдэг үгийн товчлол эсвэл адилхан төхөөрөмж байж болно.Мөн  давхцсан дохиог компьютерлуу холбоно."
    },
    {
        "SrNo": "466",
        "english": "Crop",
        "mongolian": "Тайрах",
        "mongolian_description": "Тайрах гэдэг нь графикийн програм хангамж.Энэ нь ихэнхдээ зургын хэрэгцээгүй хэсгийг  арилгахын тулд тодорхой хүрээг сонгон авах үйлдэл юм."
    },
    {
        "SrNo": "467",
        "english": "Crop Tool",
        "mongolian": "Тайрах Хэрэгсэл",
        "mongolian_description": "Тайрах хэрэгсэл нь мөн адил графикийн программ хангамжюм.Уг хэрэгсэл нь зурагнаас тасдахад зөвшөөрөгдсөн хэсгүүдийг дэлгэцэнд харуулна."
    },
    {
        "SrNo": "468",
        "english": "Cross correlation",
        "english_description": "The complex inner product of a first sequence with a shifted version of a second sequence. Sequences are considered to have good cross correlation properties when there is very little correlation between the sequences as they are shifted against each other."
    },
    {
        "SrNo": "469",
        "english": "Cross Posting",
        "mongolian": "Давхар илгээх",
        "mongolian_description": "Давхар илгээх гэдэг нь хэрэглэгч 1 ижил мессежийг нэгээс олон хаяг руу зэрэг илгээх үйлдэл юм."
    },
    {
        "SrNo": "470",
        "english": "Cross talk",
        "english_description": "The ability for unwanted information from one channel to \"spill over\" into an adjacent channel."
    },
    {
        "SrNo": "471",
        "english": "Cross-polarization",
        "mongolian": "Хөндлөн туйлшрал ",
        "mongolian_description": "Хөндлөн туйлшралтай долгион нь цахилгаан ба соронзон орон орших хавтгайд пэрпендукляр чиглэлд тархдаг. Цахилгаан соронзон долгион нь хөндлөн туйлшралтай байдаг."
    },
    {
        "SrNo": "472",
        "english": "Cross-polarization",
        "english_description": "The appearance, in the course of propagation, of a polarization component which is orthogonal to the expected polarization."
    },
    {
        "SrNo": "473",
        "english": "Cross-polarization discrimination",
        "mongolian": "Хөндлөнтуйлширлын ялгаа ",
        "mongolian_description": "Өгөгдсөн туйлшралтай дамжуулагдсан радио долионы хувьд тэгш өнцөгт туйлшралыг  хүлээн авах ба хүлээгдэж буй туйлшарлыг дамжуулдаг."
    },
    {
        "SrNo": "474",
        "english": "Cross-polarization discrimination",
        "english_description": "For a radio wave transmitted with a given polarization, the ratio at the reception point of the power received with the expected polarization to the power received with the orthogonal polarization.",
        "description": "Note – The cross-polarization discrimination depends both on the characteristics of the antennas and on the propagation medium."
    },
    {
        "SrNo": "475",
        "english": "Cross-polarization isolation",
        "mongolian": "Хөндлөнтуйлшралыг тусгаарлах ",
        "mongolian_description": "Адилхан чиглэлд тархаж буй туйлширсан долгионууд долгионы тархалтын чиглэлд пэрпендүклүяр орших хавтгайд хэлбэлзэлийн чиглэлд хамааран ялгаддаг."
    },
    {
        "SrNo": "476",
        "english": "Cross-polarization isolation",
        "english_description": "For two radio waves transmitted at the same frequency with the same power and orthogonal polarization, the ratio of the co-polarized power in a given receiver to the cross-polarized power in that receiver."
    },
    {
        "SrNo": "477",
        "english": "CRT Monitor ",
        "mongolian": "Катодан цацаргалтын хоолойн дэлгэц",
        "mongolian_description": "Катодан цацаргалтын хоолойн дэлгэц гэдэг нь катодан цацаргалтын хоолойг ашиглан дүрсийг дэлгэцэнд харуулах үйл явц юм."
    },
    {
        "SrNo": "478",
        "english": "Cumulative Distribution Function",
        "abbreviation": "CDF",
        "english_description": "The cumulative probability that a parameter will be less than a given value X."
    },
    {
        "SrNo": "479",
        "english": "Currency Data",
        "mongolian": "Өгөгдөлийн хүчинтэй байх хугацаа",
        "mongolian_description": "Хадгалагдсан мэдээллийн төрөл багтаамж зэргээр нь эргэлтэд оруулах.(Жишээ:Тэмдэгтэд хөрвүүлэх эсвэл эсрэгээр нь хийх үйлдэл)"
    },
    {
        "SrNo": "480",
        "english": "Cursor Control Key",
        "mongolian": "Курсорон сумаар удирдах товчлуур",
        "mongolian_description": "Хулганы сумтай адилхан харагддаг товчлуур.Сумны чиглэлийн дагуу дээшээ болон доошоо гүйлгэж удирдана."
    },
    {
        "SrNo": "481",
        "english": "Customise",
        "mongolian": "Өөрчлөх",
        "mongolian_description": "Хэрэглэгчийн сонголтонд тодорхой өргөдөл болон компьютерын систем тохируулдаг. Ихэвчлэн хэрэглэгчийн гоо зүйн өөрчлөлт түүнчлэн тэнхлэгт үйл ажиллагааг хийх боломжтой. Жишээ нь график, өнгө, байршлыг өөрчилж болох юм"
    },
    {
        "SrNo": "482",
        "english": "Cut and paste",
        "mongolian": "Таслах мөн наах  ",
        "mongolian_description": "Өгөдлийг устгахгүйгээр ижил эсвэл өөр файлыг компьютэрийн өөр газар руу шилжүүлэх үйл явц. (текст зураг файл гэх мэт)"
    },
    {
        "SrNo": "483",
        "english": "Cyberspace",
        "mongolian": "Кибер огторгуй /орон зай/",
        "mongolian_description": "Интернэт ашиглан мэдээлэлрүү хандаж болно. Энэ хуурмаг виртуаль ертөнц нь бүх  сайт, бүх файлуудаас бүрдсэн гэж үзэж болно. Энэ виртуаль цахим ертөнцөөр тойрон явж, ижил аргаар сонирхолтой зүйлийг хайж дэлхийн бодит талбайг судалж болно."
    },
    {
        "SrNo": "484",
        "english": "Cyclic codes",
        "english_description": "These are a subclass of linear block codes with an algebraic structure that enables encoding to be implemented with a linear shift register and decoding to be implemented without a lookup table."
    },
    {
        "SrNo": "485",
        "english": "Cyclic redundancy (CRC)",
        "mongolian_description": "Найдвартай мэдээлэл гарган баталгаажуулах шалгалтын төрөл нийцэж байгаа болон гэмтсэн байна гэсэн үг. CRC нь түгээмэл дискүүд дээр хадгалагдсан өгөдлийн блокуудыг сүлжээгээр дамжуулах буюу шалгахад ашигласан байдаг."
    },
    {
        "SrNo": "486",
        "english": "Cyclic Redundancy Code",
        "abbreviation": "CRC",
        "english_description": "The use of the syndrome of a cyclic block code to detect errors."
    },
    {
        "SrNo": "487",
        "english": "Cylinder",
        "mongolian": "Цилиндр",
        "mongolian_description": "Цилиндр гэж нэрлэдэг тэжээлийн цагираг нь диск дээр хадгалагдаж байдаг. Диск бүр дэх арав дахь мөрийг нь цилиндр гэж нэрлэдэг. Жишээ нь нэг нь нөгөөгөөсөө олонлог багц юм. Энэ нь толгой мэдээллийг олж авахын тулд уншиж бичих шаардлаггүй учир нь цилиндр дээр биш харин нэг диск дээр мэдээллийг хамт хадгалах нь хэвийн үзэгдэл юм."
    },
    {
        "SrNo": "488",
        "english": "Cymomotive force",
        "abbreviation": "(c.m.f",
        "english_description": "The product formed by multiplying the electric field strength at a given point in space, due to a transmitting station, by the distance of the point from the antenna. This distance must be sufficient for the reactive components of the field to be negligible; moreover, the finite conductivity of the ground is supposed to have no effect on propagation.",
        "description": "Note 1 – The cymomotive force (c.m.f.) is a vector; when necessary it may be expressed in terms of components along axes perpendicular to the direction of propagation. Note 2 – The c.m.f. is expressed in volts; it corresponds numerically to the field strength in mV/m at a distance of 1 km."
    },
    {
        "SrNo": "489",
        "english": "Data",
        "mongolian": "Өгөгдөл",
        "mongolian_description": "Олон тооны өгөгдөл ба мэдээллийн боловсруулагдаагүй хэлбэр юм."
    },
    {
        "SrNo": "490",
        "english": "Data capture",
        "mongolian": "Өгөдөл авах ",
        "mongolian_description": "Компьютерт оруулах өгөгдлийн цуглуулага. Дэлгүүрт бар код уншуулах шатахууны тоолуурыг гараар бичих зэрэгт бар код автоматаар хийгдэж болно."
    },
    {
        "SrNo": "491",
        "english": "Data collection satellite",
        "english_description": "A satellite whose main purpose is the collection of data from stations on the Earth or in the atmosphere of the Earth, and subsequent forwarding of those data to one or more earth stations. It may also provide for communication in the other direction."
    },
    {
        "SrNo": "492",
        "english": "Data compression",
        "mongolian": "Өгөгдлийн нягтруулга ",
        "mongolian_description": "Том хэмжээний байдлаар эзлэгдсэн зайг багасгахыг өгөгдлийн нягтруулга гэнэ. Өгөгдлийн төрлүүдэд зориулсан янз бүрийн арга. "
    },
    {
        "SrNo": "493",
        "english": "Data entry",
        "mongolian": "Өгөгдлийн оролт ",
        "mongolian_description": "Компьютер руу өгөгдөл  оруулж боловсруулалт хийх."
    },
    {
        "SrNo": "494",
        "english": "Data integrity",
        "mongolian": "Өгөгдлийн бүрэн бүтэн байдал",
        "mongolian_description": "Энэ үед боловсруулалт хийсний дараа аль нэг мэдээллийг үнэн зөв тодорхойлно. Мэдээллийг өөрчилснөөр бүрэн бүтэн байх болно. Аюулгүй мэдээллийг ямар нэгэн тохиолдлоор, эсвэл буруу өөрчлөлтийг илрүүлэх замаар  өгөгдлийн бүрэн бүтэн байгаа эсэхийг шалгах хэрэгтэй."
    },
    {
        "SrNo": "495",
        "english": "Data logging",
        "mongolian": "Өгөгдөл бүртгэх ",
        "mongolian_description": "Цаг хугацаанд нь усны температурын өөрчлөлтийг бүртгэх ө.х фото электроныг ашиглах замаар мэдээллийг хадгалах юм."
    },
    {
        "SrNo": "496",
        "english": "Data processing manager",
        "mongolian": "Өгөгдөл боловсруулах менежер ",
        "mongolian_description": "Өгөгдөл  боловсруулах нийт ажиллагааг хариуцсан хүн."
    },
    {
        "SrNo": "497",
        "english": "Data projector",
        "mongolian": "Өгөгдлийн проектор",
        "mongolian_description": "Компьютер руу холбодог том дэлгэц, мөн проектор руу шууд хянах чадварыг хэмэгдүүлдэг."
    },
    {
        "SrNo": "498",
        "english": "Data Protection Act",
        "mongolian": "Өгөгдлийг хамгаалах тухай хуйл",
        "mongolian_description": "Өгөгдлийг хамгаалах тухай хуйл 1998 оны компьютерийн системүүд дээр өгөгдлийн хяналтыг тогтоосон УИХ-ын Их Британийн хууль юм.   Хууль мэдээ нь хувийн олон асуудлыг хамардаг. Хууль нь өгөгдлийн контроллер компьютержсэн мэдээллийг хийж ашиглах үүрэгтэй хүмүүсээр тодорхойлогддог. "
    },
    {
        "SrNo": "499",
        "english": "Data redundancy",
        "mongolian": "Өгөгдлийг цомхотгох",
        "mongolian_description": "Мэдээллийн систем дээр ихэвчлэн хэрэгцээгүй үед хоёр удаа гарч ирэх тохиолдол."
    },
    {
        "SrNo": "500",
        "english": "Data relay satellite",
        "english_description": "A satellite whose main purpose is the relay of data from one or more mission satellites or space probes to one or more earth stations. It may also provide for communication in the other direction. Additionally, it may be used as a relay for the space operation service.",
        "description": "Note – Data relay satellites are generally geostationary."
    },
    {
        "SrNo": "501",
        "english": "Data retrieval",
        "mongolian": "Өгөгдлийг олж авах",
        "mongolian_description": "Мэдээлллийн санд хадгалагдсан их хэмжээний өгөгдөл нь ашигтай мэдээлэл олборлох үйл явц юм. Энэ нь ихэвчлэн дэлгэцэнд хайлт хийх зааврыг ялгах явдал юм. Энэ нь өгөгдлийн их хэмжээний хайлт хийснээр үр дүнг гаргаж авах боломжтой. Мөн мэдээллийг сэргээх гэж нэрлэдэг."
    },
    {
        "SrNo": "502",
        "english": "Data security",
        "mongolian": "Өгөгдлийн аюулгүй байдал",
        "mongolian_description": "Төрөл бүрийн аргыг ашиглах нь аюулгүй зөв хадгалагдсан байгаа эсэхийг шалгах                          хэрэгтэй. (Өгөгдлийг хамгаалах) Өгөгдлийн бүрэн бүтэн байдал аюулгүй байдлын       мэдээллийн нууцлалыг хангах, түүнчлэн өгөгдлийн алдагдалд буюу устгахаас                        урьдчилан сэргийлэх хэрэгтэй.                                                                                                                                      Өгөгдлийн аюулгүй байдал нь тухайн хэсэг өгөгдлийн төлөвлөгөөтэй бөгөөд энэ нь үр дүнтэй сэргээн босгох ажиллагааг шалгаж байдаг."
    },
    {
        "SrNo": "503",
        "english": "Data subject",
        "mongolian": "Өгөгдлийн сэдэв ",
        "mongolian_description": "Мэдээлэл хамгаалах хуульд өгөгдлийн сэдэв нь хүнд холбогдолтой байхаар."
    },
    {
        "SrNo": "504",
        "english": "Data transmission",
        "mongolian": "Өгөгдөл дамжуулах",
        "mongolian_description": "Нэг төхөөрөмжөөс өгөгдөл авах. Энэ нь компьютерийн сүлжээний системийн хэсгүүд хооронд өгөгдлийг дамжуулах."
    },
    {
        "SrNo": "505",
        "english": "Data type",
        "mongolian": "Өгөгдлийн төрөл",
        "mongolian_description": "Өгөгдлийн төрөл албан ёсны тайлбар хадгалж эсвэл програмын систем дотор удирдаж байгаа цагаан толгойн тоо баримт буюу логик  тоо баримт. "
    },
    {
        "SrNo": "506",
        "english": "Data user",
        "mongolian": "Хэрэглэгчийн тоо баримт",
        "mongolian_description": "Мэдээлэл хамгаалах хуулийн зорилгоор тоо баримтын агуулга, хэрэглэгчийн хувийн мэдээллийг ашиглахад хяналт тавих."
    },
    {
        "SrNo": "507",
        "english": "Database",
        "mongolian": "Өгөгдлийн сан ",
        "mongolian_description": "Энэ нь янз бүрийн програмууд хэд хэдэн замаар хийх боломжыг олгох байдлаар зохион байгуулалттай тоо баримт, тэдгээрийн хооронд уялдаа холбоотой юм. Өгөгдлийг хугацаанд нь аль нэг аргаар тодорхойлохдоо чөлөөтэй ашиглаж болно ."
    },
    {
        "SrNo": "508",
        "english": "Database management system (DBMS",
        "mongolian_description": "Мэдээлэл дэх шинэ өгөгдлийг олж нэмэх, одоо байгаа тоо баримтыг өөрчлөх боломжтой програм хангамж юм. Өгөгдлийн сангийн тенежментийн систем хэрхэн автоматаар ажилладаг болохыг мэдэж авах. Энэ өгөгдлийн шинэчлэлтүүд нь хүссэн тоо баримтыг олж шийдвэрлэпдэг. Өгөгдлийн сангийн сисмемийн менежментийн систем нь өөрийн энгийн хэрэглэгчийн интерфэйсийг өгч болно эсвэл зүгээр л байгууллагад байгаа мэдээллийг ашиглан програмуудтай харьцаж болно."
    },
    {
        "SrNo": "509",
        "english": "Database manager",
        "mongolian": "Өгөдлийн сангийн менежер",
        "mongolian_description": "Өгөгдлийн сангийн адимнистратор юмуу эсвэл мэдээллийн ажилтан гэгддэг өгөгдлийн сангийн менежир бүтэц, зохион байгуулалт нь байгууллагад өгөгдлийн хяналт тавих үүрэг бүхий хүмүүс юм."
    },
    {
        "SrNo": "510",
        "english": "Dataflow diagram",
        "mongolian": "Өгөгдлийн урсгал диаграм",
        "mongolian_description": "Энэ нь дамжуулах үйл явцад мөн мэдээллийн систем хэрхэн хаашаа зөөх зарчимийг харуулж байдаг."
    },
    {
        "SrNo": "511",
        "english": "Date data",
        "mongolian": "Өгөгдлийн хугацаа",
        "mongolian_description": "Өдрийг илэрхийлэхэд ашиглагдаж байгаа өгөгдлийн төрөл. Жишээ нь 01022007 гэж бичнэ."
    },
    {
        "SrNo": "512",
        "english": "Datum",
        "mongolian": "Анхны мэдээлэл",
        "mongolian_description": "Өгөгдлийн ганц тоо нь тэдээллийн боловсруулагдаагүй материал."
    },
    {
        "SrNo": "513",
        "english": "Dead spot",
        "english_description": "An area within the coverage area of a wireless network in which there is no coverage or transmission falls off. Dead spots are often caused by electronic interference or physical barriers such as hills, tunnels and indoor parking garages. See also coverage area."
    },
    {
        "SrNo": "514",
        "english": "Debug",
        "mongolian": "Алдаа засах",
        "mongolian_description": "Энэ програмууд нь зөв илрүүлсэн ямар нэгэн алдаануудыг залруулах үйл явц юм."
    },
    {
        "SrNo": "515",
        "english": "DeciBel",
        "abbreviation": "dB",
        "english_description": "A technique for expressing voltage, power, gain, loss or frequency in logarithmic form against a reference. Typical references include volts, watts or Hz. DeciBels are calculated using the expression: dB = 10*log(x/y)."
    },
    {
        "SrNo": "516",
        "english": "DeciBels referenced to a dipole antenna",
        "abbreviation": "dBd",
        "english_description": "A technique for expressing a power gain measurement in logarithmic form using a standard dipole antenna as a reference."
    },
    {
        "SrNo": "517",
        "english": "DeciBels referenced to a milliWatt",
        "abbreviation": "dBm",
        "english_description": "A technique for expressing a power measurement in logarithmic form using 1 mW as a reference."
    },
    {
        "SrNo": "518",
        "english": "DeciBels referenced to an isotropic antenna",
        "abbreviation": "dBi",
        "english_description": "A technique for expressing a power gain measurement in logarithmic form using a theoretical isotropic antenna as a reference"
    },
    {
        "SrNo": "519",
        "english": "DeciBels referenced to the carrier",
        "abbreviation": "dBc",
        "english_description": "A technique for expressing a power measurement in logarithmic form using the carrier power as a reference."
    },
    {
        "SrNo": "520",
        "english": "Decimal",
        "mongolian": "Аравт",
        "mongolian_description": "Цифр 0-9 ыг ашиглан 10-тын системийг дугаарлах. Энэ нь ихэвчлэн хүмүүсийн хэрэглэдэг систем."
    },
    {
        "SrNo": "521",
        "english": "Decimal point",
        "mongolian": "Аравтын функц",
        "mongolian_description": "Аравтын тоонд бүхэл тоог цэгийн зүүн талд бутархай тоог цэгийн баруун талд хэсэгчлэн хуваавал тохироммжтой."
    },
    {
        "SrNo": "522",
        "english": "Declare a variable",
        "mongolian": "Хувьсагч зарлах ",
        "mongolian_description": "Ямар нэг зүйлийг зарлах програмчлал нь хувьсагч массив болон бусад ижил төрлийн объектын нэр болон өгөгдлийн төрлийг тодорхойлох Бүгд биш ч гэсэн олон програмчлалын хэл тэдгээрийг хэрэглэхээсээ өмнө хувьсагчыг зарлахыг хэрэглэгчээс шаардана."
    },
    {
        "SrNo": "523",
        "english": "Decode",
        "mongolian": "Декодлох",
        "mongolian_description": "Энэ цифрлэгдсэн буюу кодлосны дараа уншигдана. Жишээ нь өгөгдлийг буцаахтай  төстэй."
    },
    {
        "SrNo": "524",
        "english": "Decrement",
        "mongolian": "Багасалт",
        "mongolian_description": "Ямар нэгэн зүйлийн нэг нэгээр багасгах"
    },
    {
        "SrNo": "525",
        "english": "Decryption",
        "mongolian": "Код тайлалт, түлхүүр тайлалт",
        "mongolian_description": "Нууцлалт нь код тайлалтгүй ойлгомжгүй компьютерийн системд өгөгдөл үүсгэдэг. Шифрлэгдсэн өгөгдөл нь агуулгагүй харагддаг ба замбараагүй өгөгдлөөр тодорхойлогддог. Нууцлалт нь өгөгдлийг хамгаалалттай үүсгэдэг энэ нь ойлгомжтой байхаас урьдчилан сэргийлж байгаа юм. Электроникт хоёулаа агуулагдах ба компьютерийн системүүдийн хооронд мэдээллэнэ. Код тайлалт нь уншигдах боломжгүй өгөгдлийг ойлгомжтой хэлбэрт хөрвүүлнэ."
    },
    {
        "SrNo": "526",
        "english": "Dedicated Control Channel",
        "abbreviation": "DCCH",
        "english_description": "A dedicated channel used to carry signalling information in active GSM and cdma2000 traffic channels."
    },
    {
        "SrNo": "527",
        "english": "Deep space",
        "english_description": "Space at distances from the Earth equal to, or greater than, 2 × 106 km."
    },
    {
        "SrNo": "528",
        "english": "Default",
        "mongolian": "Өөрчлөх, зөрчих , өгөгдмөл ",
        "mongolian_description": "Хэрэглэгч тодорхой байдлаар тэдгээрийг өөрчлөхөд зориулагдсан компьютерын техник хангамж эсвэл програм хангамж дахь тохиргоонууд"
    },
    {
        "SrNo": "529",
        "english": "Default settings",
        "mongolian": "Анхдагч тохиргоо ",
        "mongolian_description": "Хард дискийг түр хугацаагаар ашигласаны дараа үүн дээр файлууд нь ижил файлууд өөр өөр нэр дээр олон хэсэгт хуваагдаж хадгалагдах нь дискний үйл ажиллагааг удаашруулдаг. Тухайн хэсэгчилэгдсэн файлууд нь дахин нэгдэх үед диск эргээд хэвийн үйл ажиллагаандаа ордог."
    },
    {
        "SrNo": "530",
        "english": "Defragment",
        "mongolian": "Задлах, хуваах",
        "mongolian_description": "Дараа нь хатуу дискэн дэх файлууд дах илүү хуваагддаг бөгөөд ижил файлуудын өөр хэсгүүд дискэн дэх өөр газар хадгалагдахыг хуваах буюу задлах гэнэ. Энэ нь дискний үйл ажиллагааг удаашруулдаг. Эдгээр эд ангиудыг дахин хамтад нь цуглуулах үе шатыг диск задрах гэнэ. Тиймээс дискний хүрэлцээг хурдлуулна."
    },
    {
        "SrNo": "531",
        "english": "Delay spread",
        "english_description": "A type of distortion due to multipath resulting in the spreading out or \"smearing\" of the received signal. It occurs when identical signals arrive via different paths and have different time delays."
    },
    {
        "SrNo": "532",
        "english": "Delete",
        "mongolian": "Устгах ",
        "mongolian_description": "Дискээс устгах болон тэмдэгтүүд мэдээллүүдийг арилгах үйл явц юм."
    },
    {
        "SrNo": "533",
        "english": "Delete key",
        "mongolian_description": "Тэмдэгтийг устгадаг гол товчлуур"
    },
    {
        "SrNo": "534",
        "english": "Demo version",
        "mongolian": "Демо хувилбар ",
        "mongolian_description": "Програмын бүрэн онцлогыг ашигладаг жишээ програм"
    },
    {
        "SrNo": "535",
        "english": "Demodulation",
        "english_description": "Process of recovering the original modulating signal from a modulated carrier. The original modulating signal is usually the information being transmitted, typically voice or data."
    },
    {
        "SrNo": "536",
        "english": "Depolarization",
        "mongolian": "Туйлгүй болох",
        "mongolian_description": "Тодорхой туйлшралын радио долгионы урт ямар ч байж болно. Дамжуулсан туйлшарлын дараах үүрэг нь тодорой тархалтын үзэгдэл юм. "
    },
    {
        "SrNo": "537",
        "english": "Depolarization",
        "english_description": "A phenomenon by virtue of which all or part of the power of a radio wave transmitted with a defined polarization may no longer have a defined polarization after propagation."
    },
    {
        "SrNo": "538",
        "english": "Descendantе",
        "mongolian": "Удам",
        "mongolian_description": "Гол мэдээний бүтцэд удам нь илүү өндөр түвшинд өөр горимд холбоотой байдаг."
    },
    {
        "SrNo": "539",
        "english": "Desk top publishing",
        "mongolian": "Ширээн дээрх хэвлэлт",
        "mongolian_description": "Энэ нь бусад текст боловсруулагчтай төстэй бөгөөд энэ нь зохиомжийн дизайныг илүү зохион байгуулалттай болгохыг санал болгодог."
    },
    {
        "SrNo": "540",
        "english": "Desktop",
        "mongolian": "Дэлгэц",
        "mongolian_description": "Хэрэглэгчийн схемийн хэрэгсэл дэх дэлгэцэн дээрх үндсэн ажлын байр. Хэрэглэгчид дэлгэцэн дээрх файл програмуудыг ашиглах ба файлыг товчлох хадгалах зэргийг хийж болно. Мөн хэрэглэгч дэлгэцний дүрс зураг фон зэргийг өөрчилж болно."
    },
    {
        "SrNo": "541",
        "english": "Desktop computer",
        "mongolian": "Ширээний компьютер",
        "mongolian_description": "Хувийн хэрэглэгчийн хувьд ширээний компьютер нь ширээн дээр ашиглахад зориулагдсан. Энэ нь бүрэн хэмжээний гартай үүнд эрчим хүчний гарны шугам ашиглагддаг. Төв процессор диск уншигч болон бусал зүйлийг агуулна. Хайрцаг нь заримдаа дэлгэцэнд дэмжлэг өгөхөөр хадгалагддаг."
    },
    {
        "SrNo": "542",
        "english": "Destination address",
        "mongolian": "Очих хаяг",
        "mongolian_description": "Өгөгдлийн багц илгээх үйлдэл юм."
    },
    {
        "SrNo": "543",
        "english": "Detect a virus",
        "mongolian": "Вирус илрүүлэх",
        "mongolian_description": "Компьютерйин хэрэглэж буй вирусны эсрэг програм дээрх вирусыг илрүүлэх"
    },
    {
        "SrNo": "544",
        "english": "Developer",
        "mongolian": "Хөгжүүлэгч",
        "mongolian_description": "Систем, програм, вебсайт зэргийг хөгжүүлэх үүрэгтэй хүн"
    },
    {
        "SrNo": "545",
        "english": "Device Under Test",
        "abbreviation": "DUT",
        "english_description": "An acronym used to describe some type of electrical apparatus connected to test instrumentation. The apparatus can range from a single component to a complex subsystem such as a mobile phone, base station or MSC"
    },
    {
        "SrNo": "546",
        "english": "DHC servers",
        "mongolian": "ДНС сервер",
        "mongolian_description": "Домайныг IP хаяг луу хөрвүүлэгч"
    },
    {
        "SrNo": "547",
        "english": "Dialogue box",
        "mongolian": "Харилцан ярианы хайрцаг",
        "mongolian_description": "Сонголтын талаар мэдээлэл хэрэгтэй үед эсвэл хувилбаруудыг сонгож байх үед гарч ирэх цонх. Жишээлбэл PRINT FILE гэсэн цонхыг сонгоход гарч ирэх харилцан ярианы цонх эсвэл PAGES PRINT дугаарууд руу хандахад гарч ирэх цонх."
    },
    {
        "SrNo": "548",
        "english": "Dial-up ",
        "mongolian": "Тооцоолууртай утсыг холбох",
        "mongolian_description": "Ердийн телефон утасны шугам ашиглан орон нутгийн компьютер терминал интернэт зэрэг алсын компьютерийн үйлчилгээг холбох. Ихэнх тохиолдолд компьютерийн системд байгууламж залгах нь тооцоолууртай утсыг холбох үйлчилгээ эрхэлж буй үйлчилгээ үзүүлэгчийн өгөх үйлчилгээ"
    },
    {
        "SrNo": "549",
        "english": "Different backup",
        "mongolian": "Ялгавартай нөөц",
        "mongolian_description": "Сүүлийн бүрэн нөөцлөлтөөс хойшхи зөвхөн хувь өгөгдлийн файлууд өөрчлөгдсөнийг ялгавартй нөөц гэнэ."
    },
    {
        "SrNo": "550",
        "english": "Differential detection",
        "english_description": "An encoding and detection technique that uses phase changes in the carrier to signal binary \"ones\" and \"zeros\". The signal is sampled every T seconds, and a phase change of 180 degrees could be set to be a \"zero\" and no phase change would then be a \"one\"."
    },
    {
        "SrNo": "551",
        "english": "Differential Quadrature Phase Shift Keying",
        "abbreviation": "DQPSK",
        "english_description": "QPSK modulation using differential encoding of the digital information stream."
    },
    {
        "SrNo": "552",
        "english": "Diffraction",
        "english_description": "A propagation phenomenon that allows radio waves to propagate beyond obstructions via secondary waves created by the obstruction. Classic types of diffractions are smooth earth and knife-edge."
    },
    {
        "SrNo": "553",
        "english": "Digest",
        "mongolian": "Товч мэдээлэл",
        "mongolian_description": "Захидлын жагсаалтанд нэг том захидал дах илгээж буй захидлаасаа сонгодог харин энэ нь нэг цагт тэдгээрийг бүгдийг нь хүлээн авах боломжтой."
    },
    {
        "SrNo": "554",
        "english": "Digit",
        "mongolian": "Уртын нэгж , нэг оронт тоо",
        "mongolian_description": "0 9 хүртэлх тоонуудын 6 бол нэг оронт тоо 422 бол 3 оронт тоо"
    },
    {
        "SrNo": "555",
        "english": "Digital",
        "mongolian": "Тоон",
        "mongolian_description": "Мэдээлэл нь хоёртын тооллын 0 ба 1 гэсэн импульсэн төсөөллөөр цувран холбогдсон. Аналог дохионы хувьд ялгаатай нь байнга өөрчлөгдөж байдаг."
    },
    {
        "SrNo": "556",
        "english": "Digital",
        "english_description": "Describes when information - speech, for example - is encoded before transmission using a binary code - discrete, non-continuous values. Digital networks are rapidly replacing analog ones as they offer improved sound quality, secure transmission and can handle data as well as voice. Digital networks include mobile systems GSM 900, GSM 1800, GSM 1900, D-AMPS and the cordless DECT system."
    },
    {
        "SrNo": "557",
        "english": "Digital audio tape",
        "mongolian": "Дижитал аудио хальс",
        "mongolian_description": "Соронзон хальс нь анх зөвхөн бичлэг дуу хөгжүүлж байсан. Гэвч одоо компьютерийн нөөцлөлтөнд илүү хэрэглэдэг."
    },
    {
        "SrNo": "558",
        "english": "Digital camera",
        "mongolian": "Дижитал камер",
        "mongolian_description": "Зураг дардаг электрон камер буюу зураг нь диск дижитал файлууд дээр хадгалагддаг. Харин киноны хувьд арай илүү. Эдгээрийг компьютерт хадгалж үзэх засварлах хэвлэхэд ашиглаж болно."
    },
    {
        "SrNo": "559",
        "english": "Digital Communications System - 1800",
        "abbreviation": "DCS-1800",
        "english_description": "A delta spec to the GSM specification dealing with the aspects of operating in the 1800 MHz band with an increased number of RF channels. This spec also included features for pedestrian operation of small portable devices."
    },
    {
        "SrNo": "560",
        "english": "Digital European Cordless Telecommunications",
        "abbreviation": "DECT",
        "english_description": "A common standard for cordless personal telephony originally established by ETSI, a European standardization body. Standard based on a micro-cellular radio system that provides low-power cordless access between subscriber and base station up to a few hundred meters. Also known as DCT-900 and CT-3."
    },
    {
        "SrNo": "561",
        "english": "Digital image",
        "mongolian": "Дижитал зураг",
        "mongolian_description": "Дижитал хэлбэрээр хадгалагдсан зураг мөн тэдгээрийг компьютерт засварлах зэргийг хийж болно. Энэ нь дижитал камераар авагдсан нэг төрөл"
    },
    {
        "SrNo": "562",
        "english": "Digital Phase Modulation",
        "abbreviation": "DPM",
        "english_description": "A form of CPM in which the shaped symbol pulses are directly applied to the phase modulator. This technique provides the advantages of CPM techniques and is easily implemented in VLSI. It is also easier to demodulate than other types of CPM."
    },
    {
        "SrNo": "563",
        "english": "Digital signature",
        "english_description": "An electronic signature. A technology used to guarantee the reliability of information during electronic transactions. Digital signaturing is enabled through the application of open key encryption technology, and comprises electronic data verifying the identity of the user. A digital signature is created by coding data using an encryption key. Since only the user him/herself is in possession of the corresponding encryption key, the digital signature is essentially unforgeable. The digital signature is subsequently attached to data transmitted to another party to guarantee that the individual sending the message really is who he or she claims to be. ["
    },
    {
        "SrNo": "564",
        "english": "Digital subscriber line",
        "mongolian": "Хэрэглэгчийн тоон шугам",
        "mongolian_description": "Өндөр хурдтай компьютероос өгөгдлийг дамжуулах ердийн телефон утасны арга. Өргөн зурвасын интернэт гэж нийтлэг хэрэглэгддэг ба гэр болон бизнесд илүү хэрэглэгддэг.."
    },
    {
        "SrNo": "565",
        "english": "Digital to Analog Converter",
        "abbreviation": "DAC",
        "english_description": "A device that takes a digital representation of a signal and transforms it into a facsimile of its original form."
    },
    {
        "SrNo": "566",
        "english": "Digital versatile disk(DVD)",
        "mongolian": "Дижитал болон олон талын диск",
        "mongolian_description": "Урьд нь дижитал видео диск харин одоо дижитал болон олон талын диск, энэ нь үндсэндээ хурдан өгөгдөл дамжуулах томоохон хүчин чадал бүхий CD юм. Энэ нь видеог илүү удаан хийх боломжийг олгодог, жишээлбэл кино. Мөн DVD-г өгөгдлийн хадгалалтын хувьд ашиглаж болно."
    },
    {
        "SrNo": "567",
        "english": "Digital video",
        "mongolian": "Дижитал видео",
        "mongolian_description": "Дижитал видео соронзон хальсны нийтээр хүлээн зөвшөөрсөн стандарт"
    },
    {
        "SrNo": "568",
        "english": "Digital-Advanced Mobile Phone System",
        "abbreviation": "D-AMPS",
        "english_description": "Earlier designation of American standard for digital mobile telephony used primarily in North America, Latin America, Australia and parts of Russia and Asia. Also known as (North American) TDMA. See also TDMA and IS-136."
    },
    {
        "SrNo": "569",
        "english": "Dimension(1)",
        "mongolian": "Хэмжээс",
        "mongolian_description": "Програмчлалд массивийн бүтцэд хамааруулан хэрэглэнэ. Нэг хэмжээст массиваар жишээ жагсаалтыг харж болно, хоёр хэмжээст массиваар хүснэгтийн байдлаар нь дамжин багана мөрөөр нь харж болно. Массивын элемэнтүүд нь массив тус бүрээр нь тэмдэглэгээг илэрхийлдэг."
    },
    {
        "SrNo": "570",
        "english": "Dimension(2)",
        "mongolian": "Хэмжээс",
        "mongolian_description": "Массивын бүтэц нэмж хэлбэл нэг хэмжээст массиваар жишээ жагсаалтыг харж болно."
    },
    {
        "SrNo": "571",
        "english": "Direct access",
        "mongolian": "Шууд хандалт",
        "mongolian_description": "Шууд хандалт нь ямар нэгэн зүйлийг хаанаас ч шууд татаж авч болдог, файл нь мэдэгдэж байгаа тохиолдолд байр сууриа өгсөн. Энэ нь ихэвчлэн зүйлс нь тодорхой урттай байх ёстойг илэрхийлнэ, тиймээс програм хангамж шаардлагатай зүйлс хаана байгааг тодорхойлж чадна. Шууд хандалтын файлуудыг ихэвчлэн санамсаргүй хандалтын файлууд гэж нэрлэдэг учир нь тэд нар  хадгалалтанд диск зэрэгт санамсаргүй боломж олгодог."
    },
    {
        "SrNo": "572",
        "english": "Direct distribution",
        "english_description": "Use of a satellite link of the fixed-satellite service to relay broadcasting programmes from one or more points of origin, directly to terrestrial broadcasting stations without any intermediate distribution stages (possibly including other signals necessary for their operation)."
    },
    {
        "SrNo": "573",
        "english": "Direct Sequence",
        "abbreviation": "DS",
        "english_description": "A process of spectrum spreading where the digital information stream is multiplied, using an exclusive OR technique, by a high speed pseudorandom code (spreading sequence) to generate a spread spectrum signal."
    },
    {
        "SrNo": "574",
        "english": "Direct Sequence Spread Spectrum",
        "abbreviation": "DSSS",
        "english_description": "A type of spread spectrum modulation using a direct sequence technique to achieve spreading."
    },
    {
        "SrNo": "575",
        "english": "Disable",
        "mongolian": "Хориглох(блоклох)",
        "mongolian_description": "Ямар нэгэн юмыг ажиллах үйл явцыг зогсоох"
    },
    {
        "SrNo": "576",
        "english": "Discontinuous Transmission",
        "abbreviation": "DTX",
        "english_description": "A feature in mobile systems where transmitters mute when there is no information to send, such as during periods of silence. This feature prolongs battery life in portable phones and reduces interference in wireless systems"
    },
    {
        "SrNo": "577",
        "english": "Disinfect ",
        "mongolian_description": "Компьютерээс вирусыг устгах үйл явц"
    },
    {
        "SrNo": "578",
        "english": "Disk",
        "mongolian": "Диск",
        "mongolian_description": "Компьютерийн өгөгдөл болон програмыг хадгалах зориулалтай хэсгийг диск гэнэ.       "
    },
    {
        "SrNo": "579",
        "english": "Disk drive",
        "mongolian": "Дискний төхөөрөмж",
        "mongolian_description": "Диск нь бичих болон дискнээс уншихад зориулагдсан төхөөрөмж"
    },
    {
        "SrNo": "580",
        "english": "Disk pack",
        "mongolian_description": "Дискний багц.Олон диск уншихад зориулагдсан төхөөрөмж"
    },
    {
        "SrNo": "581",
        "english": "Dispersive channel",
        "english_description": "A radio channel that not only introduces AWGN, but also the effects of multipath and frequency selective fading."
    },
    {
        "SrNo": "582",
        "english": "Display",
        "mongolian": "Дэлгэц",
        "mongolian_description": "Гаралтыг харуулах төхөөрөмж жишээ нь:монитор"
    },
    {
        "SrNo": "583",
        "english": "Distributed antenna system",
        "english_description": "A type of antenna system that is distributed or remotely located away from the transmitter. Such an antenna or series of antennas can be connected via coaxial cable, leaky feeder or optical fiber link."
    },
    {
        "SrNo": "584",
        "english": "Diversity",
        "english_description": "A technique to reduce the effects of fading by using multiple spatially separated antennas to take independent samples of the same signal at the same time. The theory is that the fading in these signals is uncorrelated and that the probability of all samples being below a threshold at a given instant is low."
    },
    {
        "SrNo": "585",
        "english": "Diversity reception",
        "english_description": "A reception method in which one resultant signal is obtained from several received radio signals which convey the same information but for which the radio path or the transmission channel differs by at least one characteristic such as frequency, polarization, or the position or orientation of antennas.",
        "description": "Note 1 – The quality of the resultant signal can be higher than that of the individual signals, due to the partial decorrelation of propagation conditions over the different radio paths or transmission channels. Note 2 – The term “time diversity” is sometimes used to refer to the repetition of a signal or part of a signal over a single radio path or transmission channel."
    },
    {
        "SrNo": "586",
        "english": "Document",
        "mongolian": "Бичиг баримт",
        "mongolian_description": "Програм ашиглан Ворд болон HTML хуудас дээр бичигдсэн текст"
    },
    {
        "SrNo": "587",
        "english": "Documentation",
        "mongolian": "Баримт бичиг",
        "mongolian_description": "Системийг ажиллуулах мэдээлэл. Хэрэглэгчид рүү чигэлсэн, програмыг хэрэглэхэд амархан болгоход  бэлтгэгдсэн заавар"
    },
    {
        "SrNo": "588",
        "english": "Domain",
        "mongolian": "Домайн(салбар. эзэмшил)",
        "mongolian_description": "Домайн нь интернэт хаягийн дэд олонлог юм. Домайн нь шаталсан хэлбэртэй, доод  болон дээд түвшиний гэж ангилдаг. Жишээ нь : .com, .org, .uk"
    },
    {
        "SrNo": "589",
        "english": "Domain name",
        "mongolian": "Домайн нэр",
        "mongolian_description": "Интернет дэх нөөцийн тодорхой хэсэг.эсвэл талбай нэр.  Байршил бүр өөрийн гэсэн өвөрмөц  домайн нэртэй.  Жишээ нь: bbc.co.uk хаягийг BBC эзэмшдэг."
    },
    {
        "SrNo": "590",
        "english": "Domain name system (DNS)",
        "mongolian_description": "Домайн нэршилийн систем домайн нэршилийг ямар зохион байгуулалттайг тодорхойлдог. Домайн нэр нь компани  гэрээ хийж бүртгүүлж авдаг."
    },
    {
        "SrNo": "591",
        "english": "Dongle",
        "mongolian": "Хамгаалах түлхүүр",
        "mongolian_description": "Програмыг хулгайлах магадлалыг багасгах төхөөрөмж. Ихэвчлэн компьютерийн стандарт оролтонд ордог."
    },
    {
        "SrNo": "592",
        "english": "Doppler Shift",
        "english_description": "The magnitude of the change in the observed frequency of a wave due to the relative velocity of a transmitter with respect to a receiver."
    },
    {
        "SrNo": "593",
        "english": "DOS prompt ",
        "mongolian": "Диск үйлдлийн системийн промт-(сануулга)",
        "mongolian_description": "MS-DOS ашигладаг үйлдлийн систем"
    },
    {
        "SrNo": "594",
        "english": "Disk operating system",
        "mongolian": "Диск үйлдлийн систем",
        "abbreviation": "DOS",
        "mongolian_description": "Үйлдлийн систем жижиг хэсэг. Дискэн дээр хадгалагдсан програм болон файлуудад хандаж зохион байгуулах үйлдлийн системийн хэсэг."
    },
    {
        "SrNo": "595",
        "english": "Dots per inch ",
        "mongolian": "Инч дэх цэгүүд",
        "abbreviation": "DPI",
        "mongolian_description": "Принтерийн нягтаршил нь DPI-аар хэмжигддэг. Цэг нт жижигхэн байх тусам ойрхон болж, зураг илүү тод болно."
    },
    {
        "SrNo": "596",
        "english": "Double click",
        "mongolian": "click-давхар товших ",
        "mongolian_description": "Хулгана дээр хурдан 2 товших.  Ямэр нэгэн зүйлийг сонгож нээдэг. "
    },
    {
        "SrNo": "597",
        "english": "Double sideband",
        "mongolian": "2 хажуугийн зурвас",
        "mongolian_description": "Агуургийн модуляцын дээд, доод хажуугийн зурвасд хадгалагдан үлдсэн байдаг нь дамжуулалт зөөгчтэй холбоотой."
    },
    {
        "SrNo": "598",
        "english": "Double sideband",
        "abbreviation": "DSB",
        "english_description": "Pertaining to a transmission or emissions where both the lower and upper sidebands resulting from amplitude modulation are preserved."
    },
    {
        "SrNo": "599",
        "english": "Double Spacing ",
        "mongolian": "Мөр хоорондын давхар зай",
        "mongolian_description": "Текст бүрийн мөр хоорондох давхар зай."
    },
    {
        "SrNo": "600",
        "english": "Down Time ",
        "mongolian": "Сул зогсолт(ашиглагдаагүй хугацаа)",
        "mongolian_description": "Компьютерийн систем хэрэглэгчид ашиглах боломжгүй болох  хугацаа. Энэ нь компьютер хадгалж байгаа эсвэл эвдэрсэн эсвэл үйлдлийн системийн алдаа болон холболтын алдаа гарсан тохиолдлууд юм."
    },
    {
        "SrNo": "601",
        "english": "Downlink",
        "abbreviation": "DL",
        "english_description": "See downlink."
    },
    {
        "SrNo": "602",
        "english": "Downlink",
        "english_description": "The transmission path from the base station down to the mobile station."
    },
    {
        "SrNo": "603",
        "english": "Down-link",
        "mongolian": "Буцах  шугам",
        "mongolian_description": "Дамжуулагч сансрын станц болон хүлээн авагч дэлхийн станцын хоорондох радио холбоос."
    },
    {
        "SrNo": "604",
        "english": "Down-link",
        "english_description": "A radio link between a transmitting space station and a receiving earth station.",
        "description": "Note 1 – The term is also used in terrestrial communications for a link between a transmitting base station and a receiving mobile station. Note 2 – The symbol ↓ is used as a subscript for letter symbols representing quantities associated with a down-link."
    },
    {
        "SrNo": "605",
        "english": "Download",
        "mongolian_description": "Нэгээс нөгөө компьютерт файл дамжуулах. Ерөнхийдөө үйлдлийг эхлүүлсэн хэрэглэгч файлыг хүлээж авах юм. Хэрэв хэрэглэгч ямар нэгэн юмыг илгээж байвал энэ нь upload болно."
    },
    {
        "SrNo": "606",
        "english": "Draft",
        "mongolian_description": "Draft mode-оор хэвлэх нь чанар муутай гардаг ч хурдан бас бага хор хэрэглэдэг.Бэлэн болоогүй загварыг хэвлэхэд тохиромжтой."
    },
    {
        "SrNo": "607",
        "english": "Draft",
        "mongolian_description": "Бичиг баримтын бэлэн болоогүй загвар "
    },
    {
        "SrNo": "608",
        "english": "Drag and drop",
        "mongolian_description": "Файлыг нэгээс нөгөө байрлал руу зөөх үйл явц буюу нарийвчилбал текст, зураг гэх мэт.  Зөөх файл дээрээ хулганы товчоо удаан дараад зөөх газраа аваачаад хулганыхаа товчийг тавина. "
    },
    {
        "SrNo": "609",
        "english": "Drop down menu",
        "mongolian_description": "Харагдахуйц меню, гэхдээ зөвхөн сонгосон үед л гарч ирнэ."
    },
    {
        "SrNo": "610",
        "english": "Drop shadow",
        "mongolian_description": "Объектэд тусгай график эффект оруулж 3-н хэмжээст мэт харагдах "
    },
    {
        "SrNo": "611",
        "english": "Drum ",
        "mongolian": "Хурд",
        "mongolian_description": "Лазер принтерийн хорыг цаасан дээр буулгах "
    },
    {
        "SrNo": "612",
        "english": "Dual band",
        "english_description": "A term describing mobile phones that work on networks operating on different frequency bands. This is useful for mobile phone users who move between areas covered by different networks. For example GSM 900, GSM 1800. such as the 800 MHz digital band and the 1900 MHz digital PCS band."
    },
    {
        "SrNo": "613",
        "english": "Dual mode",
        "english_description": "An industry term referring to a wireless device that can operate on either an analog or digital transmission network. However, multiple digital transmission systems exist, so dual-mode phone users must ensure that their dual-mode phone will operate on the digital transmission system used by their selected service provider."
    },
    {
        "SrNo": "614",
        "english": "Dubbing ",
        "mongolian_description": "Бичигдсэн бичлэг, дуу болон кинонд дуу оруулах жишээлбэл (яриа болон дуу) "
    },
    {
        "SrNo": "615",
        "english": "Ducting",
        "mongolian": "Сувагчлал",
        "mongolian_description": "Радио сувгийн агаар мандал нь дотроо радио долгион туйлшралын удардлагтай."
    },
    {
        "SrNo": "616",
        "english": "Ducting",
        "english_description": "Guided propagation of radio waves inside a tropospheric radio-duct."
    },
    {
        "SrNo": "617",
        "english": "Dummy text",
        "mongolian": "Дууриамал текст",
        "mongolian_description": "Утгагүй текст нь вэб хуудсын загварын турш placeholder-г хэрэглэдэг. Текст оруулахын өмнө зохион байгуулалт ерөнхий төрхийг шалгадаг."
    },
    {
        "SrNo": "618",
        "english": "Dummy variable",
        "mongolian": "Дууриамал хувьсагч",
        "mongolian_description": "Хувьсагч нь програм дотроос гарч ирдэг гэвч аль нь ч хэрэглэгддэггүй. Програмчлалын хэл нь өгүүлбэр зүйн хувьсагч шаарддаг боловч бичигдэх мэдээлэл нь хэрэгтэй биш."
    },
    {
        "SrNo": "619",
        "english": "Duplex",
        "mongolian": "2 чиглэлийн ",
        "mongolian_description": "Өгөгдөл дамжуулах чиглэлийг илгээх. Магадгүй ижил цагт 1 зүгт 2 чиглэлтэй эсвэл бүтэн чиглэлтэй уулзах, цагт ганцхан 1 зүгт уулзах, хагас 2 чиглэлд  эсвэл ганцхан 1 зүгт  1 чиглэлд уулзах."
    },
    {
        "SrNo": "620",
        "english": "Duplex/full duplex",
        "english_description": "Simultaneous two-way transmission, such as experienced in a phone conversation. In contrast, many speakerphones are half-duplex and will transmit in only one direction phone conversation. In contrast, many speakerphones are half-duplex and will transmit in only one direction - from the loudest noise - at a time."
    },
    {
        "SrNo": "621",
        "english": "Dynamic Channel Allocation",
        "abbreviation": "DCA",
        "english_description": "An automatic process for assigning traffic channels in a frequency reuse wireless system. The base station continuously monitors the interference in all idle channels and makes an assignment using an algorithm that determines the channel that will produce the least amount of additional interference."
    },
    {
        "SrNo": "622",
        "english": "Dynamic memory",
        "mongolian": "Динамик Санах Ой",
        "mongolian_description": "Санах ойны цахилгаан унтрах үед түүний агуулга алдагддаг. Жш нь: санах ойд санамсаргүй хандах."
    },
    {
        "SrNo": "623",
        "english": "Dynamic variable",
        "mongolian": "Динамик хувьсагч",
        "mongolian_description": "Динамик хувьсагч нь өөр өөр газар эзэмшиж байгаа өгөгдлийг олохын тулд заагчийг ашигладаг. Програмын хэмжээг хянаад өгөгдлийг хадгалдаг./Статик хувьсагч ялгаатай."
    },
    {
        "SrNo": "624",
        "english": "Earth station",
        "english_description": "A station located either on the Earth’s surface or within the major portion of the Earth’s atmosphere and intended for communication:",
        "description": "– with one or more space stations; or – with one or more stations of the same kind by means of one or more reflecting satellites or other objects in space."
    },
    {
        "SrNo": "625",
        "english": "Earth station ",
        "mongolian": "Газрын станц",
        "mongolian_description": "Энэхүү станц нь дэлхийн гадарга дээр болон дэлхийн агаар мандлын үндсэн хэсгийн аль нэгд байрладаг, харилцаа холбоонд зориулагдсан:  - Нэг эсвэл хэд хэдэн газрын станцууд   - Нэг буюу хэд хэдэн орон зайд хиймэл дагуул болон бусад обьектуудыг тусгах  ижил төрлийн  хэд хэдэн станц байна."
    },
    {
        "SrNo": "626",
        "english": "E-commerce",
        "mongolian": "Цахим худалдаа ",
        "mongolian_description": "Ийм жижиглэнгийн борлуулалт, хэвлэн нийтлэх зэрэг арилжааны ажиллуудад      интернэт                  ашигладаг."
    },
    {
        "SrNo": "627",
        "english": "Economic Area",
        "abbreviation": "EA",
        "english_description": "A geographic area over which a WCS operator is licensed to provide service. EAs are a group of counties in metropolitan areas having common financial, commercial and economic ties and were first used to license WCS service in the late '90s. EAs are about the size of a cellular MSA and cross state lines in some instances. EAs are used by the FCC to define areas of economic interest and are grouped into larger areas called REAGs."
    },
    {
        "SrNo": "628",
        "english": "Edit",
        "mongolian": "Засварлах",
        "mongolian_description": "Файлыг засварлах, өөрчлөх, шинэчлэх, түүний агуулгыг үстгах үйлдэл."
    },
    {
        "SrNo": "629",
        "english": "Edit",
        "mongolian": "Засварлах",
        "mongolian_description": "Мультимедиа, кино болон бусад Мультимедиа файл видео болон киног өөрчилдөг."
    },
    {
        "SrNo": "630",
        "english": "Editing",
        "mongolian_description": "Файлын процессыг өөрчлөн засварлах, түүний агуулгыг үстгах"
    },
    {
        "SrNo": "631",
        "english": "Effect ",
        "mongolian": "Нөлөө",
        "mongolian_description": "График хэрэглэж болох онцгой нөлөө эргүүлж,тойруулж,буурдаг."
    },
    {
        "SrNo": "632",
        "english": "Effective Isotropic Radiated Power",
        "abbreviation": "EIRP",
        "english_description": "A measure of the power in the main beam of an antenna relative to an isotropic radiator."
    },
    {
        "SrNo": "633",
        "english": "Effective monopole radiated",
        "mongolian": "Хүчтэй  цацаргах чадал",
        "mongolian_description": "Антенн тухайн чиглэлд богино босоо антенн өөрийн гүйдэл харьцуулахад нийлүүлэх эрчим хүчний бүтээгдэхүүн."
    },
    {
        "SrNo": "634",
        "english": "Effective monopole radiated power",
        "abbreviation": "e.m.r.p",
        "english_description": "The product of the power supplied to the antenna and its gain relative to a short vertical antenna in a given direction.",
        "description": "Note – The reference antenna, when fed with a power of 1 kW, is considered to radiate an e.m.r.p. of 1 kW in any direction in the perfectly conducting plane and produces a field strength of 300 mV/m at 1 km distance (equivalent to a c.m.f. of 300 V)."
    },
    {
        "SrNo": "635",
        "english": "Effective radiated power",
        "abbreviation": "e.r.p",
        "english_description": "The product of the power supplied to the antenna and its gain relative to a half-wave dipole in a given direction.",
        "description": "Note – The reference antenna, when fed with a power of 1 kW, is considered to radiate an e.r.p. of 1 kW in any direction in the equatorial plane and produces a field strength of 222 mV/m at 1 km distance."
    },
    {
        "SrNo": "636",
        "english": "EIA Interim Standard 136 - NADC with Digital Control Channels",
        "abbreviation": "IS-136",
        "english_description": "The North American digital mobile telephony standard based on TDMA technology. It is the version of the TDMA specification resulting in a fully digital 2nd generation system and is backward compatible with analog AMPS. See also TDMA and D-AMPS."
    },
    {
        "SrNo": "637",
        "english": "EIA Interim Standard 2000 (see cdma2000)",
        "abbreviation": "IS-2000",
        "english_description": "A standard for current CDMA systems providing a migration path to 3G services."
    },
    {
        "SrNo": "638",
        "english": "EIA Interim Standard 95 (see cdmaOne)",
        "abbreviation": "IS-95",
        "english_description": "The original digital mobile telephony standard based on CDMA technology. See also CDMA."
    },
    {
        "SrNo": "639",
        "english": "EIA Interim Standard for U.S. Digital Cellular",
        "abbreviation": "IS-54",
        "english_description": "Original TDMA digital standard. Implemented in 1992. This standard was the first to permit the use digital channels in AMPS systems. It used digital traffic channels but retained the use of analog control channels. This standard was replaced by the IS-136 digital standard in 1996."
    },
    {
        "SrNo": "640",
        "english": "Eject",
        "mongolian": "Гаргах",
        "mongolian_description": "Шилжүүлэх(Зөөх) Жишээлбэл: Төхөөрөмжөөс дискийг гарга"
    },
    {
        "SrNo": "641",
        "english": "E-learning",
        "mongolian": "Цахим сургалт",
        "mongolian_description": "Цахим сургалт нь ICT-г хэрэглэх чөлөөтэй суралцахад дэмждэг. Онлайн болон алсын суралцах танхимыг үйл ажнллагааг сайжруулах нь хялбар програмууд, и-сургалт бүрдүүлж үйл ажнллагааг өргөн хүрээтэй байдаг."
    },
    {
        "SrNo": "642",
        "english": "Electronic data interchange (EDI) ",
        "mongolian": "Өгөгдлийн электрон солилцох",
        "mongolian_description": "Компьютер систем уламжлалт үйл ажилгааны хооронд электрон системээр бизнес мэдээллийг солилцох(дамжуулах)ажиллагаа."
    },
    {
        "SrNo": "643",
        "english": "Electronic Industry Association",
        "abbreviation": "EIA",
        "english_description": "A trade association and standards setting organization in the USA."
    },
    {
        "SrNo": "644",
        "english": "Electronic mail ",
        "mongolian": "Цахилгаан шуудан ",
        "mongolian_description": "И-мэйл E-mail -тэй төстэй. Хэн нэгэн өөр нэгэн рүү тохирсон тоног төхөөрөмж болон E-mail хаягаар компьютер болон бусад төхөөрөмж рүү мессеж илгээх арга."
    },
    {
        "SrNo": "645",
        "english": "Electronic media ",
        "mongolian": "Цахилгаан хэвлэл мэдээллийн хэрэгсэл",
        "mongolian_description": "Тоон мэдээлэлд суурилсан харилцаа(холбоо) хэвлэх мэдээллийн хэрэгсэл.  Жишээлбэл: Нилээд их цаас хэвлэх, интэрнет, видео гэх мэт "
    },
    {
        "SrNo": "646",
        "english": "Electronic point-to-sale terminal ",
        "mongolian": "Цахим цэгийн борлуулалтын терминал",
        "mongolian_description": "Цахим цэгийн борлуулалтын терминал супермаркетын кассанд онцгой терминал хэрэглэдэг. Цахим цэгийн борлуулалтын терминал худалдан авагчид үйлдвэрлэх сүлжээнд мэдээллийн сангаас зардлыг авч нэгтгэсэн цахим хөрөнгийн шилжүүлэх, түүнчлэн бар код сканерт орж болно. Чиг үүрэг нь янз бүр байдаг."
    },
    {
        "SrNo": "647",
        "english": "Electronic Serial Number",
        "abbreviation": "ESN",
        "english_description": "A unique electronic identifier given to a mobile terminal. This number is used in verifying the identity of the mobile terminal."
    },
    {
        "SrNo": "648",
        "english": "Electronic whiteboard",
        "mongolian": "Цахим самбар",
        "mongolian_description": "Цахим самбарт холбож, зөвхөн компьютерийн дэлгэц агуулгыг харуулдаг, бас    хялбарчлахын тулд аль нэг тусгай үзэг хэрэглэж засварлаж самбарт агуулгыг    хөнгөвчлөхийн тулд хэрэглэгч хуруугаараа дэлгэцэнд хүрснээр холбогддог."
    },
    {
        "SrNo": "649",
        "english": "Element",
        "mongolian": "Элемент",
        "mongolian_description": "Дан өгөгдлийн хүснэгтэн мэдээлэл"
    },
    {
        "SrNo": "650",
        "english": "Elliptical polarization",
        "mongolian": "Богино туйлширал",
        "mongolian_description": "Огтойргуйн орон зайд радио долгионы цахилгаан орны хүчлэгийн вектор хэрхэн байрлсанаар радио долгионы туйлширал тодорхойлогдох бөгөөд  векторбайрлал нь туйлширлын чиглэлийг тодорхойлно."
    },
    {
        "SrNo": "651",
        "english": "Elliptical polarization",
        "english_description": "To be defined later."
    },
    {
        "SrNo": "652",
        "english": "Email ",
        "mongolian": "Захиа",
        "mongolian_description": "Хэн нэгэн өөр нэгэн рүү тохирсон тоног төхөөрөмж болон E-mail хаягаар компьютер болон бусад төхөөрөмж рүү мессеж илгээх арга."
    },
    {
        "SrNo": "653",
        "english": "Email account ",
        "mongolian": "Тайлбар",
        "mongolian_description": " Хүнд Email хэрэгтэй. Email тайлбар үүсэхийг интернэт үйлчилгээг   Буюу зохион байгуулагч компанид хүсэлт илгээнэ. Тухайн             тайлбарыг Email нөөцөд байрлуулах ба мэдээллийн системд орох хандах нэвтрэхийг хангаж өгдөг."
    },
    {
        "SrNo": "654",
        "english": "Email notification ",
        "mongolian": "И-мэйл мэдэгдэл",
        "mongolian_description": "Тухайн mail-н онцгой үйл явдлыг мэдэгдэх мэдээллийг бий болгох, самбар дээр эмхтгэн шинээр постлоно."
    },
    {
        "SrNo": "655",
        "english": "Email redirection",
        "mongolian": "Өөр хаягаас буцаж илгээх",
        "mongolian_description": "Нэг хаягаас илгээгээд өөр хаяг руу дамжуулдаг."
    },
    {
        "SrNo": "656",
        "english": "Embed",
        "mongolian": "Суулгах",
        "mongolian_description": "HTML суулгахад тэмдэгтүүд нь <EMBED></EMBED> байрлуулсан эсвэл HTML баримт багтаагаад “EMBEDED” объект нь янз бүрийн боломж олгодог. Жишээлбэл: Кино суулгах байдлаар хаягуудыг ашиглах, вэб хуудас байрлуулж болно. "
    },
    {
        "SrNo": "657",
        "english": "Emergency position-indicating radiobeacon station",
        "english_description": "A station in the mobile service the emissions of which are intended to facilitate search and rescue operations.",
        "description": "Note – The extension of this definition in the case of stations the emissions of which are intended to be relayed by satellite, needs further study."
    },
    {
        "SrNo": "658",
        "english": "Emission",
        "english_description": "1. Radio-frequency radiation in the case where the source is a radio transmitter.  2. Radio waves or signals produced by a radio transmitting station. ",
        "description": "Note 1 – For example, the energy from the local oscillator of a radio receiver if transferred to external space, is a radiation and not an emission. Note 2 – In radiocommunication, the French term “émission” applies only to intentional radiation."
    },
    {
        "SrNo": "659",
        "english": "Emoticon ",
        "mongolian": "Эмотикон",
        "mongolian_description": "Энгийн дүрс, ихэвчлэн тэмдэгтүүд нь хэд хэдэн нэгдэж бий болсон, мөн и-майл, мэссеж төрсөн сэтгэгдэл илэрхийлж байдаг. Эдгээр дүрсийг олон мэддэг."
    },
    {
        "SrNo": "660",
        "english": "Enable",
        "mongolian": "Зөвшөөрөх",
        "mongolian_description": "Ямар нэг ажил эхлэхийг зөвшөөрсөн дохио "
    },
    {
        "SrNo": "661",
        "english": "Encode",
        "mongolian": "Кодлох(Дугаарлах)",
        "mongolian_description": "Нууцлалтай адилхан. Өөрөөр хэлбэл: анхны нууц түлхүүргүйгээр(өгөгдөл                                тайлагдахгүйгээр) тухайн өгөгдөл  уншигдахгүй нууцлагдах буюу код тайлахыг хэлнэ."
    },
    {
        "SrNo": "662",
        "english": "Encrypion ",
        "mongolian": "Шифрлэлт",
        "mongolian_description": "Мэдээлэлийг алгоритм (шифр) ашиглан түлхүүр гэгдэх тусгай мэдлэг ашиглахгүй бол уншигдах аргагүй болгох процесс. Уг процессийн дүнд шифрлэсэн мэдээлэл үүснэ. Шифрлэлтийг тусгай нууц мэдээллийг хадгалах, дамжуулахад ашигладаг. Шифрлэх ажилгааны гэдрэг процесс буюу шифрлэсэн мэдээлийг буцааж уншигдахуйц болгодог ажиллагааг шифр тайлалт (decryption) гэдэг."
    },
    {
        "SrNo": "663",
        "english": "Encryption",
        "english_description": "A cryptographic technique utilizing a digital key to scramble and hence \"lock\" data in such a manner that it cannot be descrambled and decoded without the key."
    },
    {
        "SrNo": "664",
        "english": "Encryption key ",
        "mongolian": "Нууцлалтын түлхүүр ",
        "mongolian_description": "Нууцлалтын түлхүүр нь нууцлалтын үйл явцыг удирдахад хэрэглэгчээр сонгогдож байгаа үг эсвэл код юм."
    },
    {
        "SrNo": "665",
        "english": "End of file character ",
        "mongolian": "EOF тэмдэгт",
        "abbreviation": "EOF",
        "mongolian_description": "Тэмдэгт нь удирдлагын програмд файлийн төгсгөл гэх дохио хамгийн сүүлд бичэгдсэний дараа шууд файл руу үйлдлийн системээр бичддэг. Програмист нь файл дахь өгөгдлүүдийг боловсруулахад үүнийг ашигладаг ба боловсруулалт нь EOF тэмдэгт олдох хүртэл бичэгддэг. "
    },
    {
        "SrNo": "666",
        "english": "End tag ",
        "mongolian_description": "HTML – д веб хуудасанд хэрхэн форматлагдсаныг тодорхойлох кодын нэг хэсгийг tag  гэж нэрлэнэ. Tag нь хаалтан дотор байрладаг. Жишээ нь Нээх үед <> энэ тэмдэглэгээ, хаах үед </> тэмдэглэгээг ашиглана."
    },
    {
        "SrNo": "667",
        "english": "Enhanced Data for Global Evolution",
        "abbreviation": "EDGE",
        "english_description": "A technology that gives GSMA and TDMA similar capacity to handle services for the third generation of mobile telephony. EDGE was developed to enable the transmission of large amounts of data at a high speed, 384 kilobits per second. (It increases available time slots and data rates over existing wireless networks.)"
    },
    {
        "SrNo": "668",
        "english": "Enhanced Full Rate",
        "abbreviation": "EFR",
        "english_description": "The second generation full rate speech codec used in GSM systems. This codec replaced the original RPE-LTP codec used in GSM systems. This codec employs ACELP technology."
    },
    {
        "SrNo": "669",
        "english": "Enhanced Specialized Mobile Radio",
        "abbreviation": "ESMR",
        "english_description": "The application of second generation wireless technology to the Specialized Mobile Radio Services."
    },
    {
        "SrNo": "670",
        "english": "Enhanced TDMA",
        "abbreviation": "E-TDMA",
        "english_description": "A TDMA technique using Digital Speech Interpolation (DSI) and half rate coding to allow six calls to be carried in three time slots. The system does this by taking advantage of the 40% speech activity factor."
    },
    {
        "SrNo": "671",
        "english": "Enter",
        "mongolian": "Орох",
        "mongolian_description": "Компьютер команд явуулахад ашигладаг эсвэл word дээр догол мөр болон сонголт хийхэд ашиглана."
    },
    {
        "SrNo": "672",
        "english": "Enter ",
        "mongolian": "Тэмдэглэх",
        "mongolian_description": "Гараас өгөгдөл дамжуулахад ашиглана"
    },
    {
        "SrNo": "673",
        "english": "Entity ",
        "mongolian": "Бүтэц нэгж, бодит юм",
        "mongolian_description": "Өгөгдлийн санд өгөгдлийн сангийн хадгалж байгаа объектын нэрийг нэгж гэнэ. Жишээ нь: Үл хөдлөх хөрөнгө зуучлалын өгөгдлийн сангийн хувьд нэгж нь байшин, худалдан авагч байж болно."
    },
    {
        "SrNo": "674",
        "english": "Entity Relationship Diagram ",
        "mongolian": "Хамааралын диаграм",
        "mongolian_description": "Өгөгдлийн сан дахь хэд хэдэн нэгж хоорондын холбоог илэрхийлэх диаграм."
    },
    {
        "SrNo": "675",
        "english": "Environment variable ",
        "mongolian": "Орчны хувьсагч",
        "mongolian_description": "Хувьсагч нь компьютерийн үйл ажилгааны орчинг тодорхойлно. Энгийн орчины хувьсагч нь үндсэн директор, файлын зам хайх команд, одоогийн байгаа цагийн бүс зэргийг тодорхойлно."
    },
    {
        "SrNo": "676",
        "english": "Equalization",
        "english_description": "Measures taken to reduce the distortion effects in a radio channel."
    },
    {
        "SrNo": "677",
        "english": "Equipment Identity Registe",
        "abbreviation": "EIR",
        "english_description": "A database used by GSM and other second generation wireless systems used to identify the customer devices permitted to access the network. A device is usually placed in the EIR once its operation has been certified for the infrastructure in a laboratory or validation facility."
    },
    {
        "SrNo": "678",
        "english": "Equivalent (spot) noise temperature",
        "english_description": "The amount by which at a given frequency the noise temperature of a one-port electrical network connected to the input of a given linear two-port electrical network would have to be increased, if the noise due to this two-port network was temporarily suppressed, in order to cause the noise power spectral density at the output frequency corresponding to input frequency, to be the same as that of the total noise of the one-port and two-port networks.",
        "description": "Note 1 – This definition assumes that quantum phenomena are negligible. Note 2 – The equivalent spot noise temperature of a two-port network is dependent on the impedance of the one-port network connected to input."
    },
    {
        "SrNo": "679",
        "english": "Equivalent isotropically radiated power",
        "mongolian_description": "Антеннболон isotropic антенн (абсолютбуюу isotropic гүйдэл) харьцуулахад тухайн чиглэлд антенн нийлүүлсэн эрчим хүчний бүтээгдэхүүн."
    },
    {
        "SrNo": "680",
        "english": "Equivalent isotropically radiated power",
        "abbreviation": "e.i.r.p.",
        "english_description": "The product of the power supplied to the antenna and the antenna gain in a given direction relative to an isotropic antenna (absolute or isotropic gain).",
        "description": "Note – The isotropic antenna, when fed with a power of 1 kW, is considered to provide an e.i.r.p. of 1 kW in all directions and to produce a field strength of 173 mV/m at 1 km distance."
    },
    {
        "SrNo": "681",
        "english": "Equivalent power flux-density",
        "english_description": "Sum of the power flux-densities produced at a point on the Earth’s surface by all space stations within a non-geostationary-satellite system, taking into account the off-axis discrimination of a reference receiving antenna assumed to be pointing towards the geostationary-satellite orbit."
    },
    {
        "SrNo": "682",
        "english": "Ergonomic",
        "mongolian": "Эргономи",
        "mongolian_description": "Ажилын орчины судалгаа эргономи оффисын сандал ашиглахад тохиромжтой байдаг суухад эвтэйхэн эрүүл мэндэд ээлтэй байвал түүнийг хэлнэ"
    },
    {
        "SrNo": "683",
        "english": "Ergonomic Keyboard ",
        "mongolian": "Эргономи гар",
        "mongolian_description": "Олон дахин давтагдсан ачаалалаас болж үүсэх гэмтэлийн (RSI) эрсдэлийг бууруулахад зориулсан тусгайлан загварчилсан гар. "
    },
    {
        "SrNo": "684",
        "english": "Error ",
        "mongolian": "Алдаа",
        "mongolian_description": "Компютер юм уу хэрэглэгчийн гаргасан буруу үр дүн. Жишээ нь: програмд алдаа эсвэл буруу өгөгдөл оруулснаас болно."
    },
    {
        "SrNo": "685",
        "english": "Error correction",
        "english_description": "The process of correcting errors in data transmitted over a radio channel using forward error correction (FEC) techniques."
    },
    {
        "SrNo": "686",
        "english": "Error distribution",
        "english_description": "A description of how errors in a communications channel are distributed. Typical distributions are Gaussian (random) and Raleigh (bursty)."
    },
    {
        "SrNo": "687",
        "english": "Error message ",
        "mongolian": "Алдаа зурвас",
        "mongolian_description": "Ихэвчлэн алдаа нь шалтгааныг тайлбарлахдаа дэлгэцэн дээр гарч ирдэг. "
    },
    {
        "SrNo": "688",
        "english": "Error probability",
        "english_description": "A computation of the likelihood of an error involving the Probability Density Function (PDF)."
    },
    {
        "SrNo": "689",
        "english": "Error Trap ",
        "mongolian": "Алдаа",
        "mongolian_description": "Программ ажиллаж байх үед гарч буй алдааг шийддэг полграмын техник."
    },
    {
        "SrNo": "690",
        "english": "Error vector",
        "english_description": "The error vector is the vector difference between a reference signal and a measured signal and is a complex quantity containing a magnitude and phase component."
    },
    {
        "SrNo": "691",
        "english": "Error Vector Magnitude",
        "abbreviation": "EVM",
        "english_description": "EVM is a modulation quality metric widely used in digital RF communications systems. It is the root-mean-square (rms) value of the error vector over time at the instants of symbol clock transitions. Used properly, EVM and related measurements can pinpoint exactly the type of degradations present in a signal and can even help identify their sources"
    },
    {
        "SrNo": "692",
        "english": "Esc key ",
        "mongolian": "Esc (Escape) товч",
        "mongolian_description": "Үйл ажиллагааг цуцлахад ашиглаж байгаа тусгай түлхүүр. Энэ нь программ хангамжаас хамаардаг."
    },
    {
        "SrNo": "693",
        "english": "Escape ",
        "mongolian": "Алдагдах",
        "mongolian_description": "Escape түлхүүр нь програмаас хамааралттай янз бүрийн эффект байна. Энэ нь ихэнхдээ үйлдэлийг цуцлахад ашиглагддаг."
    },
    {
        "SrNo": "694",
        "english": "Ethernet ",
        "mongolian": "Этернэт",
        "mongolian_description": "Этернэт нь дотоод сүлжээнд ашиглагддаг. Компьютерийн өөр өөр системд нэг зэрэг хэрэглэж болно. Дамжуулалын хурд нь 100мб ."
    },
    {
        "SrNo": "695",
        "english": "European Radio Message System",
        "abbreviation": "ERMES",
        "english_description": "A pan-European wide area paging network working in Europe, the Middle East and Asia."
    },
    {
        "SrNo": "696",
        "english": "European Telecommunications Standard Institute",
        "abbreviation": "ETSI",
        "english_description": "The European standardization body for telecommunications."
    },
    {
        "SrNo": "697",
        "english": "Evaluate ",
        "mongolian": "Дүгнэх",
        "mongolian_description": "Хувьсагчийн утга нь мэдэгдэж байгаа үед илэрхийлэлийн утагыг тооцоолох."
    },
    {
        "SrNo": "698",
        "english": "Event ",
        "mongolian": "Үйл явдал",
        "mongolian_description": "Үйлдлийн систем програм руу бичигдэж байгаа гадаад өөрчлөлт. Жишээ нь товчлуур  дарах мөн хулган дарах."
    },
    {
        "SrNo": "699",
        "english": "Executable File ",
        "mongolian": "Гүйцэтгэх файл",
        "mongolian_description": "Програм нь бүрэн ажиллаж дууссан гэдгийг харуулах хоёртын файл. Энэ нь компьютерийн ажилгаа болон гүйцэтгэл харуулах програм юм."
    },
    {
        "SrNo": "700",
        "english": "Execute",
        "mongolian": "Гүйцэтгэх",
        "mongolian_description": "Програмын гүйцэтгэлийг ажиллуулах явдал юм."
    },
    {
        "SrNo": "701",
        "english": "Exit ",
        "mongolian": "Гарах",
        "mongolian_description": "Дуудаж байгаа програмруу команд биелүүлж дуусахад салбар файйл хаагадахыг хэлнэ. Олон буцах заавартай байж болно."
    },
    {
        "SrNo": "702",
        "english": "Exocentric angle",
        "english_description": "The angle formed by imaginary straight lines that join any two points with a specific point in space."
    },
    {
        "SrNo": "703",
        "english": "Expansion card ",
        "mongolian": "Өрөгтгөл карт",
        "mongolian_description": "Интерфасе боард процессорийн хүчин чадал бага үед нэмэлт слотод тохирч байхыг хэлнэ."
    },
    {
        "SrNo": "704",
        "english": "Expansion slot ",
        "mongolian": "Өрөгтгөл слот",
        "mongolian_description": "Нэмэлт зүйл суулгах боломж олгодог. Жишээ нь: сүлжээний нэмэлт драйвер олон слот байвал компьютер олон зүйл нэмэх боломжтой."
    },
    {
        "SrNo": "705",
        "english": "Export",
        "mongolian": "Экспорт, оруулах",
        "mongolian_description": "Програс хангамжийн нэг хэсэгийг ашиглан өгөгдөлийн файл үүссэнээр програм хангамжийн өөр бусад хэсэгээр уншиж болохийг экспорт гэж нэхлэнэ. Импорт нь өөр програм хангамжаар үүсгэгдсэн файлыг зөвшөөрөхөд өшиглах үйл явц юм. "
    },
    {
        "SrNo": "706",
        "english": "Extended Total Access Communications System",
        "abbreviation": "ETACS",
        "english_description": "The analog mobile phone network developed in the UK and available in Europe and Asia."
    },
    {
        "SrNo": "707",
        "english": "Extensible Hypertext Markup language ",
        "mongolian": "Гипертекст тэмдэглэгээний хэл",
        "abbreviation": "XHTML ",
        "mongolian_description": "HTML- н дараагийн үе XHTML болон XML – ийг багтаасныг хэлнэ."
    },
    {
        "SrNo": "708",
        "english": "Extensible Markup Language",
        "abbreviation": "XML",
        "english_description": "XML is a format for structured documents and data. It was developed by the World Wide Web Consortium (W3C). It is a meta-language, i.e. content is not directly encoded in XML but in a specific markup language defined using XML. It corresponds to the successor language for the current HTML. In contrast to HTML where tags are predefined, the XML user can freely extend a data format applying his or her own uniquely defined tags. Since the tag structure in the case of XML enables the computer to automatically analyze data content, building EC (electronic commerce) and EDI (electronic data interchange) systems is facilitated."
    },
    {
        "SrNo": "709",
        "english": "Extensible Markup Language ",
        "abbreviation": "XML",
        "mongolian_description": "Програм зохиож буй хэлний стандарт бүтэцийг тодорхойлно. Цахим хуудас ашигладаг хүмүүс XML – г хэрэглэдэг."
    },
    {
        "SrNo": "710",
        "english": "Extract ",
        "mongolian": "Шахан гаргах",
        "mongolian_description": "Шахсан файлыг задалахыг хэлэнэ."
    },
    {
        "SrNo": "711",
        "english": "Extranet",
        "english_description": "The extension of a company's intranet out onto the Internet, e.g. to allow selected customers, suppliers and mobile workers to access the company's private data and applications via the World Wide Web. Generally an extranet implies real-time access through a firewall of some kind."
    },
    {
        "SrNo": "712",
        "english": "Extremely High Frequency",
        "abbreviation": "EHF",
        "english_description": "The RF spectrum between 30 GHz and 300 GHz."
    },
    {
        "SrNo": "713",
        "english": "Eye diagram",
        "english_description": "A superposition of segments of a received PAM signal displayed on an oscilloscope or similar instrument. The eye diagram is used to assess impairments in the radio channel."
    },
    {
        "SrNo": "714",
        "english": "Face to Face ",
        "mongolian": "Нүүр тулах",
        "mongolian_description": "Өөд өөдөөсөө харж харилцахыг хэлнэ. Жишээ нь : Утасаар ярих, и-мэйл илгээх нь Face to face биш юм."
    },
    {
        "SrNo": "715",
        "english": "Facilitator",
        "mongolian": "Хялбарчлах ,зохицуулагч                               ",
        "mongolian_description": "Хэрэглэгч нь мэйлээ идэвхитэй ажилууллахын тулд мэйлийн жагсаалт эсвэл зарлалын самбарыг хянадаг."
    },
    {
        "SrNo": "716",
        "english": "Fade",
        "mongolian": "Намдалт, намдах, сулрах, замхралт, унтралт, дууны түвшин тохируулах, дүрсийг алгуур өөрчлөх",
        "mongolian_description": "Пресентейшний дүрс бичлэгийн хуудас өгөгдлийн хуудас хооронд аажуу дараалалд оруулж эсвэл сүүлийн хуудсанд  шилжүүлнэ"
    },
    {
        "SrNo": "717",
        "english": "Fading",
        "english_description": "The variation in signal strength from it normal value. Fading is normally negative and can be either fast or slow. It is normally characterized by the distribution of fades, Gaussian, Rician, or Rayleigh."
    },
    {
        "SrNo": "718",
        "english": "False ",
        "mongolian": "Худал, буруу, алдаа мадагтай, хуурмаг, гажуу, хиймэл, дууриамал, зохиомол, найдваргүй",
        "mongolian_description": "Буулийн алгебр нь үнэн ба худал нь ихэвчлэн хоёртын тооллын 1 болон 0 гэсэн утгаар илэрхийлэгддэг"
    },
    {
        "SrNo": "719",
        "english": "Fast Associated Control Channel",
        "abbreviation": "FACCH",
        "english_description": "The channel derived by preempting information in a traffic channel. It is used to send handoff and similar messages."
    },
    {
        "SrNo": "720",
        "english": "Fast fading",
        "english_description": "The short term component associated with multipath propagation. It is influenced by the speed of the mobile terminal and the transmission bandwidth of the signal."
    },
    {
        "SrNo": "721",
        "english": "Fast forward",
        "mongolian": "Хурдан урагшлах",
        "mongolian_description": "Мультимедиа файлын дамжуулал нь хэвийн хурдаас илүү хурдан дамжуулана."
    },
    {
        "SrNo": "722",
        "english": "Fast packet switching",
        "english_description": "An emerging, packet-orientated, digital technology that differs from traditional packet switching in a number of ways. The most obvious is that it transmits all data in a single packet format whether the information is video, voice or data. Fast packet switching uses short, fixed length packets (cells) and - via hardware switching - is capable of speeds between 100,000 and 1,000,000 packets/second."
    },
    {
        "SrNo": "723",
        "english": "Favorites",
        "mongolian": "Дэмждэг, урьтал болгодог",
        "mongolian_description": "Таны вэб хуудас үзүүлэгч программ дотор вэб хуудас эсвэл вэб байршлын  холбоосыг хадгалах арга. Bookmark нь Neetscape-аар ашиглагддаг нэр томъёо бөгөөд ихэнхдээ Internet Explorer-ийг ашиглагдаг."
    },
    {
        "SrNo": "724",
        "english": "Fax",
        "mongolian": "Факс",
        "mongolian_description": "Богино дамжуулал ба телефон утасны шугам ашиглаж график болон текст оруулж болох ба мөн баримт бичгийн хуулбарыг илгээнэ."
    },
    {
        "SrNo": "725",
        "english": "Fax modem",
        "mongolian": "Факс модем",
        "mongolian_description": "Факс модем нь шууд факс илгээх нь телефон утасны шугамд холбогдсон компьютерт олгодог ба модем нь тусгай төрлийн байна. Энэ нь цаасан дээр өгөгдлийг гаргахгүй бөгөөд факс хүлээн авахад  оператор түүнийг боловсруулах болно."
    },
    {
        "SrNo": "726",
        "english": "Feasibility study",
        "mongolian": "Техник эдийн засгийн үндэслэл",
        "mongolian_description": "Асуудлыг урьдчилсан судлах боломжтой шийдвэр гаргахад ашигладаг бөгөөд энэ нь ямар ч байдлаар хийж болно. Энэ системийн дүн шинжилгээ хийх нь их энгийн түвшинд хийгддэг."
    },
    {
        "SrNo": "727",
        "english": "Federal Communications Commission",
        "abbreviation": "FCC",
        "english_description": "Regulatory body governing communications technologies in the US. established by the Communications Act of 1934, as amended, and regulates interstate communications (wire, radio, telephone, telegraph and telecommunications) originating in the United States."
    },
    {
        "SrNo": "728",
        "english": "Feed",
        "mongolian": "Хөтлөгч, тэжээл, тэжээх, өгөх, ажиллуулах, өдөөх схем                                                                                                                                                    ",
        "mongolian_description": "Хэвлэлтэд ашиглагддаг нэр томъёог цаас хэвлэгч руу оруулах үед ашиглагддаг"
    },
    {
        "SrNo": "729",
        "english": "Feed ",
        "mongolian": "Хөтлөгч, тэжээл",
        "mongolian_description": "Өөр компьютерүүр  мэдээлэлилгээх үйл явц жишээ нь түгээх"
    },
    {
        "SrNo": "730",
        "english": "Feeder link",
        "mongolian": "Салаа холбоос"
    },
    {
        "SrNo": "731",
        "english": "Feeder link",
        "english_description": "A radio link from an earth station at a given location to a space station, or vice versa, conveying information for a space radiocommunication service other than for the fixed-satellite service. The given location may be at a specified point, or at any fixed point within specified areas.",
        "description": "Note – Examples of feeder links: – an up-link for a broadcasting satellite; – a down-link for a data collection or Earth exploration satellite; – an up-link and down-link between a coast earth station and a satellite in the maritime mobile-satellite service."
    },
    {
        "SrNo": "732",
        "english": "Fetch-execute cycle",
        "mongolian": "Нөхөж-биелүүлэх цикл",
        "mongolian_description": "Төв боловсруулах хяналтын нэгж, дарааллаар нь тус бүр хичээлыг сүлжээнээс татаж нөхдөг декод болон компьютерийн бусад хэсэгт дохио илгээж ажиллуулж өмнө зохицуулдаг Энэ нь нөхөж-биелүүлэх цикл гэж нэрлэдэг."
    },
    {
        "SrNo": "733",
        "english": "Fiber optic cable",
        "mongolian": "Шилэн кабель",
        "mongolian_description": "Модуляцлан гэрэл  ашиглан өгөгдлийг хурдан дамжуулах боломжийг олгодог маш нарийн шилэн хэлхээ.Энэ нь нэг буюу хэд хэдэн мэдээллийн дохио явуулах чадвартай. шилэн кабелийн хөндлөнгийн шуугиан бага, аюулгүй өгөгдөл дамжуулах боломжийг олгодог бөгөөд, металл утаснас ялгаатай нь зэвэрдэг зүйл биш юм."
    },
    {
        "SrNo": "734",
        "english": "Field",
        "mongolian": "Талбай, талбар, салбар, муж хэсэг, төрөл, салбар, хүрээ",
        "mongolian_description": "Талбарын нэг тодорхой зүйлийг эзэмшиж байгаа мэдээ баримтын хэсэг. Жишээ нь: номын сангийн номын файл ном тус бүрийн хувьд нэг баримтжуулсан байх болно, мөн мэдээ баримтад ном тус бүрийх нь нэр, үнэ, хуудасны тоо."
    },
    {
        "SrNo": "735",
        "english": "Field name",
        "mongolian": "Талбарын нэр",
        "mongolian_description": "Талбарыг илэрхийлсэн нэр,  гарчиг нь тухайн талбарын нэр байна тэхээр өгөгдлийн талбар нь гарчгаараа илэрхийлсэн байна . Ноён Хадагтай гэх мэт."
    },
    {
        "SrNo": "736",
        "english": "Field type ",
        "mongolian": "Талбайн төрөл",
        "mongolian_description": "Тухайн талбарын төрөлд зохион байгуулагдсан өгөгдлийн төрөл, жишээ нь: номер, үсэг, мэдээлэл"
    },
    {
        "SrNo": "737",
        "english": "Field width ",
        "mongolian": "Талбайн өргөн",
        "mongolian_description": "Зөвшөөрөгдөх тоон тэмдэгтийн хамгийн их утга"
    },
    {
        "SrNo": "738",
        "english": "Fifth-generation computer",
        "mongolian": "Тав дахь үеийн компьютер",
        "mongolian_description": "Компьютерийн системийг төлөвлөх, хэрэглэх нь  өөр арга зам нь алсын хараа.Энэ нь шинэ компьютерийн архитектур болон програм хангамжийн төрлийн аль аль нь орно, энэ үзэгдлийн зарим нь хүрч байна.Энэ нь хүмүүстэй харилцаж чадна виртуал бодит байдал, шинжээч систем, байгалийн хэлний интерфэйсүүд дээр төвлөрч байна."
    },
    {
        "SrNo": "739",
        "english": "File",
        "mongolian": "Файл , баримт цуглуулга , архив",
        "mongolian_description": "Өгөгдлийн  цуглуулга компьютерт хадгалж, нэг хэсгийг боловсруулдаг"
    },
    {
        "SrNo": "740",
        "english": "File ",
        "mongolian": "файл , баримт цуглуулга , архив",
        "mongolian_description": "Мэдээллийн санд, багц бүртгэл холбоотой"
    },
    {
        "SrNo": "741",
        "english": "File ( or search )",
        "mongolian": "Хайх",
        "mongolian_description": "Мэдээлэл дэх онцгой үг ба үсгийг хайж олох төхөөрөмж. "
    },
    {
        "SrNo": "742",
        "english": "File allocation table (FAT) ",
        "mongolian": "Файл хуваарилах хүснэгт",
        "mongolian_description": "Файлууд арын нөөцөд хадгалагдаж байгаа бол энэ талаарх дэлгэрэнгүй мэдээлэл өөрт нь байдаг бөгөөд энэ нь файл хуваарилах хүснэгтэд хадгалагдаж байгаа файл нь мөн нөөцө дээр хадгалагдаж байдаг"
    },
    {
        "SrNo": "743",
        "english": "File attribute ",
        "mongolian": "файлын шинж чанар",
        "mongolian_description": "Энэ нь өөрчилж болно  жишээ нь файл уруу өгч болно шинж чанар, файл, бичих нь өөрчилж болохгүй учраас зөвхөн унших, эсвэл уншиж болно далд. бусад далд шинж чанарууд нь, систем болон архив зэрэг орно."
    },
    {
        "SrNo": "744",
        "english": "File format ",
        "mongolian": "Файлын формат",
        "mongolian_description": "Мэдээлэл файлд хадгалагдаж байгаа нь маш олон Арга зам хэлбэр байдаг.   текст боловсруулагч удирдлагын  хүснэгттэй хэл өөр хэлбэрээр Өгөгдлийн хадгалдаг"
    },
    {
        "SrNo": "745",
        "english": "File handling ",
        "mongolian": "Файлын боловсруулалт",
        "mongolian_description": "Нээх, тэдгээрийг хаах, жишээ нь, ямар нэг байдлаар файлуудыг удирдах тушаалууд  програм нь ерөнхий нэр томъёо."
    },
    {
        "SrNo": "746",
        "english": "File listing",
        "mongolian": "Файлын жагсаалт",
        "mongolian_description": "Тухайн сан болон хавтас файлын жагсаалт"
    },
    {
        "SrNo": "747",
        "english": "File name",
        "mongolian": "Файлын нэр",
        "mongolian_description": "нэг файлд өгөгдсөн өвөрмөц нэр"
    },
    {
        "SrNo": "748",
        "english": "File name extension 1 ",
        "mongolian": "Файлын нэрийн өргөтгөл",
        "mongolian_description": "файлын нэр нь ихэвчлэн файлын төрлийг илэрхийлсэн нь бүрэн зогсоох хойш өргөтгөх, олон тооны, эсвэл тэмдэгтүүдтэй байна,жишээ нь  EXE энэ excel гэсэн үг, xls нь хүснэгттэй ажилладаг файл юм,doc энэ нь үг боловсруулсан файл юм ."
    },
    {
        "SrNo": "749",
        "english": "File name extension 2 ",
        "mongolian": "Файлын нэрийн өргөтгөл",
        "mongolian_description": "Файлын нэр, тэд файлын төрлийг заана дээр нь өргөтгөлтэй байдаг."
    },
    {
        "SrNo": "750",
        "english": "File operations ",
        "mongolian": "Файлын агуулах зүйл",
        "mongolian_description": "Зарим нэг арга, жишээлбэл нээх файл удирдахыг, тэдгээрийг хаах хэл дахь тушаалууд гэдэг програм нь ерөнхий нэр томъёо"
    },
    {
        "SrNo": "751",
        "english": "File path ",
        "mongolian": "Файлын зам",
        "mongolian_description": "Энэ файлын нэр, гадна диск дээр удирдах хэрэгсэл (хавтас) дамжуулан энэ замыг нь зөвхөн жагсаан, файлын байршлыг өгдөг."
    },
    {
        "SrNo": "752",
        "english": "File server ",
        "mongolian": "Файл сервер",
        "mongolian_description": "Файл сервер сүлжээн дээр хэрэглэгчдэд зориулсан төв диск хадгалах болно. файл нь серверийн програм хангамж бүрийн хэрэглэгчдийг тодорхойлно."
    },
    {
        "SrNo": "753",
        "english": "File transfer protocol (FTP) ",
        "mongolian": "Файл дамжуулах протокол",
        "mongolian_description": "Компьютер хоорондын дамжуулж буй файлын хуулбар мессеж илгээхийг хэрэглэгчид зөвшөөрөх. Файл дамжуулах протокол нь компьютер хоорондын мессежүүд болон бүлгүүд дэх (мөн блок гэж нэрэлдэг) файлын хуулбарыг илгээх явцыг хянах бөгөөд алдаа зааж буй өгөгдлийг мөн шалгадаг. Интернет дээр файлуудыг байрлуулах боломжтой болгохын тулд нэг төхөөрөмжөөс нөгөө рүү ийнхүү дамжуулж байгаа юм."
    },
    {
        "SrNo": "754",
        "english": "File type ",
        "mongolian": "Файлын төрөл ",
        "mongolian_description": "Файлд хадгалагдах болно. Жишээ нь: Гүйцэтгэж болохуйц програм, өгөгдөл тодорхой аппликашинд зориулж бүтэцтэй болгоно."
    },
    {
        "SrNo": "755",
        "english": "Fill colour",
        "mongolian": "Өнгөөр будах ",
        "mongolian_description": "Сонгосон өнгөөрөө график дэх дүрсийг будах."
    },
    {
        "SrNo": "756",
        "english": "Filter ",
        "mongolian": "Шүүлтүүр ",
        "mongolian_description": "И-мэйл үйлчилгээн дэх и-мэйлүүдийг ялгаж соортлон зохих фолдерт байрлуулах."
    },
    {
        "SrNo": "757",
        "english": "Find",
        "mongolian": "Олох",
        "mongolian_description": "Дискэнд байгаа болон файл дах зарим мэдээлэлийг олох. "
    },
    {
        "SrNo": "758",
        "english": "Find and replace",
        "mongolian": "Хайх, солих",
        "mongolian_description": "Мэдээлэл дэх тодорхой текстийг олох, нэг нэрийг өөрөөр солих."
    },
    {
        "SrNo": "759",
        "english": "Finite Impulse Response",
        "abbreviation": "FIR",
        "english_description": "A technique used to characterize electrical circuits and networks in the time domain."
    },
    {
        "SrNo": "760",
        "english": "Firewall",
        "mongolian": "Галт хана ",
        "mongolian_description": "Компьютерийн системд гадны хэрэглэгчид зөвшөөрөлгүй хандалт хийхээс сэргийлсэн програм. Гадны хэрэглэгч рүү явуулсан ба ирсэн мэдээллийг хязгаарладаг. Жишээ нь: мэдээллийг тодорхой төрлүүдийг блоклон компьютероос зөвхөн зөвшөөрөгдсөн хандалт эсвэл хэрэглэгчийн нэмэлт тодорхойлолтыг шаарддаг. Ихэвчлэн бүрэн итгэмжлэгдсэн сервер хэрэглэнэ."
    },
    {
        "SrNo": "761",
        "english": "First in first out (FIFO 1)",
        "mongolian_description": "Устгасан зүйл ба нэмсэн зүйлсийн жагсаалт. Энэ нь ирсэн мэдээлэлтэй хамаатай."
    },
    {
        "SrNo": "762",
        "english": "First-generation computer",
        "mongolian": "Анхны үеийн компьютер ",
        "mongolian_description": "Компьютерын анхны төрөл. Тэд хавхлага, мөнгөн ус, удаашруулах шугам, электростатик ба хязгаарлалттай санах ойд ашиглагддаг."
    },
    {
        "SrNo": "763",
        "english": "Flame ",
        "mongolian_description": "Ихэвчлэн и-мэйл листэнд байдаг, группийн бусад гишүүд рүү халдана."
    },
    {
        "SrNo": "764",
        "english": "Flash ",
        "mongolian_description": "Macromedia-н бүтээсэн програм."
    },
    {
        "SrNo": "765",
        "english": "Flat fading",
        "english_description": "A type of fading in a communications channel that attenuates or fades all frequencies in the channel the same amount."
    },
    {
        "SrNo": "766",
        "english": "Flat file database",
        "mongolian": "Мэдээллийн сан ",
        "mongolian_description": "Ганц файлыг хадгална. Мэдээлэл мөр нь бичиг баримт, багана нь талбай бүрт байрлана. Энэ зөвхөн маш амархан мэдээллийг зөвшөөрч, 2 хэмжээст хүснэгтийг авч үздэг."
    },
    {
        "SrNo": "767",
        "english": "Flat screen",
        "mongolian": "Хавтгай дэлгэц",
        "mongolian_description": "Дэлгэц маш нимгэн CRT дэлгэцнээс илүү өөр технологийг ашигладаг."
    },
    {
        "SrNo": "768",
        "english": "Float type",
        "mongolian": "Float төрөл ",
        "mongolian_description": "Хадгалах float дугаарт ашиглагдана."
    },
    {
        "SrNo": "769",
        "english": "Floating- point numbers ",
        "mongolian": "Хөдөлгөөн цэгэн тоонууд ",
        "mongolian_description": "Аравтын бутархай эсвэл хосолсон чанартай бүхэл тоонууд."
    },
    {
        "SrNo": "770",
        "english": "Floppy disk",
        "mongolian": "Уян диск",
        "mongolian_description": "Мэдээллийг хадгалхад зориулагдсан салгадаг соронзон диск ихэнхдээ нэг комьпютерээс нөгөөд жижиг файлууд зөөхөд ашиглагддаг. Нэг удаад 5,25-8 инч хэлбэртэй байх боломжтой. Өнөөдөр уян диск нь 3.5 инчийн хатуу хайрцагтай зөвхөн 1,44 мегабатын багтаамжтай нь худалдаанд гарч байна."
    },
    {
        "SrNo": "771",
        "english": "Flowchart ",
        "mongolian_description": "Програм болон системийн загварт үйлдэл хийх, хадгалах гэх мэт үйл явцын бүдүүвчилсэн дүрслэл бөгөөд эдгээр алхмууд нь үйл явцыг бүрэн гүйцэд болгоход ашигладаг."
    },
    {
        "SrNo": "772",
        "english": "Folder",
        "mongolian": "Хавтас  буюу фолдер ",
        "mongolian_description": "Файлуудыг эмх цэгцтэй байлгахын тулд нээдэг бөгөөд нэг төрлийн холбоотой файлууд нэг фолдер дотор хийдэг."
    },
    {
        "SrNo": "773",
        "english": "Font",
        "mongolian": "Фонт ",
        "mongolian_description": "Мэдээллийг бичихдээ ашиглах тэмдэгтүүд болон хэлбэр дүрсний тохиргоо. Times New Roman, Arial гэх мэт маш олон төрлийн фонтууд байдаг бөгөөд зарим нь маш нарийн хийцтэй гоёмсог, зарим нь маш энгийн байх жишээтэй."
    },
    {
        "SrNo": "774",
        "english": "Footer",
        "mongolian": "Хөл бичих",
        "mongolian_description": "Бичвэрийн хуудас бүрийн доор байрлуулсан бичвэр."
    },
    {
        "SrNo": "775",
        "english": "Foreground",
        "mongolian": "Нүүрний цонх",
        "mongolian_description": "Гар доорх хэрэглээний апликешн бөгөөд хэрэглэгч хэрэглэхэд амар хялбар байдлаар байршуулсан цонх. Комьпютерийн идэвхитэй цонх юм."
    },
    {
        "SrNo": "776",
        "english": "Form",
        "mongolian": "Маягт ",
        "mongolian_description": "Вэб загвар, өгөгдлийн сангууд болон бусад электроникийн хэрэгсэлд форм нь хэрэглэгч мэдээлэлд нэвтрэхийг зөвшөөрөх тавцангийн нэг хэлбэр юм."
    },
    {
        "SrNo": "777",
        "english": "Formal parameter ",
        "mongolian": "Формал параметр ",
        "mongolian_description": "Функц болон үйл явцад ашиглагддаг дуудлагын програмд мэдээллийг холбох үүргийг гүйцэтгэдэг."
    },
    {
        "SrNo": "778",
        "english": "Formal specification ",
        "mongolian": "Формал /албан ёсоны / зааварчилгаа ",
        "mongolian_description": "Системийн загварт формал зааварчилгааны хүрээ нь системийн тусгай хэсгүүдийн бүтэц."
    },
    {
        "SrNo": "779",
        "english": "Format",
        "mongolian": "Формат ",
        "mongolian_description": "Тектийн харагдах байдлын өөрчлөх. Жишээ нь: Bold, italic"
    },
    {
        "SrNo": "780",
        "english": "Format",
        "mongolian": "Формат ",
        "mongolian_description": "Үйл ажиллагааны системийн үед болон үйл ажиллагааны систем нь диск дээр өөр байдлаар мэдээллийг хадгалах гэх мэт шинж тэмдэг илрэх үед дискийг форматлах шаардлагатай болдог. Дискийг форматлахын тулд дискийн зохион байгуулах дэс дараалалд оруулах замуудыг ашигладаг. Тэдгээр зам бүр нь тэнцүү урттай блокуудаас бүрддэг /мөн сектор гэж дууддаг/. Харин сектор бүр нь замуудын жижиг хаяг бүхий хэсгүүдээс бүрдэх ба тэдгээр жижиг хэсгүүд нь дискийг уншсан, бичсин мэдээллүүдийн багтаасан хамгийн жижиг хэсэг юм. "
    },
    {
        "SrNo": "781",
        "english": "Forward Error Correction",
        "abbreviation": "FEC",
        "english_description": "An encoding technique that allows a limited number of errors in digital stream to be corrected based on knowledge of the encoding scheme used."
    },
    {
        "SrNo": "782",
        "english": "Forward link",
        "english_description": "See downlink."
    },
    {
        "SrNo": "783",
        "english": "Frame Alignment Word",
        "abbreviation": "FAW",
        "english_description": "A unique digital word used by codecs to allow them to resynchronize to the framing structure in the event of errors."
    },
    {
        "SrNo": "784",
        "english": "Frame Erasure/Error Rate",
        "abbreviation": "FER",
        "english_description": "A measure of the number of frames of data that contained errors and could not be processed. FER is usually expressed as a percentage or exponent."
    },
    {
        "SrNo": "785",
        "english": "Framing",
        "english_description": "A technique used in digital communications systems for organizing the transmitted data into regular patterns so that the various logical channels in the data stream can be detected and processed."
    },
    {
        "SrNo": "786",
        "english": "Free space basic transmission loss",
        "english_description": "The transmission loss that would occur if the antennas were replaced by isotropic antennas located in a perfectly dielectric, homogeneous, isotropic and unlimited environment, the distance between the antennas being retained.",
        "description": "Note – If the distance d between the antennas is much greater than the wavelength λ, the free space attenuation in decibels will be: ⎟ ⎠ ⎞ ⎜ ⎝ ⎛ λ π = d Lbf 4 20 lg dB"
    },
    {
        "SrNo": "787",
        "english": "Free-space propagation",
        "english_description": "Propagation of an electromagnetic wave in a homogeneous ideal dielectric medium which may be considered of infinite extent in all directions.",
        "description": "Note – For propagation in free space, the magnitude of each vector of the electromagnetic field in any given direction from the source beyond a suitable distance determined by the size of the source and the wavelength is proportional to the reciprocal of the distance from the source."
    },
    {
        "SrNo": "788",
        "english": "Free-space-propagation",
        "mongolian": "Чөлөөт орон зайн тархалт ",
        "mongolian_description": "Цахилгаан соронзон долгионы тархалт нь нэгэн төрлийн тусгаарлагч дунд хязгааргүй, бүх чиглэлд хийсвэр түвшинтэй  тусгагдсан байж магадгүй."
    },
    {
        "SrNo": "789",
        "english": "Frequency Correction Channel",
        "abbreviation": "FCCH",
        "english_description": "A logical channel in GSM systems used to transmit a frequency correction data burst of all \"zeros\". The resulting frequency shift seen by the mobile is then used for frequency correction."
    },
    {
        "SrNo": "790",
        "english": "Frequency diversity",
        "english_description": "The simultaneous use of multiple frequencies to transmit of information. This is a technique used to overcome the effects of multipath fading, since the wavelength for different frequencies result in different and uncorrelated fading characteristics."
    },
    {
        "SrNo": "791",
        "english": "Frequency diversity reception",
        "english_description": "Diversity reception in which several radio channels are used with appropriate frequency separations.",
        "description": "Note – If the channels are situated in different frequency bands, the frequency diversity is said to be “cross-band diversity”."
    },
    {
        "SrNo": "792",
        "english": "Frequency Division Duplex",
        "abbreviation": "FDD",
        "english_description": "Radio technology using a paired spectrum. Used in cellular communication systems such as GSM."
    },
    {
        "SrNo": "793",
        "english": "Frequency Division Multiple Access",
        "abbreviation": "FDMA",
        "english_description": "Method of allowing multiple users to share the radio frequency spectrum by assigning each active user an individual frequency channel. In this practice, users are dynamically allocated a group of frequencies so that the apparent availability is greater than the number of channels."
    },
    {
        "SrNo": "794",
        "english": "Frequency Hopped Multiple Access",
        "abbreviation": "FHMA",
        "english_description": "A set of frequency hopping communicators operating as a system to provide communications services. All communicators traditionally use the same set of carrier frequencies and coordinate their hopping sequences to minimize interference in the network."
    },
    {
        "SrNo": "795",
        "english": "Frequency Hopped Spread Spectrum",
        "abbreviation": "FHSS",
        "english_description": "A spectrum spreading technique using an RF carrier hopped across a large number of RF channels using a random or pseudorandom code to determine the sequence of channels used."
    },
    {
        "SrNo": "796",
        "english": "Frequency Hopping",
        "abbreviation": "FH",
        "english_description": "A periodic changing of frequency or frequency set associated with transmission. A sequence of modulated pulses having a pseudorandom selection of carrier frequencies."
    },
    {
        "SrNo": "797",
        "english": "Frequency Modulation",
        "abbreviation": "FM",
        "english_description": "A form of angle modulation in which the instantaneous frequency of a sine-wave carrier is caused to depart from the carrier frequency by an amount proportional to the instantaneous value of the modulating wave."
    },
    {
        "SrNo": "798",
        "english": "Frequency reuse",
        "english_description": "A technique of reusing frequencies and channels within a communications system to improve capacity and spectral efficiency. Frequency reuse generally utilizes regular reuse patterns."
    },
    {
        "SrNo": "799",
        "english": "Frequency re-use satellite network",
        "english_description": "A satellite network in which the satellite utilizes the same frequency band more than once, by means of antenna polarization discrimination, or by multiple antenna beams, or both."
    },
    {
        "SrNo": "800",
        "english": "Frequency selective fading",
        "english_description": "A type of signal fading occurring over a small group of frequencies caused by a strong multipath component at those frequencies."
    },
    {
        "SrNo": "801",
        "english": "Frequency Shift Keying",
        "abbreviation": "FSK",
        "english_description": "A form of modulation using multiple carrier frequencies to carry the digital information. The most common is the two frequency FSK system using the two frequencies to carry the binary ones and zeros."
    },
    {
        "SrNo": "802",
        "english": "Frequency standard",
        "english_description": "A generator, the output of which is used as a frequency reference."
    },
    {
        "SrNo": "803",
        "english": "Frequency tolerance",
        "english_description": "The maximum permissible departure by the centre frequency of the frequency band occupied by an emission from the assigned frequency or, by the characteristic frequency of an emission from the reference frequency.",
        "description": "Note – The frequency tolerance is expressed in parts in 106 or in hertz."
    },
    {
        "SrNo": "804",
        "english": "Full carrier",
        "english_description": "Pertaining to a transmission or emission with amplitude modulation where, by convention, the power of the sinusoidal carrier component is no more than 6 dB below the peak envelope power. ",
        "description": "Note 1 – Double-sideband amplitude-modulated emissions normally comprise a full carrier with a power level exactly 6 dB below the peak envelope power at 100% modulation. Note 2 – In single-sideband full-carrier emissions, a carrier at a power level of 6 dB below the peak envelope power is emitted, to enable the use of a receiver designed for double-sideband full-carrier operation."
    },
    {
        "SrNo": "805",
        "english": "Full carrier ",
        "mongolian": "зөөгч дохио",
        "mongolian_description": "дулааны урсгал, синуслэг зөөгч бүрэлдэхүүн хэсгийн эрчим хүчний ямар ч илүү 6dB-эс өндөр хүчдэл доогуур, далайцын модуляцнь дамжуулах эсвэл цацрагахтайхолбоотой. "
    },
    {
        "SrNo": "806",
        "english": "full rate",
        "english_description": "The term commonly applied to voice codecs in a communications system. Most frame formats are designed to accommodate full and half-rate channels, with the intention of implementing half-rate coding as the technology permits to double the capacity of the system. The full-rate codec uses all of the time-slots available."
    },
    {
        "SrNo": "807",
        "english": "Gateway GPRS Support Node",
        "abbreviation": "GGSN",
        "english_description": "A gateway from a cellular network to an IP network."
    },
    {
        "SrNo": "808",
        "english": "Gaussian channel",
        "english_description": "An RF communications channel having the properties of wide-band uniform noise spectral density resulting in a random distribution of errors in the channel."
    },
    {
        "SrNo": "809",
        "english": "Gaussian Minimum Shift Keying",
        "abbreviation": "GMSK",
        "english_description": "A modulation technique involving Gaussian filtering of the input data prior to its application to the phase modulator. This results in a narrow occupied spectrum and better adjacent channel interference performance."
    },
    {
        "SrNo": "810",
        "english": "General Packet Radio Service",
        "abbreviation": "GPRS",
        "english_description": "A packet-linked technology that enables high-speed (115 kilobit per second) wireless Internet and other data communications over a GSM network. It is considered an efficient use of limited bandwidth and is particularly suited for sending and receiving small bursts of data."
    },
    {
        "SrNo": "811",
        "english": "Geocentric angle",
        "english_description": "The angle formed by imaginary straight lines that join any two points with the centre of the Earth."
    },
    {
        "SrNo": "812",
        "english": "Geostationary satellite",
        "english_description": "A stationary satellite having the Earth as its primary body.",
        "description": "Note – A geostationary satellite remains approximately fixed relative to the Earth"
    },
    {
        "SrNo": "813",
        "english": "Geostationary-satellite orbit",
        "english_description": "The unique orbit of all geostationary satellites."
    },
    {
        "SrNo": "814",
        "english": "Geosynchronous satellite",
        "english_description": "A synchronous Earth satellite.",
        "description": "Note – The sidereal period of rotation of the Earth is about 23 hours 56 minutes."
    },
    {
        "SrNo": "815",
        "english": "Gigabyte",
        "mongolian": "Гигабайт ",
        "mongolian_description": "1024 мегабайт  хэмжээтэй дискний зай эсвэл компьютерийн санах ойн хэмжээ. Товчилсон хэлбэр нь Gb."
    },
    {
        "SrNo": "816",
        "english": "Gigahertz",
        "abbreviation": "GHz",
        "english_description": "A frequency measurement which equals one billion hertz."
    },
    {
        "SrNo": "817",
        "english": "Global change",
        "mongolian_description": "Баримт бичиг эсвэл файлын үр дагаварыг нийтэд нь өөрчлөх. Жишээ нь: Presentatin-д байгаа slide master-ийг өөрчлөх. "
    },
    {
        "SrNo": "818",
        "english": "Global Positioning System",
        "abbreviation": "GPS",
        "english_description": "A worldwide radio-navigation system that was developed by the US. Department of Defense. In addition to military purposes it is widely used in marine and terrestrial navigation (for example car navigation systems)."
    },
    {
        "SrNo": "819",
        "english": "Global System for Mobile Communication",
        "abbreviation": "GSM",
        "english_description": "Originally developed as a pan-European standard for digital mobile telephony, GSM has become the world's most widely used mobile system. It is used on the 900 MHz and 1800 MHz frequencies in Europe, Asia and Australia, and the MHz 1900 frequency in North America and Latin America."
    },
    {
        "SrNo": "820",
        "english": "Global variable",
        "mongolian_description": "Global variable нь: программын хаана ч хэрэглэгдэнэ. "
    },
    {
        "SrNo": "821",
        "english": "Go ",
        "mongolian_description": "Ихэнхи  Apple –ийн компьютерт байдаг  цэсийн сонголт. "
    },
    {
        "SrNo": "822",
        "english": "Grade of Service",
        "abbreviation": "GOS",
        "english_description": "A measure of the success a subscriber is expected to have in accessing a network to complete a call. The grade of service is usually expressed as percentage of calls attempted by the subscriber during the busy-hour that are blocked due to insufficient network resources."
    },
    {
        "SrNo": "823",
        "english": "Grammar checker",
        "mongolian": "Алдаа шалгагч ",
        "mongolian_description": "Алдаа  шалгагч нь баримт бичиг дэх дүрмийн алдааг илрүүлдэг бөгөөд word зэрэг программд байдаг."
    },
    {
        "SrNo": "824",
        "english": "Graph",
        "mongolian": "График ",
        "mongolian_description": "Бүлэг тоонуудыг илэрхийлэхээр хийгдсэн зургийн хэлбэр. Энгийн жагсаалт тоонуудыг ойлгоход хэцүү үед график нь тэднийг хэрэглэгчидэд ойлгоход тусалдаг. Алдартай графикийн төлбөрүүд:"
    },
    {
        "SrNo": "825",
        "english": "Graphical user interface(GUI) ",
        "mongolian": "Хэрэглэгчийн график интерфейс",
        "mongolian_description": "Microsoft Windows график хэрэглэгчийн харагдах байдлын хамгийн энгийн жишээ ба системийн цонхнууд болон  Menu, icon-ууд нь хэрэглэгчийг компьютертай харилцахад амар болгож өгдөг. GUI гарж ирэхээс өмнө ихэнхи хэрэглэгчийн харагдах байдал голдуу бичмэл хэлбэртэй байсан."
    },
    {
        "SrNo": "826",
        "english": "Graphics ",
        "mongolian_description": " Гэрэл зурагийг график зураг болгон шинээр  өөрчлөх боломжийг олгодог програм хангамж."
    },
    {
        "SrNo": "827",
        "english": "Graphics interchange format",
        "abbreviation": "GIF ",
        "mongolian_description": "Графикт ашиглагддаг файлын формат"
    },
    {
        "SrNo": "828",
        "english": "Graphics plotter ",
        "mongolian_description": "Инженер болон архитектoрууд ихээр ашигладаг. Зураг  төслийг дизайнлан бий болгоход зориулагдсан төхөөрөмж."
    },
    {
        "SrNo": "829",
        "english": "Graphics tablet ",
        "mongolian_description": "Компьютерлуу зургийг оруулахад хэрэглэгддэг төхөөрөмж. Пад эсвэл таблэт дээр хэрэглэгч зүүгээр зурж эсвэл зургийг хуулж оруулдаг."
    },
    {
        "SrNo": "830",
        "english": "Grid ",
        "mongolian": "Тор ,сүлжээ ",
        "mongolian_description": "Төхөөрөмж эсвэл word process-ийн хүснэгтэд өгөгдлийн мөр баганан хүснэгт болгон оруулахыг grid гэнэ."
    },
    {
        "SrNo": "831",
        "english": "Gridline",
        "mongolian_description": "Төхөөрөмж болон word processing хүснэгтэд gridline гэдэг нь: мөр болон баганыг хязгаарлаж буй зураасууд юм. Ихэвчлэн gridline- ийг харагдах болон харагдахгүй байлгаж болдог. "
    },
    {
        "SrNo": "832",
        "english": "Ground wave",
        "mongolian": "Газрын долгион ",
        "mongolian_description": "Дэлхийнагаар мандалын радио долгион нь гол төлөв диффракцын ойролцоо газар дээрх төлөв байдалыг ихэнхдээ тодорхойлдог."
    },
    {
        "SrNo": "833",
        "english": "Ground wave",
        "english_description": "A radio wave basically determined by the properties of the ground which propagates in the troposphere and which is mainly due to diffraction around the Earth."
    },
    {
        "SrNo": "834",
        "english": "Groupware",
        "mongolian_description": "Хүмүүс  өөр өөр байрлалд байгаа хэдий ч хамт ажиллах боломжыг олгодог программ.  Groupware гэдэг үйлчилгээ нь  e-mail  дамжуулах өгөгдөл хооронд дамжуулах, электрон уулзалт хийх боломжийг олгодог. Electronic meeting  Гэдэг нь бүх л хүмүүс өөрсдийнхөө мэдээллийг бусдад үзүүлэн өөр өөр үйл ажиллагаануудийг явуулж болдог."
    },
    {
        "SrNo": "835",
        "english": "Guard band",
        "english_description": "A set of frequencies or band-width used to prevent adjacent systems from interfering with each other. Guard bands are typically used between different types of systems at the edges of the frequency allocations."
    },
    {
        "SrNo": "836",
        "english": "Hacker",
        "mongolian": "Компьютерийн  програмд зөвшөөрөлгүй нэвтрэгч ",
        "mongolian_description": "Хэн нэгэн компьютерийн систем рүү зөвшөөрөлгүй хандах оролдлого хийхийг хэлнэ."
    },
    {
        "SrNo": "837",
        "english": "Hacking ",
        "mongolian_description": "Зөвшөөрөлгүйгээр нэвтрэх эрхийг олж авахыг оролдохыг хэлнэ. Зөвшөөрөлгүй компьютерийг ашиглан компьютерт хадгалагдсан өгөгдлийн сан болон ерөнхий програмуудад зөвшөөрөлгүй нэвтрэхийг хэлнэ."
    },
    {
        "SrNo": "838",
        "english": "Half duplex",
        "mongolian_description": "Өгөгдөл дамжуулалтын чиглэлийг илэрхийлэх. Duplex  болон full duplex  гэж 2 нэрлэгдэнэ. Эдгээр нь нэг цаг хугацаанд бүх чиглэлд явуулах боломжтой. Хагас  duplex нь тухайн цаг хугацаанд ганцхан чиглэлд дамжуулдаг. Зөвхөн нэг чиглэлд дамжуулахыг  simplex гэнэ."
    },
    {
        "SrNo": "839",
        "english": "Half rate",
        "english_description": "The term commonly applied to voice codecs in a communications system. Most frame formats are designed to accommodate full and half-rate channels, with the intention of implementing half-rate coding as the technology permits to double system capacity. The halfrate codec uses only half of the time-slots in the frame."
    },
    {
        "SrNo": "840",
        "english": "Hamming code",
        "english_description": "A well known simple class of block codes capable of detecting up to two errors and correcting one. Although not particularly powerful, they are one of the \"perfect\" codes in that its standard array has all of the error patterns that can exist for single errors."
    },
    {
        "SrNo": "841",
        "english": "Hand disk ",
        "mongolian": "Хатуу диск ",
        "mongolian_description": "Компьютерт байгаа хэвийн бус хөдөлгөөнгүй суурин диск. Хатуу диск уян дискийг бодвол илүү их хэмжээг хадгалдаг бөгөөд илүү өндөр хурдтай."
    },
    {
        "SrNo": "842",
        "english": "Hand-held scanner",
        "mongolian": "Гар сканнер",
        "mongolian_description": "Энэ сканнер нь гэрлийн туяа ашиглаж зургийг илрүүлж түүнийгээ хуулбарлан компьютерт хадгалдаг төхөөрөмж. Hand-held  сканнерийг ашиглаж байгаа үед бичиг баримтны дээгүүр хөдөлгөх ёстой."
    },
    {
        "SrNo": "843",
        "english": "Hand-off",
        "english_description": "The process of transferring a call in progress from the current base station to another without interruption as the user moves out of range of the current base station."
    },
    {
        "SrNo": "844",
        "english": "Hand-over",
        "english_description": "The passing of a call signal from one base station to the next as the user moves out of range or the network software re-routes the call."
    },
    {
        "SrNo": "845",
        "english": "Handshake",
        "mongolian_description": "Компьютер болон принтер лүү өгөгдлийг дамжуулах, өгөгдлийг хүлээн авах болон  илгээдэг холболтын систем юм. Дамжуулал эхлэхээс өмнө дамжуулах болон хүлээн авах тал бэлэн гэдгийг мэдэгдэж буй аргуудыг handshake гэнэ."
    },
    {
        "SrNo": "846",
        "english": "Handwriting recognition",
        "mongolian_description": "Гар бичвэрээр дүгнэх нь компьютерийн процессорт орох  үед компьютерийн санд аль хэдийн үр дүн нь харицуулагдсан байдаг. Энгийн систем нь характеристикийг салган хэрэглэгч рүү чиглэсэн байдаг. Хэдийгээр зарим программ хангамж нь системийн тэжээлийн үйл  явцад хэрэглэгддэг ч бичихийг зөвшөөрдөг."
    },
    {
        "SrNo": "847",
        "english": "Hang",
        "mongolian_description": "Hang гэдэг нь:  Компьютерийн систем санамсаргүй байдлаар  ажиллахаа больж өгөгдлүүдэд  хариу үйлдэл  өгөхгүй байхыг хэлнэ."
    },
    {
        "SrNo": "848",
        "english": "Hard copy ",
        "mongolian": "Гараар хуулбарлах ",
        "mongolian_description": "Компьютерийн эх үүсвэрээс цаасан дээр хэвлэгдсэн мэдээлэл. "
    },
    {
        "SrNo": "849",
        "english": "Hard drive ",
        "mongolian_description": "Энэ байгууламж нь удирдлагын механизм болон бичих болон уншихад диск хооронд эргэх механизм хийдэг. Hard drive  нь хатуу дисктэй хамтарсан ихэвчлэн хөдөлгөөнгүй байдаг."
    },
    {
        "SrNo": "850",
        "english": "Hard hand-off",
        "english_description": "A term used in CDMA systems to describe a hand-off involving a frequency change. The hard hand-off is a break before make hand-off just like in other wireless systems and must be used where the current and hand-off candidate base stations do not use the same RF channel. See also soft hand-off."
    },
    {
        "SrNo": "851",
        "english": "Hard wired ",
        "mongolian_description": "Өөрчлөх боломжгүй хэлхээн дэх тогтмол болон бүрэн хэлхээний дизайныг  удирдан  ажиллах үйл ажиллагаа.  Иймэрхүү үйл ажиллагаа нь асаахад шууд ажиллах боломжтой болдог бөгөөд хэрэглэгчээр удирдуулдаггүй. Ингэснээр төхөөрөмж ассаны дараа эхний шатандаа байдгийг батлаж өгч байна. "
    },
    {
        "SrNo": "852",
        "english": "Hardware",
        "mongolian": "Техник хангамж ",
        "mongolian_description": "Техник хангамж нь принтер болон гар залуур, удирдах төхөөрөмж, төв процессорын төхөөрөмж гэх мэт тоног төхөөрөмжүүд нь компьютерийн системд хэрэглэгдэнэ. "
    },
    {
        "SrNo": "853",
        "english": "Harmonic emission",
        "english_description": "Spurious emissions at frequencies which are whole multiples of those contained in the band occupied by an emission."
    },
    {
        "SrNo": "854",
        "english": "Hash",
        "mongolian_description": "Нэг болон олон өгөгдлийн төрлүүдээс тухайн тооны үнэ(өртөгийг) тооцоолох."
    },
    {
        "SrNo": "855",
        "english": "Hash table",
        "mongolian_description": "Hash table нь хүснэгт бүтцийн өгөгдлийн арга юм. Өгөгдөл нь хүснэгтэнд хадгалагдаж байдаг ба математик тооцоо болон мэдээллийг нэг талбар дээр ашиглан байршилыг бий болгодог.  Үүний ачаар мэдээлэлд шууд хандаж болдог."
    },
    {
        "SrNo": "856",
        "english": "Hata model",
        "english_description": "Common name used for the Okamura-Hata model used to predict signal strength levels in land-mobile systems"
    },
    {
        "SrNo": "857",
        "english": "Head crash",
        "mongolian_description": "Head crash гэдэг нь:  Унших болон бичих толгойнууд нь дискний гадаргууд хүрэхийг хэлнэ. Үүнээс болж механизмд маш их хэмжээний хохирол үүсдэг бөгөөд өгөгдлийн алдагдалд оруулдаг. Хувийн компьютеруудад ийм зүйл тохиолдохоос зайлс хийхийн тулд: Компьютерийг нааш цааш хөдөлгөх үед унших болон бичих толгойнууд нь автоматаар аюулгүй байрлалд ордог. "
    },
    {
        "SrNo": "858",
        "english": "Header",
        "mongolian": "Толгой ",
        "mongolian_description": "Баримт бичгийн хуудас бүрийн дээд хэсэгт гарч ирэх текст. "
    },
    {
        "SrNo": "859",
        "english": "Height Above Average Terrain",
        "abbreviation": "HAAT",
        "english_description": "A measure of an antenna's height above average terrain. This value is used by the FCC in determining compliance with height limitations and transmitting powers for high sites."
    },
    {
        "SrNo": "860",
        "english": "Hertz",
        "abbreviation": "Hz",
        "english_description": "A radio frequency measurement (one hertz = one cycle per second)."
    },
    {
        "SrNo": "861",
        "english": "High altitude platform station",
        "abbreviation": "HAPS",
        "english_description": "A station located on an object at an altitude of 20 to 50 km and at a specified, nominal, fixed point relative to the Earth."
    },
    {
        "SrNo": "862",
        "english": "High altitude platform station ",
        "mongolian": "Далайн түвшнээс дээш  өндөрлөг платформ станц",
        "abbreviation": "HAPS",
        "mongolian_description": "Дэлхийн тогтмол цэг болох 20-50 км өндөрт орших обьект бүхий станц."
    },
    {
        "SrNo": "863",
        "english": "High Speed Circuit Switched Data",
        "abbreviation": "HSCSD",
        "english_description": "A circuit-linked technology for higher transmission speeds - up to 57 kilobits per second - primarily in GSM systems."
    },
    {
        "SrNo": "864",
        "english": "Home Location Register",
        "abbreviation": "HLR",
        "english_description": "The functional unit responsible for managing mobile subscribers. Two types of information reside in the HLR: subscriber information and part of the mobile information that allow incoming calls to be routed to the mobile subscriber. The HLR stores the IMSI, MS ISDN number, VLR address, and subscriber data on supplementary services"
    },
    {
        "SrNo": "865",
        "english": "Hop",
        "english_description": "A propagation path between two points on the surface of the Earth, comprising one or more ionospheric reflections but without intermediate reflection by the ground."
    },
    {
        "SrNo": "866",
        "english": "Horizontal directivity pattern",
        "mongolian": "Хөндлөн чиглүүлэлтын диаграмм",
        "mongolian_description": "Антенны чиглүүлэлтийн диаграмм нь хөндлөн хэвтээ гадаргууд оршино."
    },
    {
        "SrNo": "867",
        "english": "Horizontal directivity pattern",
        "english_description": "An antenna directivity diagram in the horizontal plane."
    },
    {
        "SrNo": "868",
        "english": "Horizontal scrolling ",
        "mongolian": "Хэвтээ текст ",
        "mongolian_description": "Дэлгэцэн дээрх хөдөлгөөнт текст "
    },
    {
        "SrNo": "869",
        "english": "Host ",
        "mongolian": "Толгой компьютер ",
        "mongolian_description": "Ихэнхи хүмүүс интернетийн үйлчилгээг  ISP (интернетийн үйлчилгээ үзүүлдэг компани) компаниас авдаг. Хэрэглэгчийн холбогдсон толгой компьютерүүдийг эдгээр компаниуд нийлүүлж байдаг.Толгой компьютер нь холболт  өгөгдлийн сан цахилгаан шуудан вэб хуудас мөн хэрэглэгчийн файлыг зохицуулдаг. Уг толгой компьетэр нь интернет ба хэрэглэгчтэй холбогдсон ба нэг хэрэглэгчийг нөгөөтэй интернетээр холбож чадна."
    },
    {
        "SrNo": "870",
        "english": "Hot key",
        "mongolian": "Залгаастай түлхүүр ",
        "mongolian_description": "Түлхүүр функц нэг бол товчны хослол, үйлдлийг маш хурдасгана жишээ нь цэс рүү орох өөр програм ачааллуулах гэх мэт. Шинэ үйлдэл эхлэхэд цэсний хэсгүүд шаардлагагүй юм."
    },
    {
        "SrNo": "871",
        "english": "Hot link",
        "mongolian": "Халуун холбоос ",
        "mongolian_description": "График эсвэл хэсэг текст , дарж ороход холбогдсон хуудас нээгддэг . нэг бол вэбсайт эсвэл сайт . ихэнхидээ холбоос цахим холбоос гэдгээр нь мэднэ."
    },
    {
        "SrNo": "872",
        "english": "Hot spot",
        "mongolian": "Хэт халах",
        "mongolian_description": "HMTL-д хэсэг графикийг өсгөхөд ашигладаг  дарахад интернетийн өөр хавтастай холбоно."
    },
    {
        "SrNo": "873",
        "english": "Hot spot",
        "mongolian": "Халуун цэг",
        "mongolian_description": "Утасгүй орчинд нийтийн кафе галт тэрэгний буудал онгоцний буудал гэх мэт газар хэрэглэгчид утасгүйгээр интернетийг нөүтбүүк эсвэл бусад төхөөрөмжтэй үнэтэй үнэгүйгээр хэрэглэдэг."
    },
    {
        "SrNo": "874",
        "english": "Hover",
        "mongolian": "Хөвөлзөх,хэлбэлзэх",
        "mongolian_description": "Хулганы заагчыг дэлгэцэн дээрх дүрсэн дээр байрлуулах үйлдэл. Ихэвчлэн вэбсайт ашиглаж байхад хэрэглэнэ,  шинэ цэс нээхэд ашигладаг."
    },
    {
        "SrNo": "875",
        "english": "Hub",
        "mongolian": "Концентратор,төвлөрүүлэгч, удирдах станц, хавтанг залгах үүр",
        "mongolian_description": "Нийтийг сүлжээгээр хангахад ашиглана. Компьютер эсвэл жижиг төрлийн техник хангамж байдаг."
    },
    {
        "SrNo": "876",
        "english": "Human computer interface",
        "mongolian": "Хүн компьютерийн холбоо",
        "mongolian_description": "Хүн ба ком-н харилцан холбоо. Хүн ба ба ком-н системийн хоорондох холбоог тодорхойлсон нэр томъёо. Бусад нэр томъёо : машин хүний харилцан холболт , хэрглэгчийн холболт , хэрэглэгчийн орчин. Эдгээр нэр томъёоны ихэнхи нь хүн болон ком-н хоорондох харилцан холболтыг аль болох амраар хийхийг зорьсон систем байдаг. "
    },
    {
        "SrNo": "877",
        "english": "Hybrid Phase Shift Keying",
        "abbreviation": "HPSK",
        "english_description": "The spreading technique used in the reverse link of 3G systems to reduce the peak-to-average ratio of the signal by reducing zero crossings and 0 degree phase transitions. Also known as Orthogonal Complex Quadrature Phase Shift Keying (OCQPSK). For more information see Agilent application note \"HPSK Spreading for 3G\"."
    },
    {
        "SrNo": "878",
        "english": "Hyper text mark up language ",
        "mongolian": "Веб сайт хийхэд ашигладаг хэл  ",
        "abbreviation": "HTML",
        "mongolian_description": "Тэмдэгт хэл ба мултимедиа файлд зориулж хөгжүүлсэн  WWW гэх мэт."
    },
    {
        "SrNo": "879",
        "english": "Hyperlink",
        "mongolian": "Дээгүүр холбоос ",
        "mongolian_description": "Ихэвчлэн холбоос гэдгээр мэднэ. График эсвэл хэсэг текст , дарж ороход холбогдсон хуудас нээгддэг . нэг бол вэбсайт эсвэл сайт"
    },
    {
        "SrNo": "880",
        "english": "Hypertext  transfer protocol ",
        "mongolian": "Гипертекст дамжуулах протокол",
        "abbreviation": "HTTP",
        "mongolian_description": "мултимедиа файл дамжуулах хүлээн авах интер нет хуудасын протокол . эдгээр вэб хуудсууд нь HTML-с бүрдэнэ."
    },
    {
        "SrNo": "881",
        "english": "Icon",
        "mongolian": "Жижигрүүлсэн дүрс пиктограмм, икон, дүрс зураг ",
        "mongolian_description": "Тэмдэг нь дэлгэцэн дээрх зураг эсвэл тэмдэгт юм дарахад ганц үйлдэл хийнэ .  жишээ нь  шинэ программ нээнэ. "
    },
    {
        "SrNo": "882",
        "english": "Icremental backup",
        "mongolian": "Өсөн нэмэгдэх нөөц",
        "mongolian_description": "Сүүлийн өөрчлөлт хийхийн өмнөх хуулбар , бүрэн нөөцлөсөн эсвэл өмнөх нөөцлөсөнөө нэмсэн."
    },
    {
        "SrNo": "883",
        "english": "Identifier",
        "mongolian": "Ялгуур,танигч, заагч ",
        "mongolian_description": "Прогаммистийн сонгосон програмтай хавсаргасан обьект эсвэл нэр хаяг. Обьект нь утга эсвэл функц үйл ажиллагаа өгөгдлийн төрөл эсвэл өөр программыг тодорхойлсон элементүүд байж болох юм."
    },
    {
        "SrNo": "884",
        "english": "IF statement ",
        "mongolian": "Баримт батлах хуудас,мэдэгдэл,тунхаглал",
        "mongolian_description": "Хэрвээ өгөгдсөн нөхцөл үнэн бол ганц дан комманд хэсэг коммандыг зөвшөөрөх тушаал."
    },
    {
        "SrNo": "885",
        "english": "Image",
        "mongolian": "Дүрс, дүрслэмж ",
        "mongolian_description": "Ком-р боловсруулсан зураг эсвэл график."
    },
    {
        "SrNo": "886",
        "english": "Image compression",
        "mongolian": "Дүрсийн нягтруулга ",
        "mongolian_description": "Зургийг шахсанаар хэмжээ нь багасаж дамжуулахад илүү хурдан болно. Энэ нь тоглож байгаа бичлэг тасалдах эсвэл бичигдсэн видео хуурцаг тасалдах гол чухал хэсэг болдог. Зургийг өндөр хурдаар дамжуулах нь гуйвуулж байдаг."
    },
    {
        "SrNo": "887",
        "english": "Image manipulation",
        "mongolian": "Зураг өөрчлөх",
        "mongolian_description": "Зураг аваад өөр нэг график программ ашиглаж өөрчлөх"
    },
    {
        "SrNo": "888",
        "english": "Image map",
        "mongolian": "Дүрс хуваарилах",
        "mongolian_description": "HTML-д далд холбоостой график. Курсор нэг холбоос дээр байхад , курсорын гаднах  өөрчлөгдөнө.Зургийн өөр хэсэгт дарахад зураг өөр хэсэг рүү интернетээр аваачна."
    },
    {
        "SrNo": "889",
        "english": "Immediate access store",
        "mongolian": "Шууд холболт ",
        "mongolian_description": "Санах ой бол   ком-н системийн  өгөгдөл болон зааварчилгааг төв процессорт мөн төв процессорт өгөгдөл хийх хэсэг юм. Ком-н санах ой нь маш их тооны дугаарласан үүрнээс тогтоно. Үүр бүр нь давтагдашгүй хаягтай төв процессор үүнийг хаягаар нь танина.Эдгээр үүрүүдийг шууд төв процессороос дугаарлаж болох ба үүнийг үндсэн санах ой гэнэ.,шуурхай санах ой эсвэл анхдагч санах ой. Шуурхай санах ой нь ком тэжээлээс салахад идэвхигүй болно."
    },
    {
        "SrNo": "890",
        "english": "Implementation",
        "mongolian": "Хэрэгжүүлэлт ",
        "mongolian_description": "Ком-н системийн ажиллагааны бүтцийн процесс нь системийн дизайны хэрэгжүүлэлт."
    },
    {
        "SrNo": "891",
        "english": "Import",
        "mongolian": "Гаднаас авах",
        "mongolian_description": "Өөр программ хангамжаас өгөгдөл унших"
    },
    {
        "SrNo": "892",
        "english": "Improved Mobile Telephone Service",
        "abbreviation": "IMTS",
        "english_description": "A further development of the Mobile Telephone Service (MTS) introduced by the Bell System. This version of mobile service add channels and features, such as automatic dialing, and was the forerunner to the AMPS system."
    },
    {
        "SrNo": "893",
        "english": "Inbox",
        "mongolian": "Ирсэн",
        "mongolian_description": "Майл ирэхэд зориулагдсан сан."
    },
    {
        "SrNo": "894",
        "english": "Inclination",
        "english_description": "(Rec. S.673) The angle between the plane of the orbit of a satellite and the principal reference plane.",
        "description": "Note – By convention, the inclination of a direct orbit of a satellite is an acute angle and the inclination of a retrograde orbit is an obtuse angle."
    },
    {
        "SrNo": "895",
        "english": "Incompatible",
        "mongolian": "Үл нийцсэн, нийцэхгүй, таарахгүй ",
        "mongolian_description": "Нэг зүйл нь ажиллахаа байх жишээ нь программ хангамж нь бусадтайгаа ажиллахгүй байх. WINDOWS дээр ажиллаж байгаа программ MAC дээр ажиллахгүй байх, учир нь 2 систем хоорондоо таардаггүй. Энэ нь үргэлж техник хангамжид болдог."
    },
    {
        "SrNo": "896",
        "english": "Inconsistent data",
        "mongolian": "Нийцэхгүй мэдээ",
        "mongolian_description": "Тохирохгүй өгөгдөл нь хайх процесс нь буруу болсон хэрэв хоёр холбоотой өгөгдөл буруу холбоосоор холбогдсон үед жишээ нь хэрвээ хүн."
    },
    {
        "SrNo": "897",
        "english": "Increment",
        "mongolian": "Өсөлт, ихсэлт, нэмэгдэлт",
        "mongolian_description": "Нэг нэгжээр нэмэх"
    },
    {
        "SrNo": "898",
        "english": "Indent",
        "mongolian": "Баруун тийш догол мөр ",
        "mongolian_description": "Текстийн байрлах зай баруун зүүнээс авах зай. Үгтэй ажиллаж байхад ихэвчлэн ашиглана танилцуулаг гэх мэт "
    },
    {
        "SrNo": "899",
        "english": "Index page",
        "mongolian": "Индекс хуудас",
        "mongolian_description": "Вэб хуудас хуудасны индекс нь эхний хуудас байдаг. Анх өгөгдсөнөөрөө уншина "
    },
    {
        "SrNo": "900",
        "english": "Indirect distribution",
        "english_description": "Use of a satellite link of the fixed-satellite service to relay broadcasting programmes from one or more points of origin to various earth stations for further distribution to the terrestrial broadcasting stations (possibly including other signals necessary for their operation)."
    },
    {
        "SrNo": "901",
        "english": "Individual reception",
        "english_description": "The reception of emissions from a space station in the broadcasting-satellite service by simple domestic installations and in particular those possessing small antenna."
    },
    {
        "SrNo": "902",
        "english": "Infection",
        "mongolian": "Халдвар",
        "mongolian_description": "Вирус өөрийгөө компьютерийн системруу хуулахад тохиолддог ихэнхдээ хард диск руу  "
    },
    {
        "SrNo": "903",
        "english": "Infix notation",
        "mongolian": "Тэмдэглэгээ оруулах",
        "mongolian_description": "Тэмдэглэгээ оруулах нь оперотороос опероторын хооронд байршуулна. А-с Б "
    },
    {
        "SrNo": "904",
        "english": "Information",
        "mongolian": "Мэдээлэл",
        "mongolian_description": "Мэдээлэл гэдэг нь хайлтын үйл явцын үр дүн, боловсруулсан зохион байгуулсан өгөгдөл гэх мэт утга агуулсан өгөгдөл"
    },
    {
        "SrNo": "905",
        "english": "Information and communication technology ",
        "mongolian": "Мэдээлэл, харилцаа холбооны технологи",
        "abbreviation": "ICT",
        "mongolian_description": "Ерөнхийдөө ком-н болон холбооны технологийн хэрэглээний нэр томъёо."
    },
    {
        "SrNo": "906",
        "english": "Information and learning technology ",
        "mongolian": "Мэдээлэл, сургалтын технологи",
        "abbreviation": "ILT",
        "mongolian_description": "Мэдээлэл болон холбооны технологийн сурах болон заах технологи. "
    },
    {
        "SrNo": "907",
        "english": "Information manager",
        "mongolian": "Мэдээллийн менежер",
        "mongolian_description": "өгөгдөл боловсруулах процесст , мэдээллийг зохион байгуулагч нь ком –н системийг зохицуулагчтай хэрхэн хэн холбох вэ гэдгийг хэлж байгаа юм. "
    },
    {
        "SrNo": "908",
        "english": "Information processing",
        "mongolian": "Мэдээлэл боловсруулах",
        "mongolian_description": "Зохион байгуулалт , мэдээллийн тасалдуулга мөн арга зам. Эдгээр үйл ажиллагаа нь бүх ком хэрэглэгчдэд чухал, "
    },
    {
        "SrNo": "909",
        "english": "Information retrevial",
        "mongolian": "Мэдээлэл олж авах",
        "mongolian_description": "Хэрэгтэй мэдээллийг их багтаамжаас өгөгдлийн баазд шахахыг хэлнэ. Үргэлж хүснэгт болон төрлөөр нь ялгаж соортлодог. Их хэмжээтэй өгөгдлийг хайхад амар үр дүн гардаг болно."
    },
    {
        "SrNo": "910",
        "english": "Information superhighway",
        "mongolian_description": "Интернетийн холболтын хурд нь илүү өндөр.  Ингэж нэрлэсний учир нь их хэжээтэй өгөгдлийг хэрэглэгчдийн хооронд маш хурдан холбож өгдөгт байгаам."
    },
    {
        "SrNo": "911",
        "english": "Information technology",
        "mongolian": "Мэдээлэлийн технологи ",
        "mongolian_description": "Ерөнхийдөө ком-уудыг бүрхэж мөн хооронд холбодог"
    },
    {
        "SrNo": "912",
        "english": "Infra red communication",
        "mongolian": "Хэт улаан туяаны холболт",
        "mongolian_description": "Хэт улаан туяаны холболт нь телевизийн удирдлагатай адилхан зарчимтай системтэй юм. Робот төхөөрөмж болон мөн алсын гар удирдахад ашиглана. Хүлээн авагч болон дамжуулагчын хоорондох байршил үл хамааран  чиглэлгүй дамжуулна."
    },
    {
        "SrNo": "913",
        "english": "Initialise",
        "mongolian": "Эхлүүлэх",
        "mongolian_description": "Анхны утгыг өгнө."
    },
    {
        "SrNo": "914",
        "english": "Ink cartridge",
        "mongolian": "Бэхний бортого",
        "mongolian_description": "Бэхний бортого нь бэхт принтер болон бэхээр принтлэхэд ашиглагдана."
    },
    {
        "SrNo": "915",
        "english": "Inkjet printer",
        "mongolian": "Бэхэн хэвлэгч",
        "mongolian_description": "Жижиг бөмбөгүүдийг хурдан хатаах замаар хэвлэдэг хэвлэгч. Бэх нь жижиг саванд байна бэхний бортого эсвэл хэвлэгч бортогог гэнэ. Хэвлэгдсэн дүрс нь бортогоноос гарсан бэхээр цаасан дээр нүхлэн цэг болгон будсан байна. Зураг болон текст хэвлэж яадна. Нэг өнгийн хэвлэгч нь саарал өнгөний сүүдэр болон харыг диаграммаар нь хэвлэдэг. Өнгөт принтер нь дөрвөн төрлийн бортоготой  шар хар хөх , хар , цагаан , фусин ."
    },
    {
        "SrNo": "916",
        "english": "In-Phase",
        "abbreviation": "I",
        "english_description": "For PSK modulation, the reference phase channel. See also Q."
    },
    {
        "SrNo": "917",
        "english": "Input",
        "mongolian": "Оролт ",
        "mongolian_description": "Компьютерт өгөгдөл оруулах үйл явц."
    },
    {
        "SrNo": "918",
        "english": "Input device",
        "mongolian": "Оролтын төхөөрөмж",
        "mongolian_description": "Өгөгдөл оруулах ком-н систем гар , хулгана , мэдрэгчтэй дэлгэц , скайннер , эсвэл микрофон."
    },
    {
        "SrNo": "919",
        "english": "Insert",
        "mongolian": "Оруулах",
        "mongolian_description": "Шинэ өгөгдөл оруулах өмнөх өгүүлбэр дээрээ нэмж."
    },
    {
        "SrNo": "920",
        "english": "Insert disk ",
        "mongolian": "Оруулах диск ",
        "mongolian_description": "CD гээ CD эсвэл DVD уншигч руу хийх явц."
    },
    {
        "SrNo": "921",
        "english": "Install",
        "mongolian": "Суулгах",
        "mongolian_description": "Өөрийнхөө системд шинэ программ техник хангамж таниулж өгөх."
    },
    {
        "SrNo": "922",
        "english": "Installation",
        "mongolian": "Суулгалт,тавилт,төхөөрөмж",
        "mongolian_description": "шинэ программ техник хангамж таниулж өгөх процесс."
    },
    {
        "SrNo": "923",
        "english": "Installation disk",
        "mongolian": "Суулгалт диск",
        "mongolian_description": "Дискээр таниулах үйл явц , хэрэглээний прогррам эсвэл шинэ техникийн драйвер."
    },
    {
        "SrNo": "924",
        "english": "Integrated Services Digital Network.",
        "abbreviation": "ISDN",
        "english_description": "A technology offering switched and fixed high speed transmission of voice, data and video through the existing telephone infrastructure. The service is based on 1 or more 64 kbps digital channels and does not use traditional modems."
    },
    {
        "SrNo": "925",
        "english": "Intellectual Property Rights",
        "abbreviation": "IPR",
        "english_description": "Also known as patents, these are the rights of an inventor or assignee to develop and commercialize an invention and license it, usually for a fee, to other manufacturers."
    },
    {
        "SrNo": "926",
        "english": "Intelligent Network",
        "abbreviation": "IN",
        "english_description": "Often referred to as the Advanced Intelligent Network, this is a network of equipment, software and protocols used to implement features on the network and support switching and control functions."
    },
    {
        "SrNo": "927",
        "english": "Interfering source",
        "english_description": "An emission, radiation, or induction which is determined to be a cause of interference in a radiocommunication system."
    },
    {
        "SrNo": "928",
        "english": "Interleaved",
        "english_description": "In a given set of radio channels, this term refers to the insertion of additional channels between the main channels (or each RF channel and its adjacent channels), the characteristic frequencies of the additional channels being different from those of the main channels by a specified value, generally a significant portion (e.g. one half) of the nominal channel spacing."
    },
    {
        "SrNo": "929",
        "english": "Interleaving",
        "english_description": "The process of spreading a block of data over a wider time frame by placing data bits from other data blocks in between the original data bits in the block. Interleaving is frequently done in digital system to spread the data so that bits from the same block are not contiguous and bit errors are randomized to the point FEC is more effective. Systems using this technique are more likely to withstand Rayleigh and other bursty fading and interference phenomenon."
    },
    {
        "SrNo": "930",
        "english": "Intermediate Frequency",
        "abbreviation": "IF",
        "english_description": "The operating frequency in superheterodyne receivers where amplification, filtering and level control prior to demodulation is accomplished."
    },
    {
        "SrNo": "931",
        "english": "intermodulation products (of a transmitting station)",
        "english_description": "Each spectral component produced by intermodulation at one of the combination frequencies: f = pf1 + qf2 + rf3 . . . where p, q, r are positive, negative or nil integers and where f1, f2, . . . are the frequencies of the various oscillations existing in a transmitting station, such as the carrier frequencies of the different transmitters, the sub-carrier or local oscillation frequencies, the frequencies of sidebands due to modulation, etc., where the sum | p | + | q | + | r | + . . . is the order of an individual intermodulation product."
    },
    {
        "SrNo": "932",
        "english": "International Atomic Time",
        "abbreviation": "TAI",
        "english_description": "The time scale established by the Bureau international des poids et mesures (BIPM) on the basis of data from atomic clocks operating in several establishments conforming to the definition of the second, the unit of time of the International System of Units (SI)."
    },
    {
        "SrNo": "933",
        "english": "International Mobile Station Equipment Identity",
        "abbreviation": "IMEI",
        "english_description": "An identification number assigned to GSM mobile stations that uniquely identifies each one. It is a 15 digit serial number that contains a type approval code, final assembly code and serial number."
    },
    {
        "SrNo": "934",
        "english": "International Mobile Station Identity",
        "abbreviation": "IMSI",
        "english_description": "A unique 15 digit number assigned to a mobile station at the time of service subscription. It contains a mobile country code, a mobile network code, mobile subscriber identification number, and a national mobile subscriber identity."
    },
    {
        "SrNo": "935",
        "english": "International Mobile Telecommunication 2000",
        "abbreviation": "IMT-2000",
        "english_description": "A term used by the International Telecommunication Union, a United Nations agency, to describe the third generation mobile telephony due to be ready in 2000. Can also be applied to mobile telephone standards that meet a number of requirements in terms of transmission speed and other factors."
    },
    {
        "SrNo": "936",
        "english": "International Telecommunications Union",
        "abbreviation": "ITU",
        "english_description": "A United Nations agency that deals with telecommunications issues."
    },
    {
        "SrNo": "937",
        "english": "Internet capability",
        "english_description": "Functionality in a wireless network enabling access to the Internet for web page viewing and e-mail purposes."
    },
    {
        "SrNo": "938",
        "english": "Internet Messaging Access Protocol",
        "abbreviation": "IMAP4",
        "english_description": "A remote mailbox access protocol. It enables efficient operation such as downloading only essential data by first acquisitioning the e-mail header prior to actual e-mail download. This feature makes the protocol well suited to remote environments."
    },
    {
        "SrNo": "939",
        "english": "Internet Mode",
        "abbreviation": "i-mode",
        "english_description": "A wireless service launched in Japan in spring 1999 by NTT DoCoMo. The service is accessed by a wireless packet network (PDC-P) and the contents are described in a subset of the HTML language."
    },
    {
        "SrNo": "940",
        "english": "Internet Protocol",
        "abbreviation": "IP",
        "english_description": "A set of instructions defining how information is handled as it travels between systems across the Internet."
    },
    {
        "SrNo": "941",
        "english": "Internet Protocol version 6.",
        "abbreviation": "IPv6",
        "english_description": "The latest IP version. Address exhaustion is prevented by means of a long address field, thereby enabling further Internet expansion. In addition, security and mobility are built into the protocol. Currently utilized IP addresses are almost all IPv4, and with the present rate of Internet growth this type of address will be exhausted by 2010. IPv6 on the other hand enables 10 to the 29th power more available addresses than the previous IPv4."
    },
    {
        "SrNo": "942",
        "english": "Inter-network connection protocol for connecting systems based on both analog and digital US standards.",
        "abbreviation": "IS-41",
        "english_description": "Inter-network connection protocol for connecting systems based on both analog and digital US standards."
    },
    {
        "SrNo": "943",
        "english": "Inter-satellite link",
        "english_description": "A radio link between a transmitting space station and a receiving space station without an intermediate earth station."
    },
    {
        "SrNo": "944",
        "english": "Inter-Symbol Interference",
        "abbreviation": "ISI",
        "english_description": "An interference effect where energy from prior symbols in a bit stream is present in later symbols. ISI is normally caused by filtering of the data streams."
    },
    {
        "SrNo": "945",
        "english": "Interworking Function",
        "abbreviation": "IWF",
        "english_description": "A technique for interfacing data between a wireless system and the telephone network. It usually involves the use of modems or data terminal adapters to convert the data transmitted over the air interface and mobile network to a format that can be recognized and carried by the public telecommunications network."
    },
    {
        "SrNo": "946",
        "english": "Ionosphere",
        "english_description": "That part of the upper atmosphere characterized by the presence of ions and free electrons mainly arising from photo-ionization, the electron density being sufficient to produce significant modification of the propagation of radio waves in certain frequency bands.",
        "description": "Note – The Earth’s ionosphere extends approximately from a height of 50 km to a height of 2 000 km"
    },
    {
        "SrNo": "947",
        "english": "Ionospheric propagation",
        "english_description": "Radio propagation involving the ionosphere."
    },
    {
        "SrNo": "948",
        "english": "Ionospheric reflection (propagation by) ",
        "english_description": "Ionospheric propagation at a sufficiently low frequency that, for given conditions, transionospheric propagation is not possible; the radio wave is then subject to progressive refraction which, when considered from a sufficiently large distance, may be considered as equivalent to reflection from a hypothetical surface"
    },
    {
        "SrNo": "949",
        "english": "Ionospheric scatter propagation",
        "english_description": "Ionospheric propagation involving scatter from irregularities in the electron density in the ionosphere."
    },
    {
        "SrNo": "950",
        "english": "Ionospheric wave",
        "english_description": "A radio wave returned to the Earth by ionospheric reflection."
    },
    {
        "SrNo": "951",
        "english": "kiloHertz",
        "abbreviation": "kHz",
        "english_description": "A radio frequency measurement (one kilohertz = one thousand cycles per second)."
    },
    {
        "SrNo": "952",
        "english": "Land mobile station",
        "english_description": "A mobile station in the land mobile service capable of surface movement within the geographical limits of a country or continent."
    },
    {
        "SrNo": "953",
        "english": "Land station",
        "english_description": "A station in the mobile service not intended to be used while in motion."
    },
    {
        "SrNo": "954",
        "english": "Land station ",
        "mongolian": "Газрын станц",
        "mongolian_description": "Тодорхой цэгт бус, хөдөлгөөнт үед ашиглах зориулалттай гар утасны үйлчилгээт станц."
    },
    {
        "SrNo": "955",
        "english": "Least Significant Bit",
        "abbreviation": "LSB",
        "english_description": "In a binary coding scheme, the bit having the least numerical value. Analogous to the units position in a decimal number."
    },
    {
        "SrNo": "956",
        "english": "Lee's model",
        "english_description": "A slope-intercept propagation prediction model developed at Bell Laboratories and popularized by William Lee. The model assumes an initial condition at a short distance from a base station and uses that as one end of a slope intercept model to predict path loss between a base station and a mobile unit."
    },
    {
        "SrNo": "957",
        "english": "Left-hand polarization, counter-clockwise polarization",
        "english_description": "An elliptical polarization for which the electric flux-density vector observed in any fixed plane not containing the direction of propagation, whilst looking in this direction, rotates with time in a left-hand or counter-clockwise direction."
    },
    {
        "SrNo": "958",
        "english": "Left-hand-polarization counter-clock wise polarization",
        "mongolian": "Зүүн гарын дагуу туйлшрах, цагын зүүний эсрэг туйлшрах ",
        "mongolian_description": "Тогтмол туйлшралын хөдөлгөөний чиглэл нь вектор,богинхон нигтралтай тархалтын түвшин багтаамжгүй цахилгаанжсан.Энэ чиглэл нь хархад хоорондоо зүүн гарын дагуу цагын зүүний эсрэг чиглэлтэй  ."
    },
    {
        "SrNo": "959",
        "english": "Line of sight",
        "abbreviation": "LOS",
        "english_description": "A description of an unobstructed radio path or link between the transmitting and receiving antennas of a communications system."
    },
    {
        "SrNo": "960",
        "english": "Linear power amplifier",
        "abbreviation": "LPA",
        "english_description": "The final amplification stage in a multicarrier transmitter that has been designed and optimized to produce a linear response. By operating in the linear mode, the amplifier reduces the non-linear effects that produce intermodulation products and side-lobe spectra that cause adjacent channel interference."
    },
    {
        "SrNo": "961",
        "english": "Linear Predictive Coding",
        "abbreviation": "LPC",
        "english_description": "A speech encoding scheme that uses periodic pulses to excite a filter, similar to the way human voice is produced. The code is predictive in that it uses knowledge of past data (represented as vectors) to predict future values in a feed forward manner."
    },
    {
        "SrNo": "962",
        "english": "Line-of-sight propagation",
        "english_description": "Propagation between two points for which the direct ray is sufficiently clear of obstacles for diffraction to be of negligible effect."
    },
    {
        "SrNo": "963",
        "english": "Line-of-sight-propagation",
        "mongolian": "Тархалтын шугам",
        "mongolian_description": "Тархалтын цацрагын чиглэл нь хорондоо 2 цэгээс хангалттайгаар чөлөөтэй диффракц үүсгэдэг."
    },
    {
        "SrNo": "964",
        "english": "Link",
        "english_description": "The radio connection between a transmitter and a receiver."
    },
    {
        "SrNo": "965",
        "english": "Link budget",
        "english_description": "A calculation involving the gain and loss factors associated with the antennas, transmitters, transmission lines and propagation environment used to determine the maximum distance at which a transmitter and receiver can successfully operate."
    },
    {
        "SrNo": "966",
        "english": "Local Area Network",
        "abbreviation": "LAN",
        "english_description": "A small data network covering a limited area, such as within a building or group of buildings."
    },
    {
        "SrNo": "967",
        "english": "Local Multipoint Distribution System",
        "abbreviation": "LMDS",
        "english_description": "The name given to point-to-multipoint systems operating at 29 GHz and carrying high speed digital traffic. These systems are usually laid out like cellular systems and are currently being used by entrepreneurs to provide competitive services to the local telephone companies."
    },
    {
        "SrNo": "968",
        "english": "Location Area Identity",
        "abbreviation": "LAI",
        "english_description": "Information carried in the SIM of GSM handsets that identify the subscriber's home area. This is used for billing and sub-net operation purposes."
    },
    {
        "SrNo": "969",
        "english": "Location registration",
        "english_description": "One of several computer databases used to maintain location and other information on mobile subscribers. See HLR and VLR."
    },
    {
        "SrNo": "970",
        "english": "Logical channel",
        "english_description": "A communications channel derived from a physical channel. A physical channel, i.e. RF channel, typically carries a data stream that contains several logical channels. These usually include multiple control and traffic channels."
    },
    {
        "SrNo": "971",
        "english": "Loss of signal",
        "abbreviation": "LOS",
        "english_description": "A description of an unobstructed radio path or link between the transmitting and receiving antennas of a communications system."
    },
    {
        "SrNo": "972",
        "english": "Loss relative to free space",
        "english_description": "The difference, between the basic transmission loss and the free-space basic transmission loss, expressed in decibels.",
        "description": "Note 1 – The loss relative to free space may be expressed by: Lm = Lb – Lbf dB (5) Note 2 – Loss relative to free space may be divided into losses of different types, such as: – absorption loss for example by ionospheric, atmospheric gases or hydrometeors; – diffraction loss as for ground waves; – effective reflection or scattering loss, as in the ionospheric case including the results of any focusing or defocusing due to curvature of a reflecting layer; – polarization coupling loss, which can arise from any polarization mismatch between the antennas for the particular ray path considered; – aperture to medium coupling loss or antenna gain degradation, which may be due to substantial scattering phenomena on the path; – losses due to phase interference between the direct ray and rays reflected from the ground, other obstacles or atmospheric layers."
    },
    {
        "SrNo": "973",
        "english": "Low Noise Amplifier",
        "abbreviation": "LNA",
        "english_description": "A receive preamplifier having very low internal noise characteristics placed very near the antenna of a receiver to capture the C/N before it can be further degraded by noise in the receiving system."
    },
    {
        "SrNo": "974",
        "english": "lowest useful frequency",
        "abbreviation": "LUF",
        "english_description": "The lowest frequency that would permit acceptable performance of a radio circuit by signal propagation via the ionosphere between given terminals below the ionosphere at a given time under specified working conditions.",
        "description": "Note – See Notes 1 and 2 of term G30 “operational MUF”."
    },
    {
        "SrNo": "975",
        "english": "Macro cell",
        "english_description": "A large cell in a wireless system capable of covering a large physical area. Macrocells are used in rural areas and other areas where subscriber or traffic densities are low."
    },
    {
        "SrNo": "976",
        "english": "Major Trading Area",
        "abbreviation": "MTA",
        "english_description": "A geographic area over which a PCS operator is licensed to provide service. MTAs are a group of BTAs having common financial, commercial and economic ties and were first used to license PCS service in the middle '90s. MTAs can be many times larger a cellular MSA and can cross multiple state lines in some instances. MTAs are used by the Rand-McNally corporation to summarize economic data. MTAs are one of the largest licensing areas used by the FCC."
    },
    {
        "SrNo": "977",
        "english": "Matched filter",
        "english_description": "The receiver filter with impulse response equal to the timereversed, complex conjugate impulse response of the combined transmitter filter-channel impulse response."
    },
    {
        "SrNo": "978",
        "english": "Mean Opinion Score",
        "abbreviation": "MOS",
        "english_description": "A statistical rating and scoring technique used to rate the performance of telephone connections by users."
    },
    {
        "SrNo": "979",
        "english": "Mean power",
        "mongolian": "Дундаж чадал",
        "mongolian_description": "Дундаж чадал нөөцөнд антены нэвтрүүлэх шугамаар хангалттай цаг нам давтамж өндөр давтамжийн уртын харьцуулахад үүссэн нормаль үйлдэлийн горимууд."
    },
    {
        "SrNo": "980",
        "english": "Mean power",
        "english_description": "The average power supplied to the antenna transmission line by a transmitter during an interval of time sufficiently long compared with the lowest frequency encountered in the modulation taken under normal operating conditions."
    },
    {
        "SrNo": "981",
        "english": "Medium Access Control",
        "abbreviation": "MAC",
        "english_description": "The protocols that arbitrate access between all nodes of a wireless LAN."
    },
    {
        "SrNo": "982",
        "english": "Mega Chips per Second",
        "abbreviation": "Mcps",
        "english_description": "A measure of the number of bits (chips) per second in the spreading sequence of direct sequence spreading code"
    },
    {
        "SrNo": "983",
        "english": "Megahertz",
        "abbreviation": "MHz",
        "english_description": "A unit of frequency equal to one million hertz or cycles per second. Wireless communications occur in the 800 MHz, 900 MHz and 1900 MHz bands."
    },
    {
        "SrNo": "984",
        "english": "Metropolitan Statistical Area",
        "abbreviation": "MSA",
        "english_description": "A geographic area over which a cellular operator is licensed to provide service. MSAs are groups of counties in metropolitan areas having common financial, commercial and economic ties and were first used to license cellular service in the early '80s. MSAs cross state lines in some instances. MSAs were first used by the Dept. of Commerce to collect economic data."
    },
    {
        "SrNo": "985",
        "english": "Micro cell",
        "english_description": "A base station with a very small coverage area designed to provide service in areas having a very high density of mobile subscribers. Microcells are traditionally used in convention centers, airports and similar areas."
    },
    {
        "SrNo": "986",
        "english": "Minimum Shift Keying",
        "abbreviation": "MSK",
        "english_description": "A modulation technique using sinusoidal shaped input data pulses to drive the phase modulator. This results in a linear phase change over conventional QPSK, resulting in lower side lobes and less adjacent channel interference performance."
    },
    {
        "SrNo": "987",
        "english": "Minimum usable field-strength, [minimum usable power flux-density]",
        "english_description": "Minimum value of the field-strength [minimum value of the power flux-density] necessary to permit a desired reception quality, under specified receiving conditions, in the presence of natural and man-made noise, but in the absence of interference from other transmitters.",
        "description": "Note 1 – The desired quality is determined in particular by the protection ratio against noise, and for fluctuating noise, by the percentage of time during which this protection ratio must be ensured. Note 2 – The receiving conditions include, inter alia: – the type of transmission, and frequency band used; – the receiving equipment characteristics (antenna gain, receiver characteristics, siting, etc.); – receiver operating conditions, particularly the geographical zone, the time and the season. Note 3 – Where there is no ambiguity, the term “minimum field-strength” [“minimum power flux-density”] may be used. Note 4 – The term “minimum usable field-strength” corresponds to the term “minimum fieldstrength to be protected” which appears in many ITU texts."
    },
    {
        "SrNo": "988",
        "english": "Mobile Application Part",
        "abbreviation": "MAP",
        "english_description": "A protocol using the lower level layers of the SS7 protocol stack (TCAP, SCCP and MTP) for communication between the various registers and other MSCs."
    },
    {
        "SrNo": "989",
        "english": "Mobile Assisted Handoff",
        "abbreviation": "MAHO",
        "english_description": "A handoff technique involving feedback from the mobile station as part of the handoff process. The feedback is usually in the form of signal level and quality measurements on the downlink and signal level measurements from neighbor cells."
    },
    {
        "SrNo": "990",
        "english": "Mobile Identification Number",
        "abbreviation": "MIN",
        "english_description": "A unique identification number given to a mobile unit. In most cases, this number is the telephone number of the handset. In the case of analog cellular, the MIN is used to route the call. In most second generation system, the system assigns temporary numbers to the handset to route calls as a security precaution. See also TMSI."
    },
    {
        "SrNo": "991",
        "english": "Mobile Media Mode",
        "abbreviation": "MMM",
        "english_description": "The WWW:MMM logo is a marketing innovation comprising a unifying industry-wide marketing symbol representing leading edge web-based products and services."
    },
    {
        "SrNo": "992",
        "english": "Mobile phone network",
        "english_description": "A network of cells. Each cell is served by a radio base station from where calls are forwarded to and received from your mobile phone by wireless radio signals."
    },
    {
        "SrNo": "993",
        "english": "Mobile service",
        "mongolian": "Гар утасны сүлжээ",
        "mongolian_description": "Гар утас болон газрын станцын хооронд буюу хөдөлгөөнт станцууд хоорондын  Радио холбооны үйлчилгээ."
    },
    {
        "SrNo": "994",
        "english": "Mobile station",
        "mongolian": "Хөдөлгөөнт станц",
        "mongolian_description": "Гар утасны хөдөлгөөнт үйлчилгээг  тодорхойгүй цэгт ажиллуулах болон зогсоох зорилготой."
    },
    {
        "SrNo": "995",
        "english": "Mobile station",
        "english_description": "A station in the mobile service intended to be used while in motion or during halts at unspecified points.",
        "description": "Note 1 – Mobile service; Service mobile; Servicio móvil (CV 1003) (RR. 1.24). A radiocommunication service between mobile and land stations, or between mobile stations. (CV) Note 2 – The definitions of those categories of stations in mobile services, which are most useful for Radiocommunication Study Group 8 work are given in Appendix A to this Recommendation"
    },
    {
        "SrNo": "996",
        "english": "Mobile Station",
        "abbreviation": "MS",
        "english_description": "The term used to describe the customer terminal in a wireless network."
    },
    {
        "SrNo": "997",
        "english": "Mobile Switching Center",
        "abbreviation": "MSC",
        "english_description": "The location providing the mobile switching function in a second generation network wireless network. The MSC switches all calls between the mobile and the PSTN and other mobiles."
    },
    {
        "SrNo": "998",
        "english": "Mobile Telephone Switching Office",
        "abbreviation": "MTSO",
        "english_description": "The location providing the mobile switching function in a first generation wireless network. The MTSO switched all calls between the mobile and the PSTN and other mobiles."
    },
    {
        "SrNo": "999",
        "english": "Modification",
        "mongolian": "Хаягийн өөрчлөлт ",
        "mongolian_description": "Хаяг нь тооны ухаан учир зүй өгүүлбэр зүйн үйлдэл гүйцэтгэдэг Cf;-үр дүнтэй хаяг жагсаалтай хаяг уялдаатай  хаяг "
    },
    {
        "SrNo": "1000",
        "english": "Modulation",
        "english_description": "The process of coding and decoding information for transmission. For example, a voice conversation is coded into binary bits (digital information), transmitted and then decoded at the receiving end."
    },
    {
        "SrNo": "1001",
        "english": "Most Significant Bit",
        "abbreviation": "MSB",
        "english_description": "In a binary coding scheme, the bit having the greatest numerical value. Analogous to the left-most numeric position in a decimal number."
    },
    {
        "SrNo": "1002",
        "english": "Moving Picture Experts Group",
        "abbreviation": "MPEG",
        "english_description": "The group that has defined the standards for compressed video transmission. Can also refer to the file format itself."
    },
    {
        "SrNo": "1003",
        "english": "Moving Picture Experts Group Compression Standard Version 4.",
        "abbreviation": "MPEG4",
        "english_description": "MPEG4 is a technology for compressing voice, video and related control data and is one of the MPEG (Moving Picture Experts Group) international standards. It is currently a focus of attention due to the fact that it enables high speed and stable video transmission even in heretofore difficult environments such as mobile communication. Incorporation of this leading edge technology will imbue 3G terminals with a rich multimedia capability."
    },
    {
        "SrNo": "1004",
        "english": "Multi-Carrier Code Division Multiple Access",
        "abbreviation": "MC-CDMA",
        "english_description": "Typically, this means the combination of three IS-95 carriers to form one wideband carrier. It is an evolution of IS-95 for third generation systems. Also called cdma2000. The current nomenclature is temporary, with a formal name for this technology to be determined under 3GPP2."
    },
    {
        "SrNo": "1005",
        "english": "Multimedia Messaging Service",
        "abbreviation": "MMS",
        "english_description": "MMS is a new standard that is being defined for use in advanced wireless terminals. The service concept is derived from Short Message Service and allows for nonreal-time transmission of various kinds of multimedia contents like images, audio, video clips, etc. As a further evolution of the current text mail, for example, electronic postcards, audio/video clips, etc. can be sent."
    },
    {
        "SrNo": "1006",
        "english": "Multipath",
        "english_description": "A propagation phenomenon characterized by the arrival of multiple versions of the same signal from different locations shifted in time due to having taken different transmission paths of varying lengths."
    },
    {
        "SrNo": "1007",
        "english": "Multipath propagation",
        "mongolian": "Олон сувгийн тархалт ",
        "mongolian_description": "Тархалтын зам нь нэгэн зэрэг хүлээн авч дамжуулах ба цэгээс цэгийн хооронд тусгай тархалтын хэмжээтэй."
    },
    {
        "SrNo": "1008",
        "english": "Multipath propagation",
        "english_description": "Propagation between a transmission point and a reception point over a number of separate propagation paths simultaneously."
    },
    {
        "SrNo": "1009",
        "english": "Multiple access",
        "english_description": "The process of allowing multiple radio links or users to address the same radio channel on a coordinated basis. Typical multiple access technologies include FDMA, TDMA, CDMA, and FHMA."
    },
    {
        "SrNo": "1010",
        "english": "Multi-pulse excited",
        "abbreviation": "MPE",
        "english_description": "A multi-pulse process for determining the position and amplitude of sample pulses in a speech codec."
    },
    {
        "SrNo": "1011",
        "english": "Multi-satellite link",
        "english_description": "A radio link between a transmitting earth station and a receiving earth station through two or more satellites, without any intermediate earth station. A multi-satellite link comprises one up-link, one or more satellite-to-satellite links and one down-link."
    },
    {
        "SrNo": "1012",
        "english": "Narrowband Advanced Mobile Phone System",
        "abbreviation": "N-AMPS",
        "english_description": "Combines the AMPS transmission standard with digital signaling information to effectively triple the capacity of AMPS while adding basic messaging functionality."
    },
    {
        "SrNo": "1013",
        "english": "Necessary bandwidth",
        "english_description": "For a given class of emission, the width of the frequency band which is just sufficient to ensure the transmission of information at the rate and with the quality required under specified conditions."
    },
    {
        "SrNo": "1014",
        "english": "Nested codes",
        "english_description": "A type of concatenated block code where the layers (inner and outer) are amalgamated in such a way that burst errors not able to be corrected by the inner code are sufficiently spread over enough blocks as to be corrected by the outer layer."
    },
    {
        "SrNo": "1015",
        "english": "Network Management Center",
        "abbreviation": "NMC",
        "english_description": "An operations center used to manage network resources such as the MSC, location registers and base stations."
    },
    {
        "SrNo": "1016",
        "english": "Network Switching Subsystem",
        "abbreviation": "NSS",
        "english_description": "That portion of a GSM network that manages the connections and communications within the network. The BSS and OSS complete the major components of the network."
    },
    {
        "SrNo": "1017",
        "english": "Noise",
        "english_description": "Any variable physical phenomenon apparently not conveying information and which may be superimposed on, or combined with, a wanted signal.",
        "description": "Note – The term “radio-frequency noise” is defined in this Recommendation."
    },
    {
        "SrNo": "1018",
        "english": "Noise ",
        "mongolian": "Шуугиан",
        "mongolian_description": "Аливаа хувьсагч нь физик үзэгдэл бололтой мэдээлэл дамжуулах биш, аль ууссан, эсвэл хүссэн дохио, хослуулж байж болох юм."
    },
    {
        "SrNo": "1019",
        "english": "noise figure",
        "english_description": "A figure of merit for receivers and preamplifiers representing the amount of excess noise added to the signal by the amplifier or receiving system itself. The lower the noise figure, the less excess noise is added to the signal."
    },
    {
        "SrNo": "1020",
        "english": "Non Return to Zero",
        "abbreviation": "NRZ",
        "english_description": "A type of data stream where successive data pulses \"ones\" are continuous over several clock cycles without returning to the \"zero\" state between successive \"ones\"."
    },
    {
        "SrNo": "1021",
        "english": "Nordic Mobile Telephony",
        "abbreviation": "NMT",
        "english_description": "The common Nordic standard for analog mobile telephony as established by the telecommunications administrations in Sweden, Norway, Finland and Denmark in the early 1980s. NMT systems have also been installed in some European countries, including parts of Russia, and in the Middle East and Asia. NMT is operated in 450 MHz and 900 MHz bands."
    },
    {
        "SrNo": "1022",
        "english": "Nordic Mobile Telephony - 450",
        "abbreviation": "NMT-450",
        "english_description": "An early cellular system developed and operated in northern Europe utilizing the 450 MHz band."
    },
    {
        "SrNo": "1023",
        "english": "North American Digital Cellular",
        "abbreviation": "NADC",
        "english_description": "See IS-136."
    },
    {
        "SrNo": "1024",
        "english": "Number Assignment Module",
        "abbreviation": "NAM",
        "english_description": "The programmable module in an AMPS analog phone used to contain the MIN, ESN, home system ID and other information."
    },
    {
        "SrNo": "1025",
        "english": "Nyquist filter",
        "english_description": "An ideal low pass filter with a cutoff frequency equal to the sampling rate. This technique is used to convert PAM pulses to an analog signal in D/A converters."
    },
    {
        "SrNo": "1026",
        "english": "Nyquist rate",
        "english_description": "The minimum sampling rate proposed by Nyquist for converting a band limited waveform to digital pulses. The rate must be at least twice the highest frequency of interest in the waveform being sampled."
    },
    {
        "SrNo": "1027",
        "english": "Occupied band",
        "english_description": "The frequency band such that, below the lower and above the upper frequency limits, the mean powers emitted are each equal to a specified percentage β/2 of the total mean power of a given emission. Unless otherwise specified by the ITU-R, for the appropriate class of emission, the value of β/2 should be taken as 0.5%."
    },
    {
        "SrNo": "1028",
        "english": "Occupied bandwidth",
        "english_description": "The width of a frequency band such that, below the lower and above the upper frequency limits, the mean powers emitted are each equal to a specified percentage β/2 of the total mean power of a given emission. Unless otherwise specified by the ITU-R for the appropriate class of emission, the value of β/2 should be taken as 0.5%."
    },
    {
        "SrNo": "1029",
        "english": "Offset",
        "english_description": "In a given set of radio channels, this term refers to a change of the characteristic frequency of a radio-frequency channel in relation to its nominal frequency, by a specified value which is generally small compared to the channel spacing."
    },
    {
        "SrNo": "1030",
        "english": "Offset Quadrature Phase Shift Keying",
        "abbreviation": "OQPSK",
        "english_description": "A type of QPSK modulation that offsets the bit streams on the I and Q channels by a half bit. This reduces amplitude fluctuations and helps improve spectral efficiency."
    },
    {
        "SrNo": "1031",
        "english": "Okamura model",
        "english_description": "A propagation prediction model for land-mobile communications developed by Yoshi Okamuar et al. in the late '60s."
    },
    {
        "SrNo": "1032",
        "english": "Open System Interconnect",
        "abbreviation": "OSI",
        "english_description": "A reference model that describes a layered structure for modeling the interconnection and exchange of information between users in a communications system. The 7 layers are: the physical layer, the link layer, the network layer, the transport layer, the session layer, the presentation layer and the application layer."
    },
    {
        "SrNo": "1033",
        "english": "Operational MUF",
        "english_description": "The highest frequency that would permit acceptable performance of a radio circuit by signal propagation via the ionosphere between given terminals below the ionosphere at a given time under specified working conditions.",
        "description": "Note 1 – Acceptable performance may for example be quoted in terms of maximum error ratio or required signal/noise ratio. Note 2 – Specified working conditions may include such factors as antenna types, transmitter power, class of emission and required information rate."
    },
    {
        "SrNo": "1034",
        "english": "Operations & Maintenance Center",
        "abbreviation": "OMC",
        "english_description": "A location used to operate and maintain a wireless network."
    },
    {
        "SrNo": "1035",
        "english": "Operations, Administration, Maintenance & Provisioning Center",
        "abbreviation": "OAM&P",
        "english_description": "An operations center used to operate, administer, maintain and provision the network."
    },
    {
        "SrNo": "1036",
        "english": "Operator",
        "english_description": "Company that operates a telephone network, for example AT&T, Vodaphone and BT."
    },
    {
        "SrNo": "1037",
        "english": "orbit",
        "english_description": "1. The path, relative to a specified frame of reference, described by the centre mass of a satellite or other object in space, subjected solely to forces of natural origin, mainly the force of gravity. 2. By extension, the path described by the centre of mass of a body in space subjected to forces of natural origin and occasional low-energy corrective forces exerted by a propulsive device in order to achieve and maintain a desired path.",
        "description": "Note – In the Radio Regulations, the above two definitions are combined in the following form (RR No. 1.184): “The path, relative to a specified frame of reference, described by the centre of mass of a satellite or other object in space subjected primarily to natural forces, mainly the force of gravity.”"
    },
    {
        "SrNo": "1038",
        "english": "Order of diversity",
        "english_description": "The number of different radio signals used for diversity reception. For two signals, reception is said to be “double diversity”, and so on."
    },
    {
        "SrNo": "1039",
        "english": "Orthogonal co-channel",
        "english_description": "Refers to the use of the same RF channel by two emissions with orthogonal polarizations, for the transmission of two independent signals."
    },
    {
        "SrNo": "1040",
        "english": "Orthogonal Complex Quadrature Phase Shift Keying",
        "abbreviation": "OCQPSK",
        "english_description": "Also known as HPSK. See HPSK."
    },
    {
        "SrNo": "1041",
        "english": "Orthogonal Frequency Division Multiplex",
        "abbreviation": "OFDM",
        "english_description": "A modulation technique that transmits blocks of symbols in parallel by employing a large number of orthogonal subcarriers. The data is divided into blocks and sent in parallel on separate sub-carriers. By doing this, the symbol period can be increased and the effects of delay spread are reduced."
    },
    {
        "SrNo": "1042",
        "english": "Orthogonal Variable Spreading Function",
        "abbreviation": "OVSF",
        "english_description": "A set of spreading codes derived from tree structured set of orthogonal codes and are used to channelize the IMT2000/ULTRA system."
    },
    {
        "SrNo": "1043",
        "english": "Out-of-band emission",
        "english_description": "Emission on a frequency or frequencies immediately outside the necessary bandwidth which results from the modulation process, but excluding spurious emissions."
    },
    {
        "SrNo": "1044",
        "english": "Output Radio Frequency Spectrum",
        "abbreviation": "ORFS",
        "english_description": "A measurement for GSM signals that tests for interference in the adjacent frequency channels (ARFCNs) and results from two effects: modulation within the bursts and the power that ramps up and down, or switching transients. ORFS is a critical GSM transmitter measurement."
    },
    {
        "SrNo": "1045",
        "english": "Packet",
        "english_description": "A piece of data transmitted over a packet-switching network such as the Internet. A packet includes not just data but also address information about its origination and destination."
    },
    {
        "SrNo": "1046",
        "english": "Packet Assembler/Disassembler",
        "abbreviation": "PAD",
        "english_description": "The part of a packet transmission system that segments the transmit data into packets and returns the receive data to longer messages."
    },
    {
        "SrNo": "1047",
        "english": "Packet radio",
        "english_description": "A radio system that operates by sending data in packets."
    },
    {
        "SrNo": "1048",
        "english": "Packet Reservation Multiple Access",
        "abbreviation": "PRMA",
        "english_description": "PRMA is a packet-based TDMA concept where the users contend for the time slots. In situations where the system is not near capacity, a user can reserve a time slot for future use"
    },
    {
        "SrNo": "1049",
        "english": "Packet switching",
        "english_description": "A method of switching data in a network where individual packets of a set size and format are accepted by the network and delivered to their destinations. The sequence of the packets is maintained and the destination established by the exchange of control information (also contained in the packets) between the sending terminal and the network before the transmission starts. The network is open to all users, all the time, with packets from the various nodes being interleaved throughout the network. The packets can be sent in any order, as the control information sent at the beginning of the transmission ensures they are interpreted in the correct order at the receiving end. Because each packet carries its own control instructions, it can use any route to reach its destination."
    },
    {
        "SrNo": "1050",
        "english": "Pad",
        "english_description": "See attenuator."
    },
    {
        "SrNo": "1051",
        "english": "Paging",
        "english_description": "Single direction radio service for alerting subscribers and delivering messages."
    },
    {
        "SrNo": "1052",
        "english": "Paging Channel",
        "abbreviation": "PCH",
        "english_description": "A logical channel in GSM, cdma2000, and W-CDMA systems used to send messages to mobile station. Used primarily to notify the mobile that it has an incoming call."
    },
    {
        "SrNo": "1053",
        "english": "Palm Query Applications",
        "abbreviation": "PQA",
        "english_description": "An Internet clipping application developed from HTML code and run on Palm PDAs. The application is designed to streamline the flow to the PDA to minimize the number of kilobytes sent and ultimately paid for."
    },
    {
        "SrNo": "1054",
        "english": "Partial response signalling",
        "english_description": "A signalling technique in which a controlled amount of intersymbol interference is introduced at the transmitter to shape the transmitted spectrum."
    },
    {
        "SrNo": "1055",
        "english": "Passive sensor",
        "english_description": "A measuring instrument in the Earth exploration-satellite service or in the space research service by means of which information is obtained by reception of electromagnetic waves of natural origin."
    },
    {
        "SrNo": "1056",
        "english": "Path loss",
        "english_description": "The amount of loss introduced by the propagation environment between a transmitter and receiver."
    },
    {
        "SrNo": "1057",
        "english": "Peak envelope power",
        "english_description": "The average power supplied to the antenna transmission line by a transmitter during one radio frequency cycle at the crest of the modulation envelope taken under normal operating conditions."
    },
    {
        "SrNo": "1058",
        "english": "Peak envelope power ",
        "mongolian_description": "Дундаж чадал үйлдэлийн горим дотор антен нэвтрүүлэх шугамаар дамжуулах туршид давтамж ХИ утгандаа модуляцлагдсан бүрхүүлийг хэлнэ."
    },
    {
        "SrNo": "1059",
        "english": "Peak power",
        "english_description": "The maximum instantaneous power radiated by a pulsed or bursted transmitter. It is the power radiated while the transmitter is keyed or operated."
    },
    {
        "SrNo": "1060",
        "english": "Period",
        "english_description": "The time elapsing between two consecutive passages of a satellite through a characteristic point on its orbit."
    },
    {
        "SrNo": "1061",
        "english": "Personal Access Communications System",
        "abbreviation": "PACS",
        "english_description": "A low mobility low power wireless system designed for residential use."
    },
    {
        "SrNo": "1062",
        "english": "Personal Communications Industry Association",
        "abbreviation": "PCIA",
        "english_description": "A leading international trade association representing the personal communications services (PCS) industry. Its primary objective is to advance regulatory policies, legislation, and technical standards in this industry."
    },
    {
        "SrNo": "1063",
        "english": "Personal Communications Network",
        "abbreviation": "PCN",
        "english_description": "A standard for digital mobile phone transmissions operating at a frequency of 1800 MHz (also referred to as GSM 1800). It is used in Europe and Asia Pacific."
    },
    {
        "SrNo": "1064",
        "english": "Personal Communications Services",
        "abbreviation": "PCS",
        "english_description": "Generally, a marketing term used to describe a wide variety of two-way digital wireless service offerings in North America operating at 1900 MHz. PCS services include next generation wireless phone and communication services, wireless local loop, inexpensive walk-around communications service with lightweight, low-powered handsets, in-building cordless voice services for business, in-building wireless LAN service for business, enhanced paging service as well as wireless services integrated with wired networks. A Personal Communications System refers to the hardware and software that provide communications services."
    },
    {
        "SrNo": "1065",
        "english": "Personal Communications System",
        "abbreviation": "PCS",
        "english_description": "The infrastructure used to provide personal communications services."
    },
    {
        "SrNo": "1066",
        "english": "Personal Data Appliance/Assistant",
        "abbreviation": "PDA",
        "english_description": "Also known as Personal Digital Appliance."
    },
    {
        "SrNo": "1067",
        "english": "Personal Handy Phone",
        "abbreviation": "PHP",
        "english_description": "The mobile hand-set used with the Japanese Personal Handy Phone system."
    },
    {
        "SrNo": "1068",
        "english": "Personal Handy Phone System",
        "abbreviation": "PHS",
        "english_description": "A digitalized evolution of the earlier analog cordless phone concept which enables outdoor use as well. PHS incorporates a unique Japanese standard which melds the advantages of the European DECT and CT2. The system operates in the 1.9 GHz band"
    },
    {
        "SrNo": "1069",
        "english": "Personal Identification Number",
        "abbreviation": "PIN",
        "english_description": "A code used for all GSM-based phones to establish authorization for access to certain functions or information. The PIN code is delivered together with your subscription."
    },
    {
        "SrNo": "1070",
        "english": "Personal or Pacific Digital Cellular",
        "abbreviation": "PDC",
        "english_description": "A Japanese standard for digital mobile telephony in the 800 MHz and 1500 MHz bands. To avoid the previous problem of lack of compatibility between the differing types of earlier analog mobile phones in Japan (i.e. NTT type and US developed TACS type), digital mobile phones have been standardized under PDC. In the case of the PDC standard, primarily six channel TDMA (Time Division Multiple Access) technology is applied. PDC, however, is a standard unique to Japan which renders such phone units incompatible with devices which adopt the more worldwide prevalent GSM standard. Nevertheless, digitalization under the standard enables ever smaller and lighter mobile phones which in turn has spurred market expansion. As a result, over 93% of all mobile phones in Japan are now digital."
    },
    {
        "SrNo": "1071",
        "english": "Phase jitter",
        "english_description": "The amount of uncertainty introduced in digital demodulation caused by imperfections in the clock recovery timing."
    },
    {
        "SrNo": "1072",
        "english": "Phase Locked Loop",
        "abbreviation": "PLL",
        "english_description": "PLL is a major component in the frequency synthesizer scheme. This device provides a wide, flexible range of internal frequency dividers which allow the designer the ability to create a synthesizer to match design requirements."
    },
    {
        "SrNo": "1073",
        "english": "Phase Shift Keying",
        "abbreviation": "PSK",
        "english_description": "A broad classification of modulation techniques where the information to be transmitted is contained in the phase of the carrier wave."
    },
    {
        "SrNo": "1074",
        "english": "Physical channel",
        "english_description": "The actual radio channel that carries the various logical and traffic channels in a wireless system."
    },
    {
        "SrNo": "1075",
        "english": "Pico cell",
        "english_description": "Very small cell in a mobile network for boosting capacity within buildings."
    },
    {
        "SrNo": "1076",
        "english": "Pilot code",
        "english_description": "This is a logical channel in a CDMA system characterized by an unmodulated direct sequence spread-spectrum signal continuously monitored by each base station. It allows the mobile stations to acquire the timing of the forward channel, serves as a phase reference for demodulation, and allows the mobile to search out the best (strongest) base stations for acquisition and hand-off."
    },
    {
        "SrNo": "1077",
        "english": "Pilot pollution",
        "english_description": "A type of co-channel interference in CDMA systems caused when the pilot code from a distant cell or base station is powerful enough to create an interference problem."
    },
    {
        "SrNo": "1078",
        "english": "Polarization",
        "mongolian": "Туйлшрал",
        "mongolian_description": "Огторгуйн орон зайд радио долгионы цахилгаан орны хүчлэгийн вэктор  хэрхэн байрласнаас радио долгионы туйлшрал тодорхойлогдох бөгөөд векторын байрлал нь туйлшралын чиглэлийг тодорхойлно."
    },
    {
        "SrNo": "1079",
        "english": "Polarization",
        "english_description": "To be defined later."
    },
    {
        "SrNo": "1080",
        "english": "Polarization diversity",
        "english_description": "A diversity technique where antennas of different polarizations, I.e. horizontal and vertical, are used to provide diversity reception. The antennas take advantage of the multipath propagation characteristics to receive separate uncorrelated signals."
    },
    {
        "SrNo": "1081",
        "english": "Post Office Code Special Advisory Group",
        "abbreviation": "POCSAG",
        "english_description": "An international group that develops and sets standards for the paging industry."
    },
    {
        "SrNo": "1082",
        "english": "Power Amplifier",
        "abbreviation": "PA",
        "english_description": "A device for taking a low or intermediate-level signal and significantly boosting its power level. A power amplifier is usually the final stage of amplification in a transmitter."
    },
    {
        "SrNo": "1083",
        "english": "Power control",
        "english_description": "A technique for managing the transmit power in base stations and mobiles to a minimum level needed for proper performance. Downlink power control applies to base stations and uplink power control to mobiles. Power control is used in nearly all wireless systems to manage interference, and in the case of mobiles, to extend battery life."
    },
    {
        "SrNo": "1084",
        "english": "Power spectral density",
        "english_description": "Power normalized to 1 Hz. Knowing the power spectral density and system bandwidth, the total power can be calculated."
    },
    {
        "SrNo": "1085",
        "english": "Power Spectral Density",
        "abbreviation": "PSD",
        "english_description": "See power spectral density"
    },
    {
        "SrNo": "1086",
        "english": "Precipitation-scatter propagation",
        "mongolian": "Тархалт эрчимтээ буурах ",
        "mongolian_description": "Агаар мандалын тархалт нь ихэвчилэн борооны усны хэмжүүрээс шууд шалтгаална ."
    },
    {
        "SrNo": "1087",
        "english": "Precipitation-scatter propagation",
        "english_description": "Tropospheric propagation due to scattering caused by hydrometeors, mainly rain."
    },
    {
        "SrNo": "1088",
        "english": "Print",
        "mongolian": "Хэвлэх ",
        "mongolian_description": "Хэвлэмэл материал гаргаж авахын тулд принтер рүү өгөгдөл илгээнэ."
    },
    {
        "SrNo": "1089",
        "english": "Print buffer ",
        "mongolian": "Хэвлэх буфер",
        "mongolian_description": "Принтерийн хэвлэхэд бэлэн болсон өгөгдлийг компьютерийн санах ойн хаанаас хандаж хэвлэхийг заадаг хэсэг юм. Буфер луу өгөгдөл илгээж чадах боловч програмыг идэвхжүүлж, үйлдлийг үргэлжлүүлэн тэмдэгт үсэг хэвлэхийг хүлээдэг. Буфер бол ердийн үдирдлагатай үйлдлийн систем юм. Энэ үйлдлийн систем нь дохиог тасалдуулах замаар бэлэн болсон дараагийн мэдээлэлийг хэвлэх ба принтер нь компьютерээс удаан ажилладаг. Энэ үйлдлийн систем нь мэдээллийг буферт авч, принтер лүү мэдээлэл илгээдэг."
    },
    {
        "SrNo": "1090",
        "english": "Print cartridge ",
        "mongolian": "Картридж",
        "mongolian_description": "Картридж нь хороор хангахад ашиглагддаг."
    },
    {
        "SrNo": "1091",
        "english": "Print job ",
        "mongolian": "Хэвлэх үйл ажиллагаа ",
        "mongolian_description": "Хэвлэх үйл ажиллагааг хийснээр төрөл бүрийн өгөгдлийг хэвлэх боломжтой."
    },
    {
        "SrNo": "1092",
        "english": "Print preview ",
        "mongolian": "Хэвлэхээс өмнөх байдлаар харах ",
        "mongolian_description": "Принтер лүү хэвлэх комманд илгээхийн өмнө баримт хэрхэн харагдаж байгааг харж болно."
    },
    {
        "SrNo": "1093",
        "english": "Print queue",
        "mongolian": "Хэвлэх дараалал",
        "mongolian_description": "Хэвлэгдэхээр хүлээгдсэн ажлын жагсаалт нь хэвлэгдэх дарааллын дагуу түр хадгалагдсан байдаг. Ер нь бол энэ нь хэвлэгдэхээр хүлээгдсэн файлын жагсаалт юм. Файл бүр нь гол мэдээллийг агуулах бөгөөд түр хадгалагдсан мэдээллийг принтер лүү мэдээлдэг. Ажлын баримт бичиг  эсвэл арилжааны баримт бичгийн томоохон багц байж болох юм."
    },
    {
        "SrNo": "1094",
        "english": "Print spooler",
        "mongolian": "Хэвлэх дамар, Хэвлэгчийн түр хадгалагч ",
        "mongolian_description": "Програмын нөөцөөс бэлэн болсон ямар нэг өгөгдлийг хэвлэнэ.  Хэвлэх үйл ажиллагааг хийснээр төрөл бүрийн өгөгдлийг хэвлэх боломжтой. Програм хэвлэх үйл ажиллагааг бүрэн хүлээж авсны дараа хэвлэгчийн түр хадгалагч нь принтер лүү мэдээлэл илгээдэг. Төрөл бүрийн програмууд эсвэл терминал дээр хадгалагдсан файлыг принтер лүү өгөгдөл илгээх нь тохиромжтой байдаг учраас хэвлэгчийн түр хадгалагч  уруу өгөгдөл илгээж болдог. Хэвлэгчийн түр хадгалагч нь  үйлдлийн системийн eрдийн нэг хэсэг юм."
    },
    {
        "SrNo": "1095",
        "english": "Printed circuit board (PCB) ",
        "mongolian": "Хавтан дээр хэлхээ хэвлэх",
        "mongolian_description": "PCB нь цахилгаан хэлхээг агуулсан хавтан юм."
    },
    {
        "SrNo": "1096",
        "english": "Printer",
        "mongolian": "Хэвлэх төхөөрөмж, хэвлэгч ",
        "mongolian_description": "Цаасан дээр график эсвэл үсэг тэмдэгтүүдыг гаргах гаралтын төхөөрөмж юм."
    },
    {
        "SrNo": "1097",
        "english": "Printer font",
        "mongolian": "Хэвлэгчийн фонт ",
        "mongolian_description": "Хэвлэгчийн фонтууд нь принтерт өөрт нь байдаг нөөц юм."
    },
    {
        "SrNo": "1098",
        "english": "Printer resolution ",
        "mongolian": "Принтерийн нягтрал ",
        "mongolian_description": "Хэвлэгдсэн дүрсийн чанарын хэмжих үзүүлэлт юм. Принтерийн нягтрал нь нэг инч дэх цэгүүдээр буюу dpi-аар хэмждэг."
    },
    {
        "SrNo": "1099",
        "english": "Printout",
        "mongolian": "Компьютерээс хэвлэн гаргасан материал ",
        "mongolian_description": "Цаасан дээр компьютерын мэдээллийг хэвлэнэ."
    },
    {
        "SrNo": "1100",
        "english": "Private Automatic Branch Exchange",
        "abbreviation": "PABX",
        "english_description": "A customer premise telephone switching system capable of interfacing to a telephone central office with trunk groups and routing calls based on a 3 or 4 digit telephone extension number."
    },
    {
        "SrNo": "1101",
        "english": "Private Branch Exchange",
        "abbreviation": "PBX",
        "english_description": "An exchange system used in companies and organizations to handle internal and external calls."
    },
    {
        "SrNo": "1102",
        "english": "Private Mobile Radio",
        "abbreviation": "PMR",
        "english_description": "Generally for use within a defined user group such as the emergency services or by the employees of a mining project."
    },
    {
        "SrNo": "1103",
        "english": "Probability Density Function",
        "abbreviation": "PDF",
        "english_description": "The probability that X lies between two values, x1 and x2."
    },
    {
        "SrNo": "1104",
        "english": "Procedural language ",
        "mongolian": "Процедур хэл ",
        "mongolian_description": "Дэд програм нь бүтцийн хувьд процедур (procedure) эсвэл функц (function) гэсэн хэлбэртэй байна. Функц, процедур болгон өөрийн гэсэн оролт, гаралт буюу эхлэл, төгсгөлтэй байна. Тэдгээр нь хоорондоо оролт болон гаралтанд илгээгдсэн өгөгдлүүдээр холбогдоно. Түүнээс гадна функц хэлбэрийн дэд програм нь утгатай (хариутай) байна. Харин процедур төрлийн дэд програмд ийм утга гэж байхгүй."
    },
    {
        "SrNo": "1105",
        "english": "Procedure",
        "mongolian": "Процедур",
        "mongolian_description": "Процедурт тодорхойлолт эсвэл заагч өгөгдсөн байдаг.Бусад дэд програмын зааварт дараагийн заагчыг ашиглана. Процедур үзүүлэлт нь хөгжүүлэгдсэн ассемблер хэлийг зөвшөөрөх хэдийч процедур нь өндөр түвшний хэлтэй холбогдсон байдаг. Процедур нь програмын өгөгдлийг хүлээж авах ба зарим тохиолдолд бэлэн байгаа програмын үр дүнг удирдана. "
    },
    {
        "SrNo": "1106",
        "english": "Process",
        "mongolian": "Процесс, үйл явц",
        "mongolian_description": "Компьютерийн системийн мэдээллийг боловсруулах үйлдлүүдийг нэг бүрчлэн шалгах үүрэг гүйцэтгэдэг. Жишээ нь бичиглэл (бичлэг) засах, файлыг ангилах, мэдээлэл оруулах эсвэл тайлан хэвлэх зэрэг үйлдлүүд багтана."
    },
    {
        "SrNo": "1107",
        "english": "Process",
        "mongolian": "Процесс, үйл явц ",
        "mongolian_description": "Компьютер ихэвчлэн 1 болон олон үйлдлийг нэгэн зэрэг ачаалдаг. Төв процессорын тусламжтай олон үйлдлийг нэгэн зэрэг идэвхтэй байлгаж болдог. "
    },
    {
        "SrNo": "1108",
        "english": "Processing gain",
        "english_description": "The amount of gain, in dB, provided by the spreading code in a CDMA system, usually the ratio of the spreading rate to the information rate."
    },
    {
        "SrNo": "1109",
        "english": "Processor speed",
        "mongolian": "Процессорын хурд ",
        "mongolian_description": "Төв процессорын (CPU) хурд юм."
    },
    {
        "SrNo": "1110",
        "english": "Program",
        "mongolian": "Програм, хөтөлбөр ",
        "mongolian_description": "Компьютерийн гүйцэтгэх чадах прорамуудын нэгдэл юм. Дээд түвшний болон ассемблер хэлээр програм бичигдсэн байдаг. Машины кодоос хөрвүүлэгч програм руу хөрвүүлэх дараалалаар програмыг гүйцэтгэдэг. Програм:Компьютер болон бусад машины үйл ажиллагааг удирдах зааварчилгаа нь програм хангамж дээр дэс дараатай кодлогдсон байдаг. "
    },
    {
        "SrNo": "1111",
        "english": "Program code",
        "mongolian": "Програмын код",
        "mongolian_description": "Компьютер буюу бусад машины үйл ажиллагааг удирдах, програм хангамжийн дараалсан код юм"
    },
    {
        "SrNo": "1112",
        "english": "Programmer",
        "mongolian": "Програмист",
        "mongolian_description": "Компьютерийн програмыг бичих эсвал засдаг хүн"
    },
    {
        "SrNo": "1113",
        "english": "Programming",
        "mongolian": "Програмчлал",
        "mongolian_description": "Програмын хөгжүүлэлт ба загварчлалын үйл явц"
    },
    {
        "SrNo": "1114",
        "english": "Programming language",
        "mongolian": "Програмчлалын хэл",
        "mongolian_description": "Машинаар болон компьютерээр тооцоолол хийх зориулалтай зохиомол хэл. Программчлалын хэл нь компьютерийн програм бичихэд зориулагдсан хийсвэр тэмдэгтийн систем юм. Програмчлалын хэл нь компьютер програмын гадаад төрх , ажилгааг бүрдүүлдэг толь зүйн , өгүүлбэр зүйн болон утга зүйн дүрмийг тодорхойлж өгдөг. //Дугарчулуун багшийн номноос"
    },
    {
        "SrNo": "1115",
        "english": "Progressive download",
        "mongolian": "Татах үйл явц",
        "mongolian_description": "Төрөл бүрийн файл дуу видио татаж эхлэхэд тодорхой бага өгөгдлийн нийлбэрүүд хүлээж авснаас хойш, бүрэн татаж дуусхаас өмнө, файл тоглуулж эхлэхийн өмнөхийг хэлнэ."
    },
    {
        "SrNo": "1116",
        "english": "Prompt ",
        "mongolian": "Яаралтай сануулга",
        "mongolian_description": "Систем дотор өгөгдөл өгөхөд ямар нэгэн тэмдэгт эсвэл мэдээг хэрэглэгчийн дэлгэцэнд үзүүлнэ. Заримдаа промт нь дуу байдлаар үзэгддэг."
    },
    {
        "SrNo": "1117",
        "english": "Propagation",
        "english_description": "The process an electromagnetic wave undergoes as it is radiated from the antenna and spreads out across the physical terrain. See also propagation channel."
    },
    {
        "SrNo": "1118",
        "english": "Propagation channel",
        "english_description": "The physical medium electromagnetic wave propagation between the transmit and receive antennas, and includes everything that influences the propagation between the two antennas."
    },
    {
        "SrNo": "1119",
        "english": "Proprietary",
        "mongolian": "Өмч, эзэмшил",
        "mongolian_description": "Тодорхой байгууллагын худалдааны зориулалтаар үйлдвэрлэсэн цор ганц бүтээгдэхүүн эвсэл технологийг өмч гэж хэлнэ. Зарим бүтээгдэхүүн нь ижил төстэй компаний эзэмшил бүтээгдэхүүнүүдтэй харьцангуй нэг үйл ажиллагаатай байж болно."
    },
    {
        "SrNo": "1120",
        "english": "Protection",
        "mongolian": "Хамгаалт",
        "mongolian_description": "Ямар нэгэн юмыг зориудаар эсвэл санаандгүй байдлаар хандах, өөрчлөхөөс сэргийлдэг. Жишээ нь: хамгаалагдсан уян дискэнд файл нэмж бичиж чадахгүй. "
    },
    {
        "SrNo": "1121",
        "english": "Protection margin",
        "english_description": "The difference between the signal-to-interference ratio and the protection ratio, these ratios being expressed in logarithmic form.",
        "description": "Note 1 – Generally, care is taken to ensure that the difference between the ratios is positive to ensure reliability of communication. Note 2 – Various Recommendations contain definitions for specific applications (e.g. Recommendation ITU-R BO.566)."
    },
    {
        "SrNo": "1122",
        "english": "Protection ratio",
        "english_description": "The minimum value of the signal-to-interference ratio required to obtain a specified reception quality under specified conditions and at a specified point.",
        "description": "Note 1 – Various ITU-R Recommendations contain definitions for specific applications. The minimum value is usually laid down in these Recommendations and in other international agreements.  Note 2 – The specified conditions comprise inter alia: – the nature and characteristics of the wanted signal; – the nature and characteristics of the radio-frequency disturbance or the noise and interfering signals; – the receiver and antenna characteristics; – the propagation conditions. Note 3 – A distinction is made for example between: – the radio-frequency (RF) protection ratio; – the video frequency (VF) protection ratio; – the audio-frequency (AF) protection ratio. "
    },
    {
        "SrNo": "1123",
        "english": "Protocol",
        "mongolian": "протокол",
        "mongolian_description": "Харилцаа холбоонд төхөөрөмжүүд хооронд өгөгдлийн тохирох дамжууллыг хийх үйл явцыг батлахад ашиглагддаг дүрэмүүдийн стандарт багцыг протокол гэж нэрлэнэ.  Өгөгдлийн формат тодорхойлох бас эхлэх дохионууд, удирдах бас төгөсгөлийн хүлээж авахад протокол нь илэрнэ."
    },
    {
        "SrNo": "1124",
        "english": "Prototype",
        "mongolian": "Туршилтийн загвар",
        "mongolian_description": "Програмын энгийн хувилбар, систем хэрхэн ажиллахыг үзүүлхийг, загварийн үйл явцийг туршилтийн загв аргэнэ. Туршилтын загвар нь хэрэглэгчидэд ажилж байгаа, програмийн харагдах байдал тэгэхдээ өгөгдлийг боловсруулж болохгүй.Туршилтийн загвар нь хэрэглэгчид шүүмжлэх болон загварь системд өөрчлөлт оруулж болно."
    },
    {
        "SrNo": "1125",
        "english": "Proxy server",
        "mongolian": "Прокси сервер ",
        "mongolian_description": "Өөр серверүүдээс эх сурвалж хайж байгаа клиентийн хүсэлтэнт завсрын зуучийн үүрэг гүйцэтгэдэг сервер. Прокси сервер нь компьютер системийн эсвэл хавсрага програм байж болно . Клиент эхлээд прокси серверт холбогдож  өөр серверт байгаа ямар нэг эх үүсгэвэр хүснэ, Прокси сервеорт уг заагдсан серверт холбогдож эх үүсгэвэрийг хүлээн авах эсвэл кэшнээсээ буцаана // Дугарчулуун багшийн номноос"
    },
    {
        "SrNo": "1126",
        "english": "Pseudo code",
        "mongolian": "Хуурамч код ",
        "mongolian_description": "Програм эсвэл системийн загварыг тодорхойлох арга. Энэ програмын хэлний хатуу дүрмээс гадуур програмын үндсэн хэлтэй адил төстэй түлхүүр үгүүдийг ашигладаг "
    },
    {
        "SrNo": "1127",
        "english": "Pseudo-Noise",
        "abbreviation": "PN",
        "english_description": "Historically, the Ministry of Post, Telecommunications and Telegraph. Now a term to describe the incumbent, dominant operator in a country, many of which are being or have been privatized."
    },
    {
        "SrNo": "1128",
        "english": "Pseudo-Noise Complex Quadrature Phase Shift Keying",
        "abbreviation": "PNCQPSK",
        "english_description": "The spreading technique that uses basic complex scrambling and PN signals for Is and Qs . For more information see Agilent application note \"HPSK Spreading for 3G\"."
    },
    {
        "SrNo": "1129",
        "english": "Pseudo-Random Binary Sequence",
        "abbreviation": "PRBS",
        "english_description": "A digital signal having framing information and using pseudo-noise in the individual traffic channels. Commonly used to performance test PCM systems."
    },
    {
        "SrNo": "1130",
        "english": "Public domain software ",
        "mongolian": "Нийтийн эзэмшлийн програм хангамж",
        "mongolian_description": "Нийтийн эзэмшлийн програм хангамж нь зохиогчийн эрхийг хамаарахгүйгээр програм хангамжийг чөлөөтэй хэрэглэх"
    },
    {
        "SrNo": "1131",
        "english": "Public Land-Mobile Network",
        "abbreviation": "PLMN",
        "english_description": "A European term used to describe the GSM system."
    },
    {
        "SrNo": "1132",
        "english": "Public Switched Telephone Network",
        "abbreviation": "PSTN",
        "english_description": "Standard domestic and commercial phone service."
    },
    {
        "SrNo": "1133",
        "english": "Public switched telephone network ",
        "abbreviation": "PSTN ",
        "mongolian_description": "Үндсэн аналог суурин утасны  сүлжээ нь тоон системээр солигдож  байна."
    },
    {
        "SrNo": "1134",
        "english": "Pull ",
        "mongolian": "Таталт",
        "mongolian_description": "Таталт нь багцаас ямар нэгэн зүйлийг татахын нэр томъёо ."
    },
    {
        "SrNo": "1135",
        "english": "Pull down menu ",
        "mongolian": "Буцааж татах цэс",
        "mongolian_description": "Буцааж татах цэс  нь  цэсийн bar –д хүсэлт гарч ирэхэд сонгогдсон гарчиг юм доод цэсийн гарчиг хурдан  үзэгдэх нэрүүдийг байнга авдаг "
    },
    {
        "SrNo": "1136",
        "english": "Pulse amplitude modulation",
        "abbreviation": "PAM",
        "english_description": "A technique for encoding the samples of an analog waveform as part of the PCM process. Also used to display the amplitude of QAM signals in an eye diagram."
    },
    {
        "SrNo": "1137",
        "english": "Pulse Code Modulation",
        "abbreviation": "PCM",
        "english_description": "The most predominant type of digital modulation in use today. PCM performs an analog to digital conversion of the speech waveform through a sampling process and encodes and transmits the samples in a serial bit stream as 8-bit digital words."
    },
    {
        "SrNo": "1138",
        "english": "Punctured code",
        "english_description": "A technique used in convolutional decoders that allows a limited number of coded bits to be deleted to greatly simplify processing in the codec. This is extremely useful with long codes."
    },
    {
        "SrNo": "1139",
        "english": "Push ",
        "mongolian": "Түлхэх",
        "mongolian_description": "Түлхэх нь  багцад ямар нэгэн зүйлииг нэмэх нэр томъёо "
    },
    {
        "SrNo": "1140",
        "english": "Push ",
        "mongolian": "Түлхэх",
        "mongolian_description": "Хэрэглэгчийн  Browser руу мэдээлэл дамжуудсан үед хэрэглэгчээс  илүү олон тооны хүсэлт ирдэг"
    },
    {
        "SrNo": "1141",
        "english": "Quadrature Amplitude Modulation",
        "abbreviation": "QAM",
        "english_description": "A type of modulation where the signalling information is carried in the phase and amplitude of the modulated carrier wave."
    },
    {
        "SrNo": "1142",
        "english": "Quadrature Phase Shift Keying",
        "abbreviation": "QPSK",
        "english_description": "A type of phase modulation using 2 pairs of distinct carrier phases, in quadrature, to signal ones and zeros."
    },
    {
        "SrNo": "1143",
        "english": "Quadrature-Phase",
        "abbreviation": "Q",
        "english_description": "The quadrature phase channel in a phase shift keyed system having more that 2 phase states."
    },
    {
        "SrNo": "1144",
        "english": "Quality of service",
        "abbreviation": "QoS",
        "english_description": "A measure of the quality of the signal transmitted over the RF channel. In some systems, the QoS measurement is used to dynamically adjust operational parameters such as transmitter power levels and coding rates."
    },
    {
        "SrNo": "1145",
        "english": "Quantizing",
        "english_description": "The process of assigning values to waveform samples by comparing the samples to discrete steps."
    },
    {
        "SrNo": "1146",
        "english": "Quarantine ",
        "mongolian": "Тусгаарлалт",
        "mongolian_description": "Вирусны байрласан байгаа байрлалыг устгахаасаа өмнө идэвхгүй болгодог"
    },
    {
        "SrNo": "1147",
        "english": "Quarter CIF (1/4 CIF). A video image format which employs 176 horizontal pixels and 144 vertical lines.",
        "abbreviation": "QCIF",
        "english_description": "Although resolution is courser than CIF, QCIF consumes less memory while still achieving an acceptable level of clarity on small displays such as those incorporated in mobile phones."
    },
    {
        "SrNo": "1148",
        "english": "Query ",
        "mongolian": "Хариулт",
        "mongolian_description": "Өгөгдлийн сан дотрох өгөгдлийн асуултанд хариулах. Хариулт бол үнэн эсвэл худал гэсэн хариулт байгуулдаг. Асуултын хариултанд компюьтер бичлэг бүрд шалгаад хариултанд үнэн өгөгдөл харуулна.Хариултын үр дүнд бүх өгөгдлийн жигсаалтанд нийцэх хариулт өгнө. Хариултын өгөгдлийн сан эсвэл өгөгдлийн сангаас ирсэн хариултанд , өгөгдлийг идэвхжүүлэх эсвэл өгөгдөлийг хайх "
    },
    {
        "SrNo": "1149",
        "english": "Query language",
        "mongolian": "Лавлагааны хэл",
        "mongolian_description": "Өгөгдлийн бааз мэдээллийн системд лавлагааны асуулт үүсгэхэд хэрэглэдэг компьютерийн хэл.Лавлагааны хэл нь өгөгдлийн баазтай харьцах ажиллагааг хялбарчилж өгнө."
    },
    {
        "SrNo": "1150",
        "english": "Query ",
        "mongolian": "Query хэл",
        "mongolian_description": "Query хэлний нэг төрөл, өөрөөр хэлбэл өгөгдлийн санг зохион байгуулах зориулалт бүхий хялбаршуулсан програмчлалын хэл."
    },
    {
        "SrNo": "1151",
        "english": "Queue",
        "mongolian": "Дэс дараалал",
        "mongolian_description": "Ямар нэг шинэ багцыг нэмэхдээ багцын төгсгөл дээр нэмэх зарчимтай жагсаалтын төрөл юм."
    },
    {
        "SrNo": "1152",
        "english": "Quit",
        "mongolian": "Гарах,хаах, дуусгах",
        "mongolian_description": "Программаас гарах"
    },
    {
        "SrNo": "1153",
        "english": "Radar beacon",
        "abbreviation": "Racon",
        "english_description": "A transmitter-receiver associated with a fixed navigational mark which, when triggered by a radar, automatically returns a distinctive signal which can appear on the display of the triggering radar, providing range, bearing and identification information."
    },
    {
        "SrNo": "1154",
        "english": "Radio",
        "english_description": "Pertaining to the use of radio waves.",
        "description": "Note – In French and in Spanish “radio” is always a prefix."
    },
    {
        "SrNo": "1155",
        "english": "Radio ",
        "mongolian": "Радио  ",
        "mongolian_description": "Радио долгионыг ашиглахтай хамааралтай.",
        "english_description": "Pertaining to the use of radio waves.     "
    },
    {
        "SrNo": "1156",
        "english": "Radio (frequency) noise",
        "english_description": "A time-varying electromagnetic phenomenon having components in the radio-frequency range, apparently not conveying information and which may be superimposed on, or combined with, a wanted signal.",
        "description": "Note 1 – In certain cases a radio-frequency noise may convey information on some characteristics of its source, for example its nature and location. Note 2 – An aggregate of signals may appear as radio-frequency noise, when they are not separately identifiable."
    },
    {
        "SrNo": "1157",
        "english": "Radio Access Network",
        "abbreviation": "RAN",
        "english_description": "The ground-based infrastructure required for delivery of third-generation (3G) wireless communications services, including high-speed mobile access to the Internet. The RAN must be able to manage a wide range of tasks for each 3G user, including access, roaming, transparent connection to the public switched telephone network and the Internet, and Quality of Service (QoS) management for data and Web connections."
    },
    {
        "SrNo": "1158",
        "english": "Radio button  ",
        "mongolian_description": "Уг товчлуурыг дарахад сонголт хийгддэг цэс. Зөвхөн нэг л сонголт хийгдэнэ."
    },
    {
        "SrNo": "1159",
        "english": "Radio Configuration",
        "abbreviation": "RC",
        "english_description": "RC defines the physical channel configuration of cdma2000 (IS-2000) signals. Each RC specifies a set of data rates based on either 9.6 or 14.4 kbps. RC1 is the backwards-compatible mode of cdmaOne for 9.6 kbps voice traffic. It includes 9.6, 4.8, 2.4, 1.2 kbps data rates and operates at Spread Rate 1 (SR1). RC3 is a cdma2000 specific configuration based on 9.6 kbps that also supports 4.8, 2.7, and 1.5 kbps for voice, while supporting data at 19.2, 38.4, 76.8, and 153.6 kbps. RC3 also operates at SR1. For more information see Agilent application note \"Performing cdma2000 Measurements Today\"."
    },
    {
        "SrNo": "1160",
        "english": "Radio frequency",
        "abbreviation": "RF",
        "english_description": "Electromagnetic waves in the frequency range of 30 kHz to 300 GHz."
    },
    {
        "SrNo": "1161",
        "english": "Radio horizon",
        "mongolian": "Радио далайц ",
        "mongolian_description": "Дэлхийн газрын гадаргуу нь цэгээс цэгүүдийг шүргэх төдий радио долгионуудын цацаргуудиг чиглүүлхэд оршино.  "
    },
    {
        "SrNo": "1162",
        "english": "Radio horizon",
        "english_description": "The locus of points at which the direct rays from a point source of radio waves are tangential to the surface of the Earth.",
        "description": "Note – As a general rule, the radio and geometric horizons are different because of atmospheric refraction."
    },
    {
        "SrNo": "1163",
        "english": "radio link",
        "mongolian": "Радио шугам",
        "mongolian_description": "Радио долгионы аргаар заагдсан хоёр цэгийн хооронд тогтоосон онцлог бүхий харилцаа холбооны хэрэгсэл."
    },
    {
        "SrNo": "1164",
        "english": "Radio link",
        "english_description": "A telecommunication facility of specified characteristics between two points provided by means of radio waves."
    },
    {
        "SrNo": "1165",
        "english": "Radio link",
        "english_description": "The equipment and transmission path (propagation channel) used to carry on communications. It includes the transmitting system, the propagation channel and receiving system."
    },
    {
        "SrNo": "1166",
        "english": "Radio Network Controller under the UMTS system.",
        "abbreviation": "RNC",
        "english_description": "A complex network element of the RAN that connects to and co-ordinates as many as 150 base stations in WCDMA systems. It is involved in managing activities such as hand-over of active calls between base stations."
    },
    {
        "SrNo": "1167",
        "english": "Radio port",
        "english_description": "The T1P1 PCS architecture model equivalent to the BTS."
    },
    {
        "SrNo": "1168",
        "english": "Radio propagation",
        "english_description": "The science associated with the description of electromagnetic waves at radio frequencies as they radiate from a transmitting antenna."
    },
    {
        "SrNo": "1169",
        "english": "Radio relay system ",
        "mongolian": "Радио релей систем",
        "mongolian_description": "30 MHz давтамж дээр үйл ажиллагаа явуулж байгаа заасан тогтмол цэгүүдийн хооронд Радио холбоо систем нь  трофосфер тархалт ашиглаж байгаа болон ихэвчлэн нэг буюу түүнээс дээш дунд шатны станц орно."
    },
    {
        "SrNo": "1170",
        "english": "Radio waves, hertzain , waves ",
        "mongolian": "Радио долгионууд , герцийн, долгионууд",
        "mongolian_description": "3000 GHz-ээс бага давтамжтайгаар огторгуйд тарха үзэгдлийг радио долгион гэнэ."
    },
    {
        "SrNo": "1171",
        "english": "Radio waves, hertzian waves",
        "english_description": "An electromagnetic wave propagated in space without artificial guide and having by convention a frequency lower than 3 000 GHz.",
        "description": "Note – The electromagnetic waves having frequencies around 3 000 GHz may be regarded either as radio waves or optical waves."
    },
    {
        "SrNo": "1172",
        "english": "Radiocommunication",
        "mongolian": "Радио холбоо",
        "mongolian_description": "Радио долгион ашиглан  Харилцаа холбоо тогтоох"
    },
    {
        "SrNo": "1173",
        "english": "Radiocommunication",
        "english_description": "Telecommunication by means of radio waves.",
        "description": "Note – The definition of the term “telecommunication” is included in Appendix 2 of Recommendation ITU-R V.662 dealing with general terms."
    },
    {
        "SrNo": "1174",
        "english": "Radio-frequency disturbance",
        "english_description": "Any electromagnetic phenomenon having components in the radio-frequency range, which may degrade the performance of a device, equipment or system, or affect adversely living or inert matter.",
        "description": "Note – A radio-frequency disturbance may be a radio-frequency noise, an unwanted signal or a change in the propagation medium itself."
    },
    {
        "SrNo": "1175",
        "english": "Radio-frequency interference",
        "abbreviation": "RFI",
        "english_description": "Degradation of the reception of a wanted signal caused by a radio-frequency disturbance.",
        "description": "Note 1 – Often man-made noise is not included in interference. Note 2 – Various levels of interference are defined for administrative purposes in the Radio Regulations viz. permissible interference (RR No. 1.167), accepted interference (RR No. 1.168) and harmful interference (RR No. 1.169). The first term describes a level of interference which in the given conditions involves degradation of reception quality to an extent considered insignificant, but which must be taken into account in the planning of systems. The level of permissible interference is usually laid down in ITU-R Recommendations and/or other international agreements. The second term describes a higher level of interference involving a moderate degradation of reception quality which in given conditions is deemed to be acceptable by the administrations concerned. The third term describes a level of interference which “seriously degrades, obstructs, or repeatedly interrupts a radiocommunication service”. Note 3 – The English words “interference” and “disturbance” are often used indiscriminately; the expression “radio-frequency interference” is also commonly applied to a radio-frequency disturbance or to an unwanted signal."
    },
    {
        "SrNo": "1176",
        "english": "Radio-frequency radiation",
        "english_description": "1. The phenomenon by which energy in the form of electromagnetic waves, in the radiofrequency range, emanates from a source into space. 2. Energy transferred through space in the form of electromagnetic waves in the radiofrequency range.",
        "description": "Note – By extension the term “radio-frequency radiation” sometimes also covers induction phenomena."
    },
    {
        "SrNo": "1177",
        "english": "Radio-relay system",
        "english_description": "Radiocommunication system between specified fixed points operating at frequencies above about 30 MHz which uses tropospheric propagation and which normally includes one or more intermediate stations."
    },
    {
        "SrNo": "1178",
        "english": "Rake receiver",
        "english_description": "A radio receiver having multiple \"fingers\" and utilizing off-sets of a common spreading code to receive and combine several multipath (time delayed) signals, in effect using \"time diversity\" to overcome deep fades."
    },
    {
        "SrNo": "1179",
        "english": "Random",
        "mongolian": "Санамсаргүй, тохиолдлоор",
        "mongolian_description": "Санаандгүй сонгогдсон ямар нэгэн зүйл."
    },
    {
        "SrNo": "1180",
        "english": "Random access",
        "english_description": "A technique for radio access to a network where an access message is not coordinated or administered by the network and can collide with other attempts by others to access the network over the same channel."
    },
    {
        "SrNo": "1181",
        "english": "Random Access Channel",
        "abbreviation": "RACH",
        "english_description": "The channel used by mobiles in GSM and W-CDMA systems to attempt to gain access to the system when first attaching to it."
    },
    {
        "SrNo": "1182",
        "english": "Random access memory ",
        "mongolian": "Шуурхай санах ой",
        "abbreviation": "RAM",
        "mongolian_description": "Шуурхай санах ой гэдэг нь компьютер ажиллаж байх үед ашиглаж буй санах ой юм. Компьютерийн суурин дискэнд өгөгдөл хадгалах явцад тухайн өгөгдөл RAM-д түр хадгалагдана."
    },
    {
        "SrNo": "1183",
        "english": "Range check",
        "mongolian": "Ранжи чек",
        "mongolian_description": "Гаднаас дохио болон өгөгдөл оруулах үед ашиглагддаг үнэлгээний шалгалтын нэг төрөл."
    },
    {
        "SrNo": "1184",
        "english": "Raster graphics",
        "mongolian": "Растер график",
        "mongolian_description": "Компьютерийн дэлгэц дээр дүрс харуулдаг төхөөрөмжийн тусламжтай харагддаг пиксель хэмээх өнгөт дөрвөлжин цэгүүдийн торолсон бүтэцтэй нийлбэрээс дүрс үүсгэдэг технологи."
    },
    {
        "SrNo": "1185",
        "english": "Raw data",
        "mongolian": "Боловсруулаагүй өгөгдөл",
        "mongolian_description": "Ямар нэг үнэлгээ эсвэл үйл ажиллагаа эхлэхийн өмнө компьютерт оруулах өгөгдөл"
    },
    {
        "SrNo": "1186",
        "english": "Ray path",
        "mongolian": "Цацрагын чиглэл ",
        "mongolian_description": "Тархалтын чиглэл нь цэгээс цэг тус бүрийг шүргэх төдий чиглэлтэй юм."
    },
    {
        "SrNo": "1187",
        "english": "Ray path",
        "english_description": "At each point, the path tangential to the direction of propagation of energy at this point.",
        "description": "Note 1 – The concept of ray is the basis of the geometrical optics which, when applicable, permits the substitution of simple relationships for Maxwell's equations. Note 2 – In some cases, several paths may exist between two points. Note 3 – In an isotropic medium, the ray path is a trajectory orthogonal to the wavefronts and the term \"ray\" is often defined as this trajectory. In an anisotropic medium, the trajectories orthogonal to the wave fronts do not always coincide with physical paths between a source and a receiving point and should not be called rays."
    },
    {
        "SrNo": "1188",
        "english": "Ray path transmission loss",
        "english_description": "The transmission loss for a particular ray propagation path, equal to the basic transmission loss minus the transmitting and receiving antenna gains in the ray path directions.",
        "description": "Note – The ray path transmission loss may be expressed by: Lt = Lb – Gt – Gr dB (4) where Gt and Gr are the plane-wave directive gains of the transmitting and receiving antennas for the directions of propagation and polarization considered."
    },
    {
        "SrNo": "1189",
        "english": "Rayleigh channel",
        "english_description": "A communications channel having a fading envelope in the form of the Rayleigh Probability Density Function."
    },
    {
        "SrNo": "1190",
        "english": "Rayleigh fading",
        "english_description": "A type of signal fading caused by independent multipath signals having a Rayleigh PDF."
    },
    {
        "SrNo": "1191",
        "english": "Read",
        "mongolian": "Унших",
        "mongolian_description": "Уг файл нь  өгөгдөл доторхийг уншина."
    },
    {
        "SrNo": "1192",
        "english": "Read only memory",
        "mongolian": "Зөвхөн уншиж болох файл",
        "mongolian_description": "Хэрэглэгч нээж үзэж болох хэдий ч устгаж, өөрчлөлт хийж болохгүй файл."
    },
    {
        "SrNo": "1193",
        "english": "Read/write head",
        "mongolian": "Унших болон бичих толгой",
        "mongolian_description": "Диск болон кассетыг унших бичих зориулалттай диск ба кассетны бүрэлдэхүүн  хэсгүүдийн нэг"
    },
    {
        "SrNo": "1194",
        "english": "Read-only memory ",
        "mongolian": "Тогтмол санах ой",
        "abbreviation": "ROM",
        "mongolian_description": "Тогтмол санах ой бөгөөд ихэнхдээ компьютерийн эх хавтан дээр суулгагдсан тусгай зориулалтын микросхем байдаг ба дахин бичигдэх боломжгүй санах ой юм.Сүлжээний карт болон видео картууд тогтмол санах ойн микросхемийг агуулсан байдаг."
    },
    {
        "SrNo": "1195",
        "english": "Ready",
        "mongolian": "Бэлдэх, Бэлэн байх",
        "mongolian_description": "Өгөгдөл хүлээн авахад бэлэн байх. Жишээ нь: Принтер залгаатай ба чөлөөтэй үед"
    },
    {
        "SrNo": "1196",
        "english": "Real  type",
        "mongolian": "Бодит Төрөл",
        "mongolian_description": "Бутархай тоог агуулсан тоонууд.  Жишээ нь: 5.76, 34.835 гэх мэт. Float гэж нэрлэдэг."
    },
    {
        "SrNo": "1197",
        "english": "Real numbers",
        "mongolian": "Бодит тоо",
        "mongolian_description": "Бутархай тоог агуулсан тоонууд. Жишээ нь: 5.76, 34.98 гэх мэт."
    },
    {
        "SrNo": "1198",
        "english": "Real Time ",
        "mongolian": "Бодит Хугацаа",
        "mongolian_description": "Систем нь гадны ямар нэгэн үйл ажиллагаанд түргэн шуурхай хариу өгөх, цаг хугацааны алдагдалгүй байх  жишээ нь: Агаарын хяналтанд хэрэглэнэ."
    },
    {
        "SrNo": "1199",
        "english": "Reboot ",
        "mongolian": "Дахин Ачааллах",
        "mongolian_description": "Компьютерийг дахин ачааллах систем. Компьютер гацах үед ашиглана. Бүх параметрүүд анхны байрлалдаа орж,өгөгдөл болон утгууд алдагдагдвал хадгалагдахгүй."
    },
    {
        "SrNo": "1200",
        "english": "Receive diversity",
        "english_description": "The process of providing two independent receiving systems and spatially separated antennas to overcome fading effects on the radio signal."
    },
    {
        "SrNo": "1201",
        "english": "Received Signal Strength Indication",
        "abbreviation": "RSSI",
        "english_description": "An indication of the average signal strength at the input of a receiver produced by measurement circuitry in the receiver. Such a measurement does not normally include antenna gain or transmission system losses."
    },
    {
        "SrNo": "1202",
        "english": "Receiver",
        "english_description": "Arrangement of active components such as the LNA, mixer and IF amplifier together with passive components such as the image filter and IF filter. Taken together they perform the task of recovering the modulation from a known RF signal while rejecting unwanted signals. The portion of the communication system that includes a detector and signal processing electronics to convert electrical signals (electric waves) to audio or data signals. It provides reception and, if necessary, demodulation of electronic signals."
    },
    {
        "SrNo": "1203",
        "english": "Record",
        "mongolian": "Бичлэг, Бүртгэл",
        "mongolian_description": "Мультимедиа программ хангамж нь дуу болон дүрс бичлэгийг тоон хэлбэртэй файл болгон хадгална."
    },
    {
        "SrNo": "1204",
        "english": "Record format ",
        "mongolian": "Бичлэгийн формат",
        "mongolian_description": "Бичлэгийн формат нь тодорхой бичлэгт агуулагдах нөхцлүүдийг тодорхойлон заасан байдаг ба эдгээрт нь талбарууд, жишээ, талбарын төрөл, талбарын урт, талбарын нэр зэрэг орно."
    },
    {
        "SrNo": "1205",
        "english": "Record number ",
        "mongolian": "Бичлэгийн дугаар",
        "mongolian_description": "Бичлэгийн файлд байрлал тогтоохын тулд давтагдашгүй дугаарыг ашигладаг. Анх бичлэгийн физик байрлал ба өгөгдлийн байрлалыг энэ аргаар тогтоодог байсан. Санамсаргүй файлууд болон файлын бүтцэд бичлэгийн дугаарыг ашигладаггүй."
    },
    {
        "SrNo": "1206",
        "english": "Record ",
        "mongolian": "Бичлэг",
        "mongolian_description": "Бичлэг нь дэс дараалсан өгөгдлийн файл юм. Бичлэг нь нэгж, талбар болон ялгаатай өгөгдлийн төрлүүдийн цуглуулга бөгөөд эдгээрийг хамааруулсан объектоор бичлэгийг илэрхийлдэг. Жишээ нь: Бүх ажилчдын цалингийн мэдээлэл өгөгдлийн санд байдаг. Тухайн ажилчны бичлэг буюу талбарт түүний нэр, иргэний үнэмлэхний дугаар, төрсөн өдөр, хөдөлмөрийн хөлсний хэмжээ гэх мэт багтана. "
    },
    {
        "SrNo": "1207",
        "english": "Recover",
        "mongolian": "Сэргээх",
        "mongolian_description": "Эх файлыг эргүүлэн сэргээх, жишээ нь ямар нэг эвдэрсэн файл байж болно."
    },
    {
        "SrNo": "1208",
        "english": "Recursion",
        "mongolian": "Рекурс (програмчлалын арга)",
        "mongolian_description": "Програмд өөрөө өөрийгөө дууддаг дэд програм юм."
    },
    {
        "SrNo": "1209",
        "english": "Recycle bin",
        "mongolian": "хогийн сав",
        "mongolian_description": "Үйлдлийн системээс устгагдсан файлууд хогийн саванд ордог. Тэндээсээ сэргээгдэж болно, үгүй бол хогийн савнаас устгаж болдог."
    },
    {
        "SrNo": "1210",
        "english": "Red, green, blue",
        "abbreviation": "RGB",
        "mongolian_description": "Улаан,ногоон,цэнхэр. График орчинд вэб загварчлал ба компьютерийн дэлгэцийг загварчлахад бүх өнгийг энэ 3 өнгөнөөс гаргаж авдаг."
    },
    {
        "SrNo": "1211",
        "english": "Redirect",
        "mongolian": "Өөр хаягаар буцааж илгээх",
        "mongolian_description": "Буруу хүн рүү цахим шуудан илгээвэл, түүнийгээ зөв хүн рүү өөр хаягаар буцааж илгээдэг."
    },
    {
        "SrNo": "1212",
        "english": "Redo ",
        "mongolian": "Дахин хийх",
        "mongolian_description": "Ямар нэг үйлдлийн дахин хийнэ гэдэг нь дуусаагүй үйлдлийг дахин хийхийг хэлнэ.Энэолон програмд нийтлэг байдаг функц юм."
    },
    {
        "SrNo": "1213",
        "english": "Reduced carrier",
        "mongolian": "Багасах зөөгч дохио",
        "mongolian_description": "дулааны урсгал,синуслэгзөөгчбүрэлдэхүүнхүчюмдалайцынмодуляцбүхийдамжуулах, эсвэлдулааны ялгаралтай холбоотойоргилхүчдэлдоор 6-аас дээшдббуурсанхэдий ч энэньшинээрзохионdemodulationашиглажболохиймтүвшиндбайна."
    },
    {
        "SrNo": "1214",
        "english": "Reduced carrier",
        "english_description": "Pertaining to a transmission or emission with amplitude modulation where the power of the sinusoidal carrier component is, by convention, reduced by more than 6 dB below the peak envelope power but remains at such a level that it can be reconstituted and used for demodulation.",
        "description": "Note 1 – The level of the reduced carrier is normally between 6 dB and 32 dB and preferably between 16 dB and 26 dB below the peak envelope power of the emission. Note 2 – The reduced carrier may also be used to achieve automatic frequency control and/or gain control at the receiver."
    },
    {
        "SrNo": "1215",
        "english": "Reduced carrier ",
        "mongolian": "Багасах зөөгч дохио",
        "mongolian_description": "Конвенцоор синуслэг зөөгч бүрэлдэхүүн хүч юм далайцын модуляц бүхий дамжуулах, эсвэл дэгдэлт холбоотой оргил дугтуй хүч доогуур 6dB илүү буурсан хэдий ч энэ нь шинээр зохион demodulation ашиглаж болохийм түвшинд байна."
    },
    {
        "SrNo": "1216",
        "english": "Reduced instruction set computer ",
        "abbreviation": "RISC",
        "mongolian_description": "Цомхон бөгөөд энгийн команд илүү хурдан гүйцэтгэгдэнэ гэсэн зарчимд тулгуурладаг төв процессорын хийц төлөвлөлтийн арга юм. Архитектурын хувьд энгийн байх нь процессорын өртгийг хямдруулаад зогсохгүй, хэмийн давтамжийг өсгөн, командын гүйцэтгэлийг хэд хэдэн гүйцэтгэх блокуудад зэрэгцээ хуваарилах боломжтой болгодог байна. "
    },
    {
        "SrNo": "1217",
        "english": "Redundancy ",
        "mongolian": "Нөөц төлөв",
        "mongolian_description": "Компьютер системд нөөц төлөв гэдэг ижил үүрэг гүйцэтгэдэг функцүүдээс бүрдэх нөөц бүрэлдэхүүн байдаг, тиймээс бүрэлдэхүүн гэмтэхэд нөөц (backup) удирдлагыг гартаа авч систем үргэлжилэн ажилладаг."
    },
    {
        "SrNo": "1218",
        "english": "Reed Solomon code",
        "english_description": "A particular implementation of the BCH block (cyclic) coder capable of correcting double errors."
    },
    {
        "SrNo": "1219",
        "english": "Reference frequency",
        "english_description": "A frequency having a fixed and specified position in respect to the assigned frequency."
    },
    {
        "SrNo": "1220",
        "english": "Reference usable field-strength, [reference usable power flux-density]",
        "english_description": "The agreed value of the usable field-strength [the agreed value of the usable power flux-density] that can serve as a reference or basis for frequency planning.",
        "description": "Note 1 – Depending on the receiving conditions and the quality required, there may be several reference usable field-strength [reference usable power flux-density] values for the same service. Note 2 – Where there is no ambiguity, the term “reference field-strength” [“reference power flux-density”] may be used."
    },
    {
        "SrNo": "1221",
        "english": "Reflecting satellite",
        "english_description": "A satellite intended to reflect radiocommunication signals."
    },
    {
        "SrNo": "1222",
        "english": "Reflection",
        "english_description": "A process that occurs when a propagating electromagnetic wave impinges upon a obstruction whose dimensions are very large when compared to the wavelength. Reflections from the surface of the earth, and from buildings or walls produce reflected waves which may interfere, constructively of destructively at the receiver."
    },
    {
        "SrNo": "1223",
        "english": "Refresh rate",
        "mongolian": "Шинэчлэх давтамж",
        "mongolian_description": "Шинэчлэх давтамж нь дэлгэцэнд дүрсийг секунд бүрт давтах тоо хэмжээгээр тодорхойлогдоно. Шинэчлэх давтамж нь бага бол хэлбэлзэх хандлагатай болдог."
    },
    {
        "SrNo": "1224",
        "english": "Region",
        "abbreviation": "REAG",
        "english_description": "A geographic area over which a WCS operator is licensed to provide service. REAGs are a group of economic areas (EAs) and were first used to license WCS service in the late '90s. REAGs are very large, with 6 REAGs covering the entire continental United States."
    },
    {
        "SrNo": "1225",
        "english": "Registration",
        "english_description": "This is the process by which a mobile station informs the immediate service provider of its presence in the network and its desire to receive service."
    },
    {
        "SrNo": "1226",
        "english": "Regular Pulse Excited-Long Term Prediction",
        "abbreviation": "RPE-LTP",
        "english_description": "A type of speech coding using regularly spaced pulses in an excitation frame and a long term predictor to model the fine structure (pitch)."
    },
    {
        "SrNo": "1227",
        "english": "Reject(a mailing list posting)-",
        "mongolian": "Татгалзах, няцаах, хүлээж авахгүй байх",
        "mongolian_description": "Пост нь зохицуулагчаар татгалзах үед хэрэглэгчийн хаягийн жагсаалт болон мэдээллийн самбарт харагдах боломжгүй."
    },
    {
        "SrNo": "1228",
        "english": "Relational database",
        "mongolian": "Харьцуулалттай өгөгдлийн бааз",
        "mongolian_description": "Харьцуулалттай өгөгдлийн баазийн хүснэгтүүдэд нэг давхцсан /адилхан/ талбар байх ёстой. Энэ давхцагч талбар нь нэг хүснэгтийн нөгөө хүснэгттэй холбох холбоос байх болно. Тэгэхээр relationship(холбогдол) гэдэг нь нэг хүснэгтийн бичлэгийг бичлэгтэй холбох холбоос юм. Үүний ачаар тус тусдаа хүснэгтүүд хоорондоо харилцан уялдаа холбоотой болж цогц өгөгдлийн санг үүсгэх юм."
    },
    {
        "SrNo": "1229",
        "english": "Relational operator",
        "mongolian": "Харьцуулалтын оператор",
        "mongolian_description": "Харьцуулалтын операторууд нь өгөгдөл ба бүтээгдэхүүнийг харьцуулж үнэн эсвэл худал гэсэн хариулт өгдөг. IF, WHILE эсвэл REPEAT UNTIL буюу давталтуудыг ашиглан програмыг удирдаж чаддаг. Жишээ нь: include= and < гэх зэрэг харьцуулах операторууд байдаг."
    },
    {
        "SrNo": "1230",
        "english": "Relative reference",
        "mongolian": "Харьцангуй лавалгаа",
        "mongolian_description": "Харьцангуй лавалгаа гэдэг нь томъёог хүснэгтийн нэг үүрнээс өөр өөр үүрэнд хуулбарлахыг хэлнэ. Ер нь томъёог өөр үүрэнд зөөхдөө үнэмлэхүй  ба харьцангуй аргын аль нэгийг ашиглах бөгөөд харьцангуй лавалгаань өөр орчинд харьцангуй өөрчлөгддөг ба үнэмлэхүй лавалгаа нь  өөр орчинд үл өөрчлөгдөдөг."
    },
    {
        "SrNo": "1231",
        "english": "Release",
        "mongolian_description": "Програм хангамжид release нь олон нийт ашиглах боломжтой хийгдсэн програм хангамжийн шинэчилсэн хувилбар юм. Гаралтууд ер нь бүхэл тоо харуулдаг, ба гаралтын дугаар нь хувилбарын хэд дэх хувилбар болохыг аравтын тоогоор илэрхийлдэг."
    },
    {
        "SrNo": "1232",
        "english": "Remote",
        "mongolian": "Алсын зайн удирдлага",
        "mongolian_description": "Суурин биш юмыг илэрхийлэх, жишээлбэл телефон утасны шугамаар алсын зайн компьютерт холбогдох."
    },
    {
        "SrNo": "1233",
        "english": "Remote access",
        "mongolian": "Алсын зайн хандалт",
        "mongolian_description": "Алсын зайн хандалт бол холбооны шугамаар газарзүйн байрлалын хувьд алслагдмал компьютер системийг ашиглах."
    },
    {
        "SrNo": "1234",
        "english": "Remote sensing satellite",
        "english_description": "A satellite whose purpose is remote observation by reception of electromagnetic waves using active or passive sensors (these two types of sensors are defined in this Recommendation, numbers H31 and H32)."
    },
    {
        "SrNo": "1235",
        "english": "Remote testing",
        "mongolian": "Алсын зайн шалгалт",
        "mongolian_description": "Зохион бүтээгчийн суурин компютерээс өөр компьютер ашиглан шалгах."
    },
    {
        "SrNo": "1236",
        "english": "Rename",
        "mongolian_description": "Файлд өөр нэр өгөх"
    },
    {
        "SrNo": "1237",
        "english": "Repeater",
        "english_description": "Receives radio signals from the base station. They are then amplified and re-transmitted to areas where radio shadow occurs. Repeaters also work in the opposite direction, i.e. receiving radio signals from mobile telephones, then amplifying and re-transmitting them to the base station."
    },
    {
        "SrNo": "1238",
        "english": "Research in Advanced Communications Equipment",
        "abbreviation": "RACE",
        "english_description": "An ETSI research project that has subsequently been replaced by ACTS."
    },
    {
        "SrNo": "1239",
        "english": "Reuse factor",
        "english_description": "Also known as frequency reuse factor, is the number of distinct frequency sets used per cluster of cells."
    },
    {
        "SrNo": "1240",
        "english": "Reverse link",
        "english_description": "See uplink."
    },
    {
        "SrNo": "1241",
        "english": "Rewind",
        "mongolian": "Дахин эргүүлэх",
        "mongolian_description": "video файлыг эхнээс нь эхлүүлнэ."
    },
    {
        "SrNo": "1242",
        "english": "Rich Site Summary or Really Simple Syndication",
        "abbreviation": "RSS",
        "mongolian_description": "Эрэлтэй site-ийн хураангуй эсвэл маш энгийн мэдээлэл гэсэн утгатай. RSS-ээр аливаа site дагах юм бол тэр site шинээр мэдээ нэмэх бас өөрчлөлтийг чамд мэдэгдэнэ."
    },
    {
        "SrNo": "1243",
        "english": "Rician channel",
        "english_description": "A transmission channel that may have a line-of-sight component and several scattered of multipath components. This fading characteristic exhibits a Rician PDF."
    },
    {
        "SrNo": "1244",
        "english": "Rician fading",
        "english_description": "A type of signal fading having a characteristic similar to the Rician PDF."
    },
    {
        "SrNo": "1245",
        "english": "Right click",
        "mongolian": "Баруун товч",
        "mongolian_description": "Энэ бол хулганы баруун талын товч юм. Дэлгэн дээрх жижиг зурган дээр хулганы баруун талын товчийг даран файлын нэмэлт мэдээлэл авч болно. Жишээ нь: Жижиг жагсаалт бүхий меню юм."
    },
    {
        "SrNo": "1246",
        "english": "Right-hand polarization, clockwise polarization",
        "english_description": "An elliptical polarization for which the electric flux-density vector observed in any fixed plane not containing the direction of propagation, whilst looking in this direction, rotates with time in a right-hand or clockwise direction."
    },
    {
        "SrNo": "1247",
        "english": "Right-hand-polarization clock wise polarization",
        "mongolian": "Баруун гарын дагуу туйлшрах, цагын зүүний дагуу туйлшрах ",
        "mongolian_description": "Тогтмол туйлшралын хөдөлгөөний чиглэл нь вектор,богинхон нигтралтай тархалтын төршин багтаамжгуй цахилгаанжсан .энэ чиглэл нь хархад хоорондоо баруун гарын дагуу,цагын зүүний дагуу чиглэлтээ."
    },
    {
        "SrNo": "1248",
        "english": "Ring network",
        "mongolian": "Бөгжин сүлжээ",
        "mongolian_description": "Орон нутаг хоорондын сүлжээнд хэрэглэдэг.Бөгж холболт нь төхөөрөмж бүрийг хооронд нь цуваагаар тойрог хэлбэртэй холбон мэдээллийг дамжуулахыг хэлнэ."
    },
    {
        "SrNo": "1249",
        "english": "Roaming",
        "english_description": "Within your home network, this means that your mobile phone automatically sets up communication procedures with different radio base stations when on the move. International roaming means that you can use networks other than your own when traveling abroad."
    },
    {
        "SrNo": "1250",
        "english": "Robot",
        "mongolian_description": "Хүний хийж байгаа үйлдлийг хийж чаддаг бөгөөд хүний удирлагаар болон бие даан  ажиллах чадвартай автомат төхөөрөмж юм."
    },
    {
        "SrNo": "1251",
        "english": "Rogue value",
        "mongolian": "Хуурамч утга",
        "mongolian_description": "Хуурамч утга нь тодорхой утгатай, энгийн мэдээлэл тооцоолоход хэрэглэдэггүй энийг мэдээлийн жагсаалтын төгсгөлд бичиж өгдөг. Энэ утга хүртэл програм ажиллаад зогсдог. Дугаарлахад янз бүрээр цаанаасаа дугаарлаж өгдөг. Хуурамч утга үргэлж тоон утга агуулдаг. Энэ нь мөн онцгой утгыг илэрхийлдэг ба өгөгдлийн зарим нэг тохиолдолд, жишээ нь мэдээлэлийг устгах гэх мэт онгой нөхцлийг тэмдэглэдэг."
    },
    {
        "SrNo": "1252",
        "english": "Rolleover",
        "mongolian_description": "Хулганы сумыг түүн дээр хөдөлгөснөөр зургийн харагдах байдлыг өөрчилдөг."
    },
    {
        "SrNo": "1253",
        "english": "Rotate",
        "mongolian": "Эргүүлэх",
        "mongolian_description": "График орчинд , зургийг нар зөв эсвэл нар буруу эргүүлнэ."
    },
    {
        "SrNo": "1254",
        "english": "Rounding",
        "mongolian": "Ойролцоо",
        "mongolian_description": "Тооны ойролцоо утга буюу бутархай тоог ойролцоо бүхэл утганд шилжүүлдэг. Жишээ нь 1,36 ойролцоогоор 1,4 болгоно."
    },
    {
        "SrNo": "1255",
        "english": "Router",
        "mongolian": "Цацагч",
        "mongolian_description": "router нь сүлжээний маш нарийн холбох төхөөрөмж юм. Зөв замаар зөв байрлал руу өгөгдлийг дамжуулахын тулд компьютерийн хаягийг хамт дамжуулдаг. Ерөнхийдөө том сүлжээнд ашиглах ба интернетэд орон нутгийн сүлжээг холбож өгдөг."
    },
    {
        "SrNo": "1256",
        "english": "Router",
        "english_description": "A data switch that handles connections between different networks. A router identifies the addresses on data passing through the switch, determines which route the transmission should take and collects data in so-called packets which are then sent to their destinations."
    },
    {
        "SrNo": "1257",
        "english": "Routing",
        "english_description": "The forwarding of data packets in packet-switched networks, to the intended address"
    },
    {
        "SrNo": "1258",
        "english": "Row",
        "mongolian": "Эгнээ",
        "mongolian_description": "Хүснэгт болон маягтын хэвтээ нүднүүд юм. Маягт дээр эгнээ бүрийг дугаарласан байдаг."
    },
    {
        "SrNo": "1259",
        "english": "Ruler",
        "mongolian": "Шугам",
        "mongolian_description": "Ихэнхдээ бичиг хэргийн програм, төсөл зургийн програм гэх мэт зүйлд ашигладаг. Нарийн холболттой хүснэгтүүд, төсөл зургийн нарийвчлалтай зурахад ашигладаг."
    },
    {
        "SrNo": "1260",
        "english": "Run",
        "mongolian": "Ажиллуулах",
        "mongolian_description": "Энэ коммандыг хийснээр програм ажиллаж эсвэл ажиллахад бэлдэж эхэлнэ."
    },
    {
        "SrNo": "1261",
        "english": "Run length coding",
        "english_description": "A type of video coding used in H.261 and H.263 codecs"
    },
    {
        "SrNo": "1262",
        "english": "Run time",
        "mongolian": "Ажиллах хугацаа",
        "mongolian_description": "Заасан хугацааны турш програм ажиллана."
    },
    {
        "SrNo": "1263",
        "english": "Runtime error",
        "mongolian": "Ажиллах явцын алдаа",
        "mongolian_description": "Программ ажилаж байх үед гарах алдаанууд.Санах ойн дутагдал эсвэл байхгүй өгөгдөл нь програм дээр дахин ажилах боломжгүй болж программын логикт эсвэл үр дүнд алдаа гархыг хэлнэ."
    },
    {
        "SrNo": "1264",
        "english": "Rural Service Are",
        "abbreviation": "RSA",
        "english_description": "A geographic area over which a cellular operator is licensed to provide service. RSAs are a group of rural counties having common financial, commercial and economic ties and were used to license cellular service Rural areas in the latter '80s. RSAs cross state lines in some instances and were developed during a public rule making process at the FCC in 1987 and 1988.."
    },
    {
        "SrNo": "1265",
        "english": "sampling",
        "english_description": "The first process performed in the conversion of analog waveforms to a digital format. It converts a continuoustime signal into a discrete-time signal or sequence of numbers."
    },
    {
        "SrNo": "1266",
        "english": "Satellite",
        "english_description": "A body which revolves around another body of preponderant mass and which has a motion primarily and permanently determined by the force of attraction of that other body",
        "description": "Note – A body so defined which revolves around the Sun is called a planet or planetoid."
    },
    {
        "SrNo": "1267",
        "english": "Satellite link",
        "english_description": "A radio link between a transmitting earth station and a receiving earth station through one satellite. A satellite link comprises one up-link and one down-link."
    },
    {
        "SrNo": "1268",
        "english": "Satellite link ",
        "mongolian": "Хиймэл дагуулын шугам",
        "mongolian_description": "Нэг хиймэл дагуулаар дамжуулан дэлхий дамжуулах станц болон хүлээн авах газар станцын хоорондох радио холбоос. Сансрын холбоос нь нэг буцах шугам , илгээх шугамнаас бүрдэнэ."
    },
    {
        "SrNo": "1269",
        "english": "Satellite network",
        "english_description": "A satellite system or a part of a satellite system, consisting of only one satellite and the cooperating earth stations."
    },
    {
        "SrNo": "1270",
        "english": "Satellite phone",
        "english_description": "A type of wireless mobile telecommunications system using satellites as base stations. Such systems have the ability of providing service to the oceans and other remote areas of the globe."
    },
    {
        "SrNo": "1271",
        "english": "Satellite system",
        "english_description": "A space system using one or more artificial satellites.",
        "description": "Note – If the primary body of the satellite or satellites of a specific system is not the Earth, it should be identified"
    },
    {
        "SrNo": "1272",
        "english": "Save",
        "mongolian": "Хадгалах",
        "mongolian_description": "Хадагалхыг хүссэн файлыг хадгалах орчин луу  илгээдэг. Ж/нь disc эсвэл CD"
    },
    {
        "SrNo": "1273",
        "english": "Save-as",
        "mongolian_description": "Үсгийн фонтны хэлбэр дүрсийг өөрчлөлтгүй томруулж жижигрүүлдэг."
    },
    {
        "SrNo": "1274",
        "english": "Scan",
        "mongolian_description": "Бичиг баримтыг компьютерт оруулан ашиглахын тулд скайнер ашиглан шинжих (scan) үйлдлийг хийж тоон буюу дижиталь зураг болгодог."
    },
    {
        "SrNo": "1275",
        "english": "Scattering",
        "english_description": "A phenomenon that occurs when the medium through which a radio wave travels consists of objects with dimensions small compared to the wavelength and diffuses the wave as it propagates through it."
    },
    {
        "SrNo": "1276",
        "english": "Search routine ",
        "mongolian": "Тогтмол хайлт",
        "mongolian_description": "Хэсэг программын кодыг хэрэгжүүлсэн хайлт"
    },
    {
        "SrNo": "1277",
        "english": "Second adjacent channel",
        "english_description": "In a given set of radio channels, the RF channel whose characteristic frequency is situated next above that of the upper adjacent channel or next below that of the lower adjacent channel."
    },
    {
        "SrNo": "1278",
        "english": "Secondary key",
        "mongolian": "Хоёрдогч түлхүүр",
        "mongolian_description": "Гол нь дээд амжилт тогтооход ашигладаг бичлэгийн талбар.Ихэнх өгөгдлийн файлууд өвөрмөц, дээд амжилт тогтооход ашиглаж байгаа гол түлхүүр болно. Өгөгдлийн файл дахь бичлэгүүд нь дараалан хандаж,  бүртгэл гол салбарт хандаж болно. Өгөгдлийн файл нь файлыг боломж олгох хоёрдогч түлхүүр, өөр дарааллаар хандаж болох юм. Гол нь файлаа ялгах төрлийн түлхүүр болгон дээд амжилт олоход ашиглаж болно. Нэгээс олон салбарт бүрдсэн нэгдсэн түлхүүр, файлыг нь ангилахын тулд ашиглаж болно."
    },
    {
        "SrNo": "1279",
        "english": "Second-generation computer",
        "mongolian": "Хоёр дахь үеийн компьютер",
        "mongolian_description": "Транзистор нь үндсэн бүрэлдэхүүн хэсэг болох хаалтыг солих үед Хоёр дахь үеийн компьютер ирсэн байна. Тэд улмаар илүү найдвартай болж, бага эрчим хүч хэрэглэж байна. Тэд хямд боловч ихэнх нь бизнест хол, мэдээж хувь хүмүүс зориулсан байна."
    },
    {
        "SrNo": "1280",
        "english": "Section break",
        "mongolian": "Хэсэг бүлэг өөрчлөлт",
        "mongolian_description": "Үг үсэг боловсруулалт нь хэсэг бүлэг бичиг баримтыг хуваах, олон форматтайгаар байрлал өөрчлөх."
    },
    {
        "SrNo": "1281",
        "english": "Sector",
        "mongolian": "Заагч",
        "mongolian_description": "Диск дээрх замын хаалт дугаар болон ижил зайнд хуваагдсан уулзах загвар юм. Диск нь өгөгдлийг унших, болон бичих байгууламж."
    },
    {
        "SrNo": "1282",
        "english": "Sector",
        "english_description": "A physical coverage area associated with a base station having its own antennas, radio ports and control channels. The concept of sectors was developed to improve cochannel interference in cellular systems and most wireless systems use three sector cells."
    },
    {
        "SrNo": "1283",
        "english": "Secure Socket Layer ",
        "abbreviation": "SSL",
        "mongolian_description": "2 компьютерийн хоорондхолбожинтернэтийн орчинд хувиргалт бий болгох.Гэвч элекроник харилцаа үүссэнээр сэрверээр дамжуулж байна."
    },
    {
        "SrNo": "1284",
        "english": "Security",
        "mongolian": "Нууцлал, хамгаалал",
        "mongolian_description": "Хамгаалалт нь гол төлөв лавлах хамгаалалтын өгөгдөл байна. Энэ хандалт нь нууц үг хязгаарлах эсвэл харгалзах файлыг аюулгүй болгох бас баталгаа өгөх ердийн нөөц болно."
    },
    {
        "SrNo": "1285",
        "english": "Seek time",
        "mongolian_description": "Дискний зам дээрх толгой файлыг (уншихболонбичих ,хуулах) үйлдлийг SEEK TIME гэнэ."
    },
    {
        "SrNo": "1286",
        "english": "Segment",
        "mongolian": "Сегмент",
        "mongolian_description": "Жижигпрограм буюусегментнь хэд хэдэнтомоохонпрограмхуваажбайна.Сегмент тус тусад ньажиллуулахбүрэнпрограм юм.Хэсгийнньтом програмпрограмыг бүгдийг ньхадгалаххангалттайсанах ойнькомпьютер дээражиллуулахболомжийг олгодог.Хэд хэдэн томоохонхөтөлбөрүүдийн нөөцийгхамгийн сайнашиглахын тулд, хэсэгт, нэгэн зэрэгажиллуулах боломжтой байдагболохоорхэд хэдэнхөтөлбөрсегмент, багцалсанболно.Эдгээр аргаөргөнулмаасорчин үеийнкомпьютерхарьцангуй ихсанах ойгодоохэрэглэжбайна."
    },
    {
        "SrNo": "1287",
        "english": "Select",
        "mongolian_description": "Тухайн текстийг хулганы заагчаар тодруулж зөөх болон арилгах үйлдэл."
    },
    {
        "SrNo": "1288",
        "english": "Select",
        "mongolian_description": "Хулганы зүүн товчийг дарсанаар файл болон фолдерийг дэлгэцний заагч сум ашиглан сольж болно."
    },
    {
        "SrNo": "1289",
        "english": "Select",
        "mongolian_description": "SQL "
    },
    {
        "SrNo": "1290",
        "english": "Select all",
        "mongolian": "Бүгдийг сонгох",
        "mongolian_description": "Хэрэглэгчийнбүх зүйлийгсонгохболомжийг олгодог.Хулганаэсвэлгарынтовчашиглан үйлдэл гүйцэтгэнэ.Үйлдлийгявуулахөмнө, өөрөөр хэлбэл устгах, засах,  фонт өөрчлөх."
    },
    {
        "SrNo": "1291",
        "english": "Selective Transmit Diversity",
        "abbreviation": "STD",
        "english_description": "A transmit diversity technique using multiple base stations to originate the signal and provide spatial diversity on the downlink. In STD, the transmitter selection is based on a QoS measurement made at the mobile station. See also transmit diversity, TDTD and TSTD."
    },
    {
        "SrNo": "1292",
        "english": "Self extracting archive",
        "mongolian_description": "Файлууд бас байдагньхуулжтатаж аваххэмжээг багасгахзорилгоорнэгболгоннэгтгэжбайгааүед энэ ньхэрэгжихтусдаахандаххөтөлбөрийншаардлагагүйгээр, файлуудыгялгаж,өөрөөзадалжархивлана."
    },
    {
        "SrNo": "1293",
        "english": "Sent mail",
        "mongolian": "Майл илгээх",
        "mongolian_description": "Sent mail нь хэзээ ямар газраас илгээгдсэн нь эмайл програм дотор хадгалагдсан байна."
    },
    {
        "SrNo": "1294",
        "english": "Sequence",
        "mongolian": "Дэс дараалал",
        "mongolian_description": "Ямар нэгэн зүйл гаралтандаа зөөх дараалал юм."
    },
    {
        "SrNo": "1295",
        "english": "Sequential access",
        "mongolian": "Дараалсан хандалт",
        "mongolian_description": "Дэс дараалан хандах зүйлс нь  файлын логик эхлэх  утга  нь, нэг удаа нэг унших зориулалтай байна."
    },
    {
        "SrNo": "1296",
        "english": "Sequential file",
        "mongolian": "Дараалсан файл",
        "mongolian_description": "Дарааллын дагуу физик өгөгдөл цуваагаар  дамжихийг хэлнэ."
    },
    {
        "SrNo": "1297",
        "english": "Serial access",
        "mongolian": "Дараалсан /// Цуваа хандалт",
        "mongolian_description": "Цуваахандалт нь хаана уншижбайгааг,файлын физик эхлэх утга хадгалах дарааалалтай байна."
    },
    {
        "SrNo": "1298",
        "english": "Serial data transmission",
        "mongolian": "Цуваа өгөгдөл дамжуулах",
        "mongolian_description": "Цувааөгөгдөл дамжуулахадижилөгөгдөлшугамын дагуударааланньтэмдэгтийннэгбитилгээдэг.Энэ ньцуваанэвтрүүлгүүд, зөвхөн хоёрутас(өгөгдлийн шугам,газар, буцах мөр) шаардагдана."
    },
    {
        "SrNo": "1299",
        "english": "Serial file",
        "mongolian_description": "Сериал файл гэдэг нь дараалсан өгөгдлүүдийн нэгдэл юм. Хэрвээ тухайн нэг бичлэгийг сэргээх шаардлага гарвал бүх бичлэгийг  нь унших хэрэгтэй. Хэрвээ бичлэг болохгүй байвал устгагдсан файлын төгсгөл хүртэл унших боломжтой. Устгагдсан бичлэг нь интервалд бүр мөсөн устах тул дахин ашиглах боломжгүй мөн бүрэн сэргээх боломжгүй юм."
    },
    {
        "SrNo": "1300",
        "english": "Serial line internet protocol ",
        "mongolian": "Цуваа шугамын IP",
        "abbreviation": "SLIP",
        "mongolian_description": "Зөвхөн телефоны шугам ашиглан хувийн  компьютертай хэрэглэгчдэд интэрнэтийн үйлчилгээг ашиглах боломж олгодог интернэт протокол. Гэвч TCP/IP протоколыг бүрэн ашигладаг.Тухайн хэрэглэгчийн хувьд бүрэн интернэтийн хандалттай байх ёстой."
    },
    {
        "SrNo": "1301",
        "english": "Server",
        "mongolian_description": "Зөвшөөрөлтэй сүлжээн дэх бусад дурын компьютеруудад ашиглагдах нөөцийг хангах сүлжээний компьютер."
    },
    {
        "SrNo": "1302",
        "english": "Server side",
        "mongolian_description": "Сүлжээн дэх сервер дээр болж байгаа үйл явдлыг чиглүүлэхийг хэлнэ.Хэрэглэгчийн машин биш."
    },
    {
        "SrNo": "1303",
        "english": "Server side includes ",
        "abbreviation": "SSI",
        "mongolian_description": "SSI скрипт ньвеб хуудас дотор агуулагдсан байна.Скрипт нь веб хуудсыг хэрэглэгчийн машин руу илгээхээс өмнө сервер дээр хийгддэг.Жишээлбэл: Веб хуудасны дотор гаднаас файл оруулах.  "
    },
    {
        "SrNo": "1304",
        "english": "Service arc",
        "english_description": "The arc of the geostationary satellite orbit within which the space station could provide the required service (the required service depends upon the system characteristics and user requirements) to all of its associated earth stations in the service area."
    },
    {
        "SrNo": "1305",
        "english": "Service area",
        "english_description": "Area associated with a station for a given service and a specified frequency under specified technical conditions where radiocommunications may be established with existing or projected stations and within which the protection afforded by a frequency assignment or allotment plan or by any other agreement must be respected.",
        "description": "Note 1 – Several separate service areas involving both reception and/or transmission, may be\r\nassociated with the same station.\r\nNote 2 – The technical conditions include the following: characteristics of the equipment used\r\nboth at the transmitting and receiving stations, how it is installed, quality of transmission desired\r\nand operating conditions"
    },
    {
        "SrNo": "1306",
        "english": "Service area",
        "english_description": "The specified area over which the operator of a wireless communications network or system provides services."
    },
    {
        "SrNo": "1307",
        "english": "Service pack",
        "mongolian_description": "Service pack нь програм хангамж дээр гарч буй асуудал байвал түүнийг засварлах програмууд болон  өгөгдлийн файлуудын нэгдлийг хэлнэ.Энэ нь анх гаргасан програм хангамжийн хэсгийг дарж суулгасан байна."
    },
    {
        "SrNo": "1308",
        "english": "Service Provider",
        "english_description": "A company that provides services and subscriptions to telephone, mobile phone and Internet users."
    },
    {
        "SrNo": "1309",
        "english": "Set",
        "mongolian": "Тохируулга",
        "mongolian_description": "Ямар нэг зүйлийг үнэн зөв хийхийн тулд шаардлагатай тохиргоог зөв хийх."
    },
    {
        "SrNo": "1310",
        "english": "Settings",
        "mongolian": "Тохиргоо",
        "mongolian_description": "Системийн статус болон сонгогдсон шинж чанарыг тайлбарлах ерөнхий нэр томъёо юм."
    },
    {
        "SrNo": "1311",
        "english": "Set-up Audio Tone",
        "abbreviation": "SAT",
        "english_description": "An audio tone in the 6 kHz range added to the downlink or forward channel in analog cellular systems. The mobile detects and returns the tone. The SAT tone is used to determine channel continuity, and only one SAT tone is usually assigned to a base station or sector."
    },
    {
        "SrNo": "1312",
        "english": "Shadow fading",
        "english_description": "A phenomenon that occurs when a mobile moves behind an obstruction and experiences a significant reduction in signal power."
    },
    {
        "SrNo": "1313",
        "english": "Shared Secret Data",
        "abbreviation": "SSD",
        "english_description": "Part of an encryption process supporting authentication of mobile phones. It uses an encryption key installed in the phone at the time of activation and known to the system through an entry in the HLR, that protects signalling and identity information. It can also be used to establish a voice privacy key."
    },
    {
        "SrNo": "1314",
        "english": "Shareware",
        "mongolian_description": "᠋᠌᠌᠌᠌Програм хангамжын туршилтын хугацаанд түүнийг үнэгүй ашиглах (гол төлөв түгээлт) олгох тусгай зөвшөөрөл юм. Хэрэв хэрэглэгч цаашид үргэлжлүүлэн ашиглах хүсэлтэй бол төлбөр төлөх ёстой. Ингэснээр сайжруулсан хувилбар болон гарын авлагыг авах боломжтой."
    },
    {
        "SrNo": "1315",
        "english": "Sheet",
        "mongolian": "Хуудас",
        "mongolian_description": "Хүснэгттэй ажиллах програм хангамжын ажлын талбар."
    },
    {
        "SrNo": "1316",
        "english": "Sheet feeder",
        "mongolian": "Хуудас нийлүүлэгч",
        "mongolian_description": "Хэвлэгчийн хувьд: хуудас тайран нийлүүлгч (мөн хуудас нийлүүлэгч гэж нэрлэдэг) хуудсыг тус тусд нь автоматаар хэвлэх боломжийг олгодог."
    },
    {
        "SrNo": "1317",
        "english": "Shift Key",
        "mongolian": "Шилжих товч",
        "mongolian_description": "Шилжих товчийг удаан дарж өөр нэг тэмдэгттэй цуг ашиглах үед олон боломжууд гарч ирдэг."
    },
    {
        "SrNo": "1318",
        "english": "Ship station",
        "english_description": "A mobile station in the maritime mobile service located on board a vessel which is not permanently moored, other than a survival craft station."
    },
    {
        "SrNo": "1319",
        "english": "Short message service",
        "mongolian": "Захидлын үйлчилгээ",
        "abbreviation": "SMS",
        "mongolian_description": "Гар утаснаасаа захидал илгээх боломж"
    },
    {
        "SrNo": "1320",
        "english": "Short Messaging Service (Service Management System)",
        "abbreviation": "SMS",
        "english_description": "A store and forward message service available on most second generation digital systems that allows short messages (up to 140 octets) to be sent to the mobile and displayed on a small screen. The control and signalling channels are normally used to deliver these messages."
    },
    {
        "SrNo": "1321",
        "english": "Shortcut",
        "mongolian_description": "Ямар нэг зүйлийг хурдан хийх аргыг хэлнэ. Жишээ нь: байрлалыг товчлох (дүрсээр мэт харагддаг) тухайн програмыг хурдан аргаар олж ажиллуулах."
    },
    {
        "SrNo": "1322",
        "english": "Shrink-to-fit",
        "mongolian": "Багасгаж тохируулах",
        "mongolian_description": "Тухайн дэлгэцэнд тохируулж зургийг багасгах"
    },
    {
        "SrNo": "1323",
        "english": "Shutdown",
        "mongolian": "Унтраах",
        "mongolian_description": "Компьютерийг унтраах"
    },
    {
        "SrNo": "1324",
        "english": "Sideband",
        "mongolian": "Хажуугийн зурвас",
        "mongolian_description": "Синулэг зөөгч давтамжаас дээш болон доош байрлах давтамжийн зурвас ба модуляцаас үүсгэгдэх шаардлагатай спекрийн бүрэлдэхүүн хэсгүүдийг багтаасан байдаг."
    },
    {
        "SrNo": "1325",
        "english": "Sideband",
        "english_description": "A frequency band lying above or below a sinusoidal carrier frequency and containing spectral components of significance produced by modulation."
    },
    {
        "SrNo": "1326",
        "english": "Sig file",
        "mongolian_description": "Автоматаар и-мэйлийн төгсгөлд гарч ирэх текст хэсэг (жишээ нь холбоо барих мэдээлэл)"
    },
    {
        "SrNo": "1327",
        "english": "Signal",
        "mongolian": "Дохио",
        "mongolian_description": "Дохио гэдэг нь зарим үзэгдлийн зан буюу шинж чанарын тухай мэдээллийг дамжуулах үйл ажиллагаа юм. Цахилгаан, цахилгаан эрчим хүч нь холбосон сувгийн дагуу өөр нэг хэлхээнд нэг цэгээс дамждаг. Дохио нь аналоги болон тоон өгөгдөл байж болно. "
    },
    {
        "SrNo": "1328",
        "english": "Signal Booster",
        "english_description": "Compensates for loss of effect (weakening of the signal in the co-axial cable) between the outer antenna and the phone. Applies to both incoming and outgoing signals."
    },
    {
        "SrNo": "1329",
        "english": "Signal System 7",
        "abbreviation": "SS7",
        "english_description": "International standard protocol defined for open signaling in the digital public switched network. It is based on a 64 kbps channel and allows for information transfer for call control, database and billing management, and for maintenance functions."
    },
    {
        "SrNo": "1330",
        "english": "Signaling Control Channel",
        "abbreviation": "SCCH",
        "english_description": "A logical channel used in the PDC system to convey signalling information between the mobile and the network."
    },
    {
        "SrNo": "1331",
        "english": "Signal-to-interference ratio",
        "abbreviation": "S/I",
        "english_description": "See signal-to-interference ratio."
    },
    {
        "SrNo": "1332",
        "english": "Signal-to-interference ratio",
        "english_description": "The ratio of power in a signal to the interference power in the channel. The term is usually applied to lower frequency signals, such as voice waveforms, but can also be used to describe the carrier wave. See also carrier-to-interference ratio."
    },
    {
        "SrNo": "1333",
        "english": "Signal-to-interference ratio; signal/interference ratio",
        "english_description": "The ratio, generally expressed in decibels, of the power of the wanted signal to the total power of interfering signals and noise, evaluated in specified conditions at a specified point of a transmission channel.",
        "description": "Note 1 – A distinction is made, for example, between: – at the receiver input, the radio-frequency (RF) signal-to-interference ratio; – at the receiver output, the audio-frequency (AF) signal-to-interference ratio and the video-frequency (VF) signal-to-interference ratio. Note 2 – In each individual case, the noise and interfering signals taken into account should be specified. Note 3 – The term “signal-to-disturbance ratio” or its abbreviated form “signal/disturbance ratio”, which is already used for electromagnetic compatibility, may be used as a synonym."
    },
    {
        "SrNo": "1334",
        "english": "Signal-to-noise ratio",
        "abbreviation": "S/N",
        "english_description": "See signal-to-noise ratio."
    },
    {
        "SrNo": "1335",
        "english": "signal-to-noise ratio",
        "english_description": "The ratio of power in a signal to the noise power in the channel. This term is usually applied to lower frequency signals, such as voice waveforms. See also carrier-to-noise ratio."
    },
    {
        "SrNo": "1336",
        "english": "Signal-to-Noise Ratio",
        "abbreviation": "SNR",
        "english_description": "See signal-to-noise ratio."
    },
    {
        "SrNo": "1337",
        "english": "Silicon chip",
        "mongolian_description": "Түгээмэл нэршил нь  интеграл схем (силикон) чип юм. Тухайлбал микро хэлхээн дэхбүтцийн хувьд нягт(транзистор болон конденсатор зэрэг) цахиурын маш нимгэн зүсмэл бүрэлдэхүүн хэсгээс бүрэлдсэн чип юм."
    },
    {
        "SrNo": "1338",
        "english": "Simple object access protocol ",
        "abbreviation": "SOAP",
        "mongolian_description": "XML-д суурилсан сүлжээгээр мессеж харилцан солилцоход зориулагдсан стандарт бөгөөд  өөр үйлдлийн системүүд дээр ажиллаж байгаа програмуудад зөвшөөрөгддөг."
    },
    {
        "SrNo": "1339",
        "english": "Simplex",
        "mongolian": "Симплэкс",
        "mongolian_description": "Мэдээлэл дамжуулах чиглэл илэрхийлдэг.Тэр дуплекс буюу бүрэн дуплекс гэж нэрлэдэг. тэр үед аль аль чиглэлд, байж болно, эсвэл нэг чиглэлд зөвхөн энгийн гэж нэрлэдэг."
    },
    {
        "SrNo": "1340",
        "english": "Simulation",
        "mongolian": "Загварчлал",
        "mongolian_description": "Програм хангамжийн янз бүрийн загварын нөхцөлийн нөлөөг харуулахын тулд бүрэлдэхүүн хэсгийг "
    },
    {
        "SrNo": "1341",
        "english": "Single sideband",
        "abbreviation": "SSB",
        "english_description": "Pertaining to a transmission or emission where only either the lower sideband or the upper sideband resulting from amplitude modulation is preserved."
    },
    {
        "SrNo": "1342",
        "english": "Single sideband ",
        "mongolian": "Дан хажуугийн зурвас",
        "mongolian_description": "Зөвхөн бага хажуугийн зурвасд буюу агуургийн модуляц үр дүнд дээд хажуугийн зурвасд аль хадгалагдан үлдсэн байдаг бөгөөд энэ нь дамжуулах эсвэл ялгаруулалт холбоотой."
    },
    {
        "SrNo": "1343",
        "english": "Single spacing ",
        "mongolian": "Дан хоорондын зай",
        "mongolian_description": "Нэг зайтай текстийн мөрнүүдийн хооронд хоосон мөр байж болохгүй."
    },
    {
        "SrNo": "1344",
        "english": "Single stepping",
        "mongolian": "Дан гишгүүр",
        "mongolian_description": "Алхам горим програм нь ганц гишгүүрийн хэрэглэгчийн хяналтын дор нэг удаа тайлангийн гүйцэтгэл юм. Үүнийг гүйцэтгэсний дараа хэрэглэгч тус бүр тайлангийн нөлөөг ажиглах боломжийг олгодог."
    },
    {
        "SrNo": "1345",
        "english": "Single thread",
        "mongolian": "Ганц урсгалтай",
        "mongolian_description": "Нэг багц боловсруулах. Энэ нь илүү нарийн төвөгтэй систем боловсрогддог  эсвэл хэд хэдэн тутмын нэг урсгалтай (олон урсгалаар чиглэсэн биш ) уламжлалт энгийн програм."
    },
    {
        "SrNo": "1346",
        "english": "Single-user licence",
        "mongolian": "Ганц хэрэглэгчийн лиценз",
        "mongolian_description": "Ганц хэрэглэгчийн лиценз нь зөвхөн нэг компьютерт хэрэглэдэг програм хангамж."
    },
    {
        "SrNo": "1347",
        "english": "Site licence",
        "mongolian": "Веб сайтын лиценз",
        "mongolian_description": "Сайтын лиценз нь дурын тооны компьютерийг нэг байрлалд ашиглаж болох програм хангамж юм. Нэг төлбөрөөр олон удаа суулгах боломжтой."
    },
    {
        "SrNo": "1348",
        "english": "Slide",
        "mongolian": "Слайд",
        "mongolian_description": "Текст болон зургийн төрлийг мөн бусад хүссэн зүйлсийг хэсэгчлэн хуудаснуудад хийн танилцуулахад ашигладаг."
    },
    {
        "SrNo": "1349",
        "english": "Slide bar",
        "mongolian": "Слайд бар",
        "mongolian_description": "Програм дэлгэцийн цонх хэтэрхий том үед, тухайн слайд бар босоо буюу хэвтээ програмын дэлгэц дээр тодорхой хэсгийг шилжүүлж өгнө. Мөн “гүйлгэх бар” гэж нэрлэдэг."
    },
    {
        "SrNo": "1350",
        "english": "Slide master",
        "mongolian": " Слайд мастер",
        "mongolian_description": "Пресентейшнд энэ нь тусгай слайд ба пресентейшний бүхий л слайдуудын загварыг тодорхойлдог."
    },
    {
        "SrNo": "1351",
        "english": "Slideshow presentation",
        "mongolian": "Слайд танилцуулах",
        "mongolian_description": "Мультимедиа програм хангамжийг танилцуулах  слайд юм. Танилцуулгийг том дэлгэц эсвэл проектор тавьж  бүх  үзэгчид харх боломж олгоно."
    },
    {
        "SrNo": "1352",
        "english": "Slot",
        "mongolian": "Слот, нүхлэх, сэтлэх, ангархай, нүх, ховил, хором, зурвас, хоног",
        "mongolian_description": "Энэ нь  диск төхөөрөмж болон сүлжээний интерфэйсүүд гэх мэт нэмэлт  бүрэлдэхүүн хэсэгүүдийг  компьютерт холбоход ашигладаг залгуур(оролт) юмаа. Мөн эдгээр залгууруудыг өргөтгсөн слот гэж нэрлэдэг. Олон тооны солтуудаар хангасанаар нэмэлт бүрээлдэхүүн хэсэгүүдийн тоог илүү ихээр нэмэлтүүдийг боломжтой. "
    },
    {
        "SrNo": "1353",
        "english": "Slotted ALOHA ",
        "english_description": "An access technique synchronizing the transmitters to time-slots in the channel and having the transmitter wait until the next available slot to send its packet"
    },
    {
        "SrNo": "1354",
        "english": "Slow Associated Control Channel",
        "abbreviation": "SACCH",
        "english_description": "A low-speed control channel associated with a traffic channel and used to transmit supervision and control messages between the mobile and the network."
    },
    {
        "SrNo": "1355",
        "english": "Slow Dedicated Control Channel",
        "abbreviation": "SDCCH",
        "english_description": "A low-speed bi-directional point-to-point control channel used to transmit service request, subscriber authentication, ciphering initiation, equipment validation and traffic channel assignment messages between the mobile and the network."
    },
    {
        "SrNo": "1356",
        "english": "Slow fading",
        "english_description": "A long term fading effect changing the mean value of the received signal. Slow fading is usually associated with moving away from the transmitter and experiencing the expected reduction in signal strength."
    },
    {
        "SrNo": "1357",
        "english": "Slow Frequency Hopped Multiple Access",
        "abbreviation": "SFHMA",
        "english_description": "A spread-spectrum system where the hop (dwell) time is much greater the information symbol period. When hopping is coordinated with other elements in the network, the multiple access interference in the network is greatly reduced."
    },
    {
        "SrNo": "1358",
        "english": "Small computer systems interface ",
        "mongolian": "Жижиг компьютерийн систем интерфэйс",
        "abbreviation": "SCSI",
        "mongolian_description": "Жижиг компьютерийн систем интерфэйс  хамгийн бага зардлаар, микро төхөөрөмжөөр өргөн хүрээтэй өндөр өгөгдөл дамжуулах чадвартай болох зорилготой бас шаардлагатай бол диск төхөөрөмж болон сканнер холбож болно. Йим микро компьютерийг  өргөн хүрээнд ашиглах боломжтой.Тус бүр  интерфэйс долоон хүртэл дагалдах төхөөрөмжүүд  холбож болно."
    },
    {
        "SrNo": "1359",
        "english": "Small scale integration ",
        "mongolian": "Нимгэн метал ялтас нэгтгэх",
        "abbreviation": "SSI",
        "mongolian_description": " 20 хүртлэх логик гарцтай чип нэгдсэн хэлхээний төрөл ба голдуу (хатуу) утастай логик хэлхээнд ашиглаж байна."
    },
    {
        "SrNo": "1360",
        "english": "Smard card ",
        "mongolian": "Смарт карт",
        "mongolian_description": "Кредит картны хэмжээтэй дотроо нэг эсвэл түүнээс илүү хагас дамжуулагч агуулсан байдаг."
    },
    {
        "SrNo": "1361",
        "english": "Snail mail",
        "mongolian": "Удаан хугацаагаар дамжуулдаг шуудан",
        "mongolian_description": "Жирийн  шуудантай зэрэгцүүлж байруулах хэрэглээний  шуудан"
    },
    {
        "SrNo": "1362",
        "english": "Soft handoff",
        "english_description": "A process of establishing a call connection simultaneously to two separate base stations in a CDMA system. This technique allows the use of a dual path in the handoff region to improve performance. Soft handoff can only occur between base stations using the same RF channel. See also hard handoff."
    },
    {
        "SrNo": "1363",
        "english": "Software",
        "mongolian": "Программ хангамж",
        "mongolian_description": "Компьютер програм хэрэглэх мөн компьтерийн системийг удирдах  эсвэл  программ  хангамжийн  санал,маягт ажилын  хүснэгтээр ажиллаж сурах."
    },
    {
        "SrNo": "1364",
        "english": "Software library ",
        "mongolian": "Программ хангамжийн цугуулга",
        "mongolian_description": "Энэ нь хэрэглэгчийн програмд ачаалахад зориулсан машины код буюу иж бүрэн програм хангамжийн багц."
    },
    {
        "SrNo": "1365",
        "english": "Software Licence",
        "mongolian": "Программ хангамжийн лиценз",
        "mongolian_description": "Программ хангамжийг худалдан авах үед програм хангамж ашиглах  нөхцөл өгдөг лиценз бий болдог (мөн лиценз гэрээ буюу хэрэглэгчийн лицензийн гэрээ, EULA гэж нэрлэдэг). Эдгээр бүтээгдэхүүн хоорондох нөхцөл ихээхэн ялгаатай байна. Түүний лиценз нь зөвшөөрөгдөөгүй програм хангамжийг ашиглах нь хууль бус юм."
    },
    {
        "SrNo": "1366",
        "english": "Space diversity",
        "english_description": "A diversity technique widely used in wireless systems since the very beginning. It consists of two receive antennas physically (spatially) separated to provide decorrelated receive signals."
    },
    {
        "SrNo": "1367",
        "english": "Space diversity reception",
        "english_description": "Diversity reception in which several antennas are used at appropriate distances from each other in a radio station.",
        "description": "Note – For line-of-sight radio-relay systems, separation is generally vertical, whereas for transhorizon radio-relay systems, it is generally horizontal."
    },
    {
        "SrNo": "1368",
        "english": "Space Division Multiple Access",
        "abbreviation": "SDMA",
        "english_description": "Also known as multiple beam frequency reuse, this technique employs spot beam antennas to reuse frequencies by pointing the antenna beams using the same frequency in different directions."
    },
    {
        "SrNo": "1369",
        "english": "Space probe",
        "english_description": "A spacecraft designed for making observations or measurements in space."
    },
    {
        "SrNo": "1370",
        "english": "Space radiocommunication",
        "mongolian": "Сансрын радио холбоо",
        "mongolian_description": "Нэг буюу хэд хэдэн сансрын станц ашиглах, эсвэл нэг буюу хэд хэдэн орон зайд хиймэл дагуул болон бусад обьектуудыг тусгасан ямар нэгэн Радио холбоо."
    },
    {
        "SrNo": "1371",
        "english": "Space radiocommunication",
        "english_description": "Any radiocommunication involving the use of one or more space stations or the use of one or more reflecting satellites or other objects in space."
    },
    {
        "SrNo": "1372",
        "english": "Space station",
        "mongolian": "Сансрын станц",
        "mongolian_description": "Дэлхийн агаар мандлын үндсэн хэсэгт байрлах бөгөөд  дамжуулах үүрэгтэй  обьект дээр оршдог станц юм."
    },
    {
        "SrNo": "1373",
        "english": "Space station",
        "english_description": "A station located on an object which is beyond, is intended to go beyond, or has been beyond, the major portion of the Earth’s atmosphere."
    },
    {
        "SrNo": "1374",
        "english": "Space system",
        "english_description": "Any group of cooperating earth stations and/or space stations employing space radiocommunication for specific purposes"
    },
    {
        "SrNo": "1375",
        "english": "Specialized Mobile Radio",
        "abbreviation": "SMR",
        "english_description": "A service defined by the FCC operating in the 800 MHz and 900 MHz bands providing a variety of 2-way communications services to various users. This is the basic 2-way trunked service used by many companies in the construction and service industries. These frequencies are gradually being converted to ESMR operation."
    },
    {
        "SrNo": "1376",
        "english": "Spectrum spreading",
        "english_description": "The process of increasing the occupied spectrum of a signal well beyond that needed to transmit the information."
    },
    {
        "SrNo": "1377",
        "english": "Speech coding",
        "english_description": "An electronic process of sampling and digitizing a voice signal."
    },
    {
        "SrNo": "1378",
        "english": "Spot noise factor, spot noise figure",
        "english_description": "The ratio of the exchangeable power spectral density of the noise appearing at a given frequency at the output of a given linear two-port electrical network, to the spectral density which would be present at the output if the only source of noise were the thermal noise due to a one-port electrical network connected to the input and which is assumed to have at all frequencies a noise temperature equal to the reference thermodynamic temperature fixed, by convention, around 290 K.",
        "description": "Note 1 – The spot noise factor F( f ) is related to the equivalent spot noise temperature T( f ) as follows: 0 ( ) ( ) 1 T T f F f = + where T0 is the thermodynamic reference temperature. Note 2 – The value of the ratio F( f ) may be expressed in decibels. In English, the term “noise factor” is generally employed when the ratio is expressed arithmetically, and “noise figure” is employed when the ratio is expressed in decibels."
    },
    {
        "SrNo": "1379",
        "english": "Spot noise temperature",
        "mongolian": "Шуугианы температур",
        "mongolian_description": "Boltzmann байнгын хувааж нэг порт цахилгаан сүлжээний тухайн давтамж, дээр арилжиж дуу чимээ чадлын спектр."
    },
    {
        "SrNo": "1380",
        "english": "spot noise temperature",
        "english_description": "The exchangeable noise power spectral density at a given frequency of a one-port electrical network, divided by Boltzmann’s constant.",
        "description": "Note 1 – This definition assumes that quantum effects are negligible. Note 2 – The spot noise temperature has the sign of the real part of the network impedance. Note 3 – If the network has an impedance with a positive real part, its noise temperature at a given frequency equals the thermodynamic temperature to which a resistor equal in value to the real part of the impedance should be brought in order to obtain an available power of thermal noise equal to the available power of the noise of the network at the same frequency. Note 4 – A receiving antenna can be regarded as a one-port electrical network when viewed from its output port."
    },
    {
        "SrNo": "1381",
        "english": "Spread Rate",
        "abbreviation": "SR",
        "english_description": "Spread rate is also known as the chip rate and is the rate of the digital code used to spread the information. The spreading rate is typically at least 100x the information rate."
    },
    {
        "SrNo": "1382",
        "english": "Spread spectrum",
        "english_description": "A term used to describe a system that uses spectrum spreading techniques in its operation."
    },
    {
        "SrNo": "1383",
        "english": "Spread Spectrum",
        "abbreviation": "SS",
        "english_description": "See spread spectrum"
    },
    {
        "SrNo": "1384",
        "english": "Spreading loss",
        "english_description": "The attenuation of an electromagnetic wave due uniquely to the fact that with increasing distance the energy is distributed over a wider area.",
        "description": "Note – In a homogeneous and isotropic medium, the spreading loss is characterized by a decrease of the power flux-density in proportion to the reciprocal of the square of the distance to the source."
    },
    {
        "SrNo": "1385",
        "english": "Spurious emission",
        "english_description": "Emission on a frequency or frequencies which are outside the necessary bandwidth and the level of which may be reduced without affecting the corresponding transmission of information. Spurious emissions include harmonic emissions, parasitic emissions, intermodulation products and frequency conversion products, but exclude out-of-band emissions."
    },
    {
        "SrNo": "1386",
        "english": "Standard frequency",
        "english_description": "A frequency with a known relationship to a frequency standard.",
        "description": "Note – The term standard frequency is often used for the signal whose frequency is a standard frequency."
    },
    {
        "SrNo": "1387",
        "english": "Standard-time-signal emission",
        "english_description": "An emission which disseminates a sequence of time signals at regular intervals with a specified accuracy."
    },
    {
        "SrNo": "1388",
        "english": "Station",
        "english_description": "One or more transmitters or receivers of a combination of transmitters and receivers, including the accessory equipment, necessary at one location for carrying on a radiocommunication service, or the radioastronomy service.",
        "description": "Note 1 – In the RR, each station shall be classified by the service in which it operates permanently or temporarily.Note 2 – Radiocommunication service; Service de radiocommunication; Servicio de\r\nradiocomunicación (RR 1.19)."
    },
    {
        "SrNo": "1389",
        "english": "Station (radio)",
        "mongolian": "станц ",
        "mongolian_description": "Сансрын радио сүлжээ болон радио холбооны сүлжээг ашиглан дамжуулахад 1 газарт байрласан нэвтрүүлэгч ба дамжуулагч мөн нэмэлт төөөрөмжүүд шаардлагатай."
    },
    {
        "SrNo": "1390",
        "english": "Stationary satellite",
        "english_description": "A satellite which remains fixed in relation to the surface of the primary body; by extension, a satellite which remains approximately fixed in relation to the surface of the primary body.",
        "description": "Note – A stationary satellite is a synchronous satellite with an orbit which is equatorial, circular and direct."
    },
    {
        "SrNo": "1391",
        "english": "Station-keeping satellite",
        "english_description": "A satellite, the position of the centre of mass of which is controlled to follow a specified law, either in relation to the positions of other satellites belonging to the same space system or in relation to a point on Earth which is fixed or moves in a specified way."
    },
    {
        "SrNo": "1392",
        "english": "Streaming media ",
        "mongolian": "Өгөгдөл дамжуулах",
        "mongolian_description": "Цахим хуудсанд өгөгдөл татаж байхад мэдээлэл (дуу болон видео)–ийг саатал багатайгаар үзүүлэх техник. Тоглуулагдахаас өмнө буфер хийхийн тулд видеоны эхний хэдэн секунд татагдсан байх хэрэгтэй. Тоглуулагч програм ажиллаж эхлэхэд эхний дүрсүүд тоглогдож байх үед дараа дараагийн дүрсүүд буферлэгдэн татагдсан байна. Энэ аргын онцлог нь хэрэглэгчийн компьютер дээр тоглуулагдаад дуусан дүрсний өгөгдөл хадгалагддаггүй."
    },
    {
        "SrNo": "1393",
        "english": "String ",
        "mongolian": "Тэмдэгт мөр, цуваа, жагсаалт, урсгал",
        "mongolian_description": "Тэмдэгтүүдийн жагсаалт бүхий текстэн өгөгдөл юм. Тухайлбал үг болон цэг таслал гэх мэт."
    },
    {
        "SrNo": "1394",
        "english": "String data ",
        "mongolian": "Стринг дата",
        "mongolian_description": "Стринг дата нь тэмдэгтүүдийн жагсаалт бүхий текстэн өгөгдөл юм. Жишээ нь үг болон цэг таслал гэх мэт. Стринг өгөгдөл нь тэмэгтүүдээс бүрдэх ба хэмжээ нь өөр өөр байж болно."
    },
    {
        "SrNo": "1395",
        "english": "String operator ",
        "mongolian": "Стринг оператор",
        "mongolian_description": "Стринг оператор нь нийлүүлэлт сэлгэлт гэх мэт үйлдлүүдийг ашиглан стрингүүдийг нийлүүлэх эсвэл өөрчлөх үйлдлийг хийнэ."
    },
    {
        "SrNo": "1396",
        "english": "Structure diagram ",
        "mongolian": "Бүтцийн зураг",
        "mongolian_description": "Програмын эсвэл системийн загварыг төлөөлөн хийх зорилготой. Үүнд түвшингүүдийн дугаар, тус бүр нь бүх л загварыг гэхдээ хэсгүүдийн ахисан түвшинд тодорхойлдог."
    },
    {
        "SrNo": "1397",
        "english": "Structured Systems Analysis and Design Method ",
        "abbreviation": "SSADM",
        "mongolian_description": "Нэгдсэн Вант улсын засгийн газар болон  арилжааны байгуулагуудын өргөн ашигладаг том хэмжээний програмын багцын шинжилгээний болон загварчилалын стандарт арга юм."
    },
    {
        "SrNo": "1398",
        "english": "Style ",
        "mongolian": "Хэв маяг, загвар",
        "mongolian_description": "Үг боловсруулах болон бусад програмын тэмдэгтүүдийг тодруулах, налуу болгох гэх мэтийг хийдэг."
    },
    {
        "SrNo": "1399",
        "english": "Style sheet ",
        "mongolian": "Хуудасны хэв маяг загвар ",
        "mongolian_description": "Үүний тусламжтайгаар баримт бичигт ямар фонт, хэмжээтэйгээр бичих вэ гэдгээ хэрэглэгч тодорхойлж болно. Толгой хэсэг, текстийн хэсэг болон тайлбарын хэсгүүд нь тухайн хуудсанд бүгд өөр өөр хэв маягтай байлгаж болно. Шинэ тэмдэгтүүдийн хэлбэрийн багцыг загвар болгон хадгалаж болно. Энэ хуудас нь эдгээр бүх загваруудыг өөртөө агуулсан байна."
    },
    {
        "SrNo": "1400",
        "english": "Stylus ",
        "mongolian": "Бичигч элемент",
        "mongolian_description": "График таблет болон PDA-д зурахад ашиглагддаг үзэг хэлбэртэй төхөөрөмж."
    },
    {
        "SrNo": "1401",
        "english": "Subcript ",
        "mongolian": "Индекс",
        "mongolian_description": "Текстийн үндсэн шугамаас доор тэмдэглэгдсэн тэмдэгт."
    },
    {
        "SrNo": "1402",
        "english": "Subdirectory ",
        "mongolian": "Дэд каталоги",
        "mongolian_description": "Дэд директори гэдэг нь директори доторх директорийг хэлнэ. Дэд директорид файл эсвэл өөр нэг дэд директори эсвэл аль аль  нь байж болно."
    },
    {
        "SrNo": "1403",
        "english": "Subfolder ",
        "mongolian": "Дэд хавтас",
        "mongolian_description": "Дэд хавтас гэдэг нь хавтас доторх хавтасыг хэлнэ. Үүнд файл эсвэл өөр нэг дэд хавтас эсвэл аль аль нь байх боломжтой."
    },
    {
        "SrNo": "1404",
        "english": "Subheading ",
        "mongolian": "Дэд сэдэв",
        "mongolian_description": "Баримт бичигтэй хамааралтай толгой мэдээлэл эсвэл гарчиг. Энэ нь ихэвчлэн мөрийн зүүн гар талд байрладаг."
    },
    {
        "SrNo": "1405",
        "english": "Subprogram ",
        "mongolian": "Дэд програм",
        "mongolian_description": "Том цогц даалгавруудыг арилган жижиг даалгавруудад хуваах зорилготой програмчлалын арга юм."
    },
    {
        "SrNo": "1406",
        "english": "Subprogram ",
        "mongolian": "Дэд програм",
        "mongolian_description": "Онгцой даалгавар гүйцэтгэдэг програмын багц юм. Гэхдээ бүрэн програм биш юм. Зөвхөн шаардлагатай үед л програмд орж ажиллана."
    },
    {
        "SrNo": "1407",
        "english": "Subscribe ",
        "mongolian": "Мэйлд жагсаалт үүсгэх",
        "mongolian_description": "Цахим шуудангын жагсаалтад эсвэл мэдээний бүлэг хэсэгт нэгдэхийг хэлнэ."
    },
    {
        "SrNo": "1408",
        "english": "Subscribe ",
        "mongolian": "Захиалах, зөвшөөрөх ",
        "mongolian_description": "Зарим цахим хэлэлцүүлэг өөртөөгөө нэгтгэхийн тулд бүртгүүлж хэлэлцүүлэгт шинэ зурвас нийтлэгдсэн тохиолдолд автоматаар таны шууданд мэдээллэх болно."
    },
    {
        "SrNo": "1409",
        "english": "Subscriber Identity Module Card",
        "abbreviation": "SIM Card",
        "english_description": "A small printed circuit board that must be inserted in any GSM-based mobile phone when signing on as a subscriber. It contains subscriber details, security information and memory for a personal directory of numbers. A Subscriber Identity Module is a card commonly used in a GSM phone. The card holds a microchip that stores information and encrypts voice and data transmissions, making it close to impossible to listen in on calls. The SIM card also stores data that identifies the caller to the network service provider."
    },
    {
        "SrNo": "1410",
        "english": "Sub-synchronous (super-synchronous) satellite",
        "english_description": "A satellite for which the mean sidereal period of revolution about the primary body is a submultiple (an integral multiple) of the sidereal period of rotation of the primary body about its own axis."
    },
    {
        "SrNo": "1411",
        "english": "SUM ",
        "mongolian": "Дүн, дүгнэлт, хэмжээ, нийт дүн, нийлбэр",
        "mongolian_description": "Тоонуудыг нэмсэний үр дүн. Хүснэгттэй ажиллаж байгаа үед НИЙЛБЭР буюу SUM нь функц болдог."
    },
    {
        "SrNo": "1412",
        "english": "Super High Frequency",
        "abbreviation": "SHF",
        "english_description": "The RF spectrum between 3 GHz and 30 GHz."
    },
    {
        "SrNo": "1413",
        "english": "Super-computer ",
        "mongolian": "Хүчин чадал сайн компьютер",
        "mongolian_description": "Асар хурдан ажилладаг маш том компьютерийг хэлнэ. Энэ нь ихэвчлэн олон процессортой параллель ажиллагаатай байдаг. Өгөгдөл нэгэн зэрэг боловсруулагдсанаар ажлуудыг маш хурдтай гүйцэтгэдэг. Жишээ нь цаг агаарын мэдээ цуглуулдаг компьютер болон нисэх онгоцны загварыг турших гэх мэт."
    },
    {
        "SrNo": "1414",
        "english": "Supplementary services",
        "english_description": "A group of network layer protocol functions that provide call independent functions for mobile phones. These include: call forwarding, follow-me, advice of charge, reverse charging, etc."
    },
    {
        "SrNo": "1415",
        "english": "Suppressed carrier",
        "mongolian": "нам зөөгч дохио",
        "mongolian_description": "Синуслэг зөөгч бүрэлдэхүүн хүч нь ерөнхийдөө шинээр зохион demodulation ашиглаж чадахгүй байгаа тийм гэж түвшинд хүртэлбуурсан байна далайцын модуляц нь дамжуулах эсвэл дэгдэлт холбоотой."
    },
    {
        "SrNo": "1416",
        "english": "Suppressed carrier",
        "english_description": "Pertaining to a transmission or emission with amplitude modulation where the power of the sinusoidal carrier component is reduced to a level such that it generally cannot be reconstituted and used for demodulation.",
        "description": "Note – A carrier is regarded as being supressed when its level is at least 32 dB and preferably 40 dB or more below the peak envelope power of the emission."
    },
    {
        "SrNo": "1417",
        "english": "Survival craft station",
        "english_description": "A mobile station in the maritime mobile service or the aeronautical mobile service intended solely for survival purposes and located on any lifeboat, life-raft or other survival equipment."
    },
    {
        "SrNo": "1418",
        "english": "Symbian",
        "english_description": "Symbian is a bold new venture formed by Nokia, Ericsson, Motorola, and Psion to create easy to use operating systems for wireless devices and personal digital assistants (PDAs). The first operating system is called EPOC and was launched earlier this year."
    },
    {
        "SrNo": "1419",
        "english": "Synchronization Channel",
        "abbreviation": "SCH",
        "english_description": "A logical channel used by mobile stations to achieve time synchronization with the network. Used in GSM, cdma2000, and W-CDMA systems."
    },
    {
        "SrNo": "1420",
        "english": "Synchronized satellite, phased satellite",
        "english_description": "A satellite controlled so as to have an anomalistic period or a nodal period equal to that of another satellite or planet, or to the period of a given phenomenon, and to pass a characteristic point in its orbit at specified instants."
    },
    {
        "SrNo": "1421",
        "english": "Synchronous Digital Hierarchy",
        "abbreviation": "SDH",
        "english_description": "An international standard for synchronous optical transmission. This standard allows the world-wide connection of digital networks."
    },
    {
        "SrNo": "1422",
        "english": "Synchronous Mode",
        "english_description": "Type of transmission in which the transmission and reception of all data is synchronized by a common clock and transmitted in blocks rather than individual characters. This mode gives higher data throughput than asynchronous mode, but can be less secure. Synchronous mode does not require a start and stop codes as in asynchronous mode. Can also mean that the data stream has the same capacity in both directions. See also asynchronous mode."
    },
    {
        "SrNo": "1423",
        "english": "Synchronous satellite",
        "english_description": "A satellite for which the mean sidereal period is equal to the sidereal period of rotation of the primary body about its own axis; by extension, a satellite for which the mean sidereal period of revolution is approximately equal to the sidereal period of rotation of the primary body."
    },
    {
        "SrNo": "1424",
        "english": "System loss",
        "english_description": "The ratio, usually expressed in decibels, for a radio link, of the radio frequency power input to the terminals of the transmitting antenna and the resultant radio frequency signal power available at the terminals of the receiving antenna.",
        "description": "Note 1 – The available power is the maximum active power which a source can deliver to a load i.e. the power which would be transferred if the impedances were conjugately matched. Note 2 – The system loss may be expressed by:Note 3 – The system loss excludes losses in feeder lines but includes all losses in radiofrequency circuits associated with the antenna, such as ground losses, dielectric losses, antenna\r\nloading coil losses, and terminating resistor losses. "
    },
    {
        "SrNo": "1425",
        "english": "Task Bar",
        "mongolian_description": "Ихэвчлэн дэлгэцний доод талд байрлах цонхийг task bar гэнэ. Одооуншиж байгаа хэрэглэгдэхүүнүүдийг харуулдаг, тэдгээрийг хооронд нь сольж байрлуулах боломжтой."
    },
    {
        "SrNo": "1426",
        "english": "Technician",
        "mongolian": "Техникч",
        "mongolian_description": "Албан байгуулгийнkомпьютерийн системийн эвдрэл, гэмтлийг хариуцан, тогтвортой ажиллагааг хангах үүрэгтэй ажилтныг хэлнэ."
    },
    {
        "SrNo": "1427",
        "english": "Telecommuncations ",
        "mongolian": "Цахилгаан  Холбоо",
        "mongolian_description": "Алсын зайгаар мэдээллийг хүлээн авах ба дамжуулахыг тайлбарласан нэр томъёо юм. Холболтонд кабель,цахилгаан утас, шилэн кабель эсвэл радио/хүлээн авагч   зэргийг хэрэглэдэг."
    },
    {
        "SrNo": "1428",
        "english": "Telecommunications Industry Association (U.S.)",
        "abbreviation": "TIA",
        "english_description": "One of the Telecommunications standards setting bodies in the United States."
    },
    {
        "SrNo": "1429",
        "english": "Telecommunications Technology Association (Korea)",
        "abbreviation": "TTA",
        "english_description": "A telecommunications standards setting body in Korea."
    },
    {
        "SrNo": "1430",
        "english": "Telecommunications Technology Committee (Japan)",
        "abbreviation": "TTC",
        "english_description": "A private-sector corporate body established in 1985 to prepare domestic standards relevant to Japanese telecommunications."
    },
    {
        "SrNo": "1431",
        "english": "Telecommute",
        "mongolian": "Цахилгаан холболт",
        "mongolian_description": "Алсын зайнаас ажиллахыг тайлбарласан нэр томъёо юм. Жишээ нь: Гэрээсээ албан байгууллага уруугаа цахилгаан холболтоор харилцан ажиллахыг хэлнэ."
    },
    {
        "SrNo": "1432",
        "english": "Tele-conferencing",
        "mongolian": "Теле хурал",
        "mongolian_description": "Газарзүйн байрлалаас хамааралгүйгээр хүмүүсийг хооронд нь холбоход зориулагдсан харилцаа холбооны шугамууд юм. Теле хурал нь зөвхөндуу хоолойгоор харилцан ярьдаг. Хэрвээ дүрсээ харах шаардлагтайvideo-conferencing хийнэ."
    },
    {
        "SrNo": "1433",
        "english": "Tele-working",
        "mongolian": "Теле ажилгаа",
        "mongolian_description": "Хүмүүс өөрсдийн гэрээcээ албан байгуулагтайгаа холбогдон ажилхийг мэдээллийн технологит хүлээн зөвшөөрхөд үүнийг ашигладаг. Төв компьютер эсвэл сүлжээнд холбогдсон хэрэглэгчийн холболтыг таслах, ерөнхийдөө бол email ба fax ашиглана."
    },
    {
        "SrNo": "1434",
        "english": "Template",
        "mongolian": "Үлгэр загвар ",
        "mongolian_description": "Тодорхой, тогтсон форматтай бичиг баримтыг ашиглах нь таны бүтээмжийг ихэсгэж, цаг хугацааг хэмнэх зориулалттай.Үүний тулд үлгэр загвар ба форматыг бэлтгэдэг."
    },
    {
        "SrNo": "1435",
        "english": "Temporary Directory Number",
        "abbreviation": "TDN",
        "english_description": "A temporary identification number assigned to a mobile while attached to the network."
    },
    {
        "SrNo": "1436",
        "english": "Temporary Mobile Station Identity",
        "abbreviation": "TAMS",
        "english_description": "An identification number assigned to a mobile station while it is attached to the network. This number is maintained in the VER and SIM while the mobile is attached to the network and is used to route calls to and from the mobile."
    },
    {
        "SrNo": "1437",
        "english": "Terminal ",
        "mongolian": "Терминал, төгсгөлийн төхөөрөмж",
        "mongolian_description": "Сүлжээнд холбогдсон хэрэглэгчийн хандалтыг хангах компьютер эсвэл төгсгөлийн төхөөрөмжүүдийг хэлнэ."
    },
    {
        "SrNo": "1438",
        "english": "Terminated ",
        "mongolian": "Тусгайлсан хэмжигдэхүүн ",
        "mongolian_description": "Энэ нь өгөдлийн жагсаалтын төсгөлийг тэмдэглэхэд ашигладаг. Программ нь терминатор хүртэл өгөгдлийг боловсруулдаг. "
    },
    {
        "SrNo": "1439",
        "english": "Terrestrial radiocommunication",
        "mongolian": "Газрын Радио холбоо",
        "mongolian_description": "Сансрын Радио холбоо , рентген одон орон болон бусад ямар нэгэн Радио холбоо."
    },
    {
        "SrNo": "1440",
        "english": "Terrestrial radiocommunication",
        "english_description": "Any radiocommunication other than space radiocommunication or radio-astronomy."
    },
    {
        "SrNo": "1441",
        "english": "Terrestrial station",
        "english_description": "A station effecting terrestrial radiocommunication."
    },
    {
        "SrNo": "1442",
        "english": "Test plan ",
        "mongolian": "Тестын бүдүүвч зураг",
        "mongolian_description": "Системд тест хийхэд ашиглагдах тестийнерөнхий загвар юм."
    },
    {
        "SrNo": "1443",
        "english": "Text  line",
        "mongolian": "Текст мөр",
        "mongolian_description": "Үг ба тэмдэгтүүдээр бүтсэн, текстийн ганц мөрийг хэлнэ."
    },
    {
        "SrNo": "1444",
        "english": "Text box",
        "mongolian": "Текстын Хүрээ",
        "mongolian_description": "Хүснэгтэн дотор текстийг байрлуулах ба тухайн текстийн өгөгдлийг боловсруулахад ашигладаг. Жишээ нь веб загварчлал гэх мэт."
    },
    {
        "SrNo": "1445",
        "english": "Text data",
        "mongolian": "Текст өгөгдөл",
        "mongolian_description": "Програмын шалгах явцад тухайн програмын зөв ажиллагааг харахын тулд програмист шалгах өгөгдлийг ашигладаг байна."
    },
    {
        "SrNo": "1446",
        "english": "Text only",
        "mongolian": "зөвхөн текст",
        "mongolian_description": "Ихэнх веб сайтуудад text only гэсэн  сонголт байдаг. Энэ нь хэрэглэгчдэд уншихад хялбар байдаг."
    },
    {
        "SrNo": "1447",
        "english": "Thesaurus",
        "mongolian": "Тайлбар толь ",
        "mongolian_description": "Зөв бичгийн дүрмийн агуулгуудыг төлөөлөх  толь бичгийг хэлнэ."
    },
    {
        "SrNo": "1448",
        "english": "Thin film transistor ",
        "mongolian": "Нимгэн давхрагат транзистор",
        "abbreviation": "TFT",
        "mongolian_description": "LCD дэлгэц, зөөврийн ба суурин компьютерт нийтлэг байдаг."
    },
    {
        "SrNo": "1449",
        "english": "Third-generation computer ",
        "mongolian": "Гуравдагч үеийн компьютер",
        "mongolian_description": "Транзисторуудыг интеграль хэлхээгээр орлуулан дараагийн үеийн компьютеруудыг гарган авсан ба одоогийн бидний хэрэглэж байгаа компьютерууд юм."
    },
    {
        "SrNo": "1450",
        "english": "Third-generation language",
        "mongolian": "Гуравдагч үеийн хэл",
        "mongolian_description": "3дагч үеийн хэл буюу програмчлалын хэл бөгөөд,өдөр тутамд ашиглагдах утасны апплэкейшн болон компьютерийн хэрэглээны програмуудыг уг хэлээр бичдэг.Жишээ нь: Cobol,C,C++,JavaScript,C# гэх мэт."
    },
    {
        "SrNo": "1451",
        "english": "Thread",
        "mongolian": "Трейд",
        "mongolian_description": "Сүлжээнд холбогдсон үед дэх ижил төрлийн агуулгатай мэдээнүүдийн жагсаалт."
    },
    {
        "SrNo": "1452",
        "english": "Thread ",
        "mongolian": "Трейд",
        "mongolian_description": "Систем дэх өгөгдлийн нэг багц дээр хийгдэж байгаа боловсруулалт юм."
    },
    {
        "SrNo": "1453",
        "english": "Three dimensional ",
        "mongolian": "Гурван талт хэмжээс",
        "mongolian_description": "Урт өргөн өндөр гуравыг харуулсан шугам зурагт дүрс"
    },
    {
        "SrNo": "1454",
        "english": "Three letter acronym ",
        "mongolian": "Үг товчлох ",
        "abbreviation": "TLA",
        "mongolian_description": "Энэ нь цаг хугацааг хэмнэхын тулд товчилж бичихэд хэрэглэдэг"
    },
    {
        "SrNo": "1455",
        "english": "Three-dimensional array ",
        "mongolian": "Гурван талт хэмжээст хүснэгт",
        "mongolian_description": "Хүснэгтэд гурван талт хэмжээсыг дүрслэн үзүүлэх"
    },
    {
        "SrNo": "1456",
        "english": "Throw ",
        "mongolian": "Шинэчлэх",
        "mongolian_description": "Жавагын нууц үгийг онцгой тохиолдолд шинэчлэхыг зөвшөөрдөг"
    },
    {
        "SrNo": "1457",
        "english": "Thumbnail ",
        "mongolian": "Хураангуй товчлол",
        "mongolian_description": "Зурагны том хэмжээсын жижиг хувилбар "
    },
    {
        "SrNo": "1458",
        "english": "Ticker tape ",
        "mongolian": "Цаасан тууз",
        "mongolian_description": "Дэлгэцэн дээр байгаа тэкстэнд хөдөлгөөн оруулах"
    },
    {
        "SrNo": "1459",
        "english": "Time dispersion",
        "english_description": "Time dispersion is a manifestation of multipath propagation that stretches the signal in time so that the duration of the received signal is greater than the transmitted signal."
    },
    {
        "SrNo": "1460",
        "english": "Time diversity",
        "english_description": "The technique used by CDMA systems to overcome the effects of multipath fading. Through the use of a rake receiver, individual elements, or fingers, can be offset in time to account for different arrival times of multipath signals."
    },
    {
        "SrNo": "1461",
        "english": "Time Division Duplex",
        "abbreviation": "TDD",
        "english_description": "A duplexing technique dividing a radio channel in time to allow downlink operation during part of the frame period and uplink operation in the remainder of the frame period. See also duplex."
    },
    {
        "SrNo": "1462",
        "english": "Time Division Multiple Access",
        "abbreviation": "TDMA",
        "english_description": "A technology for digital transmission of radio signals between, for example, a mobile telephone and a radio base station. In TDMA, the frequency band is split into a number of channels which in turn are stacked into short time units so that several calls can share a single channel without interfering with one another. Networks using TDMA assign 6 timeslots for each frequency channel. TDMA is also the name of a digital technology based on the IS-136 standard. TDMA is the current designation for what was formerly known as D-AMPS. See also IS-136 and D-AMPS."
    },
    {
        "SrNo": "1463",
        "english": "Time Division Transmit Diversity",
        "abbreviation": "TDTD",
        "english_description": "A technique utilizing multiple transmit stations to originate the downlink signal and improve performance. The transmit station used can be determined by either a fixed pattern or based on a QoS measurement made at the mobile. See also STD and TSTD."
    },
    {
        "SrNo": "1464",
        "english": "Time Switched Transmit Diversity",
        "abbreviation": "TSTD",
        "english_description": "A technique utilizing multiple transmit stations to originate the downlink signal and improve performance. The transmit station used is determined by a fixed selection pattern similar to frequency hopping. See also STD and TDTD."
    },
    {
        "SrNo": "1465",
        "english": "Timeline ",
        "mongolian": "Цаг товлох",
        "mongolian_description": "Олон мэдээллын хэрэгсэл түүнчлэн видио болон дуу бичлэгт буюу онцгой арга хэмжээнд цаг товлох"
    },
    {
        "SrNo": "1466",
        "english": "Toggle ",
        "mongolian": "Товчлуур ",
        "mongolian_description": "Өөр эсвэл нэг төлөв хооронд хөдөлгөх, унтраалга нээх хаах товчлуур"
    },
    {
        "SrNo": "1467",
        "english": "Toner ",
        "mongolian": "Хор хэвлэлийн будаг ",
        "mongolian_description": "Зураг хувилах эсвэл лазердан хэвлэхэд хэрэглэдэг."
    },
    {
        "SrNo": "1468",
        "english": "Tool ",
        "mongolian": "Хэрэгсэл",
        "mongolian_description": "Компьютерын програм хангамжын жижиг хэсэг, том програмын хэсэгт онцгой тохиолдолд даалгавар дамжуулдаг."
    },
    {
        "SrNo": "1469",
        "english": "Toolbar ",
        "mongolian": "Хэрэгслын самбар ",
        "mongolian_description": "Хөндлөн босоо самбарт аппликэйшн дахь өөр өөр хэрэгслүүдыг үзүүлдэг."
    },
    {
        "SrNo": "1470",
        "english": "Toolbox ",
        "mongolian_description": "Хайрцаганд аппликэйшин дахь өөр өөр хэрэгслүүдийг чөлөөт үзүүлдэг ба агуулдаг."
    },
    {
        "SrNo": "1471",
        "english": "Top down programming ",
        "mongolian": "Програмыг сайжруулах ",
        "mongolian_description": "Програмыг онцгой тохиолдолд бүтэц хэлбэр нь аажмаар сайжруулдаг"
    },
    {
        "SrNo": "1472",
        "english": "Top level domain ",
        "mongolian": "Өндөр түвшний бүс",
        "abbreviation": "TLD",
        "mongolian_description": "Системийн нэрний бүс, өндөр түвшний нэрны бүс"
    },
    {
        "SrNo": "1473",
        "english": "Total Access Communications System",
        "abbreviation": "TACS",
        "english_description": "An analog cellular communications system derived from AMPS. It has been adopted in the UK (ETACS) and operates in the 900 MHz band. Likewise adopted in Japan first as JTACS, it exists at present as the further evolved NTACS with narrower bandwidth."
    },
    {
        "SrNo": "1474",
        "english": "Total loss",
        "english_description": "The ratio, usually expressed in decibels, between the radio-frequency power supplied by the transmitter of a radio link and the radio-frequency power supplied to the corresponding receiver in real installation, propagation and operational conditions.",
        "description": "Note – It is necessary to specify in each case the points at which the power supplied by the transmitter and the power supplied to the receiver are determined, for example: – before or after the radio frequency filters or multiplexers that may be employed at the sending or the receiving end; – at the input or at the output of the transmitting and receiving antenna feed lines."
    },
    {
        "SrNo": "1475",
        "english": "Touch pad ",
        "mongolian": "Хулганы оролтонд хэрэглэдэг төхөөрөмж",
        "mongolian_description": "Дисплей дэлгэцэн дээрх курсорыг хөдөлгөхын тулд жижиг хавтгай гадарга дээгүүр хуруугаа гулсуулдаг, хуруугаа товших"
    },
    {
        "SrNo": "1476",
        "english": "Touchscreen ",
        "mongolian": "Мэдрэмхий видио дисплей",
        "mongolian_description": "Хуруугаа хүргэхэд оролтын дохио хүлээн авдаг мэдрэмхий видио дисплей дэлгэц"
    },
    {
        "SrNo": "1477",
        "english": "Tower ",
        "mongolian": "Суурин компьютер",
        "mongolian_description": "Гэрийн компьютерын дэлгэцны төрөлын  бүрэлдэхүүн хэсгийг хөндлөн биш босоогоор зохицуулдаг. Энэ нь ширээн дээр тавихад зориулагдсан байдаг"
    },
    {
        "SrNo": "1478",
        "english": "Tower ",
        "mongolian": "Цамхаг"
    },
    {
        "SrNo": "1479",
        "english": "Track ",
        "mongolian": "Тойрог зам",
        "mongolian_description": "Хатуу болон уян дискний гадарга дахь соронзон аргаар бичиж, уншиж болдог дугуй тойрог зам"
    },
    {
        "SrNo": "1480",
        "english": "Track changes ",
        "mongolian": "Тойрог зам өөрчлөх"
    },
    {
        "SrNo": "1481",
        "english": "Trackerball ",
        "mongolian": "Трэнбол",
        "mongolian_description": "Хулганы оронд хэрэглэдэг оруулалтын төхөөрөмж. Эргэлддэг бөмбөг – г алгаараа эсвэл хуруугаараа өнхрүүлэх замаар"
    },
    {
        "SrNo": "1482",
        "english": "Traffic Channel",
        "abbreviation": "TCH",
        "english_description": "A logical channel that allows the transmission of speech or data. In most second generation systems, the traffic channel can be either full or half-rate."
    },
    {
        "SrNo": "1483",
        "english": "Traffic Channel - full rate",
        "abbreviation": "TCH/F",
        "english_description": "A traffic channel using full rate voice coding."
    },
    {
        "SrNo": "1484",
        "english": "Traffic Channel - half rate",
        "abbreviation": "TCH/H",
        "english_description": "A traffic channel using half rate voice coding."
    },
    {
        "SrNo": "1485",
        "english": "Trans- horizon radio-relay system",
        "mongolian": "Трансын үе  радио релей станц",
        "mongolian_description": "Нэвт зааг трофосфер тархалт, гол төлөв форвард сарнилт ашигладаг рентген релей систем."
    },
    {
        "SrNo": "1486",
        "english": "Transceiver",
        "english_description": "A transmitter and receiver contained in one package. A 2- way radio or cell phone is an example of a transceiver."
    },
    {
        "SrNo": "1487",
        "english": "Trans-horizon propagation",
        "mongolian": "Туйлшралын давхарга ",
        "mongolian_description": "Радио далайц нь хүлээн авахаас гадна агаар мандалын туйлшралын хороондын байршилыг дамжуулдаг."
    },
    {
        "SrNo": "1488",
        "english": "Trans-horizon propagation",
        "english_description": "Tropospheric propagation between points close to the ground, the reception point being beyond the radio horizon of the transmission point.",
        "description": "Note – Trans-horizon propagation may be due to a variety of tropospheric mechanisms such as diffraction, scattering, reflection from tropospheric layers. However ducting is not included because in a duct there is no radio horizon."
    },
    {
        "SrNo": "1489",
        "english": "Trans-horizon radio-relay system",
        "english_description": "Radio-relay system using trans-horizon tropospheric propagation, chiefly forward scatter."
    },
    {
        "SrNo": "1490",
        "english": "Trans-ionospheric propagation",
        "english_description": "Radio propagation between two points situated below and above the height of the maximum electron density of the ionosphere."
    },
    {
        "SrNo": "1491",
        "english": "Transmission Control Protocol",
        "abbreviation": "TCP",
        "english_description": "TCP/IP is the standard communications protocol required for computers communicating over the Internet. To communicate using TCP/IP, computers need a set of software instructions or components called a TCP/IP stack."
    },
    {
        "SrNo": "1492",
        "english": "Transmission loss",
        "english_description": "The ratio, usually expressed in decibels, for a radio link, of the power radiated by the transmitting antenna to the power that would be available at the receiving antenna output if there were no loss in the radio-frequency circuits of the antennas, it being assumed that the antenna radiation characteristics are retained.",
        "description": "Note 1 – Transmission loss is equal to system loss minus the loss in the radio-frequency circuits which are integral parts of the antennas. Note 2 – The transmission loss may be expressed by: L = Ls – Ltc – Lrc dB where Ltc and Lrc are the losses, expressed in decibels, in the transmitting and receiving antenna\r\ncircuits respectively, excluding the dissipation associated with the antennas radiation, i.e., the\r\ndefinitions of Ltc and Lrc are 10 lg (r′/r), where r′ is the resistive component of the antenna\r\ncircuit and r is the radiation resistance. "
    },
    {
        "SrNo": "1493",
        "english": "transmit diversity",
        "english_description": "A technique utilizing multiple transmit stations to originate the downlink signal and improve performance. The station used is determined by either a fixed pattern or a quality measurement at the mobile. See also TDTD, STD and TSTD."
    },
    {
        "SrNo": "1494",
        "english": "Transmitter",
        "english_description": "Equipment which feeds the radio signal to an antenna, for transmission. It consists of active components such as the mixer, driver and PA and passive components such as the TX filter. Taken together, these components impress a signal onto an RF carrier of the correct frequency by instantaneously adjusting its phase, frequency, or amplitude and provide enough gain to the signal to project it through the ether to its intended target."
    },
    {
        "SrNo": "1495",
        "english": "Transmitter (radio) ",
        "english_description": "Apparatus producing radio-frequency energy for the purpose of radiocommunication."
    },
    {
        "SrNo": "1496",
        "english": "Trellis Code Modulation",
        "abbreviation": "TCM",
        "english_description": "A type of channel coding that, unlike block and convolutional codes, provide coding gain by increasing the size of the signal alphabet and use multi-level phase signalling."
    },
    {
        "SrNo": "1497",
        "english": "Triple mode (tri-mode)",
        "english_description": "A combined analog and digital mobile phone. Allows operation of the phone in the existing analog system at 800 MHz and in digital systems at both 800 MHz and 1900 MHz."
    },
    {
        "SrNo": "1498",
        "english": "Troposphere",
        "english_description": "The lower part of the Earth’s atmosphere extending upwards from the Earth’s surface, in which temperature decreases with height except in local layers of temperature inversion. This part of the atmosphere extends to an altitude of about 9 km at the Earth’s poles and 17 km at the equator."
    },
    {
        "SrNo": "1499",
        "english": "Tropospheric",
        "mongolian": "Агаар мандалын хамгийн доод үе ",
        "mongolian_description": "Тропонцфэр нь дэлхийн гадрагын ойрлцоо орших атмосфэрийн доод үе давхарг бөгөөд дэлхийн өргөргөөс хамаарч түүний үе давхаргийн өндөр өөр өөр байдаг."
    },
    {
        "SrNo": "1500",
        "english": "Tropospheric  propagation",
        "mongolian": "Агаар мандалын тархалт ",
        "mongolian_description": "Ионцфэр ба тропонсфэрийн орчин дахь санамсаргүй өөрчлөлтэй харилцан хамаарл бүхий олон цацаргын үйлчлэлийн нөлөөгөөр анх нэвтэрүүлсэн долгионы хэлбэр янз бүрийн гаржуудалд орно."
    },
    {
        "SrNo": "1501",
        "english": "Tropospheric propagation",
        "english_description": "Propagation within the troposphere and by extension, propagation beneath the ionosphere, when not influenced by the ionosphere."
    },
    {
        "SrNo": "1502",
        "english": "Tropospheric radio-duct",
        "mongolian": "Радио сувгийн агаар мандал ",
        "mongolian_description": "Өндөр давтамжтай радио нь агаар мандалд маш бага эрчим хүчийг тараадаг. Үелсэн байдал нь нэгэн жигд хязгаарлагдмал байна."
    },
    {
        "SrNo": "1503",
        "english": "Tropospheric radio-duct",
        "english_description": "A quasi-horizontal stratification in the troposphere within which radio energy of a sufficiently high frequency is substantially confined and propagates with much lower attenuation, than would be obtained in a homogeneous atmosphere."
    },
    {
        "SrNo": "1504",
        "english": "Tropospheric-scatter propagation",
        "mongolian": "Агаар мандалд тархалт саринх ",
        "mongolian_description": "Гадаргын долгионы тархалтанд нөлөөлх нэгэн төрлийн бус орчин тропосферийн нөлөөл нь түүний рефекарцийн процесстой холбоотой юм."
    },
    {
        "SrNo": "1505",
        "english": "Tropospheric-scatter propagation",
        "english_description": "Tropospheric propagation by scattering from many inhomogeneities and/or discontinuities in the refractive index of the atmosphere."
    },
    {
        "SrNo": "1506",
        "english": "Ttopocentric angle",
        "english_description": "The angle formed by imaginary straight lines that join any two points in space with a specific point on the surface of the Earth."
    },
    {
        "SrNo": "1507",
        "english": "Twisted Pair",
        "english_description": "Two insulated copper wires twisted together with the \"twists\" or \"lays\" varied in length to reduce potential signal interference between the pairs. Where cables comprise more than 25 pairs, they are usually bundled together and wrapped in a cable sheath. Twisted pair is the most commonly used medium for connecting telephones, computers and terminals to PABXs, supporting speeds up to 64kbits/sec."
    },
    {
        "SrNo": "1508",
        "english": "Ultra High Frequency",
        "abbreviation": "UHF",
        "english_description": "The RF spectrum between 300 MHz and 3 GHz"
    },
    {
        "SrNo": "1509",
        "english": "UMTS Terrestrial Radio Access",
        "abbreviation": "UTRA",
        "english_description": "A W-CDMA standard developed ETSI, ARIB and the TIA. This system uses DSSS and either FDD or TDD depending on its frequency assignment and application."
    },
    {
        "SrNo": "1510",
        "english": "Unit Under Test",
        "abbreviation": "UUT",
        "english_description": "An acronym describing some type of electrical apparatus connected to test instrumentation. The apparatus can range from a simple circuit a complex subsystem such as a mobile phone, base station or MSC. See also DUT."
    },
    {
        "SrNo": "1511",
        "english": "Universal Mobile Telecommunications System",
        "abbreviation": "UMTS",
        "english_description": "Third generation telecommunications system based on WCDMA DS."
    },
    {
        "SrNo": "1512",
        "english": "Universal Personal Telecommunications",
        "abbreviation": "UPT",
        "english_description": "A set of standards developed by the CCITT for wireline personal communications."
    },
    {
        "SrNo": "1513",
        "english": "Universal Time",
        "abbreviation": "UT",
        "english_description": "– UT0 is the mean solar time of the prime meridian obtained from direct astronomical observation; – UT1 is UT0 corrected for the effects of small movements of the Earth relative to the axis of rotation (polar variation) (see Recommendation ITU-R TF.460); – UT2 is UT1 corrected for the effects of a small seasonal fluctuation in the rate of rotation of the Earth."
    },
    {
        "SrNo": "1514",
        "english": "Universal Wireless Consortium",
        "abbreviation": "UWC",
        "english_description": "Body of vendors and operators promoting and implementing the IS-136 digital standard. Also specifying the future development of the standard and facilitating roaming agreements between IS-136 operators."
    },
    {
        "SrNo": "1515",
        "english": "Unwanted emissions",
        "english_description": "Emissions consisting of spurious emissions and out-of-band emissions."
    },
    {
        "SrNo": "1516",
        "english": "Uplink",
        "english_description": "The transmission path from the mobile station up to the base station."
    },
    {
        "SrNo": "1517",
        "english": "Up-link",
        "english_description": "A radio link between a transmitting earth station and a receiving space station.",
        "description": "Note 1 – The term is also used in terrestrial communications for a link between a transmitting mobile station and a receiving base station. Note 2 – The symbol ↑ is used as a subscript for letter symbols representing quantities associated with an up-link"
    },
    {
        "SrNo": "1518",
        "english": "Up-link ",
        "mongolian": "Илгээх шугам",
        "mongolian_description": "Дэлхийн дамжуулах станц болон хүлээн авагч сансрын станц хоорондын радио холбоос."
    },
    {
        "SrNo": "1519",
        "english": "Urban cells",
        "english_description": "The coverage provided by base stations located in urban areas. The radius of these cells is usually much smaller than suburban and rural cells due to the more difficult propagation environment."
    },
    {
        "SrNo": "1520",
        "english": "usable field-strength, [usable power flux-density]",
        "english_description": "Minimum value of the field-strength [minimum value of the power flux-density] necessary to permit a desired reception quality, under specified receiving conditions, in the presence of natural and man-made noise and of interference, either in an existing situation or as determined by agreements or frequency plans.",
        "description": "Note 1 – The desired quality is determined in particular by the protection ratios against noise and interference and in the case of fluctuating noise or interference, by the percentage of time during which the required quality must be ensured. Note 2 – The receiving conditions include, inter alia: – the type of transmission and frequency band used; – the receiving equipment characteristics (antenna gain, receiver characteristics, siting, etc.); – receiver operating conditions, particularly the geographical zone, the time and the season, or the fact that, if the receiver is mobile, a median field strength for multipath propagation must be considered. Note 3 – The term “usable field-strength” corresponds to the term “necessary field-strength” which appears in many ITU texts."
    },
    {
        "SrNo": "1521",
        "english": "Vector Sum Excited Linear Predictive",
        "abbreviation": "VSELP",
        "english_description": "A type of speech coding using an excitation signal generated from three components: the output of a long term or pitch filter and two codebooks. VSELP was used in the IS-54 standard and operated at a rate of 8 kbps."
    },
    {
        "SrNo": "1522",
        "english": "Vertical directivity pattern",
        "mongolian": "босоо чиглүүлийн диаграмм",
        "mongolian_description": "Антенны чиглүүлэлтийн диаграмм нь тодорхой босоо гадаргууд оршино."
    },
    {
        "SrNo": "1523",
        "english": "Vertical directivity pattern",
        "english_description": "An antenna directivity diagram in a specified vertical plane."
    },
    {
        "SrNo": "1524",
        "english": "Very High Frequency",
        "abbreviation": "VHF",
        "english_description": "The RF spectrum between 30 MHz and 300 MHz."
    },
    {
        "SrNo": "1525",
        "english": "Vestigial sideband",
        "abbreviation": "VSB",
        "english_description": "A sideband in which only the spectral components corresponding to the lower frequencies of the modulating signals, are preserved, the other components being strongly attenuated."
    },
    {
        "SrNo": "1526",
        "english": "Vestigial-sideband",
        "mongolian": "Хэсэгчлэн дарагдсан хажуугийн зурвас",
        "mongolian_description": "Нэг иж бүрэн хажуугийн зурвас, түүний нэмэлт хэсэгчлэн дарагдсан хажуугийн зурвасыг ашиглаж байгаа нь дамжуулах эсвэл ялгаралтай холбоотой."
    },
    {
        "SrNo": "1527",
        "english": "Vestigial-sideband",
        "english_description": "Pertaining to a transmission or emission in which one complete sideband and its complementary vestigial sideband are utilized."
    },
    {
        "SrNo": "1528",
        "english": "Virtual Private Network",
        "abbreviation": "VPN",
        "english_description": "A private telecommunications network created using the resources of the PSTN and customized dialing, switching and routing functions."
    },
    {
        "SrNo": "1529",
        "english": "Visible arc",
        "english_description": "The common part of the arc of the geostationary satellite over which the space station is visible above the local horizon from each associated earth station in the service area."
    },
    {
        "SrNo": "1530",
        "english": "Visitor Location Register",
        "abbreviation": "VLR",
        "english_description": "The functional unit responsible for managing mobile subscribers currently attached to the network. Two types of information reside in the VLR: subscriber information and the part of the mobile information that allows incoming calls to be routed to the mobile subscriber. The VLR stores the MSRN, TMSI, the location area, data on supplementary services, IMSI, MS ISDN number, HLR address or GT, and local MS identity, if used."
    },
    {
        "SrNo": "1531",
        "english": "Viterbi algorithm",
        "english_description": "A technique for searching a decoding trellis to yield a path with the smallest distance. This is also known as maximum likelihood decoding."
    },
    {
        "SrNo": "1532",
        "english": "Vocoder",
        "english_description": "Refers to a voice encoder which is a device that codes and decodes the human voice (sound waves) into digital transmission. Higher vocoder speeds offer enhanced sound quality."
    },
    {
        "SrNo": "1533",
        "english": "Voice activity detector",
        "abbreviation": "VAD",
        "english_description": "The device that detects voice activity and allows DTX to operate. VAD, in conjunction with DTX reduces power consumption in the mobile station and RF interference in the system by muting the transmitter when there is no voice to transmit."
    },
    {
        "SrNo": "1534",
        "english": "Voice Over Internet Protocol",
        "abbreviation": "VOIP",
        "english_description": "A technology for transmitting ordinary telephone calls over the Internet using packet-linked routes. VoIP is not simply for voice over IP, but is designed to accommodate two-way video conferencing and application sharing as well."
    },
    {
        "SrNo": "1535",
        "english": "Walsh Code",
        "english_description": "A group of spreading codes having good autocorrelation properties and poor crosscorrelation properties. Walsh codes are the backbone of CDMA systems and are used to develop the individual channels in CDMA. For IS-95, here are 64 codes available. Code 0 is used as the pilot and code 32 is used for synchronization. Codes 1 though 7 are used for control channels, and the remaining codes are available for traffic channels. Codes 2 through 7 are also available for traffic channels if they are not needed. For cdma2000, there exists a multitude of Walsh codes that vary in length to accommodate the different data rates and Spreading Factors of the different Radio Configurations. For more information see Agilent application note \"Performing cdma2000 Measurements Today\"."
    },
    {
        "SrNo": "1536",
        "english": "Wavelength Division Multiplexing",
        "abbreviation": "WDM",
        "english_description": "A new technology that uses optical signals on different wavelengths to increase the capacity of fiber optic networks in order to handle a number of services simultaneously."
    },
    {
        "SrNo": "1537",
        "english": "Wideband Code Division Multiple Access",
        "abbreviation": "WCDMA",
        "english_description": "See W-CDMA."
    },
    {
        "SrNo": "1538",
        "english": "wireless access",
        "mongolian": "Утасгүй хандалт",
        "mongolian_description": "Радио холболт болон  радио хэрэглэгч хоорондын үндсэн сүлжээ. Утасгүй сүлжээний холболтын жишээ: - тогтмол утасгүй хандалт -хөдөлгөөнт утасгүй хандалт  тогтворгүй утасгүй хандалт"
    },
    {
        "SrNo": "1539",
        "english": "wireless access",
        "english_description": "Radio connection between a radio user and a core network.",
        "description": "Note – Examples of wireless access: – fixed wireless access (FWA); – mobile wireless access (MWA); – nomadic wireless access (NWA)."
    },
    {
        "SrNo": "1540",
        "english": "Wireless Application Protocol",
        "abbreviation": "WAP",
        "english_description": "A free, unlicensed protocol for wireless communications that makes it possible to create advanced telecommunications services and to access Internet pages from a mobile telephone. WAP is a de facto standard that is supported by a large number of suppliers."
    },
    {
        "SrNo": "1541",
        "english": "Wireless Communications Association",
        "abbreviation": "WCA",
        "english_description": "The Wireless Communications Association represents the fixed broadband wireless access industry worldwide. It's mission is to advance the interests of the wireless systems that provide data (including Internet and e-commerce), voice and video services on a subscription basis through land-based towers to fixed reception/transmit devices."
    },
    {
        "SrNo": "1542",
        "english": "Wireless Local Area Network",
        "abbreviation": "WLAN",
        "english_description": "A wireless version of the LAN. Provides access to the LAN even when the user is not in the office."
    },
    {
        "SrNo": "1543",
        "english": "Wireless Local Loop",
        "abbreviation": "WLL",
        "english_description": "A wireless connection of a telephone in a home or office to a fixed telephone network."
    },
    {
        "SrNo": "1544",
        "english": "Wireless Markup Language",
        "abbreviation": "WML",
        "english_description": "A markup language developed specifically for wireless applications. WML is based on XML."
    },
    {
        "SrNo": "1545",
        "english": "Wireless Office Systems",
        "abbreviation": "WOS",
        "english_description": "A technology that allows the user to transfer calls to a mobile telephone."
    },
    {
        "SrNo": "1546",
        "english": "Wireless Private Automatic Branch Exchange",
        "abbreviation": "WPABX",
        "english_description": "A customer premise telephone switching system using wireless technology to link the individual user stations to the central switching unit. The WPABX is capable of interfacing to a telephone central office with trunk groups and routing calls based on a 3 or 4 digit telephone extension number."
    },
    {
        "SrNo": "1547",
        "english": "World Wide Web Consortium",
        "abbreviation": "W3C",
        "english_description": "A sector-wide body which promotes standardization of WWW technology. Major Internet related vendors are consortium members, and to date the body has standardized a range of crucial technologies including HTTP, HTML, XML, etc."
    },
    {
        "SrNo": "1548",
        "english": "X federation",
        "mongolian": "Нэгдсэн холбоо",
        "mongolian_description": "Нэгдмэл <x>чанарыг тодорхойлох."
    },
    {
        "SrNo": "1549",
        "english": "X.25 protocol",
        "english_description": "A CCITT recommendation defining the interface between Data Terminal Equipment (DTE) and Data Communications Equipment (DCE) operating in the packet mode on public data networks. It is a set of 3 peer protocols: a physical layer X.21), a link control layer (HDLC) and a network layer. X.25 is based on the concept of virtual circuits, which can be temporary or permanent."
    },
    {
        "SrNo": "1550",
        "abbreviation": "1GL",
        "mongolian_description": "Тайлбарлах кодыг маш хурдан ажиллуулах боломжтой үр дүнтэй боловч сурахад хэцүү."
    },
    {
        "SrNo": "1551",
        "abbreviation": "2GL",
        "mongolian_description": "2 дахь үеийн програмчлалын хэл (2GL) 3-р үеийн програмчлалын хэл болон түүнээс өмнөх машины хэлнээс ялгахын тулд энэ нэр томьёог гаргаж ирсэн. Код нь уншиж программист бичнэ. "
    },
    {
        "SrNo": "1552",
        "abbreviation": "3GL",
        "mongolian_description": "2 дугаар зеийн хэлэнд машин хамааралтай байдаг бол 3 дугаар үеийн хэлэнд програм илүү хамааралтай байдаг."
    },
    {
        "SrNo": "1553",
        "abbreviation": "4GL",
        "mongolian_description": "3 дугаар үеийн хэлийг бодвол хэв маяг нь илүү боловсронгуй хүчирхэг, уян хатан, техник хангамжийг хөгжүүлэх зорилготой."
    },
    {
        "SrNo": "1554",
        "abbreviation": "5GL",
        "mongolian_description": "4 дэх үеийн програмчлалын хэл тусгайлан хаталбарийг бий болгоход чиглэсэн бол 5 дахь үеийн хэл нь тжхайн асуудлыг шийдэх гол зорилготой."
    },
    {
        "SrNo": "1555",
        "abbreviation": "ADT",
        "mongolian_description": "Товчлол мэдээллийн хэлбэр /ADT/ ISO/IEC-19500-2:2003 Мэдээллийн технологи-нээлттэй тархалтын үйл ажиллагаа"
    },
    {
        "SrNo": "1556",
        "abbreviation": "AE(1)",
        "mongolian_description": "Хэрэглээний программын оршихуй /AE/; /ISO-IEC-10746-1:1998/ Нээлттэй тархалт- Лавлагааны загвар "
    },
    {
        "SrNo": "1557",
        "abbreviation": "А4, А5",
        "mongolian_description": "Олон улсын стандарт цаасны хэмжээ ( ISO/IEC 15910:1999) А4 нь 210мм болон 297мм хэмжээтэй бол А5 нь 148мм болон 210мм хэмжээтэй."
    },
    {
        "SrNo": "1558",
        "mongolian": "Хувийн хугацаанд зориулсан шуудан",
        "abbreviation": "SMTP",
        "mongolian_description": "Хувийн хугцаанд зориулсан шууданийг электрон шуудантай саад учруулахгүйгэр хэрэглэг."
    },
    {
        "SrNo": "1559",
        "mongolian": "Зурган файлыг хэлбэрт оруулан холбох үгний товчлол",
        "abbreviation": "TIFF ",
        "mongolian_description": "Графикин файлыг хэлбэрт оруулахдаа ихэнхи тохиолдолд зурагнуудыг хуулбарлан компьютерт оруулдаг "
    },
    {
        "SrNo": "1560",
        "abbreviation": "AXE",
        "english_description": "An open architecture, Ericsson's communications platform. A system for computer-controlled digital exchanges that constitute the nodes in large public telecommunications networks. The basis for Ericsson's wireline and mobile systems."
    },
    {
        "SrNo": "1561",
        "abbreviation": "burst",
        "english_description": "A term, usually associated with a TDMA system, describing a group of bits or other information transmitted by the system. Also refers to the time the transmitter is on and radiating."
    },
    {
        "SrNo": "1562",
        "abbreviation": "COST-231",
        "english_description": "ETSI propagation model for 2 GHz applications."
    },
    {
        "SrNo": "1563",
        "abbreviation": "CT-3",
        "english_description": "See DECT."
    },
    {
        "SrNo": "1564",
        "abbreviation": "EPOC",
        "english_description": "An operating system that turns voice-oriented handsets into Mediaphones and Wireless Information Devices. EPOC places a lighter load on the processor compared to present PDA operating systems and thus has the capacity to enhance the multimedia capacity of mobile phones. EPOC is being developed by Symbian, a joint company of Psion, Nokia, Ericsson, Motorola and Matsushita (Panasonic). It constitutes an open platform optimized for mobile phone use."
    },
    {
        "SrNo": "1565",
        "abbreviation": "GSM 900",
        "english_description": "GSM 900, or just GSM, is the world's most widely used digital network and now operating in over 100 countries around the world, particularly in Europe and Asia Pacific."
    },
    {
        "SrNo": "1566",
        "abbreviation": "lu",
        "english_description": "Standardized interface between a Radio Network Controller Network and Packet Subsystem (e.g. RNC3GSGSN)."
    },
    {
        "SrNo": "1567",
        "abbreviation": "lub",
        "english_description": "Interface between a Base Station and Radio Network Controller."
    },
    {
        "SrNo": "1568",
        "abbreviation": "lur",
        "english_description": "Open RNC-RNC interface."
    },
    {
        "SrNo": "1569",
        "abbreviation": "m-law companding",
        "english_description": "A type of non-linear (logarithmic) quantizing, companding and encoding technique for speech signals based on the mlaw. This type of companding uses a m factor of 255 and is optimized to provide a good signal-to-quantizing noise ratio over a wide dynamic range"
    },
    {
        "SrNo": "1570",
        "abbreviation": "PTT",
        "english_description": "Historically, the Ministry of Post, Telecommunications and Telegraph. Now a term to describe the incumbent, dominant operator in a country, many of which are being or have been privatized."
    },
    {
        "SrNo": "1571",
        "abbreviation": "UNIX",
        "english_description": "A computer operating system. UNIX is designed to be used by many people at the same time and has TCP/IP built-in. It is a very common operating system for servers on the Internet."
    }
];
}
