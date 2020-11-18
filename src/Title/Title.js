import React from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';

import { getCurrentMonth } from '../utils';
import styles from './Title.styles';

const Title = ({ style, showTitle, selectedDate, textStyle }) => {
  return (
    <View style={[styles.title, style]}>
      {showTitle ? (
        <Text
          style={[
            {
              color: style.color,
              fontSize: 12,
              textAlign: 'center',
            },
            textStyle,
          ]}
        >
          {getCurrentMonth(selectedDate)}
        </Text>
      ) : null}
    </View>
  );
};

Title.propTypes = {
  showTitle: PropTypes.bool,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  style: PropTypes.object,
  textStyle: PropTypes.object,
};

export default React.memo(Title);
