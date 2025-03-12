import { useState, useEffect } from "react";
import { getAllUsers } from "../../../services/user.services";

export default function AddParticipantsModal({ isOpen, onClose, onAddParticipants, initialParticipants, creatorId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(initialParticipants || []);

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then(setUsers);
    }
  }, [isOpen]);

  useEffect(() => {
    // Ensure the creator is always in the selected users list
    if (!selectedUsers.some((u) => u.uid === creatorId)) {
      const creator = users.find((user) => user.uid === creatorId);
      if (creator) {
        setSelectedUsers((prevSelected) => [...prevSelected, creator]);
      }
    }
  }, [users, creatorId, selectedUsers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSelect = (user) => {
    if (!selectedUsers.some((u) => u.uid === user.uid)) {
      setSelectedUsers((prevSelected) => [...prevSelected, user]);
    }
  };

  const handleRemoveUser = (user) => {
    if (user.uid !== creatorId) {
      setSelectedUsers((prevSelected) => prevSelected.filter((u) => u.uid !== user.uid));
    }
  };

  const handleAddParticipants = () => {
    onAddParticipants(selectedUsers);
    onClose();
  };

  const filteredUsers = users.filter((user) =>
    user.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Add Participants</h2>
        <input
          type="text"
          className="form-input w-full p-3 border border-gray-300 rounded-lg mb-4 bg-white"
          placeholder="Search for users"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Selected Participants</h3>
          <ul className="max-h-24 overflow-y-auto">
            {selectedUsers.map((user) => (
              <li key={user.uid} className="flex justify-between items-center mb-2">
                <span>{user.handle}</span>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleRemoveUser(user)}
                  disabled={user.uid === creatorId}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ul className="max-h-60 overflow-y-auto">
          {filteredUsers.map((user) => (
            <li key={user.uid} className="flex justify-between items-center mb-2">
              <span>{user.handle}</span>
              <button
                className="btn btn-secondary"
                onClick={() => handleUserSelect(user)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button className="btn btn-outline mr-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddParticipants}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}