/**
 * 上砂川町まるごとクイズ 2025
 * クイズロジック
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM要素の取得 ---
  const introSection = document.getElementById('intro-section');
  const startButton = document.getElementById('startButton');
  const quizForm = document.getElementById('quizForm');
  const questionsContainer = document.getElementById('questions-container');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const submitButton = document.getElementById('submitButton');
  const resultsDiv = document.getElementById('results');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const feedbackArea = document.getElementById('feedbackArea');
  const resetButton = document.getElementById('resetButton');
  const progressFill = document.getElementById('progressFill');
  const questionCounter = document.getElementById('questionCounter');

  let questions = [];
  let currentQuestionIndex = 0;

  // --- クイズデータの読み込み ---
  async function loadQuestions() {
    try {
      const response = await fetch('data/questions.json');
      if (!response.ok) throw new Error('データの読み込みに失敗しました');
      questions = await response.json();
    } catch (error) {
      console.error(error);
      questionsContainer.innerHTML = `
        <p style="color: #e53e3e; text-align: center; padding: 2rem;">
          クイズデータの読み込みに失敗しました。<br>ページを再読み込みしてください。
        </p>`;
    }
  }

  // --- 問題HTMLの動的生成 ---
  function renderQuestions() {
    questionsContainer.innerHTML = '';

    questions.forEach((q, index) => {
      const section = document.createElement('div');
      section.id = `question-${q.id}`;
      section.className = 'question-section';
      section.style.display = index === 0 ? 'block' : 'none';

      const optionsHtml = q.options.map(opt => `
        <label class="option-label">
          <input type="radio" name="q${q.id}" value="${opt.label}">
          ${opt.label}) ${opt.text}
        </label>
      `).join('');

      section.innerHTML = `
        <span class="question-category">${q.category}</span>
        <p class="question-title">【第${q.id}問】<br>${q.question}</p>
        ${optionsHtml}
      `;

      questionsContainer.appendChild(section);
    });
  }

  // --- 表示の更新 ---
  function updateDisplay() {
    const sections = questionsContainer.querySelectorAll('.question-section');
    sections.forEach((section, index) => {
      section.style.display = index === currentQuestionIndex ? 'block' : 'none';
    });

    // プログレスバー
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';
    questionCounter.textContent = `問題 ${currentQuestionIndex + 1} / ${questions.length}`;

    // ボタン制御
    prevButton.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-flex';

    if (currentQuestionIndex === questions.length - 1) {
      nextButton.style.display = 'none';
      submitButton.style.display = 'inline-flex';
    } else {
      nextButton.style.display = 'inline-flex';
      submitButton.style.display = 'none';
    }

    // スクロール
    window.scrollTo({ top: quizForm.offsetTop - 20, behavior: 'smooth' });
  }

  // --- 採点 ---
  function gradeQuiz() {
    let score = 0;
    feedbackArea.innerHTML = '';

    questions.forEach(q => {
      const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
      let html = '';

      if (selected && selected.value === q.answer) {
        score++;
        html = `
          <div class="answer-feedback correct">
            <span class="feedback-icon">✅</span>
            <div>
              <strong>第${q.id}問: 正解！</strong>
              <div class="explanation-text">${q.explanation}</div>
            </div>
          </div>`;
      } else if (selected) {
        html = `
          <div class="answer-feedback incorrect">
            <span class="feedback-icon">❌</span>
            <div>
              <strong>第${q.id}問: 不正解</strong>（正解: ${q.answer}）
              <div class="explanation-text">${q.explanation}</div>
            </div>
          </div>`;
      } else {
        html = `
          <div class="answer-feedback incorrect">
            <span class="feedback-icon">⚠️</span>
            <div>
              <strong>第${q.id}問: 未回答</strong>（正解: ${q.answer}）
              <div class="explanation-text">${q.explanation}</div>
            </div>
          </div>`;
      }

      feedbackArea.innerHTML += html;
    });

    scoreDisplay.textContent = `${score} / ${questions.length} 問正解`;
    quizForm.style.display = 'none';
    resultsDiv.style.display = 'block';
    window.scrollTo({ top: resultsDiv.offsetTop - 20, behavior: 'smooth' });
  }

  // --- イベントリスナー ---
  startButton.addEventListener('click', () => {
    introSection.style.display = 'none';
    quizForm.style.display = 'block';
    currentQuestionIndex = 0;
    updateDisplay();
  });

  nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      updateDisplay();
    }
  });

  prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateDisplay();
    }
  });

  submitButton.addEventListener('click', gradeQuiz);

  resetButton.addEventListener('click', () => {
    // ラジオボタンをすべてリセット
    questions.forEach(q => {
      const radios = document.querySelectorAll(`input[name="q${q.id}"]`);
      radios.forEach(r => r.checked = false);
    });

    resultsDiv.style.display = 'none';
    feedbackArea.innerHTML = '';
    introSection.style.display = 'block';
    quizForm.style.display = 'none';
    currentQuestionIndex = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 初期化 ---
  loadQuestions().then(() => {
    if (questions.length > 0) {
      renderQuestions();
    }
  });
});
