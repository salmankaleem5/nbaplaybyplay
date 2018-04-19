/*! basketballsnapshot - v0.0.1 - 2018-04-19
* Copyright (c) 2018 ; Licensed  */
!function(){function a(a){return a.replace(new RegExp("-","g"),"")}function b(a,b){var c=["PTS","FGM","FGA","2PM","2PA","3PM","3PA","FTM","FTA","REB","TOV","PF","SUB"],d=$("<tr/>");return $("<td/>",{text:b}).appendTo(d),c.forEach(function(b){$("<td/>",{text:a[b]}).appendTo(d)}),d}var c=new Date;c.setDate(c.getDate()-1);var d=c.toISOString().substr(0,10);$("#game-date-input").val(d).attr("max",d);var e=function(){var a=$("#games-list"),b=void 0,c=void 0;return{updateList:function(b){a.empty(),b.forEach(function(b,c){var d=$("<div/>",{class:"form-check"}),e=$("<label />",{class:"form-check-label"});$("<input />",{type:"radio",name:"game",value:b.gameID,id:"game"+c,class:"form-check-input"}).appendTo(e);var f=b.homeTeam.teamName+" vs "+b.awayTeam.teamName;$("<span>"+f+"</span>").appendTo(e),e.appendTo(d),d.appendTo(a)}),a.removeClass("hidden"),c=b},notifyUser:function(b){a.empty(),a.append("<p>"+b+"</p>"),a.removeClass("hidden")},setSelectedGameID:function(a){b=a},getSelectedGameID:function(){return b},getSelectedGame:function(){var a=void 0;return $.each(c,function(c,d){if(d.gameID==b)return a=d,!1}),a}}}(),f=document.getElementById("input-slider");noUiSlider.create(f,{start:[0,48],step:1,connect:!0,range:{min:[0],max:[48]},pips:{mode:"steps",density:3,filter:function(a,b){return a%12?2:1}}});var g=new Date("2017-10-17").getTime(),h=c.getTime();$("#get-games-button").on("click",function(b){b.preventDefault();var c=$("#game-date-input").val(),d=new Date(c).getTime();return/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(c)?d<g||d>h?(alert("Please enter a valid date, between 10/17/2017 and yesterday's date"),!1):(c=a(c),void $.ajax({url:"http://localhost/nbaplay/api/index.php",type:"POST",data:{action:"getGames",gameDate:c},success:function(a){Array.isArray(a)&&a.length>0?e.updateList(a):0==a.length&&e.notifyUser("No games found for the specified date")},error:function(a,b,c){console.log(b,c)},dataType:"json"})):(alert("Please enter a valid date, between 10/17/2017 and yesterday's date"),!1)}),$("#games-list").on("change","input[type=radio][name=game]",function(a){e.setSelectedGameID(this.value),$("#get-data-button").removeAttr("disabled")}),$("#get-data-button").on("click",function(a){a.preventDefault();var c=f.noUiSlider.get(),d=parseInt(c[0]),g=parseInt(c[1]),h=e.getSelectedGame();return d<0||d>=48||g<=0||g>48?(alert("Invalid time range, please select a time between 0 minutes and 48 minutes"),!1):void 0!=h.gameID&&void $.ajax({url:"http://localhost/nbaplay/api/index.php",type:"POST",data:{action:"getStats",gameID:h.gameID,gameDate:h.date,startTime:c[0],endTime:c[1]},success:function(a){var c=e.getSelectedGame();if(2==Object.keys(a).length&&void 0!=c){$("#table-stats tbody").empty();var d=b(a[c.homeTeam.abbreviation],c.homeTeam.teamName),f=b(a[c.awayTeam.abbreviation],c.awayTeam.teamName);$("#table-stats").append(d).append(f).removeClass("hidden")}},error:function(a,b,c){console.log(b,c)},dataType:"json"})})}();