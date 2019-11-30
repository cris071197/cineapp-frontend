import { PasswordValidation } from './../../login/nuevo/match';

import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Usuario } from './../../../_model/usuario';
import { UsuarioService } from './../../../_service/usuario.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ClienteService } from './../../../_service/cliente.service';
import { Cliente } from './../../../_model/cliente';
import { Component, OnInit, Inject, AfterViewInit, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { from } from 'rxjs';



@Component({
  selector: 'app-cliente-dialogo',
  templateUrl: './cliente-dialogo.component.html',
  styleUrls: ['./cliente-dialogo.component.css']
})
export class ClienteDialogoComponent implements OnInit, OnChanges {
  [x: string]: any;

  imagenData: any;
  imagenEstado: boolean = false;
  selectedFiles: FileList;
  currentFileUpload: File;
  labelFile: string;

  form: FormGroup;
  maxFecha: Date;
  nuevo: boolean;

  constructor(
    private dialogRef: MatDialogRef<ClienteDialogoComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Cliente, private clienteService: ClienteService,
    private sanitization: DomSanitizer, private usuarioService: UsuarioService
  ) {
    // this.usuario = new Usuario();

  }
  ngOnChanges(): void {

  }
  ngOnInit() {
    this.maxFecha = new Date();
    this.form = this.fb.group({
      nombres: new FormControl(''),
      apellidos: new FormControl(''),
      dni: new FormControl(''),
      fechaNac: new Date(),
      usuario: new FormControl(''),
      password: [''],
      confirmPassword: ['']
    }, {
      validator: PasswordValidation.MatchPassword
    });
    this.nuevo = this.data.idCliente > 0 ? true : false;
    if (this.nuevo) {
      this.usuarioService.listarPorId(this.data.idCliente).subscribe(data => {
        this.form = this.fb.group({
          nombres: new FormControl(this.data.nombres),
          apellidos: new FormControl(this.data.apellidos),
          dni: new FormControl(this.data.dni),
          fechaNac: new Date(this.data.fechaNac),
          usuario: new FormControl(data.nombre),
          password: [''],
          confirmPassword: [''],
        },
          {
            validator: PasswordValidation.MatchPassword
          });
      }
      );
      this.clienteService.listarPorId(this.data.idCliente).subscribe(data => {
        if (data.size > 0) {
          this.convertir(data);
        }
    });
  } }


  convertir(data: any) {
    let reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = () => {
      let base64 = reader.result;
      //this.imagenData = base64;
      this.setear(base64);
    }
  }

  setear(x: any) {
    this.imagenData = this.sanitization.bypassSecurityTrustResourceUrl(x);
    this.imagenEstado = true;
  }

  operar() {
    const cliente = new Cliente();
    cliente.idCliente = this.data.idCliente;
    cliente.nombres = this.form.value['nombres'];
    cliente.apellidos = this.form.value['apellidos'];
    cliente.dni = this.form.value['dni'];
    cliente.fechaNac = this.form.value['fechaNac'];

    const usuario = new Usuario();
    usuario.nombre = this.form.value['usuario'];
    usuario.clave = this.form.value['password'];
    usuario.estado = true;
    usuario.cliente = cliente;
    if (this.selectedFiles != null) {
      this.currentFileUpload = this.selectedFiles.item(0);
    } else {
   this.currentFileUpload = new File([""], "blanco");
    }
    if (cliente != null && cliente.idCliente > 0) {
      usuario.idUsuario = this.data.idCliente;
      this.clienteService.modificar(cliente, this.currentFileUpload).subscribe(data => {
        this.usuarioService.cambioclave(usuario).subscribe(data => {
          this.clienteService.listar().subscribe(clientes => {
            this.clienteService.clienteCambio.next(clientes);
            this.clienteService.mensajeCambio.next('Se modificó');
          });
        });
      });
    } else {
      this.clienteService.registrar(cliente, this.currentFileUpload).subscribe(data => {
        this.usuarioService.registrar(usuario).subscribe(data => {
          this.clienteService.listar().subscribe(clientes => {
            this.clienteService.clienteCambio.next(clientes);
            this.clienteService.mensajeCambio.next("Se registro");
          });
        });
      });
    }
    this.dialogRef.close();
  }
  selectFile(e: any) {
    console.log(e);
    this.labelFile = e.target.files[0].name;
    this.selectedFiles = e.target.files;
  }

  cancelar() {
    this.dialogRef.close();
  }


}
