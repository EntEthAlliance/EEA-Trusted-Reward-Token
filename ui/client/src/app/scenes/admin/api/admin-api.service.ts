import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RequestModel } from '../models/reguest.model';
import { SelectedRequest } from '../models/selected-request.model';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  constructor(private http: HttpClient) {}

  issueTokens(data) {
    return this.http.post<any>(`/admin/issuetokens`, data);
  }

  getRewardReasons() {
    return this.http.get<any>(`/admin/rewardreasons`);
  }

  register(employee: { name: string; email: string; password: string }) {
    return this.http.post<any>('/admin/registermember', employee);
  }

  getRequests() {
    return this.http.get<RequestModel[]>('/admin/requests');
  }

  getRequestById(id: number) {
    return this.http.get<SelectedRequest>(`/admin/requests/${id}`);
  }

  postRedeemRequest(requestResult: {requestid: number, iscomplete: boolean}) {
    return this.http.post<any>('/admin/processredeem', requestResult);
  }
}
