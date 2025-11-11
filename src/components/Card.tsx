import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, marginBottom: 12, borderRadius: 10, elevation: 2 }
});
