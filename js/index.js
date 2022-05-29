let worker = new Worker("../js/timer.js")

/** ================================== 
 * Variables
 * =================================== */
const mainBtn = document.getElementById("main-btn")
const stopBtn = document.getElementById("stop-btn")
const main = document.getElementById("main")
const mainSection = document.getElementById("main-section")
const quoteText = document.getElementById("quote")
const stateLabel = document.getElementById("state-label")
const timerLabel = document.getElementById("timer-label")
const menu = document.getElementById("menu-icon")
const closeSidebarIcon = document.getElementById("close-sidebar-icon")
const sidebar = document.getElementById("sidebar")
const demoCheckBox = document.getElementById("demoCheckBox")

/** ================================== 
 * States
 * =================================== */

let mins = 0;
let secs = 0;
let isInRestMode = false
let timerState = "stopped" // 'stopped', 'paused', 'started'

let isOpeningSidebar = false
let demoMode = false

/** ================================== 
 * Default classes for elems
 * =================================== */
const mainBtnDefaultClass = "font-medium text-xl md:text-2xl cursor-default px-8 py-3 rounded"
const sidebarDefaultClass = "transition-transform delay-150 h-full text-black bg-white drop-shadow-md fixed top-0 right-0 bottom-0 max-w-sm w-full p-4"
const animateShowSidebarClass = " ease-out -translate-x-0 "
const animateHideSidebarClass = " ease-in translate-x-full"
/** ================================== 
 * Initialization
 * =================================== */
async function load() {
    init()

    await generateQuotes({ toElemID: "quote" })
}

function init() {
    setupListeners()
    hideSidebar()
    updateUI()
}

function setupTimerLabel() {

    switch (timerState) {
        case "stopped":
            timerLabel.innerHTML = "00:00:00"
            timerLabel.style.display = "none"
            break;
        case "paused":
            timerLabel.style.display = "block"
        case "started": {
            // format to something like "25:00"
            let formattedMins = mins.toFixed(0).padStart(2, "0")
            let formattedSecss = secs.toFixed(0).padStart(2, "0")

            timerLabel.innerHTML = `${formattedMins}:${formattedSecss}`
            timerLabel.style.display = "block"
            break;
        }

    }
}

worker.onmessage = function (event) {
    const { secs: returnedSecs, mins: returnedMins } = event.data

    let max = isInRestMode ? 5 : 25 // max is 5 for rest mode, 25 for normal mode (based on the rules in tomato timer)
    if (mins >= max) {
        // is over, reset
        playNotifySound();

        if (isInRestMode) {
            switchToNormal()
        } else {
            switchToRest()
        }
    } else {
        // continue counting
        secs = returnedSecs;
        mins = returnedMins;
    }

    updateUI();
}

function setupStateLabel() {
    switch (timerState) {
        case "stopped":
            // Hide state label when timer is stopped.
            stateLabel.innerText = ""
            stateLabel.style.display = "none"

            break;
        case "paused":
            stateLabel.innerText = "Paused"

            if (isInRestMode) {
                stateLabel.innerText += " (Rest Mode)"
            }

            stateLabel.style.display = "block"
            break;
        case "started":
            if (isInRestMode) {
                stateLabel.innerText = "Resting"
            } else {
                stateLabel.innerText = "Started"
            }
            stateLabel.style.display = "block"
            break;
    }
}

function setupStopBtn() {
    if (timerState == "stopped") {
        hideStopbtn()
    } else {
        showStopBtn()
    }
}

function setupMainBtn() {
    var label = ""
    var bgColor = "opacity-50"

    // Set label and bgColor based on the current state
    switch (timerState) {
        case "stopped":
            label = "Press the screen to start"
            // bgColor = "bg-green-400"
            break;
        case "paused":
            label = "Press the screen to resume"
            // bgColor = "bg-green-500"
            break;
        case "started":
            label = "Press the screen to pause"
            // bgColor = "bg-zinc-800 opacity-50 text-white"
            break;
    }
    mainBtn.innerText = label
    mainBtn.className = `${bgColor} ${mainBtnDefaultClass}`
}

function setupMainBodyStyle() {
    var bgColor = ""
    var textColor = ""

    // Set textColor and bgColor to body based on the current state
    switch (timerState) {
        case "stopped":
            bgColor = "bg-slate-100"
            textColor = "text-gray-800"
            break;
        case "paused":
            bgColor = "bg-zinc-900"
            textColor = "text-white"
            break;
        case "started":
            if (isInRestMode) {
                bgColor = "bg-blue-400"
                textColor = "text-gray-800"
            } else {
                bgColor = "bg-green-400"
                textColor = "text-gray-800"
            }
            break;
    }
    main.className = `${bgColor} ${textColor}`

}

function setupQuote() {
    switch (timerState) {
        case "stopped":
            // Only show quote when timer is stopped.
            quoteText.style.display = "block";
            break;
        case "paused":
        case "started":
            // Otherwise, hide the quote.
            quoteText.style.display = "none";
            break;
    }
}

/** ================================== 
 * Handlers
 * =================================== */

/** 
 * @description This function should be called whenever we want to update the UI based on the current state.
 */
function updateUI() {
    setupMainBtn()
    setupStopBtn()
    setupMainBodyStyle()
    setupQuote()
    setupStateLabel()
    setupTimerLabel()
}

// rest mode to normal mode
function switchToNormal() {
    isInRestMode = false;
    mins = 0;
    secs = 0;

    pauseTimer();
}

// normal mode to rest mode
function switchToRest() {
    isInRestMode = true;
    mins = 0;
    secs = 0;

    pauseTimer();
}

function updateWorker() {
    worker.postMessage({
        mins,
        secs,
        isInRestMode,
        timerState,
        isDemoMode: demoMode
    })
}

function startTimer() {
    document.title = "Tomato Timer"
    timerState = "started"
    updateUI();
    updateWorker()
}

function pauseTimer() {
    document.title = "PAUSED"
    timerState = "paused"
    updateUI()
    updateWorker()
}

function stopTimer() {
    document.title = "Tomato Timer"

    timerState = "stopped"
    isInRestMode = false
    mins = 0;
    secs = 0;

    updateWorker()
    updateUI()
}

function showStopBtn() {
    stopBtn.style.display = "block";
}

function hideStopbtn() {
    stopBtn.style.display = "none";
}

function showSidebar() {
    isOpeningSidebar = true
    sidebar.className = `${sidebarDefaultClass} ${animateShowSidebarClass}`
}

function hideSidebar() {
    isOpeningSidebar = false
    sidebar.className = `${sidebarDefaultClass}  ${animateHideSidebarClass}`
}

function switchDemoMode({ demo }) {
    demoMode = demo
    pauseTimer()
}

/** ================================== 
 * Event Listeners
 * =================================== */
function setupListeners() {
    stopBtn.addEventListener("click", onStopBtnPressed)
    mainSection.addEventListener("click", onMainTapped)
    menu.addEventListener("click", onMenuTapped)
    closeSidebarIcon.addEventListener("click", () => { hideSidebar(); })
    demoCheckBox.addEventListener("change", onDemoCheckboxChanged)
}

function onDemoCheckboxChanged({ target }) {
    const isToggleOn = target.checked
    switchDemoMode({ demo: isToggleOn })
}

function onMenuTapped(e) {
    e.stopPropagation();

    if (isOpeningSidebar) {
        hideSidebar();
    } else {
        showSidebar();
    }
}

function onMainTapped(e) {
    switch (timerState) {
        case "stopped":
            startTimer()
            showStopBtn()
            break;
        case "paused":
            startTimer()
            showStopBtn()
            break;
        case "started":
            pauseTimer()
            showStopBtn()
            break;
    }
    preconfig();
}

function onStopBtnPressed(e) {
    e.stopPropagation();

    quoteText.innerHTML = "" // clear previous quote
    stopTimer()
    generateQuotes({ toElemID: "quote" })
}

/** ================================== 
 * Entry points
 * =================================== */
load()