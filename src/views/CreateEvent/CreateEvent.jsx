import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createEvent, updateEvent, getEventById, generateRecurringDates } from "../../../services/event.services";
import { AppContext } from "../../store/app.context";
import AddParticipantsModal from "../AddParticipants/AddParticipants";
import { getAllUsers } from "../../../services/user.services";
import { format, parseISO } from "date-fns";
import PropTypes from 'prop-types';
import { PATHS } from "../../config/paths";



// Validation Constants
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 30;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateEventPage() {
  const { user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
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

  useEffect(() => {
    if (eventId) {
      getEventById(eventId)
        .then((eventData) => {
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
      endDate.setFullYear(endDate.getFullYear() + 1);
      const dates = generateRecurringDates(
        event.startDate,
        event.recurrence.frequency,
        event.recurrence.interval,
        endDate
      ).slice(0, 12);
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-text mb-6">
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

    if (event.title.length < MIN_TITLE_LENGTH || event.title.length > MAX_TITLE_LENGTH) {
      setError(`The title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters!`);
      return;
    }

    if (new Date(event.startDate) >= new Date(event.endDate)) {
      setError("The start date must be before the end date!");
      return;
    }

    if (event.description.length < MIN_DESCRIPTION_LENGTH || event.description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`The description must be between ${MIN_DESCRIPTION_LENGTH} and ${MAX_DESCRIPTION_LENGTH} characters!`);
      return;
    }
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
        await updateEvent(eventId, event);
        alert("Event updated successfully!");
      } else {
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
      <div>
        <label className="block text-sm font-medium text-text" htmlFor="title">
          Title <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            className={`block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300 ${error && !event.title ? 'border-red-500' : ''}`}
            id="title"
            placeholder="Enter event title"
            value={event.title}
            onChange={updateEventField("title")}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text" htmlFor="startDate">
          Start Date <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="datetime-local"
            className={`block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300 ${error && !event.startDate ? 'border-red-500' : ''}`}
            id="startDate"
            value={event.startDate}
            onChange={updateEventField("startDate")}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text" htmlFor="endDate">
          End Date <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="datetime-local"
            className={`block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300 ${error && !event.endDate ? 'border-red-500' : ''}`}
            id="endDate"
            value={event.endDate}
            onChange={updateEventField("endDate")}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text" htmlFor="description">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300 ${error && !event.description ? 'border-red-500' : ''}`}
          id="description"
          placeholder="Enter event description"
          value={event.description}
          onChange={updateEventField("description")}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text">Recurrence Frequency</label>
        <select
          value={event.recurrence.frequency}
          onChange={(e) => setEvent({ ...event, recurrence: { ...event.recurrence, frequency: e.target.value } })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300"
        >
          <option value="">None</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      {event.recurrence.frequency && (
        <>
          <div>
            <label className="block text-sm font-medium text-text">Interval</label>
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-text">Preview of recurring dates:</h3>
            <ul className="mt-2 space-y-1">
              {previewDates.map((date, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {format(date, "MMMM d, yyyy")}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      <div className="flex items-center">
        <label className="block text-sm font-medium text-text mr-2" htmlFor="private">
          Private
        </label>
        <input
          type="checkbox"
          id="private"
          checked={isPrivate}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text">
          Current Participants
        </label>
        <ul className="mt-2 space-y-1">
          {currentParticipants.map((participant) => (
            <li key={participant.uid} className="text-sm text-gray-600">
              {participant.handle}
            </li>
          ))}
        </ul>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(PATHS.CALENDAR)}
          className="btn bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
        >
          Add Participants
        </button>
        <button
          type="submit"
          className="btn bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 transform hover:scale-105"
        >
          {eventId ? "Update" : "Create"}
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