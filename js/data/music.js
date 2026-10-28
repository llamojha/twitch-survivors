/* ============ music.js — original Twitch Survivors score ============
 * Every theme is sequenced at runtime by core/audio.js. There are no sampled
 * tracks or external music files. Bright square leads, glassy bells and a
 * syncopated pulse form a shared live-channel-meets-fantasy sound.
 *
 * melody: 16 steps per bar, written as "A4:4 C5:2 -:2".
 * parts: R root · F fifth · O octave · T third · 0-5 chord tones · C chord.
 * drums: X strong · x medium · o soft · . rest.
 */
G.MUSIC = {
  // Channel Overture — welcoming menu loop with a short call and response.
  village: {
    bpm: 108, swing: 0.12,
    chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'A'],
    melody: [{ inst: 'lead', vel: 0.72, bars: [
      'D5:2 F5:2 A5:4 F5:2 E5:2 D5:4', 'F5:2 D5:2 Bb4:4 D5:4 F5:4',
      'A4:2 C5:2 F5:4 A5:4 G5:2 F5:2', 'E5:4 G5:2 E5:2 C5:4 G4:4',
      'D5:2 F5:2 A5:2 C6:2 A5:4 F5:4', 'Bb5:4 A5:2 F5:2 D5:4 F5:4',
      'G5:2 E5:2 C5:4 E5:2 G5:2 C6:4', 'A5:4 E5:4 C#5:4 A4:4'
    ] }],
    parts: [
      { inst: 'bass', octave: 2, useBass: true, vel: 0.72, pattern: 'R---F---O---F---' },
      { inst: 'bell', octave: 4, vel: 0.48, pattern: '0...2...1...3...' },
      { inst: 'pad', octave: 3, vel: 0.75, pattern: 'C---------------' }
    ],
    drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: '..o...o...o...o.' }
  },

  // Chatbound March — confident first-biome pulse for a growing party.
  forest: {
    bpm: 126, swing: 0.06,
    chords: ['Em', 'G', 'D', 'A', 'Em', 'C', 'D', 'B'],
    melody: [{ inst: 'lead', vel: 0.78, bars: [
      'E5:2 G5:2 B5:2 E6:2 B5:4 G5:4', 'D6:2 B5:2 G5:4 B5:2 A5:2 G5:4',
      'F#5:2 A5:2 D6:4 A5:4 F#5:2 E5:2', 'E5:2 A5:2 C#6:4 B5:2 A5:2 E5:4',
      'G5:2 B5:2 E6:4 D6:2 B5:2 G5:4', 'E6:2 D6:2 C6:4 G5:2 E5:2 C5:4',
      'F#5:4 A5:2 B5:2 D6:4 A5:4', 'B5:4 F#5:4 D#5:4 B4:4'
    ] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R.R.F.R.O.R.F.R.' },
      { inst: 'pluck', octave: 4, vel: 0.58, pattern: '0.2.1.2.3.2.1.2.' },
      { inst: 'pad', octave: 3, vel: 0.45, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X...x...X..x....', snare: '....X.......X...', hat: 'x.o.x.o.x.o.x.o.' }
  },

  // Moonlit Relay — spacious cave theme with signals passing between bells.
  cave: {
    bpm: 96, swing: 0.15,
    chords: ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Fm', 'Ab', 'G'],
    melody: [{ inst: 'flute', vel: 0.75, bars: [
      'G5:4 C6:2 Bb5:2 G5:4 Eb5:4', 'Ab5:6 G5:2 Eb5:4 C5:4',
      'G5:2 Bb5:2 Eb6:4 D6:4 Bb5:4', 'F5:4 D5:4 Bb4:8',
      'C6:4 G5:2 Eb5:2 C5:4 G5:4', 'Ab5:2 G5:2 F5:4 C5:4 F5:4',
      'Eb5:2 Ab5:2 C6:4 Bb5:2 Ab5:2 Eb5:4', 'D5:4 G5:4 B5:4 -:4'
    ] }],
    parts: [
      { inst: 'bell', octave: 4, vel: 0.58, pattern: '0...2.1...3.2...' },
      { inst: 'bass', octave: 2, vel: 0.65, pattern: 'R-------F-------' },
      { inst: 'pad', octave: 3, vel: 0.9, pattern: 'C---------------' }
    ],
    drums: { kick: 'o.......o.......', shaker: '..o...o...o...o.' }
  },

  // Hypeforge — urgent late-run theme built around a rising three-note call.
  volcano: {
    bpm: 138,
    chords: ['Fm', 'Db', 'Eb', 'C', 'Fm', 'Db', 'Eb', 'C'],
    melody: [{ inst: 'lead', vel: 0.86, bars: [
      'F5:2 Ab5:2 C6:4 F6:2 Eb6:2 C6:4', 'Db6:2 C6:2 Ab5:4 F5:2 Ab5:2 Db6:4',
      'G5:2 Bb5:2 Eb6:4 G6:2 F6:2 Eb6:4', 'E5:4 G5:4 C6:4 Bb5:2 G5:2',
      'Ab5:2 C6:2 F6:4 Eb6:2 C6:2 Ab5:4', 'F6:2 Eb6:2 Db6:4 Ab5:4 F5:4',
      'G5:2 Bb5:2 Eb6:2 G6:2 F6:4 Eb6:4', 'C6:4 G5:4 E5:4 C5:4'
    ] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.R.R.F.O.R.F.O.' },
      { inst: 'pluck', octave: 3, vel: 0.62, pattern: '0.0.2.0.1.0.3.0.' },
      { inst: 'pad', octave: 3, vel: 0.42, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X..x..X.X..x..X.', snare: '....X.......X..x', hat: 'xoxoxoxoxoxoxoxo' }
  },

  // Raid Signal — the channel call sharpened into a boss battle fanfare.
  boss: {
    bpm: 154,
    chords: ['Dm', 'Bb', 'C', 'A', 'Dm', 'F', 'Gm', 'A'],
    melody: [{ inst: 'lead', vel: 0.95, bars: [
      'D5:2 D5:2 F5:2 A5:2 D6:4 C6:2 A5:2', 'F5:2 F5:2 A5:2 C6:2 F6:4 D6:2 C6:2',
      'G5:2 C6:2 E6:2 G6:2 E6:4 C6:4', 'C#6:2 E6:2 A6:4 G6:2 E6:2 C#6:4',
      'A5:2 G5:2 F5:2 E5:2 D5:4 A5:4', 'C6:2 A5:2 F5:4 A5:2 C6:2 F6:4',
      'D6:2 Bb5:2 G5:4 Bb5:2 D6:2 G6:4', 'E6:4 C#6:4 A5:4 E5:4'
    ] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RR.F.R.O.RR.FO' },
      { inst: 'pluck', octave: 4, vel: 0.52, pattern: '0.1.2.1.3.2.1.2.' }
    ],
    drums: { kick: 'X.x.X.x.X.x.X.xx', snare: '....X.......X.X.', hat: 'oooooooooooooooo' }
  },

  // Break the Seal — frantic optional-rift variation.
  rift: {
    bpm: 168,
    chords: ['Bm', 'G', 'A', 'F#', 'Bm', 'D', 'Em', 'F#'],
    melody: [{ inst: 'lead', vel: 1, bars: [
      'B5:2 D6:2 F#6:4 E6:2 D6:2 B5:4', 'G5:2 B5:2 D6:4 G6:4 F#6:4',
      'A5:2 C#6:2 E6:4 D6:2 C#6:2 A5:4', 'A#5:2 C#6:2 F#6:4 E6:4 C#6:4',
      'B5:2 B5:2 D6:2 F#6:2 B6:4 A6:2 F#6:2', 'F#6:2 E6:2 D6:4 A5:4 D6:4',
      'G6:2 F#6:2 E6:4 B5:2 G5:2 E5:4', 'F#5:4 A#5:4 C#6:4 F#6:4'
    ] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RRR.RRF.FFO.OF' },
      { inst: 'pluck', octave: 4, vel: 0.58, pattern: '0.2.3.2.1.2.3.4.' },
      { inst: 'pad', octave: 3, vel: 0.42, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X.x.X.x.X.x.X.xx', snare: '....X.......X..X', hat: 'xoxoxoxoxoxoxoxo' }
  },

  // Last Broadcast — final escalation, dark but still recognisable.
  judgment: {
    bpm: 144,
    chords: ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Db', 'Bb', 'G'],
    melody: [{ inst: 'lead', vel: 0.92, bars: [
      'C5:2 G5:2 C6:4 Bb5:2 G5:2 Eb5:4', 'Ab5:2 C6:2 Eb6:4 C6:4 Ab5:4',
      'F5:2 Ab5:2 C6:4 F6:4 Eb6:4', 'D6:2 B5:2 G5:4 B5:2 D6:2 G6:4',
      'Eb6:2 D6:2 C6:4 G5:2 Eb5:2 C5:4', 'Db6:2 Ab5:2 F5:4 Ab5:2 Db6:2 F6:4',
      'D6:2 C6:2 Bb5:4 F5:2 D5:2 Bb4:4', 'B4:4 D5:4 G5:4 -:4'
    ] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RRR.RRR.RRF.OF' },
      { inst: 'bell', octave: 4, vel: 0.62, pattern: '0.......2.......' },
      { inst: 'pad', octave: 3, vel: 0.8, pattern: 'C---------------' }
    ],
    drums: { kick: 'X..xX..xX..xX.xx', snare: '....X.......X..X', hat: 'x.x.x.x.x.x.x.x.' }
  }
};

/** Theme selected for each reachable run biome. */
G.BIOME_MUSIC = ['forest', 'cave', 'volcano'];
