import { useState, useEffect } from "react";
import { getAllUsers, getAllUsersByEmail, updateUserRole, getAllUsersByFirstName, getAllUsersByLastName } from "../../../services/user.services";
import { useSearchParams } from "react-router-dom";
import { Roles } from "../../../common/roles.enum";

/**
 * Admin tools component for user management
 * 
 * Provides interface for administrators to search, view, and manage users
 * including the ability to ban/unban users
 * 
 * @returns {JSX.Element} Admin dashboard interface
 */
export default function AdminTools() {
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const search = searchParams.get('search') || '';
  const searchMethod = searchParams.get('method') || 'username';

/**
 * Fetches and filters users based on search parameters
 * 
 * @effect Loads users filtered by search term and method (username/email)
 */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let data;
        if (search === '') {
          data = await getAllUsers();
        } else if (searchMethod === 'email') {
          data = await getAllUsersByEmail(search);
        }
        else if(searchMethod ==="firstname"){
          data = await getAllUsersByFirstName(search);
        }
        else if(searchMethod ==="lastname"){
          data = await getAllUsersByLastName(search);
        }
        else {
          data = await getAllUsers(search);
        }
        setUsers(data);
      } catch (error) {
        showNotification('Error', error.message, 'error');
      }
    };

    fetchUsers();
  }, [search, searchMethod]);

/**
 * Creates and manages temporary notifications
 * 
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success' or 'error')
 */
  const showNotification = (title, message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, closing: true } : notif
      ));
      setTimeout(() => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }, 300);
    }, 5000);
  };

/**
 * Toggles user ban status
 * 
 * @param {string} uid - User ID to ban/unban
 */
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
      showNotification(
        'Success',
        `User ${user.handle} has been ${newRole === Roles.banned ? 'banned' : 'unbanned'}`
      );
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  };

/**
 * Determines CSS class for role badge
 * 
 * @param {string} role - User role
 * @returns {string} CSS class name for styling
 */
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case Roles.admin:
        return 'badge-admin';
      case Roles.banned:
        return 'badge-banned';
      default:
        return 'badge-user';
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Tools</h1>
      <p className="admin-description">Manage users and their roles from this dashboard.</p>

      <div className="admin-card">
        <div className="search-controls">
          <div className="search-radio-group">
            <div className="radio-option">
              <input
                type="radio"
                name="method"
                id="username"
                value="username"
                checked={searchMethod === 'username'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
              />
              <label htmlFor="username">Username</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                name="method"
                id="email"
                value="email"
                checked={searchMethod === 'email'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                name="method"
                id="firstname"
                value="firstname"
                checked={searchMethod === 'firstname'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
              />
              <label htmlFor="firstname">First name</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                name="method"
                id="lastname"
                value="lastname"
                checked={searchMethod === 'lastname'}
                onChange={(e) => setSearchParams({ method: e.target.value, search })}
              />
              <label htmlFor="lastname">Last name</label>
            </div>
          </div>

          <div className="search-input-wrapper">
            <i className="search-icon">🔍</i>
            <input
              type="text"
              className="search-input"
              placeholder={`Search by ${searchMethod}...`}
              value={search}
              onChange={(e) => setSearchParams({ method: searchMethod, search: e.target.value })}
            />
          </div>
        </div>

        {users.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
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
                    <span className={`user-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`action-button ${user.role === Roles.banned ? 'unban-button' : 'ban-button'}`}
                      onClick={() => handleBan(user.uid)}
                    >
                      {user.role === Roles.banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-description">No users found with this {searchMethod}</p>
        )}
      </div>

      <div className="notification-container">
        {notifications.map(({ id, title, message, type, closing }) => (
          <div key={id} className={`notification${closing ? ' closing' : ''}`}>
            <div className={`notification-icon ${type}`}>
              {type === 'success' ? '✓' : '✕'}
            </div>
            <div className="notification-content">
              <div className={`notification-title ${type}`}>{title}</div>
              <div className="notification-message">{message}</div>
            </div>
            <button
              className="notification-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== id))}
            >
              ✕
            </button>
            <div className="notification-progress" />
          </div>
        ))}
      </div>
    </div>
  );
}