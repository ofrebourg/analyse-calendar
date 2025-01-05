import ical from 'node-ical';
import fs from 'fs';
import moment from 'moment';
import yargs from 'yargs';
import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';

// Helper function to format the duration in hours and minutes
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours} hours ${mins} minutes`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else if (mins > 0) {
    return `${mins} minutes`;
  } else {
    return '0 minutes';
  }
}

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
        start,
        end,
        duration: moment(end).diff(moment(start), 'minutes'), // duration in minutes
        summary,
        location,
        attendees,
        month: moment(start).format('MMMM YYYY'),  // Grouping by month
        status,
        classType,
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
  .option('g', {
    alias: 'groupBy',
    describe: 'Group events by "month" or "title"',
    type: 'string',
    choices: ['month', 'title'],
    demandOption: true,
  })
  .option('p', {
    alias: 'person',
    describe: 'Track time spent with one or more persons (comma-separated names or emails). If the list of names is empty, everyone will be included.',
    type: 'string',
    coerce: (arg) => arg.split(',').map(name => name.trim()), // Coerce to array of names
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

const includeEveryone = options.person.length === 1 && options.person[0].trim().length === 0

// Group events based on the user's selected grouping option
let groupedEvents;
if (options.groupBy === 'month') {
  // Group events by month
  groupedEvents = filteredEvents.reduce((acc, event) => {
    const monthYear = event.month;
    if (!acc[monthYear]) {
      acc[monthYear] = { events: [], totalDuration: 0 };
    }
    acc[monthYear].events.push(event);
    acc[monthYear].totalDuration += event.duration;
    return acc;
  }, {});
} else if (options.groupBy === 'title') {
  // Group events by meeting title
  groupedEvents = filteredEvents.reduce((acc, event) => {
    const title = event.summary;
    if (!acc[title]) {
      acc[title] = { events: [], totalDuration: 0 };
    }
    acc[title].events.push(event);
    acc[title].totalDuration += event.duration;
    return acc;
  }, {});
}

// Track time spent with a particular person (if provided)
let timeWithPerson = {};
if (options.person) {
  filteredEvents.forEach(event => {
    const attendees = Array.isArray(event.attendees) ? event.attendees : [event.attendees];
    attendees.forEach(attendee => {
      const cn = attendee.params?.CN
      if (includeEveryone || options.person.includes(cn)) {
        if (!timeWithPerson[cn]) {
          timeWithPerson[cn] = 0;
        }
        timeWithPerson[cn] += event.duration;
      }
    });
  });
}

// Sort the time spent with people from highest to lowest
const sortedTimeWithPerson = Object.entries(timeWithPerson)
  .sort(([, timeA], [, timeB]) => timeB - timeA);

// Output the grouped events and total time spent with each person
console.log(`Events Grouped by ${options.groupBy.charAt(0).toUpperCase() + options.groupBy.slice(1)}:`);
for (let group in groupedEvents) {
  console.log(`${group}:`);
  console.log(`  Total Duration: ${formatDuration(groupedEvents[group].totalDuration)}`);
  console.log(`  Events:`);
  groupedEvents[group].events.forEach(event => {
    if (event.isPrivate) {
      console.log(chalk.red(`    - ${event.summary} (PRIVATE) (${event.start} - ${event.end})`));
    } else {
      console.log(chalk.green(`    - ${event.summary} (${event.start} - ${event.end})`));
    }
  });
  console.log('');
}

// Output time spent with a particular person (if specified)
if (options.person) {
  console.log(`Time spent with ${includeEveryone ? 'everyone' : options.person.map(p => `'${p}'`).join(' OR ')}:`);
  sortedTimeWithPerson.forEach(([person, time]) => {
    console.log(`  ${person}: ${formatDuration(time)}`);
  });
}
