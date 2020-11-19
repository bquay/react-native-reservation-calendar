import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity } from 'react-native';
import styles from './Event.styles';

const Event = ({
  event,
  onPress,
  position,
  EventComponent,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(event)}
      style={[
        styles.item,
        position,
        {
          backgroundColor: event.color,
        },
        containerStyle,
      ]}
      disabled={!onPress}
    >
      {EventComponent ? (
        <EventComponent event={event} position={position} />
      ) : (
        <Text style={styles.description}>{event.room.name}</Text>
      )}
    </TouchableOpacity>
  );
};

const eventPropType = PropTypes.shape({
  color: PropTypes.string,
  index: PropTypes.number,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string,
  start: PropTypes.oneOfType([
    PropTypes.instanceOf(Date).isRequired,
    PropTypes.string.isRequired,
  ]),
  end: PropTypes.oneOfType([
    PropTypes.instanceOf(Date).isRequired,
    PropTypes.string.isRequired,
  ]),
  room: PropTypes.object,
});

const positionPropType = PropTypes.shape({
  height: PropTypes.number,
  width: PropTypes.number,
  top: PropTypes.number,
  left: PropTypes.number,
});

Event.propTypes = {
  event: eventPropType.isRequired,
  onPress: PropTypes.func,
  position: positionPropType,
  containerStyle: PropTypes.object,
  EventComponent: PropTypes.elementType,
};

export default Event;
