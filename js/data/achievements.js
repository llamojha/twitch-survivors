/* ============ achievements.js — hitos persistentes de Twitch Survivors ============
 * Los IDs históricos se conservan cuando representan el mismo contador para no
 * romper partidas guardadas. Los hitos de colección, gacha, legendarios y grupo
 * quedan fuera del MVP porque sus sistemas ya no son alcanzables.
 */
G.AchDefs = (() => {
  const st = k => s => (s.stats && s.stats[k]) || 0;
  const count = k => s => Object.keys(s[k] || {}).length;

  const CATS = [['supervivencia', 'Supervivencia'], ['combate', 'Combate'], ['otros', 'Contratos']];

  const LIST = [
    { id: 'time5', cat: 'supervivencia', tier: 1, name: 'Primera guardia', desc: 'Sobrevive 5 minutos.', value: s => Math.floor(st('bestTime')(s) / 60), goal: 5, reward: { coins: 200 } },
    { id: 'time10', cat: 'supervivencia', tier: 2, name: 'Sin descanso', desc: 'Sobrevive 10 minutos.', value: s => Math.floor(st('bestTime')(s) / 60), goal: 10, reward: { t1: 4 } },
    { id: 'time15', cat: 'supervivencia', tier: 2, name: 'Línea firme', desc: 'Sobrevive 15 minutos.', value: s => Math.floor(st('bestTime')(s) / 60), goal: 15, reward: { t10: 1 } },
    { id: 'time20', cat: 'supervivencia', tier: 3, name: 'Superviviente', desc: 'Sobrevive 20 minutos.', value: s => Math.floor(st('bestTime')(s) / 60), goal: 20, reward: { t10: 2 }, title: 'Superviviente' },
    { id: 'lvl20', cat: 'supervivencia', tier: 1, name: 'Poder creciente', desc: 'Alcanza el nivel 15 en una run.', value: st('bestLevel'), goal: 15, reward: { t1: 2 } },
    { id: 'lvl40', cat: 'supervivencia', tier: 3, name: 'Imparable', desc: 'Alcanza el nivel 30 en una run.', value: st('bestLevel'), goal: 30, reward: { t10: 1 }, title: 'Imparable' },
    { id: 'judge', cat: 'supervivencia', tier: 2, name: 'La Sentencia', desc: 'Alcanza la Sentencia del Tirano del Rift.', value: st('judged'), goal: 1, reward: { t10: 1 }, title: 'Juzgado' },
    { id: 'judge60', cat: 'supervivencia', tier: 3, name: 'Contra el Tirano', desc: 'Resiste 1 minuto ante el Tirano del Rift.', value: st('judgeTime'), goal: 60, reward: { t10: 2 }, title: 'Marcado por el Rift' },
    { id: 'judgeBoss', cat: 'supervivencia', tier: 3, name: 'Rompeasedios', desc: 'Derrota a 3 jefes durante la Sentencia.', value: st('judgeBosses'), goal: 3, reward: { t10: 2 } },
    { id: 'runs50', cat: 'supervivencia', tier: 2, name: 'Otra run más', desc: 'Juega 50 runs.', value: st('runs'), goal: 50, reward: { t10: 1 }, title: 'Incansable' },

    { id: 'kills1k', cat: 'combate', tier: 1, name: 'Limpiando la horda', desc: 'Elimina a 1.000 enemigos.', value: st('totalKills'), goal: 1000, reward: { t1: 2 } },
    { id: 'kills10k', cat: 'combate', tier: 2, name: 'Veterano de la horda', desc: 'Elimina a 10.000 enemigos.', value: st('totalKills'), goal: 10000, reward: { t10: 1 }, title: 'Veterano' },
    { id: 'kills100k', cat: 'combate', tier: 3, name: 'Leyenda del chat', desc: 'Elimina a 100.000 enemigos.', value: st('totalKills'), goal: 100000, reward: { t10: 3 }, title: 'Leyenda del chat' },
    { id: 'boss1', cat: 'combate', tier: 1, name: 'Primer coloso', desc: 'Derrota a un jefe.', value: st('bossesTotal'), goal: 1, reward: { t1: 2 } },
    { id: 'boss25', cat: 'combate', tier: 2, name: 'Cazajefes', desc: 'Derrota a 25 jefes.', value: st('bossesTotal'), goal: 25, reward: { t10: 1 }, title: 'Cazajefes' },
    { id: 'boss100', cat: 'combate', tier: 3, name: 'Fin de la horda', desc: 'Derrota a 100 jefes.', value: st('bossesTotal'), goal: 100, reward: { t10: 2 } },
    { id: 'items5', cat: 'combate', tier: 1, name: 'Buscador de reliquias', desc: 'Encuentra 5 reliquias distintas.', value: count('itemsFound'), goal: 5, reward: { t1: 3 } },
    { id: 'itemsAll', cat: 'combate', tier: 2, name: 'Arsenal completo', desc: 'Encuentra las 11 reliquias.', value: count('itemsFound'), goal: 11, reward: { t10: 1 }, title: 'Maestro de reliquias' },

    { id: 'mis10', cat: 'otros', tier: 1, name: 'Cazarrecompensas', desc: 'Completa 10 contratos.', value: st('missionsDone'), goal: 10, reward: { t1: 3 } },
    { id: 'mis50', cat: 'otros', tier: 2, name: 'Habitual del tablón', desc: 'Completa 50 contratos.', value: st('missionsDone'), goal: 50, reward: { t10: 1 }, title: 'Cazarrecompensas' },
    { id: 'mis200', cat: 'otros', tier: 3, name: 'Juramento cumplido', desc: 'Completa 200 contratos.', value: st('missionsDone'), goal: 200, reward: { t10: 3 }, title: 'Guardián del tablón' }
  ];

  const BY = {};
  for (const a of LIST) BY[a.id] = a;
  return { CATS, LIST, BY };
})();
