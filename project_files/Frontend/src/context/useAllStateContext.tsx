import { useContext } from "react";
import FlightsContext from '../Providers/AllStateProvider'

function useAllStateContext() {
  return useContext(FlightsContext);
}

export default useAllStateContext;