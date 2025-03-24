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
    <div className="p-12 bg-gray-50 min-h-screen min-h-[700px] w-[1000px]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/calendar')}
            className="btn btn-outline btn-sm"
          >
            Back to Calendar
          </button>
          <button
            onClick={() => navigate(`/create-event?startDate=${date}`)}
            className="btn btn-primary btn-sm"
          >
            Create Event
          </button>
        </div>
  
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Events for {format(new Date(date), "MMMM d, yyyy")}
        </h1>
  
        {/* Hourly Timeline */}
        <div className="space-y-4">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="border-b border-gray-200 pb-4">
              {/* Hour Slot */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {format(new Date().setHours(hour), "h:00 a")}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {format(new Date().setHours(hour + 1), "h:00 a")}
                </span>
              </div>
  
              {/* Events for the Hour */}
              <div className="space-y-2">
                {events
                  .filter((event) => parseISO(event.startDate).getHours() === hour)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => toggleEventDetails(event.id)}
                    >
                      {/* Event Title */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {event.title}
                        </h3>
                        <div className="flex space-x-2">
                          {/* Edit Icon */}
                          <svg
                            className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event block onclick
                              handleEditEvent(event.id);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732zM6 16a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                            />
                          </svg>
                          {/* Delete Icon */}
                          <svg
                            className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event block onclick
                              handleDeleteEvent(event.id);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.818L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </div>
                      </div>
  
                      {/* Event Time */}
                      <p className="text-sm text-gray-600">
                        {format(parseISO(event.startDate), "h:mm a")} -{" "}
                        {format(parseISO(event.endDate), "h:mm a")}
                      </p>
  
                      {/* Event Details */}
                      {event.showDetails && (
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{event.description}</p>
                          <p className="mt-1">
                            <span className="font-medium">Participants:</span>{" "}
                            {event.participants.length}
                          </p>
                          {event.recurrence && (
                            <p className="mt-1">
                              <span className="font-medium">Recurrence:</span>{" "}
                              {event.recurrence.frequency}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}