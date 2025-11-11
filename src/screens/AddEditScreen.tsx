import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { addSession, updateSession } from '../slices/coursesSlice';
import { AppDispatch } from '../store/store';
import { StudySession } from '../types/student';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddEditScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editing: StudySession | undefined = route.params?.session;

  const [course, setCourse] = useState(editing?.course || '');
  const [duration, setDuration] = useState(String(editing?.duration || '30'));
  const [date, setDate] = useState<Date>(editing ? new Date(editing.date) : new Date());
  const [notes, setNotes] = useState(editing?.notes || '');
  const [completed, setCompleted] = useState<boolean>(!!editing?.completed);
  const [showPicker, setShowPicker] = useState(false);

  const onSave = () => {
    const payload: StudySession = {
      id: editing ? editing.id : Date.now().toString(),
      course,
      duration: Number(duration),
      date: date.toISOString(),
      notes,
      completed,
    };
    if (editing) dispatch(updateSession(payload));
    else dispatch(addSession(payload));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit' : 'Add'} Session</Text>

      <Text style={styles.label}>Course</Text>
      <TextInput style={styles.input} value={course} onChangeText={setCourse} />

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />

      <Text style={styles.label}>Date</Text>
      <Button title={date.toDateString()} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker value={date} mode="date" onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }} />
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={notes} onChangeText={setNotes} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 }}>
        <Text>Completed</Text>
        <Switch value={completed} onValueChange={setCompleted} />
      </View>

      <Button title="Save" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#fff' },
  title: { fontSize:20, fontWeight:'700', marginBottom:12 },
  label: { fontWeight:'600', marginTop:8 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginTop:4 },
});
