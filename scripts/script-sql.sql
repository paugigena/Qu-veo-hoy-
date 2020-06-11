create database peliculasdb;
use peliculasdb;
create table pelicula (
					id int not null auto_increment primary key,
                    titulo varchar(100),
                    duracion int,
                    director varchar(400),
                    anio int,
                    fecha_lanzamiento date,					
					puntuacion int,
                    poster varchar(300),
                    trama varchar(700)
                    
);

create table genero (
					id int not null auto_increment primary key,
                    nombre varchar(30)
                    );
ALTER TABLE pelicula ADD COLUMN genero_id int, ADD CONSTRAINT fk_genero FOREIGN KEY (genero_id)
 REFERENCES genero(id);
create table actor(
	    id int not null auto_increment,
        nombre varchar(70),
		PRIMARY KEY(id)
);
create table actor_pelicula (
	id int not null auto_increment,
	actor_id int not null,
    pelicula_id int not null,
    primary key(id),
    foreign key (actor_id) references actor(id),
    foreign key (pelicula_id) references pelicula(id)
 );

