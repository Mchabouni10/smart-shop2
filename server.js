//----------------------------------------------Requiers
// Always require and configure near the top
require("dotenv").config();
// Connect to the database
require("./config/database");
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan"); //JSON request
const port = process.env.PORT || 3001;
const app = express();