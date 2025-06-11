/*
// Simplistic Model Layer
use thiserror::Error as ThisError;
use crate::ctx::Ctx;
//use crate::{Error, Result};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
//Aboe unnecessary
*/
mod db;
mod todo;

// re-export
pub use db::init_db;
pub use db::Db;
pub use todo::{Todo, TodoMac, TodoPatch, TodoStatus};

// region:    Error
#[derive(thiserror::Error, Debug)]
pub enum Error2 {
	#[error("Entity Not Found - {0}[{1}] ")]
	EntityNotFound(&'static str, String),

	#[error(transparent)]
	SqlxError(#[from] sqlx::Error),

	#[error(transparent)]
	IOError(#[from] std::io::Error),
}

// endregion: Error


//Unnecessary things after this?
/*
// region: --- Ticket Types
#[derive(Clone, Debug, Serialize)]
pub struct Ticket {
    pub id: u64,
    pub cid: u64, //creator user_id
    pub title: String,
}

#[derive(Deserialize)]
pub struct TicketForCreate {
    pub title: String,
}
// endregion: --- Ticket Types

// region: --- Model Controller
#[derive(Clone)]
pub struct ModelController {
    tickets_store: Arc<Mutex<Vec<Option<Ticket>>>>,
}

//Constructor
impl ModelController {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            tickets_store: Arc::default(),
        })
    }
}

//CRUD Implementation
impl ModelController {
    pub async fn create_ticket(&self, ctx: Ctx, ticket_fc: TicketForCreate) -> Result<Ticket> {

        let mut store = self.tickets_store.lock().unwrap();

        let id = store.len() as u64;
        let ticket = Ticket {
            id,
            cid: ctx.user_id(),
            title: ticket_fc.title,
        };
        store.push(Some(ticket.clone()));

        Ok(ticket)
    }

    pub async fn list_tickets(&self, _ctx: Ctx) -> Result<Vec<Ticket>> {
        let store = self.tickets_store.lock().unwrap();

        let tickets = store.iter().filter_map(|t| t.clone()).collect();

        Ok(tickets)
    }

    pub async fn delete_ticket(&self, _ctx: Ctx, id: u64) -> Result<Ticket> {
        let mut store = self.tickets_store.lock().unwrap();

        let ticket = store.get_mut(id as usize).and_then(|t| t.take());

        ticket.ok_or(Error::TicketDeleteFailIdNotFound { id })
    }
}

// endregion: --- Model Controller
*/