'use strict';

class DateTime{
    static compareHour(hour1, hour2, day1, day2){
        day1 = day1 || 0;
        day2 = day2 || 0;
        return (this.convertTimeToMinutes(hour1) + this.convertDayToMinutes(day1)) -
            (this.convertTimeToMinutes(hour2) + this.convertDayToMinutes(day2));
    };

    static convertDayToMinutes(day1){
        return day1 * 1440;
    }

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

    static convertDateToDay(date){
        return this.normalizeDate(date).getDay();
    };
    
    static normalizeDate(date){
        return new Date(date);
    };
    
    static compareDate(date1, date2){
        if(date1 === "" || date2 === ""){
            return 0;
        } else {
            return ((this.normalizeDate(date1).getTime() / 1000) -
                (this.normalizeDate(date2).getTime() / 1000));
        }
    };

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
                console.log("in");
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

    static checkPlaceInTimeWindow(startWindowTime, endWindowTime,
        dayWindowTime, opening_hours, durationTask
    ){
        durationTask = this.convertTimeToMinutes((durationTask === "") ? "00:15" : durationTask);
        // console.log("<<<<<<<<<<<<<<<<<<<<<<");
        if(
            opening_hours == undefined
            || opening_hours.periods == undefined
            || opening_hours.periods.length === 0
        ){
            return 0;
        }
        for(let i = 0; i < opening_hours.periods.length; i++){
            // console.log("---------------: " , opening_hours);
            // console.log("startWindowTime: ", startWindowTime);
            // console.log("endWindowTime: ", endWindowTime);
            // console.log("dayWindowTime", dayWindowTime);
            // console.log("durationTask", durationTask);
            // console.log("opening_hours.periods[i].open.time : ", opening_hours.periods[i].open.time);
            // console.log("opening_hours.periods[i].open.day :", opening_hours.periods[i].open.day);
            // console.log("opening_hours.periods[i].close.time :", opening_hours.periods[i].close.time);
            // console.log("opening_hours.periods[i].close.day", opening_hours.periods[i].close.day);
            // console.log("Compare (Start - Open Hour): " + this.compareHour(
            //     startWindowTime, opening_hours.periods[i].open.time,
            //     dayWindowTime, opening_hours.periods[i].open.day
            // ));
            // console.log("Compare (End - (Open Hour - duration)): " + (this.compareHour(
            //     endWindowTime, opening_hours.periods[i].open.time,
            //     dayWindowTime, opening_hours.periods[i].open.day
            // ) - durationTask));

            // console.log("Compare (Start - Close Hour + duration): " + (this.compareHour(
            //     startWindowTime, opening_hours.periods[i].close.time,
            //     dayWindowTime, opening_hours.periods[i].close.day
            // ) + durationTask));
            // console.log("Compare (End - Close Hour): " + this.compareHour(
            //     endWindowTime, opening_hours.periods[i].close.time,
            //     dayWindowTime, opening_hours.periods[i].close.day
            // ));
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
                //console.log("-----------------------------------In time");
                return 0;
            } else {
                //console.log("-----------------------------------Not in time");
            }
        }
        return -1;
    }
}

module.exports = DateTime;
