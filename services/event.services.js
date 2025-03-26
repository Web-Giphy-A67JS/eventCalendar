import { ref, push, get, remove, update, set, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../src/config/firebase.config";

/**
 * Saves an event to the database with a retry mechanism.
 *
 * @async
 * @function saveEventWithRetry
 * @param {Object} eventData - The event data to be saved.
 * @param {number} [retries=3] - The number of retry attempts in case of failure.
 * @returns {Promise<string>} - A promise that resolves to the key of the newly saved event.
 * @throws {Error} - Throws an error if all retry attempts fail.
 */
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

/**
 * Creates an event and saves it to the database. Supports recurring events.
 *
 * @async
 * @function createEvent
 * @param {string} title - The title of the event.
 * @param {string} startDate - The start date and time of the event in ISO format.
 * @param {string} endDate - The end date and time of the event in ISO format.
 * @param {string} description - A description of the event.
 * @param {string[]} participants - An array of participant IDs for the event.
 * @param {boolean} isPrivate - Indicates whether the event is private.
 * @param {Object} [recurrence] - Recurrence details for the event.
 * @param {string} [recurrence.frequency] - The frequency of recurrence (e.g., "daily", "weekly").
 * @param {number} [recurrence.interval] - The interval between recurrences.
 * @returns {Promise<void>} Resolves when the event(s) have been successfully saved.
 */
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
    recurrenceEndDate.setFullYear(recurrenceEndDate.getFullYear() + 1);
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

/**
 * Generates an array of recurring dates based on the specified frequency and interval.
 *
 * @param {Date|string} startDate - The starting date of the recurrence. Can be a Date object or a string parsable by the Date constructor.
 * @param {string} frequency - The frequency of recurrence. Supported values are "weekly", "monthly", and "yearly".
 * @param {number} [interval=1] - The interval between recurrences. Defaults to 1.
 * @param {Date|string} endDate - The ending date of the recurrence. Can be a Date object or a string parsable by the Date constructor.
 * @returns {Date[]} An array of Date objects representing the recurring dates.
 */
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

/**
 * Updates an event in the database. If the event is part of a series, updates all events in the series
 * based on the recurrence pattern and new event data.
 *
 * @async
 * @function updateEvent
 * @param {string} eventId - The unique identifier of the event to update.
 * @param {Object} updatedEventData - The updated data for the event.
 * @param {string} updatedEventData.startDate - The new start date of the event in ISO format.
 * @param {string} updatedEventData.endDate - The new end date of the event in ISO format.
 * @param {string} [updatedEventData.title] - The new title of the event.
 * @param {string} [updatedEventData.description] - The new description of the event.
 * @param {Object} [updatedEventData.recurrence] - The recurrence pattern for the event series.
 * @param {string} [updatedEventData.recurrence.frequency] - The frequency of the recurrence (e.g., "daily", "weekly").
 * @param {number} [updatedEventData.recurrence.interval] - The interval between recurrences.
 * @throws {Error} Throws an error if the event is not found or if there is an issue updating the database.
 */
export const updateEvent = async (eventId, updatedEventData) => {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    const snapshot = await get(eventRef);
    const originalEvent = snapshot.val();

    if (!originalEvent) throw new Error("Event not found");

    if (originalEvent.seriesId) {
      const newStartDate = new Date(updatedEventData.startDate);
      const newEndDate = new Date(updatedEventData.endDate);
      const newDurationMs = newEndDate - newStartDate;

      const recurrence = updatedEventData.recurrence || originalEvent.recurrence;
      const interval = recurrence.interval || 1;
      const frequency = recurrence.frequency;

      const seriesQuery = query(ref(db, "events"), orderByChild("seriesId"), equalTo(originalEvent.seriesId));
      const seriesSnapshot = await get(seriesQuery);

      const updates = {};
      let eventIndex = 0;
      seriesSnapshot.forEach((child) => {
        const currentEvent = child.val();

        const timeOffset = eventIndex * interval * getFrequencyMs(frequency);
        const newStartDateForEvent = new Date(newStartDate.getTime() + timeOffset);
        const newEndDateForEvent = new Date(newStartDateForEvent.getTime() + newDurationMs);

        updates[`events/${child.key}`] = {
          ...currentEvent,
          startDate: newStartDateForEvent.toISOString(),
          endDate: newEndDateForEvent.toISOString(),
          title: updatedEventData.title,
          description: updatedEventData.description,
          recurrence: recurrence,
        };
        eventIndex++;
      });
      await update(ref(db), updates);
    } else {
      await update(eventRef, updatedEventData);
    }
    console.log(`Event ${eventId} updated successfully.`);
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

const getFrequencyMs = (frequency) => {
  switch (frequency) {
    case "daily": return 1000 * 60 * 60 * 24;
    case "weekly": return 1000 * 60 * 60 * 24 * 7;
    case "monthly": return 1000 * 60 * 60 * 24 * 30;
    case "yearly": return 1000 * 60 * 60 * 24 * 365;
    default: throw new Error("Unknown frequency");
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

/**
 * Retrieves the events associated with a specific user.
 *
 * @async
 * @function getUserEvents
 * @param {string} userId - The ID of the user whose events are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of event objects
 *                                   where the user is a participant. Each event object
 *                                   includes its ID and other event details.
 * @throws Will log an error to the console if there is an issue fetching the events.
 */
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