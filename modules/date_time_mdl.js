/*
* Shenkar College of Engineering and Design.
* Department of Software Engineering
* EazyBuzy - Software Engineering B.Sc. Final Project 2018
*   Created by:
*       Shamir Krizler
*       Nir Mekin
*       Alexander Djura
*
*   Supervisor:
*       Dr. Michael Kiperberg
*/

'use strict';
/*
* this class allows us to work with all kinds of hour and date representions
* for simple arithmetic functions with time
* converting all representions for one kind 
*/

class DateTime{
    
    // compare the week hours
    static compareHour(hour1, hour2, day1, day2){
        day1 = day1 || 0;
        day2 = day2 || 0;
        return (this.convertTimeToMinutes(hour1) + this.convertDayToMinutes(day1)) -
            (this.convertTimeToMinutes(hour2) + this.convertDayToMinutes(day2));
    };

    // convert the week day to minutes of week
    static convertDayToMinutes(day1){
        return day1 * 1440;
    }

    // converting the full format of the time to day and hours
    static getDayAndHour(time){
        let date = new Date(time);
        return `${date.getDay()}${date.getHours()}`;
    }

    // get the time format (HH:MM) and convert it to minutes
    static convertTimeToMinutes(time){
        if(typeof time === "number"){
            return time;
        }
        let timeSplited = time.split(':');
        if(timeSplited.length === 1){
           return ((~~(+ time / 100)) * 60) + (+ time % 100);
        } else {
            return + timeSplited[1] + timeSplited[0] * 60;
        }
    }

    // convert the date (dd.mm.yy) to day of the week
    static convertDateToDay(date){
        return this.normalizeDate(date).getDay();
    };
    
    static normalizeDate(date){
        return new Date(date);
    };
    
    // compare to full formats dates dates
    static compareDate(date1, date2){
        if(date1 === "" || date2 === ""){
            return 0;
        } else {
            return ((this.normalizeDate(date1).getTime() / 1000) -
                (this.normalizeDate(date2).getTime() / 1000));
        }
    };

    // convert the date and hour (date: mm.dd.yy/mm-dd-yy, time: HH:MM/minutes of week) to miliseconds
    static convertDateHourToMilliseconds(date, time){
        let splitedDate = date.split('-'),
            splitedTime = time.split(':');
        return new Date(date + 'T' + time + ":00").getTime();
    }

    // converting the minutes of the day to normal string time(HH:MM)
    static convertMinutesToTime(minutes){   
        let hoursNumber = ~~(minutes / 60),
            minutesNumber = minutes - hoursNumber * 60;
        
        let stringHours = hoursNumber.toString(),
            stringMinutes = minutesNumber.toString();

        stringHours = (stringHours.length == 1)? ("0" + stringHours) : stringHours;
        stringMinutes = (stringMinutes.length == 1)? ("0" + stringMinutes) : stringMinutes;

        return stringHours + ":" + stringMinutes;
    }

    // get the time window for new route and check if a task inside
    static checkTaskInTimeWindow(startWindowTime, endWindowTime, startTaskTime, durationTask){
        durationTask = (durationTask === "") ? "00:15" : durationTask;
        if(startTaskTime === ""){
            if(
                this.convertTimeToMinutes(startWindowTime) +
                this.convertTimeToMinutes(durationTask)
                > 
                this.convertTimeToMinutes(endWindowTime)
            ){
                return this.convertTimeToMinutes(startWindowTime) +
                    this.convertTimeToMinutes(durationTask) -
                    this.convertTimeToMinutes(endWindowTime);
            }
            return 0;
        }
        if(
            this.convertTimeToMinutes(startWindowTime)
            > 
            this.convertTimeToMinutes(startTaskTime)
        ){
            return this.convertTimeToMinutes(startWindowTime) - 
                this.convertTimeToMinutes(startTaskTime);
        }
        if(
            this.convertTimeToMinutes(startTaskTime) +
            this.convertTimeToMinutes(durationTask)
            > 
            this.convertTimeToMinutes(endWindowTime)
        ){
            return this.convertTimeToMinutes(startTaskTime) +
                this.convertTimeToMinutes(durationTask) -
                this.convertTimeToMinutes(endWindowTime);
        }
        return 0;
    }

    // check how many time need for nearest open hour in array of opening hours
    static getNearestOpeningTime(currrentRouteTime, dayWindowTime,
        opening_hours, durationTask
    ){
        let nearestOpeningHours = undefined;
        durationTask = this.convertTimeToMinutes((durationTask === "") ? "00:15" : durationTask);
        if(
            opening_hours == undefined
            || opening_hours.periods == undefined
            || opening_hours.periods.length === 0
        ){
            
            return 0;
        }

        for(let i = 0; i < opening_hours.periods.length; i++){
            if( opening_hours.periods[i].open 
                && !opening_hours.periods[i].close
            ){
                return 0;
            }
            if(
                this.compareHour(
                    opening_hours.periods[i].open.time, currrentRouteTime,
                    opening_hours.periods[i].open.day, dayWindowTime
                )
                <= 0
                && 
                this.compareHour(
                    opening_hours.periods[i].close.time, currrentRouteTime,
                    opening_hours.periods[i].close.day, dayWindowTime
                ) - durationTask
                >= 0
            ){
                return 0;
            } else {
                let newNearestOpeningHours = this.compareHour(
                    opening_hours.periods[i].open.time, currrentRouteTime,
                    opening_hours.periods[i].open.day, dayWindowTime
                );

                if( newNearestOpeningHours > 0
                    &&
                    opening_hours.periods[i].open.day === dayWindowTime
                    && 
                    this.compareHour(
                        opening_hours.periods[i].close.time,
                        opening_hours.periods[i].open.time,
                        opening_hours.periods[i].close.day,
                        opening_hours.periods[i].open.day
                    ) - durationTask 
                    >= 0
                 ){
                    nearestOpeningHours = nearestOpeningHours || newNearestOpeningHours;
                    if(nearestOpeningHours > newNearestOpeningHours){
                        nearestOpeningHours = newNearestOpeningHours;
                    }
                }
            }
        }
        return nearestOpeningHours;
    }

    // compare the time window for new route with the opening hours of the place
    static checkPlaceInTimeWindow(startWindowTime, endWindowTime,
        dayWindowTime, opening_hours, durationTask
    ){
        durationTask = this.convertTimeToMinutes((durationTask === "") ? "00:15" : durationTask);
        if(
            opening_hours == undefined
            || opening_hours.periods == undefined
            || opening_hours.periods.length === 0
        ){
            return 0;
        }
        for(let i = 0; i < opening_hours.periods.length; i++){
            if(
                this.compareHour(
                    startWindowTime, opening_hours.periods[i].open.time,
                    dayWindowTime, opening_hours.periods[i].open.day
                )
                <= 0
                && 
                this.compareHour(
                    endWindowTime, opening_hours.periods[i].open.time,
                    dayWindowTime, opening_hours.periods[i].open.day
                ) - durationTask
                >= 0

                ||

                this.compareHour(
                    startWindowTime, opening_hours.periods[i].close.time,
                    dayWindowTime, opening_hours.periods[i].close.day
                ) + durationTask
                <= 0
                && 
                this.compareHour(
                    endWindowTime, opening_hours.periods[i].close.time,
                    dayWindowTime, opening_hours.periods[i].close.day
                )
                >= 0

                ||

                this.compareHour(
                    startWindowTime, opening_hours.periods[i].close.time,
                    dayWindowTime, opening_hours.periods[i].close.day
                ) 
                >= 0
                && 
                this.compareHour(
                    endWindowTime, opening_hours.periods[i].close.time,
                    dayWindowTime, opening_hours.periods[i].close.day
                )
                <= 0
            ){
                return 0;
            }
        }
        return -1;
    }
}
module.exports = DateTime;
