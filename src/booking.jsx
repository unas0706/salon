import { createContext, useCallback, useContext, useState } from 'react';

const Ctx = createContext(null);
export const useBooking = () => useContext(Ctx);

// open({ service }) or open({ services: [...] }) pre-selects services; open({ outlet }) pre-selects an outlet and skips step 1
export function BookingProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, pre: {} });
  const open = useCallback((pre = {}) => setState({ isOpen: true, pre }), []);
  const close = useCallback(() => setState(s => ({ ...s, isOpen: false })), []);
  return <Ctx.Provider value={{ ...state, open, close }}>{children}</Ctx.Provider>;
}
