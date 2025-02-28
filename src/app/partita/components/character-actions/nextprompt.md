1. Posizionamento del personaggio
Il personaggio NON deve essere contenuto dentro il div della sezione principale.
Deve essere spostato fuori dal div, con una parte sovrapposta sulla destra, per creare un effetto dinamico.
L'immagine deve sembrare uscire dal layout, come se fosse posizionata davanti agli altri elementi.
Deve essere leggermente ruotata di 5 gradi a destra per rendere il design più dinamico.
🔹 2. Effetto "ventaglio" sulle carte dietro
Dietro la carta principale ci devono essere due o tre carte leggermente sfalsate, che rappresentano i turni dei prossimi giocatori.

Interazione richiesta:
Quando l'utente clicca su una di queste carte, voglio che si apra con un'animazione a ventaglio, come se fossero tenute in mano.
Dopo l'animazione, la carta deve mostrare le informazioni sul prossimo turno:
Nome del giocatore
Un'icona o avatar
Numero del turno
Se il giocatore chiude la carta, questa deve ritornare nella posizione originale con un effetto di fade-out.
Effetti grafici e animazioni:
L'animazione di apertura deve essere fluida, usando transform, rotate e translate per simulare un'apertura naturale.
Quando una carta è aperta, le altre devono rimanere leggermente sfalsate dietro di essa.
La carta principale del personaggio deve avere un effetto glow o un'ombra leggera per risaltare.
🔹 3. Barra delle stats (Potenziabile con soldi)
Le tre barre principali (Salute, Difesa e Attacco) devono essere aggiornabili spendendo monete.

Meccanica di Upgrade:
Accanto a ogni barra deve esserci un pulsante "Upgrade" con il costo in monete ben visibile.
Quando il giocatore clicca su "Upgrade", la statistica aumenta e il costo dell'upgrade successivo cresce progressivamente.
Se il giocatore non ha abbastanza monete, il pulsante deve essere disattivato (grigio).
Gli upgrade devono essere animati, con un effetto di riempimento progressivo della barra quando viene migliorata.
🔹 4. Distanza d’attacco
Aggiungere un'informazione per indicare quanto lontano posso attaccare.
Visualizzare questa informazione con un'icona a forma di arco o raggio, accompagnata da un numero (es. "🔴 3" per indicare 3 unità di distanza).
L'icona deve essere dinamica e cambiare se il giocatore migliora la distanza d'attacco.
🔹 5. Stati del personaggio (Massimo 3, visibili con icone)
Deve esserci una sezione dedicata agli stati attuali del personaggio, con un massimo di 3 stati attivi contemporaneamente.
Gli stati possibili e le loro icone:
Rallentato 🌀 (riduce la velocità)
Bloccato 🔒 (non può muoversi)
Avvelenato ☠️ (perde vita nel tempo)
Se il personaggio non ha stati attivi, la sezione deve mostrare un'icona "Nessuno stato attivo".
Gli stati devono essere aggiornabili in tempo reale, con effetti visivi che li evidenziano quando vengono applicati o rimossi.
🔹 6. Prisma per visualizzare le statistiche
Voglio un grafico a forma di prisma che mostri visivamente le statistiche attuali del personaggio.

Struttura del Prisma:
Il prisma deve avere almeno 4 parametri:
Forza
Difesa
Velocità
Vitalità
Il grafico deve confrontare:
Le statistiche base (in colore trasparente o meno visibile).
Le statistiche migliorate dopo gli upgrade (in un colore più acceso).
Deve essere chiaro quali sono le statistiche iniziali e come sono state migliorate con gli upgrade.
Effetti Visivi:
Il prisma deve avere una transizione animata ogni volta che una statistica migliora.
Se possibile, aggiungere un effetto di glow sulle sezioni migliorate per enfatizzare i potenziamenti.
🔹 Obiettivo finale
Creare un’interfaccia dinamica e immersiva, dove: ✅ Il personaggio è fuori dal layout principale con un effetto di sovrapposizione.
✅ Le carte dietro di lui si aprono con un'animazione a ventaglio, mostrando i turni dei prossimi giocatori.
✅ Le statistiche possono essere potenziate con soldi, in modo chiaro e interattivo.
✅ Sono visibili distanza d’attacco e stati del personaggio con icone dinamiche.
✅ Il prisma delle statistiche permette di visualizzare e confrontare i miglioramenti in modo chiaro e moderno.

Puoi implementare queste modifiche nel codice? 🚀