'use strict';

class DateTime{
    static compareHour(hour1, hour2){
        let hour1Splited = hour1.split(':'),
            hour2Splited = hour2.split(':');
            
        let hour1InMinutes = + hour1Splited[1] + hour1Splited[0] * 60 ,
            hour2InMinutes = + hour2Splited[1] + hour2Splited[0] * 60 ;
    
        return hour1InMinutes - hour2InMinutes;
    };
   
    static convertDateToDay(date){
        return this.normalizeDate(date).getDay();
    };
    
    static normalizeDate(date){
        return new Date(date);
    };
    
    static compareDate(date1, date2){
        return ((this.normalizeDate(date1).getTime() / 1000) - (this.normalizeDate(date2).getTime() / 1000));
    };
}

module.exports = DateTime;
