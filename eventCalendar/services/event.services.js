import { ref, push, get, remove, update, set, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../src/config/firebase.config";

const saveEventWithRetry = async (eventData, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const newEventRef = push(ref(db, "events"));
      await set(newEventRef, eventData);
      return newEventRef.key;
    } catch (error) {
      if (i === retries - 1) {
        throw new Error("Failed to save event after retries: " + error.message);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
};

export const createEvent = async (
  title,
  startDate,
  endDate,
  description,
  participants,
  isPrivate,
  recurrence
) => {
  const duration = new Date(endDate) - new Date(startDate);
  const seriesId = recurrence ? push(ref(db, "events")).key : null;

  if (recurrence?.frequency) {
    const recurrenceEndDate = new Date(startDate);
    recurrenceEndDate.setFullYear(recurrenceEndDate.getFullYear() + 1); // Default 1 year
    const dates = generateRecurringDates(startDate, recurrence.frequency, recurrence.interval, recurrenceEndDate);

    const savePromises = dates.map((date) => {
      const eventData = {
        title,
        startDate: date.toISOString(),
        endDate: new Date(date.getTime() + duration).toISOString(),
        description,
        participants,
        private: isPrivate,
        recurrence,
        seriesId,
        owner: participants[0],
      };
      return saveEventWithRetry(eventData);
    });
    await Promise.all(savePromises);
  } else {
    const eventData = {
      title,
      startDate,
      endDate,
      description,
      participants,
      private: isPrivate,
      recurrence: null,
      seriesId: null,
      owner: participants[0],
    };
    await saveEventWithRetry(eventData);
  }
};

export const generateRecurringDates = (startDate, frequency, interval = 1, endDate) => {
  const dates = [];
  let date = new Date(startDate);

  while (date <= endDate) {
    dates.push(new Date(date));
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7 * interval);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + interval);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + interval);
        break;
      default:
        return dates;
    }
  }
  return dates;
};

export const fetchEvents = async () => {
  const snapshot = await get(ref(db, "events"));
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, event]) => ({
      id,
      ...event,
    }));
  }
  return [];
};

export const updateEvent = async (eventId, updatedEvent) => {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    const snapshot = await get(eventRef);
    const event = snapshot.val();

    if (event.seriesId) {
      // Update all events in the series
      const seriesQuery = query(ref(db, "events"), orderByChild("seriesId"), equalTo(event.seriesId));
      const seriesSnapshot = await get(seriesQuery);
      const updates = {};
      seriesSnapshot.forEach((child) => {
        updates[`events/${child.key}`] = updatedEvent;
      });
      await update(ref(db), updates);
    } else {
      // Update single event
      await update(eventRef, updatedEvent);
    }
    console.log(`Event with ID ${eventId} updated successfully.`);
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw error;
  }
};

export const removeEvent = async (eventId) => {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    await remove(eventRef);
    console.log(`Event with ID ${eventId} was successfully deleted.`);
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
  }
};

export const getEventById = async (eventId) => {
  const eventRef = ref(db, `events/${eventId}`);
  const snapshot = await get(eventRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Added function to fetch user-specific events
export const getUserEvents = async (userId) => {
  try {
    const snapshot = await get(ref(db, "events"));
    if (snapshot.exists()) {
      const allEvents = snapshot.val();
      return Object.entries(allEvents)
        .filter(([, event]) => event.participants && event.participants.includes(userId))
        .map(([id, event]) => ({ id, ...event }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    return [];
  }
};