import React, { Component } from 'react';
import './App.css';
import classnames from 'classnames';
import Piano from './Piano';

let player = null;
let audioContext = null;
if (window !== undefined) {
  const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContextFunc();
  player = new window.WebAudioFontPlayer();
  player.loader.decodeAfterLoading(audioContext, '_tone_0010_Chaos_sf2_file');
}

function playKey(pitch) {
  player.queueWaveTable(audioContext, audioContext.destination, window._tone_0010_Chaos_sf2_file, 0, pitch + 12, 0.75);
}

const OCTAVE = 12;
const NONE = -1;
const A = 9;
const As = 10;
const B = 11;
const C = 0;
const Cs = 1;
const D = 2;
const Ds = 3;
const E = 4;
const F = 5;
const Fs = 6;
const G = 7;
const Gs = 8;

const BUTTONS = [0, 1, 2, 3, 4, 5, 6];
const MODES = {
  manual: 1,
  harmonic: 2,
  dynamic: 3,
}

const MAJ = 0;
const MIN = 1;
const DIM = 2;

const CHORD_NAMES = ['maj', 'min', 'dim7', '5', 'sus2', 'sus4', 'maj7', 'm7', 'add9', ];
const CHORDS = [[4, 7], [3, 7], [3, 6, 9], [7], [2, 7], [5, 7], [4, 7, 11], [3, 7, 10], [4, 7, 10], [4, 7, 14]];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const HARMONY_NAMES = ['Major', 'N. Minor', 'Locrian'];
const HARMONY_CHORDS = [
  [MAJ, MIN, MIN, MAJ, MAJ, MIN, DIM],
  [MIN, DIM, MAJ, MIN, MIN, MAJ, MAJ],
  [DIM, MAJ, MIN, MIN, MAJ, MAJ, MIN]
];
const HARMONY_NOTES = [
  [2, 2, 1, 2, 2, 2],
  [2, 1, 2, 2, 1, 2],
  [1, 2, 2, 1, 2, 2]
];

function getPlayedNotes(pressedBasses, pressedChords, notes, chords) {
  const played = Array.from(Array(127));
  pressedBasses.forEach((pressed, i) => {
    if (pressed) {
      const tonic = notes[i];
      played[tonic + 12] = 1;
    }
  });

  pressedChords.forEach((pressed, i) => {
    if (pressed) {
      const tonic = notes[i];
      played[tonic + 24] = 1;
      CHORDS[chords[i]].forEach((step) => {
        played[tonic + step + 24] = 1;
      });
    }
  });

  return played;
}

function normalizeNote(note) {
  if (note >= 12) { return normalizeNote(note - 12); }
  else if (note < 0) { return normalizeNote(Math.abs(note)); }

  return note;
}

function scaleFromHarmony(harmony, tonic) {
  return HARMONY_NOTES[harmony].reduce((notes, semitone) => {
    const note = normalizeNote(notes[notes.length - 1] + semitone);
    return [...notes, note];
  }, [tonic]);
}

function harmonyFromChord(chord) {
  if (chord === MAJ) {
    return 0;
  }
  if (chord === MIN) {
    return 1;
  }
  if (chord === DIM) {
    return 2;
  }
}

let mode = MODES.manual;
let harmony = 0;
let notes = [A, F, C, E, 0, 0, 0];
let chords = [1, 0, 0, 0, 0, 0, 0];

function playChord(i) {
  const tonic = notes[i];
  CHORDS[chords[i]].forEach((step) => {
    playKey(tonic + step + 36);
  });
}

const BASS_KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u'];
const CHORD_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j'];

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pressedBasses: [false, false, false, false, false, false, false],
      pressedChords: [false, false, false, false, false, false, false],
    };
  }

  handleUpTonic(i) {
    if (mode == MODES.manual) {
      const newNote = notes[i] + 1;
      notes[i] = (newNote > 11) ? 0 : newNote;
    }
    if (mode == MODES.harmonic && i === 0) {
      const newNote = notes[0] + 1;
      const normalizedNote = (newNote > 11) ? 0 : newNote;
      notes = scaleFromHarmony(harmony, normalizedNote);
      chords = HARMONY_CHORDS[harmony].slice();
    }
    this.forceUpdate();
  }

  handleDownTonic(i) {
    if (mode == MODES.manual) {
      const newNote = notes[i] - 1;
      notes[i] = (newNote < 0) ? 11 : newNote;
    }
    if (mode == MODES.harmonic && i === 0) {
      const newNote = notes[0] - 1;
      const normalizedNote = (newNote < 0) ? 11 : newNote;
      notes = scaleFromHarmony(harmony, normalizedNote);
      chords = HARMONY_CHORDS[harmony].slice();
    }
    this.forceUpdate();
  }

  handleChangeHarmony(i) {
    if (mode == MODES.manual) {
      const newMode = chords[i] + 1;
      chords[i] = (newMode > CHORD_NAMES.length - 1) ? 0 : newMode;
    }
    if (mode == MODES.harmonic) {
      const newMode = harmony + 1;
      harmony = (newMode > HARMONY_NAMES.length - 1) ? 0 : newMode;
      notes = scaleFromHarmony(harmony, notes[0]);
      chords = HARMONY_CHORDS[harmony].slice();
    }
    if (mode == MODES.dynamic) {
      harmony = harmonyFromChord(chords[i]);
      notes = scaleFromHarmony(harmony, notes[i]);
      chords = HARMONY_CHORDS[harmony].slice();
    }
    this.forceUpdate();
  }

  handlePlayChord(index) {
    this.setState({
      pressedChords: this.state.pressedChords.map((c, i) => ((i === index) ? !c : c))
    });
  }

  handlePlayBass(index) {
    this.setState({
      pressedBasses: this.state.pressedBasses.map((c, i) => ((i === index) ? !c : c))
    });
  }

  renderNote(note) {
    return NOTE_NAMES[note];
  }

  renderChord(chord) {
    return CHORD_NAMES[chord];
  }

  renderHarmony() {
    return HARMONY_NAMES[harmony];
  }

  handleSelectMode(newMode) {
    mode = newMode;
    if (newMode === MODES.harmonic || newMode === MODES.dynamic) {
      notes = scaleFromHarmony(harmony, notes[0]);
      chords = HARMONY_CHORDS[harmony].slice();
    }
    this.forceUpdate();
  }

  handleKeyPress(e) {
    switch(e.key) {
      case 'q':
        playKey(notes[0] + 24);
        break;
      case 'w':
        playKey(notes[1] + 24);
        break;
      case 'e':
        playKey(notes[2] + 24);
        break;
      case 'r':
        playKey(notes[3] + 24);
        break;
      case 't':
        playKey(notes[4] + 24);
        break;
      case 'y':
        playKey(notes[5] + 24);
        break;
      case 'u':
        playKey(notes[6] + 24);
        break;
      case 'a':
        playChord(0);
        break;
      case 's':
        playChord(1);
        break;
      case 'd':
        playChord(2);
        break;
      case 'f':
        playChord(3);
        break;
      case 'g':
        playChord(4);
        break;
      case 'h':
        playChord(5);
        break;
      case 'j':
        playChord(6);
        break;
    }
  }

  renderColumn(note, i) {
    const chord = chords[i];
    const chordClass = classnames({
      'play-chord': true,
      'pressed': this.state.pressedChords[i]
    });
    const bassClass = classnames({
      'play-bass': true,
      'pressed': this.state.pressedBasses[i]
    });

    return <div key={i}>
      <div className="chord-buttons">
        <button onClick={this.handleUpTonic.bind(this, i)}>+</button>
        <button onClick={this.handleDownTonic.bind(this, i)}>-</button>
      </div>
      <div className="mode-button">
        <button onClick={this.handleChangeHarmony.bind(this, i)}>mode</button>
      </div>
      <div className="screen">
        <div>
          {this.renderNote(note)}
          <br />
          {this.renderChord(chord)}
          <br />
          {(i === 0 && (mode === MODES.harmonic || mode === MODES.dynamic)) ? this.renderHarmony() : null}
        </div>
      </div>
      <div className="play-buttons">
        <div className={bassClass} onClick={this.handlePlayBass.bind(this, i)}>
          {BASS_KEYS[i]}
        </div>
        <div className={chordClass} onClick={this.handlePlayChord.bind(this, i)}>
          {CHORD_KEYS[i]}
        </div>
      </div>
    </div>;
  }

  render() {
    return <div onKeyPress={this.handleKeyPress.bind(this)} tabindex={0}>
      <div className="box">
        {notes.map(this.renderColumn.bind(this))}
        <div className="mode-switch">
          <label><input type="radio" name="mode" checked={mode === MODES.manual} onChange={this.handleSelectMode.bind(this, MODES.manual)} /> Ручной</label>
          <label><input type="radio" name="mode" checked={mode === MODES.harmonic}  onChange={this.handleSelectMode.bind(this, MODES.harmonic)} /> Гармонический</label>
          <label><input type="radio" name="mode" checked={mode === MODES.dynamic}  onChange={this.handleSelectMode.bind(this, MODES.dynamic)} /> Динаамический</label>
        </div>
      </div>
      <Piano notes={getPlayedNotes(this.state.pressedBasses, this.state.pressedChords, notes, chords)} />
      чтобы играть клавиатурой нужно ткнуть мышкой сюда и быть в английской раскладке
    </div>;
  }
}

export default App;
