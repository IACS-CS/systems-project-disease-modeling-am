import React, { useEffect, useState } from "react";
import HandshakeSimulation from "./sims/handshakeGame/HandshakeSimulation";
import Simulation from "./sims/simulationOne/Simulation";
import Simulation2 from "./sims/simulationTwo/Simulation";

export const App = () => {
  const sims = [
    {
      name: "Handshake Simulation",
      component: HandshakeSimulation,
    },
    {
      name: "Handshake Simulation pt.2",
      component: Simulation,
    },
    {
      name: "The Modified Flu Simulation",
      component: Simulation2,
    },
  ];

  const [activeSim, setActiveSim] = useState(undefined);

  const renderChooser = () => (
    <div className="simulation-chooser">
      <h1>Allan Machogu's Simulation Playground</h1>
      <ul>
        {sims.map((sim) => (
          <li key={sim.name}>
            <button onClick={() => setActiveSim(sim)}>{sim.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSim = () => (
    <div className="simulation-container">
      <button className="back-button" onClick={() => setActiveSim(undefined)}>
        Back
      </button>
      <activeSim.component />;
    </div>
  );

  if (activeSim) {
    return renderSim();
  } else {
    return renderChooser();
  }
};

export default App;
