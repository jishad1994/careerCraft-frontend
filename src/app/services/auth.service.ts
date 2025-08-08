import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { userRegister } from '../models/auth.interface';
import { ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  //base url from environment files
  private baseUrl = environment.apiUrl;

  //check phone number exists
  checkPhoneExists(phone: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(
      `${this.baseUrl}/api/user/check-phone/${phone}`
    );
  }

  //check emai exists
  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(
      `${this.baseUrl}/api/user/check-email/${email}`
    );
  }

  //user register
  userSignup(payload: userRegister): Observable<any> {
    console.log('user signup works');

    return this.http.post(`${this.baseUrl}/api/user/signup`, payload);
  }
}
