/* ============ missions.js — plantillas de misiones diarias y semanales ============
 * Cada día salen 3 diarias y cada semana 2 semanales (hora de España), con
 * objetivos y tipos sorteados. Se completan jugando y el premio se recoge en
 * la pantalla de Misiones. La lógica está en systems/progress.js.
 *
 *   ev      evento que la hace avanzar (ver G.Progress.event)
 *   match   (datos, parámetro) -> ¿cuenta este evento?
 *   value   datos -> cuánto vale; con mode 'max' se queda el mayor, con
 *           'add' (por defecto) se suma (1 si no hay value)
 *   param   'type': sortea un tipo héroes para la misión
 */
G.MissionDefs = (() => {
  const T = t => G.U.TYPE_NAME[t];
  const min = d => Math.floor(d.time / 60);

  const daily = [
    { id: 'kill', icon: 'sword', label: 'Cacería', ev: 'kill', goals: [300, 500, 800], reward: { t1: 2, coins: 150 },
      text: n => `Elimina a ${n} enemigos` },
    { id: 'killType', icon: 'upgCrystal', label: 'Afinidad', ev: 'kill', param: 'type', goals: [30, 50, 80], reward: { t1: 2, coins: 200 },
      match: (d, t) => d.types.includes(t), text: (n, t) => `Elimina a ${n} enemigos de afinidad ${T(t)}` },
    { id: 'survive', icon: 'upgHourglass', label: 'Resistencia', ev: 'runEnd', mode: 'max', value: min, goals: [5, 7, 9], reward: { t1: 3, coins: 200 },
      text: n => `Sobrevive ${n} minutos en una run` },
    { id: 'level', icon: 'forge', label: 'Ascenso', ev: 'runEnd', mode: 'max', value: d => d.level, goals: [8, 12, 15], reward: { t1: 2, coins: 200 },
      text: n => `Alcanza el nivel ${n} en una run` },
    { id: 'boss', icon: 'upgBlade', label: 'Jefe', ev: 'kill', match: d => d.boss, goals: [1, 2], reward: { t1: 3, coins: 250 },
      text: n => (n === 1 ? 'Derrota a un jefe' : `Derrota a ${n} jefes`) },
    { id: 'chest', icon: 'upgTome', label: 'Botín', ev: 'chest', goals: [1, 2], reward: { t1: 2, coins: 200 },
      text: n => (n === 1 ? 'Abre un cofre sellado' : `Abre ${n} cofres sellados`) },
    { id: 'coins', icon: 'coin', label: 'Fortuna', ev: 'runEnd', value: d => d.coins, goals: [100, 200, 300], reward: { t1: 2, coins: 150 },
      text: n => `Recoge ${n} coronas durante tus runs` },
    { id: 'playType', icon: 'upgWard', label: 'Anfitrión', ev: 'runEnd', mode: 'max', value: min, goals: [3], reward: { t1: 3, coins: 200 },
      text: n => `Mantén al anfitrión con vida ${n} minutos` },
    { id: 'item', icon: 'upgTome', label: 'Reliquia', ev: 'item', goals: [1], reward: { t1: 2, coins: 150 },
      text: () => 'Encuentra una reliquia equipable' },
    { id: 'evolve', icon: 'upgCrown', label: 'Poder', ev: 'runEnd', mode: 'max', value: d => d.level, goals: [10], reward: { t1: 3, coins: 250 },
      text: n => `Alcanza el nivel ${n} con el anfitrión` }
  ];

  const weekly = [
    { id: 'wkill', icon: 'sword', label: 'Purga', ev: 'kill', goals: [4000, 6000], reward: { t10: 1, coins: 800 },
      text: n => `Elimina a ${n.toLocaleString('es')} enemigos` },
    { id: 'wrift', icon: 'upgCrystal', label: 'Grietas', ev: 'rift', goals: [1, 2], reward: { t10: 1, coins: 1000 },
      text: n => (n === 1 ? 'Sella una grieta' : `Sella ${n} grietas`) },
    { id: 'wboss', icon: 'upgBlade', label: 'Cazajefes', ev: 'kill', match: d => d.boss, goals: [4, 6], reward: { t10: 1, coins: 900 },
      text: n => `Derrota a ${n} jefes` },
    { id: 'wsurvive', icon: 'upgHourglass', label: 'Supervivencia', ev: 'runEnd', mode: 'max', value: min, goals: [12, 15], reward: { t10: 1, coins: 1000 },
      text: n => `Sobrevive ${n} minutos en una run` },
    { id: 'wevolve', icon: 'forge', label: 'Ascenso', ev: 'runEnd', mode: 'max', value: d => d.level, goals: [12, 16], reward: { t10: 1, coins: 900 },
      text: n => `Alcanza el nivel ${n} con el anfitrión` },
    { id: 'wdaily', icon: 'scroll', label: 'Disciplina', ev: 'missionDone', match: d => d.daily, goals: [8, 12], reward: { t10: 1, coins: 800 },
      text: n => `Completa ${n} contratos diarios` }
  ];

  const BY = {};
  for (const m of daily.concat(weekly)) BY[m.id] = m;

  return { daily, weekly, BY };
})();
