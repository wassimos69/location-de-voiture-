import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import { EthContext } from "../EthContext"; // ✅ Import nommé
import { reducer, actions, initialState } from "./state";
import LocationVoiture from "../../contracts/LocationVoiture.json"; // ✅ Chemin correct vers le contrat

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifact) => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error("Erreur lors de la récupération du contrat :", err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract }
        });
      }
    }, []
  );

  useEffect(() => {
    init(LocationVoiture); // ✅ Init avec l'ABI importée
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <EthContext.Provider value={{ state, dispatch }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
