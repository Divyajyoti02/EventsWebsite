import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://byabbe.se/on-this-day";

function formDate(year, month, date) {
    if (year.includes('BC')) {return new Date(-Number(year.replace(/\D/g, "")), month, date);}
    else {return new Date(Number(year.replace(/\D/g, "")), month, date);}
}

function printDate(date) {
    var components = date.toDateString().split(' ').slice(1).join(' ').replace(/ 0+/g, ' ').split(' ');
    if (components[2].includes('-')) {
        return `${components[0]} ${components[1]}, ${Math.abs(Number(components[2]))} BC`;
    } else {return `${components[0]} ${components[1]}, ${components[2]} AD`;}
}

function getYear(datestr) {
    if (datestr.includes('BC')) {return -Number(datestr.split(' ').at(-2))}
    else {return Number(datestr.split(' ').at(-2));}
}

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth();
        const responseData = await axios.get(`${API_URL}/${month}/${day}/events.json`);
        // console.log(responseData.data.events);
        var eventDict = [];
        responseData.data.events.forEach(element => {
            eventDict.push(
                {
                    content: element.description,
                    date: printDate(formDate(element.year, month, day))
                }
            );
        });
        var orderedEventDict = {};
        eventDict.forEach(element => {
            if (!(element.date in orderedEventDict)) {orderedEventDict[element.date] = [];}
            orderedEventDict[element.date].push(element.content);
        });
        var data = [];
        for (var element in orderedEventDict) {
            data.push({
                content: orderedEventDict[element],
                date: element
            });
        }
        data.sort((a, b) => {return getYear(b.date) - getYear(a.date);});
        res.render("index.ejs", {events: data});
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.sendStatus(500);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});