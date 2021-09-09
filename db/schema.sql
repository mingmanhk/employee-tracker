DROP DATABASE IF EXISTS employee;
CREATE DATABASE employee;

USE employee;

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  manager_id INT,
  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
  ON DELETE SET NULL
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30),
  salary decimal,
  department_id INT
);

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30)
);

ALTER TABLE role
ADD CONSTRAINT department_id
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE SET NULL;

ALTER TABLE employee
ADD CONSTRAINT role
  FOREIGN KEY (role_id)
  REFERENCES role(id)
  ON DELETE SET NULL;
