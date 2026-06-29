//Register service worker for offline use
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("Service worker registered"))
      .catch((error) => console.error("Service worker failed:", error));
  });
}

//Target DOM Elements
const appContainer = document.querySelector("#app-container");
const mainControlsContainer = document.querySelector(
  "#main-controls-container"
);
//Select first element in main controls container
const navigationControlsContainer = document.querySelector(
  "#navigation-controls-container"
);
const mainInput = document.querySelector("#main-input");
const helpButton = document.querySelector("#help-btn");
const addButton = document.querySelector("#add-btn");
const clearButton = document.querySelector("#clear-btn");
const activeListButton = document.querySelector("#active-list-btn");
const completedListButton = document.querySelector("#completed-list-btn");
const activeList = document.querySelector("#active-list");
const completedList = document.querySelector("#completed-list");
const listItemsHeading = document.querySelector("#list-items-heading");
//Selecting dialog box elements
const helpDialog = document.querySelector("#help-dialog");
const instructionsHeading = document
  .querySelector("#instructions-heading")
  .focus();
const closeButton = document.querySelector("#close-btn");

//Select live region
const liveRegion = document.querySelector("#live-region");

//Live region announcement helper
function announce(message) {
  liveRegion.textContent = "";

  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

//Add aria label to main input
mainInput.focus();
mainInput.setAttribute("aria-label", "Enter todo here.");

//Default display state for Completed section
//Default text for switch list button
let showingCompleted = false;

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

//Event listener to handle keyboard navigation
document.addEventListener("keydown", handleKeyboardNavigation);

//Helper to handle keyboard navigation
function handleKeyboardNavigation(event) {
  //Do not execute code if alt key is not pressed
  //Exit function immediately
  if (!event.altKey) return;

  switch (event.key.toLowerCase()) {
    case "m":
      event.preventDefault();
      showingCompleted ? clearButton.focus() : mainInput.focus();
      break;

    case "i":
      listItemsHeading.focus();
      break;

    case "1":
    case "n":
      event.preventDefault();
      activeListButton.focus();
      break;

    case "2":
      event.preventDefault();
      completedListButton.focus();
      break;

    case "h":
      event.preventDefault();
      helpButton.focus();
      break;

    case "l":
      const visibleList = showingCompleted ? completedList : activeList;

      //Focus span in first list item
      const firstSpan = visibleList.querySelector(".todo-span");

      //Only apply focus if span can be found in the DOM.
      if (firstSpan) {
        firstSpan.focus();
      }
  }
}

//Event listeners for help dialog box
helpButton.addEventListener("click", () => {
  appContainer.classList.add("hidden");
  helpDialog.showModal();
});

//Handle closing of modal
helpDialog.addEventListener("close", () => {
  appContainer.classList.remove("hidden");
  announce("Help dialog closed");
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
      completedAt: null,
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
      announce("Enter text."); // input.focus();
      // return;
    } else {
      announce(newTodo.text + " added. Complete, edit and delete available.");
    }

    //Focus text area automatically after adding an item.
    //Return cursor to the beginning of text area
    mainInput.focus();

    saveTodos();
    renderTodos();

    scrollActiveList();
  }

  //Save current data and call renderTodos();
  saveTodos();
  renderTodos();
} //End of addTodos() function definition

//Function to scroll active todos when list items overflow. Call in "addTodos()"
function scrollActiveList() {
  if (activeList.scrollHeight > activeList.clientHeight) {
    activeList.scrollTo({
      top: activeList.scrollHeight,
      behavior: "smooth"
    });
    console.log("Scrolling code ran");
  }
}

//Function to scroll list to bottom when content overflows
//Define clearTodos() function
function clearTodos() {
  const visibleTodos = getVisibleTodos();

  if (visibleTodos.length === 0) {
    showingCompleted
      ? announce("Completed list is currently empty.")
      : announce("Active list is currently empty.");

    return;
  }

  if (showingCompleted) {
    todos = todos.filter((todo) => !todo.completed);
    announce("Completed items cleared.");
  } else {
    todos = todos.filter((todo) => todo.completed);
    announce("Active items cleared.");
  }

  saveTodos();
  renderTodos();
}

//Function to return visible list
function getVisibleTodos() {
  return showingCompleted
    ? todos.filter((todo) => todo.completed)
    : todos.filter((todo) => !todo.completed);
}

//Add event listener for switch list button
activeListButton.addEventListener("click", () => {
  showingCompleted = false;
  announce("Active list selected.");

  saveTodos();
  renderTodos();

  //Active list starts from the top when loaded
  activeList.scrollTop = 0;
});

completedListButton.addEventListener("click", () => {
  showingCompleted = true;
  announce("Completed list selected.");

  saveTodos();
  renderTodos();

  //Completed list starts from the top when loaded
  completedList.scrollTop = 0;
});

//*****************************
//*****************************
//Define a function to display the current todo count
function updateListViewUI(activeTodos, completedTodos) {
  //Make list items heading focusable
  //Target list heading and add todo count
  listItemsHeading.textContent = showingCompleted
    ? "COMPLETED ITEMS: " + completedTodos.length
    : "ACTIVE ITEMS: " + activeTodos.length;

  //Change text on clear button, depending on list view
  clearButton.textContent = showingCompleted
    ? "CLEAR COMPLETED"
    : "CLEAR ACTIVE";

  //Collection of elements to hide or remove based on completed state
  const hidingElements = [mainInput, addButton, activeList];

  //Show/hide different lists and style navigtion buttons, depending on view
  if (showingCompleted) {
    // activeList.classList.remove("hidden");
    hidingElements.forEach((element) => {
      element.classList.add("hidden");
    });

    completedList.classList.remove("hidden");

    //Change style of completed buttons
    activeListButton.classList.remove("current-list-btn");
    completedListButton.classList.add("current-list-btn");

    //Maintain main controls container dimensions
    mainControlsContainer.classList.add("maintained-layout");

    clearButton.setAttribute("aria-label", "Clear completed list.");
  } else {
    // activeList.classList.add("hidden");
    hidingElements.forEach((element) => {
      element.classList.remove("hidden");
    });

    completedList.classList.add("hidden");

    //Change style of active  buttons
    completedListButton.classList.remove("current-list-btn");
    activeListButton.classList.add("current-list-btn");

    clearButton.setAttribute("aria-label", "Clear active list.");
  }
}

//***********************************
//***********************************
//Define renderTodos() function
function renderTodos() {
  //Clear lists contents
  activeList.innerHTML = "";
  completedList.innerHTML = "";

  //Derive active and completed todo arrays
  const activeTodos = todos.filter((todo) => !todo.completed);

  //Sort completed items in descending order
  const completedTodos = todos
    .filter((todo) => todo.completed)
    .sort((a, b) => b.completedAt - a.completedAt);

  // //Check if at least one todo is in the editing state

  //Loop through activeTodos array
  activeTodos.forEach((todo) => {
    //*********************************
    //Create and add list items and associated formatting and controls
    //********************************/

    //Create list item
    //Add class for styling
    const listItem = createTodoItem(todo);
    activeList.append(listItem);

    //Hide non-editing todos
    if (!todo.visible) {
      listItem.classList.add("hidden");
    }
  }); //End of forEach loop for building each list item

  //Loop through completedTodos array
  completedTodos.forEach((todo) => {
    //*********************************
    //Create and add list items and associated formatting and controls
    //********************************/

    //Create list item
    //Add class for styling
    const listItem = createTodoItem(todo);
    completedList.append(listItem);
  }); //End of forEach loop for building each list item

  //Check if at least one todo is in the editing state
  //Helper to render UI for different list views
  updateListViewUI(activeTodos, completedTodos);
  modifyEditingUI();

  // const isEditing = todos.some((todo) => todo.editing);

  // // modify layout according to editing state
  // if (isEditing) {
  //   listItemsHeading.textContent = "EDITING ITEM";
  //   mainControlsContainer.classList.add("hidden");
  //   navigationControlsContainer.classList.add("hidden");
  // } else {
  //   mainControlsContainer.classList.remove("hidden");
  //   navigationControlsContainer.classList.remove("hidden");
  // }
} //End of renderTodo() function definition

//Helper function to temporarily modify editing UI
function modifyEditingUI() {
  const isEditing = todos.some((todo) => todo.editing);

  // modify layout according to editing state
  if (isEditing) {
    listItemsHeading.textContent = "EDITING ITEM";
    mainControlsContainer.classList.add("hidden");
    navigationControlsContainer.classList.add("hidden");
  } else {
    mainControlsContainer.classList.remove("hidden");
    navigationControlsContainer.classList.remove("hidden");
  }
}

//Function to handle edits with "Save" button or "Enter" key
function handleEdit(todo, inlineInput, event) {
  let newValue = inlineInput.value.trim();
  if (event.type === "click" || event.key === "Enter") {
    event.preventDefault();
    if (newValue !== "") {
      todo.text = newValue;
    }

    //Turn off editing and reset complete state to false
    todo.editing = false;
    todo.completed = false;
    announce(
      "Saving " + todo.text + ". Main controls and navigation available."
    );
    toggleVisibility(todo.id);
  }
}

//Function to handle cancelling changes with "Cancel" button or "Escape" key
function handleCancel(todo, event) {
  if (event.type === "click" || event.key === "Escape") {
    event.preventDefault();
    cancelEdit(todo.id);
    toggleVisibility(todo.id);
    announce("Changes discarded. Main controls and navigation available.");
  }
}

//Helper function to build and display todo items
function createTodoItem(todo) {
  const listItem = document.createElement("li");
  activeList.appendChild(listItem);
  listItem.classList.add("todo-item");
  //Create a container for theComplete, Edit and Delete buttons
  const todoButtonContainer = document.createElement("div");
  todoButtonContainer.classList.add("todo-btn-container");

  //Create Complete, Edit and Delete buttons
  const completeButton = document.createElement("button");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const cancelButton = document.createElement("button");

  //Store buttons in a collection
  const todoButtons = [completeButton, editButton, deleteButton, cancelButton];

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
      textSpan.classList.add("todo-span-completed");
      completeButton.textContent = "ACTIVE";
      completedStatus.textContent = ", Completed";
      completeButton.setAttribute(
        "aria-label",
        "Mark " + todo.text + " as active"
      );
      editButton.classList.add("hidden");
    }

    //Attach event listeners to Complete, Edit and Delete buttons
    completeButton.addEventListener("click", () => {
      toggleComplete(todo.id);
    });

    //Switch to edit mode when edit button is clicked.
    editButton.addEventListener("click", () => {
      todo.editing = true;
      toggleVisibility(todo.id);
      announce(
        "Editing " +
          todo.text +
          ". Save and cancel available. Main controls and navigation unavailable"
      );
    });

    deleteButton.addEventListener("click", () => {
      deleteTodo(todo.id);
    });

    //Append View mode buttons to button container
    todoButtonContainer.append(completeButton, editButton, deleteButton);

    //Editing
  } else {
    let inlineInput = document.createElement("input");
    inlineInput.maxLength = 30;
    inlineInput.value = todo.text;
    setTimeout(() => inlineInput.focus(), 0);

    //Modify edit button properties
    editButton.textContent = "SAVE";
    editButton.setAttribute("aria-label", "Save " + inlineInput.value);

    cancelButton.textContent = "CANCEL";
    cancelButton.setAttribute("aria-label", "Cancel edit.");

    listItem.appendChild(inlineInput);
    inlineInput.classList.add("inline-input");
    // inlineInput.focus();

    //Event listeners for editing
    editButton.addEventListener("click", (event) => {
      handleEdit(todo, inlineInput, event);
    });

    inlineInput.addEventListener("keydown", (event) => {
      handleEdit(todo, inlineInput, event);
    });

    //Event listeners for cancelling changes
    cancelButton.addEventListener("click", (event) => {
      handleCancel(todo, event);
    });

    inlineInput.addEventListener("keydown", (event) => {
      handleCancel(todo, event);
    });

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

    //Append Save and Cancel buttons to button container.
    todoButtonContainer.append(editButton, cancelButton);
  }

  //Append these buttons to the container
  //Append button container to list item
  listItem.appendChild(todoButtonContainer);

  return listItem;
}

//******************************************************************** *//

//Functions for todo item buttons
//Define toggleComplete function
function toggleComplete(id) {
  //Find todo to mark as Complete/Incomplete
  const selectedTodo = todos.find((todo) => todo.id === id);

  //Announce Completed state when Complete button is clicked.
  let isCompleted = selectedTodo.completed;
  isCompleted
    ? announce(selectedTodo.text + " moved back to active list.")
    : announce(selectedTodo.text + " Completed. Moved to completed list.");
  //Toggle between Complete/Incomplete states. Add time stamps for sorting completed items.
  todos = todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? Date.now() : null
        }
      : todo
  );

  console.log(todos);

  saveTodos();
  renderTodos();
}

//Define deleteTodo() function
function deleteTodo(id) {
  const selectedTodo = todos.find((todo) => todo.id === id);
  let deletedItem = selectedTodo.text;
  todos = todos.filter((todo) => todo.id !== id); //Remove selected item and rebuild array without this item
  announce(selectedTodo.text + " deleted");
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
