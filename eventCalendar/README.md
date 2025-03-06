# eventCalendar

# Calendar Matrix Logic Explanation

This document explains the matrix logic used to generate the calendar grid in the React calendar component located at `@/calendar-app/src/App.js`. The matrix is a 6x7 grid (6 weeks, 7 days per week) that displays dates from the current month, as well as dates from the previous and next months to ensure a complete grid.

## How the Matrix Works

### 1. **Matrix Structure**
- The matrix is a 2D array with 6 rows (representing weeks) and 7 columns (representing days of the week: Sunday to Saturday).
- Each cell contains an object: `{ day: number, isCurrentMonth: boolean }`.
  - `day`: The date number (e.g., 1, 2, 3, ...).
  - `isCurrentMonth`: A boolean indicating whether the date belongs to the current month (`true`) or an adjacent month (`false`).

### 2. **Filling the Matrix**
The matrix is populated in three stages:

#### a. **Previous Month's Days**
- If the first day of the current month doesn’t start on Sunday, the beginning of the first row is filled with the last days of the previous month.
- For example, if the month starts on a Wednesday (day 3 of the week), the first three cells (Sunday to Tuesday) will contain the last three days of the previous month.

#### b. **Current Month's Days**
- The days of the current month are placed in the matrix starting from the correct day of the week.
- The position of each day is calculated using:
  - `index = startDay + day - 1`: Computes the linear position in the matrix.
  - `row = Math.floor(index / 7)`: Determines the week (row).
  - `col = index % 7`: Determines the day of the week (column).

#### c. **Next Month's Days**
- After placing all current month days, any remaining cells are filled with the first days of the next month.
- This ensures the grid is always fully populated, even if the current month’s days don’t fill all 6 weeks.

### 3. **Shifting Numbers When Navigating Months**
When navigating to the previous or next month, the matrix is regenerated for the new month and year, causing the numbers to shift:

- **Previous Month**:
  - The current month’s days shift out of focus, and the previous month’s days become the new current month.
  - The matrix is recalculated with the updated month (e.g., `month - 1`) and year, filling the grid with the new current month’s dates and adjacent months’ dates.

- **Next Month**:
  - The current month’s days shift out, and the next month’s days become the new current month.
  - The matrix is recalculated with the updated month (e.g., `month + 1`) and year.

- **Animation**:
  - During navigation, a CSS animation (e.g., slide-left or slide-right) is applied to the grid for a smooth transition effect.
  - After the animation completes (typically 300ms), the component’s state updates, and the new matrix is rendered.

### Example
For **October 2023** (starts on Sunday, 31 days):
- **Matrix**:
[
[{day: 1, isCurrentMonth: true}, {day: 2, isCurrentMonth: true}, ..., {day: 7, isCurrentMonth: true}],
[{day: 8, isCurrentMonth: true}, {day: 9, isCurrentMonth: true}, ..., {day: 14, isCurrentMonth: true}],
[{day: 15, isCurrentMonth: true}, {day: 16, isCurrentMonth: true}, ..., {day: 21, isCurrentMonth: true}],
[{day: 22, isCurrentMonth: true}, {day: 23, isCurrentMonth: true}, ..., {day: 28, isCurrentMonth: true}],
[{day: 29, isCurrentMonth: true}, {day: 30, isCurrentMonth: true}, {day: 31, isCurrentMonth: true}, {day: 1, isCurrentMonth: false}, ..., {day: 4, isCurrentMonth: false}],
[{day: 5, isCurrentMonth: false}, {day: 6, isCurrentMonth: false}, ..., {day: 11, isCurrentMonth: false}]
]

- **Display**:
- Current month dates (1–31) are shown in full color.
- Next month dates (1–11) are grayed out using CSS.

When navigating to **November 2023**:
- The matrix shifts: November’s dates become the current month, and October’s dates move to the previous month section.

---

This matrix logic ensures the calendar grid is always complete, visually consistent, and provides a seamless experience when navigating between months.

