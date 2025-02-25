export interface Meta {
  id: string;
  uuid: string;
  sort: string;
  stems: string[];
  offensive: boolean;
}

export interface Pronunciation {
  mw: string;
  sound?: {
    audio?: string;
    ref?: string;
    stat?: string;
  };
}

export interface HeadwordInfo {
  headword: string;
  pronunciations?: Pronunciation[];
}

export interface VerbalIllustration {
  author: string;
  text: string;
}

export interface UsageNote {
  text: string;
  examples?: string[];
}

export interface RunIn {
  text: string;
  entries: string[];
}

export interface SupplementalNote {
  text: string;
  examples: string[];
}

export interface DefiningText {
  text: string[];
  verbal_illustrations: VerbalIllustration[];
  usage_notes: UsageNote[];
  run_in?: RunIn;
  supplemental_note?: SupplementalNote;
}

export interface DividedSense {
  defining_text: {
    text: string[];
    usage_notes: UsageNote[];
    verbal_illustrations?: VerbalIllustration[];
  };
  sense_divider?: string;
  grammatical_label: string;
  labels: string[];
  subject_status_labels: string[];
}

export interface Sense {
  defining_text?: DefiningText;
  grammatical_label: string;
  labels: string[];
  sense_number: string;
  subject_status_labels: string[];
  type: string;
  divided_sense?: DividedSense;
}

export interface DefinitionSection {
  sense_sequences: Array<Array<Sense>>;
}

export interface IdiomVariant {
  text: string;
  label: string;
}

export interface IdiomDefinition {
  text: string;
}

export interface Idiom {
  phrase: string;
  definitions: IdiomDefinition[];
  phrase_variants: IdiomVariant[];
  verbal_illustrations: VerbalIllustration[];
  subject_status_labels: string[];
}

export interface SearchResult {
  meta?: Meta;
  homograph_number?: number;
  headword_info: HeadwordInfo;
  alternate_headwords?: HeadwordInfo[];
  part_of_speech: string;
  grammatical_note?: string;
  labels?: string[];
  definition_sections: DefinitionSection[];
  idioms?: Idiom[];
  etymology?: string[];
  first_use_date?: string;
}

export const validateSearchResult = (result: unknown): result is SearchResult => {
  if (!result || typeof result !== "object") {
    return false;
  }

  const candidate = result as Record<string, unknown>;
  return (
    "headword_info" in candidate &&
    typeof candidate.headword_info === "object" &&
    candidate.headword_info !== null &&
    "headword" in (candidate.headword_info as object) &&
    "part_of_speech" in candidate &&
    "definition_sections" in candidate &&
    Array.isArray(candidate.definition_sections)
  );
}; 