import { ClienteService } from './../../_service/cliente.service';
import { Cliente } from 'src/app/_model/cliente';
import { ClienteComponent } from './../cliente/cliente.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario: string;
  perfil: string;
  foto: any;
  imagenData: any;
  imagenEstado: boolean = false;
  labelFile: string;
  selectedFiles: FileList;
  constructor( private sanitization: DomSanitizer,private clienteService: ClienteService) { }

  setear(x: any) {
    this.imagenData = this.sanitization.bypassSecurityTrustResourceUrl(x);
    this.imagenEstado = true;
  }
  convertir(data: any) {
    let reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = () => {
    let base64 = reader.result;
    this.imagenData = base64;
      this.setear(base64);
    }

   }


  ngOnInit() {
    const helperService = new JwtHelperService();

    const TOKEN = JSON.parse(sessionStorage.getItem(environment.TOKEN_NAME));
    const decodedToken = helperService.decodeToken(TOKEN.access_token);
    this.usuario = decodedToken.user_name;
    this.perfil = decodedToken.authorities.join('-');
    this.clienteService.listarPorId(decodedToken.id_usuario).subscribe(data => {
        if (data.size > 0) {
          this.convertir(data);
        }
      });

  }


}
