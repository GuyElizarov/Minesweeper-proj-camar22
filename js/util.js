'use strict'

var gElStopWatch = document.querySelector('.stopwatch')
var gTimerInterval
var gStartTime

function timerCycle() {
    var currTime = Date.now()
    var sec = (currTime - gStartTime) / 1000
    sec = sec.toFixed(2)
    gElStopWatch.innerHTML = sec
    gGame.secsPassed = sec
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(timerCycle, 10)
}

function stopTimer() {
    clearInterval(gTimerInterval)
}

function resetTimer() {
    clearInterval(gTimerInterval)
    gElStopWatch.innerText = '00.00'
}

function getRandomIntExclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}