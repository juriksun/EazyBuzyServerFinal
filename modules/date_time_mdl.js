'use strict';

class DateTime{
    static compareHour(hour1, hour2){
        return this.convertTimeToMinutes(hour1) - this.convertTimeToMinutes(hour2);
    };

    static convertTimeToMinutes(time){
        let timeSplited = time.split(':');
        return + timeSplited[1] + timeSplited[0] * 60 ;
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
}

module.exports = DateTime;
