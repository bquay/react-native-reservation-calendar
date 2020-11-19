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
import { sortEventsByDate, addReservation, removeReservation, uuidv4, reservationToColor } from './utils'

const colors = ['#2A638D', '#526372', '#48CBEE', '#afdee9', '#ffffe0', '#ffbcaf', '#f4777f', '#cf3759', '#93003a']

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
          reservations = sortEventsByDate(reservations);
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

  onDelete = (id, start, end) => {
    let reservations = {...this.state.events}
    removeReservation(reservations, id, start, end)
    this.setState({
      events: reservations,
      modalVisible: false
    })
  }

  onSave = (id, room, start, end, oldStart, oldEnd) => {
    let reservations = {...this.state.events}
    if(id) {
      removeReservation(reservations, id, oldStart, oldEnd)
    } else {
      id = uuidv4()
    }
    addReservation(reservations, id, room, start, end)
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
