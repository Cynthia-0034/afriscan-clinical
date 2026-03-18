import { CaseData } from "./types";

export const demoCases: CaseData[] = [
  {
    id: "Tuberculosis-demo-case",
    patientId: "PT-4821",
    uploadDate: "2026-03-07T09:32:00Z",
    status: "Completed",
    classification: "Critical",
    riskLevel: "HIGH",
    confidence: 91,
    imageUrl: "/demo-tb.jpeg",
    analysis: {
      classification: "Critical",
      confidence: 91,
      riskLevel: "HIGH",
      triageNote:
        "Significant bilateral upper lobe opacities consistent with active pulmonary tuberculosis. Cavitary lesion identified in the right upper lobe.",
      explanation:
        "AI analysis detected multiple high-confidence abnormalities including upper lobe consolidation, cavitary changes, and hilar lymphadenopathy — findings highly suggestive of active TB.",
      suggestedTests: [
        "GeneXpert MTB/RIF (Urgent)",
        "AFB Smear Microscopy",
        "Sputum Culture",
        "HIV Test",
      ],
      nextSteps: [
        "Initiate airborne infection isolation precautions",
        "Collect sputum samples for urgent GeneXpert",
        "Notify infection control team",
        "Begin empiric TB treatment if clinical suspicion is high",
      ],
      roiBox: { x: 15, y: 10, width: 35, height: 30 },
    },
    report: {
      findings:
        "Bilateral upper lobe opacities with cavitary changes in the right upper lobe. Hilar lymphadenopathy noted. No pleural effusion identified.",
      impression:
        "Imaging findings highly suggestive of active pulmonary tuberculosis with cavitary disease. Clinical correlation urgently recommended.",
      recommendation:
        "Urgent GeneXpert MTB/RIF testing. Initiate infection control measures. Consider empiric anti-TB therapy pending confirmation. HIV testing recommended.",
      generatedAt: "2026-03-07T09:35:00Z",
    },
    comments: [
      {
        id: "c1",
        doctorName: "Dr. Amara Okafor",
        text: "Findings consistent with active TB. Patient has history of TB contact. Recommending immediate isolation and GeneXpert.",
        timestamp: "2026-03-07T10:15:00Z",
      },
      {
        id: "c2",
        doctorName: "Dr. Samuel Mensah",
        text: "Second opinion: Agree with assessment. Cavitary lesion in RUL is concerning. Suggest adding sputum culture and DST given MDR-TB prevalence in region.",
        timestamp: "2026-03-07T11:42:00Z",
        isSecondOpinion: true,
      },
    ],
    symptoms: {
      coughOver2Weeks: true,
      fever: true,
      nightSweats: true,
      weightLoss: true,
      chestPain: false,
      fatigue: true,
      coughingBlood: true,
      knownTBContact: true,
      hivRisk: false,
      diabetes: false,
    },
  },
  {
    id: "Pneumonia-demo-case",
    patientId: "PT-7293",
    uploadDate: "2026-03-06T14:18:00Z",
    status: "Pending Review",
    classification: "Suspicious",
    riskLevel: "MODERATE",
    confidence: 78,
    imageUrl: "/demo-pneumonia.jpg",
    analysis: {
      classification: "Suspicious",
      confidence: 78,
      riskLevel: "MODERATE",
      triageNote:
        "Abnormal opacity pattern detected in the right lower lobe. Pattern is non-specific and may represent pneumonia, early TB, or another infectious process.",
      explanation:
        "AI analysis identified a focal consolidation in the right lower lobe with air bronchograms. The pattern is more consistent with bacterial pneumonia but TB cannot be excluded.",
      suggestedTests: [
        "Sputum Culture",
        "GeneXpert MTB/RIF",
        "Complete Blood Count",
        "C-Reactive Protein",
      ],
      nextSteps: [
        "Review patient symptoms and exposure history",
        "Consider broad-spectrum antibiotics if bacterial pneumonia is suspected",
        "Obtain sputum for TB workup if risk factors are present",
        "Follow-up imaging in 4–6 weeks if treated for pneumonia",
      ],
      roiBox: { x: 55, y: 40, width: 25, height: 25 },
    },
    report: {
      findings:
        "Focal opacity in the right lower lobe with air bronchograms. No cavitary changes. No hilar lymphadenopathy. No pleural effusion.",
      impression:
        "Suspicious for infectious process, most likely bacterial pneumonia. TB remains in the differential depending on clinical context and symptoms.",
      recommendation:
        "Correlate clinically with symptoms and exposure history. Consider GeneXpert if TB risk factors are present. Follow-up imaging recommended.",
      generatedAt: "2026-03-06T14:22:00Z",
    },
    comments: [
      {
        id: "c3",
        doctorName: "Dr. Fatima Diallo",
        text: "Lower lobe consolidation — leaning toward community-acquired pneumonia. Will start empiric antibiotics and reassess in 48 hours.",
        timestamp: "2026-03-06T15:30:00Z",
      },
    ],
    symptoms: {
      coughOver2Weeks: false,
      fever: true,
      nightSweats: false,
      weightLoss: false,
      chestPain: true,
      fatigue: true,
      coughingBlood: false,
      knownTBContact: false,
      hivRisk: false,
      diabetes: true,
    },
  },
  {
    id: "Normal-demo-case",
    patientId: "PT-1056",
    uploadDate: "2026-03-05T08:45:00Z",
    status: "Completed",
    classification: "Normal",
    riskLevel: "LOW",
    confidence: 95,
    imageUrl: "/demo-normal.jpeg",
    analysis: {
      classification: "Normal",
      confidence: 95,
      riskLevel: "LOW",
      triageNote:
        "No significant abnormalities detected. Lung fields are clear. Heart size and mediastinal contours are within normal limits.",
      explanation:
        "AI analysis found no evidence of consolidation, cavitation, effusion, or lymphadenopathy. Findings are consistent with a normal chest radiograph.",
      suggestedTests: [
        "No urgent tests required",
        "Routine follow-up as clinically indicated",
      ],
      nextSteps: [
        "No immediate imaging follow-up required",
        "Continue routine screening if patient is in a high-risk population",
        "Address any remaining symptoms clinically",
      ],
    },
    report: {
      findings:
        "Clear lung fields bilaterally. Normal cardiac silhouette. Normal mediastinal contours. No pleural effusion. No bony abnormalities.",
      impression:
        "Normal chest radiograph. No evidence of active pulmonary disease.",
      recommendation:
        "No further imaging workup required at this time. Routine follow-up as clinically indicated.",
      generatedAt: "2026-03-05T08:48:00Z",
    },
    comments: [],
    symptoms: {
      coughOver2Weeks: false,
      fever: false,
      nightSweats: false,
      weightLoss: false,
      chestPain: false,
      fatigue: false,
      coughingBlood: false,
      knownTBContact: false,
      hivRisk: false,
      diabetes: false,
    },
  },
];
