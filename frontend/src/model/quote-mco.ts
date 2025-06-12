// *** Replaces todo-mco.ts ***
import { hub } from 'dom-native';
import { webDelete, webGet, webPatch, webPost } from '../webc.js';
export interface Quote {
  id: number;
  quote: string;
  author: string;
}

export type QuotePatch = Partial<Omit<Quote, 'id'>>;

class QuoteMco {

  async list(): Promise<Quote[]> {
    const data = await webGet("quotes");
    return data as Quote[];
  }

  async create(data: QuotePatch): Promise<Quote> {
    // guard (QUOTE - validate data)
    if (data.quote == null || data.quote.trim().length == 0) {
      throw new Error("Cannot create Quote with empty title");
    }
    // to server
    const newData = await webPost('quotes', data);
    // sending event
    hub('dataHub').pub('Quote', 'create', newData);

    return newData as Quote;
  }

  async update(id: number, data: QuotePatch): Promise<Quote> {
    // TODO - validate data
    // to server
    const newData = await webPatch(`quotes/${id}`, data);
    // event
    hub('dataHub').pub('Quote', 'update', newData);

    return newData as Quote;
  }

  async delete(id: number): Promise<Quote> {
    // to server
    const oldData = await webDelete(`quotes/${id}`);
    // event
    hub('dataHub').pub('Quote', 'delete', oldData);

    return oldData as Quote;
  }
}

export const quoteMco = new QuoteMco();