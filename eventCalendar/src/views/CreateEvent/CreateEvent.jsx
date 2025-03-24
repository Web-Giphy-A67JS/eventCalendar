import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createEvent, updateEvent, getEventById, generateRecurringDates } from "../../../services/event.services";
import { AppContext } from "../../store/app.context";
import AddParticipantsModal from "../AddParticipants/AddParticipants";
import { getAllUsers } from "../../../services/user.services";
import { format, parseISO } from "date-fns";
import PropTypes from 'prop-types';

export default function CreateEventPage() {
  const { user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId"); // Check if editing
  const startDateFromParams = searchParams.get("startDate");

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const [event, setEvent] = useState({
    title: "",
    startDate: startDateFromParams ? `${startDateFromParams}T00:00` : "",
    endDate: "",
    description: "",
    participants: [user.uid],
    private: false,
    recurrence: { frequency: "", interval: 1 },
  });
  const [error, setError] = useState("");
  const [previewDates, setPreviewDates] = useState([]);

  // Fetch event data for editing
  useEffect(() => {
    if (eventId) {
      getEventById(eventId)
        .then((eventData) => {
          // Format startDate and endDate for datetime-local
          const formattedStartDate = format(parseISO(eventData.startDate), "yyyy-MM-dd'T'HH:mm");
          const formattedEndDate = format(parseISO(eventData.endDate), "yyyy-MM-dd'T'HH:mm");
        setEvent({
          title: eventData.title,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          description: eventData.description,
          participants: eventData.participants,
          private: eventData.private,
          recurrence: eventData.recurrence || { frequency: "", interval: 1 },
        });
      }).catch((err) => setError("Failed to load event data: " + err.message));
    }
  }, [eventId]);

  const generatePreviewDates = () => {
    if (event.recurrence.frequency && event.startDate) {
      const endDate = new Date(event.startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // Preview up to 1 year
      const dates = generateRecurringDates(
        event.startDate,
        event.recurrence.frequency,
        event.recurrence.interval,
        endDate
      ).slice(0, 12); // Limit to 12 dates
      setPreviewDates(dates);
    } else {
      setPreviewDates([]);
    }
  };

  useEffect(() => {
    generatePreviewDates();
  }, [event.recurrence.frequency, event.recurrence.interval, event.startDate]);

  const currentParticipants = event.participants.map((uid) => users.find((user) => user.uid === uid)).filter(Boolean);

  return (
    <div className="pt-16 pb-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 max-w-sm">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {eventId ? "Edit Event" : "Create Event"}
        </h2>
        <EventForm
          event={event}
          setEvent={setEvent}
          isPrivate={event.private}
          setIsPrivate={(value) => setEvent({ ...event, private: value })}
          currentParticipants={currentParticipants}
          error={error}
          setError={setError}
          previewDates={previewDates}
          navigate={navigate}
          setIsModalOpen={setIsModalOpen}
          eventId={eventId}
        />
      </div>

      <AddParticipantsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddParticipants={(participants) => {
          setEvent((prevEvent) => ({
            ...prevEvent,
            participants: participants.map((p) => p.uid),
          }));
        }}
        initialParticipants={currentParticipants}
        creatorId={user.uid}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
}

function EventForm({
  event,
  setEvent,
  isPrivate,
  setIsPrivate,
  currentParticipants,
  error,
  setError,
  previewDates,
  navigate,
  setIsModalOpen,
  eventId,
}) {
  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setError("");

    if (event.title.length < 3 || event.title.length > 30) {
      setError("The title must be between 3 and 30 characters!");
      return;
    }

    if (new Date(event.startDate) >= new Date(event.endDate)) {
      setError("The start date must be before the end date!");
      return;
    }

    if (event.description.length < 10 || event.description.length > 500) {
      setError("The description must be between 10 and 500 characters!");
      return;
    }

    // Validation for recurrence settings
    const validateRecurrence = () => {
      if (event.recurrence.frequency) {
        if (!Number.isInteger(event.recurrence.interval) || event.recurrence.interval < 1) {
          setError("Interval must be a positive integer.");
          return false;
        }
        if (event.recurrence.interval > 100) {
          setError("Interval cannot exceed 100.");
          return false;
        }
      }
      return true;
    };

    if (!validateRecurrence()) {
      return;
    }

    try {
      if (eventId) {
        // Update existing event
        await updateEvent(eventId, event);
        alert("Event updated successfully!");
      } else {
        // Create new event
        await createEvent(
          event.title,
          event.startDate,
          event.endDate,
          event.description,
          event.participants,
          isPrivate,
          event.recurrence.frequency ? event.recurrence : null
        );
        alert("Event created successfully!");
      }
      navigate("/calendar");
    } catch (err) {
      setError(err.message);
    }
  };

  const updateEventField = (prop) => (e) => {
    setEvent({
      ...event,
      [prop]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleCreateOrUpdateEvent} className="space-y-6">
      {/* Title */}
      <div className="form-group">
        <label className="block text-lg font-medium text-gray-700" htmlFor="title">
          Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !event.title ? 'border-red-500' : ''}`}
            id="title"
            placeholder="Enter event title"
            value={event.title}
            onChange={updateEventField("title")}
            required
          />
          <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">🏷️</span>
        </div>
      </div>

      {/* Start Date */}
      <div className="form-group">
        <label className="block text-lg font-medium text-gray-700" htmlFor="startDate">
          Start Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !event.startDate ? 'border-red-500' : ''}`}
            id="startDate"
            value={event.startDate}
            onChange={updateEventField("startDate")}
            required
          />
          <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📅</span>
        </div>
      </div>

      {/* End Date */}
      <div className="form-group">
        <label className="block text-lg font-medium text-gray-700" htmlFor="endDate">
          End Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !event.endDate ? 'border-red-500' : ''}`}
            id="endDate"
            value={event.endDate}
            onChange={updateEventField("endDate")}
            required
          />
          <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📅</span>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="block text-lg font-medium text-gray-700" htmlFor="description">
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !event.description ? 'border-red-500' : ''}`}
            id="description"
            placeholder="Enter event description"
            value={event.description}
            onChange={updateEventField("description")}
            required
          />
          <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📝</span>
        </div>
      </div>

      {/* Recurrence Frequency */}
      <div>
        <label className="block text-lg font-medium text-gray-700">Recurrence Frequency</label>
        <select
          value={event.recurrence.frequency}
          onChange={(e) => setEvent({ ...event, recurrence: { ...event.recurrence, frequency: e.target.value } })}
          className="form-select w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">None</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Recurrence Interval */}
      {event.recurrence.frequency && (
        <>
          <div>
            <label className="block text-lg font-medium text-gray-700">Interval</label>
            <input
              type="number"
              value={event.recurrence.interval}
              onChange={(e) =>
                setEvent({
                  ...event,
                  recurrence: { ...event.recurrence, interval: parseInt(e.target.value) || 1 },
                })
              }
              min="1"
              className="form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium">Preview of recurring dates:</h3>
            <ul className="list-disc pl-5">
              {previewDates.map((date, index) => (
                <li key={index}>{format(date, "MMMM d, yyyy")}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Private event setting */}
      <div className="form-group flex items-center">
        <label className="block text-lg font-medium text-gray-700 mr-2" htmlFor="private">
          Private
        </label>
        <input
          type="checkbox"
          id="private"
          checked={isPrivate}
          className="form-checkbox text-indigo-600 focus:ring-indigo-500"
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
      </div>

      {/* Current Participants */}
      <div className="form-group">
        <label className="block text-lg font-medium text-gray-700">
          Current Participants
        </label>
        <ul className="list-disc pl-5">
          {currentParticipants.map((participant) => (
            <li key={participant.uid}>{participant.handle}</li>
          ))}
        </ul>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Buttons */}
      <div className="flex justify-between">
        <button type="submit" className="btn btn-primary w-24">
          {eventId ? "Update Edits" : "Create Event"}
        </button>
        <button type="button" className="btn btn-secondary w-24" onClick={() => setIsModalOpen(true)}>
          Edit Participants
        </button>
        <button type="button" className="btn btn-outline w-24" onClick={() => navigate("/calendar")}>
          Cancel
        </button>
      </div>
    </form>
  );
}

EventForm.propTypes = {
  event: PropTypes.object.isRequired,
  setEvent: PropTypes.func.isRequired,
  isPrivate: PropTypes.bool.isRequired,
  setIsPrivate: PropTypes.func.isRequired,
  currentParticipants: PropTypes.array.isRequired,
  error: PropTypes.string.isRequired,
  setError: PropTypes.func.isRequired,
  previewDates: PropTypes.array.isRequired,
  navigate: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  eventId: PropTypes.string,
};