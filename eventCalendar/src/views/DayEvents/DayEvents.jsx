import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserEvents, getEventById, removeEvent } from "../../../services/event.services";
import { format, parseISO } from "date-fns";
import { AppContext } from "../../store/app.context";
import { ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import { db } from "../../../src/config/firebase.config";

export default function DayEvents() {
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const [events, setEvents] = useState([]);
  const { user } = useContext(AppContext);
  const userId = user?.uid;
  const navigate = useNavigate();

  // Fetch events for the selected day
  useEffect(() => {
    const fetchEvents = async () => {
      const userEvents = await getUserEvents(userId);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const dayEvents = userEvents.filter((event) => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return eventStart < endOfDay && eventEnd > startOfDay;
      });
      setEvents(dayEvents.map((event) => ({ ...event, showDetails: false })));
    };
    fetchEvents();
  }, [date, userId]);

  // Toggle event details visibility
  const toggleEventDetails = (eventId) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, showDetails: !event.showDetails } : event
      )
    );
  };

  // Navigate to CreateEvent with pre-filled data
  const handleEditEvent = (eventId) => {
    navigate(`/create-event?eventId=${eventId}`);
  };

  // Implement delete functionality with recurrence check
  const handleDeleteEvent = async (eventId) => {
    const event = await getEventById(eventId);
    if (!event) {
      console.error("Event not found");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) {
      return;
    }

    if (event.seriesId) {
      const deleteAll = window.confirm("This is a recurring event. Delete all events in the series?");
      if (deleteAll) {
        // Delete all events in the series
        const seriesQuery = query(ref(db, "events"), orderByChild("seriesId"), equalTo(event.seriesId));
        const seriesSnapshot = await get(seriesQuery);
        const updates = {};
        seriesSnapshot.forEach((child) => {
          updates[`events/${child.key}`] = null;
        });
        await update(ref(db), updates);
        setEvents((prevEvents) => prevEvents.filter((e) => e.seriesId !== event.seriesId));
      } else {
        // Delete single event
        await removeEvent(eventId);
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
      }
    } else {
      // Delete single non-recurring event
      await removeEvent(eventId);
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
    }
  };

  return (
    <div className="p-8 body-bg font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigate('/calendar')}
            className="btn btn-outline"
          >
            Back to Calendar
          </button>
          <button
            onClick={() => navigate(`/create-event?startDate=${date}`)}
            className="btn btn-primary"
          >
            Create Event
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-8">Events for {format(new Date(date), "MMMM d, yyyy")}</h1>
        <div className="hourly-timeline">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="hour-slot">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{format(new Date().setHours(hour), "h:00 a")}</span>
                <span className="font-semibold">{format(new Date().setHours(hour + 1), "h:00 a")}</span>
              </div>
              {events
                .filter((event) => parseISO(event.startDate).getHours() === hour)
                .map((event) => (
                  <div key={event.id} className="event-block" onClick={() => toggleEventDetails(event.id)}>
                    <div className="event-title">{event.title}</div>
                    <div className="event-time">
                      {format(parseISO(event.startDate), "h:mm a")} - {format(parseISO(event.endDate), "h:mm a")}
                    </div>
                    <div className="event-icons">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event block onclick
                          handleEditEvent(event.id);
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732zM6 16a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      </svg>
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event block onclick
                          handleDeleteEvent(event.id);
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.818L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div className="event-details hidden">
                      <div className="event-description">{event.description}</div>
                      <div className="event-participants">
                        Participants: {event.participants.length}
                        <svg className="inline-block w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a3 3 0 00-6 0v1zm0 0H9v-1a2 2 0 014 0v1z" />
                        </svg>
                      </div>
                      {event.recurrence && (
                        <div className="event-recurrence">Recurrence: {event.recurrence.frequency}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}