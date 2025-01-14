import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartitaComponent } from './partita/partita.component';
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




const routes: Routes = [
  { path: '', redirectTo: '/mainpage', pathMatch: 'full' },
  { path: 'mainpage', component: MainpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'partita', component: PartitaComponent },
  { path: 'combattimento', component: CombattimentoComponent },
  { path: 'dettagliocombattimento', component: DettagliocombattimentoComponent },
  { path: 'oggetti', component: OggettiComponent },
  { path: 'bosses', component: BossComponent },
  { path: 'frutti', component: FruttiComponent },
  { path: 'personaggi', component: PersonaggiComponent },
  { path: 'probabilita', component: ProbabilitaComponent },
  { path: 'imprevisti', component: ImprevistiComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
