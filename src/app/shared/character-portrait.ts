// Risolve il ritratto SVG di un personaggio quando il backend non valorizza `imageUrl`
// (oggi sempre vuoto per i personaggi reali, verificato dal vivo su GetUpdatePartitaSoft).
// Riusato da turn/character-actions/combat-modal per non duplicare la mappatura nome -> file.

const KNOWN_PORTRAITS: Record<string, string> = {
  luffy: 'luffy',
  rubber: 'luffy',
  zoro: 'zoro',
  roronoa: 'zoro',
  robin: 'robin',
  nico: 'robin',
  chopper: 'chopper',
  tony: 'chopper',
  usopp: 'usopp',
  law: 'law',
  trafalgar: 'law',
};

const KNOWN_BOSSES: Record<string, string> = {
  doflamingo: 'doflamingo',
  diamante: 'diamante',
};

export function resolvePersonaggioImage(personaggio: { nome?: string; imageUrl?: string } | null | undefined): string {
  if (!personaggio) {
    return 'assets/images/personaggi/base_personaggi.svg';
  }
  if (personaggio.imageUrl) {
    return personaggio.imageUrl;
  }
  const nomeLower = (personaggio.nome ?? '').toLowerCase();

  const bossKey = Object.keys(KNOWN_BOSSES).find(k => nomeLower.includes(k));
  if (bossKey) {
    return `assets/images/boss/${KNOWN_BOSSES[bossKey]}.svg`;
  }

  const key = Object.keys(KNOWN_PORTRAITS).find(k => nomeLower.includes(k));
  return key
    ? `assets/images/personaggi/${KNOWN_PORTRAITS[key]}.svg`
    : 'assets/images/personaggi/base_personaggi.svg';
}
