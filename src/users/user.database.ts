import { User, UnitUser } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import mysql from "mysql";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "maglangitrestapi",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

export const findAll = async (): Promise<UnitUser[]> => {
  const query = "SELECT * FROM users";
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results: UnitUser[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

export const findOne = async (id: string): Promise<UnitUser | null> => {
  const query = "SELECT * FROM users WHERE id = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [id], (error, results: UnitUser[]) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

export const create = async (userData: User): Promise<UnitUser | null> => {
  const id = uuidv4();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  const newUser: UnitUser = { ...userData, id, password: hashedPassword };
  const query = "INSERT INTO users SET ?";
  return new Promise((resolve, reject) => {
    connection.query(query, newUser, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(newUser);
      }
    });
  });
};

export const findByEmail = async (email: string): Promise<UnitUser | null> => {
  const query = "SELECT * FROM users WHERE email = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [email], (error, results: UnitUser[]) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

export const comparePassword = async (
  email: string,
  suppliedPassword: string
): Promise<UnitUser | null> => {
  const user = await findByEmail(email);
  if (!user) {
    return null;
  }
  const isMatch = await bcrypt.compare(suppliedPassword, user.password);
  if (isMatch) {
    return user;
  } else {
    return null;
  }
};

export const update = async (
  id: string,
  updateValues: Partial<User>
): Promise<UnitUser | null> => {
  const user = await findOne(id);
  if (!user) {
    return null;
  }
  const updatedUser: UnitUser = { ...user, ...updateValues };
  const query = "UPDATE users SET ? WHERE id = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [updatedUser, id], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(updatedUser);
      }
    });
  });
};

export const remove = async (id: string): Promise<void> => {
  const query = "DELETE FROM users WHERE id = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [id], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const searchByName = async (name: string): Promise<UnitUser[]> => {
  const query = "SELECT * FROM users WHERE username LIKE ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [`%${name}%`], (error, results: UnitUser[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

export const searchByEmail = async (email: string): Promise<UnitUser[]> => {
  const query = "SELECT * FROM users WHERE email LIKE ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [`%${email}%`], (error, results: UnitUser[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

export default connection; // Export the MySQL connection