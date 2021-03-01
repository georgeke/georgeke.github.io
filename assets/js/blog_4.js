$(document).ready(function(){
    $.ajax({
      url: '../assets/db/blog_4.csv',
      dataType: 'text',
    }).done(function (csvData) {
        rows = csvData.split("\r\n");
        crosswordBlog.csvData = rows.slice(1);
        crosswordBlog.createGraph();
        crosswordBlog.createDayOfWeekToggles();
    });
});

let crosswordBlog = {};

crosswordBlog.mainGraphToggles = {
    "dayOfWeek": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true,
    }
};

crosswordBlog.DAY_OF_WEEK_TO_COLOURS = {
    "Mon": { // green
        "light": "#85e085",
        "dark": "#33cc33",
    },
    "Tue": { // blue
        "light": "#80bfff",
        "dark": "#3399ff",
    },
    "Wed": { // yellow
        "light": "#ffe066",
        "dark": "#ffcc00",
    },
    "Thu": { // brown
        "light": "#cc6600",
        "dark": "#804000",
    },
    "Fri": { // red
        "light": "#ff8080",
        "dark": "#ff4d4d",
    },
    "Sat": { // purple
        "light": "#ccb3ff",
        "dark": "#9966ff",
    },
    "Sun": { // orange
        "light": "#ffa366",
        "dark": "#ff8533",
    },
};

crosswordBlog.createGraph = function () {
    const GRAPH_TOTAL_HEIGHT = 400;
    const GRAPH_TOTAL_WIDTH = 800;
    const GRAPH_PLOT_HEIGHT = GRAPH_TOTAL_HEIGHT - 15;
    const GRAPH_PLOT_WIDTH = GRAPH_TOTAL_WIDTH - 15;
    const GRAPH_AXIS_HEIGHT = GRAPH_TOTAL_HEIGHT - 50;
    const GRAPH_AXIS_WIDTH = GRAPH_TOTAL_WIDTH - 70;
    const POINT_PLOT_PADDING = 5;
    const NUM_Y_AXIS_TICKS = 4;
    const NUM_X_AXIS_TICKS = 5;
    
    let parsedData = [];

    let minTimeSpentSec = Infinity;
    let maxTimeSpentSec = 0;
    let minFirstOpenedDate = new Date("2300-01-01");
    let maxFirstOpenedDate = new Date("1900-01-01");
    for (const row of this.csvData){
        vals = row.split(",");
        if (vals.length < 9) {
            continue;
        }
        
        timeSpentSec = parseInt(vals[2]);
        firstOpenedDate = new Date(vals[8]);
        if (timeSpentSec < 60 * 5) {
            continue;
        }
        
        if (!this.mainGraphToggles.dayOfWeek[vals[1]]) {
            continue;
        }

        parsedData.push(
            {
                publishedDate: new Date(vals[0]),
                dayOfWeek: vals[1],
                timeSpentSec: timeSpentSec,
                solved: vals[3] == "1",
                checked: vals[4] == "1",
                revealed: vals[5] == "1",
                streakEligible: vals[6] == "1",
                solvedDate: new Date(vals[7]),
                firstOpenedDate: firstOpenedDate,
            }
        );
        
        minTimeSpentSec = Math.min(minTimeSpentSec, timeSpentSec);
        maxTimeSpentSec = Math.max(maxTimeSpentSec, timeSpentSec);

        if (firstOpenedDate - minFirstOpenedDate < 0) {
            minFirstOpenedDate = firstOpenedDate;
        } else if (firstOpenedDate - maxFirstOpenedDate > 0) {
            maxFirstOpenedDate = firstOpenedDate;
        }
    }
    const yRangeS = maxTimeSpentSec - minTimeSpentSec;
    const xRangeMs = (maxFirstOpenedDate - minFirstOpenedDate);

    let graphElement = $("#graph");
    graphElement.css("height", GRAPH_TOTAL_HEIGHT + "px");
    graphElement.css("width", GRAPH_TOTAL_WIDTH + "px");

    for (const row of parsedData.splice(1)){
        let pointElement = $(document.createElement("div"));
        pointElement.addClass("point");

        // tooltip
        let tooltipElement = $(document.createElement("div"));
        tooltipElement.addClass("tooltipText");

        const tooltipPublishDateString = row["firstOpenedDate"].toLocaleDateString(
            undefined, {month: "short", day: "numeric", year: "numeric"}
        );
        const tooltipURLDateString = row["firstOpenedDate"].toLocaleDateString();
        let tooltipYear = $(document.createElement("a"));
        tooltipYear.text(tooltipPublishDateString);
        tooltipYear.attr("href", "https://www.xwordinfo.com/Crossword?date=" + tooltipURLDateString);
        tooltipYear.attr("target", "_blank");

        const tooltipTimeSpentString = Math.round(row["timeSpentSec"] / 60) + " minutes";
        let tooltipTimeSpent = $(document.createElement("div"));
        tooltipTimeSpent.text(tooltipTimeSpentString);

        tooltipElement.append(tooltipYear);
        tooltipElement.append(tooltipTimeSpent);
        pointElement.append(tooltipElement);

        // plot the point
        const xSinceMin = (row["firstOpenedDate"] - minFirstOpenedDate);
        const ySinceMin = row["timeSpentSec"] - minTimeSpentSec;

        pointElement.css(
            "left",
            (GRAPH_PLOT_WIDTH * (xSinceMin / xRangeMs) + POINT_PLOT_PADDING).toString() + "px",
        );
        pointElement.css(
            "bottom",
            (GRAPH_PLOT_HEIGHT * ySinceMin / yRangeS + POINT_PLOT_PADDING).toString() + "px",
        );

        const lightColour = this.DAY_OF_WEEK_TO_COLOURS[row["dayOfWeek"]]["light"];
        const darkColour = this.DAY_OF_WEEK_TO_COLOURS[row["dayOfWeek"]]["dark"];
        let borderColour = lightColour;
        let background = "none";
        if (row["solved"]) {
            if (row["checked"] || row["revealed"]) {
                background = lightColour;
            } else {
                background = darkColour;
                borderColour = darkColour;
            }
        }
        pointElement.css("background", background);
        pointElement.css("borderColor", borderColour);

        graphElement.append(pointElement);
    }
    
    const xTickSpacingMs = xRangeMs / (NUM_X_AXIS_TICKS - 1);
    const xTickSpacingPx = GRAPH_AXIS_WIDTH / (NUM_X_AXIS_TICKS - 1);
    for (let i = 0 ; i < NUM_X_AXIS_TICKS ; i++) {
        date = new Date(minFirstOpenedDate.getTime() + i * xTickSpacingMs);
        const monthString = date.toLocaleString('default', { month: 'short' });

        labelElement = $(document.createElement("div"));
        labelElement.addClass("xLabel");
        labelElement.css("left", Math.round(i * xTickSpacingPx));
        labelElement.text(monthString + " " + (date.getYear() + 1900));
        graphElement.append(labelElement);
    }
    
    const yTickSpacingS = yRangeS / (NUM_Y_AXIS_TICKS - 1);
    const yTickSpacingPx = GRAPH_AXIS_HEIGHT / (NUM_Y_AXIS_TICKS - 1);
    for (let i = 0 ; i < NUM_Y_AXIS_TICKS ; i++) {
        labelElement = $(document.createElement("div"));
        labelElement.addClass("yLabel");
        labelElement.css("bottom", Math.round(i * yTickSpacingPx + POINT_PLOT_PADDING));
        const minutes = (i * yTickSpacingS / 60) + 1;
        let displayNum = minutes + "m";
        if (minutes >= 60) {
            displayNum = Math.round(minutes / 30) / 2 + "h";
        } else if (minutes >= 10) {
            displayNum = Math.round(minutes/ 5) * 5 + "m";
        }
        labelElement.text(displayNum);
        graphElement.append(labelElement);
    }

    let xAxis = $(document.createElement("div"));
    xAxis.addClass("xName");
    xAxis.text("Time Spent");
    let yAxis = $(document.createElement("div"));
    yAxis.addClass("yName");
    yAxis.text("Date Started");
    graphElement.append(xAxis, yAxis);

    graphElement.css("display", "block");
};

crosswordBlog.createDayOfWeekToggles = function () {
    const dayOfWeekDict = this.mainGraphToggles.dayOfWeek;
    let dayOfWeekToggles = $("#dayOfWeekToggles");

    for (const dayOfWeek in dayOfWeekDict) {
        let toggleContainer = $(document.createElement("span"));
        toggleContainer.css("cursor", "pointer");
        let toggleIcon = $(document.createElement("span"));
        toggleIcon.addClass("dayOfWeekToggleIcon");
        toggleIcon.css("backgroundColor", this.DAY_OF_WEEK_TO_COLOURS[dayOfWeek].dark)
        let toggleText = $(document.createElement("span"));
        toggleText.text(dayOfWeek);

        toggleContainer.append(toggleIcon);
        toggleContainer.append(toggleText);
        toggleContainer.click(function () {
            const isOn = crosswordBlog.mainGraphToggles.dayOfWeek[dayOfWeek]
            if (isOn) {
                toggleIcon.css("backgroundColor", "lightgray");
                toggleText.css("color", "lightgray");
            } else {
                toggleIcon.css("backgroundColor", crosswordBlog.DAY_OF_WEEK_TO_COLOURS[dayOfWeek].dark);
                toggleText.css("color", "black");
            }
            crosswordBlog.mainGraphToggles.dayOfWeek[dayOfWeek] = !isOn;
            $('#graph').empty();
            crosswordBlog.createGraph();
        });
        dayOfWeekToggles.append(toggleContainer);
    }

    dayOfWeekToggles.css("display", "flex");
};
