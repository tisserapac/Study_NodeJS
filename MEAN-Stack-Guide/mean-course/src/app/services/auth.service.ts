import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from '../auth/auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private authStatusListner = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListner() {
    return this.authStatusListner.asObservable();
  }

  createUser(email: string, password: string){
    const authData: AuthData = {email: email, password: password}
    this.http.post("http://localhost:3000/api/user/signup", authData)
    .subscribe(response => {
      console.log(response);
    });
  }

  login(email: string, password: string){
    const authData: AuthData = {email: email, password: password}
    this.http.post<{token: string, expiresIn: number}>("http://localhost:3000/api/user/login", authData)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expirsInDuration = response.expiresIn;
        this.tokenTimer = setTimeout(() => {
          this.logout();
        }, expirsInDuration * 1000 );
        this.isAuthenticated = true;
        this.authStatusListner.next(true);
        clearTimeout(this.tokenTimer);
        this.router.navigate(['/']);
      }
    });
  }

  logout(){
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    this.router.navigate(['/']);
  }
}
