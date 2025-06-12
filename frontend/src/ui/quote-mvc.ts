// *** Replaces todo-mvc.ts ***
import { BaseHTMLElement, customElement, first, getChild, getChildren, html, OnEvent, onEvent, onHub } from 'dom-native';
import { Quote, quoteMco } from '../model/quote-mco';

@customElement("quote-mvc")
class QuoteMvc extends BaseHTMLElement { // extends HTMLElement
  #quoteInputEl!: QuoteInput;
  #quoteListEl!: HTMLElement;

  init() {
    let htmlContent: DocumentFragment = html`
      <div class="box"></div>
      <h1>quotes</h1>
      <quote-input></quote-input>
      <quote-list></quote-list>    
    `;
    [this.#quoteInputEl, this.#quoteListEl] =
      getChildren(htmlContent, 'quote-input', 'quote-list');

    this.append(htmlContent);
    this.refresh();
  }

  async refresh() {
    let quotes: Quote[] = await quoteMco.list();
    // This exists only for testing purposes
    // let quotes: quote[] = [
    //  { id: 1, quote: "mock1", author: "Unknown 1" },
    //  { id: 2, quote: "mock2", author: "Unknown 2" }
    //];
    let htmlContent = document.createDocumentFragment();
    for (const quote of quotes) {
      const el = document.createElement('quote-item');
      el.data = quote; // quote will be frozen
      htmlContent.append(el);
    }

    this.#quoteListEl.innerHTML = '';
    this.#quoteListEl.append(htmlContent);

  }

  /*// #region    --- UI Events
  @onEvent('pointerup', 'c-check')
  onCheckQuote(evt: PointerEvent & OnEvent) {
    const quoteItem = evt.selectTarget.closest("quote-item")!;
    const status = quoteItem.data.author == 'Open' ? 'Close' : 'Open';
    // update to server
    quoteMco.update(quoteItem.data.id, { author });
  }
  */// #endregion --- UI Events

  // #region    --- Data Events
  @onHub('dataHub', 'Quote', 'update')
  onQuoteUpdate(data: Quote) {
    // find the quote in the UI
    const quoteItem = first(`quote-item.Quote-${data.id}`) as QuoteItem | undefined;
    // if found, update it.
    if (quoteItem) {
      quoteItem.data = data; // data will be frozen
    }
  }

  @onHub('dataHub', 'Quote', 'create')
  onQuoteCreate(data: Quote) {
    this.refresh();
  }
  // #endregion --- Data Events
}

@customElement("quote-input")
class QuoteInput extends BaseHTMLElement { // extends HTMLElement
  #inputEl!: HTMLInputElement;

  init() {
    let htmlContent = html`
      <input type="text" placeholder="Enter your quote here">
      <input type="text" placeholder="Who said this?">
    `;
    this.#inputEl = getChild(htmlContent, 'input');

    this.append(htmlContent);

  }

  // #region    --- UI Events
  @onEvent('keyup', 'input')
  onInputKeyUp(evt: KeyboardEvent) {
    if (evt.key == "Enter") {
      // get value from UI
      const quote = this.#inputEl.value;
      // send create to server
      quoteMco.create({ quote });
      // don't wait, reset value input
      this.#inputEl.value = '';
    }
  }
  // #endregion --- UI Events
}
// quote-input tag
declare global {
  interface HTMLElementTagNameMap {
    'quote-input': QuoteInput;
  }
}

@customElement('quote-item')
export class QuoteItem extends BaseHTMLElement { // extends HTMLElement
  #titleEl!: HTMLElement;
  #data!: Quote;

  set data(data: Quote) {
    let oldData = this.#data;
    this.#data = Object.freeze(data);
    if (this.isConnected) {
      this.refresh(oldData);
    }
  }

  get data() { return this.#data }

  init() {
    let htmlContent = html`
            <c-check><c-ico name="ico-done"></c-ico></c-check>
            <div class="title">STATIC TITLE</div>
            <c-ico name="del"></c-ico>        
    `;
    this.#titleEl = getChild(htmlContent, 'div');

    this.append(htmlContent);
    this.refresh();
  }

  refresh(old?: Quote) {
    if (old != null) {
      this.classList.remove(`Quote-${old.id}`);
      this.classList.remove(old.author);
    }

    // render new data
    const quote = this.#data;
    this.classList.add(`Quote-${quote.id}`);
    this.classList.add(quote.author);
    this.#titleEl.textContent = quote.quote;
  }
}
// quote-item type augmentation
declare global {
  interface HTMLElementTagNameMap {
    'quote-item': QuoteItem;
  }
}