import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../src/store/app.context';
import { updateUser } from '../../services/user.services';
import { storage } from '../../src/config/firebase.config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  const handleEdit = () => { 
    setState(prevState => ({ ...prevState, isEditing: true }));
  };

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

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

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

  if (!userData) return <div className="loading">Please log in to view your profile.</div>;
  if (state.loading) return <div className="loading">Loading profile...</div>;

  return (
    <div >
      <div className="bg-white shadow-xl rounded-lg max-w-lg w-full p-6 space-y-6 w-96">
        <div className="flex justify-center">
          <div className="relative">
            {state.profilePicture ? (
              <img 
                src={state.profilePicture} 
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-300 text-4xl text-white">
                {userData.handle?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {state.isEditing && (
              <div 
                className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer"
                onClick={handleProfilePictureClick}
              >
                ✏️
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-indigo-600">{userData.handle}</h1>
          <p className="text-sm text-gray-500">{userData.role}</p>
        </div>

        <div>
          {state.isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className="form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={state.firstName}
                  onChange={(e) => setState({ ...state, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={state.lastName}
                  onChange={(e) => setState({ ...state, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  className="form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={state.phone}
                  onChange={(e) => setState({ ...state, phone: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span className="font-semibold">Email</span>
                <span>{userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">First Name</span>
                <span>{userData.firstName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Last Name</span>
                <span>{userData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Phone Number</span>
                <span>{userData.phone}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          {state.isEditing ? (
            <>
              <button 
                className="btn btn-primary w-24" 
                onClick={handleSave}
              >
                Save
              </button>
              <button 
                className="btn btn-outline w-24" 
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className="btn btn-secondary w-29"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
