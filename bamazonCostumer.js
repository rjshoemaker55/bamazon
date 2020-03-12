let mysql = require ('mysql');
let inquirer = require ('inquirer');

var connection = mysql.createConnection ({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '********',
  database: 'bamazon',
});

connection.connect (function (err) {
  if (err) throw err;
});

function start () {
  console.log ('');
  console.log ('');
  console.log ('Welcome to Bamazon');
  console.log ('');
  console.log ('Products for Sale:');
  console.log ('-----------------------------------');
  console.log ('');
  productsForSale ();
}

function productsForSale () {
  connection.query ('SELECT * FROM products', function (err, res) {
    for (var i = 0; i < res.length; i++) {
      let itemId = res[i].item_id;
      let productName = res[i].product_name;
      let departmentName = res[i].department_name;
      let price = res[i].price;
      let stockQuantity = res[i].stock_quantity;

      console.log (
        `${itemId}|  ${productName}  |  ${departmentName}  |  $${price}  |  Quantity: ${stockQuantity}`
      );
    }
    console.log ('');
    startForm ();
  });
}

function startForm () {
  inquirer
    .prompt ([
      {
        type: 'list',
        name: 'startforminput',
        message: 'Choose one: ',
        choices: ['Buy an Item', 'Exit'],
      },
    ])
    .then (answers => {
      if (answers.startforminput === 'Buy an Item') {
        buyItemForm ();
      } else if (answers.startforminput === 'Exit') {
        process.exit ();
      }
    });
}

function buyItemForm () {
  let newBuyItemId;
  let newBuyItemQuantity;

  inquirer
    .prompt ([
      {
        type: 'text',
        name: 'buyiteminput',
        message: 'Enter Item ID: ',
      },
    ])
    .then (answers => {
      newBuyItemId = answers.buyiteminput;

      inquirer
        .prompt ([
          {
            type: 'text',
            name: 'buyitemquantity',
            message: 'Enter Quantity: ',
          },
        ])
        .then (answers => {
          newBuyItemQuantity = answers.buyitemquantity;
          buyItems (newBuyItemId, newBuyItemQuantity);
        });
    });
}

function buyItems (id, quantity) {
  console.log ('ID: ' + id + ' | Quantity: ' + quantity);

  connection.query (
    'SELECT EXISTS(SELECT * FROM products WHERE ?)',
    {item_id: id},
    function (err, res) {
      var dynamicKey = `EXISTS(SELECT * FROM products WHERE \`item_id\` = '${id}')`;
      itemExists = res[0][dynamicKey];
      if (err) throw err;

      if (itemExists === 1) {
        connection.query (
          'SELECT * FROM products WHERE ?',
          {item_id: id},
          function (err, res) {
            if (err) throw err;
            let buyItemId = res[0].item_id;
            let buyItemName = res[0].product_name;
            let buyItemDept = res[0].department_name;
            let buyItemPrice = res[0].price;
            let buyItemQuantity = res[0].stock_quantity;

            if (buyItemQuantity >= quantity) {
              connection.query ('UPDATE products SET ? WHERE ?', [
                {stock_quantity: buyItemQuantity - quantity},
                {item_id: id},
              ]);
              console.log ('');
              console.log ('---------------------------------------');
              console.log ('Your total is: $' + buyItemPrice * quantity);
              console.log ('---------------------------------------');
              console.log ('');
              restartPrompt ();
            } else {
              console.log ('');
              console.log ('---------------------------------------');
              console.log ('NOT ENOUGH STOCK TO FULFILL YOUR ORDER.');
              console.log ('---------------------------------------');
              console.log ('');
              restartPrompt ();
            }
          }
        );
      } else {
        console.log ('');
        console.log ('---------------------------------------');
        console.log ('PLEASE ENTER A VALID ITEM ID.');
        console.log ('---------------------------------------');
        console.log ('');
        restartPrompt ();
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
    }
  );
}
start ();
