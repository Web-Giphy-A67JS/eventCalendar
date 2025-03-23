import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../store/app.context";
import { fetchEvents, removeEvent } from "../../../services/event.services";
import { Roles } from "../../../common/roles.enum";

export default function Events() {
  const { user, userData } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("allEvents");

  useEffect(() => {
    const loadEvents = async () => {
      const allEvents = await fetchEvents();
      setEvents(allEvents);
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const filtered =
      view === "myEvents" && user
        ? events.filter(
            (event) =>
              event.participants.includes(user.uid) &&
              event.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : events.filter(
            (event) =>
              (!user && !event.private) ||
              (userData?.role === Roles.admin || !event.private) &&
              event.title.toLowerCase().includes(searchTerm.toLowerCase())
          );

    setFilteredEvents(filtered);
  }, [view, searchTerm, events, user, userData]);

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (confirmDelete) {
      await removeEvent(eventId);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    }
  };

  return (
    <div className="p-8 mx-auto bg-gray-50 rounded-lg shadow-lg min-h-[700px] w-[1000px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-4">
          {user && (
            <button
              className={`btn ${
                view === "myEvents" ? "btn-primary" : "btn-outline"
              } btn-lg`}
              onClick={() => setView("myEvents")}
            >
              My Events
            </button>
          )}
          <button
            className={`btn ${
              view === "allEvents" ? "btn-primary" : "btn-outline"
            } btn-lg`}
            onClick={() => setView("allEvents")}
          >
            All Events
          </button>
        </div>
        <div className="w-full max-w-md">
          <input
            type="text"
            className="input input-bordered w-full bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Start:</span>{" "}
                {new Date(event.startDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">End:</span>{" "}
                {new Date(event.endDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Participants:</span>{" "}
                {event.participants.length}
              </p>
              <p
                className={`text-sm font-medium ${
                  event.private ? "text-red-500" : "text-green-500"
                }`}
              >
                {event.private ? "Private Event" : "Public Event"}
              </p>
              <div className="flex justify-between mt-4">
                {(userData?.role === Roles.admin ||
                  event.participants[0] === user?.uid) && (
                  <button className="btn btn-sm btn-outline btn-info">
                    Edit
                  </button>
                )}
                {(userData?.role === Roles.admin ||
                  event.participants[0] === user?.uid) && (
                  <button
                    className="btn btn-sm btn-outline btn-error"
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center col-span-full min-h-[400px]">
            <p className="text-gray-600 text-center">No events found.</p>
          </div>
        )}
      </div>
    </div>
  );
}