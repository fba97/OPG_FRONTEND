import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CombattimentoComponent } from './combattimento/combattimento.component';
import { DettagliocombattimentoComponent } from './dettagliocombattimento/dettagliocombattimento.component';
import { OggettiComponent } from './oggetti/oggetti.component';
import { BossComponent } from './boss/boss.component';
import { FruttiComponent } from './frutti/frutti.component';
import { PersonaggiComponent } from './personaggi/personaggi.component';
import { ProbabilitaComponent } from './probabilita/probabilita.component';
import { ImprevistiComponent } from './imprevisti/imprevisti.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GameStatusComponent } from './partita/components/game-status/game-status.component';
import { PartitaComponent } from './partita/partita.component';
import { LeftSidebarComponent } from './partita/components/left-sidebar/left-sidebar.component';
import { CharacterInfoComponent } from './partita/components/character-info/character-info.component'; 
import { MappaComponent } from './partita/components/mappa/mappa.component'; 
import { TurnComponent } from './partita/components/turn/turn.component'; 



@NgModule({
  declarations: [
    AppComponent,
    MainpageComponent,
    LoginComponent,
    RegisterComponent,
    HomepageComponent,
    CombattimentoComponent,
    OggettiComponent,
    BossComponent,
    FruttiComponent,
    PersonaggiComponent,
    ProbabilitaComponent,
    ImprevistiComponent,
    DettagliocombattimentoComponent,
    GameStatusComponent,
    PartitaComponent,
    LeftSidebarComponent,
    CharacterInfoComponent,
    MappaComponent,
    TurnComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
