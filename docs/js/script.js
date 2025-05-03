var guessInput = null;
var randomCharacter = null;
var monstersDataSource = null;
var select2Data = null;
var cacheKey = null;
var dailyCountKey = null;
var alreadyGuessed = null;
var amountsGuessed = 0;
var mode = 'normal';
var correctShown = false;
var infiniteStreak = 0;
const _nativeRandom = Math.random;
const fab = document.querySelector('.fab-container');
const moreInfoBtn = fab.querySelector('.fab-main');

$(document).ready(function () {
  initNormalMode();
});

moreInfoBtn.addEventListener('click', () => {
  fab.classList.toggle('open');
});

document.addEventListener('click', e => {
  if (fab.classList.contains('open') && !fab.contains(e.target)) {
    fab.classList.remove('open');
  }
});

function showLoading() {
  $('#loading-overlay').show();
}
function hideLoading() {
  $('#loading-overlay').hide();
}

async function initNormalMode() {
  showLoading();
  $('#guessBtn').text("GUESS").off('click').on('click', guessCharacter);
  mode = 'normal';
  $('#resetTimer').show();
  $('#streakDisplay').hide();
  $('#attempts .rowGuessed').remove();
  $("#firstGuessText").show();
  $('.columns').css('margin-top', '0px');
  await loadSelect2Data();
  hideLoading();
  const todayKey = new Date().toISOString().split('T')[0];
  cacheKey = `deepwokendle_${todayKey}`;
  dailyCountKey = `${cacheKey}_amountsGuessed`;
  const saved = localStorage.getItem(dailyCountKey);
  amountsGuessed = saved != null ? parseInt(saved, 10) : 0;
  if (amountsGuessed) $('#amountsGuessed').text(`Tries: ${amountsGuessed}/∞`);
  Math.seedrandom(todayKey);
  let idx = Math.floor(Math.random() * monstersDataSource.length);
  randomCharacter = monstersDataSource[idx];
  checkIfAlreadyWon();
}

async function initInfiniteMode() {
  correctShown = false;
  guessInput.val(select2Data[0].id).trigger('change');
  mode = 'infinite';
  $('#resetTimer').hide();
  await loadSelect2Data();
  infiniteStreak = parseInt(localStorage.getItem('infiniteKillstreak')) || 0;
  updateStreakUI();

  amountsGuessed = 0;
  $('#amountsGuessed').text(`Tries: 0/5`);
  $('#attempts .rowGuessed').remove();
  $('.columns').css('margin-top', '22px');
  $("#firstGuessText").show();
  Math.random = _nativeRandom;
  let idx = Math.floor(Math.random() * monstersDataSource.length);
  randomCharacter = monstersDataSource[idx];
  guessInput.prop('disabled', false);
  $(".btn").prop("disabled", false).removeClass("disabled");
  $("#guessBtn").off('click').on('click', guessCharacter);
}

function updateStreakUI() {
  $('#streakDisplay').text(`Streak: ${infiniteStreak}`);
  $('#streakDisplay').show();
}

function guessCharacter() {
  if (mode === 'normal') {
    amountsGuessed++;
    localStorage.setItem(dailyCountKey, amountsGuessed);
  } else {
    amountsGuessed++;
  }
  $('#amountsGuessed').text(`Tries: ${amountsGuessed}/${mode == 'infinite' ? '5' : '∞'}`);
  const guessedId = guessInput.val();
  const monster = monstersDataSource.find(m => m.id == guessedId);
  const correct = monster.id == randomCharacter.id;
  if (correct) $("#guessBtn").off('click');
  let html = `<div class="col-md-12 rowGuessed firstGuess">`;
  $("#firstGuessText").css("display", "none")
  html += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back border">
            <img class="itemImg" src="./${monster.picture}" alt="">
          </div>
        </div>
      </div>`;

  ['name', 'gives', 'element', 'category', 'locations', 'humanoid']
    .forEach(field => {
      let display =
        field === 'gives' ? monster.gives.join(', ')
          : field === 'locations' ? monster.locations.join(', ')
            : field === 'humanoid' ? (monster.humanoid ? '✓' : 'X')
              : monster[field];

      let cssClass =
        field === 'gives' ? compareSets(randomCharacter.gives, monster.gives) : 
        field === 'locations' ? compareLocations(randomCharacter.locations, monster.locations) : 
        (monster[field] === randomCharacter[field] ? 'correct' : 'wrong');

        html += `
          <div class="flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front"></div>
              <div class="flip-card-back item border ${cssClass}">
                ${display}
              </div>
            </div>
          </div>`;
    });
  $("#firstGuessText").hide();
  html += `</div>`;

  const container = document.getElementById('attempts');
  container.querySelector('.firstGuess')?.classList.remove('firstGuess');
  container.querySelector('.headerContainer')
    .insertAdjacentHTML('afterend', html);

  const cards = document.querySelectorAll('.flip-card');
  if (!correct && amountsGuessed >= 5 && mode == 'infinite') {
    let tempStreak = infiniteStreak;
    infiniteStreak = 0;
    localStorage.setItem('infiniteKillstreak', infiniteStreak);
    Swal.fire({
      title: `You lost all of your tries and streak of ${tempStreak}! The character was ${randomCharacter.name}`,
      text: 'Try again?',
      showDenyButton: true,
      icon: 'error',
      confirmButtonText: 'Yes!',
      denyButtonText: `No!`,
      showCloseButton: true
    }).then((result) => {
      updateStreakUI();
      if (result.isConfirmed) {
        initInfiniteMode();
      }
      else if (result.isDenied || result.dismiss) {
        $('#guessBtn')
          .text('RETRY')
          .off('click')
          .on('click', () => {
            initInfiniteMode();
            $('#guessBtn')
              .text('GUESS')
              .off('click')
              .on('click', guessCharacter);
          });
      }
    });
  }
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('flipped');
      textFit(document.querySelectorAll('.item'), {
        alignHoriz: true,
        alignVert: true,
        multiLine: true,
        maxFontSize: 12,
        minFontSize: 6
      });
    }, i * 300);
  })

  setTimeout(() => {

    if (correct) {
      if (mode === 'normal') {
        Swal.fire({
          title: 'Success!',
          html: `You guessed it right! If you want to play more, go to the <a href="#" onclick="initInfiniteMode(); Swal.close();" style="font-weight:bold; text-decoration:underline; color: var(--background);">Infinite mode</a> or wait until tomorrow!`,
          icon: 'success',
          confirmButtonText: 'Nice'
        });
        localStorage.setItem(cacheKey, 'guessed');
        alreadyGuessed = localStorage.getItem(cacheKey);
        disableButtons();
      } else {
        Swal.fire({
          title: 'Correct!',
          showDenyButton: true,
          text: 'Go to the next round?',
          icon: 'success',
          confirmButtonText: 'Yes!',
          denyButtonText: `No!`,
          showCloseButton: true
        }).then((result) => {
          infiniteStreak++;
          localStorage.setItem('infiniteKillstreak', infiniteStreak);
          updateStreakUI();
          if (result.isConfirmed) {
            initInfiniteMode();
          }
          else if (result.isDenied || result.dismiss) {
            $('#guessBtn')
              .text('NEXT')
              .off('click')
              .on('click', () => {
                initInfiniteMode();
                $('#guessBtn')
                  .text('GUESS')
                  .off('click')
                  .on('click', guessCharacter);
              });
          }
        });
      }
    }
  }, 1500);
}

function disableButtons() {
  guessInput.prop('disabled', true);
  $(".btn").prop("disabled", true);
  $(".btn").addClass("disabled");
}

function checkIfAlreadyWon() {
  alreadyGuessed = localStorage.getItem(cacheKey);
  if (alreadyGuessed === 'guessed') {
    disableButtons();
    showCorrectCharacter();
    const today = new Date().toISOString().split('T')[0];
    const lastShown = localStorage.getItem('playedToday');
    if (lastShown === today) return;
    localStorage.setItem('playedToday', today);

    Swal.fire({
      title: 'You already played today!',
      html: `You have already guessed today's character, come back tomorrow or play the <a href="#" onclick="initInfiniteMode(); Swal.close();" style="font-weight:bold; text-decoration:underline; color: var(--background);">Infinite mode</a>!`,
      icon: 'info',
      confirmButtonText: 'Okay.'
    });
  }
}

function showCorrectCharacter() {
  guessInput.val(randomCharacter.id).trigger('change');
  let html = `<div class="col-md-12 rowGuessed firstGuess">`;
  $("#firstGuessText").css("display", "none");
  html += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back border">
            <img class="itemImg"src="./${randomCharacter.picture}" alt="">
          </div>
        </div>
      </div>`;

  ['name', 'gives', 'element', 'category', 'locations', 'humanoid'].forEach((field, idx) => {
    const display =
      field === 'gives'      ? randomCharacter.gives.join(', ')
    : field === 'locations'  ? randomCharacter.locations.join(', ')
    : field === 'humanoid'   ? (randomCharacter.humanoid ? '✓' : 'X')
    : randomCharacter[field];
      html += `
        <div class="flip-card">
          <div class="flip-card-inner">
            <div class="flip-card-front"></div>
            <div class="flip-card-back item border correct">
              ${display}
            </div>
          </div>
        </div>`;
  });

  html += `</div>`;

  const container = document.getElementById('attempts');

  container.querySelector('.firstGuess')?.classList.remove('firstGuess');
  const header = container.querySelector('.headerContainer');
  header.insertAdjacentHTML('afterend', html);

  const cards = document.querySelectorAll('.flip-card');
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('flipped');
      textFit(document.querySelectorAll('.item'), {
        alignHoriz: true,
        alignVert: true,
        multiLine: true,
        maxFontSize: 12,
        minFontSize: 6
      });
    }, i * 200);
  });
}

function compareLocations(correctLocs, guessLocs) {
  const correctSet = new Set(correctLocs);
  const guessSet   = new Set(guessLocs);

  if (guessSet.size === correctSet.size &&
      [...guessSet].every(loc => correctSet.has(loc))) {
    return 'correct';
  }
  if ([...guessSet].some(loc => correctSet.has(loc))) {
    return 'partial';
  }
  return 'wrong';
}

function compareSets(correctLoot, guessLoot) {
  const correctSet = new Set(correctLoot);
  const guessSet = new Set(guessLoot);

  const intersectionSize = [...guessSet].filter(x => correctSet.has(x)).length;
  if (intersectionSize === correctSet.size && guessSet.size === correctSet.size) {
    return 'correct';
  }
  if (intersectionSize > 0) {
    return 'partial';
  }
  return 'wrong';
}


async function fetchMonsters() {
  try {
    const response = await fetch("https://deepwokendle.onrender.com/api/monsters");
    if (!response.ok) throw new Error("Error while trying to fetch monsters");
    const monsters = await response.json();
    return monsters.map(m => ({
      id: m.id,
      name: m.name,
      picture: m.picture,
      humanoid: m.humanoid,
      element: m.element,
      category: m.category,
      locations: m.locations,
      gives: m.gives
    }));
  } catch (error) {
    console.error("Error while trying to fetch monsters:", error);
    return [];
  }
}

async function loadSelect2Data() {
  if (monstersDataSource) return;
  monstersDataSource = await fetchMonsters();
  select2Data = monstersDataSource
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => ({ id: m.id, text: m.name }));

  guessInput = $('#guessInput').select2({
    placeholder: 'Character',
    allowClear: true,
    width: 'resolve',
    minimumResultsForSearch: 0,
    data: select2Data
  });
}
function updateResetTimer() {
  if (alreadyGuessed != "guessed") return;
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  const diffMs = tomorrow - now;
  const hours = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
  $('#resetTimer').text(`Character resetting in ${hours}:${minutes}:${seconds}`);
}


const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
  sidebar.classList.toggle('open');
  sidebar.classList.toggle('border');
  overlay.classList.toggle('visible');
}

hamburger.addEventListener('click', toggleSidebar);

overlay.addEventListener('click', toggleSidebar);

document.getElementById('normalMode').addEventListener('click', () => {
  mode = 'normal';
  toggleSidebar();
  initNormalMode();
});
document.getElementById('infiniteMode').addEventListener('click', () => {
  mode = 'infinite';
  toggleSidebar();
  initInfiniteMode();
});

setInterval(updateResetTimer, 1000);