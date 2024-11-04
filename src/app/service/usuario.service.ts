import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges } from '@angular/core';
import { UsuarioLogIn, UsuarioLogOut, UsuarioRegistro, UsuarioResponse } from '../shared/usuarioInterfaces.js';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../shared/usuario.entity.js';
import { AlmacenamientoService } from './almacenamiento.service.js';
import { SideNavService } from './side-nav.service.js';

const USER_KEY = 'Usuario'

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarioSubject = new BehaviorSubject<Usuario>(this.getUsuarioFromLocalStorage())
  //public usuarioObservable: Observable<Usuario> = this.usuarioSubject.asObservable()

  constructor(private http: HttpClient, 
    private almacenamientoService: AlmacenamientoService,
    private sideNavService: SideNavService
  ) { }

  readonly urlUsuario = 'http://localhost:3000/api/usuarios'

  public registrarUsuario(usuario: UsuarioRegistro) {
    const url = this.urlUsuario + '/registro'
    return this.http.post<UsuarioResponse>(url, usuario)
  }

  public loginUsuario(usuario: UsuarioLogIn) {
    const url = this.urlUsuario + '/login'
    return this.http.post<UsuarioResponse>(url, usuario).pipe(tap({
      next: (response) => {
        const usuario: Usuario = response.data
        this.setUsuarioToLocalStorage(usuario)
        this.usuarioSubject.next(usuario)
        this.sideNavService.filtrarFunciones(usuario.tipoUsuario)
      }
    }))
  }

  public logOutUsuario() {
    const url = this.urlUsuario + '/logout'
    return this.http.post<UsuarioLogOut>(url, null).pipe(tap({
      next: (response) => {
        this.usuarioSubject.next(new Usuario)
        this.removeUsuarioFromLocalStorage()
      }
    }))
  }

  private setUsuarioToLocalStorage(usuario: Usuario): void {
    this.almacenamientoService.setItem(USER_KEY, JSON.stringify(usuario))
  }

  private getUsuarioFromLocalStorage(): Usuario {
    const usuario = this.almacenamientoService.getItem(USER_KEY)
    if(usuario) {
      return JSON.parse(usuario)
    } else {
      return new Usuario()
    }
  }

  private removeUsuarioFromLocalStorage(): void {
    this.almacenamientoService.removeItem(USER_KEY)
  }

  public showTipoUsuario() {
    return this.usuarioSubject.value.tipoUsuario
  }
}