import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms'
import { ReactiveFormsModule} from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({

  declarations: [
    AppComponent
  ],

  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskModule.forRoot(),
    GoogleMapsModule,
    HttpClientModule
  ],

  providers: [

  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
