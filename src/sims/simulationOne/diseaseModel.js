import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, let's consider a simple disease that spreads through contact.
You can implement a simple model which does one of the following:

1. Model the different effects of different numbers of contacts: in my Handshake Model, two people are in 
   contact each round. What happens if you put three people in contact? Four? Five? Consider different options
   such as always putting people in contact with the people "next" to them (i.e. the people before or after them
   in line) or randomly selecting people to be in contact (just do one of these for your model).

2. Take the "handshake" simulation code as your model, but make it so you can recover from the disease. How does the
spread of the disease change when you set people to recover after a set number of days.

3. Add a "quarantine" percentage to the handshake model: if a person is infected, they have a chance of being quarantined
and not interacting with others in each round.

*/

/**
 * Authors: Allan Machogu
 * 
 * What we are simulating: The handshake disease with different new features
 * Simulating rounds of 4 similar people before creating random interactions
 * 
 * What elements we have to add:
 * We start by having a population of 0 - 1 million people.
 * We then shuffle the groups into groups of 4, for 5 rounds--a total of 20.
* - We then move through the population by two's (each two is a partner).
* - We move their x/y coordinates so we can visually "see" them grouping in the simulation with 
*   the groups moving randomly to another.
* - If one person is infected and not the other groups, we have a chance of infecting the other.
* After, 4 rounds of the infected individual. A person is quariantined for 2 rounds. Not interacting with other members.
*They are healed and returned to the general population where they can't be infected.
 * 
 * In plain language, what our model does: We also keep track of people who are newly infected in each round so we can graph new infections
* separately from total infections. As well as those quarantined, and add them to i.
 * 
 */



export const defaultSimulationParameters = {
  infectionChance: 50,
  // Add any new parameters you want here with their initial values
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
      roundsInfected: 0,
      immmune: false,
      quarantined: false,
      infected: false,
      
    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  patientZero.roundsInfected = 1;
  return population;
};

// Example: Maybe infect a person (students should customize this)
const updateIndividual = (person, contact, params) => {
  // Add some logic to update the individual!
  // For example...
  if (person.infected) {
    // If they were already infected, they are no longer
    // newly infected :)
    person.newlyInfected = false;
    person.roundsInfected += 1;
    if (person.roundsInfected > 4) {
      person.quarantined = true;
    }
    if (person.quarantined) {
      person.roundsInfected = 0;
      person.quarantined = false;
    }
  }
  if (contact.infected) {
    if (Math.random() * 100 < params.infectionChance) {
      if (!person.infected) {
        person.newlyInfected = true;
      }
      person.infected = true;
    }
  }
};

// Example: Update population (students decide what happens each turn)
export const updatePopulation = (population, round, params) => {
  // Include "shufflePopulation if you want to shuffle...
  // population = shufflePopulation(population);
  // Example logic... each person is in contact with the person next to them...
  for (let p of population) {
    p.newlyInfected = false;
  }
  const shuffledPopulation = shufflePopulation(population);

  for (let i = 0; i < population.length; i+= 4) {
    let p = population[i];
    // This logic just grabs the next person in line -- you will want to 
    // change this to fit your model! 
    let contact = population[(i + 1) % population.length];
    for (let i = 0; i < shuffledPopulation.length - 1; i += 2) {
      let personA = shuffledPopulation[i];
      let personB = shuffledPopulation[i + 1];
  
      // let's have them meet at person A's spot...        
      // Check if we're at the edge...
      if (personA.x < 1) {
        personA.x += Math.ceil(Math.random() * 5)
      }
      if (personA.x > 99) {
        personA.x -= Math.ceil(Math.random() * 5)
      }
      // Now move personA over slightly to make room
      personA.x -= 1; // person A moves over...
      // personB stands next to them :-)
      personB.x = personA.x + 2; // person B moves over...
      personB.y = personA.y;
      // Keep track of partners for nudging...
      personA.partner = personB;
      personB.partner = personA;
  
      // Now let's see if they infect each other
      if (personA.infected && !personB.infected) {
        maybeInfectPerson(personB, params);
      }
      if (personB.infected && !personA.infected) {
        maybeInfectPerson(personA, params);
      }
    }
    // Update the individual based on the contact...
    updateIndividual(p, contact, round, params);
  }
  return population;
};


// Stats to track (students can add more)
// Any stats you add here should be computed
// by Compute Stats below
export const trackedStats = [
  { label: "Total Infected", value: "infected",  },
  { label: "Quarantined", value: "quarantined" },
  { label: "New Infections", value: "newlyInfected" },
  { label: "Immune", value: "immune" },
  { label: "Total Population", value: "population" },
];


// Example: Compute stats (students customize)
export const computeStatistics = (population, round) => {
  let infected = 0;
  let newlyInfected = 0;
  for (let p of population) {
    if (p.infected) {
      infected += 1; // Count the infected
    }
    if (p.newlyInfected) {
      newlyInfected += 1; // Count the newly infected
    }
  }
  return { round, infected, newlyInfected, immune, quarantined, population };
};

