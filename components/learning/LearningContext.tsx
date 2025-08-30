"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

// --- Types ---
interface CourseProgress {
  courseId: string;
  completedLessons: Set<string>;
  lastViewedLesson?: string;
}

interface LearningState {
  progress: Record<string, CourseProgress>; // Keyed by courseId
  isInitialized: boolean;
}

type LearningAction =
  | { type: 'INITIALIZE_PROGRESS'; payload: CourseProgress[] }
  | { type: 'START_COURSE'; payload: { courseId: string } }
  | { type: 'TOGGLE_LESSON_COMPLETION'; payload: { courseId: string; lessonId: string } }
  | { type: 'SET_LAST_VIEWED'; payload: { courseId: string; lessonId: string } };

// --- Context ---
const LearningContext = createContext<{
  state: LearningState;
  dispatch: React.Dispatch<LearningAction>;
} | undefined>(undefined);

// --- Reducer ---
function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case 'INITIALIZE_PROGRESS':
      const initialProgress = action.payload.reduce((acc, p) => {
        acc[p.courseId] = { ...p, completedLessons: new Set(p.completedLessons) };
        return acc;
      }, {} as Record<string, CourseProgress>);
      return { ...state, progress: initialProgress, isInitialized: true };

    case 'START_COURSE':
      if (state.progress[action.payload.courseId]) {
        return state; // Already started
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.courseId]: {
            courseId: action.payload.courseId,
            completedLessons: new Set(),
          },
        },
      };
    case 'TOGGLE_LESSON_COMPLETION':
      const courseProgress = state.progress[action.payload.courseId];
      if (!courseProgress) return state;

      const newCompletedLessons = new Set(courseProgress.completedLessons);
      if (newCompletedLessons.has(action.payload.lessonId)) {
        newCompletedLessons.delete(action.payload.lessonId);
      } else {
        newCompletedLessons.add(action.payload.lessonId);
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.courseId]: {
            ...courseProgress,
            completedLessons: newCompletedLessons,
          },
        },
      };
    case 'SET_LAST_VIEWED':
        const currentCourse = state.progress[action.payload.courseId];
        if (!currentCourse) return state;
        return {
            ...state,
            progress: {
                ...state.progress,
                [action.payload.courseId]: {
                    ...currentCourse,
                    lastViewedLesson: action.payload.lessonId,
                }
            }
        }
    default:
      return state;
  }
}

// --- Provider ---
export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(learningReducer, { progress: {}, isInitialized: false });

  // Fetch initial progress from the database
  useEffect(() => {
    if (user && !state.isInitialized) {
      fetch('/api/learning/progress')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            dispatch({ type: 'INITIALIZE_PROGRESS', payload: data });
          }
        })
        .catch(err => console.error("Failed to fetch learning progress:", err));
    }
  }, [user, state.isInitialized]);

  // Persist progress changes to the database
  useEffect(() => {
    if (user && state.isInitialized) {
        // This effect will run whenever state.progress changes.
        // We can iterate over the progress and save it to the DB.
        Object.values(state.progress).forEach(p => {
            fetch(`/api/learning/progress/${p.courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: p.courseId,
                    completedLessons: Array.from(p.completedLessons),
                    lastViewedLesson: p.lastViewedLesson,
                }),
            }).catch(err => console.error(`Failed to save progress for course ${p.courseId}:`, err));
        });
    }
  }, [user, state.progress, state.isInitialized]);

  return (
    <LearningContext.Provider value={{ state, dispatch }}>
      {children}
    </LearningContext.Provider>
  );
}

// --- Hook ---
export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
