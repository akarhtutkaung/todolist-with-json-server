
function myFetch(url, options) {
      return new Promise((resolve, reject) => {
        const method = options && options.method ? options.method : 'GET';
    
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        
        if (options && options.headers) {
          Object.entries(options.headers).forEach(([header, value]) => {
            xhttp.setRequestHeader(header, value);
          });
        }
    
        xhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
            const response = {
              json: function () {
                return JSON.parse(xhttp.response);
              }
            }
            resolve(response);
          }
        };
        options && options.body ? xhttp.send(options.body) : xhttp.send();
    });
}


/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)
*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

const APIs = (() => {
    const createTodo = (newTodo) => {
        return myFetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return myFetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const updateComplete = (id, newTodo) => {
        return myFetch("http://localhost:3000/todos/" + id, {
            method: "PUT",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    }

    const getTodos = () => {
        return myFetch("http://localhost:3000/todos").then((res) => res.json());
    };
    return { createTodo, deleteTodo, getTodos, updateComplete };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        get onChange() {
            return this.#onChange;
        }
        set todos(newTodos) {
            // reassign value
            console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        getTodo(id) {
            for (let todo of this.#todos) {
                if (todo.id == id) {
                    return todo;
                }
            }
            return -1;
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, updateComplete } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        updateComplete,
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const todolistEl = document.querySelector(".todo-list");
    const completedlistEl = document.querySelector(".completed-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");
    const todocontainerEl = document.querySelector(".todos-container");

    const renderTodos = (todos) => {
        let todosTemplate = "";
        let completedTemplate = "";
        let pendingTask = 0;
        let completedTask = 0;
        todos.forEach((todo) => {
            const liTemplate =
                `<div id="${todo.id}_text">${todo.content}</div>
                <div>
                <svg id="${todo.id}_edit" class="edit-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24"
                    aria-label="fontSize small">
                    <path id="${todo.id}_edit" class="edit-btn"
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z">
                    </path>
                </svg>
                </div>
                <div>
                <svg id="${todo.id}_delete" class="delete-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24"
                    aria-label="fontSize small">
                    <path id="${todo.id}_delete" class="delete-btn" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
                    </path>
                </svg>
                </div>`;

            const isCompleted = todo.completed === true;
            const liCloseTag = `</li>`;
            if (isCompleted === true) {
                const liOpenTag = `<li class="grid-container-complete-task">`;
                const arrow_dir_tmp = `<div><svg id="${todo.id}_switch" class="arrow-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
                    <path id="${todo.id}_switch" class="arrow-btn" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
                </svg>
                </div>`;
                completedTemplate += liOpenTag + arrow_dir_tmp + liTemplate + liCloseTag;
                completedTask++;
            } else {
                const liOpenTag = `<li class="grid-container-incomplete-task">`;
                const arrow_dir_tmp = `<div><svg id="${todo.id}_switch" class="arrow-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small">
                    <path id="${todo.id}_switch" class="arrow-btn" d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
                </svg></div>`;
                todosTemplate += liOpenTag + liTemplate + arrow_dir_tmp + liCloseTag;
                pendingTask++;
            }

        });
        if (pendingTask === 0) {
            todosTemplate = "<h4>no task to display!</h4>";
        }
        if (completedTask === 0) {
            completedTemplate = "<h4>no task to display!</h4>";
        }
        todolistEl.innerHTML = todosTemplate;
        completedlistEl.innerHTML = completedTemplate;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl, todocontainerEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value;
            if (inputValue !== '') {
                model.createTodo({ content: inputValue, completed: false }).then((data) => {
                    state.todos = [data, ...state.todos];
                    view.clearInput();
                });
            }
        });
    };

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.todocontainerEl.addEventListener("click", (event) => {
            if (event.target.className.baseVal === "delete-btn") {
                let arr = event.target.id.split('_');
                const id = arr[0];
                // console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleComplete = () => {
        /*
          1. get id
          2. get todo obj
          3. update view
        */
        view.todocontainerEl.addEventListener("click", (event) => {
            if (event.target.className.baseVal === "arrow-btn") {
                let arr = event.target.id.split('_');
                const id = arr[0];
                const todo = state.getTodo(id);
                if (todo !== -1) {
                    todo.completed = !todo.completed;
                    model.updateComplete(id, todo);
                    state.onChange();
                } else {
                    console.log("Error, id doesn't exists");
                }
            }
        });
    }

    const handleEdit = () => {
        /*
          1. get id
          2. get todo text
          3. get input
          4. Update input
        */
        view.todocontainerEl.addEventListener("click", (event) => {
            if (event.target.className.baseVal === "edit-btn") {
                let arr = event.target.id.split('_');
                const id = arr[0];
                const text_span = document.getElementById(id + '_text');
                if (text_span.childElementCount === 0) {
                    const content = text_span.textContent;
                    text_span.innerHTML =
                        `<input type="text" id="${id}_new_input" value="${content}">`;
                } else {
                    const newContent = document.getElementById(id + '_new_input').value;
                    const todo = state.getTodo(id);
                    if (todo !== -1) {
                        todo.content = newContent;
                        model.updateComplete(id, todo);
                        state.onChange();
                    } else {
                        console.log("Error, id doesn't exists");
                    }
                }
            }
        });
    }

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleComplete();
        handleEdit();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
