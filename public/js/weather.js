

var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var days_abrv = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

var next_days;

var selected_day = 0;

var today = new Date();

var current_data;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  var localStorage = new LocalStorage('./scratch');
}

// Grabbing the data saved to JSON
fetch('/json/current_inquiry.json')
.then((resp) => resp.json())
.then(function(data) {
  current_data = data;
  graphWeather('temp_s');
  set_icon(current_data.current.weather[0].description);
});

// Sets the day values in the daily weather selection
function set_next_days(){
  var day = today.getDay()-1;

  $('#day').closest('p').html(days[today.getDay()-1]);
  $('#day_0').closest('ul').closest('td').css('background', '#f0f0f0');

  for(let i = 0; i < 7; i++){
    var id = 'day_'+String(i);
    var d = days_abrv[day];
    document.getElementById(id).textContent = d;
    day++;
    if(day>=7)
      day = 0;
  }
}
set_next_days();

// Handles a new day being selected
$('.day_select').click(function(e){
  selected_day = $(this).attr('value');
  var id;
  for(let i = 0; i < 7; i++){
    id = '#day_'+String(i);
    $(id).closest('ul').closest('td').css('background', '#fafafa');
  }
  id = '#day_'+String(selected_day);
  $(id).closest('ul').closest('td').css('background', '#f0f0f0');
  reset_data();
});

// Handles a new graph being selected
$('.data_select').click(function(e){
  $('#temp_s').css({'border' : 'none'});
  $('#precip_s').css({'border' : 'none'});
  $('#wind_s').css({'border' : 'none'});
  var selected = $(this).attr('id');
  $('#'+selected).css({'border-bottom' : 'solid 2px orange'})
  graphWeather(selected)
});

// Resets the displayed data depending on the chosen day
function reset_data(){
  var temp;
  var hum;
  var wind;
  var visual;
  var today_string = '';

  if((parseInt(selected_day)+today.getDay()-1) > 6)
    today_string = days[parseInt(selected_day)+today.getDay()-1-7];
  else
    today_string = days[parseInt(selected_day)+today.getDay()-1];

  if(selected_day == 0){
    temp=current_data.current.temp;
    hum=current_data.current.humidity;
    wind=current_data.current.wind_speed;
    visual=current_data.current.weather[0].description;
  }else{
    temp=current_data.daily[selected_day].temp.day;
    hum=current_data.daily[selected_day].humidity;
    wind=current_data.daily[selected_day].wind_speed;
    visual=current_data.daily[selected_day].weather[0].description;
  }
  $('#temp').html(Math.round(temp)+' F°');
  $('#hum').html('Humidity: '+hum+'%');
  $('#wind').html('Wind: '+Math.round(wind)+' mph');
  $('#day').html(today_string);
  $('#visual').html(visual);

  set_icon(visual);
}

// Set the weather Icon
function set_icon(desc){
  var icon_path = 'img/sunny.png';
  switch (desc) {
    case 'few clouds':
      icon_path = 'img/partually_sunny.png';
      break;
    case 'scattered clouds':
      icon_path = 'img/partually_sunny.png';
      break;
    case 'broken clouds':
      icon_path = 'img/partually_sunny.png';
      break;
    case 'overcast clouds':
      icon_path = 'img/cloudy.png';
      break;
    case 'light rain':
      icon_path = 'img/rainy.png';
      break;
    case 'moderate rain':
      icon_path = 'img/rainy.png';
      break;
    case 'heavy intensity rain':
      icon_path = 'img/rainy.png';
      break;
  }
  $('#icon').attr('src', icon_path);
}



///////////////////////////////////////////// DRAW GRAPH DATA /////////////////////////////////////////////

// Build graph table
function buildTable(){
  var html = '<thead>'
  for(let j = 0; j < 12; j++){
    html+='<th class=gray id='+j.toString()+ 'n></th>'
  }
  html+='<thead>'
  document.getElementById('table_num').innerHTML = html;
  html = '<thead>'
  for(let j = 0; j < 48; j++){
    html+='<th class=gray id='+j.toString()+ '></th>'
  }
  html+='<thead>'
  for(let i = 0; i < 100; i++){
    html+= '<tr>'
    for(let j = 0; j < 48; j++){
      html+= "<td class=table_graph id=" + j.toString() +'-'+ i.toString() + '>'
    }
    html+= '</tr>'
  }
  document.getElementById('table_graph').innerHTML = html;
  html = '<thead>'
  for(let j = 0; j < 6; j++){
    html+='<th class=gray id='+j.toString()+ 't></th>'
  }
  html+='<thead>'
  document.getElementById('table_times').innerHTML = html;
}

// Create graphs
function graphWeather(wt){
  var h = 0;
  if(wt == 'temp_s'){
    for(let i = 0; i < 48; i++){
      if(current_data.hourly[i].temp > h)
        h = Math.round(current_data.hourly[i].temp);
    }
  }else if(wt == 'wind_s'){
    for(let i = 0; i < 48; i++){
      if(current_data.hourly[i].wind_speed > h)
        h = Math.round(current_data.hourly[i].wind_speed);
    }
  }

  buildTable()

  var mult = 100/h;

  // Set time stamps for next 48 hours
  for(let i = 0; i < 6; i++){
    var id = i.toString() + 't'
    var hour = (today.getHours() + (i+1)*8) - 3;
    hour = hour - Math.floor(hour/24)*24
    var ampm = ' AM'
    if(hour >= 12)
      ampm = ' PM';
    hour = (hour-Math.floor((hour-1)/12)*12).toString();
    if(hour.toString().length == 1)
      hour = '0'+hour;
    document.getElementById(id).textContent = hour+ampm;
  }

  // Display a few temperatures above graph
  for(let j = 0; j < 12; j++){
    var id = j.toString() +'n'
    if(wt == 'temp_s')
      var data = Math.round(current_data.hourly[j*4].temp)
    else if(wt == 'wind_s')
      var data = Math.round(current_data.hourly[j*4].wind_speed)
    if(data.toString().length == 1)
      data = '0'+data.toString();
    console.log(id)
    document.getElementById(id).textContent = data;
  }

  // Fill in the graph
  for(let i = 0; i< 48; i++){
    var data = 0;
    if(wt=='temp_s'){
      data = Math.round(current_data.hourly[i].temp)
    }else if(wt=='wind_s'){
      data = Math.round(current_data.hourly[i].wind_speed)
    }
    for(let j = 0; j < 100; j++){
      if(wt == 'temp_s'){
        var ht = current_data.hourly[i].temp*mult;
        ht = Math.round(ht);
        if(j <= ht){
          var id = i.toString() + '-' + (99-j).toString();
          document.getElementById(id).style.backgroundColor = '#fa6e69';
        }
      }else if (wt == 'wind_s'){
        var hw = current_data.hourly[i].wind_speed*mult;
        hw = Math.round(hw);
        if(j <= hw){
          var id = i.toString() + '-' + (99-j).toString();
          document.getElementById(id).style.backgroundColor = '#8297e0';
        }
      }
    }
  }
}
