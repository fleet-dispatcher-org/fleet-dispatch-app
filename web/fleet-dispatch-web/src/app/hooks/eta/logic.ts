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
  //need to figure out how to add these together to get 70 hour total
  //frontmost number represents oldest day, so new days get appended to the end
  eight_day_total: [number, number, number, number, number, number, number, number];
  total_70_hour: number;
  total_14_hour: number;
  total_11_hour: number;
  total_8_hour: number;
  on_duty: number;
  off_duty: number;
  current_time: Date = new Date()
  

  // Constructor
  constructor(id: string, eight_day_total: [number, number, number, number, number, number, number, number], total_14_hour: number, total_11_hour: number, total_8_hour: number, on_duty: number, off_duty: number) {
    // this.name = name;
    // this.age = age;
    this.id = id;
    this.eight_day_total = eight_day_total;
    this.total_70_hour = eight_day_total.reduce((sum, hrs) => sum + hrs, 0);;
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

function getDrivingTimeFromApi(): number {
  return 37;
 }

 // potentially just get from like a datetime.now type thing
function getStartingHoursFromApi(): number {
  // What hour is it according to military time?
  return 15;
 }

// Calculate ETA
function calcEta(driver: Driver, estimate: number, start_time: number): number {
  let end_estimate = estimate;
  let remaining_time = estimate;
  //I think we need to use the time the driver will start rather than time right now
  // let current_time = Date.now.toString();

  //start while loop that will iterate until there is no time left to drive

  while (remaining_time > 0)
  {
    //if hours off duty is 34, reset values
    if (driver.off_duty >= 34)
    {
      driver.total_70_hour = 0;
      driver.total_14_hour = 14;
      driver.total_11_hour = 11;
      driver.total_8_hour = 8;
      driver.on_duty = 0;
    }
  
    //if hours off duty is 10, some values reset
    if (driver.off_duty >= 10)
    {
      driver.total_14_hour = 14;
      driver.total_11_hour = 11;
      driver.total_8_hour = 8;
      driver.on_duty = 0;
    }

    // check if driver has time available on clocks; otherwise, add break time

    //if total is over 70, they have to stop
    if(driver.total_70_hour >= 70)
    {
      //wait until midnight to check to see whether they have time then
      let wait_hours = 24 - start_time;
      end_estimate += wait_hours;
      driver.off_duty = wait_hours;
      //oldest day rolls off, hours get subtracted from total_70_hour
      continue;
    }

    if(driver.total_14_hour <= 0)
    {
      end_estimate += 10;
      driver.off_duty = 10;
      continue;
    }

    if(driver.total_8_hour <= 0)
    {
      end_estimate += .5;
      driver.total_8_hour = 8;
      driver.total_11_hour -= .5;
      driver.total_14_hour -= .5;

    }

    //drive function?
    //drive()


    //only if there is no extenuating issues, then drive as long as you can before stopping
    
    
  }

  return end_estimate;
}

function drive() {

}


// Main
function main() {
  const newDriver: Driver = new Driver("12345", [1,2,3,4,5,6,7,8], 10, 11, 0, 11, 0);
  let fake_estimate = 10;
  let start_time = 15.5; //in military, float hours for now
  //eventually take in variable from api on how long the original estimate 
  //also pass in time that they will start their drive
    let eta: number = calcEta(newDriver, fake_estimate, start_time);
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