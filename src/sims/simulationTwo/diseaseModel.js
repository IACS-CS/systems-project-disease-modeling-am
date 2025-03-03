import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: Allan Machogu
 * 
 * What we are simulating: The flu (incubation period, quarantine period, immunity, and quarantined groups)
 * 
 * What we are attempting to model from the real world: Show how its spread.
 * 
 * What we are leaving out of our model: The effects of the flu on the body.
 * 
 * What elements we have to add: A slider for the 1-2 day incubation period.
 * 
 * What parameters we will allow users to "tweak" to adjust the model: The incubation period of the flu.
 * 
 * In plain language, what our model does: It simulates the flu on a random population group, giving them a 1-2 day incubation period. They can also be quarantined for 2 days. And then they are immune to the flu.
 * 
 */


// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.

export const defaultSimulationParameters = {
  infectionChance: 50, incubationPeriod: [1,2],
  // Add any parameters you want here with their initial values
  //  -- you will also have to add inputs into your jsx file if you want
  // your user to be able to change these parameters.
};

/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate within 100 units
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate scaled similarly
      infected: false,
      quarantined: false,
      immune: false,
      newlyInfected: false,
      roundsInfected: 0,
      incubationPeriod: 0,

    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

//checks to see if the person is maybe infected or not, using the infection chancing at the modified section.
export const maybeInfectPerson = (person, params) => {
  if (!person.quarantined && Math.random() * 100 < params.infectionChance) {
    if (!person.infected) {
      person.infected = true;
      person.newlyInfected = true;
      person.incubationPeriod = Math.floor(Math.random() * (params.incubationPeriod[1] - params.incubationPeriod[0] + 1) + params.incubationPeriod[0]);
    }
  }
}

const updateIndividual = (person, contact, params) => {
  // Add some logic to update the individual!
  // For example...
  if (person.infected) {
    // If they were already infected, they are no longer
    // newly infected :)
    person.newlyInfected = false;
    person.roundsInfected += 1 + person.incubationPeriod;
    // If they have been infected for 4 rounds, they are quarantined
    if (person.roundsInfected > 4) {
      person.quarantined = true;
    }
    //this round just adds to the rounds infected
    
      // Track the incubation period separately
  if (person.incubationPeriod > 0) {
    person.incubationPeriod -= 1;  // Reduce the incubation period by 1 each round
  } else {
    person.roundsInfected += 1;  // After the incubation period ends, they start showing symptoms
  }

    // If they were quarantined for 2 rounds, they are no longer
    // newly infected :)
    if (person.quarantined && person.roundsInfected > 6) {
      person.immune = true;
      person.infected = false;
      person.newlyInfected = false;
      person.roundsInfected = 0;
      person.quarantined = false;
      person.incubationPeriod = 0;
    }
  }
  if (contact.infected) {
    if (Math.random() * 100 < params.infectionChance) {
      if (!person.infected) {
        person.newlyInfected = true;
        person.roundsInfected += 1;
      }
      person.infected = true;
    }
  }
};

// Example: Update population (students decide what happens each turn)
export const updatePopulation = (population, params) => {
  // Figure out your logic here...
  for (let p of population) {
      p.newlyInfected = false;
    }
    const shuffledPopulation = shufflePopulation(population);
  
    for (let i = 0; i < shuffledPopulation.length; i += 2) {
      let personA = shuffledPopulation[i];
      let personB = shuffledPopulation[i + 1];
  
      if (personA.x < 1) {
        personA.x += Math.ceil(Math.random() * 5)
      }
      if (personA.x > 99) {
        personA.x -= Math.ceil(Math.random() * 5)
      }
  
      personA.x -= 1; 
      personB.x = personA.x + 2; 
      personB.y = personA.y;
      
      personA.partner = personB;
      personB.partner = personA;
  
      // Infection logic between person A and person B
      if (personA.infected && !personB.infected) {
        maybeInfectPerson(personB, params);
      }
      if (personB.infected && !personA.infected) {
        maybeInfectPerson(personA, params);
      }
  
      // Update individuals
      updateIndividual(personA, personB, params);
    }
  
  return population;
};

// Stats to track (students can add more)
// Any stats you add here should be computed
// by Compute Stats below
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Quarantined", value: "quarantined" },
  { label: "Total Immune", value: "immune" },
  { label: "Total Newly Infected", value: "newlyInfected" },
  { label: "Total Rounds Infected", value: "roundsInfected" },
  { label: "Total Population", value: "population" },
  { label: "Incubation Period", value: "incubationPeriod" },
];

// Example: Compute stats (students customize)
export const computeStatistics = (population, round) => {
  let infected = 0;
  let quarantined = 0;
  let newlyInfected = 0;
  let roundsInfected = 0;
  let immune = 0;
  let incubationPeriod = 0;
  for (let p of population) {
    if (p.infected) {
      infected += 1; // Count the infected
      roundsInfected += 1;
      incubationPeriod += p.incubationPeriod;
    }
    if (p.quarantined) {
      quarantined += 1;
    }
    if (p.newlyInfected) {
      newlyInfected += 1;
    }
    if (p.immune) {
      immune += 1;
    }
  }
  return { round, infected, incubationPeriod, quarantined, immune, newlyInfected, roundsInfected, population: population.length };

};


