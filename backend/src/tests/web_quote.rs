// *** Replaces web_todo.rs from the same directory ***

use super::quote_rest_filters;
use crate::model::{init_db, Quote, QuoteMac};
use crate::security::utx_from_token;
use crate::web::handle_rejection;
use anyhow::{Context, Result};
use serde::Deserialize;
use serde_json::{from_str, from_value, json, Value};
use std::str::from_utf8;
use std::sync::Arc;
use warp::hyper::body::Bytes;
use warp::hyper::Response;
use warp::Filter;

#[tokio::test]
async fn web_quote_list() -> Result<()> {
	// FIXTURE
	let db = init_db().await?;
	let db = Arc::new(db);
	let quote_apis = quote_rest_filters("api", db.clone()).recover(handle_rejection);

	// ACTION
	let resp = warp::test::request()
		.method("GET")
		.header("X-Auth-Token", "123")
		.path("/api/quotes")
		.reply(&quote_apis)
		.await;

	// CHECK
	assert_eq!(200, resp.status(), "http status");

	// extract response .data
	let quotes: Vec<Quote> = extract_body_data(resp)?;

	// CHECK - quotes
	assert_eq!(2, quotes.len(), "number of quotes");
	assert_eq!(101, quotes[0].id);
	assert_eq!("test quote 101", quotes[0].quote);
	assert_eq!("unknown", quotes[0].author);

	Ok(())
}

#[tokio::test]
async fn web_quote_get_ok() -> Result<()> {
	// FIXTURE
	let db = init_db().await?;
	let db = Arc::new(db);
	let quote_apis = quote_rest_filters("api", db).recover(handle_rejection);

	// ACTION
	let resp = warp::test::request()
		.method("GET")
		.header("X-Auth-Token", "123")
		.path("/api/quotes/100")
		.reply(&quote_apis)
		.await;

	// CHECK - status
	assert_eq!(200, resp.status(), "http status");

	// extract response .data
	let quote: Quote = extract_body_data(resp)?;

	// CHECK - .data (quote)
	assert_eq!(100, quote.id);
	assert_eq!("test quote 100", quote.quote);
	assert_eq!("test author", quote.author);

	Ok(())
}

#[tokio::test]
async fn web_quote_create_ok() -> Result<()> {
	// FIXTURE
	let db = init_db().await?;
	let db = Arc::new(db);
	let quote_apis = quote_rest_filters("api", db.clone()).recover(handle_rejection);
	// new quote fixture
	const QUOTE: &str = "test - web_quote_create_ok";
	let body = json!({
		"quote": QUOTE,
	});

	// ACTION
	let resp = warp::test::request()
		.method("POST")
		.header("X-Auth-Token", "123")
		.path("/api/quotes")
		.json(&body)
		.reply(&quote_apis)
		.await;

	// CHECK - status
	assert_eq!(200, resp.status(), "http status");

	// extract response .data
	let quote: Quote = extract_body_data(resp)?;

	// CHECK - .data (quote)
	assert!(quote.id >= 1000, "quote.id should be >= to 1000");
	assert_eq!(QUOTE, quote.quote);
	assert_eq!("unknown", quote.author);

	Ok(())
}

#[tokio::test]
async fn web_quote_update_ok() -> Result<()> {
	// FIXTURE
	let db = init_db().await?;
	let db = Arc::new(db);
	let quote_apis = quote_rest_filters("api", db.clone()).recover(handle_rejection);
	// udpated quote
	const QUOTE: &str = "test - quote 100 updated";
	let body = json!({
		"quote": QUOTE,
		"author": "test - author updated"
	});

	// ACTION
	let resp = warp::test::request()
		.method("PATCH")
		.header("X-Auth-Token", "123")
		.path("/api/quotes/100")
		.json(&body)
		.reply(&quote_apis)
		.await;

	// CHECK - status
	assert_eq!(200, resp.status(), "http status");

	// extract response .data
	let quote: Quote = extract_body_data(resp)?;

	// CHECK - .data (quote)
	assert_eq!(100, quote.id, "quote.id");
	assert_eq!(QUOTE, quote.quote);
	assert_eq!("test - author updated", quote.author);

	Ok(())
}

#[tokio::test]
async fn web_quote_delete_ok() -> Result<()> {
	// FIXTURE
	let db = init_db().await?;
	let db = Arc::new(db);
	let quote_apis = quote_rest_filters("api", db.clone()).recover(handle_rejection);

	// ACTION
	let resp = warp::test::request()
		.method("DELETE")
		.header("X-Auth-Token", "123")
		.path("/api/quotes/100")
		.reply(&quote_apis)
		.await;

	// CHECK - status
	assert_eq!(200, resp.status(), "http status");

	// extract response .data
	let quote: Quote = extract_body_data(resp)?;

	// CHECK - .data (quotes)
	assert_eq!(100, quote.id);
	assert_eq!("test quote 100", quote.quote);
	assert_eq!("test author", quote.author);

	// CHECK - list .len() should be 1
	let utx = utx_from_token(&db, "123").await?;
	let quotes = QuoteMac::list(&db, &utx).await?;
	assert_eq!(1, quotes.len(), "quotes length");
	assert_eq!(101, quotes[0].id, "quote remaining should be 101");

	Ok(())
}

// region:    Web Test Utils
fn extract_body_data<D>(resp: Response<Bytes>) -> Result<D>
where
	for<'de> D: Deserialize<'de>,
{
	// parse the body as serde_json::Value
	let body = from_utf8(resp.body())?;
	let mut body: Value =
		from_str(body).with_context(|| format!("Cannot parse resp.body to JSON. resp.body: '{}'", body))?;

	// extract the data
	let data = body["data"].take();

	// deserialize the data to D
	let data: D = from_value(data)?;

	Ok(data)
}
// endregion: Web Test Utils