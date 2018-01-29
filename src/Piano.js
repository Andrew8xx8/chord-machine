import React, { Component } from 'react';
import classnames from 'classnames';

const NOTES = Array.from(Array(127).keys());

function checkOctave(note) {
  return note === 1 || note == 3 || note == 6 || note == 8 || note == 10;
}

function noteIsBlack(note) {
  return checkOctave(note) || checkOctave(note - 12) || checkOctave(note - 24)
    || checkOctave(note - 36) || checkOctave(note - 48) || checkOctave(note - 60)
    || checkOctave(note - 72) || checkOctave(note - 84) || checkOctave(note - 96)
    || checkOctave(note - 108) || checkOctave(note - 120);
}

export default class Piano extends Component {
  render() {
    return <div className="piano">
      {NOTES.map((n) => {
        const classes = classnames({
          'piano-button': true,
          'piano-button-black': noteIsBlack(n),
          'piano-button-active': this.props.notes[n],
        });
        return <div className={classes} />;
      })}
    </div>;
  }
}
