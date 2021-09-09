// Require Dependencies
const inquirer = require('inquirer');
const chalk = require('chalk'); //add console show color
const cTable = require('console.table'); // show database data in table view
const connection = require('./config/connection');
const figlet = require('figlet'); //draw figlet fonts

//SQL query statement
const sqlviewemployee =`select a.id, a.first_name, a.last_name, b.title, c.name as department, b.salary,(select CONCAT(first_name, " " , last_name) from employee d where d.id=a.manager_id) as manager from employee a left join role b on a.role_id=b.id left join department c on b.department_id=c.id`;
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
         "Update Employee Manager",
         "View Employee by Manager",
         "View Employee by Department",
         "View Budget by Department",
         "Delete Employee",
         "Delete Role",
         "Delete Department",
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
          case "View Employee by Manager":
            viewemployeebymanager();
            break;
          case "View Employee by Department":
            viewemployeebydepartment();
            break;
          case "Update Employee Manager":
            updateemployeemanager();
            break;
          case "View Budget by Department":
            viewbudgetbydepartment();
            break;
          case "Delete Employee":
            deleteemployee();
            break;
          case "Delete Role":
            deleterole();
            break;
          case "Delete Department":
            deletedepartment();
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

//Delete SQL Data
function deletedata(sql, parameter) {
   connection.query(sql, parameter, (err, results) => {
     if (err) throw err;
     console.table(chalk.yellow(`\nDelete successfully\n`));
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

//Update Employee Manager
function updateemployeemanager() {
  getdata(`select CONCAT(first_name, " " , last_name) as fullname from employee;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'fullname',
          type: 'list',
          choices: results.map(choice => choice.fullname),
          message: "Which employee's manager do you want to update??"
        },
        {
          name: 'newManager',
          type: 'list',
          choices: results.map(choice => choice.fullname),
          message: "Who will be new manager?",
          }
      ])
    .then((answers) => {
      if (answers.fullname === answers.newManager) console.log(chalk.red(`\nCannot assign self as Manager\n`));
      else
        getdata(`update employee set manager_id = (select * from (select id from employee where CONCAT(first_name, " " , last_name)="${answers.newManager}") a) where CONCAT(first_name, " " , last_name) = "${answers.fullname}"`)
        viewallemployees();
      })
    })
}


//View Employee by Manager
function viewemployeebymanager() {
   getdata(`select CONCAT(a.first_name, " " , a.last_name) as fullname from employee a inner join employee b on a.id = b.manager_id group by CONCAT(a.first_name, " " , a.last_name) ;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'manager',
          type: 'list',
          choices: results.map(choice => choice.fullname),
          message: "Which employee's manager do you see??"
        }
      ])
    .then((answer) => {
      getdata(sqlviewemployee + ` where a.manager_id =(select id from employee where CONCAT(first_name, " " , last_name) = "${answer.manager}")`)
        .then(results => {
          displaydata(`View Employee by Manager: ${answer.manager}`, results);
          mainchoice();
        }
        );
      })
    })
}

//View Employee by Department
function viewemployeebydepartment() {
   getdata(`select name from department;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'department',
          type: 'list',
          choices: results.map(choice => choice.name),
          message: "Which employee's department do you see??"
        }
      ])
    .then((answer) => {
      getdata(sqlviewemployee + ` where c.name = "${answer.department}"`)
        .then(results => {
          displaydata(`View Employee by Department: ${answer.department}`, results);
          mainchoice();
        }
        );
      })
    })
}

//View Budget by Department
function viewbudgetbydepartment() {
   getdata(`select name from department;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'department',
          type: 'list',
          choices: results.map(choice => choice.name),
          message: "Which department budget would you like to see??"
        }
      ])
    .then((answer) => {
      getdata(`select c.name as department, sum( b.salary) as budget from employee a left join role b on a.role_id=b.id left join department c on b.department_id=c.id where c.name = "${answer.department}" group by c.name`)
        .then(results => {
          displaydata(`View Budget by Department: ${answer.department}`, results);
          mainchoice();
        }
        );
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
              message: 'What is the salary of the role?',
               validate: function(value) {
                 if (!isNaN(value)) return true
                 else return 'Please enter a number'
      },        
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
                name: 'newdepartment',
                type: 'input',
                message: 'What is the name of the department?'
            }
   ]).then((answer) => {
          insertdata(`INSERT INTO department(name) VALUES( ? )`, answer.newdepartment)
          viewalldepartments();
        })
}

//Delete Employee
function deleteemployee() {
  getdata(`select CONCAT(first_name, " " , last_name) as fullname from employee;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'fullname',
          type: 'list',
          message: 'which employee would you like to delete?',
          choices: results.map(choice => choice.fullname),
        }
      ]).then((answer) => {
        deletedata(`Delete from employee where CONCAT(first_name, " " , last_name)=? `, answer.fullname)
        viewallemployees();
      })
    })
}

//Delete Role
function deleterole() {
  getdata(`select title from role;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'title',
          type: 'list',
          message: 'What role would you like to delete?',
          choices: results.map(choice => choice.title),
        }
      ]).then((answer) => {
        deletedata(`Delete from role where title=? `, answer.title)
        viewallroles();
      })
    })
}

//Delete Department
function deletedepartment() {
  getdata(`select name from department;`)
    .then(results => {
      inquirer.prompt([
        {
          name: 'department',
          type: 'list',
          message: 'What department would you like to delete?',
          choices: results.map(choice => choice.name),
        }
      ]).then((answer) => {
        deletedata(`Delete from department where name=? `, answer.department)
        viewalldepartments();
      })
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