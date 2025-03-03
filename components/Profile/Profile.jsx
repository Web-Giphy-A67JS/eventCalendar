import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../src/store/app.context';
import { updateUser } from '../../services/user.services';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../src/config/firebase.config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * User profile component with edit functionality
 * 
 * Displays and allows editing of user profile information including
 * name, phone number, and profile picture
 * 
 * @returns {JSX.Element} User profile page
 */
export default function Profile() {
  const { userData, setAppState } = useContext(AppContext);
  const [state, setState] = useState({
    isEditing: false,
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    phone: userData?.phone || '',
    loading: !userData,
    profilePicture: userData?.profilePicture || null
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

/**
 * Initializes form state with user data
 * 
 * @effect Updates form fields when user data becomes available
 */
  useEffect(() => {
    if (userData) {
      setState({
        isEditing: false,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        loading: false,
        profilePicture: userData.profilePicture || null
      });
    }
  }, [userData]);

// Enables profile editing mode
  const handleEdit = () => { 
    setState(prevState => ({ ...prevState, isEditing: true }));
  };

/**
 * Validates and saves profile changes
 * 
 * Performs input validation, updates database, refreshes app state,
 * and exits edit mode on success
 */
  const handleSave = async () => {
    try {
      if (!userData || !userData.uid) {
        throw new Error('User data is not available');
      }
      if (state.firstName.length < 4 || state.firstName.length > 32) {
        return alert('First name must be between 4 and 32 characters');
      }
      if (state.lastName.length < 4 || state.lastName.length > 32) {
        return alert('Last name must be between 4 and 32 characters');
      }
      if (isNaN(state.phone)) {
        return alert('Please enter a valid phone number');
      }

      const updateData = {
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
        profilePicture: state.profilePicture
      };

      await Promise.all([
        updateUser(userData.handle, updateData),
      ]);

      setAppState((prevState) => ({
        ...prevState,
        userData: {
          ...prevState.userData,
          ...updateData
        },
      }));
      setState((prevState) => ({ ...prevState, isEditing: false }));
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    }
  };

/**
 * Triggers file input click when profile picture is clicked
 */
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

/**
 * Handles profile picture upload
 * 
 * Uploads selected image to Firebase Storage and updates state with download URL
 * 
 * @param {Event} event - File input change event
 */
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !userData?.uid) return;

    try {
      const imageRef = storageRef(storage, `profilePictures/${userData.uid}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      setState(prevState => ({ ...prevState, profilePicture: downloadURL }));
    } catch (error) {
      alert(`Error uploading profile picture: ${error.message}`);
    }
  };

  // Navigates to password change page
  const handleChangePassword = () => {
    navigate("/password-change");
  };

/**
 * Cancels edit mode and resets form to original values
 */
  const handleCancel = () => {
    setState({
      isEditing: false,
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      phone: userData?.phone || '',
      loading: false,
      profilePicture: userData?.profilePicture || null
    });
  };

/**
 * Conditional rendering for authentication and loading states
 * 
 * @returns {JSX.Element} Message prompting login or loading indicator
 */
  if (!userData) return <div className="loading">Please log in to view your profile.</div>;
  if (state.loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture-container">
            {state.profilePicture ? (
              <img 
                src={state.profilePicture} 
                alt="Profile" 
                className="profile-picture" 
              />
            ) : (
              <div className="profile-picture">
                {userData.handle?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {state.isEditing && (
              <div 
                className="profile-picture-edit"
                onClick={handleProfilePictureClick}
              >
                Change Photo
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="profile-picture-input"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="profile-info">
            <div className="profile-username">{userData.handle}</div>
            <div className="profile-role">{userData.role}</div>
          </div>
        </div>

        <div className="profile-details">
          {state.isEditing ? (
            <div className="edit-form active">
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className="form-input"
                  value={state.firstName}
                  onChange={(e) => setState({ ...state, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="form-input"
                  value={state.lastName}
                  onChange={(e) => setState({ ...state, lastName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  className="form-input"
                  value={state.phone}
                  onChange={(e) => setState({ ...state, phone: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{userData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{userData.firstName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{userData.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{userData.phone}</span>
              </div>
            </>
          )}
        </div>

        <div className="action-buttons">
          {state.isEditing ? (
            <>
              <button className="save-button" onClick={handleSave}>Save</button>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button 
                className="change-password-button active" 
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </>
          ) : (
            <button className="edit-button" onClick={handleEdit}>
              ✏️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}