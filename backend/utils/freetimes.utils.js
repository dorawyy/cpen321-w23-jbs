import momenttz from "moment-timezone";

// ChatGPT usage: Partial
export function getFreeTimeHelper(timeMin, timeMax, busyTimes, fromGoogle) {
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
            .tz('America/Los_Angeles');
    } else {
        firstBusyStart = momenttz(busyTimes[0].pstStartDatetime)
            .tz('America/Los_Angeles');
    }
    
    const startDateTime = momenttz(timeMin).tz('America/Los_Angeles')

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
            busyEnd = momenttz(busyTimes[i].end).tz('America/Los_Angeles');
            nextBusyStart = momenttz(busyTimes[i + 1].start).tz('America/Los_Angeles');
        } else {
            busyEnd = momenttz(busyTimes[i].pstEndDatetime).tz('America/Los_Angeles');
            nextBusyStart = momenttz(busyTimes[i + 1].pstStartDatetime)
                            .tz('America/Los_Angeles');
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
                        .tz('America/Los_Angeles');
    } else {
        lastBusyEnd = momenttz(
            busyTimes[busyTimes.length - 1].pstEndDatetime
        ).tz('America/Los_Angeles');
    }
    const endDateTime = momenttz(timeMax).tz('America/Los_Angeles')

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