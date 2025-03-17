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
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Contact Lists</h2>
      <button
        onClick={handleCreateList}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create New List
      </button>
      <div className="mt-4">
        {contactLists.length > 0 ? (
          <ul>
            {contactLists.map((list) => (
              <li
                key={list.id}
                className="text-gray-700 cursor-pointer hover:underline"
                onClick={() => setSelectedListId(list.id)}
              >
                {list.name} {selectedListId === list.id && "(selected)"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No contact lists found.</p>
        )}
      </div>

      {selectedListId && (
        <div className="mt-4">
          <h3 className="text-md font-bold">
            Selected List:{" "}
            {contactLists.find((list) => list.id === selectedListId)?.name}
          </h3>

          {isEditing ? (
            <>
              <input
                type="text"
                placeholder="New List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="block p-2 border border-gray-300 rounded w-full mt-2"
              />
              <button
                onClick={handleUpdateListName}
                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Update List Name
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Edit List Name
            </button>
          )}

          <h3 className="text-md font-bold mt-4">Add Contact</h3>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="block p-2 border border-gray-300 rounded w-full mt-2"
          >
            <option value="">Select an existing user</option>
            {existingUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>

          <button
            onClick={handleAddContact}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Contact
          </button>

          <div className="mt-4">
            <h3 className="text-md font-bold">Contacts in this list</h3>
            <ul>
              {getContactsForSelectedList(selectedListId).map(
                (contact, index) => (
                  <li
                    key={index}
                    className="text-gray-700 flex justify-between items-center"
                  >
                    {contact.name} - {contact.email}
                    <button
                      onClick={() => handleRemoveContact(contact.email)}
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <button
            onClick={handleDeleteList}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete List
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
