let mins = 0;
let secs = 0;
let timer;
let isInRestMode = false

function count() {
    // update timer
    if (secs < 59) {
        secs++
    } else {
        secs = 0

        let max = isInRestMode ? 5 : 25 // max is 5 for rest mode, 25 for normal mode (based on the rules in tomato timer)

        if (mins < max) {
            mins++
        } else {
            mins = 0
            clearInterval(timer)
        }
    }

    postMessage({ secs, mins })
}

onmessage = function (e) {
    const { secs: dataSecs, mins: dataMins, isInRestMode: dataInRestMode, timerState, isDemoMode } = e.data;
    const interval = isDemoMode ? 10 : 1000
    mins = dataMins;
    secs = dataSecs;
    isInRestMode = dataInRestMode;

    if (timerState === "started") {
        timer = setInterval(count, interval);
    } else {
        clearInterval(timer)
    }
}