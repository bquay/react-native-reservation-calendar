import moment from "moment";

export const reservationToColor = new Map()

Date.prototype.addDays = function(days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

Date.prototype.addHours = function(hours) {
  this.setTime(this.getTime() + (hours*60*60*1000));
  return this;
}

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const sortEventsByDate = (events) => {
  const sortedEvents = {};
  events.forEach((event) => {
    addReservation(sortedEvents, event.id, event.room, event.start, event.end)
  });
  return sortedEvents;
}

export const addReservation = (sortedEvents, id, room, newStart, newEnd) => {
  // Stores the events hashed by their date
  // For example: { "2020-02-03": [event1, event2, ...] }
  // If an event spans through multiple days, adds the event multiple times
  let start = moment(newStart);
  let end = moment(newEnd);
  let changed = []
  for (
      let date = moment(start);
      date.isSameOrBefore(end, 'days');
      date.add(1, 'days')
  ) {
    // Calculate actual start and end dates
    const startOfDay = moment(date).startOf('day');
    const endOfDay = moment(date).endOf('day');
    const actualStartDate = moment.max(start, startOfDay);
    const actualEndDate = moment.min(end, endOfDay);

    // Add to object
    const dateStr = date.format('YYYY-MM-DD');
    if (!sortedEvents[dateStr]) {
      sortedEvents[dateStr] = [];
    }
    sortedEvents[dateStr].push({
      id,
      room,
      color: reservationToColor.get(room.id),
      start: actualStartDate.toDate(),
      end: actualEndDate.toDate(),
    });
    changed.push(dateStr)
  }
  changed.forEach((date) => {
    sortedEvents[date].sort((a, b) => {
      return moment(a.start).diff(b.start, 'minutes');
    });
  });
}

export const removeReservation = (reservations, id, start, end) => {
  let startStr = moment(start).format('YYYY-MM-DD')
  let endStr = moment(end).format('YYYY-MM-DD')
  while(startStr <= endStr){
    if(reservations[startStr].length === 1){
      delete reservations[startStr]
    } else {
      reservations[startStr].forEach((res, index)=>{
        if(res.id === id) reservations[startStr].splice(index, 1)
      })
    }
    start = start.addDays(1)
    startStr = moment(start).format('YYYY-MM-DD')
  }
}
