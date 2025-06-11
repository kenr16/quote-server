-- Todo status enum
CREATE TYPE todo_status_enum AS ENUM (
    'open',
    'close'
);

-- Todo
CREATE TABLE todo (
    id bigserial,
    cid bigint NOT NULL, -- creator user id
    ctime timestamp with time zone DEFAULT now(),
    mid bigint, --modified user id
    mtime timestamp with time zone,
    title text NOT NULL,
    status todo_status_enum NOT NULL DEFAULT 'open'
);
ALTER Sequence todo_id_seq RESTART WITH 1000;