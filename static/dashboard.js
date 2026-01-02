document.addEventListener('DOMContentLoaded', () => {

    function SaveTodos() {
        const todos = {};
        document.querySelectorAll('.widget').forEach(widget => {
            const title = widget.querySelector('.widget-header').textContent.trim();
            const todoList = widget.querySelectorAll('.todo-list li');
            if(todoList.length > 0) {
                todos[title] = [];
                todoList.forEach(li => {
                    const done = li.getAttribute('data-done') === 'true';
                    const task = li.textContent.replace(/^\s*|\s*$/g, '');
                    todos[title].push({task, done});
                });
            }
        });
        localStorage.setItem('todos', JSON.stringify(todos));
        
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos') || '{}');
        document.querySelectorAll('.widget').forEach(widget => {
            const title = widget.querySelector('.widget-header').textContent.trim();
            const todoList = widget.querySelector('.todo-list');
            if(todoList && todos[title]) {
                todoList.innerHTML = '';
                todos[title].forEach(task => {
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
            const title = widget.querySelector('.widget-header')?.textContent.trim();

            if(todoList && resetButton && title) {
                resetButton.addEventListener('click', () => {
                    if(!confirm('U done?')) return;
                    todoList.innerHTML = '';
                    const todos = JSON.parse(localStorage.getItem('todos') || '{}');
                    delete todos[title];
                    localStorage.setItem('todos', JSON.stringify(todos));
                });
            }
        });
    }



    loadTodos();
    attachToggle();
    addTodo();
    Reset();

});