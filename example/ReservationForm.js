/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, View, Text, TouchableHighlight, Button} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';

class ReservationForm extends React.Component {
  state = {
    selectedRoom: this.props.room
        ? {value: this.props.room.name, label:this.props.room.name, room:this.props.room}
        : {value: this.props.rooms[0].name, label:this.props.rooms[0].name, room:this.props.rooms[0]},
    startDate: this.props.start,
    endDate: this.props.end,
    startPicker: false,
    endPicker: false,
    disabled: false
  }

  onConfirm = (name, date) => {
    let disabled = this.state.disabled
    if (name == 'start' && date > this.state.endDate || name == 'end' && date < this.state.startDate) {
      disabled = true
    } else {
      disabled = false
    }
    this.setState({
      [name+'Date']: date,
      [name+'Picker']: !this.state[name+'Picker'],
      disabled
    })
  }

  toggleDatePicker = (name) => {
    this.setState({
      [name+'Picker']: !this.state[name+'Picker']
    })
  }

  onClose = () => {
    this.props.onClose()
  };

  onDelete = (id, start, end) => {
    this.props.onDelete(id, start, end)
  };

  onSave = (id, name, newStart, newEnd, oldStart, oldEnd) => {
    this.props.onSave(id, name, newStart, newEnd, oldStart, oldEnd)
  };

  render() {
    const { selectedRoom, startDate, endDate, disabled } = this.state
    const { id, rooms, start, end } = this.props
    return (
      <View style={styles.modalView}>
        <Text style={{fontSize: 20}}>Edit Reservation</Text>
        <View style={styles.inputContainer}>
          <View style={{...styles.picker, zIndex: 10}}>
            <Text style={{fontSize: 16, width: '25%'}}>Room</Text>
            <DropDownPicker
                containerStyle={{height: 40, width: '75%'}}
                items={rooms.map((room)=> {return {value: room.name, label:room.name, room:room}})}
                defaultValue={selectedRoom.label}
                onChangeItem={(item) => {
                  this.setState({
                    selectedRoom: item
                  })
                }}
            />
          </View>
          <View style={{...styles.picker, zIndex: 9}}>
            <Text style={{fontSize: 16, width: '25%'}}>Start</Text>
            <DateTimePickerModal
                isVisible={this.state.startPicker}
                date={startDate}
                mode="datetime"
                onConfirm={(date) => this.onConfirm('start', date)}
                onCancel={() => this.toggleDatePicker('start')}
            />
            <Button
                style={{fontSize: 16, width: '75%'}}
                title={moment(startDate).format('MMMM D, YYYY h:mma')}
                onPress={() => this.toggleDatePicker('start')}
            />
          </View>
          <View style={{...styles.picker, zIndex: 8}}>
            <Text style={{fontSize: 16, width: '25%'}}>End</Text>
            <DateTimePickerModal
                isVisible={this.state.endPicker}
                date={endDate}
                mode="datetime"
                onConfirm={(date) => this.onConfirm('end', date)}
                onCancel={() => this.toggleDatePicker('end')}
            />
            <Button
                style={{fontSize: 16, width: '75%'}}
                title={moment(endDate).format('MMMM D, YYYY h:mma')}
                onPress={() => this.toggleDatePicker('end')}
            />
          </View>

        </View>
        <View style={styles.buttonContainer}>
          <Button
              title='Cancel'
              color='grey'
              style={styles.openButton}
              onPress={this.onClose}
          />
          <Button
              title='Save'
              disabled={disabled}
              color='green'
              style={styles.openButton}
              onPress={() => this.onSave(id, selectedRoom.room, startDate, endDate, start, end)}
          />
          {id &&
            <Button
                title='Delete'
                color='red'
                style={styles.openButton}
                onPress={() => this.onDelete(id, start, end)}
            />
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 5,
    height: "50%",
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  inputContainer:{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '85%'
  },
  buttonContainer:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: "100%"
  },
  openButton: {
    width: "25%",
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: '10%'
  }
});

export default ReservationForm;
