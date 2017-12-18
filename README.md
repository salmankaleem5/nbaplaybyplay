NBA Play by Play Data Retriever
===================
The NBA Play By Play Data Retriever is a tool that lets users extract statistics from a NBA game within a frame of time. It works by having users select a game and specifying the frame of time they want to analyze. Then, the tool parses data points that describe what is happening at each moment of the game and generates statistics. A table is then generated that show various statistics like points, rebounds, fouls, substitutions, and more. For example, if you want to know what led to a team’s slow start in a game, you can select the first five minutes in the game and see how many points, turnovers, rebounds, etc the team had. I created the tool because as I watch games and see a team do well or really poorly, I wanted to be able to see exactly how and why they were performing that way.

## Running the application ##
This project was written in PHP and should be used with a web server. To use the application, place the project in your web server and launch index.html. 

Note:

 - Project uses cURL and fsockopen to send HTTP requests
 - If AJAX requests are not being sent after clicking "Get Games" and "Get Data" on the project homepage and you are getting URL not found in the console, it may be that the AJAX URL host is different than what I am using. You may need to adjust the URL's in main.js on lines 136 and 195.
