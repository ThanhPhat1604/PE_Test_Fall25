import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const { weeklyMinutes, completionByCourse } = useSelector((state: RootState) => state.analytics);
  const screenWidth = Dimensions.get('window').width - 32;

  if (!weeklyMinutes || weeklyMinutes.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No study data this week</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Learning Analytics</Text>

      <Text style={styles.subtitle}>Total Minutes per Day</Text>
      <BarChart
        data={{
          labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
          datasets: [{ data: weeklyMinutes }],
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        }}
        style={styles.chart}
      />

      <Text style={styles.subtitle}>Completion by Course (%)</Text>
      {Object.keys(completionByCourse || {}).map(c => (
        <Text key={c}>{c}: {completionByCourse[c].toFixed(1)}%</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#fff' },
  title:{ fontSize:22, fontWeight:'700', marginBottom:10 },
  subtitle:{ fontSize:16, fontWeight:'600', marginVertical:6 },
  chart:{ borderRadius:8, marginBottom:12 },
  center:{ flex:1, alignItems:'center', justifyContent:'center' }
});
