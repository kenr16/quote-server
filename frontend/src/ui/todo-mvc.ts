import { BaseHTMLElement, customElement, first, getChild, getChildren, html, OnEvent, onEvent, onHub } from 'dom-native';
//import { Todo, todoMco } from '../model/todo-mco';

@customElement("todo-mvc")
class TodoMvc extends BaseHTMLElement { // extends HTMLElement
  //#todoInputEl!: TodoInput;
  //#todoListEl!: HTMLElement;

  init() {
    let htmlContent: DocumentFragment = html`
      <div class="box"></div>
      <h1>todos</h1>
      <todo-input></todo-input>
      <todo-list></todo-list>    
    `;

    this.append(htmlContent);
  }
}

@customElement("todo-input")
class TodoInput extends BaseHTMLElement { // extends HTMLElement
  #inputEl!: HTMLInputElement;

  init() {
    let htmlContent = html`
      <input type="text" placeholder="What needs to be done?">
    `;
    this.#inputEl = getChild(htmlContent, 'input');

    this.append(htmlContent);

  }
}
// todo-input tag
declare global {
  interface HTMLElementTagNameMap {
    'todo-input': TodoInput;
  }
}