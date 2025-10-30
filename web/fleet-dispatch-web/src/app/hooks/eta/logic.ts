// Eta Calculator Logic

//  tsc myFile.ts


// let a: number = 7;
// let b: number = 9;

// function add(num1: number, num2: number): number {
//     return num1 + num2
// }

// console.log(add(a, b))
// console.log("Hello, world!")

enum DayNum {
  DAY1 = 1,
  DAY2,
  DAY3,
  DAY4,
  DAY5,
  DAY6,
  DAY7,
  DAY8
}


// Driver Class
class Driver {
    /*
    NEXT STEPS

    1. Find out what the Driver object looks like in the database.
    2. Match this class to what is in the database.
    
    
    
    */

  // Properties
  name: string;
  age: number;
  id: string;
  eightHourTotal: number;
  elevenHourTotal: number;
  fourteenHourTotal: number;
  total70: {1: number, 2: number, 3: number, 4: number, 5: number, 6: number, 7: number, 8: number};
  day: DayNum;
  offDutyClock: number;
  onDutyClock: number;

  // Constructor
  constructor(
      name: string, 
      age: number, 
      id: string,
      eightHourTotal: number,
      elevenHourTotal: number,
      fourteenHourTotal: number,
      total70: {1: number, 2: number, 3: number, 4: number, 5: number, 6: number, 7: number, 8: number},
      day: DayNum,
      offDutyClock: number,
      onDutyClock: number ) {
    this.name = name;
    this.age = age;
    this.id = id;
    this.name = name; 
    this.age = age; 
    this.id = id;
    this.eightHourTotal = eightHourTotal;
    this.elevenHourTotal = elevenHourTotal;
    this.fourteenHourTotal = fourteenHourTotal;
    this.total70 = total70;
    this.day = day;
    this.offDutyClock = offDutyClock;
    this.onDutyClock = onDutyClock;
}

  // Method
  greet(): string {
    return `Hello, my name is ${this.name} and I am ${this.age} years old. My ID is ${this.id}.`;
  }


}

function getDrivingTimeFromApi(): number {
  return 37;
 }

function getStartingHoursFromApi(): number {
  // What hour is it according to military time?
  return 15;
 }

// Calculate ETA
function calcEta(driver: Driver): number {
  const baseDrivingTime: number = getDrivingTimeFromApi()
  const startHour: number = getStartingHoursFromApi()

  const addedTime: number = 0;

  for (let i: number = baseDrivingTime; i >= 0; i--) {

  }

  // 8 Hours



  // 11 Hours



  // 14 Hours



  // 70 Hours
  // if () {

  // }
    console.log(driver.greet())
    return 0;
}


// Main
function main() {
    const driver: Driver = new Driver("Adam", 38, "78xbla", 4, 7, 5, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0} , DayNum.DAY1, 0, 0);
    let eta: number = calcEta(driver);
    console.log(`Your ETA is ${eta} minutes.`)
}

// Call Main
main()

/*

number: Represents both integer and floating-point values (e.g., 10, 3.14).
string: Represents textual data (e.g., "hello", 'TypeScript').
boolean: Represents a logical value, either true or false.
bigint: Represents whole numbers larger than $2^{53} - 1$ (the maximum safe integer in JavaScript's number type).
symbol: Represents a unique and immutable value, often used as object property keys.
null: Represents the intentional absence of any object value. It is the sole value of the null type.
undefined: Represents a variable that has been declared but has not yet been assigned a value. It is the sole value of the undefined type.



*/