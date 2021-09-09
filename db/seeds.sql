USE EMPLOYEE;

INSERT INTO department (name)
VALUES ("Sales"),
("Engineering"),
("Finance"),
("Legal");
select * from department;

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", "100000", "1"),
("Salesperson", "80000", "1"),
("Lead Enginner", "150000", "2"),
("Software Engineer", "120000", "2"),
("Account Manager", "160000", "3"),
("Accountant", "125000", "3"),
("Legal Team Lead", "250000", "4"),
("Lawyer", "190000", "4");
select * from role;
select a.id, a.title, b.name as department, a.salary from role a left join department b on a.department_id=b.id;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", "1", NULL),
("Mike", "Chan", "2", "1"),
("Ashley", "Rodriguez", "3", NULL),
("Kevin", "Tupik", "4", "3"),
("Kunal", "Singh", "5", NULL),
("Malia", "Brown", "6", "5"),
("Sarah", "Lourd", "7", NULL),
("Tom", "Allen", "8", "7");
select * from employee;

select a.id, a.first_name, a.last_name, b.title, c.name as department, b.salary, 
(select CONCAT(first_name, " " , last_name) from employee d where d.id=a.manager_id) as manager 
from employee a 
left join role b on a.role_id=b.id
left join department c on b.department_id=c.id;

