import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private dbName = 'employeeDB';
  private storeName = 'employeeStore';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      this.db = request.result;
      if (!this.db.objectStoreNames.contains(this.storeName)) {
        this.db.createObjectStore(this.storeName, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        console.error('Error opening indexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  private async ensureDBReady(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    } else {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.ensureDBReady().then(() => resolve());
        }, 100); // Adjust the delay as needed
      });
    }
  }

  // Implement CRUD methods here
  async add(data: any): Promise<number> {
    await this.ensureDBReady();
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.add(data);

    return new Promise<number>((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result as number;
        resolve(result);
      };

      request.onerror = () => {
        console.error('Error adding item:', request.error);
        reject(request.error);
      };
    });
  }

  async getById(id: number): Promise<any> {
    await this.ensureDBReady();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.get(id);

    return new Promise<any>((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result);
      };

      request.onerror = () => {
        console.error('Error getting item by ID:', request.error);
        reject(request.error);
      };
    });
  }

  async listEmployees(): Promise<any[]> {
    await this.ensureDBReady();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    return new Promise<any[]>((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result);
      };

      request.onerror = () => {
        console.error('Error listing employees:', request.error);
        reject(request.error);
      };
    });
  }

  async update(data: any): Promise<void> {
    await this.ensureDBReady();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.put(data); // Using put to update the existing record

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error updating item:', request.error);
        reject(request.error);
      };
    });
  }

  async delete(id: number): Promise<void> {
    await this.ensureDBReady();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.delete(id);

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting item:', request.error);
        reject(request.error);
      };
    });
  }
}
