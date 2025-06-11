# quote-server
Ken Rutan - CS410P - Quote Server.

A very basic quote web server written in Rust.

## DB
*The database here uses postgres and assumes that there is a user called 'postgres' with password 'postgres' and superuser priviledges.
'''sh
# Start the database
docker run --rm -p 5432:5432 -e "POSTGRES_PASSWORD=postgres" --name pg postgres:14

# Optional psql (other terminal)
docker exec -it -u postgers pg psql
'''

## Dev Test
'''sh
# Test for the model:
cargo watch -q -c -w src/ -x 'test model_ -- --test-threads=1 --nocapture'

# Test for the web component:
cargo watch -q -c -w src/ -x 'test web_ -- --test-threads=1 --nocapture'

# Test only the database:
cargo watch -q -c -w src/ -x 'test model_db_ -- --test-threads=1 --nocapture'
'''

## DB

'''sh
# Start the database
docker run --rm -p 5432:5432 -e "POSTGRES_PASSWORD=postgres" --name pg postgres:14

# Optional psql (other terminal)
docker exec -it -u postgers pg psql
'''

## Dev Web

'''sh
cd backend
cargo watch -q -c -w src/ -x 'run -- ../frontend/web-folder'
'''

## DB

'''sh
# Start the database
docker run --rm -p 5432:5432 -e "POSTGRES_PASSWORD=postgres" --name pg postgres:14

# Optional psql (other terminal)
docker exec -it -u postgers pg psql
'''

# Things I have learned:
It is necessary to run a database in one terminal window, while running the server in another, and helpful to have a thrid window open to run testing on saves.

Rust will look in two places for a module listed as "mod model":
error[E0761]: file for module `model` found at both "src/model.rs" and "src/model/mod.rs"
If it finds both files at once, it will error out.

"launchctl" is the Mac equvalent command to Linux's "systemctl"

new users can be created in psql using the following:
$ psql [database name]
template1=# CREATE USER [username] WITH PASSWORD '[password]';
template1=# GRANT ALL PRIVILEGES ON DATABASE "[database name]" to [username];
template1=# \q

existing users can be eleveated to superuser in psql with the following:
template1=# ALTER USER [username] WITH SUPERUSER;

