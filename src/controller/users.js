import { connect } from "../databases";
import jwt from "jsonwebtoken";
const claveSecreta = process.env.SECRET_KEY;

export const logIn = async (req, res) => {
  try {
    //obtener los datos de la request - PASO 1
    const { dni, password } = req.body;

    //obtener el objeto conexión - PASO 2
    const cnn = await connect();

    const q = `SELECT pass FROM alumno WHERE dni=?`;
    const value = [dni];

    const [result] = await cnn.query(q, value);

    if (result.length > 0) {
      //el usuario existe
      //comprar las contraseñas
      if (result[0].pass === password) {
        // contraseña igual
        //crear un token
        const token = getToken({ dni: dni });
        //enviar al front
        return res
          .status(200)
          .json({ message: "correcto", success: true, token: token });
      } else {
        return res
          .status(400)
          .json({ message: "la contraseña no coincide", success: false });
      }
    } else {
      //usuario no existe
      return res
        .status(400)
        .json({ message: "user no existe", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "fallo en chatch", error: error });
  }
};

const validate = async (campo, valor, tabla, cnn) => {
  //q guarda el query
  const q = `SELECT * FROM ${tabla} WHERE ${campo}=?`;
  const value = [valor];

  const [result] = await cnn.query(q, value);

  return result.length === 1; //nos devuelve verdadero si hay un usuario y falso si no existe
};

//crear usuarios desde el sigup
export const createUsers = async (req, res) => {
  try {
    //establecer la conexion a la bd -> instanciando un objeto conexion
    const cnn = await connect();
    //obtener lo que envio el front
    const { dni, nombre, password } = req.body;

    const userExist = await validate("dni", dni, "alumno", cnn);

    //validar la existencia de el dni
    if (userExist)
      return res.status(400).json({ message: "el usuario ya existe" });

    //insertar un registro a la base de datos -> usuario
    const [result] = await cnn.query(
      "INSERT INTO alumno ( dni, nombre, pass) VALUE (?,?,?)",
      [dni, nombre, password]
    );

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "se creo el usuario", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "no se creo el usuario", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

//funcion para autenticar el token
//middleware
export const auth = (req, res, next) => {
  //obtener el token desde la peticion
  const tokenFront = req.headers["auth"];

  //verificar que hay un token
  if (!tokenFront) return res.status(400).json({ message: "no hay token" }); //si no existe el troken en la peticion

  //si hay token, debemos validarlo
  jwt.verify(tokenFront, claveSecreta, (error, payload) => {
    if (error) {
      //si el token no es validor
      return res.status(400).json({ message: " el token no es valido" });
    } else {
      //el token es valido
      req.payload = payload;
      next();
    }
  });
};

// Crear materias
export const createMateria = async (req, res) => {
  try {
    // establecer la conexion a la bd -> instanciando un objeto conexion
    const cnn = await connect();
    // obtener lo que envio el front
    const { nombre_materia } = req.body;

    const materiaExist = await validate(
      "nombre_materia",
      nombre_materia,
      "materia",
      cnn
    );

    // validar la existencia de la materia
    if (materiaExist)
      return res.status(400).json({ message: "la materia ya existe" });

    // insertar un registro a la base de datos -> materia
    const [result] = await cnn.query(
      "INSERT INTO materia (nombre_materia) VALUES (?)",
      [nombre_materia]
    );

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "se creó la materia", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "no se creó la materia", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Función para crear una nueva cursada
export const createCursada = async (req, res) => {
  try {
    const { dni, id_m } = req.body;

    // Validar si la cursada ya existe
    const cursadaExist = await validateCursada(dni, id_m);
    if (cursadaExist) {
      return res.status(400).json({ message: "La cursada ya existe" });
    }

    // Insertar la nueva cursada en la base de datos
    const cnn = await connect();
    const [result] = await cnn.query(
      "INSERT INTO cursar (dni, id_m) VALUES (?, ?)",
      [dni, id_m]
    );

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "Se creó la cursada exitosamente", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "No se pudo crear la cursada", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Función para validar si una cursada existe
const validateCursada = async (dni, id_m) => {
  const cnn = await connect();
  const [result] = await cnn.query(
    "SELECT * FROM cursar WHERE dni = ? AND id_m = ?",
    [dni, id_m]
  );
  return result.length > 0;
};

//funciones privadas
//funcion que devuelte el token
const getToken = (payload) => {
  const token = jwt.sign(payload, claveSecreta, { expiresIn: "60m" });
  return token;
};

// getMateriaById: Devolver las materias que cursa un alumno determinado
export const getMateriaById = async (req, res) => {
  try {
    const connection = await connect();
    const { dni } = req.params;

    // Verificar si el alumno existe
    const [alumnoResult] = await connection.query(
      "SELECT * FROM alumno WHERE dni = ?",
      [dni]
    );
    if (alumnoResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Alumno no encontrado", success: false });
    }

    // Obtener las materias que cursa el alumno
    const [result] = await connection.query(
      "SELECT m.id_m, m.nombre_materia FROM materia m INNER JOIN cursar c ON m.id_m = c.id_m WHERE c.dni = ?",
      [dni]
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
