// *** Replaces todo.rs from same folder ***

use super::db::Db;
use crate::model;
use crate::security::UserCtx;
use serde::{Deserialize, Serialize};
use sqlb::{HasFields, Raw};

// region: Quote Types
#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct Quote {
    pub id: i64,
    pub cid: i64,  //creator id
    pub quote: String,
    pub author: String,
}

#[derive(sqlb::Fields, Default, Debug, Clone, Deserialize)]
pub struct QuotePatch {
    //pub cid: Option<i64>,
    pub quote: Option<String>,
    pub author: Option<String>,
}

// *** This may be completely unnecessary ***
#[derive(sqlx::Type, Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[sqlx(type_name = "quote_status_enum")]
#[sqlx(rename_all = "lowercase")]
pub enum QuoteStatus {
    Open,
    Close,
}
sqlb::bindable!(QuoteStatus);
// *** ***
// endregion: Quote Types


// region: QuoteModelAccessController
pub struct QuoteMac;

impl QuoteMac {
    const TABLE: &'static str = "quote";
    const COLUMNS: &'static [&'static str] = &["id", "cid", "quote", "author"];
}

impl QuoteMac {
    pub async fn create(db: &Db, utx: &UserCtx, data: QuotePatch) -> Result<Quote, model::Error2> {
        //let sql = "INSERT INTO quote (cid, title) VALUES ($1, $2) returning id, cid, quote, author";
        //let query = sqlx::query_as::<_, Quote>(&sql).bind(123 as i64).bind(data.title.unwrap_or_else(|| "untitled".to_string()));
        let mut fields = data.fields();
        fields.push(("cid", 123).into());
        let sb = sqlb::insert().table(Self::TABLE).data(fields).returning(Self::COLUMNS);

        // Execute the query
        //let quote = query.fetch_one(db).await?;
        let quote = sb.fetch_one(db).await?;

        Ok(quote)
    }

    pub async fn get(db: &Db, _utx: &UserCtx, id: i64) -> Result<Quote, model::Error2> {
        
        let sb = sqlb::select().table(Self::TABLE).columns(Self::COLUMNS).and_where_eq("id", id);

        let result = sb.fetch_one(db).await;

        handle_fetch_one_result(result, Self::TABLE, id)
        //let quote = sb.fetch_one(db).await.map_err(|sqlx_error| match sqlx_error {
        //    sqlx::Error::RowNotFound =>model::Error2::EntityNotFound(Self::TABLE, id.to_string()),
        //    other => model::Error2::SqlxError(other)
        //})?;

        //Ok(quote)
    }

    pub async fn update(db: &Db, utx: &UserCtx, id: i64, data: QuotePatch) -> Result<Quote, model::Error2> {
		let mut fields = data.fields();
		// augment the fields with the cid/ctime
		fields.push(("mid", utx.user_id).into()); //Why does this give a column not found error when pushing to the Database?
		fields.push(("ctime", Raw("now()")).into());

		let sb = sqlb::update()
			.table(Self::TABLE)
			.data(fields)
			.and_where_eq("id", id)
			.returning(Self::COLUMNS);

		let result = sb.fetch_one(db).await;

		handle_fetch_one_result(result, Self::TABLE, id)
	}

    pub async fn list(db: &Db, _utx: &UserCtx) -> Result<Vec<Quote>, model::Error2> {
        //let sql = "SELECT id, cid, title, status FROM quote ORDER BY id DESC";
        let sb = sqlb::select().table(Self::TABLE).columns(Self::COLUMNS).order_by("!id");

        // Build the sqlx-querey
        //let query = sqlx::query_as(&sql);
        // Execute the query
        //let quotess = query.fetch_all(db).await?;
        let quotes = sb.fetch_all(db).await?;

        Ok(quotes)
    }

    pub async fn delete(db: &Db, _utx: &UserCtx, id: i64) -> Result<Quote, model::Error2> {
		let sb = sqlb::delete()
			.table(Self::TABLE)
			.returning(Self::COLUMNS)
			.and_where_eq("id", id);

		let result = sb.fetch_one(db).await;

		handle_fetch_one_result(result, Self::TABLE, id)
	}

}
// endregion: QuoteModelAccessController

// region:    Utils
fn handle_fetch_one_result(
	result: Result<Quote, sqlx::Error>,
	typ: &'static str,
	id: i64,
) -> Result<Quote, model::Error2> {
	result.map_err(|sqlx_error| match sqlx_error {
		sqlx::Error::RowNotFound => model::Error2::EntityNotFound(typ, id.to_string()),
		other => model::Error2::SqlxError(other),
	})
}
// endregion: Utils

// region: Test
#[cfg(test)]
#[path = "../tests/model_quote.rs"]
mod tests;

// endregion: Test