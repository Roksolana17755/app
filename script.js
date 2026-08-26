let habits = JSON.parse(localStorage.getItem("habits")) || [];

habits = habits.map(function(habit) {
    return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon || habit.name.charAt(0).toUpperCase(),
        createdAt: habit.createdAt || new Date().toISOString(),
        history: habit.history || habit.completed || []
    };
});

localStorage.setItem("habits", JSON.stringify(habits));

const form = document.getElementById("habitForm");
const input = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const error = document.getElementById("error");
const filter = document.getElementById("filter");
const sort = document.getElementById("sort");
const empty = document.getElementById("empty");


function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}


function addHabit(name) {

    name = name.trim();

    if (name === "") {
        error.textContent = "Введіть назву звички.";
        return;
    }

    error.textContent = "";

    const newHabit = {
        id: Date.now(),
        name: name,
        icon: name.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString(),
        history: []
    };

    habits.push(newHabit);

    saveHabits();

    input.value = "";

    renderHabits();
}


form.addEventListener("submit", function(event) {

    event.preventDefault();

    addHabit(input.value);

});


function getStreak(habit) {

    let streak = 0;
    let date = new Date();

    while (true) {

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const currentDate =
            year + "-" + month + "-" + day;

        if (habit.history.includes(currentDate)) {

            streak++;

            date.setDate(date.getDate() - 1);

        } else {

            break;
        }
    }

    return streak;
}


function toggleHabit(id) {

    const habit = habits.find(function(item) {
        return item.id === id;
    });

    if (!habit) {
        return;
    }

    const today = getToday();

    if (habit.history.includes(today)) {

        habit.history = habit.history.filter(function(date) {
            return date !== today;
        });

    } else {

        habit.history.push(today);

    }

    saveHabits();

    renderHabits();
}


function deleteHabit(id) {

    if (!confirm("Ви впевнені, що хочете видалити цю звичку?")) {
        return;
    }

    habits = habits.filter(function(habit) {
        return habit.id !== id;
    });

    saveHabits();

    renderHabits();
}


function createHabitCard(habit) {

    const card = document.createElement("article");

    card.className = "habit-card";

    const isDone =
        habit.history.includes(getToday());

    if (isDone) {
        card.classList.add("done");
    }

    const info = document.createElement("div");

    info.className = "habit-info";


    const title = document.createElement("h3");

    title.className = "habit-title";

    title.textContent = habit.name;


    const created = document.createElement("p");

    created.className = "habit-details";

    created.textContent =
        "Створено: " +
        new Date(habit.createdAt)
            .toLocaleDateString("uk-UA");


    const streak = document.createElement("p");

    streak.className = "habit-details";

    streak.textContent =
        "Поточний стрік: " +
        getStreak(habit) +
        " днів";


    info.appendChild(title);
    info.appendChild(created);
    info.appendChild(streak);


    const actions = document.createElement("div");

    actions.className = "habit-actions";


    const completeButton =
        document.createElement("button");

    completeButton.textContent =
        isDone ? "Скасувати" : "Виконано сьогодні";


    completeButton.addEventListener("click", function() {

        toggleHabit(habit.id);

    });


    const deleteButton =
        document.createElement("button");

    deleteButton.textContent = "Видалити";

    deleteButton.className = "delete-button";


    deleteButton.addEventListener("click", function() {

        deleteHabit(habit.id);

    });


    actions.appendChild(completeButton);
    actions.appendChild(deleteButton);


    card.appendChild(info);
    card.appendChild(actions);


    return card;
}


function renderHabits() {

    let visibleHabits = [...habits];


    if (filter.value === "done") {

        visibleHabits = visibleHabits.filter(function(habit) {

            return habit.history.includes(getToday());

        });

    }


    if (filter.value === "notDone") {

        visibleHabits = visibleHabits.filter(function(habit) {

            return !habit.history.includes(getToday());

        });

    }


    if (sort.value === "name") {

        visibleHabits.sort(function(a, b) {

            return a.name.localeCompare(b.name);

        });

    }


    if (sort.value === "date") {

        visibleHabits.sort(function(a, b) {

            return new Date(a.createdAt) -
                   new Date(b.createdAt);

        });

    }


    if (sort.value === "streak") {

        visibleHabits.sort(function(a, b) {

            return getStreak(b) -
                   getStreak(a);

        });

    }


    habitList.innerHTML = "";


    const cards = visibleHabits.map(function(habit) {

        return createHabitCard(habit);

    });


    cards.forEach(function(card) {

        habitList.appendChild(card);

    });


    if (visibleHabits.length === 0) {

        empty.style.display = "block";

    } else {

        empty.style.display = "none";

    }


    updateStatistics();
}


function updateStatistics() {

    const total = habits.length;


    const doneHabits = habits.filter(function(habit) {

        return habit.history.includes(getToday());

    });


    const doneToday = doneHabits.length;


    const completedCount = habits.reduce(
        function(count, habit) {

            if (habit.history.includes(getToday())) {
                return count + 1;
            }

            return count;

        },
        0
    );


    let percent = 0;


    if (total > 0) {

        percent =
            Math.round((completedCount / total) * 100);

    }


    document.getElementById("total").textContent =
        total;

    document.getElementById("doneToday").textContent =
        doneToday;

    document.getElementById("percent").textContent =
        percent + "%";

    document.getElementById("progress").style.width =
        percent + "%";
}


filter.addEventListener("change", function() {

    renderHabits();

});


sort.addEventListener("change", function() {

    renderHabits();

});


renderHabits();