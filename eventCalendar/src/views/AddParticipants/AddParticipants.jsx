import { useState, useEffect } from "react";
import { getAllUsers } from "../../../services/user.services";
import { getUserContactLists, getContactsFromList } from "../../../services/user.services"; 

export default function AddParticipantsModal({ isOpen, onClose, onAddParticipants, initialParticipants, creatorId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(initialParticipants || []);

  const [contactLists, setContactLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [listContacts, setListContacts] = useState([]);
  
  useEffect(() => {
      if (isOpen) {
        getAllUsers().then(setUsers);

          getUserContactLists(creatorId).then(setContactLists);
      }
  }, [isOpen]);
  
  const handleSelectContactList = async (listId) => {
      setSelectedList(listId);
      const contacts = await getContactsFromList(listId);
      setListContacts(contacts);
  };
  
  const handleAddContactFromList = (contact) => {
      const user = users.find(u => u.email === contact.email);
      if (user && !selectedUsers.some(u => u.uid === user.uid)) {
          setSelectedUsers(prev => [...prev, user]);
      }
  };
  
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
  <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
    <h2 className="text-xl font-semibold mb-3">Add Participants</h2>

    <input
      type="text"
      className="form-input w-full p-2 border border-gray-300 rounded-lg mb-3"
      placeholder="Search for users"
      value={searchTerm}
      onChange={handleSearchChange}
    />

    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Invite from Contact List</h3>
        <select 
          className="form-select w-full p-2 border border-gray-300 rounded-lg mb-2"
          onChange={(e) => handleSelectContactList(e.target.value)}
        >
          <option value="">Select Contact List</option>
          {contactLists.map(list => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>

        <ul className="max-h-[150px] overflow-y-auto border border-gray-200 rounded-lg p-2">
          {listContacts.map((contact) => (
            <li key={contact.email} className="flex justify-between items-center text-sm mb-1">
              <span>{contact.name}</span>
              <button 
                className={`btn btn-xs ${selectedUsers.some(u => u.email === contact.email) ? 'bg-gray-400' : 'btn-secondary'}`}
                onClick={() => handleAddContactFromList(contact)}
                disabled={selectedUsers.some(u => u.email === contact.email)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">All Users</h3>
        <ul className="max-h-[150px] overflow-y-auto border border-gray-200 rounded-lg p-2">
          {filteredUsers.map((user) => (
            <li key={user.uid} className="flex justify-between items-center text-sm mb-1">
              <span>{user.handle}</span>
              <button
                className={`btn btn-xs ${selectedUsers.some(u => u.uid === user.uid) ? 'bg-gray-400' : 'btn-secondary'}`}
                onClick={() => handleUserSelect(user)}
                disabled={selectedUsers.some(u => u.uid === user.uid)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">Selected Participants</h3>
      <ul className="max-h-[100px] overflow-y-auto border border-gray-200 rounded-lg p-2">
        {selectedUsers.map((user) => (
          <li key={user.uid} className="flex justify-between items-center text-sm mb-1">
            <span>{user.handle}</span>
            <button 
              className="btn btn-xs bg-red-500 text-white"
              onClick={() => handleRemoveUser(user)}
              disabled={user.uid === creatorId}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>

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