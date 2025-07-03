import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  SQLiteConnection,
  capSQLiteSet,
  capSQLiteChanges,
  capSQLiteValues,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({ providedIn: 'root' })
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'dr_agro.db';

  constructor() {
    this.sqlite = new SQLiteConnection(Capacitor.isNativePlatform());
  }

  /** Abre (o crea) la base de datos y la tabla 'usuario' */
  public async initialize(): Promise<void> {
    if (this.db) {
      return;
    }
  try {
    // abre conexión
        this.db = await this.sqlite.createConnection(this.DB_NAME, false, 'no-encryption', 1, false);
        await this.db.open();

        // crea tabla si no existe
        const createTable = `
          CREATE TABLE IF NOT EXISTS usuario (
            id INTEGER PRIMARY KEY NOT NULL,
            perfil TEXT,
            departamento TEXT,
            departamentoId INTEGER,
            municipio TEXT,
            municipioId INTEGER,
            correo TEXT
          );
        `;
        await this.db.execute(createTable);

  } catch (err) {
    console.log("Error inicializando SQLite:", err);
    throw err;
    }
  }

  /** Inserta un nuevo usuario */
  public async addUsuario(data: {
    perfil: string;
    departamento: string;
    departamentoId: number;
    municipio: string;
    municipioId: number;
    correo: string;
  }): Promise<capSQLiteChanges> {
    if (!this.db) {
      throw new Error('DB no inicializada');
    }
  try {
    const stmt = `
      INSERT INTO usuario
      (perfil, departamento, departamentoId, municipio, municipioId, correo)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    return await this.db.run(
      stmt,
      [
        data.perfil,
        data.departamento,
        data.departamentoId,
        data.municipio,
        data.municipioId,
        data.correo
      ]
    );
  } catch (err) {
    console.log('Error insertando usuario', err);
    throw err;
    }
  }

public async getUsuarios(): Promise<capSQLiteValues> {
    if (!this.db) {
      throw new Error('DB no inicializada. Llama a initialize() antes.');
    }
    try {
      const query = `SELECT * FROM usuario;`;
      return await this.db.query(query);
    } catch (err) {
      console.error('Error consultando usuarios:', err);
      throw err;
    }
  }

  /** Cierra la conexión (opcional) */
  public async close(): Promise<void> {
    if (this.db) {
      try{
        await this.sqlite.closeConnection(this.DB_NAME, false);
        } catch (err) {
          console.warn('Error cerrando conexion SQLite', err);
        }
      this.db = null;
    }
  }
}
