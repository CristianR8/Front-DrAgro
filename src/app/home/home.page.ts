import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SqliteService } from '../services/sqlite.service';


interface Departamento {
  id: number;
  name: string;
  description: string;
}

interface Municipio {
  id: number;
  name: string;
  description: string;
  departmentId: number;
}

interface Usuario {
  id: number;
  perfil: string;
  departamento: string;
  departamentoId: number;
  municipio: string;
  municipioId: number;
  correo: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {
  // Declarar el servicio como opcional para evitar errores
  //private sqliteService: any = null;

  perfilSeleccionado: string = '';
  usuario = {
    departamento: '',
    municipio: '',
    correo: ''
  };

  // Arrays para almacenar datos de la API
  departamentos: Departamento[] = [];
  municipios: Municipio[] = [];
  
  // Variables para filtros y dropdown
  filteredDepartamentos: Departamento[] = [];
  filteredMunicipios: Municipio[] = [];
  showDepartamentos: boolean = false;
  showMunicipios: boolean = false;
  
  // Variables para input text
  departamentoText: string = '';
  municipioText: string = '';
  
  // Variables para validación
  selectedDepartamento: Departamento | null = null;
  selectedMunicipio: Municipio | null = null;
  departamentoInvalid: boolean = false;
  departamentoValid: boolean = false;
  municipioInvalid: boolean = false;
  municipioValid: boolean = false;
  emailInvalid: boolean = false;
  emailValid: boolean = false;
  emailErrorMessage: string = '';

  profileOptions = [
    {
      id: 'asistente',
      label: 'Asistente técnico',
      description: 'Soporte especializado',
      icon: 'fas fa-user-tie'
    },
    {
      id: 'productor',
      label: 'Productor',
      description: 'Agricultor profesional',
      icon: 'fas fa-seedling'
    },
    {
      id: 'estudiante',
      label: 'Estudiante',
      description: 'En formación académica',
      icon: 'fas fa-graduation-cap'
    },
    {
      id: 'investigador',
      label: 'Investigador',
      description: 'Desarrollo científico',
      icon: 'fas fa-microscope'
    },
    {
      id: 'docente',
      label: 'Docente',
      description: 'Educador especializado',
      icon: 'fas fa-chalkboard-teacher'
    },
    {
      id: 'general',
      label: 'Público en general',
      description: 'Interés general',
      icon: 'fas fa-users'
    }
  ];

  constructor(
    private http: HttpClient,
    private sqliteService: SqliteService
  ) {}

  ngOnInit() {
    this.loadDepartamentos();
  }

  // Cargar departamentos desde la API
  loadDepartamentos() {
    console.log('Iniciando carga de departamentos...');
    
    this.http.get<Departamento[]>('https://api-colombia.com/api/v1/Department')
      .subscribe({
        next: (data) => {
          console.log('Departamentos cargados:', data.length);
          this.departamentos = data.sort((a, b) => a.name.localeCompare(b.name));
          this.filteredDepartamentos = [...this.departamentos];
          console.log('Departamentos filtrados:', this.filteredDepartamentos.length);
        },
        error: (error) => {
          console.error('Error al cargar departamentos:', error);
          console.log('Cargando departamentos fallback...');
          // Fallback con departamentos básicos si falla la API
          this.loadFallbackDepartamentos();
        }
      });
  }

  // Cargar municipios de un departamento específico
  loadMunicipios(departmentId: number) {
    this.http.get<Municipio[]>(`https://api-colombia.com/api/v1/Department/${departmentId}/cities`)
      .subscribe({
        next: (data) => {
          this.municipios = data.sort((a, b) => a.name.localeCompare(b.name));
          this.filteredMunicipios = [...this.municipios];
        },
        error: (error) => {
          console.error('Error al cargar municipios:', error);
          this.municipios = [];
          this.filteredMunicipios = [];
        }
      });
  }

  // Filtrar departamentos mientras el usuario escribe
  filterDepartamentos(event: any) {
    const query = event.target.value.toLowerCase();
    this.departamentoText = event.target.value;
    
    if (query.length === 0) {
      this.filteredDepartamentos = [...this.departamentos];
      this.selectedDepartamento = null;
      this.clearMunicipios();
      this.validateDepartamento();
      return;
    }

    this.filteredDepartamentos = this.departamentos.filter(dept =>
      dept.name.toLowerCase().includes(query)
    );

    // Si hay coincidencia exacta, seleccionar automáticamente
    const exactMatch = this.departamentos.find(dept => 
      dept.name.toLowerCase() === query.toLowerCase()
    );
    
    if (exactMatch && exactMatch !== this.selectedDepartamento) {
      this.selectedDepartamento = exactMatch;
      this.loadMunicipios(exactMatch.id);
      this.clearMunicipios();
    } else if (!exactMatch) {
      this.selectedDepartamento = null;
      this.clearMunicipios();
    }

    this.validateDepartamento();
    this.showDepartamentos = true;
  }

  // Seleccionar departamento del dropdown
  selectDepartamento(departamento: Departamento) {
    this.selectedDepartamento = departamento;
    this.departamentoText = departamento.name;
    this.usuario.departamento = departamento.name;
    this.showDepartamentos = false;
    this.loadMunicipios(departamento.id);
    this.clearMunicipios();
    this.validateDepartamento();
  }

  // Filtrar municipios mientras el usuario escribe
  filterMunicipios(event: any) {
    const query = event.target.value.toLowerCase();
    this.municipioText = event.target.value;
    
    if (!this.selectedDepartamento) {
      return;
    }

    if (query.length === 0) {
      this.filteredMunicipios = [...this.municipios];
      this.selectedMunicipio = null;
      this.validateMunicipio();
      return;
    }

    this.filteredMunicipios = this.municipios.filter(mun =>
      mun.name.toLowerCase().includes(query)
    );

    // Si hay coincidencia exacta, seleccionar automáticamente
    const exactMatch = this.municipios.find(mun => 
      mun.name.toLowerCase() === query.toLowerCase()
    );
    
    if (exactMatch) {
      this.selectedMunicipio = exactMatch;
    } else {
      this.selectedMunicipio = null;
    }

    this.validateMunicipio();
    this.showMunicipios = true;
  }

  // Seleccionar municipio del dropdown
  selectMunicipio(municipio: Municipio) {
    this.selectedMunicipio = municipio;
    this.municipioText = municipio.name;
    this.usuario.municipio = municipio.name;
    this.showMunicipios = false;
    this.validateMunicipio();
  }

  // Limpiar municipios cuando cambia departamento
  clearMunicipios() {
    this.municipioText = '';
    this.usuario.municipio = '';
    this.selectedMunicipio = null;
    this.municipios = [];
    this.filteredMunicipios = [];
    this.validateMunicipio();
  }

  // Ocultar dropdown departamentos con delay
  hideDepartamentosDropdown() {
    setTimeout(() => {
      this.showDepartamentos = false;
    }, 200);
  }

  // Ocultar dropdown municipios con delay
  hideMunicipiosDropdown() {
    setTimeout(() => {
      this.showMunicipios = false;
    }, 200);
  }

  // Validar departamento
  validateDepartamento(): void {
    if (!this.departamentoText.trim()) {
      this.departamentoInvalid = false;
      this.departamentoValid = false;
      return;
    }

    const isValid: boolean = !!(this.selectedDepartamento && 
                   this.selectedDepartamento.name.toLowerCase() === this.departamentoText.toLowerCase());
    
    this.departamentoInvalid = !isValid;
    this.departamentoValid = isValid;
  }

  // Validar municipio
  validateMunicipio(): void {
    if (!this.municipioText.trim()) {
      this.municipioInvalid = false;
      this.municipioValid = false;
      return;
    }

    if (!this.selectedDepartamento) {
      this.municipioInvalid = true;
      this.municipioValid = false;
      return;
    }

    const isValid: boolean = !!(this.selectedMunicipio && 
                   this.selectedMunicipio.name.toLowerCase() === this.municipioText.toLowerCase());
    
    this.municipioInvalid = !isValid;
    this.municipioValid = isValid;
  }

  // Validar email con múltiples reglas
  validateEmail(): void {
    const email: string | undefined = this.usuario.correo?.trim();
    
    if (!email) {
      this.emailInvalid = false;
      this.emailValid = false;
      this.emailErrorMessage = '';
      return;
    }

    // Validaciones de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const minLength = 5;
    const maxLength = 100;

    // Validar longitud mínima
    if (email.length < minLength) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = `El correo debe tener al menos ${minLength} caracteres.`;
      return;
    }

    // Validar longitud máxima
    if (email.length > maxLength) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = `El correo no puede tener más de ${maxLength} caracteres.`;
      return;
    }

    // Validar que no tenga espacios
    if (email.includes(' ')) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = 'El correo no puede contener espacios.';
      return;
    }

    // Validar que no tenga caracteres especiales no permitidos
    if (!/^[a-zA-Z0-9._%+-@]+$/.test(email)) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = 'El correo contiene caracteres no válidos.';
      return;
    }

    // Validar formato general
    if (!emailRegex.test(email)) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = 'Por favor ingrese un correo electrónico válido.';
      return;
    }

    // Validar que el dominio tenga al menos 2 caracteres después del punto
    const parts = email.split('@');
    if (parts.length !== 2) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = 'Formato de correo inválido.';
      return;
    }

    const [localPart, domain] = parts;
    
    // Validar parte local
    if (localPart.length === 0 || localPart.startsWith('.') || localPart.endsWith('.')) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = 'El nombre de usuario del correo no es válido.';
      return;
    }

    // Validar dominio
    if (domain.length === 0 || !domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
      this.emailInvalid = true;
      this.emailValid = false;
      this.emailErrorMessage = 'El dominio del correo no es válido.';
      return;
    }

    // Si pasa todas las validaciones
    this.emailInvalid = false;
    this.emailValid = true;
    this.emailErrorMessage = '';
  }

  // Seleccionar perfil
  selectProfile(profileId: string) {
    this.perfilSeleccionado = profileId;
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    return this.perfilSeleccionado !== '' &&
           this.departamentoValid &&
           this.municipioValid &&
           this.emailValid;
  }

  // Guardar información
  guardarInformacion() {
    if (!this.isFormValid()) {
      // Mostrar errores si el formulario no es válido
      if (!this.perfilSeleccionado) {
        alert('Por favor seleccione un perfil de usuario.');
        return;
      }
      
      if (!this.departamentoValid) {
        this.validateDepartamento();
        return;
      }
      
      if (!this.municipioValid) {
        this.validateMunicipio();
        return;
      }
      
      if (!this.emailValid) {
        this.validateEmail();
        return;
      }
      
      return;
    }

    const datosCompletos = {
      perfil: this.perfilSeleccionado,
      departamento: this.selectedDepartamento?.name,
      departamentoId: this.selectedDepartamento?.id,
      municipio: this.selectedMunicipio?.name,
      municipioId: this.selectedMunicipio?.id,
      correo: this.usuario.correo.trim().toLowerCase()
    };

    console.log('Datos a guardar:', datosCompletos);

    // Aquí puedes agregar la lógica para enviar los datos al backend
    // Ejemplo:
    // this.http.post('tu-endpoint', datosCompletos).subscribe(...)
    
    alert('Información guardada correctamente!');
  }

  // Método simple para consultar datos
  async consultarDatos(): Promise<void> {
    try {
      if (!this.sqliteService) {
        console.log('⚠️ SQLite no disponible');
        alert('⚠️ SQLite no disponible - funcionando sin base de datos');
        return;
      }

      console.log('🔍 Consultando datos en SQLite...');
      
      const usuarios = await this.sqliteService.getUsuarios();
      console.log('=== USUARIOS GUARDADOS EN SQLITE ===');
      console.log('Total de usuarios:', usuarios.values?.length || 0);
      
      if (usuarios.values && usuarios.values.length > 0) {
        usuarios.values.forEach((usuario: Usuario, index: number) => {
          console.log(`Usuario ${index + 1}:`, {
            id: usuario.id,
            perfil: usuario.perfil,
            departamento: usuario.departamento,
            municipio: usuario.municipio,
            correo: usuario.correo
          });
        });
        
        // Mostrar el último usuario guardado
        const ultimoUsuario = usuarios.values[usuarios.values.length - 1];
        console.log('✅ ÚLTIMO USUARIO GUARDADO:', ultimoUsuario);
        
        // Mostrar también en alerta para el usuario
        alert(`✅ Se encontraron ${usuarios.values.length} usuarios guardados. Ver consola para detalles.`);
      } else {
        console.log('📝 No hay usuarios guardados');
        alert('📝 No hay usuarios guardados en la base de datos.');
      }
      
    } catch (err) {
      console.error('❌ Error al verificar datos guardados:', err);
      alert('❌ Error al consultar la base de datos: ' + err);
    }
  }

  // Fallback con departamentos básicos si falla la API
  private loadFallbackDepartamentos() {
    console.log('Cargando departamentos fallback...');
    this.departamentos = [
      { id: 1, name: 'Amazonas', description: 'Departamento del Amazonas' },
      { id: 2, name: 'Antioquia', description: 'Departamento de Antioquia' },
      { id: 3, name: 'Arauca', description: 'Departamento de Arauca' },
      { id: 4, name: 'Atlántico', description: 'Departamento del Atlántico' },
      { id: 5, name: 'Bolívar', description: 'Departamento de Bolívar' },
      { id: 6, name: 'Boyacá', description: 'Departamento de Boyacá' },
      { id: 7, name: 'Caldas', description: 'Departamento de Caldas' },
      { id: 8, name: 'Caquetá', description: 'Departamento del Caquetá' },
      { id: 9, name: 'Casanare', description: 'Departamento de Casanare' },
      { id: 10, name: 'Cauca', description: 'Departamento del Cauca' },
      { id: 11, name: 'Cesar', description: 'Departamento del Cesar' },
      { id: 12, name: 'Chocó', description: 'Departamento del Chocó' },
      { id: 13, name: 'Córdoba', description: 'Departamento de Córdoba' },
      { id: 14, name: 'Cundinamarca', description: 'Departamento de Cundinamarca' },
      { id: 15, name: 'Guainía', description: 'Departamento de Guainía' },
      { id: 16, name: 'Guaviare', description: 'Departamento del Guaviare' },
      { id: 17, name: 'Huila', description: 'Departamento del Huila' },
      { id: 18, name: 'La Guajira', description: 'Departamento de La Guajira' },
      { id: 19, name: 'Magdalena', description: 'Departamento del Magdalena' },
      { id: 20, name: 'Meta', description: 'Departamento del Meta' },
      { id: 21, name: 'Nariño', description: 'Departamento de Nariño' },
      { id: 22, name: 'Norte de Santander', description: 'Departamento de Norte de Santander' },
      { id: 23, name: 'Putumayo', description: 'Departamento del Putumayo' },
      { id: 24, name: 'Quindío', description: 'Departamento del Quindío' },
      { id: 25, name: 'Risaralda', description: 'Departamento de Risaralda' },
      { id: 26, name: 'San Andrés y Providencia', description: 'Departamento de San Andrés y Providencia' },
      { id: 27, name: 'Santander', description: 'Departamento de Santander' },
      { id: 28, name: 'Sucre', description: 'Departamento de Sucre' },
      { id: 29, name: 'Tolima', description: 'Departamento del Tolima' },
      { id: 30, name: 'Valle del Cauca', description: 'Departamento del Valle del Cauca' },
      { id: 31, name: 'Vaupés', description: 'Departamento del Vaupés' },
      { id: 32, name: 'Vichada', description: 'Departamento del Vichada' }
    ];
    this.filteredDepartamentos = [...this.departamentos];
    console.log('Departamentos fallback cargados:', this.departamentos.length);
  }
}