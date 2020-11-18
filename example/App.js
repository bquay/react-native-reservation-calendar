/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {SafeAreaView, StyleSheet, StatusBar, Alert, View, Text} from 'react-native';

import WeekView from 'react-native-week-view';

const colors = ['#2A638D', '#526372', '#48CBEE', '#afdee9', '#ffffe0', '#ffbcaf', '#f4777f', '#cf3759', '#93003a']
const reservationToColor = new Map()

class App extends React.Component {
  state = {
    events: null,
    selectedDate: new Date(),
  };

  componentDidMount = () => {
    fetch("https://cove-coding-challenge-api.herokuapp.com/reservations")
        .then(response => response.json())
        .then((reservations) => {
          for(let reservation of reservations){
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
          this.setState({
            events: reservations
          })
        })
        .catch(error => console.log(error))
  }

  onEventPress = ({room, start, end}) => {
    // This is where Edit and Delete would go
    Alert.alert(
      `${room.name}`,
      `start: ${start}\nend: ${end}`,
    );
  };

  onGridClick = (event, startHour, date) => {
    // This is where Create would go
    const dateStr = date.toISOString().split('T')[0];
    Alert.alert(`Date: ${dateStr}\nStart hour: ${startHour}`);
  };

  render() {
    const {events, selectedDate} = this.state;
    return (
        !events ?
            <View style={{height:"100%",width:"100%",alignItems:'center',justifyContent:'center'}}>
              <Text>Loading...</Text>
            </View>
            : <>
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
            </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 22,
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
  }
});

export default App;
