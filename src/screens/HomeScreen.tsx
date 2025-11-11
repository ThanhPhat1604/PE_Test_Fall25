import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSessions, addSession, updateSession } from '../slices/coursesSlice';
import { computeAnalytics } from '../slices/analyticsSlice';
import { RootState, AppDispatch } from '../store/store';
import { Card } from '../components/Card';
import { StudySession } from '../types/student';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, loading, error } = useSelector((state: RootState) => state.courses);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<StudySession | null>(null);
  const [course, setCourse] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchSessions()).then((res: any) => {
      if (res.payload) dispatch(computeAnalytics(res.payload));
    });
  }, [dispatch]);

  // safe calculations with types
  const totalMinutes = sessions.reduce((acc: number, s: StudySession) => acc + (s.duration ?? 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completed = sessions.filter((s: StudySession) => !!s.completed).length;
  const completionPercent = sessions.length ? ((completed / sessions.length) * 100).toFixed(1) : '0';

  const courseCount: Record<string, number> = {};
  sessions.forEach((s: StudySession) => {
    const key = s.course ?? 'Unknown Course';
    courseCount[key] = (courseCount[key] || 0) + (s.duration ?? 0);
  });
  const mostActiveCourse = Object.entries(courseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const avgDaily = (Number(totalHours) / 7).toFixed(1);

  const openAddModal = () => {
    setEditing(null);
    setCourse('');
    setDuration('');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (item: StudySession) => {
    setEditing(item);
    setCourse(item.course);
    setDuration(String(item.duration ?? ''));
    setNotes(item.notes ?? '');
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!course.trim() || !duration.trim()) return;

    const newSession: StudySession = {
      id: editing ? editing.id : `local-${Date.now()}`,
      course: course.trim(),
      duration: Number(duration),
      date: editing ? editing.date : new Date().toISOString(),
      completed: editing ? !!editing.completed : false,
      notes: notes || '',
    };

    if (editing) dispatch(updateSession(newSession));
    else dispatch(addSession(newSession));

    setCourse('');
    setDuration('');
    setNotes('');
    setEditing(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Study Summary</Text>

      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      {!loading && !error && (
        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.label}>Total hours this week:</Text>
            <Text style={styles.value}>{totalHours} h</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Most active course:</Text>
            <Text style={styles.value}>{mostActiveCourse}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Completion rate:</Text>
            <Text style={styles.value}>{completionPercent}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Avg daily time:</Text>
            <Text style={styles.value}>{avgDaily} h</Text>
          </View>
        </View>
      )}

      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>🤖 AI Study Suggestion</Text>
        <Text>
          {mostActiveCourse !== 'N/A'
            ? `You should focus more on ${mostActiveCourse} to improve your progress.`
            : 'No data yet. Keep studying!'}
        </Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
        <Text style={styles.addText}>+ Add Session</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Active Study Sessions</Text>

      <FlatList
        data={sessions}
        keyExtractor={(item, index) => (item.id ? String(item.id) : String(index))}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            testID={`session-${item.id}`}
            accessibilityLabel={`session-${item.id}`}
          >
            <Card>
              <Text style={styles.course}>{item.course}</Text>
              <Text>Duration: {item.duration} min</Text>
              <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
              {item.notes ? <Text>Notes: {item.notes}</Text> : null}
              <Text>Status: {item.completed ? '✔ Completed' : '⏳ In Progress'}</Text>
            </Card>
          </TouchableOpacity>
        )}
        // small optimization: stable key uses id or index
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Session' : 'New Study Session'}</Text>
            <TextInput placeholder="Course name" value={course} onChangeText={setCourse} style={styles.input} />
            <TextInput
              placeholder="Duration (minutes)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput placeholder="Notes (optional)" value={notes} onChangeText={setNotes} style={styles.input} />
            <Button title={editing ? 'Update' : 'Add'} onPress={handleSubmit} />
            <Button title="Cancel" onPress={() => { setModalVisible(false); setEditing(null); }} color="gray" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  summary: { backgroundColor: '#F5F7FF', borderRadius: 12, padding: 12, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label: { fontWeight: '600' },
  value: { fontWeight: '500', color: '#007AFF' },
  subtitle: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  error: { color: 'red', marginVertical: 10 },
  course: { fontWeight: '700', fontSize: 16 },
  addBtn: { backgroundColor: '#007AFF', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 10 },
  addText: { color: '#fff', fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginVertical: 6 },
  aiCard: { backgroundColor: '#E6F0FF', padding: 12, borderRadius: 12, marginBottom: 15 },
  aiTitle: { fontWeight: '700', fontSize: 16, marginBottom: 5 },
});
