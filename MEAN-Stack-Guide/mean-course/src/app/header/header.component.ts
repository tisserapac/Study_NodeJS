import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy{
  userAuthenticated = false;
  private authListnerSubs: Subscription; 

  constructor(private authService: AuthService){}
  
  ngOnInit(): void {
    this.userAuthenticated = this.authService.getIsAuth();
    this.authListnerSubs = this.authService.
    getAuthStatusListner().
    subscribe(isAuthenticated =>{
      this.userAuthenticated = isAuthenticated;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListnerSubs.unsubscribe();
  }
}
