import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OggettiComponent } from './oggetti/oggetti.component';
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
import { MappaComponent } from './partita/components/mappa/mappa.component';
import { TurnComponent } from './partita/components/turn/turn.component'; 
import { CharacterActionsComponent } from './partita/components/character-actions/character-actions.component';
import { CardFrameComponent } from './shared/components/card-frame/card-frame.component';
import { CombatModalComponent } from './partita/components/combat-modal/combat-modal.component';




@NgModule({
  declarations: [
    AppComponent,
    MainpageComponent,
    LoginComponent,
    RegisterComponent,
    HomepageComponent,
    OggettiComponent,
    FruttiComponent,
    PersonaggiComponent,
    ProbabilitaComponent,
    ImprevistiComponent,
    GameStatusComponent,
    PartitaComponent,
    LeftSidebarComponent,
    MappaComponent,
    TurnComponent,
    CharacterActionsComponent,
    CardFrameComponent,
    CombatModalComponent

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
