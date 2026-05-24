//Target DOM Elements
const appContainer = document.querySelector("#app-container");
const mainControlsContainer = document.querySelector(
  "#main-controls-container"
);
const mainInput = document.querySelector("#main-input");
const helpButton = document.querySelector("#help-btn");
const addButton = document.querySelector("#add-btn");
const clearButton = document.querySelector("#clear-btn");
const todoList = document.querySelector("#todo-list");
const listItemsHeading = document.querySelector("#list-items-heading");
const toggleButton = document.querySelector("#toggle-btn");

//Selecting dialog box elements
const helpDialog = document.querySelector("#help-dialog");
const instructionsHeading = document
  .querySelector("#instructions-heading")
  .focus();
const closeButton = document.querySelector("#close-btn");

//Select live region
const liveRegion = document.querySelector("#live-region");

//Add aria label to main input
mainInput.focus();
mainInput.setAttribute("aria-label", "Enter todo here.");

//Default display state of controls
let controlsVisible = true;

//Default text for toggle button
toggleButton.textContent = "HIDE MAIN CONTROLS";

//Create key for storing current todos array in local storage
const storageKey = "todos";

//Create an array to store todo items
let todos = [];

//Call loadTodos() and render updated list to screen
loadTodos();
renderTodos();

//Main button events to:
// - Add a new item when the Add Task button is clicked
// - Clear the entire list when the Clear All button is clicked
addButton.addEventListener("click", addTodos);
mainInput.addEventListener("keydown", addTodos);
clearButton.addEventListener("click", clearTodos);

//Event listeners for help dialog box
helpButton.addEventListener("click", () => {
  appContainer.classList.add("hidden");
  helpDialog.showModal();
});

//Handle closing of modal
helpDialog.addEventListener("close", () => {
  appContainer.classList.remove("hidden");
  liveRegion.textContent = "Help dialog closed.";
  helpButton.focus();
});

//Event listener for Close button
closeButton.addEventListener("click", () => {
  helpDialog.close();
});

//Define addTodos() function
function addTodos(event) {
  if (event.type === "click" || event.key === "Enter") {
    event.preventDefault();

    //Trim user input and store it in todoText
    const todoText = mainInput.value.trim();

    //Create todo object
    const newTodo = {
      id: Date.now(),
      text: todoText,
      completed: false,
      editing: false,
      visible: true
    };

    //Only add an item if the user has typed something
    if (todoText !== "") {
      todos.push(newTodo);
    }

    //Disable add button when input field is empty
    mainInput.value = "";

    //Announcements for adding items
    if (todoText === "") {
      liveRegion.textContent = "";
      setTimeout(() => {
        liveRegion.textContent = "Enter text.";
      }, 100);
      // input.focus();
      // return;
    } else {
      liveRegion.textContent = "";
      setTimeout(() => {
        liveRegion.textContent =
          "Item added. Complete, Edit and Delete available.";
      }, 100);
    }

    //Focus text area automatically after adding an item.
    //Return cursor to the beginning of text area
    mainInput.focus();
  }

  //Save current data and call renderTodos();
  saveTodos();
  renderTodos();
}

//Define clearTodos() function
function clearTodos() {
  //Clear todos + announcements for zero and non-zero array lengths
  if (todos.length !== 0) {
    todos = [];
    liveRegion.textContent = "";
    setTimeout(() => {
      liveRegion.textContent = "All items  cleared.";
    }, 100);
  } else {
    liveRegion.textContent = "";
    setTimeout(() => {
      liveRegion.textContent = "List is currently empty.";
    }, 100);
  }

  saveTodos();
  renderTodos();
}

//Add event listener to toggle button
toggleButton.addEventListener("click", () => {
  controlsVisible = !controlsVisible;
  if (!controlsVisible) {
    liveRegion.textContent = "Main controls visible.";
  } else {
    liveRegion.textContent = "Main controls hidden.";
  }

  saveTodos();
  renderTodos();
});

//*****************************
//*****************************
//Define a function to display the current todo count
function displayTodoCount() {
  //Make list items heading focusable
  //Target list heading and add todo count
  listItemsHeading.textContent = "NUMBER OF ITEMS: " + todos.length;
}

//***********************************
//***********************************
//Define renderTodos() function
function renderTodos() {
  //Clear list contents
  todoList.innerHTML = "";

  //Control visibility of main controls
  if (controlsVisible) {
    mainControlsContainer.classList.remove("hidden");
    toggleButton.textContent = "HIDE MAIN CONTROLS";
  } else {
    mainControlsContainer.classList.add("hidden");
    toggleButton.textContent = "SHOW MAIN CONTROLS";
  }

  //Check if at least one todo is in the editing state
  const isEditing = todos.some((todo) => todo.editing);

  //Modify heading according to editing state
  if (isEditing) {
    listItemsHeading.textContent = "EDITING ITEM";
  } else {
    displayTodoCount();
  }

  //Disable some main controls when app is in editing state
  mainInput.disabled = isEditing;
  addButton.disabled = isEditing;
  clearButton.disabled = isEditing;

  //Loop through todos array
  todos.forEach((todo) => {
    //*********************************
    //Create and add list items and associated formatting and controls
    //********************************/

    //Create list item
    //Add class for styling
    const listItem = document.createElement("li");
    todoList.appendChild(listItem);
    listItem.classList.add("todo-item");

    //Hide main container and list items heading if any todo is editing
    //If visible is false, hide non-editing todos and main controls container
    if (!todo.visible) {
      listItem.classList.add("hidden");
    }

    //Create a container for theComplete, Edit and Delete buttons
    const todoButtonContainer = document.createElement("div");
    todoButtonContainer.classList.add("todo-btn-container");

    //Create Complete, Edit and Delete buttons
    const completeButton = document.createElement("button");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const cancelButton = document.createElement("button");

    //Store buttons in a collection
    const todoButtons = [
      completeButton,
      editButton,
      deleteButton,
      cancelButton
    ];

    //Add classes for styling buttons
    todoButtons.forEach((button) => {
      button.classList.add("todo-btn");
    });

    //***********************************************************/
    //Toggle between span and input based on editing state
    //Toggle span colors and text based on complete state

    //Not editing
    if (!todo.editing) {
      //Append span to list item
      //Add text span class flor layout
      //Make span focusable
      let textSpan = document.createElement("span");
      let completedStatus = document.createElement("span");

      //Add classes to text spans
      textSpan.classList.add("todo-span");
      completedStatus.classList.add("sr-only");

      //Store todo text inside main span
      textSpan.textContent = todo.text;

      //Make text span focusable
      textSpan.tabIndex = 0;

      completeButton.textContent = "COMPLETE";
      completeButton.setAttribute("aria-label", "Complete " + todo.text);

      //Edit button should read Edit. Add correct label.
      editButton.textContent = "EDIT";
      editButton.setAttribute("aria-label", "Edit " + todo.text);

      deleteButton.textContent = "DELETE";
      deleteButton.setAttribute("aria-label", "Delete " + todo.text);

      //Append Completed Status label for screen readers
      listItem.appendChild(textSpan);
      textSpan.appendChild(completedStatus);

      //Nested control flow statements for complete/incomplete tasks when not editing
      //Add appropriate styling and completed status span
      //Make completed status span focusable
      if (!todo.completed) {
        textSpan.classList.add("todo-span-incomplete");
        completedStatus.textContent = ", Not completed";
      } else {
        completeButton.textContent = "NOT COMPLETE";
        textSpan.classList.add("todo-span-completed");
        completedStatus.textContent = ", Completed";
        completeButton.setAttribute(
          "aria-label",
          "Mark " + todo.text + " as incomplete"
        );
      }

      //Attach event listeners to Complete, Edit and Delete buttons
      completeButton.addEventListener("click", () => {
        toggleComplete(todo.id);
      });

      //Switch to edit mode when edit button is clicked.
      editButton.addEventListener("click", () => {
        todo.editing = true;
        toggleVisibility(todo.id);
        liveRegion.text = "";
        setTimeout(() => {
          liveRegion.textContent =
            "Editing " +
            todo.text +
            ". Save and cancel available. Add and Clear controls unavailable.";
        }, 100);
      });

      deleteButton.addEventListener("click", () => {
        deleteTodo(todo.id);
      });

      //Append View mode buttons to button container
      todoButtonContainer.append(completeButton, editButton, deleteButton);

      //Editing
    } else {
      //Modify list items heading

      let inlineInput = document.createElement("input");
      inlineInput.maxLength = 20;
      inlineInput.value = todo.text;

      //Modify edit button properties
      editButton.textContent = "SAVE";
      editButton.setAttribute("aria-label", "Save " + inlineInput.value);

      cancelButton.textContent = "CANCEL";
      cancelButton.setAttribute("aria-label", "Cancel edit.");

      listItem.appendChild(inlineInput);
      inlineInput.classList.add("inline-input");
      inlineInput.focus();

      //Function to handle edits with "Save" button or "Enter" key
      function handleEdit(event) {
        let newValue = inlineInput.value.trim();
        if (event.type === "click" || event.key === "Enter") {
          event.preventDefault();
          if (newValue !== "") {
            todo.text = newValue;
          }

          //Turn off editing and reset complete state to false
          todo.editing = false;
          todo.completed = false;
          liveRegion.textContent =
            "Saving " + todo.text + ". Add and Clear controls available.";
          toggleVisibility(todo.id);
        }
      }

      //Function to handle cancelling changes with "Cancel" button or "Escape" key
      function handleCancel(event) {
        if (event.type === "click" || event.key === "Escape") {
          event.preventDefault();
          cancelEdit(todo.id);
          toggleVisibility(todo.id);
          liveRegion.textContent = "Changes discarded.";
        }
      }

      //Event listeners for editing
      editButton.addEventListener("click", handleEdit);
      inlineInput.addEventListener("keydown", handleEdit);

      //Event listeners for cancelling changes
      cancelButton.addEventListener("click", handleCancel);
      inlineInput.addEventListener("keydown", handleCancel);

      //Listen for changes in inline input field.
      //Screen reader should read Save (current input)
      inlineInput.addEventListener("input", () => {
        let newValue = inlineInput.value.trim();
        if (newValue !== "") {
          editButton.setAttribute("aria-label", "Save " + newValue);
        } else {
          editButton.setAttribute("aria-label", "Save " + todo.text);
        }
      });

      //Event listener for Cancel button
      // cancelButton.addEventListener("click", () => {
      //   cancelEdit(todo.id);
      //   toggleVisibility(todo.id);
      //   liveRegion.textContent = "Changes discarded.";
      // });

      //Append Save and Cancel buttons to button container.
      todoButtonContainer.append(editButton, cancelButton);
    }

    //Append these buttons to the container
    //Append button container to list item
    listItem.appendChild(todoButtonContainer);

    //Hide non-editing items

    //Disable Complete and Delete button functionality but keep focusable
    //Change aria labels for buttons
  });
}

//******************************************************************** *//

//Functions for todo item buttons
//Define toggleComplete function
function toggleComplete(id) {
  //Find todo to mark as Complete/Incomplete
  const selectedTodo = todos.find((todo) => todo.id === id);

  //Announce Completed state when Complete button is clicked.
  let isCompleted = selectedTodo.completed;
  if (!isCompleted) {
    liveRegion.textContent = selectedTodo.text + " Completed.";
  } else {
    liveRegion.textContent = selectedTodo.text + " Not completed.";
  }

  //Toggle between Complete/Incomplete states
  todos = todos.map(
    (todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo) //Implicitly return true or false
  );

  //Announce "(Task completed)" or "Task marked incomplete", depending on state

  saveTodos();
  renderTodos();
}

//Define deleteTodo() function
function deleteTodo(id) {
  const selectedTodo = todos.find((todo) => todo.id === id);
  let deletedItem = selectedTodo.text;
  todos = todos.filter((todo) => todo.id !== id); //Remove selected item and rebuild array without this item
  liveRegion.textContent = selectedTodo.text + " Deleted.";

  saveTodos();
  renderTodos();
}

//Define hideSavedItems() function -- used when editing a todo
function toggleVisibility(id) {
  todos = todos.map((todo) =>
    todo.id === id ? todo : { ...todo, visible: !todo.visible }
  );

  saveTodos();
  renderTodos();
}

//Define cancelEdit() function
function cancelEdit(id) {
  const selectedTodo = todos.find((todo) => todo.id === id);

  //Set editing to false
  selectedTodo.editing = false;

  saveTodos();
  renderTodos();
}

//***************************************
//Functions for local storage

//Functions to store todos in local storage and retrieve them upon refreshing.
function saveTodos() {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

function loadTodos() {
  const storedData = localStorage.getItem(storageKey);

  //Function for loading and parsing todos
  if (storedData !== null) {
    todos = JSON.parse(storedData);
  }

  //Ensure that items are rendered with current text, id and completed status.
  //Set editing to false and visible to true;
  todos = todos.map((todo) => {
    todo.editing = false;
    todo.visible = true;
    return todo;
  });
}
