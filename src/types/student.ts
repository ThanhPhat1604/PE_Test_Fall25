export interface StudySession {
  id: string;
  course: string;
  duration: number;
  date: string;
  completed: boolean;
  notes?: string;
}
