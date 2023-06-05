import { NgModule } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
// import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';


@NgModule({
  imports: [
    MatButtonModule, 
    MatIconModule, 
    FormsModule, 
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule, 
    MatCheckboxModule, 
    ReactiveFormsModule, 
    MatSidenavModule, 
    MatToolbarModule,
    MatListModule],
  exports: [
    MatButtonModule, 
    MatIconModule, 
    FormsModule, 
    MatInputModule, 
    MatDatepickerModule,
    MatNativeDateModule, 
    MatCheckboxModule, 
    ReactiveFormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule]
})
export class MaterialModule {}
