let stageWidth;
let stageHeight;
let renderer;
let RonaldoMessiDataGroup;
const CR7 = "Cristiano Ronaldo";
const LM10 = "Lionel Messi";
let isShowingMap = false;
let isShowingMatchday = false;
let isShowingFirstHalf = false;
let isShowingSecondHalf = false;
let isShowingFullGame = true;
let currentView = "bodyPart";  // Track the current view
let originalPositions = [];

$(function () {
    console.log("Document ready");
    renderer = $("#renderer");
    stageHeight = renderer.innerHeight();
    stageWidth = renderer.innerWidth();

    renderer.css("width", stageWidth);
    renderer.css("background-color", "white");

    prepareData();
    addButtons();
    addTitle();

    const containerPadding = 25;
    const ronaldoContainerStartX = containerPadding;
    const messiContainerStartX = stageWidth / 2 + containerPadding / 2 + 15;

    console.log("Drawing entries");
    drawEntries(CR7, ronaldoContainerStartX, 150, 22, -30);
    drawEntries(LM10, messiContainerStartX, 150, 25, -95);

    applyEventHandlers();
    applyHalfFilter(); // Ensure the correct initial filter is applied
    addHoverEffect(); // Add the hover effect
});

function addButtons() {
    $(".button-container").remove();
    $(".half-button-container").remove();

    const button1 = $("<div class='button'>Body-Part</div>");
    const button2 = $("<div class='button'>Results</div>");
    const button3 = $("<div class='button'>Matchday</div>");
    const buttonFullGame = $("<div class='button half-button'>Whole game</div>"); // Updated text
    const buttonFirstHalf = $("<div class='button half-button'>1st half</div>"); // Updated text
    const buttonSecondHalf = $("<div class='button half-button'>2nd half</div>"); // Updated text

    button1.on("click", function () {
        toggleView("bodyPart");
    });

    button2.on("click", function () {
        toggleView("results");
    });

    button3.on("click", function () {
        toggleView("matchday");
    });

    buttonFullGame.on("click", function () {
        if (!isShowingFullGame) {
            toggleHalfView("fullGame");
        }
    });

    buttonFirstHalf.on("click", function () {
        if (!isShowingFirstHalf) {
            toggleHalfView("first");
        }
    });

    buttonSecondHalf.on("click", function () {
        if (!isShowingSecondHalf) {
            toggleHalfView("second");
        }
    });

    const buttonContainer = $("<div class='button-container'></div>");
    buttonContainer.append(button1);
    buttonContainer.append(button2);
    buttonContainer.append(button3);
    renderer.append(buttonContainer);

    const halfButtonContainer = $("<div class='half-button-container'></div>");
    halfButtonContainer.append(buttonFullGame);
    halfButtonContainer.append(buttonFirstHalf);
    halfButtonContainer.append(buttonSecondHalf);
    renderer.append(halfButtonContainer);

    updateButtonStates();
}

function addTitle() {
    $(".title").remove();
    const title = $("<div class='title'>Ronaldo vs Messi</div>").css({
        top: "20px",
        left: "30px",
        color: "black"
    });
    renderer.append(title);
}

function drawEntries(player, startX, initialY, entriesPerColumn, gap) {
    const types = ["Header", "Left-footed shot", "Right-footed shot"];
    let lastY = initialY;
    let currentX = startX;

    types.forEach((type) => {
        if (type === "Header") {
            const entries = RonaldoMessiDataGroup[player].filter(entry => entry.Type === type);
            const divs = createRow(entries, lastY, currentX, false, 29);
            appendDivsToRenderer(divs);
            lastY += calculateHeight(entries, 29) + 10;
        }
    });

    let shotY = lastY + -10;
    if (player === LM10) {
        shotY -= -4.5;
    }

    const leftFootedEntries = RonaldoMessiDataGroup[player].filter(entry => entry.Type === "Left-footed shot");
    const leftFootedDivs = createRow(leftFootedEntries, shotY, currentX, true, entriesPerColumn);
    appendDivsToRenderer(leftFootedDivs);

    const leftFootedColumnWidth = calculateColumnWidth(leftFootedEntries, entriesPerColumn);
    currentX += leftFootedColumnWidth + gap;

    const rightFootedEntries = RonaldoMessiDataGroup[player].filter(entry => entry.Type === "Right-footed shot");
    const rightFootedDivs = createRow(rightFootedEntries, shotY, currentX, true, entriesPerColumn);
    appendDivsToRenderer(rightFootedDivs);

    return lastY;
}

function createRow(entries, startY, startX, isVertical, entriesPerColumn) {
    const divContainer = [];
    const containerPadding = 25;
    const availableWidth = (renderer.innerWidth() / 2) - containerPadding;
    const wDiv = Math.floor(availableWidth / 30);

    entries.forEach((entry, index) => {
        let x, y;

        if (isVertical) {
            x = Math.floor(startX + Math.floor(index / entriesPerColumn) * wDiv);
            y = Math.floor(startY + (index % entriesPerColumn) * wDiv);
        } else {
            x = Math.floor(startX + (index % entriesPerColumn) * wDiv);
            y = Math.floor(startY + Math.floor(index / entriesPerColumn) * wDiv);
        }

        const div = $("<div class='goal'></div>")
            .css({
                width: wDiv,
                height: wDiv,
                left: x + 'px',
                top: y + 'px',
                position: "absolute",
                "z-index": 10,
                "margin": "0",
                "padding": "0",
                "border": "0px solid black",
                "box-sizing": "border-box"
            })
            .data("entry", entry);
        div.attr("entry", entry.Minute)

        originalPositions.push({ element: div, entry: entry, left: x, top: y });

        let size = getCircleSize(entry.Matchday);
        let color = getCircleColor(entry);
        const circle = $("<div class='circle'></div>").css({
            width: size,
            height: size,
            "background-color": color,
            "border-radius": "50%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            "background-image":
                Number(entry.Minute) < 46 || String(entry.Minute).includes("45+")
                    ? `linear-gradient(to right, white 50%, ${color} 50%)`
                    : "none",
            "margin": "0",
            "padding": "0",
            "border": "none",
            "box-sizing": "border-box"
        });
        circle.attr("check", String(entry.Minute).includes("45+") || String(entry.Minute).includes("90+"))

        div.append(circle);
        divContainer.push(div);
    });

    return divContainer;
}

function getCircleSize(matchday) {
    switch (matchday) {
        case "Final":
            return "19px";
        case "Semi-Finals":
            return "15px";
        case "Quarter-Finals":
            return "12px";
        case "Group Stage":
            return "9px";
        default:
            return "9px";
    }
}

function getCircleColor(entry) {
    if (!entry || !entry.Result) {
        return "#000000";
    }

    const [homeScore, awayScore] = entry.Result.split(":").map(Number);
    let isWin = false,
        isLoss = false;

    if (entry.Venue === "H") {
        isWin = homeScore > awayScore;
        isLoss = homeScore < awayScore;
    } else if (entry.Venue === "A") {
        isWin = homeScore < awayScore;
        isLoss = homeScore > awayScore;
    }

    if (isWin) {
        return "#00CC6D";
    } else if (isLoss) {
        return "#BF211E";
    } else {
        return "#8846D2";
    }
}

function handleGoalClick(event) {
    event.stopPropagation();
    const goal = $(this);
    const entry = goal.data("entry");

    if (goal.hasClass("selected")) {
        resetAllGoals();
    } else {
        resetAllGoals();

        goal.css("opacity", "1");
        goal.addClass("selected");

        renderer.find(".goal").not(goal).css("opacity", "0.2");

        if (entry) {
            const data = entry;
            const playerName = data.Player;
            const labelText = `
                <div><strong>${playerName}</strong></div>
                <div><strong>Season:</strong> ${data.Season}</div>
                <div><strong>Matchday:</strong> ${data.Matchday}</div>
                <div><strong>Opponent:</strong> ${data.Opponent}</div>
            `;

            const newLabel = $("<div class='label'></div>").html(labelText).css({
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, 10px)",
                "background-color": "white",
                "border-radius": "5px",
                "border": "1px solid grey",
                color: "black",
                padding: "10px",
                "font-size": "12px",
                "font-family": "'Poppins', sans-serif",
                "z-index": "1000",
                width: "200px",
                "box-shadow": "2px 2px 5px rgba(0,0,0,0.3)"
            });

            goal.append(newLabel);

            const dotTop = goal[0].offsetTop;
            const dotLeft = goal[0].offsetLeft;
            const labelHeight = newLabel.outerHeight();
            const labelWidth = newLabel.outerWidth();
            const stageRightEdge = stageWidth;
            const stageBottomEdge = stageHeight;

            let transformValue = "translate(-50%, 10px)";

            if (dotTop + labelHeight + 20 > stageBottomEdge) {
                transformValue = "translate(-50%, -110%)";
            }

            if (dotLeft + labelWidth / 2 > stageRightEdge) {
                transformValue = "translate(-110%, 0px)";
            }

            if (dotLeft - labelWidth / 2 < 0) {
                transformValue = "translate(10%, 0px)";
            }

            newLabel.css('transform', transformValue);
        }
    }
}

function resetAllGoals() {
    renderer.find(".goal").each(function () {
        const entry = $(this).data("entry");
        $(this).removeClass("selected");
        $(this).css("opacity", "1");
        if (entry) {
            const color = getCircleColor(entry);
            const backgroundImage = Number(entry.Minute) < 46 || String(entry.Minute).includes("45+") ? `linear-gradient(to right, white 50%, ${color} 50%)` : "none";
            $(this).find(".circle").css({
                "background-color": color,
                "background-image": backgroundImage
            });
            $(this).find(".label").remove();
        }
    });
}

function appendDivsToRenderer(divs) {
    const fragment = $(document.createDocumentFragment());
    divs.forEach((div) => fragment.append(div));
    renderer.append(fragment);
}

function calculateHeight(entries, entriesPerRow) {
    const containerPadding = 25;
    const availableWidth = (renderer.innerWidth() / 2) - containerPadding;
    const wDiv = Math.floor(availableWidth / entriesPerRow);
    const rows = Math.ceil(entries.length / entriesPerRow);
    return rows * wDiv + 20;
}

function calculateColumnWidth(entries, entriesPerColumn) {
    const containerPadding = 25;
    const availableWidth = (renderer.innerWidth() / 2) - containerPadding;
    const wDiv = Math.floor(availableWidth / entriesPerColumn);
    const columns = Math.ceil(entries.length / entriesPerColumn);
    return columns * wDiv;
}

function prepareData() {
    console.log("Preparing data");
    console.log("RonaldoMessiData", RonaldoMessiData);
    RonaldoMessiDataGroup = gmynd.groupData(RonaldoMessiData, "Player");
    console.log("RonaldoMessiDataGroup", RonaldoMessiDataGroup);
}

function showEmptyView() {
    const containerPadding = 25;
    const ronaldoContainerStartX = containerPadding;
    const messiContainerStartX = stageWidth / 2 + containerPadding / 2;

    let lastYCR7 = 150;
    let lastYLM10 = 150;

    lastYCR7 = drawFilteredEntries(CR7, ronaldoContainerStartX, lastYCR7, "win");
    lastYLM10 = drawFilteredEntries(LM10, messiContainerStartX, lastYLM10, "win");

    lastYCR7 += 15;
    lastYLM10 += 15;

    lastYCR7 = drawFilteredEntries(CR7, ronaldoContainerStartX, lastYCR7, "neither");
    lastYLM10 = drawFilteredEntries(LM10, messiContainerStartX, lastYLM10, "neither");

    lastYCR7 += 15;
    lastYLM10 += 15;

    drawFilteredEntries(CR7, ronaldoContainerStartX, lastYCR7, "loss");
    drawFilteredEntries(LM10, messiContainerStartX, lastYLM10, "loss");

    addTitle();
    addButtons();
    applyHalfFilter(); // Ensure the correct filter is applied
    applyEventHandlers();
    addHoverEffect(); // Add the hover effect
}

function drawFilteredEntries(player, startX, startY, filter) {
    const entries = RonaldoMessiDataGroup[player].filter((entry) => {
        const [homeScore, awayScore] = entry.Result.split(":").map(Number);
        if (filter === "win") {
            if (entry.Venue === "H") {
                return homeScore > awayScore;
            } else if (entry.Venue === "A") {
                return awayScore > homeScore;
            }
        } else if (filter === "neither") {
            return homeScore === awayScore;
        } else if (filter === "loss") {
            if (entry.Venue === "H") {
                return awayScore > homeScore;
            } else if (entry.Venue === "A") {
                return homeScore > awayScore;
            }
        }
        return false;
    });

    entries.forEach((entry, index) => {
        const position = originalPositions.find((pos) => pos.entry === entry);
        if (position) {
            const { element, left, top } = position;
            const containerPadding = 25;
            const availableWidth = (renderer.innerWidth() / 2) - containerPadding;
            const wDiv = Math.floor(availableWidth / 30);
            let x = Math.floor(startX + (index % 30) * wDiv);
            let y = Math.floor(startY + Math.floor(index / 30) * wDiv);

            element.css({
                left: x + 'px',
                top: y + 'px'
            }).data("entry", entry); // Ensure the data is correctly assigned
        } else {
            console.error("Position nicht gefunden für entry:", entry);
        }
    });

    return startY + calculateHeight(entries, 30) - 20;
}

function showMatchdayView() {
    const containerPadding = 25;
    const ronaldoContainerStartX = containerPadding;
    const messiContainerStartX = stageWidth / 2 + containerPadding / 2;

    let lastYCR7 = 150;
    let lastYLM10 = 150;

    lastYCR7 = drawMatchdayEntries(CR7, ronaldoContainerStartX, 150);
    lastYLM10 = drawMatchdayEntries(LM10, messiContainerStartX, 150);

    addTitle();
    addButtons();
    applyHalfFilter(); // Ensure the correct filter is applied
    applyEventHandlers();
    addHoverEffect(); // Add the hover effect
}

function drawMatchdayEntries(player, startX, startY) {
    const matchdayOrder = ["Final", "Semi-Finals", "Quarter-Finals"];
    let currentX = startX;
    let currentY = startY;
    const wDiv = Math.floor((renderer.innerWidth() / 2 - 25) / 30);

    matchdayOrder.forEach(matchday => {
        const entries = RonaldoMessiDataGroup[player].filter(entry => entry.Matchday === matchday);
        if (entries.length > 0) {
            entries.forEach((entry, index) => {
                let x = Math.floor(currentX + (index % 30) * wDiv);
                let y = Math.floor(currentY + Math.floor(index / 30) * wDiv);

                const position = originalPositions.find(pos => pos.entry === entry);
                if (position) {
                    position.element.css({
                        left: x + 'px',
                        top: y + 'px'
                    }).data("entry", entry); // Ensure the data is correctly assigned
                }
            });
            currentY += Math.ceil(entries.length / 30) * wDiv + 15;
        }
    });

    const remainingEntries = RonaldoMessiDataGroup[player].filter(entry => !matchdayOrder.includes(entry.Matchday));
    if (remainingEntries.length > 0) {
        remainingEntries.forEach((entry, index) => {
            let x = Math.floor(currentX + (index % 30) * wDiv);
            let y = Math.floor(currentY + Math.floor(index / 30) * wDiv);

            const position = originalPositions.find(pos => pos.entry === entry);
            if (position) {
                position.element.css({
                    left: x + 'px',
                    top: y + 'px'
                }).data("entry", entry); // Ensure the data is correctly assigned
            }
        });
        currentY += Math.ceil(remainingEntries.length / 30) * wDiv + 15;
    }

    return currentY;
}

function updateButtonStates() {
    $(".button").removeClass("inactive");
    $(".button").removeClass("active");

    if (isShowingMap) {
        $(".button:contains('Body-Part')").addClass("inactive");
        $(".button:contains('Results')").removeClass("inactive");
        $(".button:contains('Matchday')").addClass("inactive");
    } else if (isShowingMatchday) {
        $(".button:contains('Body-Part')").addClass("inactive");
        $(".button:contains('Results')").addClass("inactive");
        $(".button:contains('Matchday')").removeClass("inactive");
    } else {
        $(".button:contains('Body-Part')").removeClass("inactive");
        $(".button:contains('Results')").addClass("inactive");
        $(".button:contains('Matchday')").addClass("inactive");
    }

    if (isShowingFullGame) {
        $(".half-button:contains('Whole game')").addClass("active"); // Updated text
        $(".half-button:contains('1st half')").removeClass("active"); // Updated text
        $(".half-button:contains('2nd half')").removeClass("active"); // Updated text
    } else if (isShowingFirstHalf) {
        $(".half-button:contains('Whole game')").removeClass("active"); // Updated text
        $(".half-button:contains('1st half')").addClass("active"); // Updated text
        $(".half-button:contains('2nd half')").removeClass("active"); // Updated text
    } else if (isShowingSecondHalf) {
        $(".half-button:contains('Whole game')").removeClass("active"); // Updated text
        $(".half-button:contains('1st half')").removeClass("active"); // Updated text
        $(".half-button:contains('2nd half')").addClass("active"); // Updated text
    }

    // Ensure that inactive half-buttons have a gray outline
    $(".half-button-container .button").each(function() {
        if (!$(this).hasClass("active")) {
            $(this).addClass("inactive");
        }
    });
}

function toggleView(view) {
    console.log("Toggling view to:", view);
    currentView = view;
    isShowingMap = view === "results";
    isShowingMatchday = view === "matchday";
    isShowingFirstHalf = false;
    isShowingSecondHalf = false;
    isShowingFullGame = true;  // Set to true to ensure the full game button is initially active

    if (isShowingMap) {
        showEmptyView();
    } else if (isShowingMatchday) {
        showMatchdayView();
    } else if (isShowingFullGame) {
        resetOriginalPositions();
    } else if (view === "bodyPart") {
        showBodyPartView();
    }

    updateButtonStates();
    applyHalfFilter(); // Ensure the correct filter is applied
    applyEventHandlers();
    addHoverEffect(); // Add the hover effect
}

function toggleHalfView(half) {
    console.log("Toggling half view to:", half);
    isShowingFirstHalf = half === "first";
    isShowingSecondHalf = half === "second";
    isShowingFullGame = half === "fullGame"; // Add this line

    updateButtonStates();
    applyHalfFilter(); // Ensure the correct filter is applied
    addTitle();
    addButtons();
}

function resetOriginalPositions() {
    console.log("Resetting original positions");
    const fragment = $(document.createDocumentFragment());

    originalPositions.forEach(({ element, left, top, entry }) => {
        element.css({
            left: left + 'px',
            top: top + 'px',
            display: "block"
        }).data("entry", entry); // Ensure the data is correctly assigned
        fragment.append(element);
    });

    renderer.append(fragment);
    addTitle();
    addButtons();
    applyHalfFilter(); // Ensure the correct filter is applied
    addHoverEffect(); // Add the hover effect
}

function showBodyPartView() {
    console.log("Showing body part view");

    // Add animation class before changing positions
    renderer.find(".goal").addClass("animate");

    const containerPadding = 25;
    const ronaldoContainerStartX = containerPadding;
    const messiContainerStartX = stageWidth / 2 + containerPadding / 2 + 15;

    drawEntries(CR7, ronaldoContainerStartX, 150, 22, -30);
    drawEntries(LM10, messiContainerStartX, 150, 25, -95);

    // Remove animation class after positions are set
    setTimeout(() => {
        renderer.find(".goal").removeClass("animate");
    }, 500);

    addTitle();
    addButtons();
    applyHalfFilter(); // Ensure the correct filter is applied
    addHoverEffect(); // Add the hover effect
}

function applyHalfFilter() {
    console.log("Applying half filter");
    console.log("isShowingFirstHalf:", isShowingFirstHalf);
    console.log("isShowingSecondHalf:", isShowingSecondHalf);

    renderer.find(".goal").each(function () {
        const entry = $(this).data("entry");
        if (!entry) {
            console.warn("No entry found for this element:", this);
            return;
        }

        const circle = $(this).find(".circle");
        const minute = entry.Minute;

        if (isShowingFirstHalf) {
            if (!(Number(minute) < 46 || String(minute).includes("45+"))) {
                $(this).css("display", "none");
            } else {
                $(this).css("display", "block");
                let color = getCircleColor(entry);
                circle.css({
                    "background-image": `linear-gradient(to right, white 50%, ${color} 50%)`,
                    "background-color": ""
                });
            }
        } else if (isShowingSecondHalf) {
            if (!(Number(minute) >= 46 || String(minute).includes("90+"))) {
                $(this).css("display", "none");
            } else {
                $(this).css("display", "block");
                let color = getCircleColor(entry);
                circle.css({
                    "background-image": "",
                    "background-color": color
                });
            }
        } else {
            $(this).css("display", "block");
            let color = getCircleColor(entry);
            const backgroundImage = Number(minute) < 46 || String(minute).includes("45+") ? `linear-gradient(to right, white 50%, ${color} 50%)` : "none";
            circle.css({
                "background-color": color,
                "background-image": backgroundImage
            });
        }
    });
}

function applyEventHandlers() {
    console.log("Applying event handlers");
    renderer.off("click", ".goal", handleGoalClick);

    renderer.on("click", ".goal", handleGoalClick);
    $(document).on("click", function () {
        resetAllGoals();
    });
}

function addHoverEffect() {
    renderer.find(".goal").hover(
        function () {
            // On hover
            $(this).css("transform", "scale(1.5)"); // Increase size by 25%
            $(this).css("z-index", 20); // Bring to front
        },
        function () {
            // On hover out
            $(this).css("transform", "scale(1)"); // Reset to original size
            $(this).css("z-index", 10); // Reset z-index
        }
    );
}