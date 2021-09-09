--View Table --
select * from employee;
select * from role;
select * from department;

--View All Employees
select a.id, a.first_name, a.last_name, b.title, c.name as department, b.salary,
(select CONCAT(first_name, " " , last_name) from employee d where d.id=a.manager_id) as manager 
from employee a left join role b on a.role_id=b.id left join department c on b.department_id=c.id;
  
--Add Employee
INSERT INTO employee(first_name, last_name, role_id, manager_id)  
Select "Test", "Test", (SELECT id FROM role WHERE title = "Software Engineer" ) as role_id,  (SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = "Mike Chan" ) as manager_id

--Update Employee Role
update employee set role_id = (select id from role where title="Test") 
where CONCAT(first_name, " " , last_name) = "Test"

--View All Roles
select a.id, a.title, b.name as department, a.salary from role a left join department b on a.department_id=b.id;

--Add Role
INSERT INTO role(title, salary, department_id) VALUES 
("Test", "100000", (SELECT id FROM department WHERE name = "2"))

--View All Departments
select * from department;

--Add Department
INSERT INTO department(name) VALUES
("IT")

-- Update manager id
update employee set manager_id = (select * from (select id from employee where CONCAT(first_name, " " , last_name)="John Doe") a) where CONCAT(first_name, " " , last_name) = "Mike Chan"

-- View Employee by manager
select a.id, a.first_name, a.last_name, b.title, c.name as department, b.salary,(select CONCAT(first_name, " " , last_name) from employee d where d.id=a.manager_id) as manager from employee a left join role b on a.role_id=b.id left join department c on b.department_id=c.id 
where a.manager_id =(select id from employee where CONCAT(first_name, " " , last_name) = "Ashley Rodriguez")

-- View Employee by department
select a.id, a.first_name, a.last_name, b.title, c.name as department, b.salary,(select CONCAT(first_name, " " , last_name) from employee d where d.id=a.manager_id) as manager from employee a left join role b on a.role_id=b.id left join department c on b.department_id=c.id 
where c.name = "Sales"