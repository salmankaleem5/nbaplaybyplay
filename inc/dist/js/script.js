"use strict";!function(){function a(a){return a.replace(new RegExp("-","g"),"")}function b(a,b){var c=["PTS","FGM","FGA","2PM","2PA","3PM","3PA","FTM","FTA","REB","TOV","PF","SUB"],d=$("<tr/>");return $("<td/>",{text:b}).appendTo(d),c.forEach(function(b){$("<td/>",{text:a[b]}).appendTo(d)}),d}var c=this,d=function(){var a={};return a.getUrl=function(){return"http://localhost:8888/api/index.php"},a}(),e=new Date;e.setDate(e.getDate()-1);var f=(e.toISOString().substr(0,10),function(){var a=$("#games-list"),b=void 0,c=void 0;return{updateList:function(b){a.empty(),b.forEach(function(b,c){var d=$("<div/>",{class:"form-check"}),e=$("<label />",{class:"form-check-label"});$("<input />",{type:"radio",name:"game",value:b.gameID,id:"game"+c,class:"form-check-input"}).appendTo(e);var f=b.homeTeam.teamName+" vs "+b.awayTeam.teamName;$("<span>"+f+"</span>").appendTo(e),e.appendTo(d),d.appendTo(a)}),a.removeClass("hidden"),c=b},notifyUser:function(b){a.empty(),a.append("<p>"+b+"</p>"),a.removeClass("hidden")},setSelectedGameID:function(a){b=a},getSelectedGameID:function(){return b},getSelectedGame:function(){var a=void 0;return $.each(c,function(c,d){if(d.gameID==b)return a=d,!1}),a}}}()),g=document.getElementById("input-slider");noUiSlider.create(g,{start:[0,48],step:1,connect:!0,range:{min:[0],max:[48]},pips:{mode:"steps",density:3,filter:function(a,b){return a%12?2:1}}});var h=new Date("2017-10-17").getTime(),i=e.getTime();$("#get-games-button").on("click",function(b){b.preventDefault();var c=$("#game-date-input").val(),e=new Date(c).getTime();return/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(c)?e<h||e>i?(alert("Please enter a valid date, between 10/17/2017 and yesterday's date"),!1):void $.ajax({url:d.getUrl(),type:"POST",data:{action:"getGames",gameDate:a(c)},success:function(a){Array.isArray(a)&&a.length>0?f.updateList(a):0==a.length&&f.notifyUser("No games found for the specified date")},error:function(a,b,c){console.log(b,c)},dataType:"json"}):(alert("Please enter a valid date, between 10/17/2017 and yesterday's date"),!1)}),$("#games-list").on("change","input[type=radio][name=game]",function(a){f.setSelectedGameID(c.value),$("#get-data-button").removeAttr("disabled")}),$("#get-data-button").on("click",function(a){a.preventDefault();var c=g.noUiSlider.get(),e=parseInt(c[0]),h=parseInt(c[1]),i=f.getSelectedGame();return e<0||e>=48||h<=0||h>48?(alert("Invalid time range, please select a time between 0 minutes and 48 minutes"),!1):void 0!=i.gameID&&void $.ajax({url:d.getUrl(),type:"POST",data:{action:"getStats",gameID:i.gameID,gameDate:i.date,startTime:c[0],endTime:c[1]},success:function(a){if(2==Object.keys(a).length&&void 0!=i){$("#table-stats tbody").empty();var c=b(a[i.homeTeam.abbreviation],i.homeTeam.teamName),d=b(a[i.awayTeam.abbreviation],i.awayTeam.teamName);$("#table-stats").append(c).append(d).removeClass("hidden")}},error:function(a,b,c){console.log(b,c)},dataType:"json"})})}();