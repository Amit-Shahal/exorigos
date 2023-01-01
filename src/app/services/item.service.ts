import { Item } from './Item';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  dataChange: any;
  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>('../../assets/MOCK_DATA.json');
  }
  // addItem(): boolean {
  //   return true;
  // }

  // editItem(id: number): boolean {
  //   return true;
  // }
}
