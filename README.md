# Analyse calendar(s)

This script helps analyze and track meeting durations from `.ics` files. You can group your meetings by month or title, and track how much time you spent in meetings with specific people.

## Features
- Group meetings by month or meeting title.
- Track total time spent on meetings.
- Track time spent with specific individuals.
- Sort time spent with people from highest to lowest duration.

## Prerequisites

- **Node.js** installed on your machine. (If you don't have it, you can download it [here](https://nodejs.org/).)
- **pnpm** installed. You can install it globally via the following command:
  ```bash
  npm install -g pnpm
  ```

## Installation
### 1. Clone this repository or download the script
```bash
git clone git@github.com:ofrebourg/analyse-calendar.git
cd analyse-calendar
```

### 2. Install dependencies with pnpm
```bash
pnpm install
```
This will install the necessary dependencies, including `node-ical`, `moment`, `yargs`, and `chalk`.

## Usage
### Command-line Options
You can use the script to analyze your meeting data stored in .ics files. The script allows you to filter by date range, group events by month or title, and track time spent with specific people.

### Required Options:
- `-f` or `--files`: List of `.ics` files to parse.
- `-s` or `--startDate`: Start date in `YYYY-MM-DD` format.
- `-e` or `--endDate`: End date in `YYYY-MM-DD` format.
- `-g` or `--groupBy`: Group events by either month or title (use month for monthly grouping, title for meeting title grouping).

### Optional Options:
- `-p` or `--person`: Track time spent with one or more specific persons. You can specify multiple people as comma-separated names or emails (e.g. `John Doe,john.doe@example.com`). If the list of names is empty, everyone will be included.

### Example Commands:
#### 1. Group by month, filter by date range, and track time spent with specific people:
```bash
pnpm analyse -f "path_to_family_calendar.ics" "path_to_work_calendar.ics" -s "2024-01-01" -e "2024-12-31" -g month -p "John Doe,Jane Smith,john.doe@example.com"
```
This command will:
- Parse events from the provided `.ics` files.
- Filter events between 2024-01-01 and 2024-12-31.
- Group events by **month**.
- Track and display the time spent with **John Doe** and **Jane Smith**.

#### 2. Group by meeting title and track time with a specific person:
```bash
pnpm analyse -f "path_to_family_calendar.ics" -s "2024-01-01" -e "2024-12-31" -g title -p "John Doe"
```
This command will:
- Parse events from the `.ics` file.
- Filter events between 2024-01-01 and 2024-12-31.
- Group events by meeting **title**.
- Track and display the time spent with **John Doe**.

#### 3. Group by month and display total time spent:
```bash
pnpm analyse -f "path_to_family_calendar.ics" "path_to_work_calendar.ics" -s "2024-01-01" -e "2024-12-31" -g month
```
This command will:
- Parse events from the provided `.ics` files.
- Filter events between 2024-01-01 and 2024-12-31.
- Group events by **month**.
- Display the total time spent on events per month.

## Script Output
The script will output the following information based on the selected options:
1. Grouped Events: Events grouped either by month or title.
1. Total Duration: The total duration of meetings for each group (in hours and minutes).
1. Time with Specific Person: If you provided a person's name, the script will display the total time spent with that person, sorted in descending order.

### Example Output:
```plaintext
Events Grouped by Month:
January 2024:
  Total Duration: 50 hours 30 minutes
  Events:
    - Monthly Team Sync (PRIVATE) (2024-01-05 10:00:00 - 2024-01-05 12:00:00)
    - Project Planning (2024-01-12 14:00:00 - 2024-01-12 16:00:00)

February 2024:
  Total Duration: 35 hours
  Events:
    - Client Meeting (2024-02-14 09:00:00 - 2024-02-14 11:00:00)
    - Internal Training (2024-02-20 09:00:00 - 2024-02-20 17:00:00)

Time spent with 'John Doe' OR 'Jane Smith':
  John Doe: 20 hours 30 minutes
  Jane Smith: 18 hours 15 minutes
```

## Contributing
1. Fork the repository.
1. Create a new branch (git checkout -b feature-branch).
1. Make your changes and commit them (git commit -am 'Add new feature').
1. Push to the branch (git push origin feature-branch).
1. Create a new Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.