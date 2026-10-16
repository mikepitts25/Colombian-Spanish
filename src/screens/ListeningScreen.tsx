import React from 'react';
import MissionScreen from './MissionScreen';
import { LISTENING_BASICS } from '../missions/listeningBasics';
export default function ListeningScreen() {
  return <MissionScreen key={LISTENING_BASICS.id} pack={LISTENING_BASICS} />;
}
