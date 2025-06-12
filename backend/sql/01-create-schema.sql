-- Quote
CREATE TABLE quote (
    id bigserial,
    cid bigint NOT NULL, -- creator user id
    ctime timestamp with time zone DEFAULT now(),
    mid bigint, --modified user id
    mtime timestamp with time zone,
    quote text NOT NULL,
    author text NOT NULL DEFAULT 'unknown'
);
ALTER Sequence quote_id_seq RESTART WITH 1000;
