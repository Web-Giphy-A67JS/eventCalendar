import { ref, push, get, remove, update } from "firebase/database";
import { db } from "../src/config/firebase.config";

export const createEvent = async (title, startDate, endDate, description, participants, isPrivate) => {
    try {
      const eventsRef = ref(db, "events");
      await push(eventsRef, {
        title,
        startDate,
        endDate,
        description,
        participants,
        private: isPrivate
      });
      console.log("The event was created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
    }
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
 * Updates an event in the database
 * 
 * @param {string} eventId - Event ID
 * @param {Object} updatedEvent - Updated event data
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, updatedEvent) => {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    await update(eventRef, updatedEvent);
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