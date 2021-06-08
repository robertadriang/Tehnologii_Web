// Solve the tasks 0-8 using a Dev Tools Snippet (F12 -> Sources -> Snippets)
'use strict';

const pretty = json => JSON.stringify(json, null, 2);
const prettyLog = json => console.log(pretty(json)); 

function createCarsArray(){
    const audi = {model: 'A4', price: 30000, color: 'blue', isDiesel: true};
    const lexus = {model: 'LC', price: 120000, color: 'yellow', isDiesel: false};
    const porsche = {model: '718 Cayman', price: 80000, color: 'red', isDiesel: false};
    const ford = {model: 'Fiesta', price: 15000, color: 'blue', isDiesel: true};    
    const audiA8 = {model: 'A8', price: 90000, color: 'black', isDiesel: true};
    const porsche911 = {model: '911', price: 150000, color: 'orange', isDiesel: false};

    const audiExpand={};
    audiExpand[Object.keys({audi})[0]]=audi;
    console.log(pretty(audiExpand));

    const lexusExpand={};
    lexusExpand[Object.keys({lexus})[0]]=lexus;
    console.log(pretty(lexusExpand));

    const porscheExpand={};
    porscheExpand[Object.keys({porsche})[0]]=porsche;
    console.log(pretty(porscheExpand));

    const fordExpand={};
    fordExpand[Object.keys({ford})[0]]=ford;
    console.log(pretty(fordExpand));

    const audiA8Expand={};
    audiA8Expand[Object.keys({audiA8})[0]]=audiA8;
    console.log(pretty(audiA8Expand));

    const porche911Expand={};
    porche911Expand[Object.keys({porsche911})[0]]=porsche911;
    console.log(pretty(porche911Expand));

    const getVarName = obj => Object.keys(obj)[0];
    console.log(getVarName({ audi })) // => "varToGetTheNameOf"
    /* 0. Create an array of all cars objects above like the following    
    [{
        "audi": {
            "model": "A4",
            "price": 30000,
            "color": "blue",
            "isDiesel": true
        }
    },
    ]
    */

    const carsAux=[audi,lexus,porsche,ford,audiA8,porsche911 ];
   const cars = [ audiExpand,lexusExpand,porscheExpand,fordExpand,audiA8Expand,porche911Expand ];

    return cars;
}

const cars = createCarsArray();
console.log(`Cars initial array: ${pretty(cars)}`);

// Tasks - using cars array

// 1. Create an array of cars with price over 50000
/* carsWithPriceOver50000 = [
  {
    "lexus": {
      "model": "LC",
      "price": 120000,
      "color": "yellow",
      "isDiesel": false
    }
  },
  {
    "porsche": {
      "model": "718 Cayman",
      "price": 80000,
      "color": "red",
      "isDiesel": false
    }
  },
  ...
]
*/

// 2. Create an array of the car name + model
// nameAndModelArray = ["audi a4", "lexus LC" ...]

// 3. Create an array of all car (name + model) that have price below 50000
// nameAndModelArrayForCarsWithPriceBelow5000 = ["audi A4", "ford Fiesta"]

// 4. Create an array of all cars, each constaining only the 'model' and 'price' properties.
/* carsPriceInfo =  [
    {
        "audi": {
            "model": "A4",
            "price": 30000          
        }
    },
    {
        "lexus": {
            "model": "LC",
            "price": 120000      
        }
    },
    ...
]
*/

// 5. Count Diesel cars
// dieselCarCount = 3 

// 6. Get the total price for all cars
// totalCarsPrice = 485000

// 7. Get the total price for Porsche cars
// totalPorscheCarsPrice = 230000

// 8. Count the distinct car names
// uniqueCarNamesCount = 4