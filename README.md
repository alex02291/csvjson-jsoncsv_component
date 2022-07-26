# MariaDB Component 
For test the component before convert in a docker image, execute
`node test/test.js`
or
`nodemon test/test.js` 
or well `npm run test`

This json object is for test with database online
```
{
"database": "sql5500302",
"host": "sql5.freesqldatabase.com",
"port": 3306,
"user": "sql5500302",
"password": "6ukkDPNkdE",
"query": "select * from customers"
}
````
The available tables in this database are:
```
customers
employees
offices
orderdetails
orders
payments
productlines
products
```

>If don't has a configured port in env variables, it takes port 5000, tests only
