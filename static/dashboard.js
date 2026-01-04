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

        const widgets = document.querySelectorAll('.weather-widget');

        for (const widget of widgets) {
            const location = widget.dataset.location;
            const units = widget.dataset.units;
            const id = widget.dataset.widgetId;
            const latitude = widget.dataset.latitude;
            const longitude = widget.dataset.longitude;
            
            // widget.innerHTML = `hello `;

            const metourl = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&hourly=temperature_2m';
            console.log(metourl);

            const respond = await fetch(metourl);
            const data = await respond.json();

            console.log(data);

            const temperature = data.hourly.temperature_2m[0];

            

            widget.innerHTML = `
            <span class = "weather-location-span" > Location: ${location} </span>
            <br>
            <soan class = "temp" > Temp - ${temperature} °C </span>
            `;

            console.log(widget.dataset);

            // testing

            
        }

    }



    loadTodos();
    attachToggle();
    addTodo();
    Reset();
    Weather();


});