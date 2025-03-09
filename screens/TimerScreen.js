import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  TextInput 
} from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from './ThemeContext';

const PomodoroTimer = () => {
  const { theme, themeStyles } = useContext(ThemeContext);
  const navigation = useNavigation();

 
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: themeStyles.backgroundColor,
        ...(theme === 'dark'
          ? {
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 4,
            }
          : {}),
      },
      headerTitleStyle: { color: themeStyles.textColor },
      headerTintColor: themeStyles.textColor,
    });
  }, [navigation, themeStyles, theme]);

  const timerSettings = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const [timerType, setTimerType] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(timerSettings[timerType]);
  const [isRunning, setIsRunning] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('25');
  const [customTime, setCustomTime] = useState(25 * 60);

  // effectiveTime is based on timerType
  const effectiveTime = timerType === 'custom' ? customTime : timerSettings[timerType];

  useEffect(() => {
    setTimeLeft(effectiveTime);
  }, [timerType, customTime]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/beep.wav'),
        { shouldPlay: true }
      );
      setTimeout(() => {
        sound.unloadAsync();
      }, 3000);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      playSound();
      Alert.alert('Time is up!', 'Your Pomodoro session has ended.');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(effectiveTime);
  };

  const changeTimerType = (type) => {
    setIsRunning(false);
    setTimerType(type);
    if (type !== 'custom') {
      setTimeLeft(timerSettings[type]);
    } else {
      setTimeLeft(customTime);
    }
  };

  const setCustomTimer = () => {
    const mins = parseInt(customTimeInput, 10);
    if (!isNaN(mins) && mins > 0) {
      const newCustomTime = mins * 60;
      setCustomTime(newCustomTime);
      setTimeLeft(newCustomTime);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid number of minutes.');
    }
  };

  // Display calculations
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = timeLeft / effectiveTime;
  const pointerAngle = (1 - percentage) * 360;

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const generatePieSlice = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 130;
    if (percentage === 0) return "";
    if (percentage === 1) {
      return `M ${centerX} ${centerY} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }
    const startAngle = -90;
    const endAngle = startAngle + percentage * 360;
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = percentage * 360 <= 180 ? "0" : "1";
    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.timerTypeContainer}>
        <TouchableOpacity
          style={[
            styles.timerTypeButton,
            { backgroundColor: theme === 'light' ? '#E5E7EB' : '#555' },
            timerType === 'pomodoro' && styles.activeTimerType
          ]}
          onPress={() => changeTimerType('pomodoro')}
        >
          <Text style={[styles.timerTypeText, { color: themeStyles.textColor }]}>Pomodoro</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timerTypeButton,
            { backgroundColor: theme === 'light' ? '#E5E7EB' : '#555' },
            timerType === 'shortBreak' && styles.activeTimerType
          ]}
          onPress={() => changeTimerType('shortBreak')}
        >
          <Text style={[styles.timerTypeText, { color: themeStyles.textColor }]}>Short Break</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timerTypeButton,
            { backgroundColor: theme === 'light' ? '#E5E7EB' : '#555' },
            timerType === 'longBreak' && styles.activeTimerType
          ]}
          onPress={() => changeTimerType('longBreak')}
        >
          <Text style={[styles.timerTypeText, { color: themeStyles.textColor }]}>Long Break</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timerTypeButton,
            { backgroundColor: theme === 'light' ? '#E5E7EB' : '#555' },
            timerType === 'custom' && styles.activeTimerType
          ]}
          onPress={() => changeTimerType('custom')}
        >
          <Text style={[styles.timerTypeText, { color: themeStyles.textColor }]}>Custom</Text>
        </TouchableOpacity>
      </View>

      {timerType === 'custom' && (
        <View style={styles.customTimeContainer}>
          <TextInput
            style={[
              styles.customTimeInput,
              {
                backgroundColor: theme === 'light' ? '#fff' : '#444',
                borderColor: theme === 'light' ? '#ccc' : '#aaa',
                color: themeStyles.textColor,
              }
            ]}
            value={customTimeInput}
            keyboardType="numeric"
            onChangeText={setCustomTimeInput}
            placeholder="Minutes"
            placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
          />
          <TouchableOpacity style={styles.setButton} onPress={setCustomTimer}>
            <Text style={styles.setButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.timerDisplay}>
        <Svg width={300} height={300} viewBox="0 0 300 300">
          <Path d={generatePieSlice()} fill="#ff3b30" />
          {[...Array(12)].map((_, index) => {
            const angle = (index * 30) * (Math.PI / 180);
            const x1 = 150 + 115 * Math.sin(angle);
            const y1 = 150 - 115 * Math.cos(angle);
            const x2 = 150 + 130 * Math.sin(angle);
            const y2 = 150 - 130 * Math.cos(angle);
            return (
              <Line
                key={`major-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={themeStyles.textColor}
                strokeWidth="3"
              />
            );
          })}
          {[...Array(60)].map((_, index) => {
            if (index % 5 !== 0) {
              const angle = (index * 6) * (Math.PI / 180);
              const x1 = 150 + 120 * Math.sin(angle);
              const y1 = 150 - 120 * Math.cos(angle);
              const x2 = 150 + 130 * Math.sin(angle);
              const y2 = 150 - 130 * Math.cos(angle);
              return (
                <Line
                  key={`minor-${index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={themeStyles.textColor}
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}
          {[...Array(12)].map((_, index) => {
            const minuteValue = index * 5;
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const x = 150 + 100 * Math.cos(angle);
            const y = 150 + 100 * Math.sin(angle);
            return (
              <SvgText
                key={`label-${index}`}
                x={x}
                y={y}
                fill={themeStyles.textColor}
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                {minuteValue === 0 ? '60' : minuteValue}
              </SvgText>
            );
          })}
          <Line
            x1="150"
            y1="150"
            x2="150"
            y2="40"
            stroke={themeStyles.textColor}
            strokeWidth="4"
            transform={`rotate(${-pointerAngle} 150 150)`}
          />
          <Circle cx="150" cy="150" r="10" fill={themeStyles.textColor} />
          <SvgText
            x="42%"
            y="200"
            fill={themeStyles.textColor}
            fontSize="20"
            fontWeight="bold"
          >
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </SvgText>
        </Svg>
      </View>

      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={startTimer}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={pauseTimer}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PomodoroTimer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timerTypeButton: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  activeTimerType: {
    backgroundColor: '#EF4444',
  },
  timerTypeText: {
    fontWeight: 'bold',
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customTimeInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    marginRight: 10,
  },
  setButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  setButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timerDisplay: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderWidth: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  controlButton: {
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#FBBF24',
  },
  resetButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
