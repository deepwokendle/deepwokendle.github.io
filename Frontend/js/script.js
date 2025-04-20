var guessInput = null;
var randomCharacter = null;
var monstersDataSource = null;
$(document).ready(function () {
    loadSelect2Data();
});
function guessCharacter() {
    let html = `<div class="col-md-12 rowGuessed firstGuess">`;
    $("#firstGuessText").css("display", "none")
    html += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front"></div>
          <div class="flip-card-back item border">
            <img src="..${monstersDataSource[guessInput.val() - 1].picture}" alt="">
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

    const el = document.getElementById('attempts');
    $('.firstGuess').removeClass('firstGuess');
    el.innerHTML = html + el.innerHTML;

    document.querySelectorAll('.flip-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('flipped'), i * 200);
    });
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
    Math.seedrandom(todayKey);
    const idx = Math.floor(Math.random() * monstersDataSource.length);
    randomCharacter = monstersDataSource[idx];
    console.log("Personagem sorteado:", randomCharacter);
}
