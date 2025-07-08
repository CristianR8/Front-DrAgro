import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SandboxService {
  constructor(private http: HttpClient) { }

  private getHeaders() {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
    });
  }

  getCultivos(): Observable<any> {
    return this.http.post('/api/cultivos/get_cultivos', {}, { headers: this.getHeaders() });
  }
  
  getEtapasCiclo(): Observable<any> {
    return this.http.post('/api/cultivos/get_etapas_ciclo_fenologico', {}, { headers: this.getHeaders() });
  }
  
  getPartesPlanta(): Observable<any> {
    return this.http.post('/api/cultivos/get_partes_planta', {}, { headers: this.getHeaders() });
  }
}