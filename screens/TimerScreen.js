import React, { useState, useEffect } from 'react';
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

const PomodoroTimer = () => {
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

  // effectiveTime will be the timer duration based on the timer type
  const effectiveTime = timerType === 'custom' ? customTime : timerSettings[timerType];

  useEffect(() => {
    // When timer type changes, reset the timer.
    setTimeLeft(effectiveTime);
  }, [timerType, customTime]);

  // Helper to play beep sound when timer ends
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

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

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

  // Calculate minutes and seconds for display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Calculate percentage of time remaining
  const percentage = timeLeft / effectiveTime;

  // Calculate pointer angle (hand rotates clockwise)
  const pointerAngle = (1 - percentage) * 360;

  // Generate the SVG path for the red pie slice representing remaining time.
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

  // Convert polar coordinates to Cartesian coordinates
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <View style={styles.container}>
      {/* Timer Type Buttons */}
      <View style={styles.timerTypeContainer}>
        <TouchableOpacity 
          style={[styles.timerTypeButton, timerType === 'pomodoro' && styles.activeTimerType]}
          onPress={() => changeTimerType('pomodoro')}
        >
          <Text style={styles.timerTypeText}>Pomodoro</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timerTypeButton, timerType === 'shortBreak' && styles.activeTimerType]}
          onPress={() => changeTimerType('shortBreak')}
        >
          <Text style={styles.timerTypeText}>Short Break</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timerTypeButton, timerType === 'longBreak' && styles.activeTimerType]}
          onPress={() => changeTimerType('longBreak')}
        >
          <Text style={styles.timerTypeText}>Long Break</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timerTypeButton, timerType === 'custom' && styles.activeTimerType]}
          onPress={() => changeTimerType('custom')}
        >
          <Text style={styles.timerTypeText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Time Input */}
      {timerType === 'custom' && (
        <View style={styles.customTimeContainer}>
          <TextInput 
            style={styles.customTimeInput}
            value={customTimeInput}
            keyboardType="numeric"
            onChangeText={setCustomTimeInput}
            placeholder="Minutes"
          />
          <TouchableOpacity style={styles.setButton} onPress={setCustomTimer}>
            <Text style={styles.setButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Svg width={300} height={300} viewBox="0 0 300 300">
          {/* Red Pie Slice */}
          <Path d={generatePieSlice()} fill="#ff3b30" />
          {/* Major Clock Ticks (every 5 minutes) */}
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
                stroke="black" 
                strokeWidth="3"
              />
            );
          })}
          {/* Minor Clock Ticks */}
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
                  stroke="black" 
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}
          {/* Minute Labels */}
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
                fill="black"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                {minuteValue === 0 ? '60' : minuteValue}
              </SvgText>
            );
          })}
          {/* Clock Hand */}
          <Line 
            x1="150" 
            y1="150" 
            x2="150" 
            y2="40" 
            stroke="black" 
            strokeWidth="4" 
            transform={`rotate(${-pointerAngle} 150 150)`}
          />
          <Circle cx="150" cy="150" r="10" fill="black" />
          {/* Digital Time Display */}
          <SvgText
            x="42%"
            y="200"
            fill="black"
            fontSize="20"
            fontWeight="bold"
          >
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </SvgText>
        </Svg>
      </View>

      {/* Control Buttons */}
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
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
  },
  activeTimerType: {
    backgroundColor: '#EF4444',
  },
  timerTypeText: {
    color: '#000',
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
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
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
    borderColor: '#1F2937',
    borderRadius: 10,
    backgroundColor: '#fff',
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
