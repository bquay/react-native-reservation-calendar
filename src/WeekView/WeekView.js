import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Animated,
  VirtualizedList,
  InteractionManager,
} from 'react-native';
import moment from 'moment';
import memoizeOne from 'memoize-one';

import Events from '../Events/Events';
import Header from '../Header/Header';
import Title from '../Title/Title';
import Times from '../Times/Times';
import styles from './WeekView.styles';
import {
  TIME_LABELS_IN_DISPLAY,
  CONTAINER_HEIGHT,
  DATE_STR_FORMAT,
  availableNumberOfDays,
  setLocale,
  CONTAINER_WIDTH,
} from '../utils';

const MINUTES_IN_DAY = 60 * 24;

export default class WeekView extends Component {
  constructor(props) {
    super(props);
    this.eventsGrid = null;
    this.verticalAgenda = null;
    this.header = null;
    this.pageOffset = 2;
    this.currentPageIndex = this.pageOffset;
    this.eventsGridScrollX = new Animated.Value(0);
    this.state = {
      currentMoment: props.selectedDate,
      initialDates: this.calculatePagesDates(
        props.selectedDate,
        props.numberOfDays,
        props.prependMostRecent,
      ),
    };

    setLocale(props.locale);
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.scrollToVerticalStart();
    });
    this.eventsGridScrollX.addListener((position) => {
      this.header.scrollToOffset({ offset: position.value, animated: false });
    });
  }

  componentDidUpdate(prevprops) {
    if (this.props.locale !== prevprops.locale) {
      setLocale(this.props.locale);
    }
  }

  componentWillUnmount() {
    this.eventsGridScrollX.removeAllListeners();
  }

  calculateTimes = memoizeOne((hoursInDisplay) => {
    const times = [];
    const timeLabelsPerHour = TIME_LABELS_IN_DISPLAY / hoursInDisplay;
    const minutesStep = 60 / timeLabelsPerHour;
    for (let timer = 0; timer < MINUTES_IN_DAY; timer += minutesStep) {
      let minutes = timer % 60;
      if (minutes < 10) minutes = `0${minutes}`;
      const hour = Math.floor(timer / 60) % 12 || 12;
      const ampm = timer < 720 ? 'am' : 'pm'
      const timeString = `${hour}:${minutes}${ampm}`;
      times.push(timeString);
    }
    return times;
  });

  scrollToVerticalStart = () => {
    if (this.verticalAgenda) {
      const { startHour, hoursInDisplay } = this.props;
      const startHeight = (startHour * CONTAINER_HEIGHT) / hoursInDisplay;
      this.verticalAgenda.scrollTo({ y: startHeight, x: 0, animated: false });
    }
  };

  scrollEnded = (event) => {
    const {
      nativeEvent: { contentOffset, contentSize },
    } = event;
    const { x: position } = contentOffset;
    const { width: innerWidth } = contentSize;
    const {
      onSwipePrev,
      onSwipeNext,
      numberOfDays,
      prependMostRecent,
    } = this.props;
    const { currentMoment, initialDates } = this.state;

    const newPage = Math.round((position / innerWidth) * initialDates.length);
    const movedPages = newPage - this.currentPageIndex;
    this.currentPageIndex = newPage;

    if (movedPages === 0) {
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      const daySignToTheFuture = prependMostRecent ? -1 : 1;
      const newMoment = moment(currentMoment)
        .add(movedPages * numberOfDays * daySignToTheFuture, 'd')
        .toDate();

      const newState = {
        currentMoment: newMoment,
      };

      if (movedPages < 0 && newPage < this.pageOffset) {
        const first = initialDates[0];
        const daySignToThePast = daySignToTheFuture * -1;
        const addDays = numberOfDays * daySignToThePast;
        const initialDate = moment(first).add(addDays, 'd');
        initialDates.unshift(initialDate.format(DATE_STR_FORMAT));
        this.currentPageIndex += 1;
        this.eventsGrid.scrollToIndex({
          index: this.currentPageIndex,
          animated: false,
        });

        newState.initialDates = [...initialDates];
      } else if (
        movedPages > 0 &&
        newPage > this.state.initialDates.length - this.pageOffset
      ) {
        const latest = initialDates[initialDates.length - 1];
        const addDays = numberOfDays * daySignToTheFuture;
        const initialDate = moment(latest).add(addDays, 'd');
        initialDates.push(initialDate.format(DATE_STR_FORMAT));

        newState.initialDates = [...initialDates];
      }

      this.setState(newState);

      if (movedPages < 0) {
        onSwipePrev && onSwipePrev(newMoment);
      } else {
        onSwipeNext && onSwipeNext(newMoment);
      }
    });
  };

  eventsGridRef = (ref) => {
    this.eventsGrid = ref;
  };

  verticalAgendaRef = (ref) => {
    this.verticalAgenda = ref;
  };

  headerRef = (ref) => {
    this.header = ref;
  };

  calculatePagesDates = (currentMoment, numberOfDays, prependMostRecent) => {
    const initialDates = [];
    for (let i = -this.pageOffset; i <= this.pageOffset; i += 1) {
      const initialDate = moment(currentMoment).add(numberOfDays * i, 'd');
      initialDates.push(initialDate.format(DATE_STR_FORMAT));
    }
    return prependMostRecent ? initialDates.reverse() : initialDates;
  };

  getListItemLayout = (index) => ({
    length: CONTAINER_WIDTH,
    offset: CONTAINER_WIDTH * index,
    index,
  });

  render() {
    const {
      showTitle,
      numberOfDays,
      headerStyle,
      headerTextStyle,
      hourTextStyle,
      eventContainerStyle,
      formatDateHeader,
      onEventPress,
      events,
      hoursInDisplay,
      onGridClick,
      EventComponent,
      prependMostRecent,
      rightToLeft,
    } = this.props;
    const { currentMoment, initialDates } = this.state;
    const times = this.calculateTimes(hoursInDisplay);
    const horizontalInverted =
      (prependMostRecent && !rightToLeft) ||
      (!prependMostRecent && rightToLeft);

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Title
            showTitle={showTitle}
            style={headerStyle}
            textStyle={headerTextStyle}
            selectedDate={currentMoment}
          />
          <VirtualizedList
            horizontal
            pagingEnabled
            inverted={horizontalInverted}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            ref={this.headerRef}
            data={initialDates}
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data.length}
            getItemLayout={(_, index) => this.getListItemLayout(index)}
            keyExtractor={(item) => item}
            initialScrollIndex={this.pageOffset}
            renderItem={({ item }) => {
              return (
                <View key={item} style={styles.header}>
                  <Header
                    style={headerStyle}
                    textStyle={headerTextStyle}
                    formatDate={formatDateHeader}
                    initialDate={item}
                    numberOfDays={numberOfDays}
                    rightToLeft={rightToLeft}
                  />
                </View>
              );
            }}
          />
        </View>
        <ScrollView ref={this.verticalAgendaRef}>
          <View style={styles.scrollViewContent}>
            <Times times={times} textStyle={hourTextStyle} />
            <VirtualizedList
              data={initialDates}
              getItem={(data, index) => data[index]}
              getItemCount={(data) => data.length}
              getItemLayout={(_, index) => this.getListItemLayout(index)}
              keyExtractor={(item) => item}
              initialScrollIndex={this.pageOffset}
              renderItem={({ item }) => {
                return (
                  <Events
                    times={times}
                    eventsByDate={events}
                    initialDate={item}
                    numberOfDays={numberOfDays}
                    onEventPress={onEventPress}
                    onGridClick={onGridClick}
                    hoursInDisplay={hoursInDisplay}
                    EventComponent={EventComponent}
                    eventContainerStyle={eventContainerStyle}
                    rightToLeft={rightToLeft}
                  />
                );
              }}
              horizontal
              pagingEnabled
              inverted={horizontalInverted}
              onMomentumScrollEnd={this.scrollEnded}
              scrollEventThrottle={32}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        x: this.eventsGridScrollX,
                      },
                    },
                  },
                ],
                { useNativeDriver: false },
              )}
              ref={this.eventsGridRef}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

WeekView.propTypes = {
  events: PropTypes.object,
  formatDateHeader: PropTypes.string,
  numberOfDays: PropTypes.oneOf(availableNumberOfDays).isRequired,
  onSwipeNext: PropTypes.func,
  onSwipePrev: PropTypes.func,
  onEventPress: PropTypes.func,
  onGridClick: PropTypes.func,
  headerStyle: PropTypes.object,
  headerTextStyle: PropTypes.object,
  hourTextStyle: PropTypes.object,
  eventContainerStyle: PropTypes.object,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  locale: PropTypes.string,
  hoursInDisplay: PropTypes.number,
  startHour: PropTypes.number,
  EventComponent: PropTypes.elementType,
  showTitle: PropTypes.bool,
  rightToLeft: PropTypes.bool,
  prependMostRecent: PropTypes.bool,
};

WeekView.defaultProps = {
  events: [],
  locale: 'en',
  hoursInDisplay: 6,
  startHour: 0,
  showTitle: true,
  rightToLeft: false,
  prependMostRecent: false,
};
