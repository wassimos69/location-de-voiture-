import { BrowserRouter as Router } from 'react-router-dom';
import { EthProvider } from "./contexts/EthContext";
import Interface from "./components/VoitureLocation";

function App() {
  return (
    <Router>
      <EthProvider>
        <div id="App">
          <div className="container">
            <Interface />
          </div>
        </div>
      </EthProvider>
    </Router>
  );
}

export default App;