import { BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./views/Home/Home";
import Login from "./views/Login/Login";
import Register from "./views/Register/Register";
import Authenticated from "../hoc/Authenticated";
import { AppContext } from './store/app.context';
import Header from '../components/Header/Header';
import { useState, useEffect } from "react";
import { auth } from './config/firebase.config';
import { getUserData } from '../services/user.services';
import NotFound from '../components/NotFound/NotFound';
import { useAuthState } from 'react-firebase-hooks/auth';
import Profile from '../components/Profile/Profile';
import BannedUser from "../components/BannedUser/BannedUser";
import AdminTools from "./views/AdminTools/AdminTools";
import Calendar from "./views/Calendar/Calendar";
import CreateEvent from "./views/CreateEvent/CreateEvent";
import ContactList from "./views/ContactList/ContactList";
import Events from "./views/Events/Events"
import EditEvent from "./views/EditEvent/EditEvent"
import DayEvents from "./views/DayEvents/DayEvents";

function App() {
  const [appState, setAppState] = useState({
    user: null,
    userData: null
  })

  const [user] = useAuthState(auth);

  if(appState.user !== user){
    setAppState({
      ...appState,
      user,
    })
  }

  useEffect(()=>{
    if(!user){
      return;
    }

    getUserData(appState.user?.uid)
    .then((data)=>{
      const userData = data[Object.keys(data)[0]];
      setAppState({
        ...appState,
        userData,
      })
    })
  }, [user])

  return (
    <BrowserRouter>
      <AppContext.Provider value = {{...appState, setAppState}}> 
        <Header></Header>
        <main className="flex items-center justify-center min-h-screen pt-16 bg-gray-300 text-black"> {/* here we can edit basic common characteristics of all components(bg color, alignment, etc.) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user-profile" element={<Authenticated><Profile /></Authenticated>} />
          <Route path="/calendar" element={<Authenticated><Calendar /></Authenticated>} />
          <Route path="/day-events" element={<Authenticated><DayEvents /></Authenticated>} />
          <Route path="/events" element={<Events />} />
          <Route path="/create-event" element={<Authenticated><CreateEvent /></Authenticated>} />
          <Route path="/contact-list" element={appState.user ? (<Authenticated><ContactList user={appState.user} /></Authenticated>) : (<p>No user logged in.</p>)}/>
          <Route path="/admin-tools" element={<Authenticated><AdminTools /></Authenticated>} />
          <Route path="/edit-event" element={<Authenticated><EditEvent/></Authenticated>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/banned" element={<Authenticated><BannedUser /></Authenticated>} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App
