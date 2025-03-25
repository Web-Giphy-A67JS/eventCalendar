import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../store/app.context";
import { fetchEvents, removeEvent } from "../../../services/event.services";
import { Roles } from "../../../common/roles.enum";
import EditEvent from "../EditEvent/EditEvent";

export default function Events() {
  const { user, userData } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("allEvents");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 

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

  const handleEdit = (event) => {
    setSelectedEvent(event); 
    setIsEditModalOpen(true); 
  };

  const handleSaveChanges = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setIsEditModalOpen(false); 
  };

  return (
    <div className="p-8 mx-auto bg-background rounded-xl shadow-lg min-h-[700px] min-w-[1000px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex space-x-2">
          {user && (
            <button
              className={`px-4 py-2 rounded-md font-medium transition duration-300 ease-in-out ${
                view === "myEvents"
                  ? "bg-primary text-white hover:bg-blue-600"
                  : "border border-gray-300 text-text hover:bg-gray-100"
              }`}
              onClick={() => setView("myEvents")}
            >
              My Events
            </button>
          )}
          <button
            className={`px-4 py-2 rounded-md font-medium transition duration-300 ease-in-out ${
              view === "allEvents"
                ? "bg-primary text-white hover:bg-blue-600"
                : "border border-gray-300 text-text hover:bg-gray-100"
            }`}
            onClick={() => setView("allEvents")}
          >
            All Events
          </button>
        </div>
        <div className="w-full md:w-auto md:min-w-[300px]">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition duration-300"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="event-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
            >
              <h3 className="text-lg font-semibold text-text mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Start:</span>{" "}
                {new Date(event.startDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">End:</span>{" "}
                {new Date(event.endDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
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
              <div className="flex justify-end mt-4 space-x-2">
                {(userData?.role === Roles.admin ||
                  event.participants[0] === user?.uid) && (
                  <button
                    className="bg-primary text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
                    onClick={() => handleEdit(event)}
                  >
                    Edit
                  </button>
                )}
                {(userData?.role === Roles.admin ||
                  event.participants[0] === user?.uid) && (
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
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
            <p className="text-gray-600">No events found.</p>
          </div>
        )}
      </div>

      {isEditModalOpen && selectedEvent && (
        <EditEvent
          event={selectedEvent}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
}