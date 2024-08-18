import React from 'react';
import {StyleSheet, View} from 'react-native';

import FeedScreen from './src/screens/FeedScreen';

const App = () => {
  return (
    <View style={styles.container}>
      <FeedScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
});

export default App;
