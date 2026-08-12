import { SidebarMenuItem } from '../partita/components/left-sidebar/left-sidebar.component';

// Menu condiviso da tutte le pagine con app-left-sidebar. Prima ogni pagina definiva la
// propria lista in modo indipendente: nessuno le aggiornava quando venivano create nuove
// pagine (oggetti, frutti esistevano gia' con una route funzionante ma non erano linkate
// da nessun menu). Ogni pagina compone il proprio menuItems a partire da questi blocchi
// invece di duplicare le voci localmente.

// Pagine di consultazione (dizionari), sempre le stesse ovunque ci si trovi nell'app.
export const DIZIONARI_MENU: SidebarMenuItem[] = [
  { name: 'Eroi', route: '/personaggi' },
  { name: 'Oggetti', route: '/oggetti' },
  { name: 'Frutti', route: '/frutti' },
  { name: 'Probabilità', route: '/probabilita' },
  { name: 'Imprevisti', route: '/imprevisti' },
];

// Voci prima di aver creato/caricato una partita.
export const HOME_MENU: SidebarMenuItem[] = [
  { name: 'Mainpage', route: '/mainpage' },
  { name: 'Login', route: '/login' },
  { name: 'Register', route: '/register' },
];

// Voce sempre valida per tornare alla home da qualunque pagina.
export const TORNA_ALLA_HOME: SidebarMenuItem = { name: 'Torna alla home', route: '/homepage' };
