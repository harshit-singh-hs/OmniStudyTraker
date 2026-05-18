import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { isToday, format } from 'date-fns';
import { auth, db } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const OmniContext = createContext();

export const useOmni = () => useContext(OmniContext);

export const OmniProvider = ({ children }) => {
  // --- DEFAULT BRANCHES ---
  const [branches, setBranches] = useState([]);

  // --- TASKS ---
  const [tasks, setTasks] = useState([]);

  // --- TESTS / MOCKS ---
  const [tests, setTests] = useState([]);

  // --- VISION BOARD ---
  const [countdowns, setCountdowns] = useState([]);
  const [macroGoals, setMacroGoals] = useState([]);
  const [projects, setProjects] = useState([]);

  // --- STREAK SYSTEM (DYNAMICALLY DERIVED FROM HEATMAP DATA) ---
  const streak = React.useMemo(() => {
    const completedDates = new Set(
      tasks
        .filter(t => t.done && t.completedAt)
        .map(t => format(new Date(t.completedAt), 'yyyy-MM-dd'))
    );

    let currentStreak = 0;
    const today = new Date();
    const checkDate = (date) => completedDates.has(format(date, 'yyyy-MM-dd'));

    if (checkDate(today)) {
      currentStreak = 1;
      let check = new Date(today);
      while (true) {
        check.setDate(check.getDate() - 1);
        if (checkDate(check)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (checkDate(yesterday)) {
        currentStreak = 1;
        let check = new Date(yesterday);
        while (true) {
          check.setDate(check.getDate() - 1);
          if (checkDate(check)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    return currentStreak;
  }, [tasks]);

  const [lastActivityDate, setLastActivityDate] = useState(null);

  // --- 90-DAY TRASH BIN ---
  const [trash, setTrash] = useState([]);

  // --- MIDNIGHT ROLLOVER LOGIC ---
  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    if (lastActivityDate && lastActivityDate !== todayStr) {
      setTasks(prev => prev.map(t => {
        if (t.type === 'daily' && t.done) {
          return { ...t, archived: true };
        }
        return t;
      }));
      setLastActivityDate(todayStr); 
    } else if (!lastActivityDate) {
      setLastActivityDate(todayStr);
    }
  }, [lastActivityDate]);

  // --- FIREBASE SYNC STATE & LOGIC ---
  const [user, setUser] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const isImporting = useRef(false);

  const getExportData = useCallback(() => {
    return { branches, tasks, tests, countdowns, macroGoals, projects, streak, trash, lastActivityDate };
  }, [branches, tasks, tests, countdowns, macroGoals, projects, streak, trash, lastActivityDate]);

  const importData = useCallback((data) => {
    isImporting.current = true;
    if (data.branches) setBranches(data.branches);
    if (data.tasks) setTasks(data.tasks);
    if (data.tests) setTests(data.tests);
    if (data.countdowns) setCountdowns(data.countdowns);
    if (data.macroGoals) setMacroGoals(data.macroGoals);
    if (data.projects) setProjects(data.projects);
    if (data.trash) setTrash(data.trash);
    if (data.lastActivityDate) setLastActivityDate(data.lastActivityDate);
    setTimeout(() => { isImporting.current = false; }, 1000);
  }, []);

  // Auth Listener
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect resolution error:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Pull from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
        importData(docSnap.data());
        setLastSynced(new Date());
      }
    });
    return () => unsubscribe();
  }, [user, importData]);

  // Auto Push to Firestore on local changes
  useEffect(() => {
    if (!user || isImporting.current) return;
    const syncData = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), getExportData(), { merge: true });
        setLastSynced(new Date());
      } catch (error) {
        console.error("Firebase sync failed:", error);
      }
    };
    const timeoutId = setTimeout(syncData, 2000);
    return () => clearTimeout(timeoutId);
  }, [getExportData, user]);

  const forceSync = async () => {
    if (!user) return false;
    try {
      await setDoc(doc(db, 'users', user.uid), getExportData(), { merge: true });
      setLastSynced(new Date());
      return true;
    } catch (e) {
      return false;
    }
  };

  // --- ACTIONS ---

  // Toggle Task Completion & Handle Streak
  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const isNowDone = !task.done;
        
        return { 
          ...task, 
          done: isNowDone,
          completedAt: isNowDone ? new Date().toISOString() : null
        };
      }
      return task;
    }));
  };

  const addTask = (newTask) => {
    // newTask includes { title, branchId, type, tentativeTime }
    setTasks([...tasks, { ...newTask, id: Date.now().toString(), done: false, completedAt: null, archived: false }]);
  };

  const editTaskTime = (taskId, newTimeMinutes) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, tentativeTime: newTimeMinutes } : t));
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Move to trash with a 90-day expiry
    const deletionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(deletionDate.getDate() + 90);

    setTrash([...trash, { 
      type: 'task', 
      data: taskToDelete, 
      deletedAt: deletionDate.toISOString(),
      expiresAt: expiryDate.toISOString() 
    }]);

    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Branch Actions (with Trash logic)
  const addBranch = (name, color) => {
    setBranches([...branches, { id: Date.now().toString(), name, color }]);
  };

  const deleteBranch = (branchId) => {
    const branchToDelete = branches.find(b => b.id === branchId);
    if (!branchToDelete) return;

    // Move to trash with a 90-day expiry timestamp
    const deletionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(deletionDate.getDate() + 90);

    setTrash([...trash, { 
      type: 'branch', 
      data: branchToDelete, 
      deletedAt: deletionDate.toISOString(),
      expiresAt: expiryDate.toISOString() 
    }]);

    // Remove from active branches
    setBranches(branches.filter(b => b.id !== branchId));
    // Optionally: also move all tasks associated with this branch to trash
  };

  const restoreFromTrash = (itemId) => {
    const itemToRestore = trash.find(i => i.data.id === itemId);
    if (!itemToRestore) return;

    if (itemToRestore.type === 'branch') {
      setBranches([...branches, itemToRestore.data]);
    }
    
    // Remove from trash
    setTrash(trash.filter(i => i.data.id !== itemId));
  };

  const permanentlyDeleteFromTrash = (itemId) => {
    setTrash(trash.filter(i => i.data.id !== itemId));
  };

  return (
    <OmniContext.Provider value={{
      branches, addBranch, deleteBranch,
      tasks, toggleTask, addTask, deleteTask, editTaskTime,
      streak,
      trash, restoreFromTrash, permanentlyDeleteFromTrash,
      tests, setTests,
      countdowns, setCountdowns,
      macroGoals, setMacroGoals,
      projects, setProjects,
      user, forceSync, lastSynced, getExportData, importData
    }}>
      {children}
    </OmniContext.Provider>
  );
};
