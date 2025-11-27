import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const MessageBox = ({ type = "info", message }) => {

  const backgroundColors = {
    success: "#D1F7C4",
    error: "#FFD6D6",
    warning: "#FFF4C2",
    info: "#DDEBFF"
  };

  const borderColors = {
    success: "#28A745",
    error: "#DC3545",
    warning: "#FFC107",
    info: "#007BFF"
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: backgroundColors[type], 
        borderLeftColor: borderColors[type] 
      }
    ]}>
      <Text style={[styles.text, { color: borderColors[type] }]}>
        {message}
      </Text>
    </View>
  );
};

export default MessageBox;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderLeftWidth: 5,
    borderRadius: 8,
    marginVertical: 8
  },
  text: {
    fontSize: 15,
    fontWeight: "500",
  }
});
