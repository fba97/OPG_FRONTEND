// Rispecchia Primitives/PersonaggioBase.cs lato backend (stesso ordine enum, stesso matching
// per nome) — serve solo per decidere quali skill mostrare come "tue" nel pannello Skill.
const MAPPATURA: Record<string, number> = {
  luffy: 0,
  rubber: 0,
  zoro: 1,
  roronoa: 1,
  nami: 2,
  usopp: 3,
  sanji: 4,
  chopper: 5,
  tony: 5,
  robin: 6,
  nico: 6,
  franky: 7,
  brook: 8,
  law: 9,
  trafalgar: 9,
};

export function personaggioBaseDaNome(nome: string | undefined | null): number | null {
  const nomeLower = (nome ?? '').toLowerCase();
  const key = Object.keys(MAPPATURA).find(k => nomeLower.includes(k));
  return key !== undefined ? MAPPATURA[key] : null;
}
