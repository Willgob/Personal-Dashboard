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
            
            widget.innerHTML = `hello `;
            const metnourl = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + latitude + '&lon=' + longitude;
            console.log(metnourl);

            const respond = await fetch(metnourl, {
                headers: { 'User-Agent' : 'MyDashboard/1.3'}
            });

            const data = await respond.json();

            console.log(data.properties.timeseries[0].data.instant.details);

            const temperature = data.properties.timeseries[0].data.instant.details.air_temperature;

            // widget.innerHTML = ` Temp - ${temperature} °C`;

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