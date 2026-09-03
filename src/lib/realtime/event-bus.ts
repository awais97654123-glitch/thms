/**
 * Scoped Real-Time Event Bus for School ERP
 * Broadcasts academic events across Admin, Teacher, and Student portals.
 */

export type RealtimeEventType =
  | 'CLASS_UPDATED'
  | 'HOMEWORK_CREATED'
  | 'HOMEWORK_UPDATED'
  | 'HOMEWORK_SUBMITTED'
  | 'TEST_CREATED'
  | 'TEST_UPDATED'
  | 'TEST_SUBMITTED'
  | 'MARKS_UPDATED'
  | 'ATTENDANCE_UPDATED'
  | 'TIMETABLE_UPDATED'
  | 'TEACHER_ASSIGNMENT_UPDATED'
  | 'ANNOUNCEMENT_CREATED';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  studentId?: string;
  timestamp: string;
  data?: any;
}

// In-memory event registry for server actions and SSE listeners
type EventListener = (event: RealtimeEventPayload) => void;
const listeners: Set<EventListener> = new Set();

/**
 * Dispatches a real-time academic event
 */
export function emitRealtimeEvent(
  type: RealtimeEventType,
  details: Omit<RealtimeEventPayload, 'type' | 'timestamp'>
) {
  const payload: RealtimeEventPayload = {
    type,
    timestamp: new Date().toISOString(),
    ...details,
  };

  // Notify registered local listeners
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (err) {
      console.error('Realtime listener error:', err);
    }
  });

  return payload;
}

/**
 * Subscribes to real-time events with filtering and automatic cleanup
 */
export function subscribeToRealtimeEvents(
  listener: EventListener,
  filter?: (event: RealtimeEventPayload) => boolean
): () => void {
  const wrappedListener: EventListener = (event) => {
    if (!filter || filter(event)) {
      listener(event);
    }
  };

  listeners.add(wrappedListener);
  return () => {
    listeners.delete(wrappedListener);
  };
}
