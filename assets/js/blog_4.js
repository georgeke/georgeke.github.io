$(document).ready(function(){
    $.ajax({
      url: '../assets/db/blog_4.csv',
      dataType: 'text',
    }).done(function (data) {
        createGraph(data)
    });
});

function createGraph(csvData) {
    const GRAPH_TOTAL_HEIGHT = 400;
    const GRAPH_TOTAL_WIDTH = 800;
    const GRAPH_PLOT_HEIGHT = GRAPH_TOTAL_HEIGHT - 15;
    const GRAPH_PLOT_WIDTH = GRAPH_TOTAL_WIDTH - 15;
    const GRAPH_AXIS_HEIGHT = GRAPH_TOTAL_HEIGHT - 50;
    const GRAPH_AXIS_WIDTH = GRAPH_TOTAL_WIDTH - 70;
    const POINT_PLOT_PADDING = 5;
    const NUM_Y_AXIS_TICKS = 4;
    const NUM_X_AXIS_TICKS = 5;
    const DAY_OF_WEEK_TO_COLOURS = {
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

    rows = csvData.split("\r\n");
    let parsedData = [];

    let minTimeSpentSec = Infinity;
    let maxTimeSpentSec = 0;
    let minFirstOpenedDate = new Date("2300-01-01");
    let maxFirstOpenedDate = new Date("1900-01-01");
    for (const row of rows.slice(1)){
        vals = row.split(",");
        if (vals.length < 9) {
            continue;
        }
        
        timeSpentSec = parseInt(vals[2]);
        firstOpenedDate = new Date(vals[8]);
        if (timeSpentSec < 60 * 5) {
            continue;
        }
        console.log(vals[1])
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
    
    graphElement = $("#graph");
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

        const lightColour = DAY_OF_WEEK_TO_COLOURS[row["dayOfWeek"]]["light"];
        const darkColour = DAY_OF_WEEK_TO_COLOURS[row["dayOfWeek"]]["dark"];
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
        
//        if (row["dayOfWeek"] == "Fri" && row["solved"]) {
        graphElement.append(pointElement);
//        }
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

    graphElement.css("display", "block");
};