import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import {Mensaje} from '../interfaces/mensaje.interface';

@Injectable()
export class ChatService {
  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  chats: Observable<any[]>;
  usuario:any=null;

  constructor(public db: AngularFirestore, public afAuth: AngularFireAuth) {
    this.itemsCollection = db.collection<Mensaje>('chats');
    this.chats = this.itemsCollection.valueChanges();
    if (localStorage.getItem('usuario')) {
        this.usuario= JSON.parse(localStorage.getItem('usuario'));
    }

  }

  cargarMensajes(){
    this.chats = this.db.collection('/chats', ref=>(
                    ref.limit(20),
                    ref.orderBy('fecha')
                  )).valueChanges();
    return this.chats;
  }

  agregarMensaje(texto:string){

    let mensaje:Mensaje={
      nombre:this.usuario.displayName,
      mensaje:texto,
      fecha: new Date(),
      uid:this.usuario.uid,
      img:this.usuario.photoURL
    }

    return this.itemsCollection.add(mensaje);
  }

  login(proveedor:string) {
    let provider:any;

    if (proveedor == "google") {
        provider = new firebase.auth.GoogleAuthProvider();
    }else {
        provider = new firebase.auth.TwitterAuthProvider();
    }

    this.afAuth.auth.signInWithPopup(provider)
        .then(resp=>{
          console.log(resp);
          this.usuario = resp.user;
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
        })
  }
  logout() {
    localStorage.removeItem('usuario');
    this.usuario=null;
    this.afAuth.auth.signOut();
  }


}
