import type { MissionCommand, MissionRun } from './engine';
export interface MissionStorageAdapter {
  load(): Promise<{ run?: MissionRun; contentChanged: boolean; expectedRunId?: string }>;
  start(id: string, at: number, expectedRunId?: string): Promise<MissionRun>;
  apply(command: MissionCommand): Promise<MissionRun>;
  warmup?(runId: string): Promise<MissionRun>;
}
