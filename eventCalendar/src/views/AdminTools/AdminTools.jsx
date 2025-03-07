import { useState, useEffect } from "react";
import { getAllUsers, getAllUsersByEmail, updateUserRole, getAllUsersByFirstName, getAllUsersByLastName } from "../../../services/user.services";
import { useSearchParams } from "react-router-dom";
import { Roles } from "../../../common/roles.enum";

export default function AdminTools() {
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);
  const search = searchParams.get('search') || '';
  const searchMethod = searchParams.get('method') || 'username';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let data;
        if (search === '') {
          data = await getAllUsers();
        } else if (searchMethod === 'email') {
          data = await getAllUsersByEmail(search);
        } else if (searchMethod === "firstname") {
          data = await getAllUsersByFirstName(search);
        } else if (searchMethod === "lastname") {
          data = await getAllUsersByLastName(search);
        } else {
          data = await getAllUsers(search);
        }
        setUsers(data);
      } catch (error) {
        setNotification({
          message: error.message,
          type: 'error'
        });
      }
    };
  
    fetchUsers();
  }, [search, searchMethod]);  // Triggers when search or searchMethod changes
  
  
  // Effect to clear the notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);  // Clear the notification
      }, 5000);
      return () => clearTimeout(timer);  // Cleanup the timer if notification changes
    }
  }, [notification]);

  const handleBan = async (uid) => {
    try {
      const user = users.find((u) => u.uid === uid);
      const newRole = user.role === Roles.banned ? Roles.user : Roles.banned;
      await updateUserRole(uid, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, role: newRole } : user
        )
      );
      setNotification({
        message: `User ${user.handle} has been ${newRole === Roles.banned ? 'banned' : 'unbanned'}`,
        type: 'success'
      });
    } catch (error) {
      setNotification({
        message: error.message,
        type: 'error'
      });
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case Roles.admin:
        return 'badge badge-success';
      case Roles.banned:
        return 'badge badge-error';
      default:
        return 'badge badge-primary';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Admin Tools</h1>
      <p className="text-lg text-center mb-6 text-gray-600">Manage users and their roles from this dashboard.</p>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`toast-center ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} p-4 rounded-lg shadow-lg fixed top-16 left-1/2 transform -translate-x-1/2`}
        >
          <div className="flex items-center">
            <span className="font-bold">{notification.type === 'success' ? 'Success' : 'Error'}</span>
            <span className="ml-2">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="method"
                id="username"
                value="username"
                checked={searchMethod === 'username'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
                className="radio radio-primary"
              />
              <label htmlFor="username" className="font-medium text-gray-700">Username</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="method"
                id="email"
                value="email"
                checked={searchMethod === 'email'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
                className="radio radio-primary"
              />
              <label htmlFor="email" className="font-medium text-gray-700">Email</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="method"
                id="firstname"
                value="firstname"
                checked={searchMethod === 'firstname'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
                className="radio radio-primary"
              />
              <label htmlFor="firstname" className="font-medium text-gray-700">First name</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="method"
                id="lastname"
                value="lastname"
                checked={searchMethod === 'lastname'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
                className="radio radio-primary"
              />
              <label htmlFor="lastname" className="font-medium text-gray-700">Last name</label>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              className="input input-bordered input-primary w-full max-w-xs ml-2 bg-white"
              placeholder={`Search by ${searchMethod}...`}
              value={search}
              onChange={(e) => setSearchParams({ method: searchMethod, search: e.target.value })}
            />
            <i className="text-lg text-gray-500">🔍</i>
          </div>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full table-striped">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700">
                  <th>Username</th>
                  <th>Full name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.handle}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${user.role === Roles.banned ? 'btn-success' : 'btn-error'}`}
                        onClick={() => handleBan(user.uid)}
                      >
                        {user.role === Roles.banned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-4">No users found with this {searchMethod}</p>
        )}
      </div>
    </div>
  );
}
