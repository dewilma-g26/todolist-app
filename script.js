document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const loginMessage = document.getElementById('loginMessage');
    const registerNameInput = document.getElementById('registerName');
    const registerUsernameInput = document.getElementById('registerUsername');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
    const registerJobInput = document.getElementById('registerJob');
    const registerBtn = document.getElementById('registerBtn');
    const registerMessage = document.getElementById('registerMessage');

    const mainContainer = document.getElementById('mainContainer');
    const userNameEl = document.getElementById('userName');
    const userJobEl = document.getElementById('userJob');
    const currentDateEl = document.getElementById('currentDate');
    const currentTimeEl = document.getElementById('currentTime');
    const taskInput = document.getElementById('taskInput');
    const priorityLevel = document.getElementById('priorityLevel');
    const deadlineDateInput = document.getElementById('deadlineDate');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const overdueList = document.getElementById('overdueList');
    const doneList = document.getElementById('doneList');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let users = JSON.parse(localStorage.getItem('users')) || {
        'dewi': {
            password: 'password123',
            name: 'Dewi Ilma Ghoiriyah',
            job: 'Full-Stack Developer'
        }
    };
    
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    let activeUser = localStorage.getItem('activeUser');
    let tasks = [];

    function initApp() {
        if (activeUser) {
            showMainApp(activeUser);
        } else {
            showAuthForm();
        }
    }

    function showAuthForm() {
        authForm.style.display = 'flex';
        mainContainer.style.display = 'none';
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';
        loginMessage.textContent = '';
        registerNameInput.value = '';
        registerUsernameInput.value = '';
        registerPasswordInput.value = '';
        registerConfirmPasswordInput.value = '';
        registerJobInput.value = '';
        registerMessage.textContent = '';
    }

    function showMainApp(username) {
        authForm.style.display = 'none';
        mainContainer.style.display = 'block';
        
        const user = users[username];
        if (user) {
            userNameEl.textContent = user.name;
            userJobEl.textContent = user.job || 'Jabatan tidak tersedia';
            tasks = JSON.parse(localStorage.getItem(`tasks_${activeUser}`)) || [];
            renderTasks();
        } else {
            handleLogout();
        }
    }

    showLoginBtn.addEventListener('click', () => showForm('login'));
    showRegisterBtn.addEventListener('click', () => showForm('register'));
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    addTaskBtn.addEventListener('click', addTask);
    deleteAllBtn.addEventListener('click', handleDeleteAll);
    logoutBtn.addEventListener('click', handleLogout);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    function updateDateTime() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit' };
        currentDateEl.textContent = now.toLocaleDateString('id-ID', optionsDate);
        currentTimeEl.textContent = now.toLocaleTimeString('id-ID', optionsTime);
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    function showForm(form) {
        loginMessage.textContent = '';
        registerMessage.textContent = '';
        if (form === 'login') {
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
            showLoginBtn.classList.add('active');
            showRegisterBtn.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'flex';
            showLoginBtn.classList.remove('active');
            showRegisterBtn.classList.add('active');
        }
    }
    
    function saveAndRenderTasks() {
        if (activeUser) {
            localStorage.setItem(`tasks_${activeUser}`, JSON.stringify(tasks));
        }
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        overdueList.innerHTML = '';
        doneList.innerHTML = '';

        const now = new Date();

        tasks.forEach(task => {
            const li = createTaskElement(task);
            const deadline = task.deadline ? new Date(task.deadline) : null;
            const isOverdue = deadline && !task.completed && deadline < now;

            if (isOverdue) {
                li.classList.add('overdue');
                overdueList.appendChild(li);
            } else if (task.completed) {
                doneList.appendChild(li);
            } else {
                taskList.appendChild(li);
            }
        });
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.classList.add('completed');
        }

        const taskTextDiv = document.createElement('div');
        taskTextDiv.className = 'task-text';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = !task.completed;
            saveAndRenderTasks();
        });
        taskTextDiv.appendChild(checkbox);

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        taskTextDiv.appendChild(taskTextSpan);

        const prioritySpan = document.createElement('span');
        prioritySpan.className = `task-priority priority-${task.priority}`;
        prioritySpan.textContent = task.priority;
        taskTextDiv.appendChild(prioritySpan);

        if (task.deadline) {
            const deadlineSpan = document.createElement('span');
            const date = new Date(task.deadline);
            deadlineSpan.textContent = `Deadline: ${date.toLocaleDateString('id-ID')}`;
            deadlineSpan.className = 'task-deadline';
            taskTextDiv.appendChild(deadlineSpan);
        }

        const taskActionsDiv = document.createElement('div');
        taskActionsDiv.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '✗';
        deleteBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveAndRenderTasks();
        });
        taskActionsDiv.appendChild(deleteBtn);

        li.appendChild(taskTextDiv);
        li.appendChild(taskActionsDiv);

        return li;
    }

    function handleLogin() {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;

        if (users[username] && users[username].password === password) {
            activeUser = username;
            localStorage.setItem('activeUser', activeUser);
            showMainApp(activeUser);
        } else {
            loginMessage.textContent = 'Username atau password salah.';
        }
    }

    function handleRegister() {
        const name = registerNameInput.value.trim();
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;
        const job = registerJobInput.value.trim();

        if (!name || !username || !password || !confirmPassword) {
            registerMessage.textContent = 'Semua field wajib diisi.';
            return;
        }
        if (password !== confirmPassword) {
            registerMessage.textContent = 'Password tidak cocok.';
            return;
        }
        if (users[username]) {
            registerMessage.textContent = 'Username sudah digunakan.';
            return;
        }

        users[username] = {
            name: name,
            job: job || 'Jabatan tidak tersedia',
            password: password
        };
        localStorage.setItem('users', JSON.stringify(users));
        registerMessage.textContent = 'Pendaftaran berhasil. Silakan login.';
        registerMessage.style.color = 'green';
        
        showForm('login');
        registerNameInput.value = '';
        registerUsernameInput.value = '';
        registerPasswordInput.value = '';
        registerConfirmPasswordInput.value = '';
        registerJobInput.value = '';
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const priority = priorityLevel.value;
        const deadline = deadlineDateInput.value;

        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                priority: priority,
                deadline: deadline,
                completed: false
            };
            tasks.push(newTask);
            taskInput.value = '';
            deadlineDateInput.value = '';
            saveAndRenderTasks();
        }
    }

    function handleDeleteAll() {
        if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
            tasks = [];
            saveAndRenderTasks();
        }
    }

    function handleLogout() {
        activeUser = null;
        localStorage.removeItem('activeUser');
        showAuthForm();
    }

    initApp();
});