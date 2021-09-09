// Require Dependencies
const inquirer = require('inquirer');
const chalk = require('chalk'); //add console show color
const cTable = require('console.table'); // show database data in table view
const connection = require('./config/connection');
const figlet = require('figlet'); //draw figlet fonts

//SQL query statement
const sqlviewemployee =`select a.id, a.first_name, a.last_name, b.title, c.name as department, b.salary,(select CONCAT(first_name, " " , last_name) from employee d where d.id=a.manager_id) as manager from employee a left join role b on a.role_id=b.id left join department c on b.department_id=c.id;`;
const sqlviewdepartment = `select * from department;`
const sqlviewrole = `select a.id, a.title, b.name as department, a.salary from role a left join department b on a.department_id=b.id;`;

// Array of questions to ask the user
const mainchoice = async () => {
  await inquirer
     .prompt(
       [{
       type: "list",
       message: "What would you like to do?",
       name: "choice",
       choices: [
         "View All Employees",
         "Add Employee",
         "Update Employee Role",
         "View All Roles",
         "Add Role",
         "View All Departments",
         "Add Department",
         "Quit"
         ]
       }]
     )
     .then(data => { 
        switch (data.choice) {
          case "View All Employees":
            viewallemployees();
            break;
          case "Add Employee":
            addemployee();
            break;
          case "Update Employee Role":
            updateemployeerole();
            break;
          case "View All Roles":
            viewallroles();
            break;
          case "Add Role":
            addrole();
            break;
          case "View All Departments":
            viewalldepartments();
            break;
          case "Add Department":
            adddepartment();
            break;
          case 'Quit':
                connection.end();
                break;
        }
    })
}

//Get SQL Data
function getdata(sql, callback) {
  return new Promise((resolve, reject) => {
    connection.query(sql, function(err, results) {
      if (err) return reject(err);
      resolve(results);
    }
    )
  })
};

//Insert SQL Data
function insertdata(sql, parameter) {
   connection.query(sql, parameter, (err, results) => {
     if (err) throw err;
     console.table(chalk.green(`\nAdd successfully\n`));
  })
};

//Display data
function displaydata(title, data) {
  console.table(chalk.green(`\n${title}\n`), data);
};

//View All Employees
function viewallemployees() {
  getdata(sqlviewemployee)
    .then(results => {
      displaydata("View All Employees", results);
      mainchoice();
    })}

//View All Departments
function viewalldepartments() {
  getdata(sqlviewdepartment)
    .then(results => {
      displaydata("View All Departments", results);
      mainchoice();
    }
    )
}

//View All Roles
function viewallroles() {
    getdata(sqlviewrole)
      .then(results => {
        displaydata("View All Roles", results);
        mainchoice();
      })
}

//Add Employee
function addemployee() {
  getdata(`select CONCAT(first_name, " " , last_name) as manager from employee; select title from role;`)
    .then(results => {
        inquirer.prompt([
            {
                name: 'newFirstname',
                type: 'input',
                message: "What is the employee's first name?"
            },
            {
                name: 'newLastname',
                type: 'input',
                message: "What is the employee's last name?"
            },
            {
                name: 'role',
                type: 'list',
                choices: results[1].map(choice => choice.title),
                message: "What is the employee's role?"

            },
            {
                name: 'manager',
                type: 'list',
                choices: results[0].map(choice => choice.manager),
                message: "What is the employee's manager?"

            }
        ])
        .then((answer) => {
          insertdata(`INSERT INTO employee(first_name, last_name, role_id, manager_id) Select ?, ?, (SELECT id FROM role WHERE title = ? ) as role_id, (SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ? ) as manager_id`, [answer.newFirstname, answer.newLastname, answer.role, answer.manager])
          viewallemployees();
        }) }
  )
}

//Update Employee Role
function updateemployeerole() {
  let employeeid;
  getdata(`select CONCAT(first_name, " " , last_name) as fullname from employee; select title from role;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'fullname',
          type: 'list',
          choices: results[0].map(choice => choice.fullname),
          message: "Which employee's role do you want to update??"
        },
        {
          name: 'newRole',
          type: 'list',
          choices: results[1].map(choice => choice.title),
          message: "Which role do you want to assign the selected employee"
         }
      ])
        .then((answer) => {
          getdata(`update employee set role_id = (select id from role where title="${answer.newRole}") where CONCAT(first_name, " " , last_name) = "${answer.fullname}"`)
          viewallemployees();
      })
    })
}

//Add Role
function addrole() {
    getdata(`select name from department;`)
      .then(results => {
    inquirer.prompt([
             {
                name: 'newTitle',
                type: 'input',
                message: 'What is the name of the role?'
            },
            {
                name: 'newSalary',
                type: 'input',
                message: 'What is the salary of the role?'
            },
            {
                name: 'dept',
                type: 'list',
                choices: results.map(choice => choice.name),
                message: 'Which department does the role belong to?'
            }
   ]).then((answer) => {
          insertdata(`INSERT INTO role(title, salary, department_id) VALUES ("${answer.newTitle}", "${answer.newSalary}", (SELECT id FROM department WHERE name = "${answer.dept}"));`,"")
          viewallroles();
   })
  })
}

//Add Department
function adddepartment() {
   inquirer.prompt([
            {
                name: 'newDept',
                type: 'input',
                message: 'What is the name of the department?'
            }
   ]).then((answer) => {
          insertdata(`INSERT INTO department(name) VALUES( ? )`, answer.newDept)
          viewalldepartments();
        })
}

//Draw console graph
function draw(){
  console.log(chalk.yellow("|=============================================================|"));
  console.log(chalk.green(figlet.textSync('Employee Manager', {
    font: 'Standard',
    horizontalLayout: 'full',
    verticalLayout: 'full',
    width: 100,
    whitespaceBreak: true
  })));
  console.log(chalk.green("|                                        Created by Victor Lam|"));
  console.log(chalk.yellow("|=============================================================|"));
}

//Start
draw();
mainchoice();