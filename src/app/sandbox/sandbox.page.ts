import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SandboxService } from './sandbox.service';


@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.page.html',
  styleUrls: ['./sandbox.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SandboxPage implements OnInit {
  cultivos: any[] = [];
  etapas: any[] = [];
  partes: any[] = [];
  
  constructor(private api: SandboxService) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getCultivos().subscribe(data => this.cultivos = data);
    this.api.getEtapasCiclo().subscribe(data => this.etapas = data);
    this.api.getPartesPlanta().subscribe(data => this.partes = data);
  }

  imprimir() {
    window.print();
  }

  descargarJSON(nombre: string, datos: any) {
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombre}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
