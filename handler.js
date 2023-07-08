"use strict";

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "<mysql-hostname>",
  user: "<mysql-username>",
  password: "<mysql-password>",
  database: "<mysql-database>",
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports.api = async (event) => {
  const method = event.httpMethod;
  const userId = event.pathParameters && event.pathParameters.id;
  let response;

  switch (method) {
    case "GET":
      response = userId ? handleGetUser(userId) : handleGetUsers();
      break;
    case "POST":
      response = handleCreateUser(JSON.parse(event.body));
      break;
    case "PUT":
      response = handleUpdateUser(userId, JSON.parse(event.body));
      break;
    case "DELETE":
      response = handleDeleteUser(userId);
      break;
    default:
      response = createResponse(400, "Invalid HTTP Method");
  }

  return response;
};

function handleGetUsers() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Users";

    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(createResponse(200, results));
      }
    });
  });
}

function handleGetUser(userId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Users WHERE user_id = ?";
    const params = [userId];

    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(createResponse(404, "User not found"));
        } else {
          resolve(createResponse(200, results[0]));
        }
      }
    });
  });
}

function handleCreateUser(user) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO Users (user_id, name, email, password) VALUES (?, ?, ?, ?)";
    const params = [user.user_id, user.name, user.email, user.password];

    connection.query(query, params, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(createResponse(201, "User created successfully"));
      }
    });
  });
}

function handleUpdateUser(userId, user) {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE Users SET name = ?, email = ?, password = ? WHERE user_id = ?";
    const params = [user.name, user.email, user.password, userId];

    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.affectedRows === 0) {
          resolve(createResponse(404, "User not found"));
        } else {
          resolve(createResponse(200, "User updated successfully"));
        }
      }
    });
  });
}

function handleDeleteUser(userId) {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM Users WHERE user_id = ?";
    const params = [userId];

    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.affectedRows === 0) {
          resolve(createResponse(404, "User not found"));
        } else {
          resolve(createResponse(200, "User deleted successfully"));
        }
      }
    });
  });
}

function createResponse(statusCode, data) {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
}

connection.end();
