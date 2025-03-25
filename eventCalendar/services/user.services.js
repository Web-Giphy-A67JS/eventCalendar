import { get, set, ref, query, equalTo, orderByChild, update, remove, push } from 'firebase/database';
import { db } from '../src/config/firebase.config';

/**
 * Retrieves user data by handle
 * 
 * @param {string} handle - User handle to look up
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserByHandle = async (handle) => {

   const snapshot = await get(ref(db, `users/${handle}`));
   if(snapshot.exists){
     return snapshot.val();
   }

};

/**
 * Creates a new user record
 * 
 * @param {string} handle - User handle
 * @param {string} uid - Firebase auth UID
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @param {string} phone - User phone number
 * @param {string} role - User role
 * @returns {Promise} Firebase set promise
 */
export const createUserHandle = async (handle, uid, email, firstName, lastName, phone, role) => {
  const user = {
      handle,
      uid,
      email,
      firstName,
      lastName,
      phone,
      createdOn: new Date().toString(),
      role,
  };

  await set(ref(db, `users/${handle}`), user);
};

/**
 * Retrieves user data by Firebase UID
 * 
 * @param {string} uid - Firebase auth UID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserData = async (uid) => {

    const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
    if(snapshot.exists){
        return snapshot.val();
      }

};

/**
 * Gets total count of users in the system
 * 
 * @returns {Promise<number>} Total user count
 */
export const getTotalUsers = async () => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    return Object.keys(snapshot.val()).length;
  }
  return 0;
};

/**
 * Retrieves all users with optional handle search filter
 * 
 * @param {string} search - Optional search term for filtering by handle
 * @returns {Promise<Array>} Array of user objects
 */
export const getAllUsers = async (search='') => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    const users = Object.values(snapshot.val()).map(user => ({
      ...user,
      id: user.uid, 
    }));

    if (search) {
      return users.filter(user => user.handle.toLowerCase().includes(search.toLowerCase()));
    }
    return users;
  }
  return [];
};

/**
 * Retrieves all users with optional email search filter
 * 
 * @param {string} search - Optional search term for filtering by email
 * @returns {Promise<Array>} Array of user objects
 */
export const getAllUsersByEmail = async (search='') => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    if(search){
      const users = Object.values(snapshot.val());
      return users.filter(user=>user.email.toLowerCase().includes(search.toLowerCase()))
    }
    return Object.values(snapshot.val());
  }
  return {};
};

/**
 * Retrieves all users from the database, optionally filtering by first name.
 *
 * @async
 * @function getAllUsersByFirstName
 * @param {string} [search=''] - The search string to filter users by their first name. 
 *                               If empty, all users will be returned.
 * @returns {Promise<Object[]>} A promise that resolves to an array of user objects 
 *                              matching the search criteria, or an empty object if no users exist.
 */
export const getAllUsersByFirstName = async (search='') => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    if(search){
      const users = Object.values(snapshot.val());
      return users.filter(user=>user.firstName.toLowerCase().includes(search.toLowerCase()))
    }
    return Object.values(snapshot.val());
  }
  return {};
};

/**
 * Retrieves all users from the database, optionally filtering by last name.
 *
 * @async
 * @function getAllUsersByLastName
 * @param {string} [search=''] - The search string to filter users by last name. 
 *                               If empty, all users are returned.
 * @returns {Promise<Object[]>} A promise that resolves to an array of user objects 
 *                              filtered by last name, or all users if no search string is provided.
 *                              If no users exist, an empty object is returned.
 */
export const getAllUsersByLastName = async (search='') => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    if(search){
      const users = Object.values(snapshot.val());
      return users.filter(user=>user.lastName.toLowerCase().includes(search.toLowerCase()))
    }
    return Object.values(snapshot.val());
  }
  return {};
};

/**
 * Retrieves user data by Firebase UID
 * 
 * @param {string} uid - Firebase auth UID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserById = async (uid) => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  if (snapshot.exists()) {
    const users = snapshot.val();
    const userId = Object.keys(users)[0];
    return users[userId];
  }
  return null;
};

/**
 * Updates a user's role
 * 
 * @param {string} uid - Firebase auth UID
 * @param {string} newRole - New role to assign
 * @returns {Promise} Firebase update promise
 */
export const updateUserRole = async (uid, newRole) => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  if (snapshot.exists()) {
    const userKey = Object.keys(snapshot.val())[0];
    await update(ref(db, `users/${userKey}`), { role: newRole });
  } else {
    throw new Error('User not found');
  }
};

/**
 * Updates user profile data
 * 
 * @param {string} handle - User handle
 * @param {Object} userData - Updated user data
 * @returns {Promise} Firebase update promise
 */
export const updateUser = async (handle, userData) => {
  const userRef = ref(db, `users/${handle}`);
  await update(userRef, userData);
};

/**
 * Retrieves a user from the database by their phone number.
 *
 * @async
 * @function getUserByPhone
 * @param {string} phone - The phone number of the user to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the user object if found, or null if no user exists with the given phone number.
 */
export const getUserByPhone = async (phone) => {
    const snapshot = await get(query(ref(db, 'users'), orderByChild('phone'), equalTo(phone)));
    if (snapshot.exists()) {
      const users = snapshot.val();
      const userHandle = Object.keys(users)[0];
      return users[userHandle];
    }
    return null;
  };
  /**
   * Creates a new contact list for a user and saves it to the database.
   *
   * @async
   * @function createContactList
   * @param {string} userId - The ID of the user who owns the contact list.
   * @param {string} listName - The name of the contact list to be created.
   * @returns {Promise<Object>} A promise that resolves to the newly created contact list object.
   * @property {string} id - The unique identifier of the contact list.
   * @property {string} owner - The ID of the user who owns the contact list.
   * @property {string} name - The name of the contact list.
   * @property {Array} contacts - An empty array representing the contacts in the list.
   */
  export const createContactList = async (userId, listName) => {
    const listRef = push(ref(db, "contactLists"));

    const newList = {
        id: listRef.key,
        owner: userId,
        name: listName,
        contacts: []
    };

    await set(listRef, newList);
    return newList;
};

/**
 * Adds a contact to a specified contact list in the database if it does not already exist.
 *
 * @async
 * @function addContactToList
 * @param {string} listId - The ID of the contact list to which the contact will be added.
 * @param {string} contactId - The ID of the contact to add to the list.
 * @returns {Promise<void>} A promise that resolves when the contact has been added to the list.
 */
export const addContactToList = async (listId, contactId) => {
    const listRef = ref(db, `contactLists/${listId}/contacts`);

    const snapshot = await get(listRef);
    let contacts = snapshot.exists() ? snapshot.val() : [];

    if (!contacts.includes(contactId)) {
        contacts.push(contactId);
        await set(listRef, contacts);
    }
};

/**
 * Retrieves the contact lists for a specific user from the database.
 *
 * @async
 * @function getUserContactLists
 * @param {string} userId - The ID of the user whose contact lists are to be fetched.
 * @returns {Promise<Object[]>} A promise that resolves to an array of contact lists owned by the user.
 *                              Returns an empty array if no contact lists are found or an error occurs.
 * @throws {Error} Logs an error message to the console if fetching contact lists fails.
 */
export const getUserContactLists = async (userId) => {
    try {
        const snapshot = await get(ref(db, "contactLists"));
        if (snapshot.exists()) {
            const lists = snapshot.val();
            return Object.values(lists).filter(list => list.owner === userId);
        }
        return [];
    } catch (error) {
        console.error("Error fetching contact lists:", error);
        return [];
    }
};

/**
 * Updates a contact list in the database with the provided data.
 *
 * @async
 * @function updateContactList
 * @param {string} listId - The unique identifier of the contact list to update.
 * @param {Object} updatedData - The data to update the contact list with.
 * @returns {Promise<Object>} A promise that resolves to an object indicating the success or failure of the operation.
 * @property {boolean} success - Indicates whether the update was successful.
 * @property {Error} [error] - The error object if the update failed.
 */
export const updateContactList = async (listId, updatedData) => {
    try {
        await update(ref(db, `contactLists/${listId}`), updatedData);
        return { success: true };
    } catch (error) {
        console.error("Error updating contact list:", error);
        return { success: false, error };
    }
};

export const deleteContactList = async (listId) => {
    const listRef = ref(db, `contactLists/${listId}`);
    await remove(listRef);
};

/**
 * Removes a contact from a specified contact list in the database.
 *
 * @async
 * @function removeContactFromList
 * @param {string} listId - The unique identifier of the contact list.
 * @param {string} contactEmail - The email of the contact to be removed.
 * @returns {Promise<void>} Resolves when the contact is successfully removed from the list.
 * @throws {Error} Throws an error if there is an issue accessing or updating the database.
 */
export const removeContactFromList = async (listId, contactEmail) => {
  const listRef = ref(db, `contactLists/${listId}/contacts`);
  const snapshot = await get(listRef);
  
  if (snapshot.exists()) {
    let contacts = snapshot.val();
    contacts = contacts.filter(contact => contact.email !== contactEmail);
    
    await set(listRef, contacts);
  }
};

/**
 * Fetches all users and maps participant IDs to user objects
 * 
 * @param {Array<string>} participantIds - Array of participant UIDs
 * @returns {Promise<Array>} Array of user objects
 */
export const getParticipantsDetails = async (participantIds) => {
  const users = await getAllUsers();
  return participantIds
    .map((uid) => users.find((user) => user.uid === uid))
    .filter(Boolean); // Filter out unmatched users
};

/**
 * Retrieves the contacts from a specified contact list in the database.
 *
 * @async
 * @function getContactsFromList
 * @param {string} listId - The unique identifier of the contact list.
 * @returns {Promise<Array>} A promise that resolves to an array of contacts. 
 *                           Returns an empty array if the list does not exist or an error occurs.
 * @throws {Error} Logs an error message to the console if fetching contacts fails.
 */
export const getContactsFromList = async (listId) => {
  try {
      const listRef = ref(db, `contactLists/${listId}/contacts`);
      const snapshot = await get(listRef);
      return snapshot.exists() ? snapshot.val() : [];
  } catch (error) {
      console.error("Error fetching contacts from list:", error);
      return [];
  }
};
