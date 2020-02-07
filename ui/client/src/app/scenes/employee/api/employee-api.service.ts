import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EmployeeApiService {
  constructor(private http: HttpClient) {}

  getBalance() {
    return this.http.get<any>('/employee/balance');
  }
}
