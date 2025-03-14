import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createEvent } from "../../../services/event.services";
import { AppContext } from "../../store/app.context";
import AddParticipantsModal from "../AddParticipants/AddParticipants";
import { getAllUsers } from "../../../services/user.services";

export default function CreateEvent() {
  const [isPrivate, setIsPrivate] = useState(false);
  const { user } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const startDateFromParams = searchParams.get("startDate");
  const [event, setEvent] = useState({
    title: "",
    startDate: startDateFromParams ? `${startDateFromParams}T00:00` : "",
    endDate: "",
    description: "",
    participants: [user.uid], // Initialize with the creator's user ID
  });
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all users when the component mounts
    getAllUsers().then(setUsers);
  }, []);

  const handleCreateEvent = async (e) => {
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

    try {
      await createEvent(event.title, event.startDate, event.endDate, event.description, event.participants, isPrivate);
      alert('Event created successfully!');
      navigate("/calendar");
    } catch (err) {
      setError(err.message);
    }
  };

  const updateEvent = (prop) => (e) => {
    setEvent({
      ...event,
      [prop]: e.target.value,
    });
  };

  const handleAddParticipants = (participants) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      participants: participants.map((p) => p.uid),
    }));
  };

  const currentParticipants = event.participants.map((uid) => users.find((user) => user.uid === uid)).filter(Boolean);

  return (
    <div className="pt-16 pb-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 max-w-sm">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create Event</h2>

        <form onSubmit={handleCreateEvent} className="space-y-6">
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
                onChange={updateEvent("title")}
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
                onChange={updateEvent("startDate")}
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
                onChange={updateEvent("endDate")}
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
                onChange={updateEvent("description")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📝</span>
            </div>
          </div>
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
              Create Event
            </button>
            <button type="button" className="btn btn-secondary w-24" onClick={() => setIsModalOpen(true)}>
              Edit Participants
            </button>
            <button type="button" className="btn btn-outline w-24" onClick={() => navigate("/calendar")}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <AddParticipantsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddParticipants={handleAddParticipants}
        initialParticipants={currentParticipants}
        creatorId={user.uid}
      />
    </div>
  );
}