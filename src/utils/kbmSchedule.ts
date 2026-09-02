export interface KbmPeriod {
  period: number;
  label: string;
  shortLabel: string;
  start: string;
  end: string;
  timeRange: string;
}

export const KBM_PERIODS: KbmPeriod[] = [
  { period: 1, label: 'Jam Ke-1 (07.00 - 07.45)', shortLabel: 'Jam Ke-1', start: '07:00', end: '07:45', timeRange: '07.00 - 07.45' },
  { period: 2, label: 'Jam Ke-2 (07.45 - 08.30)', shortLabel: 'Jam Ke-2', start: '07:45', end: '08:30', timeRange: '07.45 - 08.30' },
  { period: 3, label: 'Jam Ke-3 (08.30 - 09.15)', shortLabel: 'Jam Ke-3', start: '08:30', end: '09:15', timeRange: '08.30 - 09.15' },
  { period: 4, label: 'Jam Ke-4 (09.15 - 10.00)', shortLabel: 'Jam Ke-4', start: '09:15', end: '10:00', timeRange: '09.15 - 10.00' },
  { period: 5, label: 'Jam Ke-5 (10.20 - 11.05)', shortLabel: 'Jam Ke-5', start: '10:20', end: '11:05', timeRange: '10.20 - 11.05' },
  { period: 6, label: 'Jam Ke-6 (11.05 - 11.50)', shortLabel: 'Jam Ke-6', start: '11:05', end: '11:50', timeRange: '11.05 - 11.50' },
  { period: 7, label: 'Jam Ke-7 (12.30 - 13.15)', shortLabel: 'Jam Ke-7', start: '12:30', end: '13:15', timeRange: '12.30 - 13.15' },
  { period: 8, label: 'Jam Ke-8 (13.15 - 14.00)', shortLabel: 'Jam Ke-8', start: '13:15', end: '14:00', timeRange: '13.15 - 14.00' },
  { period: 9, label: 'Jam Ke-9 (14.00 - 14.45)', shortLabel: 'Jam Ke-9', start: '14:00', end: '14:45', timeRange: '14.00 - 14.45' },
];

export const KBM_COMBINED_PERIODS = [
  'Jam 1 - 2 (07.00 - 08.30)',
  'Jam 3 - 4 (08.30 - 10.00)',
  'Jam 5 - 6 (10.20 - 11.50)',
  'Jam 7 - 8 (12.30 - 14.00)',
  'Jam 8 - 9 (13.15 - 14.45)',
  'Jam 1 - 3 (07.00 - 09.15)',
  'Jam 4 - 5 (09.15 - 11.05)',
];

/**
 * Get current device time and automatically match it to the corresponding KBM period (Jam Ke-1 s/d Jam Ke-9)
 */
export const getAutoDeviceKbmTimeSlot = (dateObj: Date = new Date()) => {
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const currentTimeStr = `${pad(hours)}:${pad(minutes)}`;
  const totalMinutes = hours * 60 + minutes;

  // Minutes boundaries:
  // Jam 1: 07:00 (420) - 07:45 (465)
  // Jam 2: 07:45 (465) - 08:30 (510)
  // Jam 3: 08:30 (510) - 09:15 (555)
  // Jam 4: 09:15 (555) - 10:00 (600)
  // Istirahat 1: 10:00 (600) - 10:20 (620) -> Jam 5
  // Jam 5: 10:20 (620) - 11:05 (665)
  // Jam 6: 11:05 (665) - 11:50 (710)
  // Istirahat 2: 11:50 (710) - 12:30 (750) -> Jam 7
  // Jam 7: 12:30 (750) - 13:15 (795)
  // Jam 8: 13:15 (795) - 14:00 (840)
  // Jam 9: 14:00 (840) - 14:45 (885)

  let periodNumber = 1;
  let blockPair = 'Jam 1 - 2 (07.00 - 08.30)';

  if (totalMinutes < 465) {
    periodNumber = 1;
    blockPair = 'Jam 1 - 2 (07.00 - 08.30)';
  } else if (totalMinutes < 510) {
    periodNumber = 2;
    blockPair = 'Jam 1 - 2 (07.00 - 08.30)';
  } else if (totalMinutes < 555) {
    periodNumber = 3;
    blockPair = 'Jam 3 - 4 (08.30 - 10.00)';
  } else if (totalMinutes < 600) {
    periodNumber = 4;
    blockPair = 'Jam 3 - 4 (08.30 - 10.00)';
  } else if (totalMinutes < 665) {
    periodNumber = 5;
    blockPair = 'Jam 5 - 6 (10.20 - 11.50)';
  } else if (totalMinutes < 710) {
    periodNumber = 6;
    blockPair = 'Jam 5 - 6 (10.20 - 11.50)';
  } else if (totalMinutes < 795) {
    periodNumber = 7;
    blockPair = 'Jam 7 - 8 (12.30 - 14.00)';
  } else if (totalMinutes < 840) {
    periodNumber = 8;
    blockPair = 'Jam 8 - 9 (13.15 - 14.45)';
  } else {
    periodNumber = 9;
    blockPair = 'Jam 8 - 9 (13.15 - 14.45)';
  }

  const periodObj = KBM_PERIODS.find((p) => p.period === periodNumber) || KBM_PERIODS[0];

  return {
    periodNumber,
    currentTimeStr,
    periodObj,
    blockPair,
    // Formatted standard for journal timeSlot:
    standardSlot: `${periodObj.shortLabel} (${periodObj.timeRange})`,
    deviceDetailedSlot: `${periodObj.shortLabel} (${currentTimeStr} / ${periodObj.timeRange})`,
  };
};
