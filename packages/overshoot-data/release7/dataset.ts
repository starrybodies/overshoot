import {baseDataset} from './base';
import local from './local-evidence.json';
import type {JourneyDataset,JourneyEvidence} from './types';
export const journeyData:JourneyDataset={...baseDataset,sources:[...baseDataset.sources,...local.sources],evidence:local.evidence as JourneyEvidence[]};
