import { ProductionExercise, validateProductionExercise } from '../exercises/production';
export interface LocalizedText {
  en: string;
  es: string;
}
interface BaseNode {
  id: string;
  title: LocalizedText;
  hints: LocalizedText[];
  mediaId?: string;
}
export interface SceneNode extends BaseNode {
  kind: 'scene';
  text: LocalizedText;
  next: string;
}
export interface ChoiceNode extends BaseNode {
  kind: 'choice';
  prompt: LocalizedText;
  cardId: string;
  deckId: string;
  options: {
    id: string;
    text: LocalizedText;
    correct: boolean;
    next?: string;
    feedback: LocalizedText;
  }[];
}
export interface ListeningNode extends Omit<ChoiceNode, 'kind'> {
  kind: 'listening';
  transcript: string;
  mediaId: string;
}
export interface ProductionNode extends BaseNode {
  kind: 'production';
  prompt: LocalizedText;
  correction: LocalizedText;
  exercise: ProductionExercise;
  next: string;
}
export interface CompleteNode extends BaseNode {
  kind: 'complete';
  text: LocalizedText;
}
export type MissionNode = SceneNode | ChoiceNode | ListeningNode | ProductionNode | CompleteNode;
export interface MissionPack {
  schemaVersion: 1;
  id: string;
  contentVersion: number;
  title: LocalizedText;
  entry: string;
  prerequisites: string[];
  media: { id: string; cardId: string; provenance: 'generated' }[];
  nodes: MissionNode[];
}
export interface MissionRegistry {
  cards: Map<string, string>;
  transcripts?: Map<string, string>;
  mediaIds: Set<string>;
  missionIds: Set<string>;
}
export const record = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export const text = (v: unknown, max = 200): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max;
export const only = (v: Record<string, any>, keys: string[]) =>
  Object.keys(v).every((key) => keys.includes(key));
const localized = (v: unknown): v is LocalizedText =>
  record(v) &&
  Object.keys(v).length === 2 &&
  only(v, ['en', 'es']) &&
  text(v.en, 2000) &&
  text(v.es, 2000);
const array = (v: unknown, max: number): v is any[] =>
  Array.isArray(v) && v.length <= max && Array.from(v).every((item) => item !== undefined);
export function validateMission(value: unknown, registry?: MissionRegistry): MissionPack {
  const p = value as MissionPack;
  const fail = () => {
    throw new Error('Invalid mission definition or references');
  };
  if (
    !record(p) ||
    !only(p, [
      'schemaVersion',
      'id',
      'contentVersion',
      'title',
      'entry',
      'prerequisites',
      'media',
      'nodes',
    ]) ||
    p.schemaVersion !== 1 ||
    !text(p.id) ||
    !Number.isSafeInteger(p.contentVersion) ||
    p.contentVersion < 1 ||
    !localized(p.title) ||
    !text(p.entry) ||
    !array(p.nodes, 50) ||
    !p.nodes.length ||
    !array(p.media, 50) ||
    !array(p.prerequisites, 20) ||
    !p.prerequisites.every((id) => text(id) && id !== p.id) ||
    new Set(p.prerequisites).size !== p.prerequisites.length
  )
    fail();
  const media = new Set<string>();
  for (const item of p.media) {
    if (
      !record(item) ||
      !only(item, ['id', 'cardId', 'provenance']) ||
      !text(item.id) ||
      !text(item.cardId) ||
      item.provenance !== 'generated' ||
      media.has(item.id) ||
      (registry && (!registry.mediaIds.has(item.cardId) || !registry.cards.has(item.cardId)))
    )
      fail();
    media.add(item.id);
  }
  if (registry && p.prerequisites.some((id) => !registry.missionIds.has(id))) fail();
  const byId = new Map<string, MissionNode>(),
    exerciseIds = new Set<string>();
  for (const node of p.nodes) {
    if (
      !record(node) ||
      !text(node.id) ||
      byId.has(node.id) ||
      !localized(node.title) ||
      !array(node.hints, 5) ||
      !node.hints.every(localized) ||
      (node.mediaId !== undefined && (!text(node.mediaId) || !media.has(node.mediaId)))
    )
      fail();
    const base = ['id', 'title', 'hints', 'kind', 'mediaId'];
    if (node.kind === 'scene') {
      if (!only(node, [...base, 'text', 'next']) || !localized(node.text) || !text(node.next))
        fail();
    } else if (node.kind === 'complete') {
      if (!only(node, [...base, 'text']) || !localized(node.text) || node.hints.length) fail();
    } else if (node.kind === 'production') {
      if (
        !only(node, [...base, 'prompt', 'correction', 'exercise', 'next']) ||
        !localized(node.prompt) ||
        !localized(node.correction) ||
        !text(node.next)
      )
        fail();
      validateProductionExercise(node.exercise);
      if (node.hints.length !== node.exercise.hints.length || exerciseIds.has(node.exercise.id))
        fail();
      exerciseIds.add(node.exercise.id);
      if (registry && registry.cards.get(node.exercise.cardId) !== node.exercise.deckId) fail();
    } else if (node.kind === 'choice' || node.kind === 'listening') {
      if (
        !only(node, [
          ...base,
          'prompt',
          'cardId',
          'deckId',
          'options',
          ...(node.kind === 'listening' ? ['transcript'] : []),
        ]) ||
        !localized(node.prompt) ||
        !text(node.cardId) ||
        !text(node.deckId) ||
        !array(node.options, 6) ||
        node.options.length < 2
      )
        fail();
      if (
        node.kind === 'listening' &&
        (!text(node.transcript, 2000) ||
          !node.mediaId ||
          p.media.find((m) => m.id === node.mediaId)?.cardId !== node.cardId ||
          (registry && registry.transcripts?.get(node.cardId) !== node.transcript))
      )
        fail();
      const optionIds = new Set();
      let correct = 0;
      for (const option of node.options) {
        if (
          !record(option) ||
          !only(option, ['id', 'text', 'correct', 'next', 'feedback']) ||
          !text(option.id) ||
          optionIds.has(option.id) ||
          !localized(option.text) ||
          !localized(option.feedback) ||
          typeof option.correct !== 'boolean' ||
          (option.correct ? !text(option.next) : option.next !== undefined)
        )
          fail();
        optionIds.add(option.id);
        if (option.correct) correct++;
      }
      if (correct !== 1 || (registry && registry.cards.get(node.cardId) !== node.deckId)) fail();
    } else fail();
    byId.set(node.id, node);
  }
  const visiting = new Set<string>(),
    visited = new Set<string>();
  let completions = 0;
  function walk(id: string) {
    if (visiting.has(id)) fail();
    if (visited.has(id)) return;
    const node = byId.get(id);
    if (!node) fail();
    visiting.add(id);
    if (node!.kind === 'complete') completions++;
    else if (node!.kind === 'choice' || node!.kind === 'listening') {
      for (const option of node!.options) if (option.correct) walk(option.next!);
    } else walk(node!.next);
    visiting.delete(id);
    visited.add(id);
  }
  walk(p.entry);
  if (visited.size !== p.nodes.length || !completions) fail();
  return JSON.parse(JSON.stringify(p));
}
