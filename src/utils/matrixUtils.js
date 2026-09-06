/**
 * Utility functions for GitHub Contribution Matrix calculation and pixel patterns
 */

// 5x7 Pixel Font Map for letters A-Z, numbers 0-9, and symbols
export const PIXEL_FONT = {
  'A': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,0,0,0,0]
  ],
  'B': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [0,0,0,0,0]
  ],
  'C': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,1,1,1],
    [0,0,0,0,0]
  ],
  'D': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [0,0,0,0,0]
  ],
  'E': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
    [0,0,0,0,0]
  ],
  'F': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,0,0,0,0]
  ],
  'G': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [1,0,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,0]
  ],
  'H': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,0,0,0,0]
  ],
  'I': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1],
    [0,0,0,0,0]
  ],
  'L': [
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
    [0,0,0,0,0]
  ],
  'O': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [0,0,0,0,0]
  ],
  'P': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,0,0,0,0]
  ],
  'R': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
    [0,0,0,0,0]
  ],
  'S': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
    [0,0,0,0,0]
  ],
  'T': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  'U': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [0,0,0,0,0]
  ],
  'V': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  'W': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1],
    [0,0,0,0,0]
  ],
  'Y': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  ' ': [
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ]
};

// Return dates mapping for 53 weeks (Sunday-Saturday)
export function createEmptyMatrix() {
  const matrix = [];
  const today = new Date();
  
  // Find last Saturday (end of current week on GitHub)
  const currentDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

  // Go back 52 full weeks (53 weeks total including current week)
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (53 * 7 - 1));

  let tempDate = new Date(startDate);

  for (let week = 0; week < 53; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const isFuture = tempDate > today;
      
      weekDays.push({
        weekIndex: week,
        dayIndex: day,
        dateString: dateStr,
        level: 0,
        isFuture
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    matrix.push(weekDays);
  }

  return matrix;
}

// Generate Header Month Labels for Matrix
export function getMonthLabels(matrix) {
  const months = [];
  let lastMonth = -1;

  matrix.forEach((week, weekIndex) => {
    const sundayCell = week[0];
    if (!sundayCell) return;
    const date = new Date(sundayCell.dateString);
    const month = date.getMonth();

    if (month !== lastMonth) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.push({
        name: monthNames[month],
        weekIndex
      });
      lastMonth = month;
    }
  });

  return months;
}

// Map Level (0-4) to recommended commit counts
export function levelToCommits(level) {
  switch (level) {
    case 1: return 2;
    case 2: return 5;
    case 3: return 8;
    case 4: return 12;
    default: return 0;
  }
}

// Convert non-zero matrix cells into commit list
export function extractCommitsFromMatrix(matrix) {
  const commits = [];
  matrix.forEach(week => {
    week.forEach(cell => {
      if (cell.level > 0 && !cell.isFuture) {
        commits.push({
          date: cell.dateString,
          level: cell.level,
          count: levelToCommits(cell.level)
        });
      }
    });
  });
  return commits;
}

// Batch apply level to specific date range and filters
export function applyDateRangeFilter(matrix, { startDate, endDate, daysOfWeek = [], targetLevel = 4, mode = 'set' }) {
  const newMatrix = JSON.parse(JSON.stringify(matrix));
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  newMatrix.forEach(week => {
    week.forEach(cell => {
      if (cell.isFuture) return;
      const cellDate = new Date(cell.dateString);
      
      const isAfterStart = !start || cellDate >= start;
      const isBeforeEnd = !end || cellDate <= end;
      
      const dayNum = cellDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const matchesDay = daysOfWeek.length === 0 || daysOfWeek.includes(dayNum);

      if (isAfterStart && isBeforeEnd && matchesDay) {
        if (mode === 'clear') {
          cell.level = 0;
        } else if (mode === 'random') {
          cell.level = Math.floor(Math.random() * 4) + 1;
        } else {
          cell.level = targetLevel;
        }
      }
    });
  });

  return newMatrix;
}

// Preset Generator: Spell Text on Canvas
export function renderTextOnMatrix(matrix, text, targetLevel = 4) {
  const newMatrix = JSON.parse(JSON.stringify(matrix));
  const upperText = text.toUpperCase();
  
  // Clear existing levels
  newMatrix.forEach(week => week.forEach(cell => cell.level = 0));

  let startWeek = 2; // offset from left

  for (let char of upperText) {
    const glyph = PIXEL_FONT[char] || PIXEL_FONT[' '];
    const width = glyph[0].length;

    if (startWeek + width >= 52) break; // stay inside matrix boundaries

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < width; c++) {
        if (glyph[r][c] === 1) {
          const targetWeek = startWeek + c;
          if (newMatrix[targetWeek] && newMatrix[targetWeek][r]) {
            newMatrix[targetWeek][r].level = targetLevel;
          }
        }
      }
    }
    startWeek += width + 1; // 1 column spacing between letters
  }

  return newMatrix;
}

// Preset Generator: Preset Patterns
export function applyPresetPattern(matrix, presetType, level = 4) {
  const newMatrix = JSON.parse(JSON.stringify(matrix));
  newMatrix.forEach(week => week.forEach(cell => cell.level = 0));

  if (presetType === 'heart') {
    const heartGrid = [
      [0,1,1,0,1,1,0],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
      [0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0]
    ];
    for (let w = 4; w < 50; w += 10) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (heartGrid[c][r] === 1 && newMatrix[w + c] && newMatrix[w + c][r]) {
            newMatrix[w + c][r].level = level;
          }
        }
      }
    }
  } else if (presetType === 'invader') {
    const invader = [
      [0,0,1,0,0,0,0],
      [0,0,0,1,0,0,0],
      [0,0,1,1,1,1,0],
      [0,1,1,0,1,1,1],
      [1,1,1,1,1,1,1],
      [1,0,1,1,1,0,1],
      [1,0,1,0,1,0,1]
    ];
    for (let w = 5; w < 48; w += 12) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (invader[c][r] === 1 && newMatrix[w + c] && newMatrix[w + c][r]) {
            newMatrix[w + c][r].level = level;
          }
        }
      }
    }
  } else if (presetType === 'full-backfill') {
    newMatrix.forEach(week => {
      week.forEach(cell => {
        if (!cell.isFuture) {
          if (Math.random() > 0.2) {
            cell.level = Math.floor(Math.random() * 4) + 1;
          }
        }
      });
    });
  } else if (presetType === 'streak-master') {
    newMatrix.forEach(week => {
      week.forEach(cell => {
        if (!cell.isFuture) {
          cell.level = Math.random() > 0.3 ? 4 : 3;
        }
      });
    });
  }

  return newMatrix;
}
