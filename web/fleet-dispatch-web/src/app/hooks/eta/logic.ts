// Eta Calculator Logic

/*
NEXT STEPS

1. Find out what the Driver object looks like in the database.
2. Match this class to what is in the database.
*/
// Driver Class. Utilizing class because it is closer to what we'll eventually be using from the database
class Driver {

  // Properties
  //Commenting out since we won't need for mvp
  // name: string;
  // age: number;
  id: string;
  total_70_hour: number;
  total_14_hour: number;
  total_11_hour: number;
  total_8_hour: number;
  on_duty: number;
  off_duty: number;
  current_time: Date = new Date()

  // Constructor
  constructor(id: string, total_70_hour: number, total_14_hour: number, total_11_hour: number, total_8_hour: number, on_duty: number, off_duty: number) {
    // this.name = name;
    // this.age = age;
    this.id = id;
    this.total_70_hour = total_70_hour;
    this.total_14_hour = total_14_hour;
    this.total_11_hour = total_11_hour;
    this.total_8_hour = total_8_hour;
    this.on_duty = on_duty;
    this.off_duty = off_duty;
}

  // Method
  // greet(): string {
  //   return `Hello, my name is ${this.name} and I am ${this.age} years old. My ID is ${this.id}.`;
  // }


}


// Calculate ETA
function calcEta(driver: Driver, estimate: number): number {
  let end_estimate = estimate;
  let remaining_time = estimate;
  let current_time = Date.now.toString();

  //if hours off duty is 34, reset values
  if (driver.off_duty >= 34)
  {
    driver.total_70_hour = 0;
    driver.total_14_hour = 14;
    driver.total_11_hour = 11;
    driver.on_duty = 0;
  }
  return end_estimate;
}


// Main
function main() {
  const newDriver: Driver = new Driver("12345", 45, 10, 11, 0, 11, 0);
  let fake_estimate = 10;
  //eventually take in variable from api on how long the original estimate 
    let eta: number = calcEta(newDriver, fake_estimate);
    console.log(`Your ETA is ${eta} minutes.`)
}

// Call Main
main()