var guessInput = null;
var randomCharacter = null;
var monstersDataSource = null;
var cacheKey = null;
var alreadyGuessed = null;
var amountsGuessed = 0;
$(document).ready(function () {
    loadSelect2Data();
});

function guessCharacter() {
    amountsGuessed += 1;
    localStorage.setItem('amountsGuessed', amountsGuessed);
    $('#amountsGuessed').text(`Tries: ${amountsGuessed}`);
    let html = `<div class="col-md-12 rowGuessed firstGuess">`;
    $("#firstGuessText").css("display", "none")
    html += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back item border">
            <img src="./${monstersDataSource[guessInput.val() - 1].picture}" alt="">
          </div>
        </div>
      </div>`;

    ['name', 'fightingStyle', 'mainHabitat', 'humanoid'].forEach((field, idx) => {
        const monster = monstersDataSource[guessInput.val() - 1];
        const isCorrect = monster[field] == randomCharacter[field];
        const display = field === 'humanoid' ? (monster[field] ? '✓' : 'X') : monster[field];
        html += `
        <div class="flip-card">
          <div class="flip-card-inner">
            <div class="flip-card-front"></div>
            <div class="flip-card-back item border ${isCorrect ? 'correct' : 'wrong'}">
              ${display}
            </div>
          </div>
        </div>`;
    });

    html += `</div>`;

    const container = document.getElementById('attempts');

    container.querySelector('.firstGuess')?.classList.remove('firstGuess');
    const header = container.querySelector('.columns');
    header.insertAdjacentHTML('afterend', html);

    const cards = document.querySelectorAll('.flip-card');
    if (randomCharacter.id == monstersDataSource[guessInput.val() - 1].id) {
        disableButtons();
    }
    if (amountsGuessed > 0)
        $('#amountsGuessed').text(`Tries: ${amountsGuessed}`);
    cards.forEach((card, i) => {
        setTimeout(() => {
            card.classList.add('flipped');
            if (i === cards.length - 2) {
                checkGuess();
            }
        }, i * 200);
    });
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
        Swal.fire({
            title: 'You already played today!',
            text: `You have already guessed today's character, come back tomorrow!`,
            icon: 'info',
            confirmButtonText: 'Okay.'
        });
    }
}

function showCorrectCharacter() {
    let html = `<div class="col-md-12 rowGuessed firstGuess">`;
    $("#firstGuessText").css("display", "none");
    html += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back item border">
            <img src="./${randomCharacter.picture}" alt="">
          </div>
        </div>
      </div>`;

    ['name', 'fightingStyle', 'mainHabitat', 'humanoid'].forEach((field) => {
        const display = field === 'humanoid' ? (randomCharacter[field] ? '✓' : 'X') : randomCharacter[field];
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
    const header = container.querySelector('.columns');
    header.insertAdjacentHTML('afterend', html);

    const cards = document.querySelectorAll('.flip-card');
    cards.forEach((card, i) => {
        setTimeout(() => {
            card.classList.add('flipped');
        }, i * 200);
    });
}

function checkGuess() {
    if (randomCharacter.id == monstersDataSource[guessInput.val() - 1].id) {
        Swal.fire({
            title: 'Success!',
            text: 'You guessed it right!',
            icon: 'success',
            confirmButtonText: 'Nice'
        });
        localStorage.setItem(cacheKey, 'guessed');
        alreadyGuessed = localStorage.getItem(cacheKey);
    }
}

async function fetchMonsters() {
    try {
        const response = await fetch("https://deepwokendle.onrender.com/api/monsters");
        if (!response.ok) throw new Error("Error while trying to fetch monsters");

        const monsters = await response.json();
        return monsters.map(monster => ({
            id: monster.id,
            name: monster.name,
            picture: monster.picture,
            fightingStyle: monster.fightingStyle,
            mainHabitat: monster.mainHabitat,
            humanoid: monster.humanoid
        }));
    } catch (error) {
        console.error("Error while trying to fetch monsters:", error);
        return [];
    }
}

async function loadSelect2Data() {
    monstersDataSource = await fetchMonsters();
    const dataSource = monstersDataSource.map(monster => ({
        id: monster.id,
        text: monster.name
    }));
    guessInput = $('#guessInput').select2({
        placeholder: 'Character',
        allowClear: true,
        width: 'resolve',
        minimumResultsForSearch: 0,
        data: dataSource
    });
    const todayKey = new Date().toISOString().split('T')[0];
    cacheKey = `deepwokendle_${todayKey}`;
    const saved = localStorage.getItem('amountsGuessed');
    amountsGuessed = saved !== null ? parseInt(saved, 10) : 0;
    if (amountsGuessed > 0)
        $('#amountsGuessed').text(`Tries: ${amountsGuessed}`);
    Math.seedrandom(todayKey);
    const idx = Math.floor(Math.random() * monstersDataSource.length);
    randomCharacter = monstersDataSource[idx];
    checkIfAlreadyWon();
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

setInterval(updateResetTimer, 1000);
