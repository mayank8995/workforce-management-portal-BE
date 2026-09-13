{
"label": "Status",// string,
"type":"primitive",//array,object
"fieldType": "select"//text,number,checkbox,
"constraints": {
// someOptions based on fields
// this i think contains all validation ,checks
},
"metadata": {}, // any object
"name": "status" // string,
"options": ["A", "B", "C"] // can be array/number/string
"defaultValue":""
}

// backend db and schema revamp
Employees

{
"resource": "dashboard",
"actions": {
"read": true,
"update": true,
"create": false,
"delete": false
}
},
store it in context

1. access read flag in route to bloack user if he dont have read/view permission or hide the route path
2. access update, create, delete flag in component to manage the actions / show hide the req ui.
