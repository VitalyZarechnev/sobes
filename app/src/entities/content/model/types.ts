export interface ChecklistItem {
  readonly key: string;
  readonly text: string;
}

export interface Page {
  readonly id: string;
  readonly sectionId: string | null;
  readonly isSectionIndex: boolean;
  readonly title: string;
  readonly raw: string;
  readonly checklist: readonly ChecklistItem[];
}
