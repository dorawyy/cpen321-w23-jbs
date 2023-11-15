const momenttz = require("moment-timezone")
const { PST_TIMEZONE } = require("../constants/appointment.status")

// ChatGPT usage: Partial
exports.getFreeTimeHelper = (
    timeMin, timeMax, busyTimes, fromGoogle
) => {
    if (busyTimes.length === 0) {
        return [{
            start: timeMin,
            end: timeMax
        }]
    }
    var freeTimes = []

    // Include free time before the first busy period
    var firstBusyStart
    if (fromGoogle) {
        firstBusyStart = momenttz(busyTimes[0].start)
            .tz(PST_TIMEZONE);
    } else {
        firstBusyStart = momenttz(busyTimes[0].pstStartDatetime)
            .tz(PST_TIMEZONE);
    }
    
    const startDateTime = momenttz(timeMin).tz(PST_TIMEZONE)

    if (firstBusyStart.isSameOrAfter(startDateTime)) {
        const freeStart = startDateTime;
        const freeEnd = firstBusyStart;
        const diff = momenttz.duration(freeEnd.diff(freeStart))
        if (diff.hours() >= 1) {
            freeTimes.push({ 
                start: freeStart.toISOString(true),
                end: freeEnd.toISOString(true) 
            });
        }
    }

    // Infer free times based on busy intervals
    for (let i = 0; i < busyTimes.length - 1; i++) {
        var busyEnd
        var nextBusyStart
        if (fromGoogle) {
            busyEnd = momenttz(busyTimes[i].end).tz(PST_TIMEZONE);
            nextBusyStart = momenttz(busyTimes[i + 1].start)
                .tz(PST_TIMEZONE);
        } else {
            busyEnd = momenttz(busyTimes[i].pstEndDatetime)
                .tz(PST_TIMEZONE);
            nextBusyStart = momenttz(busyTimes[i + 1].pstStartDatetime)
                .tz(PST_TIMEZONE);
        }
        
        const freeStart = busyEnd;
        const freeEnd = nextBusyStart;
        const diff = momenttz.duration(freeEnd.diff(freeStart))
        if (diff.hours() >= 1) {
            freeTimes.push({ 
                start: freeStart.toISOString(true),
                end: freeEnd.toISOString(true) 
            });
        }
    }

     // Include free time after the last busy period
    var lastBusyEnd
    if (fromGoogle) {
        lastBusyEnd = momenttz(busyTimes[busyTimes.length - 1].end)
                        .tz(PST_TIMEZONE);
    } else {
        lastBusyEnd = momenttz(
            busyTimes[busyTimes.length - 1].pstEndDatetime
        ).tz(PST_TIMEZONE);
    }
    const endDateTime = momenttz(timeMax).tz(PST_TIMEZONE)

    if (lastBusyEnd.isSameOrBefore(endDateTime)) {
        const freeStart = lastBusyEnd;
        const freeEnd = endDateTime;
        const diff = momenttz.duration(freeEnd.diff(freeStart))
        if (diff.hours() >= 1) {
            freeTimes.push({ 
                start: freeStart.toISOString(true),
                end: freeEnd.toISOString(true) 
            });
        }
    }
    return freeTimes
}