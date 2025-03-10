import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // World box size in pixels
let maxSize = 1000; // Max number of icons we render (we can simulate big populations, but don't render them all...)

/**
 * Renders a subset of the population as a list of patients with emojis indicating their infection status.
 */
const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.quarantined) {
      return "🏠"; // House for quarantined
    }
    if (p.immune) {
      return "💉"; // Syringe for immune
    }
    if (p.newlyInfected) {
      return "🤧"; // Sneezing Face for new cases
    } else if (p.infected) {
      return "🤢"; // Vomiting Face for already sick
    } else if (p.roundsInfected > 4) {
      return "🤒"; // Sick face for long-term infected
    } else {
      return "😀"; // Healthy person
    }
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of{" "}
          {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${
              (p.y / 100) * boxSize
            }px)`,
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [population, setPopulation] = useState(
    createPopulation(popSize * popSize)
  );
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(
    defaultSimulationParameters
  );

  // Runs a single simulation step
  const runTurn = () => {
    let newPopulation = updatePopulation([...population], simulationParameters);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  // Resets the simulation
  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize));
    setDiseaseData([]);
  };

  // Auto-run simulation effect
  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population]);

  return (
    <div>
      <section className="top">
        <h1>The Flu Simulation</h1>
        <p>
          This code <code>simulationTwo/diseaseModel.js</code> shows a sampled population that's infected by the influenza, or the flu, showing the incubation period of the patients as well as the quarantine period, which is 4 rounds. 
          The newly infected patients are quarantined for 2 rounds, and if they are still infected after 6 rounds, they are immune. 
          The infection chance is set to 50%.
        </p>

        <p>
          Population: {population.length}.
        </p>
        <p>A bit of AI--Copilot and ChatGPT used</p>
        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <div>
          {/* Add custom parameters here... */}
          <label>
            Incubation Period: 
            <input
            type="range"
            min="1"
            max="2"
            value={simulationParameters.incubationPeriod[0]}
            onChange={(e) =>
              setSimulationParameters({
                ...simulationParameters,
                incubationPeriod: [
                  parseInt(e.target.value),
                  simulationParameters.incubationPeriod[1],
                ],
              })
            }
          />
          {simulationParameters.incubationPeriod[0]} - {simulationParameters.incubationPeriod[1]} rounds
            </label>
          <label>
            Infection Chance:
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simulationParameters.infectionChance}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  infectionChance: parseFloat(e.target.value),
                })
              }
            />
            {simulationParameters.infectionChance}%
          </label>
          <label>
            Population:
            <div className="vertical-stack">
              {/* Population uses a "square" size to allow a UI that makes it easy to slide
          from a small population to a large one. */}
              <input
                type="range"
                min="3"
                max="1000"
                value={popSize}
                onChange={(e) => setPopSize(parseInt(e.target.value))}
              />
              <input
                type="number"
                value={Math.round(popSize * popSize)}
                step="10"
                onChange={(e) =>
                  setPopSize(Math.sqrt(parseInt(e.target.value)))
                }
              />
            </div>
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population)}
          </div>
        </div>

        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
