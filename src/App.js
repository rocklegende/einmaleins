import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {flushSync} from "react-dom";
import moment from "moment";

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const maxMillisecondsToSolve = 5000;

const getInitialTasks = (max = 10) => {
  const tasks = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      tasks.push({
        firstNum: i,
        secondNum: j,
        msTakenToSolve: maxMillisecondsToSolve,
        tries: 0,
        failed: false,
      })
    }
  }
  shuffle(tasks);
  return tasks.slice(0, max);
}

function createProgressbar(id, duration, callback, run = true) {
  // We select the div that we want to turn into a progressbar
  var progressbar = document.getElementById(id);
  progressbar.className = 'progressbar';

  // We create the div that changes width to show progress
  var progressbarinner = document.createElement('div');
  progressbarinner.className = 'inner';

  // Now we set the animation parameters
  progressbarinner.style.animationDuration = duration;

  // Eventually couple a callback
  if (typeof(callback) === 'function') {
    progressbarinner.addEventListener('animationend', callback);
  }

  // Append the progressbar to the main progressbardiv
  progressbar.appendChild(progressbarinner);

  // When everything is set up we start the animation
  progressbarinner.style.animationPlayState = 'paused';
  if (run) progressbarinner.style.animationPlayState = 'running';

}

const removeProgressBar = () => {
  const progressbarContainer = document.querySelector("#progress-bar-container")
  if (progressbarContainer) {
    while (progressbarContainer.firstChild) {
      progressbarContainer.removeChild(progressbarContainer.lastChild);
    }
  }
}

function App() {

  const [tasks, setTasks] = useState(getInitialTasks());
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [mode, setMode] = useState("getready");
  const [startTime, setStartTime] = useState(moment())
  const currentTask = tasks[currentTaskIndex];
  const correctAnswer = currentTask.firstNum * currentTask.secondNum;

  const getInputField = () => {
    return document.querySelector("#answer-input-field");
  }

  const clearInput = () => {
    getInputField().value = "";
  }

  const goToNextTask = () => {
    if (currentTaskIndex === tasks.length - 1) {
      setMode("finished");
      return
    }
    clearInput();
    getInputField().className = "";
    setCurrentTaskIndex(currentTaskIndex + 1);
  }

  function focusInputField() {
    const inputField = getInputField();
    inputField.focus();
  }

  function getResult() {
    const successfulTasks = tasks.reduce((acc, task) => !task.failed ? acc + 1 : acc, 0);
    const totalTasks = tasks.length;
    return {successfulTasks, totalTasks}
  }

  useEffect(() => {

  }, [])

  useEffect(() => {
    if (mode !== "getready")
      setMode("play");
  }, [currentTaskIndex])

  useEffect(() => {
    console.log(mode);
    if (mode === "play") {
      console.log(moment());
      setStartTime(moment());
      removeProgressBar();
      createProgressbar("progress-bar-container", "5s", handleTimeExceeded)
      focusInputField()
    } else if (mode === "finished") {
      removeProgressBar();
    } else if (mode === "getready") {
      focusInputField();
      createProgressbar("progress-bar-container", "5s", handleTimeExceeded, false)
      setTasks(getInitialTasks())
      setCurrentTaskIndex(0);
    }
  }, [mode])

  const restart = () => {
    setMode("getready")
  }

  const handleTimeExceeded = () => {
    showResult("failure")
    setTasks(prevTasks => {
      prevTasks[currentTaskIndex].failed = true;
      return prevTasks;
    })
    getInputField().value = correctAnswer.toString();
    setTimeout(() => {
      goToNextTask();
    }, 1500);
  }

  function showResult(result) {
    getInputField().className = result;
    if (document.querySelector(".inner")){
      document.querySelector(".inner").style.animationPlayState = "paused";
    }
    setMode("showresult");
    const finishTime = moment();
    // console.log({finishTime});
    // console.log({startTime});
    // console.log(finishTime.diff(startTime, "seconds", true));
  }

  const handleInputChange = (e) => {
    if (mode === "showresult") {
      console.log("no input possible in show result");
      return;
    }

    const enteredValue = parseInt(e.target.value);
    if (enteredValue === correctAnswer) {
      showResult("success");

      setTimeout(() => {
        goToNextTask();
      }, 800);
    }
  }

  return (
    <div className="App">
      <div className="App-header">
        <form autoComplete={"off"}>
          {mode !== "finished" ? (<>
            <label id="answer-input-field-label" htmlFor={"answer-input-field"}>
              <span>{currentTask.firstNum}</span>
              <span> &sdot; </span>
              <span>{currentTask.secondNum}</span>
            </label>
            <input
              name={"answer"}
              id={"answer-input-field"}
              type={"tel"}
              onChange={handleInputChange}
              placeholder={mode === "getready" ? "Solve to start": ""}
              disabled={mode === "showresult"}
            />
            <div id={"progress-bar-container"}></div>
          </>) : (
              <>
                <div className={"result"}>{`Test completed!`} <br/> {`${getResult().successfulTasks}/${getResult().totalTasks}`}</div>
                <button
                    onClick={restart}
                    className={"primary-button"}>
                  Restart
                </button>
              </>
              )
          }
        </form>
      </div>
    </div>
  );
}

export default App;
