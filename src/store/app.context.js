import { createContext } from "react";

export const AppContext = createContext({
    user: null,
    userData: {
        firstName: '',
        lastName: '',
        role: '',
      },
    setAppState: ()=>{},
});