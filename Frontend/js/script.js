var guessInput = null;
var randomCharacter = null;
var dataSource = [
    { id: '0', text: 'Sharko' },
    { id: '1', text: 'Akira' },
    { id: '2', text: 'Owl' }
]

randomizeCharacter();

$(document).ready(function () {
    guessInput = $('#guessInput').select2({
        placeholder: 'Character',
        allowClear: true,
        width: 'resolve',
        minimumResultsForSearch: 0,
        data: dataSource
    });
});

function guessCharacter(){
    console.log("Selecionado:", guessInput.val());
    console.log("Acertou?:", guessInput.val() == randomCharacter ? "Sim" : "Não");
}

function randomizeCharacter(){
    randomCharacter = Math.floor(Math.random() * dataSource.length);
    console.log(randomCharacter);
}