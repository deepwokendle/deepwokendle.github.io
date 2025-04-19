var guessInput = null;
var randomCharacter = null;

$(document).ready(function () {
    loadSelect2Data();
});

function guessCharacter() {
    console.log("Selecionado:", guessInput.val());
    console.log("Acertou?:", guessInput.val() == randomCharacter ? "Sim" : "Não");
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
    const monsters = await fetchMonsters();

    const dataSource = monsters.map(monster => ({
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

    randomCharacter = monsters[Math.floor(Math.random() * monsters.length)];
    console.log("Personagem sorteado:", randomCharacter);
}
