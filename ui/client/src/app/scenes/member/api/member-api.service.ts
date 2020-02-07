import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MemberModel } from '../models/member.model';
import { EmployeeModel } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class MemberApiService {
  constructor(private http: HttpClient) {}

  getBalance() {
    return this.http.get<any>('/member/balance');
  }

  getEmployeesList(member: string) {
    return this.http.get<any>(`/member/${member}/employees`);
  }

  getMembers() {
    return this.http
      .get<MemberModel[]>('/member/members');
  }

  getEmployees() {
    return this.http
      .get<EmployeeModel[]>('/member/employees');
  }

  register(employee: { name: string; email: string; password: string }) {
    return this.http.post<any>('/member/registeremployee', employee);
  }

  getRedeemForList() {
    return this.http.get<any>('/member/list/redeemfor');
  }

  redeemToken(redeem: { redeemforid: number; redeemforcount: number }) {
    return this.http.post<any>('/member/redeem', redeem);
  }

  shareToken(item: { sharetoid: number; tokencount: number }) {
    return this.http.post<any>('/member/share', item);
  }

  getRequestsList() {
    return this.http.get<any>('/member/requests');
  }
}
