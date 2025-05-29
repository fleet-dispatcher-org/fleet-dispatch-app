

### Write a function that takes an hour of the day and changes the formate to HOUR:MIN:SEC
##
hrs.min.sec <- function(hour.of.day){

	if(hour.of.day >= 0 & hour.of.day <=24){
		hours <- floor(hour.of.day)
		minutes <- floor(((hour.of.day %% hours) * 60))
		results <- (paste(hours,minutes,sep=":"))

	} else results <- "Invalid Hour: Input # between 0 and 24"

	return(results)
}

#####
##  Create a function that takes a start time, distance, and average speed and returns a data frame containing
##  break times
##### 
trip.schedule <- function(start.time,distance,ave.speed){

	total.road.hours <- distance/ave.speed

    ### But work hours are only 11 in a day
	# Calculate the total number of full-day drive sections:
	total.full.drive.legs <- floor(total.road.hours/11)
	# Calculate the total number of drive legs including the last leg < 11 hrs
	total.drive.legs <- ceiling(total.road.hours/11)
	# Calculate the number of hours required on the last day's leg
	last.work.day.hours <- (total.road.hours %% 11)*(total.road.hours != 11) + 11*(total.road.hours==11)

	#  set graph parameters
	graph.starts <- seq(start.time, 21.5*total.drive.legs,by=21.5)
	start.times <- seq(start.time, 21.5*total.drive.legs,by=21.5) %% 24
	n <- length(start.times)

    ## 21.5 comes from the hours till next start time including a 10hr break and a half hour break
    ## The Mod division accounts for 24 hour days
    ## Assumes take half hour break exactly at 3rd hour

	graph.half <- (graph.starts + 3)
	half.hour.break.times <- (start.times + 3) %% 24
	
	graph.ten <- (graph.half + 8.5)
	ten.hour.break.times <- (half.hour.break.times + 8.5) %% 24

	graph.half[n] <- graph.starts[n] + last.work.day.hours
	half.hour.break.times[n] <- (start.times[n] + last.work.day.hours) %% 24
	ten.hour.break.times[n] <- NA


	### Work on Graph

	plot(0,0, xlim=c(0,graph.starts[n] + 24), ylim=c(0,4),col="white",main="Activity",xlab="Hours",ylab="Activity")
	abline(h=c(1,2,3),lty=3)
	abline(v=c(seq(0,graph.starts[n] + 24,by=24)),col="lightgray")
	for(i in 1:length(graph.starts)){
		lines(c(graph.starts[i], graph.half[i]),c(2,2),col="green",lwd=2)
		lines(c(graph.half[i]+.5, graph.ten[i]),c(2,2),col="green",lwd=2)
		lines(c(graph.half[i],graph.half[i]+.5),c(1,1),col="red",lwd=3)
		lines(c(graph.ten[i],graph.ten[i]+10),c(1,1),col="red",lwd=2)
	}

	blah <- as.character(Sys.time())
	start.datetime <- strptime(paste(substr(blah,1,11),hrs.min.sec(start.time),sep=''), "%Y-%m-%d %H:%M")
	datetimes <- NULL
	datetimes[1] <- as.character(start.datetime)

	if(n >=2){
	
    ### Write start times as a datetime:

		for(i in 2:n){
			datetimes[i] <- as.character(start.datetime + (21.5*(i-1))*60*60)
		}

		schedule <- data.frame(datetimes,start.times, half.hour.break.times,ten.hour.break.times)
		end.datetime <- as.character(start.datetime + (21.5*(n-1)+last.work.day.hours)*60*60)

	} else {
		end.datetime <- as.character(start.datetime + last.work.day.hours*60*60)
		schedule <- data.frame(datetimes,start.times, half.hour.break.times,ten.hour.break.times)
		}


	dates <- data.frame(c("Start.Date","End.Date"),c(datetimes[1],end.datetime))
	names(dates) <- c("","Time.Stamp")

	results <- list(Schedule=schedule,Trip.Dates = dates)

	return(results)

}

trip.schedule(2,3000,65)
trip.schedule(7.2,3000,65)
trip.schedule(5,600,65)



########################################
#########  State-space model  ##########
########################################


###################################  Needs work
