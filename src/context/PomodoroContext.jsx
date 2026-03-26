import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);
  const XP_PER_LEVEL = 100;

  const awardXP = useCallback(async (minutes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const xpAmount = minutes; // 1 min = 1 XP

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      let newXp = profile.xp + xpAmount;
      let newLevel = profile.level;

      // Logique de Level Up
      while (newXp >= XP_PER_LEVEL) {
        newLevel += 1;
        newXp -= XP_PER_LEVEL;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', user.id);

      if (updateError) throw updateError;

      window.dispatchEvent(new CustomEvent('profileUpdated'));
      alert(`✨ Session terminée ! +${xpAmount} XP gagnés.`);
    } catch (error) {
      console.error('Erreur lors du gain XP Pomodoro:', error.message);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      awardXP(initialDuration);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, initialDuration, awardXP]);

  const startPomodoro = (minutes) => {
    const seconds = minutes * 60;
    setInitialDuration(minutes);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const stopPomodoro = () => {
    setIsActive(false);
    setTimeLeft(0);
    setInitialDuration(0);
  };

  return (
    <PomodoroContext.Provider value={{ 
      timeLeft, 
      isActive, 
      initialDuration, 
      startPomodoro, 
      stopPomodoro 
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => useContext(PomodoroContext);
