document.addEventListener("DOMContentLoaded", () => {
    const dataSource = new kendo.data.DataSource({
        data: [
            { Id: 1, characterName: "Akira" },
            { Id: 2, characterName: "Ethiron" },
        ],
        sort: { field: "characterName", dir: "asc" }
    });

    $("#guessInput")
        .kendoDropDownList({
            dataTextField: "characterName",
            dataValueField: "Id",
            dataSource: dataSource,
            filter: "contains",
            suggest: true,
            optionLabel: "Select...",
            change: e => console.log(e.value())
        })
        .data("kendoDropDownList");
});
