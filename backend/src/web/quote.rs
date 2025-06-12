// *** Replaces todo.rs from the same folder ***
use super::filter_auth::do_auth;
use crate::model::{Db, QuoteMac, QuotePatch};
use crate::security::{utx_from_token, UserCtx};
use std::convert::Infallible;
use serde::Serialize;
use serde_json::json;
use std::sync::Arc;
use warp::reply::Json;
use warp::{Filter, Rejection};

pub fn quote_rest_filters(base_path: &'static str, db: Arc<Db>,) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
	let quotes_path = warp::path(base_path).and(warp::path("quotes"));
	let common = super::filter_utils::with_db(db.clone()).and(do_auth(db.clone()));

	// LIST quotes `GET quotes/`
	let list = quotes_path
		.and(warp::get())
		.and(warp::path::end())
		.and(common.clone())
		.and_then(quote_list);

	// Get quote 'GET /quote/100'
	let get = quotes_path
		.and(warp::get())
		.and(common.clone())
		.and(warp::path::param())
		.and_then(quote_get);

	// CREATE quote `POST /quotes with body QuotePatch`
	let create = quotes_path
		.and(warp::post())
		.and(common.clone())
		.and(warp::body::json())
		.and_then(quote_create);

	// UPDATE quote `PATCH /quotes/100 with body QuotePatch`
	let update = quotes_path
		.and(warp::patch())
		.and(common.clone())
		.and(warp::path::param())
		.and(warp::body::json())
		.and_then(quote_update);

	// DELETE quote `DELETE /quotes/100`
	let delete = quotes_path
		.and(warp::delete())
		.and(common.clone())
		.and(warp::path::param())
		.and_then(quote_delete);

	list.or(get).or(create).or(update).or(delete)
}

async fn quote_list(db: Arc<Db>, utx: UserCtx) -> Result<Json, warp::Rejection> {
	let quotes = QuoteMac::list(&db, &utx).await?;
	json_response(quotes)
}

async fn quote_get(db: Arc<Db>, utx: UserCtx, id: i64) -> Result<Json, warp::Rejection> {
	let quote = QuoteMac::get(&db, &utx, id).await?;
	json_response(quote)
}

async fn quote_create(db: Arc<Db>, utx: UserCtx, patch: QuotePatch) -> Result<Json, warp::Rejection> {
	let quote = QuoteMac::create(&db, &utx, patch).await?;
	json_response(quote)
}

async fn quote_update(db: Arc<Db>, utx: UserCtx, id: i64, patch: QuotePatch) -> Result<Json, warp::Rejection> {
	let quote = QuoteMac::update(&db, &utx, id, patch).await?;
	json_response(quote)
}

async fn quote_delete(db: Arc<Db>, utx: UserCtx, id: i64) -> Result<Json, warp::Rejection> {
	let quote = QuoteMac::delete(&db, &utx, id).await?;
	json_response(quote)
}

// region:    Utils
fn json_response<D: Serialize>(data: D) -> Result<Json, warp::Rejection> {
	let response = json!({ "data": data });
	Ok(warp::reply::json(&response))
}
// endregion: Utils

// region: Test
#[cfg(test)]
#[path = "../tests/web_quote.rs"]
mod tests;