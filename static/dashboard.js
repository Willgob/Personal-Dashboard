document.addEventListener('DOMContentLoaded', () => {

    function SaveTodos() {
        const todos = {};
        document.querySelectorAll('.widget').forEach(widget => {
            const id = widget.dataset.widgetId;
            const todoList = widget.querySelectorAll('.todo-list li');
            if(todoList.length > 0) {
                todos[id] = [];
                todoList.forEach(li => {
                    const done = li.getAttribute('data-done') === 'true';
                    const task = li.textContent.replace(/^\s*|\s*$/g, '');
                    todos[id].push({task, done});
                });
            }
        });
        localStorage.setItem('todos', JSON.stringify(todos));
        
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos') || '{}');
        document.querySelectorAll('.widget').forEach(widget => {
            const id = widget.dataset.widgetId;
            const todoList = widget.querySelector('.todo-list');
            if(todoList && todos[id]) {
                todoList.innerHTML = '';
                todos[id].forEach(task => {
                    const li = document.createElement('li');
                    li.setAttribute('data-done', task.done);
                    li.innerHTML = task.done ? `<s>${task.task}</s>` : task.task;
                    todoList.appendChild(li);
                });
            }
        });
    }

    function attachToggle() {
        document.querySelectorAll('.todo-list li').forEach(item => {
            item.addEventListener('click', () => {
                let done = item.getAttribute('data-done') === 'true';
                if(done){
                    item.innerHTML = item.textContent;
                    item.setAttribute('data-done', 'false');
                } else {
                    item.innerHTML = `<s>${item.textContent}</s>`;
                    item.setAttribute('data-done', 'true');
                }
                SaveTodos();
            });
        });
    }

    function addTodo() {
        document.querySelectorAll('.widget').forEach(widget => {
            const todoList = widget.querySelector('.todo-list');
            const input = widget.querySelector('.todo-input');
            const button = widget.querySelector('.todo-input-button');

            if(todoList && input && button) {
                button.addEventListener('click', () => {
                    const taskText = input.value.trim();
                    if(taskText === '') return;

                    const li = document.createElement('li');
                    li.setAttribute('data-done', 'false');
                    li.textContent = taskText;

                    todoList.appendChild(li);
                    input.value = '';


                    attachToggle();
                    SaveTodos();
                });


                input.addEventListener('keypress', (e) => {
                    if(e.key === 'Enter') {
                        button.click();
                    }
                });
            }
        });
    }
            
                
    function Reset() {
        document.querySelectorAll('.widget').forEach(widget => {
            const todoList = widget.querySelector('.todo-list');
            const resetButton = widget.querySelector('.todo-reset-button');
            const id = widget.dataset.widgetId;

            if(todoList && resetButton && id) {
                resetButton.addEventListener('click', () => {
                    if(!confirm('U done?')) return;
                    if(!confirm('are u totallly sure u have done every single thing u have to do?')) return;
                    if(!confirm('last change to tell the truth cause i know u havent finished everything')) return;
                    if(!confirm('ok last last chance r u sure?')) return;
                    if(!confirm('for real this time?')) return;
                    if(!confirm('u sure u sure?')) return;
                    if(!confirm('absolutely sure?')) return;
                    if(!confirm('no take backs')) return;
                    if(!confirm('press ok to reset your todo list')) return;
                    if(!confirm('this is the final confirmation')) return;
                    if(!confirm('rly rly sure?')) return;
                    if(!confirm('ok fine :(')) return;
                    todoList.innerHTML = '';
                    const todos = JSON.parse(localStorage.getItem('todos') || '{}');
                    delete todos[id];
                    localStorage.setItem('todos', JSON.stringify(todos));
                });
            }
        });
    }


    async function Weather() {

        const widget = document.querySelectorAll('.weather_widget');
        const widgets = document.querySelectorAll('.weather_widget');

        for (const widget of widgets) {
            const location = widget.dataset.location;
            const units = widget.dataset.units;
            const id = widget.dataset.widgetId;
            const latitude = widget.dataset.latitude;
            const longitude = widget.dataset.longitude;
            const temp_unit = widget.dataset.tempunit;
            const windspeed_unit = widget.dataset.windspeedunit;
            console.log(temp_unit);
            // widget.innerHTML = `hello `;

            


            let url_weather = '';

            if (temp_unit === 'celsius') {
                 url_weather = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode&wind_speed_unit=' + windspeed_unit;
            } else {
                 url_weather = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode&temperature_unit=' + temp_unit + '&wind_speed_unit=' + windspeed_unit;
            }
            
            console.log(url_weather);

            const respond = await fetch(url_weather);
            const data_weather = await respond.json();



            console.log(data_weather);

            const temperature = data_weather.hourly.temperature_2m[0];
            const humidity = data_weather.hourly.relativehumidity_2m[0];
            const windspeed = data_weather.hourly.windspeed_10m[0];
            const weathercode = data_weather.hourly.weathercode[0];
            const weatherCodes = {
                0: "Clear Sky",
                1: "Mainly Clear",
                2: "Partly Cloudy",
                3: "Overcast",
                45: "Fog",
                48: "Depositing Rime Fog",
                51: "Light Drizzle",
                53: "Moderate Drizzle",
                55: "Dense Drizzle",
                61: "Slight Rain",
                63: "Moderate Rain",
                65: "Heavy Rain", 
                71: "Slight Snow",
                73: "Moderate Snow",
                75: "Heavy Snow",
                80: "Slight Rain Showers",
                81: "Moderate Rain Showers",
                82: "Violent Rain Showers",
                95: "Thunderstorm",
                96: "Thunderstorm with Hail",
                99: "Heavy Hail Thunderstorm"

            };


            let tempShown;
            if (temp_unit === 'celsius') {
                tempShown = `Temp - ${temperature} °C`;
            } else if (temp_unit === 'fahrenheit') {
                tempShown = `Temp - ${temperature} °F`;
            }


            const content = widget.querySelector('.widget-content');

            content.innerHTML = `
            <span class = "weather-location-span" > Location: ${location} </span>
            <hr class="weather-hr">
            <span class = "weathercode" > Weather Code - ${weatherCodes[weathercode]} </span>
            <br>
            <span class = "temp" > ${tempShown} </span>
            <br>
            <span class = "humidity" > Humidity - ${humidity}% </span>
            <br>
            <span class = "windspeed" > Windspeed - ${windspeed} km/h </span>
            `;

            console.log(widget.dataset);

            // testing

            
        }

    }

    function GridSetup() {
        const dashboard = document.getElementById('dashboard');
        const columns = 12;

        document.querySelectorAll('.widget').forEach(widget => {
            const x = parseInt(widget.dataset.x);
            const y = parseInt(widget.dataset.y);
            const width = parseInt(widget.dataset.width);
            const height = parseInt(widget.dataset.height);

            const okx = Math.max(1, Math.min(x, columns));
            const okwidth = Math.min(width, columns - okx + 1);

            widget.style.gridColumn = `${okx} / span ${okwidth}`;
            widget.style.gridRow = `${y} / span ${height}`; 

        });


    }

    async function Hackatime() {
        const API = "f613f08e-3ce3-4784-b873-9ec843cbbf05"; // hide thisss

        document.querySelectorAll('.hackatime-widget').forEach(async (widget) => {
            const project = widget.dataset.project;
            const content = widget.querySelector('.widget-content');

            const date = new Date();
            const end_date = date.toISOString().split('T')[0];
            const start_date = "2025-01-01";
            const url = `https://hackatime.com/api/v1/users/current/stats`;

            const response = await fetch(url, {
                headers: {"Authorization": `Bearer ${API}`}
            });

            const data = await response.json();
            console.log(data);

            
        });
    }


    loadTodos();
    attachToggle();
    addTodo();
    Reset();
    Weather();
    GridSetup();
    Hackatime();


});