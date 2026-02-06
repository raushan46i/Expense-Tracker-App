import { useEffect, useState } from 'react';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBudgetAlerts = (
  budgets: Record<string, number>,
  expenses: any[]
) => {
  // We use State + Storage instead of Ref so memory survives crashes
  const [alertedCategories, setAlertedCategories] = useState<Set<string>>(new Set());
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // 1. Load Memory on App Start
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('alert_history');
        if (stored) {
          setAlertedCategories(new Set(JSON.parse(stored)));
        }
      } catch (e) {
        console.error("Failed to load alert history", e);
      } finally {
        setIsStorageLoaded(true);
      }
    };
    loadHistory();
  }, []);

  // 2. Check Budgets (Only runs after storage is loaded)
  useEffect(() => {
    if (!isStorageLoaded) return;

    const checkAndNotify = async () => {
      // A. Calculate Totals
      const categoryTotals: Record<string, number> = {};
      expenses.forEach(item => {
        const catName = typeof item.category === 'object' ? item.category.name : item.category;
        if (catName) {
          categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(item.amount);
        }
      });

      let hasChanges = false;
      const newAlerts = new Set(alertedCategories);

      // B. Check Limits
      for (const [category, limit] of Object.entries(budgets)) {
        const spent = categoryTotals[category] || 0;
        const numericLimit = Number(limit);

        // --- CASE 1: OVER BUDGET ---
        if (spent > numericLimit) {
          // If we haven't alerted yet...
          if (!newAlerts.has(category)) {

            // STEP 1: UPDATE MEMORY *IMMEDIATELY*
            // We save this BEFORE the notification. 
            // This guarantees that if the notification crashes the app, 
            // the loop will STOP on the next restart.
            newAlerts.add(category);
            hasChanges = true;

            // STEP 2: TRY TO NOTIFY
            try {
              await notifee.requestPermission();

              // We use a new channel ID 'budget_alerts_v3' to clear old settings
              const channelId = await notifee.createChannel({
                id: 'budget_alerts_v3',
                name: 'Budget Alerts',
                importance: AndroidImportance.HIGH,
              });

              await notifee.displayNotification({
                id: `alert-${category}`,
                title: '⚠️ Budget Exceeded',
                body: `You've spent ₹${spent} on ${category}. Limit: ₹${numericLimit}`,
                android: {
                  channelId,
                  // Using the icons you confirmed exist
                  smallIcon: 'ic_launcher_round',
                  largeIcon: 'ic_launcher',
                  pressAction: { id: 'default' },
                },
              });
            } catch (error) {
              console.log("Notification failed (Loop prevented by storage save):", error);
            }
          }
        }
        // --- CASE 2: UNDER BUDGET (RESET) ---
        else {
          if (newAlerts.has(category)) {
            newAlerts.delete(category);
            hasChanges = true;
          }
        }
      }

      // C. Persist Changes to Storage
      if (hasChanges) {
        setAlertedCategories(newAlerts);
        await AsyncStorage.setItem('alert_history', JSON.stringify(Array.from(newAlerts)));
      }
    };

    checkAndNotify();
  }, [budgets, expenses, isStorageLoaded]);
};