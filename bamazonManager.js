let mysql = require ('mysql');
let inquirer = require ('inquirer');

let itemid;

var connection = mysql.createConnection ({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'annies11',
  database: 'bamazon',
});

connection.connect (function (err) {
  if (err) throw err;
});

function start () {
  console.log ('');
  console.log ('');
  console.log ('');
  console.log ('Welcome to Bamazon');
  console.log ('');
  console.log ('Manager View');
  console.log ('-----------------------------------');
  console.log ('');
  StartForm ();
}

function StartForm () {
  inquirer
    .prompt ([
      {
        type: 'list',
        name: 'startforminput',
        message: 'Choose one: ',
        choices: [
          'View Products',
          'View Low Inventory',
          'Add to Inventory',
          'Add New Product',
          'Exit',
        ],
      },
    ])
    .then (answers => {
      if (answers.startforminput === 'View Products') {
        viewProducts ();
      } else if (answers.startforminput === 'View Low Inventory') {
        viewLowInventory ();
      } else if (answers.startforminput === 'Add to Inventory') {
        addToInventory ();
      } else if (answers.startforminput === 'Add New Product') {
        addNewProduct ();
      } else {
        process.exit ();
      }
    });
}

function viewProducts () {
  connection.query ('SELECT * FROM products', function (err, res) {
    for (var i = 0; i < res.length; i++) {
      let itemId = res[i].item_id;
      let productName = res[i].product_name;
      let departmentName = res[i].department_name;
      let price = res[i].price;
      let quantity = res[i].stock_quantity;

      console.log (
        `${itemId} |  ${productName}  |  ${departmentName}  |  $${price}  |  Quantity: ${quantity}`
      );
    }
    console.log ('');
    restartPrompt ();
  });
}

function viewLowInventory () {
  console.log ('---------------------------------------');
  console.log ('CURRENT LOW INVENTORY:');
  console.log ('');

  connection.query ('SELECT * FROM products', function (err, res) {
    for (var i = 0; i < res.length; i++) {
      let itemId = res[i].item_id;
      let productName = res[i].product_name;
      let departmentName = res[i].department_name;
      let price = res[i].price;
      let quantity = res[i].stock_quantity;

      if (quantity <= 5) {
        console.log (
          `${itemId} |  ${productName}  |  ${departmentName}  |  $${price}  |  Quantity: ${quantity}`
        );
      }
    }
    console.log ('');
    restartPrompt ();
  });
}

function addToInventory () {
  inquirer
    .prompt ([
      {
        type: 'text',
        name: 'addinvid',
        message: 'Type the ID of the item you are adding inventory to: ',
      },
      {
        type: 'text',
        name: 'addinvquantity',
        message: 'Type how many you are adding to the inventory: ',
      },
    ])
    .then (answers => {
      var addInvId = answers.addinvid;
      var addInvQuantity = answers.addinvquantity;

      connection.query (
        'SELECT * FROM products WHERE ?',
        {item_id: addInvId},
        function (err, res) {
          if (err) throw err;

          var addInvPrevQuantity = res[0].stock_quantity;
          var addInvName = res[0].product_name;

          console.log ('');
          console.log (
            `${addInvName} | Previous Quantity: ${addInvPrevQuantity}`
          );

          connection.query ('UPDATE products SET ? WHERE ?', [
            {
              stock_quantity: parseInt (addInvPrevQuantity) +
                parseInt (addInvQuantity),
            },
            {item_id: addInvId},
          ]);

          console.log (
            `New Quantity: ${parseInt (addInvPrevQuantity) + parseInt (addInvQuantity)}`
          );
          console.log ('');
          restartPrompt ();
        }
      );
    });
}

function addNewProduct () {
  inquirer
    .prompt ([
      {
        type: 'text',
        name: 'addproductnameinput',
        message: 'Name of new product: ',
      },
      {
        type: 'text',
        name: 'addproductdepartmentinput',
        message: 'New product department: ',
      },
      {
        type: 'text',
        name: 'addproductpriceinput',
        message: 'Price of new product: ',
      },
      {
        type: 'text',
        name: 'addproductquantityinput',
        message: 'New product quantity: ',
      },
    ])
    .then (answers => {
      var newItemName = answers.addproductnameinput;
      var newItemDept = answers.addproductdepartmentinput;
      var newItemPrice = answers.addproductpriceinput;
      var newItemQuantity = answers.addproductquantityinput;

      connection.query (
        `INSERT INTO products (product_name, department_name, price, stock_quantity)
      VALUES ('${newItemName}', '${newItemDept}', ${newItemPrice}, ${newItemQuantity});`
      );
      console.log(`${newItemName} has been added to the inventory!`)
      console.log('')
      restartPrompt();
    });
}

function restartPrompt () {
  inquirer
    .prompt ([
      {
        type: 'list',
        name: 'restartpromptinput',
        message: 'Choose one: ',
        choices: ['Main Menu', 'Exit'],
      },
    ])
    .then (answers => {
      if (answers.restartpromptinput === 'Main Menu') {
        start ();
      } else if (answers.startpromptinput === 'Exit') {
        process.exit ();
      }
    });
}

start ();
