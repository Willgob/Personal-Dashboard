
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.todo-list li').forEach(item => {
        item.addEventListener('click', () => {
            let done = item.getAttribute('data-done') === 'true';
            if (done){
                item.innerHTML = item.textContent;
                item.setAttribute('data-done', 'false');
            } else {
                item.innerHTML = `<s>${item.textContent}</s>`;
                item.setAttribute('data-done', 'true');
            }
        });
    });
});