// quote-mvc.ts
import {
  BaseHTMLElement,
  customElement,
  first,
  getChildren,
  html,
  OnEvent,
  onEvent,
  onHub
} from 'dom-native';
import { Quote, quoteMco } from '../model/quote-mco';

/* ------------------- quote-mvc ------------------- */
@customElement("quote-mvc")
class QuoteMvc extends BaseHTMLElement {
  #quoteInputEl!: QuoteInput;
  #quoteListEl!: HTMLElement;

  init() {
    const htmlContent = html`
      <div class="box"></div>
      <h1>quotes</h1>
      <quote-input></quote-input>
      <quote-list></quote-list>
    `;

    [this.#quoteInputEl, this.#quoteListEl] = getChildren(htmlContent, 'quote-input', 'quote-list');
    this.append(htmlContent);
    this.refresh();
  }

  async refresh() {
    try {
      const quotes: Quote[] = await quoteMco.list();

      const htmlContent = document.createDocumentFragment();
      for (const quote of quotes) {
        const el = document.createElement('quote-item') as QuoteItem;
        el.data = quote;
        htmlContent.append(el);
      }

      this.#quoteListEl.innerHTML = '';
      this.#quoteListEl.append(htmlContent);
    } catch (err) {
      console.error('Failed to load quotes:', err);
    }
  }

  // #region --- UI Events
  @onEvent('pointerup', 'c-check')
  async onCheckQuote(evt: PointerEvent & OnEvent) {
    const quoteItem = evt.selectTarget.closest("quote-item") as QuoteItem;
    try {
      await quoteMco.delete(quoteItem.data.id);
      this.refresh();
    } catch (err) {
      console.error('Failed to delete quote:', err);
    }
  }
  // #endregion

  // #region --- Data Events
  @onHub('dataHub', 'Quote', 'update')
  onQuoteUpdate(data: Quote) {
    const quoteItem = first(`quote-item.Quote-${data.id}`) as QuoteItem | undefined;
    if (quoteItem) {
      quoteItem.data = data;
    }
  }

  @onHub('dataHub', 'Quote', 'create')
  onQuoteCreate(data: Quote) {
    this.refresh();
  }
  // #endregion
}

/* ------------------- quote-input ------------------- */
@customElement("quote-input")
class QuoteInput extends BaseHTMLElement {
  #quoteInput!: HTMLInputElement;
  #authorInput!: HTMLInputElement;

  init() {
    this.append(html`
      <input type="text" placeholder="Enter your quote here">
      <input type="text" placeholder="Who said this?">
    `);

    const inputs = this.querySelectorAll('input');
    this.#quoteInput = inputs[0];
    this.#authorInput = inputs[1];
  }

  @onEvent('keyup', 'input')
  async onInputKeyUp(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      const quote = this.#quoteInput.value.trim();
      const author = this.#authorInput.value.trim();

      if (quote) {
        try {
          await quoteMco.create({ quote, author });
          this.#quoteInput.value = '';
          this.#authorInput.value = '';
        } catch (err) {
          console.error('Failed to create quote:', err);
        }
      }
    }
  }
}

// type augmentation
declare global {
  interface HTMLElementTagNameMap {
    'quote-input': QuoteInput;
  }
}

/* ------------------- quote-item ------------------- */
@customElement('quote-item')
export class QuoteItem extends BaseHTMLElement {
  #quoteEl!: HTMLElement;
  #authorEl!: HTMLElement;
  #data!: Quote;

  set data(data: Quote) {
    const oldData = this.#data;
    this.#data = Object.freeze(data);
    if (this.isConnected) this.refresh(oldData);
  }

  get data() {
    return this.#data;
  }

  init() {
    const htmlContent = html`
      <c-check><c-ico name="ico-done"></c-ico></c-check>
      <div class="quote-text">STATIC QUOTE</div>
      <div class="quote-author">STATIC AUTHOR</div>
      <c-ico name="del"></c-ico>
    `;

    const [quoteEl, authorEl] = getChildren(htmlContent, 'div', 'div');
    this.#quoteEl = quoteEl;
    this.#authorEl = authorEl;

    this.append(htmlContent);
    this.refresh();
  }

  refresh(old?: Quote) {
    if (old) {
      this.classList.remove(`Quote-${old.id}`);
      this.classList.remove(this.#safeClass(old.quote));
      this.classList.remove(this.#safeClass(old.author));
    }

    const quote = this.#data;
    this.classList.add(`Quote-${quote.id}`);
    this.classList.add(this.#safeClass(quote.quote));
    this.classList.add(this.#safeClass(quote.author));

    this.#quoteEl.textContent = `"${quote.quote}"`;
    this.#authorEl.textContent = `— ${quote.author || "Unknown"}`;
  }

  // sanitize strings for use in class names
  #safeClass(str: string): string {
    return str.replace(/[^\w-]/g, "_");
  }
}

// type augmentation
declare global {
  interface HTMLElementTagNameMap {
    'quote-item': QuoteItem;
  }
}