# Fleet Manager: 
- Take a human component out of Fleet Management. 
- Wants to cut down on the math of calculating times for unloads and loads. 
- AI once it understands rules and math would figure out and recalculate 10, 20, 1000 trucks. 
- Could significantly undercut competitors 

### Meat and Potatoes is the decision making aspect. Basically managing the whole fleet and figuring things out. 
- Scenario: Swap loads for two trucks and they would move faster. Have an AI advise this decision or make this decision. 
- Checklists for everything. Dispatcher would have to fill in the blanks for a lot of checklists. 
- Optimize ROI for the Asset. 10 Trucks and 10 trailers, maximize what they can haul. 
- Does kind of a Doordash, stitches together the best possible model for all of this. 
- Could potentially set up interchange agreements and share fleets and such. 
- ETA Dash LLC. 

### Jake's notes on what we'll need. 
- Going to need to be able to manage the trucks themselves and update their status' 
- Going to need to set destinations and we're going to need ETAs 
- Going to need to keep track of hours of drivers. 
- Going to need to see if swaps are going to be the most efficient. 
- Spreadsheet upload is probably going to be the way that we'll work with the data. 
- Look at the spreadsheet and make informed decisions. Probably transforms the spreadsheet into a .csv? 
- Fleetbase is an open source software. Could fork and use? Licensing issues? 
- Live updates would be nice. 
- A spreadsheet output would be nice. 

### A Website would probably be best is what David said. Maybe a .exe? idk... 

# Video Notes: 
- Look out for the TRUCK ADMIN DATE Column. Trucks tags need to get renewed before it can drive. 


## Data Dictionary: 
- Truck[int]: Truck ID number
- Truck Maint Date[datetime]: When it needs maintenance. 
- Truck Admin Date[datetime]: When the truck will need to replace tags. IT CANNOT DRIVE WITHOUT THIS. 
- Truck Go Location (Zip)[int]: Where the truck is leaving from. 
- Truck Stop Date[datetime]: When the truck will stop. 
- Truck Stop Location(Zip)[int]: Where the truck will stop. 
- Truck Admin Designator[int]: Like a social security number for a company.
- Truck Readiness[datetime]: When will the truck be available. 


- Driver[string]: Name of the driver...
- Driver Admin Date[datetime]: the next day that the driver will need some sort of Admin intervention. 
- Driver Go Date[datetime]: Driver is ready to go, drive... 
- Driver Go Location (Zip)[int]: Driver is leaving from here. 
- Driver Stop Date[datetime]: When the driver would like to stop. 
- Driver Stop Location[datetime]: Where they're stopping from.  
- Driver Current 70 Total[float]: How much is left on the 70hr Clock. 
- Driver nth Day Working Hours[float]: How much the driver worked that day back. So 8th day back is the 1st Day that they started driving and so on and so forth. 

(I think this would almost be better off in a separate area)
- Driver Current Day 11 Hours Remaining[float]: This is how many hours the driver has left in the current day. 
- Driver Current Day Start of Shift[datetime]: This is when the Driver started their shift that day.  
- Driver Readiness[datetime]: When the driver is good to go again. 

- Trailer[int]: Trailer ID
- Trailer Maint Date[datetime]: When the trailer will need maintenance. 
- Trailer Admin Date[datetime]: When Admin intervention is required. (can't drive without)
- Trailer Go Date[datetime]: Can leave on this day
- Trailer Go Location[datetime]: Where it's headed. 
- Trailer Stop Date[datetime]: When it stops. 
- Trailer Stop Location[datetime]: Where it stops. 
...
- Trailer Admin Designation[int]: Social Security type number thing. 
- Trailer Loaded Status[string](will be filled with - the load number): Is there cargo on that trailer. It's not a yes/no it's a load number, the Load number is also in this Excel Sheet too. 
- Trailer Vessel Type[string]: Various types of trailer vessels. Load you're picking up needs to match the vessel type. 
- Trailer Door Type[string]: Doors are going to be pretty important based on the load. These are semi trailers fyi. Roll doors are good for tight spaces and smaller locations. 
- Trailer Specialized Equipment qty[int]: Going to a place where they don't have equipment. How much equipment is needed. 
- Trailer Specialized Equipment List[list]: What's actually needed.
- Trailer Specialized Equipment Go[bool/string]: Is the stuff ready and functional?

- Load[string]: This is the cargo that goes on the trailer. Dock A in Atlanta to Dock B in Nashville. Multiple Stop solutions exist too, in these cases return loads may exist. 
- Load Go Method for Freight[string]: "live_load" or "preaload: Is it a preloaded trailer or a live load? Preloaded is a trailer you just drive the truck up to. Live Load is one you have to bring a trailer to. AI is going to need to know this.
- Load Go Count[string]: Someone needs to count the load. Who's counting these and keeping records of how it works. SLDC: Shipper Load Driver Count, DLSC: Driver Loads Shipper Counts
- Load Go Method for Lumper[string]: Movement from trailer to dock. Who's moving this stuff. 
- Load Go time[datetime]: When is this leaving at? 
- Load Go Location[string]: Where's it going to? 
- Load Arrival Time[datetime]: When does it need to be there? 
- Load Go Specialized Equipment qty[string]: Pretty much the same as the trailer one.
- Load Go Specialized Equipment list[list]: Pretty much the same as the trailer one.
- Load Go Vessel Type[string]: What type of vessel this needs to be in. Vessel and Load types need to match!!!
... 
- Load Stop Off qty[int]: How many stops we have. 
- Load Stop Off List[list]: Where the stops are. It's a list of locations/addresses. 
- Load Stop Off Location[string]: Which one in the list is this. 
... 
- Load Stop Time[datetime]: Final Destination for the Load. 
- Load Stop Location[string]: Where is this landing at. 
- Load Stop Method For Freight[sting]: Are you dropping or are you unloading. If you're unloading you'll need to find a new load no trail. If you you're dropping the trailer you'll need a new trailer so you're not bobtailing. 

# AI Approach: 
### My thoughts are as follows: 

It looks like we're kind of facing several different tasks at the same time here. I think if we work with an Agent we'll have one assigned to Truck related tasks, one assigned to Driver related tasks, one will be assigned to pickups, One will be assigned to HOS, One for Load & Trailer.   

### Pickups caviot. 
So if a driver changes their location. Another driver will need to be assigned to pick them up and drop them off along their route. 

If a cargo is better suited for one truck than another. A cargo swap will need to be initiated. 

This seems like it's going to need to require a lot of prompt engineering on our part when we have an agent. 

### Loads and Trailers. 
Going to need a list of matching/compatible vessels with loads. That's going to be important. 

I have no idea how we'll take into account doors and locations. That might be a bit too hard unless we have a list of every location and a classification given to them, that'd be really tough to do. Roll doors can't have cargo that's bigger than 10'2", it'll be too big for the door. 

### Driver Inputs: 
I think that the driver will probably need to put in their availability date. The AI will then need to calculate it out for when they will next drive and when they will have their stop and such. 

7 days to 1 day break rules. You drive for 7 days you get a 1 day break. This kind of the starting rate.

Driver will likely need to input a desired stop date. When they see the stop date, the jobs that will fit that will be open to them? Maybe. 

Driver will likely need to add their hours. 

Driver might need to input when they're ready again for the last column. This is where decision making will happen for trucks. The Agent will need to see when drivers are ready, when trucks are ready and if the cargo needs to be moved. There will need to be some sort of "expected by" date for the AI to do this. If they see that the driver is not ready but another is. The AI will recommend a Slot change and put the driver in that truck.

### Dispatcher Inputs: 
I'm not sure how well the Dispatcher AI Agent will be able to handle these things. It's likely that the Dispatch will need to input them: 
Trailer Door Type
Trailer Specialized Equipment

I think what will have to happen is that the Dispatchers will have to put tasks in and the AI will have to find drivers and match them to those tasks. The dispatchers will review what the AI does and can move them around.

### HOS (Hours of Service)
- These are laws. We cannot break them. 
70 Hr running clock in an 8 day period. Each day has a 14 hour non-stop clock. Can't drive more than 11 hours. Have to take 30min break. 


# Architecture: 

### Dispatch: 
Going to need a Dispatch Dashboard where it will have the tasks that the AI has generated up based on availabilities given and the other factors including but not limited to. Cargo type, door type, location, driver readiness, Live load or preload. 

Dispatch will either approve or rewrite / reassign the tasks based on what they know. The approved tasks will get sent to the drivers. 

### Things to see on the Admins side: 
- They can manage which drivers are in their fleet. 
- They can see the Driver's profile. Which jobs they've been on recently. Where they're based out of. 
- They can see the hours worked in each day. 
- They can manage trucks, set maintenance and admin dates. If there's not one of these set it will notify them. 

## Drivers: 
They're going to have a place to put in their availabilities. They're going to have a place to put in their hours worked for that day. The AI. 

They're going to get assigned their task and important dates will need to be taken into account for each truck. 

(Side note:) If there's a way we can use a maps API to split out their days for them that could be nice. 

# Technology Requirements: 
- ExpressJS w/ Layouts or ReactJS w/ NextJS depends on API usages. 
- MongoDB. 
- Hosting service probably through Gooogle. 
- LangChain API. 
- xlsx -> csv conversion. 
- going to need to see if we can pass the data in spreadsheets to the Agent somehow... 
- Send the data back through into an excel sheet? or.... 

### Meeting
- Hours function off of a Log system that the truckers don't even input themselves.
- Manual inputs will have to be sudden stuff. Like if someone needs to go home immediately in New York and someone is already in New York with an empty trailer. 


# Late Game Strats: 
If we could standardize the BOLs process. We would be helping truckers get paid quicker and they wouldn't have to use a factor service. A factor service the factors pay the truckers and wait for a fee. We wouldn't need a fee we would just change the transfer service and expediting it. 