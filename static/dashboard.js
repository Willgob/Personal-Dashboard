document.addEventListener('DOMContentLoaded', () => {

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }


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


    function clock() {
        const time_html = document.getElementById("time-clock");
        const date_html = document.getElementById("date-clock");

        function update() {
            const time_now = new Date();

            const hours = String(time_now.getHours()) || 0;
            const minutes = String(time_now.getMinutes()) || 0;
            const seconds = String(time_now.getSeconds()) || 0;

            time_html.textContent = hours + `:  ` + minutes + `:` + seconds

            const structure = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
            date_html.textContent = time_now.toLocaleDateString(undefined, structure);
        }
        update();
        setInterval(update, 1000);

    }

    function timer(){ 
        
        document.querySelectorAll(".timer-widget").forEach(widget => {

            let alarmsound = new Audio("/static/audio.mp3");
            alarmsound.preload = "auto";
            let unlocksound = false;

            // alarmsound.play().catch(console.error);

            // return;
            const display_timer = widget.querySelector(".display_timer");
            const hours_input= widget.querySelector(".hours-timer");
            const minutes_input = widget.querySelector(".minutes-timer");
            const seconds_input = widget.querySelector(".seconds-timer");
            const start_button = widget.querySelector(".start-timer");
            const pause_button = widget.querySelector(".pause-timer");
            const reset_button = widget.querySelector(".reset-timer");

            let total_seconds = 0;
            let interval = null;

            function updateDisplay() {
                const hours = String(Math.floor(total_seconds / 3600)).padStart(2, "0");
                const minutes = String(Math.floor((total_seconds % 3600) / 60)).padStart(2, "0");
                const seconds = String(total_seconds % 60).padStart(2, "0");
                display_timer.textContent = hours + `:` + minutes + `:` + seconds;
            }

            start_button.addEventListener("click", () => {

                if(!interval) {
                    const hours = parseInt(hours_input.value) || 0;
                    const minutes = parseInt(minutes_input.value) || 0;
                    const seconds = parseInt(seconds_input.value) || 0;
                    total_seconds = hours * 3600 + minutes * 60 + seconds + 1;

                    if(!unlocksound) {
                        alarmsound.play().then(()=> {
                            alarmsound.pause();
                            alarmsound.currentTime = 0;
                            unlocksound = true;
                        }).catch(() => {});
                    }
                            

                    interval = setInterval(() => {
                        if (total_seconds <= 0) {
                            clearInterval(interval);
                            interval = null;
                            alarmsound.play();
                            alert("Time is up :D");
                            return;
                        }
                        total_seconds --;
                        updateDisplay();
                    }, 1000);
                }

            });

            pause_button.addEventListener("click",  ()=> {
                if(interval) {
                    clearInterval(interval);
                    interval = null;
                }
            });

            reset_button.addEventListener("click", () =>{
                clearInterval(interval);
                interval = null;
                total_seconds = 0;
                updateDisplay();
                hours_input.value = "";
                minutes_input.value = "";
                seconds_input.value = "";
            });

            updateDisplay();
        });
        }

        function pc_stats() {

            document.querySelectorAll(".pc_stats-widget").forEach(widget => {

                const widget_content = widget.querySelector(".widget-content");

                function update_stats() {
                    fetch("/pcstats")
                    .then(res => res.json())
                    .then(data =>{

                        const cpu = data.cpu_percent;
                        const ram = data.ram_percent;
                        const disk = data.disk_percent;

                        widget_content.innerHTML = `
                        <span class = "stats_text">CPU Usage</span> - ${cpu}%<br>
                        <span class = "stats_text">RAM Usage</span> - ${ram}%<br>
                        <span class = "stats_text">Disk Usage</span> - ${disk}%<br>
                        `;
                    }); 
                }

                update_stats();
                setInterval(update_stats, 1000);
            });
        }

        function pc_stats_advanced() {
            document.querySelectorAll(".pc_stats_advanced-widget").forEach(widget =>{

                const widget_content = widget.querySelector(".widget-content");
                const display_list = widget.dataset.display ? widget.dataset.display.split(',') : ['cpu-usage', 'disk-usage', 'ram-usage'];

                function update_stats() {
                    fetch("/pcstats")
                    .then(res => res.json())
                    .then(data =>{
                        let html_info = '';

                        const cpu_percent = data.cpu_percent;
                        const disk_usage = data.disk_percent;
                        const ram_percent = data.ram_percent;

                        if(display_list.includes('cpu-usage')) {
                            html_info += `<span class="stats_text">CPU Usage</span> - ${cpu_percent}%<br>`
                        }

                        if(display_list.includes('disk-usage')) {
                            html_info += `<span class="stats_text">Disk Usage</span> - ${disk_usage}%<br>`
                        }
                        
                        if(display_list.includes('ram-usage')) {
                            html_info += `<span class="stats_text">RAM Usage</span> - ${ram_percent}%`
                        }


                        widget_content.innerHTML = html_info;

                    });
                }

                update_stats();
                setInterval(update_stats, 1000);
            });
        }


        function app_launcher() {
            document.querySelectorAll(".app-launch-button").forEach(button =>{
                button.onclick = () => {
                    fetch("/apprun", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({cmd : button.dataset.cmd})
                    });
                }
            });
        }

        
        async function Hackatime() {
            const res = await fetch("/hackatime/today");
            const data = await res.json();

            const res2 = await fetch("/hackatime/data");
            const data2 = await res2.json();

            time_today = data["Time Today"];
            username = data2.data.username;
            total_time = data2.data.human_readable_total;
            trust = data2.trust_factor.trust_level;

            document.querySelector(".hackatime-loading").innerHTML = `
            <span class="hackatime-time-today">Today - ${time_today}</span>
            <hr>
            <span class="hackatime-username">Username - ${username}</span>
            <br>
            <span class="hackatime-project">Total Time - ${total_time} </span>
            <br>
            <span class="hackatime-trust">Trust Level - ${trust}</span>
            `;

        }



        const audio_bar = document.getElementById("audio-bar");
        let isDragging = false;


        window.audioPlayPause = async function () {
            await fetch("/audio/play_pause", {method: "POST"});
        }

        window.audioNext = async function () {
            await fetch("/audio/next", {method: "POST"});
            audio_bar.value = 0;
        }

        window.audioPrevious =async function  () {
            await fetch("/audio/previous", {method: "POST"});
            audio_bar.value = 0;
        }
        
        window.audioVolumeUp = async function() {
            await fetch("/audio/volume_up", {method: "POST"});
        }

        window.audioVolumeDown = async function () {
            await fetch("/audio/volume_down", {method: "POST"});
        }
        
        audio_bar.addEventListener("input", (e) => {
            isDragging = true;
            document.getElementById("audio-current-time").textContent = formatTime(parseInt(e.target.value));
        });

        audio_bar.addEventListener("change", async (e)=> {
            const new_time = e.target.value;
            await fetch("/audio/seek", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({position: parseInt(new_time)})
            });
            isDragging = false;
        });



        async function Audio_function() {
            const res = await fetch("audio/current");
            const data = await res.json();
            // const audio_bar = document.getElementById("audio-bar");

            const res2 = await fetch("audio/volume");
            const data2 = await res2.json();

            console.log(data);

            artist = data.artist;
            title = data.title;
            status_audio = data.status;
            cover = data.cover;
            audio_time_int = data.length;
            audio_current_time_int = data.position;
            audio_time = formatTime(audio_time_int);
            audio_current_time = formatTime(audio_current_time_int);
            volume = data2.volume;

            document.getElementById("audio-artist").textContent = artist;
            document.getElementById("audio-title").textContent = title;
            // document.getElementById("audio-cover").src = /static/default_cover.png;
            document.getElementById("audio-status").textContent = status_audio;
            document.getElementById("audio-time").textContent = audio_time;
            document.getElementById("audio-current-time").textContent = audio_current_time;
            document.getElementById("audio-volume").textContent = `Volume - ${volume}%`;


            if(!isDragging) {
                audio_bar.max = data.length;
                audio_bar.value = data.position;

            }
        }

        async function Lyrics(artist, title) {
            const res = await fetch(`/audio/lyrics/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
            const data = await res.json();
            if(data.lyrics) {
                display_lyrics(data.lyrics);
            } else {
                console.error("No lyrics found");
            }
        }

        function display_lyrics(lines) {
            const audio_lyrics = document.getElementById("audio-lyrics");
            audio_lyrics.innerHTML = '';
            lines.forEach(line => {
                const p = document.createElement('p');
                p.textContent = line;
                audio_lyrics.appendChild(p);
            });
        }

        let lastClipboard = [];

        async function clipboard() {
            const res = await fetch("/clipboard/history");
            const data = await res.json();
            console.log(data);

            if (JSON.stringify(data.history) === JSON.stringify(lastClipboard)) {
                return;
            }

            const clipboard_content = document.getElementById("clipboard-content");
            if (!clipboard_content) return;


            clipboard_content.replaceChildren();

            data.history.forEach(item => {
                const div = document.createElement('div');
                div.className="clipboard-item";
                div.textContent = item;

                div.onclick=() => {
                    navigator.clipboard.writeText(item);
                };
                clipboard_content.appendChild(div);
            });
        }

        async function mail() {
            const res = await fetch("/mail/mail")
            const data = await res.json();

            mail_widget = document.getElementById("widget-mail-content");
            mail_item = document.getElementById("mail-item")

            const reverse_letters = [...data.letters].reverse();

            reverse_letters.slice(0, 5).forEach(letter => {
                const div = document.createElement("div");
                div.className = "mail-item";
                div.id = "mail-item"
                
                div.innerHTML = `${letter.title}`
                let mail = letter.title;
                // mail_widget.innerHTML = JSON.stringify(mail).replace(/^["']|["']$/g, "");
                mail_widget.appendChild(div);

                div.addEventListener('click', function(){
                    alert(
                        `Title - ${letter.title} \nStatus - ${letter.status}\nCreated - ${letter.created_at}\nType - ${letter.type}\nTags - ${letter.tags}`);
                });
            });
            
        }



    loadTodos();
    attachToggle();
    addTodo();
    Reset();
    Weather();
    GridSetup();
    Hackatime();
    clock();
    timer();
    pc_stats();
    pc_stats_advanced();
    app_launcher();
    Audio_function();
    clipboard();
    mail();

    // Lyrics(data.artist, data.title);
    setInterval(clipboard, 5000);
    setInterval(Audio_function, 2000);


});