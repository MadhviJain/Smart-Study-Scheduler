// === Global Variables ===
let isSoundOn = true;
let timerInterval;
const tickSound = new Audio('tick.mp3');
const dingSound = new Audio('ding.mp3');
let lastMotivation = ""; // Store last motivation

// === Authentication ===
function handleAuth() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const isSignup = document.getElementById('confirmPassword').style.display === 'block';

  if (!username || !password || (isSignup && !confirmPassword)) {
    alert("Please fill all fields.");
    return;
  }

  if (isSignup) {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    localStorage.setItem('user', JSON.stringify({ username, password }));
    alert("Signup successful! You can login now.");
    toggleAuth();
  } else {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.username === username && storedUser.password === password) {
      localStorage.setItem('loggedInUser', JSON.stringify({ username }));
      showDashboard();
    } else {
      alert("Invalid credentials. Please try again.");
    }
  }
}

function toggleAuth() {
  const confirmPassword = document.getElementById('confirmPassword');
  const authTitle = document.getElementById('authTitle');
  const toggleText = document.querySelector('#authContainer p');

  if (confirmPassword.style.display === 'block') {
    confirmPassword.style.display = 'none';
    authTitle.innerText = 'Login';
    toggleText.innerText = "Don't have an account? Sign up";
  } else {
    confirmPassword.style.display = 'block';
    authTitle.innerText = 'Sign Up';
    toggleText.innerText = "Already have an account? Login";
  }
}

function showDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  document.getElementById('welcomeMessage').innerText = `👋 Welcome, ${user.username}!`;
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  startClock();
}

function logout() {
  localStorage.removeItem('loggedInUser');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('authContainer').style.display = 'block';
}

// === Live Clock ===
function startClock() {
  const clock = document.getElementById('clock');
  setInterval(() => {
    const now = new Date();
    clock.innerText = now.toLocaleTimeString();
  }, 1000);
}

// === Study Timer ===
function showMotivation(message) {
  lastMotivation = message;
  const motivatorBox = document.getElementById("motivatorBox");
  motivatorBox.textContent = message;
  motivatorBox.classList.add("show");
  setTimeout(() => {
    motivatorBox.classList.remove("show");
  }, 5000); // Fade out after 5 seconds
}

function replayMotivation() {
  if (lastMotivation) {
    showMotivation(lastMotivation);
  }
}

function startCustomStudy() {
  const minutes = parseInt(document.getElementById("customStudyTime").value);
  if (isNaN(minutes) || minutes <= 0) {
    alert("Please enter a valid number of minutes.");
    return;
  }
  startTimer(minutes);
}

function startBreak(minutes) {
  startTimer(minutes);
}

function startTimer(minutes) {
  let seconds = minutes * 60;
  clearInterval(timerInterval);
  document.getElementById("motivatorBox").textContent = "";
  timerInterval = setInterval(() => {
    if (seconds <= 0) {
      clearInterval(timerInterval);
      if (isSoundOn) dingSound.play();
      alert("⏰ Timer Complete!");
    } else {
      if (isSoundOn) tickSound.play();
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      document.getElementById("timerDisplay").innerText =
        `${min}:${sec < 10 ? "0" : ""}${sec}`;

      // Motivational messages
      if (seconds === Math.floor(minutes * 30)) {
        showMotivation("🎯 Halfway done! Stay strong 💪");
      } else if (seconds === 15 * 60) {
        showMotivation("⏳ Only 15 minutes left, keep pushing!");
      } else if (seconds === 5 * 60) {
        showMotivation("🔥 Almost done! Don’t stop now!");
      }
      seconds--;
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  document.getElementById("timerDisplay").innerText = "00:00";
  document.getElementById("motivatorBox").textContent = "";

  // STOP any playing sounds
  tickSound.pause();
  tickSound.currentTime = 0;
  dingSound.pause();
  dingSound.currentTime = 0;
}

// === Task Manager ===
function addTask() {
  const taskInput = document.getElementById('taskInput').value;
  const priority = document.getElementById('priority').value;
  if (!taskInput) return;
  const li = document.createElement('li');
  li.innerText = `${taskInput} (${priority} Priority)`;
  document.getElementById('taskList').appendChild(li);
  document.getElementById('taskInput').value = '';
}

// === Timetable ===
function addTimetable() {
  const day = document.getElementById('day').value;
  const time = document.getElementById('time').value;
  const subject = document.getElementById('subject').value;
  if (!day || !time || !subject) return;
  const li = document.createElement('li');
  li.innerText = `${day} - ${time} - ${subject}`;
  document.getElementById('timetableList').appendChild(li);
  document.getElementById('day').value = '';
  document.getElementById('time').value = '';
  document.getElementById('subject').value = '';
}

// === Motivation Quotes ===
const quotes = [
  "Great things never come from comfort zones.",
  "Dream bigger. Work harder.",
  "Success doesn’t come to you, you go to it.",
  "Stay positive, work hard, make it happen."
];
function getQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById('quote').innerText = quotes[randomIndex];
}

// === Theme Toggle ===
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// === Sound Toggle ===
function toggleSound() {
  isSoundOn = !isSoundOn;
  document.getElementById('soundStatus').innerText = isSoundOn ? "Sound On" : "Sound Off";
}

// === PDF Export ===
function exportToPDF() {
  const element = document.body;
  html2pdf().from(element).save('Smart_Study_Scheduler.pdf');
}

// === Subject Progress Chart ===
let chartData = JSON.parse(localStorage.getItem('chartData')) || { labels: [], data: [] };

const ctx = document.getElementById('studyChart').getContext('2d');
const studyChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: chartData.labels,
    datasets: [{
      label: 'Study Hours',
      data: chartData.data,
      backgroundColor: '#7b2ff7',
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

function addSubjectProgress() {
  const subjectName = document.getElementById('subjectName').value.trim();
  const studyHours = parseInt(document.getElementById('studyHours').value);

  if (!subjectName || isNaN(studyHours)) {
    alert("Please enter both Subject Name and Study Hours.");
    return;
  }

  chartData.labels.push(subjectName);
  chartData.data.push(studyHours);

  studyChart.update();

  // Save to localStorage
  localStorage.setItem('chartData', JSON.stringify(chartData));

  document.getElementById('subjectName').value = '';
  document.getElementById('studyHours').value = '';
}

// === Reset Subject Progress ===
function resetSubjectProgress() {
  chartData.labels = [];
  chartData.data = [];
  studyChart.update();
  localStorage.removeItem('chartData');
  alert("📊 Study progress has been reset!");
}

// === Auto Login If Already Logged In ===
window.onload = () => {
  if (localStorage.getItem('loggedInUser')) {
    showDashboard();
  }
};
