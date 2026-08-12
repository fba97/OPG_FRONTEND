// Risolve la carta SVG di un Oggetto: il backend (GET api/Update/Oggetti) non restituisce
// nessun campo immagine, quindi si mappa per id sugli asset gia' presenti in
// assets/images/oggetti/ (verificato uno per uno contro i 29 nomi reali del catalogo).
const OGGETTO_ART: Record<number, string> = {
  1: 'shusui',
  2: 'cappello_di_paglia',
  3: 'baffotti',
  4: 'barbotta',
  5: 'poneglyph',
  6: 'spada_di_suleiman',
  7: 'tubo_di_ferro_di_sabo',
  8: 'urlo_di_gats',
  9: 'trivella_di_shinjao',
  10: 'steroidi_energetici',
  11: 'sasso_grande',
  12: 'ricordo_di_corazon',
  13: 'pugnale_della_cornuta',
  14: 'mummy',
  15: 'pelliccia_di_bepo',
  16: 'muco_di_trebol',
  17: 'ideo',
  18: 'jean_ango',
  19: 'manicaretti_di_sanji',
  20: 'nami_maglietta_bagnata',
  21: 'fungo velenoso',
  22: 'fratelli_funk',
  23: 'damask',
  24: 'cp0',
  25: 'cappello_di_koala',
  26: 'bende',
  27: 'barriera_di_bartolomeo',
  28: 'attacco_speciale_a_lungo_raggio_bagworm',
  29: 'armatura_a_scaglie_rosa_di_momonosuke',
};

export function resolveOggettoImage(id: number): string {
  const file = OGGETTO_ART[id];
  return file ? `assets/images/oggetti/${file}.svg` : 'assets/images/oggetti/base_oggetti.svg';
}
