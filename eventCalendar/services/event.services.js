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

//   Events must have an id, title, a start date and hour, an end date and hour, and a list of invited participants (the list should contain only the event creator if it’s a private event with no other participants).

// o Title must be between 3 and 30 symbols.

// o An event must have at least one participant (the creator).

// o Events must have an option to be a part of a series of reoccurring events.

// o Events should be public or private.