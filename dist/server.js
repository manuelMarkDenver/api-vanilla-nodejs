"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
require("dotenv").config();
const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer((req, res) => {
    console.log("🚀 ~ req.method:", req.method);
    if (req.method === "GET") {
        const { pathname, searchParams } = new URL(`http://localhost:${PORT}${req.url}`);
        if (pathname === "/search") {
            handleSearchRequest(req, res, searchParams);
            return;
        }
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found\n");
});
function handleSearchRequest(req, res, queryParams) {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", () => {
        try {
            const searchParams = new URLSearchParams();
            const firstName = queryParams.get("firstName");
            const lastName = queryParams.get("lastName");
            const category = queryParams.get("category");
            const year = queryParams.get("year");
            if (firstName)
                searchParams.append("firstname", firstName);
            if (lastName)
                searchParams.append("surname", lastName);
            if (category)
                searchParams.append("category", category);
            if (year)
                searchParams.append("year", year.toString());
            const searchUrl = `https://api.nobelprize.org/v1/laureate.json?${searchParams.toString()}`;
            console.log("🚀 ~ req.on ~ searchUrl:", searchUrl);
            // Make a request to the Nobel Prize API
            https
                .get(searchUrl, (response) => {
                let data = "";
                response.on("data", (chunk) => {
                    data += chunk;
                });
                response.on("end", () => {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(data);
                });
            })
                .on("error", (error) => {
                console.error(`Error making request to Nobel Prize API: ${error}`);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error\n");
            });
        }
        catch (error) {
            console.error(`Error processing request: ${error}`);
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Bad Request\n");
        }
    });
}
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
