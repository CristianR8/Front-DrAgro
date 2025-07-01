import { Component }   from '@angular/core';
import { CommonModule } from '@angular/common';    // 👈 NgIf, NgFor, etc.
import { FormsModule }  from '@angular/forms';     // 👈 ngModel
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,    // ← for *ngFor
    FormsModule,     // ← for [(ngModel)]
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ],
  templateUrl: './home.page.html',
  styleUrls:   ['./home.page.scss'],
})
export class HomePage {
  perfilSeleccionado = 'asistente';
  usuario = { departamento: '', municipio: '', correo: '' };

  guardarInformacion() {
    console.log('Perfil:', this.perfilSeleccionado);
    console.log('Usuario:', this.usuario);
  }
}
