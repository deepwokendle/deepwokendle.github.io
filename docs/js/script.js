var guessInput = null;
var elementInput = null;
var categoryInput = null;
var monsterLootInput = null;
var locationInput = null;
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
var isLoginMode = true;
var debounce = false;
var debounceCharacter = false;
var pendingLoginResolver = null;
var pendingLoginRejector = null;
const _nativeRandom = Math.random;
const fab = document.querySelector('.fab-container');
const moreInfoBtn = fab.querySelector('.fab-main');
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const sharkoImg = document.querySelector('.mini-sharko');
const sharkoContainer = document.querySelector('.mini-sharko-container');
const images = ['img/mini-sharko.png', 'img/mini-sharko-2.png'];
let fi = 0;

$(document).ready(function () {
  initNormalMode();
  var token = localStorage.getItem("token");
  var savedUsername = localStorage.getItem("username");
  if (token)
    $("#suggestMonsterSideBar").css("display", "block");

  if (savedUsername)
    $(".username").text(savedUsername);
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
  $("#firstGuessText").css("top", "60%");
  $(".tempContainer").show();
  showLoading();
  $('#guessBtn').text("GUESS").off('click').on('click', guessCharacter);
  mode = 'normal';
  $('#resetTimer').show();
  $('#streakDisplay').hide();
  $('#attempts .rowGuessed').remove();
  $("#firstGuessText").show();
  $('.columns').css('margin-top', '0px');
  await loadSelect2Data();
  const todayKey = new Date().toISOString().split('T')[0];
  cacheKey = `deepwokendle_${todayKey}`;
  dailyCountKey = `${cacheKey}_amountsGuessed`;
  const saved = localStorage.getItem(dailyCountKey);
  amountsGuessed = saved != null ? parseInt(saved, 10) : 0;
  if (amountsGuessed) $('#amountsGuessed').text(`Tries: ${amountsGuessed}/∞`);
  randomCharacter = await fetchRandomMonster();
  randomCharacter = monstersDataSource.find(monster => monster.id === randomCharacter);
  hideLoading();
  checkIfAlreadyWon();
}

async function initInfiniteMode() {
  $("#firstGuessText").css("top", "65%");
  $(".tempContainer").show();
  showLoading();
  correctShown = false;
  guessInput.val(select2Data[0].id).trigger('change');
  mode = 'infinite';
  $('#resetTimer').hide();
  $('#attempts .rowGuessed').remove();
  $('.columns').css('margin-top', '22px');
  $("#firstGuessText").show();
  await loadSelect2Data();
  var randomCharacterId = await fetchRandomInfiniteMonster();
  randomCharacter = monstersDataSource.find(monster => monster.id === randomCharacterId);
  amountsGuessed = await fetchStreakAmount();
  $('#amountsGuessed').text(`Tries: ${amountsGuessed ?? 0}/5`);
  updateStreakUI();
  guessInput.prop('disabled', false);
  $(".btn").prop("disabled", false).removeClass("disabled");
  $("#guessBtn").off('click').on('click', guessCharacter);
}

function updateStreakUI() {
  $('#streakDisplay').text(`Streak: ${infiniteStreak}`);
  $('#streakDisplay').show();
}

async function guessCharacter() {
  $(".tempContainer").hide();
  const guessedId = guessInput.val();
  if (mode === 'normal') {
    amountsGuessed++;
    localStorage.setItem(dailyCountKey, amountsGuessed);
  } else {
    if (debounceCharacter)
      return;
    showLoading();
    debounceCharacter = true;
    amountsGuessed++;
    const attemptData = {
      MonsterId: parseInt(guessedId, 10),
      User: localStorage.getItem("username"),
      GuessDate: new Date().toISOString().slice(0, 10),
      Infinite: true
    };
    const response = await fetch(getApiUrl() + "/Attempts/insert-attempt", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(attemptData)
    });
    debounceCharacter = false;
    if (!response.ok) {
      hideLoading();
      throw new Error(`Error at registering attempt`);
    }
    hideLoading();
  }
  $('#amountsGuessed').text(`Tries: ${amountsGuessed}/${mode == 'infinite' ? '5' : '∞'}`);
  const monster = monstersDataSource.find(m => m.id == guessedId);
  const correct = monster.id == randomCharacter.id;
  if (correct) $("#guessBtn").off('click');
  let html = `<div class="col-md-12 rowGuessed firstGuess">`;
  $("#firstGuessText").css("display", "none")
  const src = monster.picture.startsWith('http') ? monster.picture : `./${monster.picture}`;
  html += `
      <div class="flip-card try${amountsGuessed}">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back border">
            <img class="itemImg" src="${src}" alt="">
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
          <div class="flip-card try${amountsGuessed}">
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

  const cards = document.querySelectorAll(`.flip-card.try${amountsGuessed}`);
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

function showCharacter(id) {
  $(".tempContainer").hide();
  const monster = monstersDataSource.find(m => m.id == id);
  const correct = monster.id == randomCharacter.id;
  if (correct) $("#guessBtn").off('click');
  let html = `<div class="col-md-12 rowGuessed firstGuess">`;
  $("#firstGuessText").css("display", "none")
  const src = monster.picture.startsWith('http') ? monster.picture : `./${monster.picture}`;
  html += `
      <div class="flip-card try${amountsGuessed}">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back border">
            <img class="itemImg" src="${src}" alt="">
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
          <div class="flip-card try${amountsGuessed}">
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

  const cards = document.querySelectorAll(`.flip-card.try${amountsGuessed}`);
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
  $(".tempContainer").hide();
  guessInput.val(randomCharacter.id).trigger('change');
  let html = `<div class="col-md-12 rowGuessed firstGuess">`;
  $("#firstGuessText").css("display", "none");
  const src = randomCharacter.picture.startsWith('http') ? randomCharacter.picture : `./${randomCharacter.picture}`;
  html += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back border">
            <img class="itemImg"src="${src}" alt="">
          </div>
        </div>
      </div>`;

  ['name', 'gives', 'element', 'category', 'locations', 'humanoid'].forEach((field, idx) => {
    const display =
      field === 'gives' ? randomCharacter.gives.join(', ')
        : field === 'locations' ? randomCharacter.locations.join(', ')
          : field === 'humanoid' ? (randomCharacter.humanoid ? '✓' : 'X')
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
  const guessSet = new Set(guessLocs);

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

async function fetchRandomMonster() {
  try {
    const response = await fetch(getApiUrl() + "/Monsters/daily-monster");
    if (!response.ok) throw new Error("Error while trying to fetch random monster");
    const monster = await response.json();
    return monster;
  } catch (error) {
    console.error("Error while trying to fetch random monster:", error);
    return [];
  }
}

async function fetchStreakAmount() {
  try {
    let username = localStorage.getItem("username");
    let token = localStorage.getItem("token");
    const response = await fetch(getApiUrl() + "/Attempts/get-streak?username=" + (token ? username : null));
    if (!response.ok) throw new Error("Error while trying to fetch streaks");
    const result = await response.json();
    infiniteStreak = result.streakAmmount ?? 0;
    let delay = 0;
    for (const id of result.npcsGuessedIds) {
      await new Promise(resolve => setTimeout(resolve, delay));
      showCharacter(id);
      delay += 75;
      hideLoading();
    }
    hideLoading();
    return result.attemptsAmount || 0;
  } catch (error) {
    hideLoading();
    console.error("Error while trying to fetch infinite random monster:", error);
    return [];
  }
}

async function fetchRandomInfiniteMonster() {
  try {
    let username = localStorage.getItem("username");
    let token = localStorage.getItem("token");
    const response = await fetch(getApiUrl() + "/Monsters/infinite-monster?username=" + (token ? username : null));
    if (!response.ok) throw new Error("Error while trying to fetch infinite random monster");
    const monsterId = await response.json();
    return monsterId;
  } catch (error) {
    console.error("Error while trying to fetch infinite random monster:", error);
    return [];
  }
}

async function fetchMonsters() {
  try {
    const response = await fetch(getApiUrl() + "/Monsters/getMonsters");
    if (!response.ok) throw new Error("Error while trying to fetch monsters");
    const monsters = await response.json();
    return monsters.map(m => ({
      id: m.id,
      name: m.name,
      picture: m.picture,
      humanoid: m.humanoid,
      mainHabitat: m.mainHabitat,
      element: m.element?.name || "Unknown",
      category: m.category?.name || "Unknown",
      gives: m.lootPool?.map(l => l.lootName) || [],
      locations: m.locationPool?.map(loc => loc.name) || []
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
document.getElementById('suggestMonsterSideBar').addEventListener('click', () => {
  toggleSidebar();
  toggleModalSuggestMonster(true);
});

document.getElementById('leaderboardSideBar').addEventListener('click', () => {
  toggleSidebar();
  toggleModalLeaderboard(true);
});

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

async function toggleModalSuggestMonster(show) {
  const modal = document.getElementById('suggestMonsterModal');
  if (show) {
    showLoading();
    await loadComponentsSuggestingMonster();
    hideLoading();
    modal.classList.add('show');
  } else {
    modal.classList.remove('show');
  }
}

async function toggleModalLeaderboard(show = true) {
  const modal = document.getElementById('leaderboardModal');
  if (show) {
    await initLeaderboard();
    modal.classList.add('show');
  } else {
    modal.classList.remove('show');
  }
}

async function fetchLeaderboardData() {
  try {
    const res = await fetch(getApiUrl() + "/Leaderboard/get-leaderboard");
    if (!res.ok) throw new Error('Error at fetching leaderboard data');
    var result = await res.json();
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function initLeaderboard() {
  try {
    const data = await fetchLeaderboardData();
    const gridData = data.map(item => [item.place, item.username, item.maxStreak]);

    if (window.leaderboardGridInstance) {
      window.leaderboardGridInstance.updateConfig({ gridData }).forceRender();
    } else {
      window.leaderboardGridInstance = new gridjs.Grid({
        columns: [
          { id: 'place', name: 'Position' },
          {
            id: 'user', name: 'User', attributes: (cell, row) => ({
              class: 'user-cell gridjs-th gridjs-th-sort'
            })
          },
          { id: 'maxStreak', name: 'Max Streak' },
        ],
        data: gridData,
        pagination: { enabled: true, limit: 10 },
        sort: true,
        search: true,
        resizable: true,
        style: {
          table: { 'border-collapse': 'collapse' },
          td: { 'text-align': 'center', 'background': 'var(--button-background)', 'color': 'white' },
          th: { 'background-color': 'white', 'color': 'var(--text-color)' }
        }
      }).render(document.getElementById('leaderboardGrid'));
      $(".gridjs-search").addClass('border');
    }
  }
  catch (err) {
    console.log(err);
  }
}
async function getElementData() {
  try {
    const response = await fetch(getApiUrl() + "/Elements/getElements");
    if (!response.ok) throw new Error("Error while trying to fetch elements");
    const elements = await response.json();
    return elements.map(e => ({
      id: e.id,
      name: e.name,
    }));
  } catch (error) {
    console.error("Error while trying to fetch elements:", error);
    return [];
  }
}

async function getCategoryData() {
  try {
    const response = await fetch(getApiUrl() + "/Categories/getCategories");
    if (!response.ok) throw new Error("Error while trying to fetch categories");
    const categories = await response.json();
    return categories.map(e => ({
      id: e.id,
      name: e.name,
    }));
  } catch (error) {
    console.error("Error while trying to fetch categories:", error);
    return [];
  }
}
async function getLootData() {
  try {
    const response = await fetch(getApiUrl() + "/Loots/getLoots");
    if (!response.ok) throw new Error("Error while trying to fetch loots");
    const loots = await response.json();
    return loots.map(e => ({
      id: e.id,
      name: e.name
    }));
  } catch (error) {
    console.error("Error while trying to fetch loots:", error);
    return [];
  }
}


async function getLocationData() {
  try {
    const response = await fetch(getApiUrl() + "/Locations/getLocations");
    if (!response.ok) throw new Error("Error while trying to fetch locations");
    const locations = await response.json();
    return locations.map(e => ({
      id: e.id,
      name: e.name,
    }));
  } catch (error) {
    console.error("Error while trying to fetch locations:", error);
    return [];
  }
}

async function loadComponentsSuggestingMonster() {
  if (!elementInput) {
    var elementData = await getElementData();
    elementData = elementData
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(m => ({ id: m.id, text: m.name }));
    elementInput = $('#elementId').select2({
      placeholder: 'Element',
      allowClear: true,
      width: 'resolve',
      minimumResultsForSearch: 0,
      data: elementData
    });
  }

  if (!categoryInput) {
    var categoryData = await getCategoryData();
    categoryData = categoryData
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(m => ({ id: m.id, text: m.name }));
    categoryInput = $('#categoryId').select2({
      placeholder: 'Category',
      allowClear: true,
      width: 'resolve',
      minimumResultsForSearch: 0,
      data: categoryData
    });
  }

  if (!locationInput) {
    var locationData = await getLocationData();
    locationData = locationData
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(m => ({ id: m.id, text: m.name }));
    locationInput = $('#location').select2({
      placeholder: 'Locations',
      allowClear: true,
      width: 'resolve',
      minimumResultsForSearch: 0,
      multiple: true,
      data: locationData
    });
  }

  if (!monsterLootInput) {
    var lootData = await getLootData();
    lootData = lootData
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(m => ({ id: m.id, text: m.name }));
    monsterLootInput = $('#monsterLoot').select2({
      placeholder: 'Loots',
      allowClear: true,
      width: 'resolve',
      minimumResultsForSearch: 0,
      multiple: true,
      data: lootData
    });
  }
}

function toggleModal(show, isLoggingByClick) {
  if (isLoggingByClick)
    loggingIn = true;
  else
    loggingIn = false;
  const modal = document.getElementById('loginSignUpModal');
  if (show) {
    modal.classList.add('show');
  } else {
    modal.classList.remove('show');
  }
  let token = localStorage.getItem('token');
  if (token) {
    $(".loggedOutContainer").hide();
    $(".loggedInContainer").show();
  } else {
    $(".loggedOutContainer").show();
    $(".loggedInContainer").hide();
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.reload();
}

function manageSignUpLoginModal() {
  isLoginMode = !isLoginMode;
  const modal = document.getElementById('loginSignUpModal');
  const title = modal.querySelector('.title');
  const actionButton = modal.querySelector('.modal-buttons button:first-child');
  const switchButton = modal.querySelector('.register');

  if (isLoginMode) {
    title.textContent = 'Login';
    actionButton.textContent = 'Login';
    actionButton.setAttribute('onclick', 'loginUser()');
    switchButton.innerHTML = 'Create an account -->';
  } else {
    title.textContent = 'Sign Up';
    actionButton.textContent = 'Sign Up';
    actionButton.setAttribute('onclick', 'signupUser()');
    switchButton.innerHTML = 'Already have an account? -->';
  }

  modal.classList.add('show');
}

async function signupUser() {
  showLoading();
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;

  try {
    const response = await fetch(getApiUrl() + "/Auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Username: username,
        Password: password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed.");
    }

    hideLoading();
    Swal.fire({
      icon: 'success',
      title: 'Registration successful!',
      text: 'You can now log in with your credentials.',
      confirmButtonText: 'Great!',
      showCloseButton: true
    });

    manageSignUpLoginModal();
  } catch (error) {
    hideLoading();
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: error.message,
      confirmButtonText: 'Okay',
      showCloseButton: true
    });
    return null;
  }
}

function waitForLogin() {
  return new Promise((resolve, reject) => {
    pendingLoginResolver = resolve;
    pendingLoginRejector = reject;
    toggleModal(true, true);
  });
}

async function loginUser() {
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;
  if (!username || !password)
    return;
  try {
    showLoading();
    const response = await fetch(getApiUrl() + "/Auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username: username, Password: password })
    });

    if (!response.ok) throw new Error("Invalid username or password.");

    const result = await response.json();
    hideLoading();

    Swal.fire({
      icon: 'success',
      title: 'Login successful!',
      confirmButtonText: 'Nice!',
      showCloseButton: true
    });

    localStorage.setItem("token", result.token);
    localStorage.setItem("username", result.user.username ?? "");
    $(".username").text(result.user.username ?? username);
    $("#suggestMonsterSideBar").css("display", "block");

    toggleModal(false);

    if (pendingLoginResolver) {
      pendingLoginResolver(result);
      pendingLoginResolver = null;
      pendingLoginRejector = null;
    }
    return result;
  } catch (error) {
    hideLoading();
    Swal.fire({
      title: 'Error!',
      showDenyButton: true,
      text: 'Invalid Credentials.',
      icon: 'error',
      confirmButtonText: 'Okay!',
      denyButtonText: `Cancel`,
      showCloseButton: true
    });

    if (pendingLoginRejector) {
      pendingLoginRejector(error);
      pendingLoginResolver = null;
      pendingLoginRejector = null;
    }

    return null;
  }
}

async function suggestMonster() {
  if (debounce)
    return;
  debounce = true;
  showLoading();
  const formData = new FormData();

  formData.append("Name", $("#monsterName").val());
  formData.append("Humanoid", $("#isHumanoid").prop("checked"));
  formData.append("ElementId", elementInput.val());
  formData.append("CategoryId", categoryInput.val());

  const selectedLocations = locationInput.val() || [];
  selectedLocations.forEach(loc => {
    formData.append("LocationsId", loc);
  });

  const selectedLoots = monsterLootInput.val() || [];
  selectedLoots.forEach(loot => {
    formData.append("LootsId", loot);
  });

  const fileInput = document.getElementById("monsterPicture");
  const file = fileInput.files[0];
  if (!file) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select a valid image.',
      showConfirmButton: true
    });
    hideLoading();
    debounce = false;
    return;
  }

  formData.append("File", file);

  try {
    const response = await fetch(getApiUrl() + "/Monsters/createMonster", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: formData
    });
    if (response.status === 401) {
      hideLoading();
      debounce = false;
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Login before suggesting a monster!',
        confirmButtonText: 'Ok'
      });
      return null;
    }

    if (!response.ok) {
      hideLoading();
      throw new Error(response);
    }
    const result = await response.json();
    hideLoading();

    Swal.fire({
      title: 'Success',
      text: 'Suggestion confirmed succesfully.',
      icon: 'success',
      confirmButtonText: 'Nice!',
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        confirmBtn.disabled = true;
        setTimeout(() => {
          confirmBtn.disabled = false;
        }, 1500);
      }
    });

    $("#monsterName").val("");
    $("#isHumanoid").prop("checked", false);
    elementInput.val(null).trigger("change");
    categoryInput.val(null).trigger("change");
    locationInput.val(null).trigger("change");
    monsterLootInput.val(null).trigger("change");
    fileInput.value = "";

    $("#suggestMonsterSideBar").css("display", "block");
    debounce = false;
    return result;

  } catch (error) {
    hideLoading();
    debounce = false;
    Swal.fire({
      icon: 'error',
      title: 'Monster suggestion failed.',
      text: "Check if you correctly filled the fields.",
      showConfirmButton: true
    });
    return null;
  }
}

function annihilateBabySharko() {
  const img = document.querySelector('.mini-sharko');
  if (!img) return;

  if (img.dataset.exploding === '1') return;
  img.dataset.exploding = '1';

  const rect = img.getBoundingClientRect();
  const src = img.src;
  const body = document.body;
  const particlesWrap = document.createElement('div');
  particlesWrap.className = 'sharko-particles';
  particlesWrap.style.left = (rect.left + window.scrollX) + 'px';
  particlesWrap.style.top = (rect.top + window.scrollY) + 'px';
  particlesWrap.style.width = rect.width + 'px';
  particlesWrap.style.height = rect.height + 'px';
  body.appendChild(particlesWrap);
  img.style.visibility = 'hidden';
  const cols = 6;
  const rows = 6;
  const total = cols * rows;
  const pw = rect.width / cols;
  const ph = rect.height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const part = document.createElement('div');
      part.className = 'particle';
      part.style.width = Math.ceil(pw) + 'px';
      part.style.height = Math.ceil(ph) + 'px';
      part.style.left = Math.round(c * pw) + 'px';
      part.style.top = Math.round(r * ph) + 'px';
      part.style.backgroundImage = `url("${src}")`;
      part.style.backgroundPosition = `-${Math.round(c * pw)}px -${Math.round(r * ph)}px`;
      part.style.backgroundSize = `${rect.width}px ${rect.height}px`;
      particlesWrap.appendChild(part);

      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 700;
      const translateX = Math.cos(angle) * distance;
      const translateY = Math.sin(angle) * distance - (200 * Math.random());
      const rotateDeg = (Math.random() * 720) - 360;
      const scale = 0.6 + Math.random() * 1.8;

      const delay = Math.random() * 150; // ms

      setTimeout(() => {
        part.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotateDeg}deg) scale(${scale})`;
        part.style.opacity = '0';
      }, 20 + delay);
    }
  }

  particlesWrap.animate([
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(-6px) rotate(-3deg)' },
    { transform: 'translateY(3px) rotate(2deg)' },
    { transform: 'translateY(0) rotate(0deg)' }
  ], {
    duration: 350,
    iterations: 2,
    easing: 'ease-out'
  });

  const totalLifetime = 2200;
  setTimeout(() => {
    particlesWrap.remove();
    img.remove();
  }, totalLifetime + 100);
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    toggleModal(false);
    toggleModalSuggestMonster(false);
  }
});

setInterval(updateResetTimer, 1000);

setInterval(() => {
  if(getComputedStyle(sharkoContainer).animationPlayState == 'paused'){
    sharkoImg.src = images[0];
    return;
  }
  fi = (fi + 1) % images.length;
  sharkoImg.src = images[fi];
  sharkoImg.classList.toggle('sharko-iteration')
}, 200);

sharkoContainer.addEventListener('animationiteration', () => {
  sharkoImg.classList.toggle('flipped');
});