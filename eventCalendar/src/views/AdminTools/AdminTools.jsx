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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-primary mb-4">Admin Tools</h1>
      <p className="text-center text-muted mb-8">Manage users and their roles from this dashboard.</p>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          } transition-all duration-300 animate-fade-in`}
        >
          <div className="flex items-center">
            <span className="font-bold">{notification.type === 'success' ? 'Success' : 'Error'}</span>
            <span className="ml-2">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {['username', 'email', 'firstname', 'lastname'].map((method) => (
              <div key={method} className="flex items-center">
                <input
                  type="radio"
                  name="method"
                  id={method}
                  value={method}
                  checked={searchMethod === method}
                  onChange={(e) => setSearchParams({ method: e.target.value, search })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor={method} className="ml-2 text-sm font-medium text-text capitalize">
                  {method === 'firstname' ? 'First name' :
                   method === 'lastname' ? 'Last name' : method}
                </label>
              </div>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary transition duration-300"
              placeholder={`Search by ${searchMethod}...`}
              value={search}
              onChange={(e) => setSearchParams({ method: searchMethod, search: e.target.value })}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Full name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{user.handle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === Roles.admin ? 'bg-green-100 text-green-800' :
                        user.role === Roles.banned ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleBan(user.uid)}
                        className={`px-3 py-1 rounded-md text-white transition duration-300 ${
                          user.role === Roles.banned
                            ? 'bg-secondary hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
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
          <div className="text-center py-8">
            <p className="text-muted">No users found with this {searchMethod}</p>
          </div>
        )}
      </div>
    </div>
  );
}
