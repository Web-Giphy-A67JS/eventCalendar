import { useState, useEffect } from "react";
import AddParticipantsModal from "../AddParticipants/AddParticipants";
import { getParticipantsDetails } from "../../../services/user.services";
import { updateEvent } from "../../../services/event.services";

export default function EditEvent({ event, onClose, onSave }) {
  const [startDate, setStartDate] = useState(event.startDate);
  const [endDate, setEndDate] = useState(event.endDate);
  const [description, setDescription] = useState(event.description);
  const [participants, setParticipants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      const participantDetails = await getParticipantsDetails(event.participants);
      setParticipants(participantDetails);
    };

    fetchParticipants();
  }, [event.participants]);

  const handleSave = async () => {
    try {
      const updatedEvent = {
        ...event,
        startDate,
        endDate,
        description,
        participants: participants.map((p) => p.uid),
      };

      await updateEvent(event.id, updatedEvent);

      onSave(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleAddParticipants = (newParticipants) => {
    const creator = participants.find((p) => p.uid === event.participants[0]);
    const updatedParticipants = [
      creator,
      ...newParticipants.filter((p) => p.uid !== creator.uid),
    ];
    setParticipants(updatedParticipants);
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              className="form-input w-full bg-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              className="form-input w-full bg-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="form-input w-full bg-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Participants
            </label>
            <ul className="list-disc pl-5">
              {participants.map((participant) => (
                <li key={participant.uid}>{participant.handle}</li>
              ))}
            </ul>
            <button
              className="btn btn-secondary mt-2"
              onClick={() => setIsModalOpen(true)}
            >
              Edit Participants
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn btn-outline mr-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      {isModalOpen && (
        <AddParticipantsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddParticipants={handleAddParticipants}
          initialParticipants={participants}
          creatorId={event.participants[0]}
        />
      )}
    </div>
  );
}