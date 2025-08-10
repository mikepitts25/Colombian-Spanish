// src/data/decks/index.ts
import { Deck } from '../../types';

// Always present
import { ColombianBasicDeck } from './colombian_basic';

// Add the decks you actually have in src/data/decks/
// (These must be real files, or Metro will fail at build time.)
import { ActionsDeck } from './actions';
import { GreetingsDeck } from './greetings';
import { FamilyDeck } from './family';
import { FoodDeck } from './food';
import { Daily_lifeDeck } from './daily_life';
import { RoutinesDeck } from './routines';
import { TransportDeck } from './transport';
import { WeatherDeck } from './weather';
import { TechnologyDeck } from './technology';
import { CommunicationDeck } from './communication';
import { HouseDeck } from './house';
import { HealthDeck } from './health';
import { EmotionsDeck } from './emotions';
import { BodyDeck } from './body';
import { ProfessionsDeck } from './professions';
import { SchoolDeck } from './school';
import { ShoppingDeck } from './shopping';
import { SlangDeck } from './slang';
import { SportsDeck } from './sports';
import { TravelDeck } from './travel';
import { ClothingDeck } from './clothing';
import { ColorsDeck } from './colors';
import { Dates_timeDeck } from './dates_time';
import { HolidaysDeck } from './holidays';
import { NatureDeck } from './nature';
import { NumbersDeck } from './numbers';
import { PlacesDeck } from './places';


export { ColombianBasicDeck };
export { ActionsDeck }; // export others as you enable them

export const ALL_DECKS: Deck[] = [
  ColombianBasicDeck,
  ActionsDeck,
  GreetingsDeck,
  FamilyDeck,
  FoodDeck,
  Daily_lifeDeck,
  RoutinesDeck,
  TransportDeck,
  WeatherDeck,
  TechnologyDeck,
  CommunicationDeck,
  HouseDeck,
  HealthDeck,
  EmotionsDeck,
  BodyDeck,
  ClothingDeck,
  ColorsDeck,
  Dates_timeDeck,
  HolidaysDeck,
  NatureDeck,
  NumbersDeck,
  PlacesDeck,
  SportsDeck,
  ProfessionsDeck,
  SchoolDeck,
  ShoppingDeck,
  SlangDeck,
  TravelDeck,
];