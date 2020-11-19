/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, View, Text, TouchableHighlight} from 'react-native';

class ReservationForm extends React.Component {

  constructor(props) {
    super(props)
  }

  onClose = () => {
    this.props.onClose()
  };

  onDelete = (index) => {
    this.props.onDelete(index)
  };

  onSave = () => {
    this.props.onSave()
  };

  render() {
    const { id, index, rooms, room, start, end } = this.props
    return (
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Hello World!</Text>
        <View style={styles.buttonContainer}>
          <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "grey" }}
              onPress={this.onClose}
          >
            <Text style={styles.textStyle}>Cancel</Text>
          </TouchableHighlight>
          <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "green" }}
              onPress={this.onSave}
          >
            <Text style={styles.textStyle}>Save</Text>
          </TouchableHighlight>
          {id &&
            <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "red" }}
                onPress={() => this.onDelete(index)}
            >
              <Text style={styles.textStyle}>Delete</Text>
            </TouchableHighlight>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
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
  }
});

export default ReservationForm;
