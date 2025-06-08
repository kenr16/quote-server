# quote-server
Ken Rutan - CS410P - Quote Server.

A very basic quote web server written in Rust.

## DB

'''sh
# Start the database
docker run --rm -p 5432:5432 -e "POSTGRES_PASSWORD=postgres" --name pg postgres:14

# Optional psql (other terminal)
docker exec -it -u postgers pg psql
'''

Things I have learned:
Rust will look in two places for a module listed as "mod model":
error[E0761]: file for module `model` found at both "src/model.rs" and "src/model/mod.rs"
If it finds both files at once, it will error out.

"launchctl" is the Mac equvalent command to Linux's "systemctl"