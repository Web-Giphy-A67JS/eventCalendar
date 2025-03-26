import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  getUserContactLists,
  createContactList,
  addContactToList,
  updateContactList,
  deleteContactList,
  removeContactFromList,
  getAllUsers,
} from "../../../services/user.services"; 

const ContactList = ({ user }) => {
  const [contactLists, setContactLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [existingUsers, setExistingUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return <p>Loading user...</p>;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const lists = await getUserContactLists(user.uid);
        setContactLists(lists || []);

        const users = await getAllUsers();
        setExistingUsers(users || []);
      } catch (error) {
        console.error("Error fetching contact lists or users:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleCreateList = async () => {
    if (!user?.uid) return;
    try {
      const newList = await createContactList(user.uid, "New Contact List");
      setContactLists((prevLists) => [...prevLists, newList]);
    } catch (error) {
      console.error("Error creating contact list:", error);
    }
  };

  const handleAddContact = async () => {
    if (!selectedListId || !selectedUserId) {
      alert("Please select a list and a user to add.");
      return;
    }

    const selectedUser = existingUsers.find(
      (user) => user.id === selectedUserId
    );

    if (!selectedUser) {
      alert("Selected user not found.");
      console.error("User not found:", selectedUserId);
      return;
    }

    try {
      await addContactToList(selectedListId, {
        name: selectedUser.firstName + " " + selectedUser.lastName,
        email: selectedUser.email,
      });
      alert("Contact added successfully!");

      const updatedLists = await getUserContactLists(user.uid);
      setContactLists(updatedLists || []);
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleRemoveContact = async (contactEmail) => {
    if (!selectedListId) return;

    try {
      await removeContactFromList(selectedListId, contactEmail);
      alert("Contact removed successfully!");

      const updatedLists = await getUserContactLists(user.uid);
      setContactLists(updatedLists || []);
    } catch (error) {
      console.error("Error removing contact:", error);
    }
  };

  const handleUpdateListName = async () => {
    if (!selectedListId || !newListName) return;
    try {
      await updateContactList(selectedListId, { name: newListName });
      setContactLists((prevLists) =>
        prevLists.map((list) =>
          list.id === selectedListId ? { ...list, name: newListName } : list
        )
      );
      setNewListName("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating list name:", error);
    }
  };

  const handleDeleteList = async () => {
    if (!selectedListId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact list?"
    );
    if (confirmDelete) {
      try {
        await deleteContactList(selectedListId);
        setContactLists(
          contactLists.filter((list) => list.id !== selectedListId)
        );
        setSelectedListId(null);
        alert("Contact list deleted successfully!");
      } catch (error) {
        console.error("Error deleting contact list:", error);
      }
    }
  };

  const getContactsForSelectedList = (listId) => {
    const selectedList = contactLists.find((list) => list.id === listId);
    return selectedList && selectedList.contacts ? selectedList.contacts : [];
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Contact Lists</h2>
      
      <button
        onClick={handleCreateList}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md hover:scale-105"
      >
        ➕ Create New List
      </button>

      <div className="mt-6">
        {contactLists.length > 0 ? (
          <ul className="space-y-2">
            {contactLists.map((list) => (
              <li
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`cursor-pointer px-4 py-2 rounded-lg transition-all 
                  ${
                    selectedListId === list.id
                      ? "bg-blue-100 text-blue-600 font-semibold shadow-md"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {list.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No contact lists found.</p>
        )}
      </div>

      {selectedListId && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">
            Selected List: {contactLists.find((list) => list.id === selectedListId)?.name}
          </h3>

          {isEditing ? (
            <div className="mt-3">
              <input
                type="text"
                placeholder="New List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpdateListName}
                  className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md hover:scale-105"
                >
                  ✅ Update
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:scale-105"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md hover:scale-105"
            >
              ✏️ Edit List Name
            </button>
          )}

          <h3 className="text-lg font-semibold text-gray-800 mt-6">👥 Add Contact</h3>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a user</option>
            {existingUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>

          <button
            onClick={handleAddContact}
            className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md hover:scale-105"
          >
            ➕ Add Contact
          </button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">📜 Contacts in this list</h3>
            <ul className="mt-2 space-y-3">
              {getContactsForSelectedList(selectedListId).map((contact, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="text-gray-700">
                    {contact.name} - <span className="text-gray-500">{contact.email}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(contact.email)}
                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all shadow-md"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleDeleteList}
            className="mt-6 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md hover:scale-105"
          >
            🗑 Delete List
          </button>
        </div>
      )}
    </div>
  );
};

ContactList.propTypes = {
  user: PropTypes.object.isRequired,
};
export default ContactList;
