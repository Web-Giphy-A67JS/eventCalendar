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
import './App.css';
import BannedUser from "../components/BannedUser/BannedUser";
import AdminTools from "./views/AdminTools/AdminTools";
import Calendar from "./views/Calendar/Calendar";
import './App.css'

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user-profile" element={<Authenticated><Profile /></Authenticated>} />
          <Route path="/calendar" element={<Authenticated><Calendar /></Authenticated>} />
          <Route path="/admin-tools" element={<Authenticated><AdminTools /></Authenticated>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/banned" element={<Authenticated><BannedUser /></Authenticated>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App
