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

  useEffect(() => {
    if (!user) return;

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

  if (!user) return <p>Loading user...</p>;

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
    <div className="p-8 bg-gradient-to-b from-blue-50 to-white rounded-3xl shadow-2xl max-w-2xl mx-auto mt-8">
    <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
      📋 Contact Lists
    </h2>
  
  <button
    onClick={handleCreateList}
    className="w-full py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-md hover:scale-105"
  >
    ➕ Create New List
  </button>
  
    <div className="mt-6 grid grid-cols-1 gap-4">
      {contactLists.length > 0 ? (
        contactLists.map((list) => (
          <div
            key={list.id}
            onClick={() => setSelectedListId(list.id)}
            className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all transform hover:scale-105 hover:shadow-2xl 
              ${
                selectedListId === list.id
                  ? "bg-blue-200 text-blue-800 font-semibold scale-105"
                  : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              📁 {list.name}
            </h3>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No contact lists found.</p>
      )}
    </div>
  
    {selectedListId && (
      <div className="mt-8 p-6 bg-white rounded-3xl shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📌 {contactLists.find((list) => list.id === selectedListId)?.name}
        </h3>
  
        {isEditing ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="New List Name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleUpdateListName}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md hover:scale-105"
            >
              ✅ Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:scale-105"
            >
              ❌ Cancel
            </button>
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
  
        <div className="flex gap-3 items-center mt-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400"
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
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md hover:scale-105"
          >
            ➕ Add
          </button>
        </div>
  
        <h3 className="text-lg font-semibold text-gray-800 mt-6">
          📜 Contacts in this list
        </h3>
        <ul className="mt-4 space-y-4">
          {getContactsForSelectedList(selectedListId).map((contact, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {contact.name.charAt(0)}
                </div>
                <div className="text-gray-700">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-gray-500 text-sm">{contact.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveContact(contact.email)}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
  
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
