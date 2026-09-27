export type BaselOperationCode =
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8'
  | 'D9' | 'D10' | 'D11' | 'D12' | 'D13' | 'D14' | 'D15'
  | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8'
  | 'R9' | 'R10' | 'R11' | 'R12' | 'R13';

export type DeclaredOperationCategory =
  | 'material_recovery' | 'energy_recovery' | 'land_treatment_recovery'
  | 'land_disposal' | 'incineration' | 'other_disposal'
  | 'pre_disposal_treatment' | 'intermediate'
  | 'multiple_operations' | 'unspecified';

export type DeclaredOperationStage =
  | 'non_intermediate' | 'intermediate' | 'pre_treatment'
  | 'unallocated_multiple' | 'unresolved';

export interface DeclaredOperationEvidence {
  operation_codes: BaselOperationCode[];
  unknown_operation_tokens: string[];
  operation_category: DeclaredOperationCategory;
  operation_stage: DeclaredOperationStage;
  operation_sequence_known: false;
  treatment_completion_verified: false;
  classification_source_id: 'basel-annex-iv-legacy';
}

export interface BaselOperationDefinition {
  code: BaselOperationCode;
  label: string;
  category: DeclaredOperationCategory;
  stage: 'non_intermediate' | 'intermediate' | 'pre_treatment';
  annex_section: 'A' | 'B';
  source_id: 'basel-annex-iv-legacy';
}

export interface BaselDestinationEvidence {
  origin: string;
  destination: string;
  year: number;
  operation_category: DeclaredOperationCategory;
  tonnes: number;
  exact_tonnes: string;
  record_ids: string[];
  operation_codes_present: BaselOperationCode[];
  source_id: 'basel-national-reporting';
  classification_source_id: 'basel-annex-iv-legacy';
  unit: 'metric tonnes';
  treatment_completion_verified: false;
}
