// *** Replaces model_todo.rs from same folder***

use super::{Quote, QuoteMac};
use crate::model;
use crate::model::db::init_db;
use crate::model::quote::{QuotePatch};
use crate::security::utx_from_token;

#[tokio::test]
async fn model_quote_create() -> Result<(), Box<dyn std::error::Error>> {
	//FIXTURE
	let db = init_db().await?;
	let utx = utx_from_token(&db, "123").await?;
	let data_fx = QuotePatch {
		quote: Some("test - model_quote_create 1".to_string()),
		..Default::default()
	};

	//ACTION
	let quote_created = QuoteMac::create(&db, &utx, data_fx.clone()).await?;

	//CHECK
	assert!(quote_created.id >= 1000, "Id should be >= 1000");
	assert_eq!(data_fx.quote.unwrap(), quote_created.quote);
	assert_eq!("unknown", quote_created.author);

	Ok(())
}

#[tokio::test]
async fn model_quote_get_ok() -> Result<(), Box<dyn std::error::Error>> {
	//FIXTURE
	let db = init_db().await?;
	let utx = utx_from_token(&db, "123").await?;

	//ACTION
	let quote = QuoteMac::get(&db, &utx, 100).await?;

	//CHECK
	assert_eq!(100, quote.id);
	assert_eq!("test quote 100", quote.quote);
	assert_eq!("test author", quote.author);

	Ok(())
}

#[tokio::test]
async fn model_quote_get_wong_id() -> Result<(), Box<dyn std::error::Error>> {
	//FIXTURE
	let db = init_db().await?;
	let utx = utx_from_token(&db, "123").await?;

	//ACTION
	let result = QuoteMac::get(&db, &utx, 999).await;

	//CHECK
	match result {
		Ok(_) => assert!(false, "Should not succeed"),
		Err(model::Error2::EntityNotFound(typ, id)) => {
			assert_eq!("quote", typ);
			assert_eq!(999.to_string(), id);
		}
		other_error => assert!(false, "Wrong Error {:?} ", other_error),
	}

	Ok(())
}

#[tokio::test]
async fn model_quote_update_ok() -> Result<(), Box<dyn std::error::Error>> {
	//FIXTURE
	let db = init_db().await?;
	let utx = utx_from_token(&db, "123").await?;
	let data_fx = QuotePatch {
		quote: Some("test - model_quote_update_ok 1".to_string()),
		..Default::default()
	};
	let quote_fx = QuoteMac::create(&db, &utx, data_fx.clone()).await?;
	let update_data_fx = QuotePatch {
		quote: Some("test - model_quote_update_ok 2".to_string()),
		..Default::default()
	};

	//ACTION
	let quote_updated = QuoteMac::update(&db, &utx, quote_fx.id, update_data_fx.clone()).await?;

	//CHECK
	let quotes = QuoteMac::list(&db, &utx).await?;
	assert_eq!(3, quotes.len());
	assert_eq!(quote_fx.id, quote_updated.id);
	assert_eq!(update_data_fx.quote.unwrap(), quote_updated.quote);

	Ok(())
}

#[tokio::test]
async fn model_quote_list() -> Result<(), Box<dyn std::error::Error>> {
	//FIXTURE
	let db = init_db().await?;
	let utx = utx_from_token(&db, "123").await?;

	//ACTION
	let quotes = QuoteMac::list(&db, &utx).await?;

	//CHECK
	assert_eq!(2, quotes.len());
	// quote 101
	assert_eq!(101, quotes[0].id);
	assert_eq!(123, quotes[0].cid);
	assert_eq!("test quote 101", quotes[0].quote);
	// quote 100
	assert_eq!(100, quotes[1].id);
	assert_eq!(123, quotes[1].cid);
	assert_eq!("test quote 100", quotes[1].quote);

	Ok(())
}

#[tokio::test]
async fn model_quote_delete_simple() -> Result<(), Box<dyn std::error::Error>> {
	//FIXTURE
	let db = init_db().await?;
	let utx = utx_from_token(&db, "123").await?;

	//ACTION
	let quote = QuoteMac::delete(&db, &utx, 100).await?;

	//CHECK - deleted item
	assert_eq!(100, quote.id);
	assert_eq!("test quote 100", quote.quote);

	//CHECK - list
	let quotes: Vec<Quote> = sqlb::select().table("quote").fetch_all(&db).await?;
	assert_eq!(1, quotes.len());

	Ok(())
}