import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet, FlatList, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { toggleReminder, addPlanned } from '../slices/plannerSlice';
import { PlannedSession } from '../slices/plannerSlice';

export default function PlannerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { planned } = useSelector((state: RootState) => state.planner);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const scheduleDemoNotification = async (session: PlannedSession) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Study Reminder',
        body: `It’s time to study your planned course: ${session.course}`,
      },
      trigger: { seconds: 5 },
    });
    return id;
  };

  const handleToggle = async (session: PlannedSession) => {
    // if enabling, schedule a demo notification (5s) and store id (not persisted here)
    if (!session.reminderEnabled) {
      await scheduleDemoNotification(session);
    }
    dispatch(toggleReminder(session.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Study Planner</Text>
      <Button title="Add sample planned session" onPress={() => {
        const s: PlannedSession = { id: Date.now().toString(), course: 'Sample Course', date: new Date().toISOString(), reminderEnabled: false };
        dispatch(addPlanned(s));
      }} />
      <FlatList
        data={planned}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.course}>{item.course}</Text>
            <Text>Date: {new Date(item.date).toLocaleString()}</Text>
            <View style={styles.row}>
              <Text>Reminder</Text>
              <Switch value={item.reminderEnabled} onValueChange={() => handleToggle(item)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#fff' },
  title:{ fontSize:22, fontWeight:'700', marginBottom:10 },
  card:{ backgroundColor:'#F4F6FF', padding:12, borderRadius:10, marginVertical:6 },
  course:{ fontSize:16, fontWeight:'600' },
  row:{ flexDirection:'row', justifyContent:'space-between', marginTop:6 }
});
