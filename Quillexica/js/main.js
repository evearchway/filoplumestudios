// Language Learning Study Tool
// Extracts vocabulary from Spanish sentence and creates an interactive study tool

// Level sentences
const levelSentences = {
  1: "El veloz zorro marrón salta sobre el perro perezoso.",
  2: "Tres estudiantes inteligentes leen libros sobre ciudades antiguas."
};

// Level-specific translation dictionaries
const translationDictByLevel = {
  1: {
    "el": "the (masc)",
    "veloz": "swift/fast",
    "zorro": "fox",
    "marrón": "brown",
    "salta": "jumps",
    "sobre": "over/on",
    "perro": "dog",
    "perezoso": "lazy"
  },
  2: {
    "tres": "three",
    "estudiantes": "students",
    "inteligentes": "intelligent",
    "leen": "read",
    "libros": "books",
    "sobre": "about/over",
    "ciudades": "cities",
    "antiguas": "ancient"
  }
};

// Current selected level
let selectedLevel = 1;

// Question bank will be built dynamically from the sentence
let questions = [];
let currentQuestion = null;
let currentQuestionIndex = 0;
let correctInCategory = 0;
let questionLocked = false;

// Track mastery (0-10) for each word by level
const masteryDataByLevel = {
  1: {},
  2: {}
};

// Difficulty adjustment (0-10 scale, 0=all easy, 10=all hard)
let studyDifficulty = 5;
let speedModeEnabled = false;

document.addEventListener('DOMContentLoaded', function() {
  initializeStudyTool();
  updateAllLevelMasteryCircles();
});

function selectLevel(level) {
  selectedLevel = level;
  document.querySelectorAll('.level-card').forEach(btn => btn.classList.remove('active'));
  const levelCard = event && event.target ? event.target.closest('.level-card') : null;
  if (levelCard) {
    levelCard.classList.add('active');
  }

  buildQuestionsForLevel(level);
  updateAllLevelMasteryCircles();
  startStudy();
}

function buildQuestionsForLevel(level) {
  const sentence = levelSentences[level];
  const translationDict = translationDictByLevel[level];
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase().replace(/[.,!?;:]/g, '')))];

  if (!masteryDataByLevel[level]) {
    masteryDataByLevel[level] = {};
  }

  questions = uniqueWords.map((word, index) => {
    const englishTranslation = translationDict[word] || 'translation unknown';
    const otherWords = uniqueWords.filter(w => w !== word);
    const wrongAnswers = otherWords
      .slice(0, 3)
      .map(w => translationDict[w] || 'translation unknown');

    while (wrongAnswers.length < 3) {
      wrongAnswers.push('[unknown]');
    }

    const allChoices = [englishTranslation, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIndex = allChoices.indexOf(englishTranslation);
    const existingMastery = masteryDataByLevel[level][word] || 0;

    return {
      word,
      question: word,
      english: englishTranslation,
      choices: allChoices,
      correctIndex,
      weight: 10,
      correctCount: 0,
      score: existingMastery,
      lastCorrect: false,
      index,
    };
  });

  questions.forEach(q => {
    if (masteryDataByLevel[level][q.word] === undefined) {
      masteryDataByLevel[level][q.word] = 0;
    }
  });
}

function initializeStudyTool() {
  buildQuestionsForLevel(selectedLevel);
  updateAllLevelMasteryCircles();
  setStudyView('question');

  // Setup button listeners
  document.getElementById('backBtn').onclick = goBack;
  document.getElementById('skipBtn').onclick = skipQuestion;
  document.addEventListener('keydown', handleAnswerHotkeys);
  updateDifficultyDisplay();
}

function setStudyView(view) {
  const questionTabBtn = document.getElementById('questionTabBtn');
  const sentenceTabBtn = document.getElementById('sentenceTabBtn');
  const questionPanel = document.getElementById('questionPanel');
  const sentencePanel = document.getElementById('sentencePanel');

  if (!questionTabBtn || !sentenceTabBtn || !questionPanel || !sentencePanel) {
    return;
  }

  const showQuestion = view === 'question';
  questionTabBtn.classList.toggle('active', showQuestion);
  sentenceTabBtn.classList.toggle('active', !showQuestion);
  questionPanel.classList.toggle('active', showQuestion);
  sentencePanel.classList.toggle('active', !showQuestion);

  if (!showQuestion) {
    const sentenceView = document.getElementById('sentenceView');
    if (sentenceView) {
      sentenceView.textContent = levelSentences[selectedLevel];
    }
  }
}

function handleAnswerHotkeys(event) {
  // Only handle number keys while actively studying and question is unlocked.
  if (!currentQuestion || questionLocked) return;

  const container = document.getElementById('container');
  if (!container || container.style.display === 'none') return;

  const keyToIndex = {
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3
  };

  const selectedIndex = keyToIndex[event.key];
  if (selectedIndex === undefined) return;

  const buttons = document.querySelectorAll('.choice');
  const button = buttons[selectedIndex];
  if (!button || button.disabled) return;

  event.preventDefault();
  checkAnswer(button, selectedIndex, currentQuestion.correctIndex);
}

function updateDifficultyDisplay() {
  document.getElementById('difficultyLevel').textContent = String(studyDifficulty);
  
  // Update button disabled states
  document.getElementById('increaseDifficultyBtn').disabled = studyDifficulty >= 10;
  document.getElementById('decreaseDifficultyBtn').disabled = studyDifficulty <= 0;
}

function increaseDifficulty() {
  if (studyDifficulty < 10) {
    studyDifficulty++;
    updateDifficultyDisplay();
    // Reset lastCorrect flags to make question selection more immediate
    questions.forEach(q => q.lastCorrect = false);
  }
}

function decreaseDifficulty() {
  if (studyDifficulty > 0) {
    studyDifficulty--;
    updateDifficultyDisplay();
    // Reset lastCorrect flags to make question selection more immediate
    questions.forEach(q => q.lastCorrect = false);
  }
}

function toggleSpeedMode() {
  speedModeEnabled = !speedModeEnabled;
  const speedBtn = document.getElementById('speedModeBtn');
  if (!speedBtn) return;

  speedBtn.textContent = speedModeEnabled ? 'Speed Mode: On' : 'Speed Mode: Off';
  speedBtn.classList.toggle('active', speedModeEnabled);
}

function getMasteryColor(level) {
  const levelColors = {
    0: '#ffffff',
    1: '#e53935',
    2: '#f57c00',
    3: '#f9a825',
    4: '#fdd835',
    5: '#9ccc65',
    6: '#4db6ac',
    7: '#42a5f5',
    8: '#5c6bc0',
    9: '#7e57c2',
    10: '#6b2fa0'
  };

  return levelColors[Math.max(0, Math.min(10, level))];
}

function updateMasteryChart() {
  const masteryChart = document.getElementById('masteryChart');
  const masteryLegend = document.getElementById('masteryLegend');
  if (!masteryChart || !masteryLegend || questions.length === 0) return;

  // Group by mastery level so each level renders as its own color section.
  const levelCounts = Array(11).fill(0);
  questions.forEach(q => {
    levelCounts[getMastery(q.word)]++;
  });

  const levelOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
  let currentDeg = 0;
  const segments = [];

  levelOrder.forEach(level => {
    const count = levelCounts[level];
    if (count === 0) return;

    const sliceDeg = (count / questions.length) * 360;
    const startDeg = Math.round(currentDeg * 100) / 100;
    const endDeg = Math.round((currentDeg + sliceDeg) * 100) / 100;
    segments.push(`${getMasteryColor(level)} ${startDeg}deg ${endDeg}deg`);
    currentDeg += sliceDeg;
  });

  if (segments.length === 0) {
    segments.push('#ffffff 0deg 360deg');
  }

  masteryChart.style.background = `conic-gradient(from -90deg, ${segments.join(', ')})`;

  masteryLegend.innerHTML = questions.map(q => {
    const mastery = getMastery(q.word);
    const color = getMasteryColor(mastery);
    const currentClass = currentQuestion && currentQuestion.word === q.word ? ' current' : '';
    return `
      <div class="legend-item${currentClass}">
        <span class="legend-color" style="background:${color}"></span>
        <span class="legend-word">${q.word}</span>
        <span class="legend-level">L${mastery}</span>
      </div>
    `;
  }).join('');
}

function startStudy() {
  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('container').style.display = 'flex';
  document.getElementById('backBtn').style.display = 'inline-block';
  document.body.classList.add('study-active');
  
  currentQuestionIndex = 0;
  correctInCategory = 0;
  
  updateProgress();
  updateMasteryChart();
  loadQuestion();
}

function goBack() {
  document.getElementById('mainMenu').style.display = 'block';
  document.getElementById('container').style.display = 'none';
  document.getElementById('backBtn').style.display = 'none';
  document.body.classList.remove('study-active');
  updateAllLevelMasteryCircles();
}

function updateAllLevelMasteryCircles() {
  // Update mastery circles for both levels on the main page
  for (let level = 1; level <= 2; level++) {
    const circleEl = document.getElementById(`masteryLevel${level}`);
    if (!circleEl) continue;
    
    const masteryData = masteryDataByLevel[level];
    const words = levelSentences[level]
      .split(/\s+/)
      .filter(w => w.length > 0)
      .map(w => w.toLowerCase().replace(/[.,!?;:]/g, ''));

    if (words.length === 0) {
      circleEl.style.background = 'conic-gradient(from -90deg, #ffffff 0deg 360deg)';
      continue;
    }
    
    // Count words by mastery level
    const levelCounts = Array(11).fill(0);
    words.forEach(word => {
      const mastery = masteryData?.[word] || 0;
      levelCounts[mastery]++;
    });
    
    const totalWords = words.length;
    const levelOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
    let currentDeg = 0;
    const segments = [];
    
    levelOrder.forEach(lvl => {
      const count = levelCounts[lvl];
      if (count === 0) return;
      
      const sliceDeg = (count / totalWords) * 360;
      const startDeg = Math.round(currentDeg * 100) / 100;
      const endDeg = Math.round((currentDeg + sliceDeg) * 100) / 100;
      segments.push(`${getMasteryColor(lvl)} ${startDeg}deg ${endDeg}deg`);
      currentDeg += sliceDeg;
    });
    
    if (segments.length === 0) {
      segments.push('#ffffff 0deg 360deg');
    }
    
    circleEl.style.background = `conic-gradient(from -90deg, ${segments.join(', ')})`;
  }
}

function getMastery(word) {
  const score = questions.find(q => q.word === word)?.score || 0;
  return Math.max(0, Math.min(10, score));
}

function updateProgress() {
  const totalWords = questions.length;
  const masteredWords = questions.filter(q => getMastery(q.word) >= 10).length;
  const progressPercent = (masteredWords / totalWords) * 100;
  
  const fill = document.getElementById('progressFill');
  fill.style.width = progressPercent + '%';
  
  // Update sidebar
  updateMasteryChart();
}

function loadQuestion() {
  // Pick a weighted random question
  currentQuestion = pickWeightedQuestion();
  questionLocked = false;
  
  if (!currentQuestion) {
    document.getElementById("question").innerHTML = "All words mastered! 🎉";
    document.getElementById("choices").innerHTML = "";
    return;
  }
  
  // Update mastery display
  const mastery = getMastery(currentQuestion.word);
  document.getElementById('masteryDisplay').textContent = mastery;
  
  // Display Spanish word
  document.getElementById("question").innerHTML = currentQuestion.word.toUpperCase();
  const sentenceView = document.getElementById('sentenceView');
  if (sentenceView) {
    sentenceView.textContent = levelSentences[selectedLevel];
  }
  
  // Display answer choices
  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  
  currentQuestion.choices.forEach((choice, index) => {
    let btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(btn, index, currentQuestion.correctIndex);
    choicesDiv.appendChild(btn);
  });
  
  // Re-enable skip button
  document.getElementById('skipBtn').disabled = false;
  
  // Update sidebar to highlight current word
  updateMasteryChart();
}

function pickWeightedQuestion() {
  const availableQuestions = questions.filter(q => getMastery(q.word) < 10);

  // If all questions are fully mastered, stop serving new questions.
  if (availableQuestions.length === 0) {
    return null;
  }

  // Separate questions by mastery level
  const highMastery = availableQuestions.filter(q => getMastery(q.word) >= 5);
  const lowMastery = availableQuestions.filter(q => getMastery(q.word) < 5);
  
  let selectedPool;
  
  if (studyDifficulty < 5) {
    // Easy difficulty (0-4): Prefer high mastery questions (review mastered material)
    const preferences = [(5 - studyDifficulty) * 20, 100 - ((5 - studyDifficulty) * 20)];
    const random = Math.random() * 100;
    selectedPool = random < preferences[0] ? highMastery : lowMastery;
  } else if (studyDifficulty > 5) {
    // Hard difficulty (6-10): Prefer low mastery questions (practice weak areas)
    const preferences = [(studyDifficulty - 5) * 20, 100 - ((studyDifficulty - 5) * 20)];
    const random = Math.random() * 100;
    selectedPool = random < preferences[0] ? lowMastery : highMastery;
  } else {
    // Medium difficulty (5): Mix of both equally
    const random = Math.random() * 100;
    selectedPool = random < 50 ? highMastery : lowMastery;
  }
  
  // Fallback if selected pool is empty
  if (selectedPool.length === 0) {
    selectedPool = highMastery.length > 0 ? highMastery : lowMastery;
  }
  
  // Pick from selected pool with weight-based probability
  const totalWeight = selectedPool.reduce((sum, q) => sum + q.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let q of selectedPool) {
    random -= q.weight;
    if (random <= 0) {
      return q;
    }
  }
  
  return selectedPool[0] || questions[0];
}

function checkAnswer(button, index, correctIndex) {
  if (questionLocked || !currentQuestion) return;
  
  questionLocked = true;
  let buttons = document.querySelectorAll('.choice');
  
  if (index === correctIndex) {
    // Correct!
    buttons[index].classList.add('correct');
    buttons.forEach(btn => btn.disabled = true);
    document.getElementById('skipBtn').disabled = true;
    
    currentQuestion.weight = Math.min(20, currentQuestion.weight + 1);
    currentQuestion.correctCount++;
    currentQuestion.score = Math.min(10, currentQuestion.score + 1);
    currentQuestion.lastCorrect = true;
    
    const updatedMastery = getMastery(currentQuestion.word);
    masteryDataByLevel[selectedLevel][currentQuestion.word] = updatedMastery;
    
    updateProgress();
    updateAllLevelMasteryCircles();
    document.getElementById('masteryDisplay').textContent = updatedMastery;
    
    // Check if all words are mastered
    if (questions.every(q => getMastery(q.word) >= 10)) {
      const finishDelay = speedModeEnabled ? 0 : 1000;
      setTimeout(() => {
        document.getElementById("question").innerHTML = "All Words Mastered! 🎉";
        document.getElementById("choices").innerHTML = "";
      }, finishDelay);
      return;
    }

    const nextDelay = speedModeEnabled ? 0 : 1000;
    setTimeout(loadQuestion, nextDelay);
  } else {
    // Wrong answer
    buttons.forEach((btn, i) => {
      if (i === correctIndex) btn.classList.add('correct');
      btn.disabled = true;
    });
    document.getElementById('skipBtn').disabled = true;
    
    // Reduce weight and correct count
    currentQuestion.weight = Math.max(1, currentQuestion.weight - 2);
    if (currentQuestion.correctCount > 0) {
      currentQuestion.correctCount--;
    }
    // Decrease score (minimum 0)
    currentQuestion.score = Math.max(0, currentQuestion.score - 1);

    const updatedMastery = getMastery(currentQuestion.word);
    masteryDataByLevel[selectedLevel][currentQuestion.word] = updatedMastery;
    updateProgress();
    updateAllLevelMasteryCircles();
    
    const nextDelay = speedModeEnabled ? 0 : 1500;
    setTimeout(loadQuestion, nextDelay);
  }
}

function skipQuestion() {
  if (!currentQuestion || questionLocked) return;
  
  questionLocked = true;
  currentQuestion.lastCorrect = false;
  
  loadQuestion();
}

