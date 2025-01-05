import ical from 'node-ical';
import fs from 'fs';
import moment from 'moment';
import yargs from 'yargs';
import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';

// Helper function to parse ICS file and extract event details using node-ical
function parseICS(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  
  // Parse the ICS data
  const parsedData = ical.parseICS(data);
  
  const events = [];

  // Loop through the parsed data and collect event details
  for (let key in parsedData) {
    const event = parsedData[key];
    
    // We expect to find VEVENT entries
    if (event.type === 'VEVENT') {
      const start = event.start;
      const end = event.end;
      const summary = event.summary || 'No title';
      const location = event.location || 'No location';
      const attendees = event.attendee || 'No attendees listed';
      const status = event.status || 'CONFIRMED';  // Default to 'CONFIRMED'
      const classType = event.class || 'PUBLIC';  // Class property could indicate privacy

      events.push({
        start: start,
        end: end,
        duration: moment(end).diff(moment(start), 'hours'), // duration in hours
        summary: summary,
        location: location,
        attendees: attendees,
        month: moment(start).format('MMMM YYYY'),  // Grouping by month
        status: status,
        classType: classType,
        isPrivate: classType === 'PRIVATE', // Flag private events
      });
    }
  }

  return events;
}

// Command-line options
const options = yargs(hideBin(process.argv))
  .option('f', {
    alias: 'files',
    describe: 'List of ICS files',
    type: 'array',
    demandOption: true,
  })
  .option('s', {
    alias: 'startDate',
    describe: 'Start date (YYYY-MM-DD)',
    type: 'string',
    demandOption: true,
  })
  .option('e', {
    alias: 'endDate',
    describe: 'End date (YYYY-MM-DD)',
    type: 'string',
    demandOption: true,
  })
  .argv;

// Validate date range
const startDate = moment(options.startDate, 'YYYY-MM-DD');
const endDate = moment(options.endDate, 'YYYY-MM-DD');

// Load and parse the ICS files
let allEvents = [];
options.files.forEach(file => {
  const events = parseICS(file);
  allEvents = allEvents.concat(events);
});

// Filter events by the selected date range
const filteredEvents = allEvents.filter(event => {
  const eventStart = moment(event.start);
  return eventStart.isBetween(startDate, endDate, undefined, '[]');
});

// Group events by month
const groupedByMonth = filteredEvents.reduce((acc, event) => {
  const monthYear = event.month;
  if (!acc[monthYear]) {
    acc[monthYear] = { events: [], totalDuration: 0 };
  }
  acc[monthYear].events.push(event);
  acc[monthYear].totalDuration += event.duration;
  return acc;
}, {});

// Sort months chronologically
const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
  const aDate = moment(a, 'MMMM YYYY');
  const bDate = moment(b, 'MMMM YYYY');
  return aDate.isBefore(bDate) ? -1 : 1;
});

// Output the grouped events in chronological order
console.log('Events Grouped by Month (Chronological Order):');
sortedMonths.forEach(month => {
  console.log(`${month}:`);
  console.log(`  Total Duration: ${groupedByMonth[month].totalDuration} hours`);
  console.log(`  Events:`);
  groupedByMonth[month].events.forEach(event => {
    if (event.isPrivate) {
      console.log(chalk.red(`    - ${event.summary} (PRIVATE) (${event.start} - ${event.end})`));
    } else {
      console.log(chalk.green(`    - ${event.summary} (${event.start} - ${event.end})`));
    }
  });
  console.log('');
});
