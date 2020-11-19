/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {SafeAreaView, StyleSheet, StatusBar, View, Text, Modal} from 'react-native';

import WeekView from 'react-native-week-view';
import ReservationForm from "./ReservationForm";
import moment from "moment";

const colors = ['#2A638D', '#526372', '#48CBEE', '#afdee9', '#ffffe0', '#ffbcaf', '#f4777f', '#cf3759', '#93003a']
const reservationToColor = new Map()

Date.prototype.addDays = function(days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

Date.prototype.addHours = function(hours) {
  this.setTime(this.getTime() + (hours*60*60*1000));
  return this;
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class App extends React.Component {
  state = {
    events: null,
    rooms: null,
    selectedDate: new Date(),
    modalVisible: false,
    selectedReservation: {
      id: null,
      index: null,
      room: null,
      start: null,
      end: null
    }
  };

  componentDidMount = () => {
    fetch("https://cove-coding-challenge-api.herokuapp.com/reservations")
        .then(response => response.json())
        .then((reservations) => {
          let roomIds = []
          let rooms = []
          for(let reservation of reservations){
            if(roomIds.indexOf(reservation.room.id) == -1) {
              roomIds.push(reservation.room.id)
              rooms.push(reservation.room)
            }
            if(!reservation.color){
              if(!reservationToColor.has(reservation.room.id)){
                let index = reservationToColor.size < colors.length - 1 ? reservationToColor.size : reservationToColor.size % colors.length
                let color = colors[index]
                reservationToColor.set(reservation.room.id, color)
              } else {
                reservation.color = reservationToColor.get(reservation.room.id)
              }
            }
          }
          reservations = this.sortEventsByDate(reservations);
          this.setState({
            events: reservations,
            rooms
          })
        })
        .catch(error => console.log(error))
  }

  onClose = () => {
    this.setState({
      selectedReservation: {
        id: null,
        room: null,
        start: null,
        end: null
      },
      modalVisible: false
    })
  }

  addReservation = (sortedEvents, id, room, newStart, newEnd) => {
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

  removeReservation = (reservations, id, start, end) => {
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

  onDelete = (id, start, end) => {
    let reservations = {...this.state.events}
    this.removeReservation(reservations, id, start, end)
    this.setState({
      events: reservations,
      modalVisible: false
    })
  }

  onSave = (id, room, start, end, oldStart, oldEnd) => {
    let reservations = {...this.state.events}
    console.log(id, room, start, end, oldStart, oldEnd)
    if(id) {
      this.removeReservation(reservations, id, oldStart, oldEnd)
    } else {
      id = uuidv4()
    }
    this.addReservation(reservations, id, room, start, end)
    this.setState({
      events: reservations,
      modalVisible: false
    })
  }

  onEventPress = (reservation) => {
    this.setState({
      selectedReservation: reservation,
      modalVisible: true
    })
  };

  onGridClick = (start) => {
    let end = new Date(start).addHours(1)
    this.setState({
      selectedReservation: {
        ...this.state.selectedReservation,
        start,
        end
      },
      modalVisible: true
    })
  };

  sortEventsByDate = (events) => {
    // Stores the events hashed by their date
    // For example: { "2020-02-03": [event1, event2, ...] }
    // If an event spans through multiple days, adds the event multiple times
    let changed = []
    const sortedEvents = {};
    events.forEach((event, index) => {
      const start = moment(event.start);
      const end = moment(event.end);

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
          ...event,
          start: actualStartDate.toDate(),
          end: actualEndDate.toDate(),
        });
        changed.push(dateStr)
      }
    });
    // For each day, sort the events by the minute (in-place)
    changed.forEach((date) => {
      sortedEvents[date].sort((a, b) => {
        return moment(a.start).diff(b.start, 'minutes');
      });
    });
    return sortedEvents;
  }

  render() {
    const {events, selectedDate} = this.state;
    return (
        !events
            ? <View style={{height:"100%",width:"100%",alignItems:'center',justifyContent:'center'}}>
                <Text>Loading...</Text>
              </View>
            : <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                >
                  <View style={styles.centeredView}>
                    <ReservationForm
                      rooms={this.state.rooms}
                      id={this.state.selectedReservation.id}
                      room={this.state.selectedReservation.room}
                      start={this.state.selectedReservation.start}
                      end={this.state.selectedReservation.end}
                      onClose={this.onClose}
                      onSave={this.onSave}
                      onDelete={this.onDelete}
                    />
                  </View>
                </Modal>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={styles.container}>
                  <WeekView
                      events={events}
                      selectedDate={selectedDate}
                      numberOfDays={5}
                      onEventPress={this.onEventPress}
                      onGridClick={this.onGridClick}
                      headerStyle={styles.header}
                      headerTextStyle={styles.headerText}
                      hourTextStyle={styles.hourText}
                      eventContainerStyle={styles.eventContainer}
                      formatDateHeader="MMM D"
                      hoursInDisplay={12}
                      startHour={0}
                  />
                </SafeAreaView>
              </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 22,
    width: '100%'
  },
  header: {
    backgroundColor: '#15284B',
    borderColor: '#fff',
  },
  headerText: {
    color: 'white',
  },
  hourText: {
    color: 'black',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%'
  }
});

export default App;
