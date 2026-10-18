// menubar context for mobile nav
"use client";
import { createContext, useContext, useState } from "react";

const MenuContext = createContext();

export const useMenuContext = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MenuContext.Provider>
  );
};
