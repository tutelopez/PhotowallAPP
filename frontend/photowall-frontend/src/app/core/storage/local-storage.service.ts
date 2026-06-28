import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  /**
   * Guarda un valor en localStorage
   */
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Obtiene un valor del localStorage
   */
  get<T>(key: string): T | null {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Elimina una clave
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Verifica si existe una clave
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Limpia todo el almacenamiento
   */
  clear(): void {
    localStorage.clear();
  }
}
