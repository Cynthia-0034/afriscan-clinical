import { CaseData } from "./types";

const STORAGE_KEY = "afri_scan_uploaded_cases";

export function getUploadedCases(): CaseData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CaseData[];
  } catch {
    return [];
  }
}

export function saveUploadedCases(cases: CaseData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function addUploadedCase(caseData: CaseData) {
  const existing = getUploadedCases();
  saveUploadedCases([caseData, ...existing]);
}

export function getCaseById(caseId: string): CaseData | undefined {
  return getUploadedCases().find((c) => c.id === caseId);
}
