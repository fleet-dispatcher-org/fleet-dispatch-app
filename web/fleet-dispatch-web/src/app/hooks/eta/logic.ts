// Eta Calculator Logic

//  tsc myFile.ts


// let a: number = 7;
// let b: number = 9;

// function add(num1: number, num2: number): number {
//     return num1 + num2
// }

// console.log(add(a, b))
// console.log("Hello, world!")


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

  // Constructor
  constructor(name: string, age: number, id: string) {
    this.name = name;
    this.age = age;
    this.id = id;
}

  // Method
  greet(): string {
    return `Hello, my name is ${this.name} and I am ${this.age} years old. My ID is ${this.id}.`;
  }


}


// Calculate ETA
function calcEta(driver: Driver): number {
    console.log(driver.greet())
    return 0;
}


// Main
function main() {
    const newDriver: Driver = new Driver("Dave", 37, "XL7b8");
    let eta: number = calcEta(newDriver);
    console.log(`Your ETA is ${eta} minutes.`)
}

// Call Main
main()