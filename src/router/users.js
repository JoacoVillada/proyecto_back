//archivo para manejar las rutas de usuarios

import { Router } from "express";
import {
  auth,
  createUsers,
  logIn,
  createMateria,
  createCursada,
  getMateriaById,
} from "../controller/users";

//objeto para manejo de url
const routerUsers = Router();

//Enpoint para loguear usuario
/**
 * @swagger
 * /user/login:
 *  post:
 *      sumary: loguear usuario
 */
routerUsers.post("/user/login", logIn);

/**
 * @swagger
 * /usersp:
 *  post:
 *      sumary: crea usuarios
 */
routerUsers.post("/user/usersp", createUsers);

/**
 * @swagger
 * /materia/create:
 *  post:
 *      summary: crea una nueva materia
 */
routerUsers.post("/materia/create", createMateria);

/**
 * @swagger
 * /cursada/create:
 *   post:
 *     summary: Crea una nueva cursada
 */
routerUsers.post("/cursada/create", createCursada);

/**
 * @swagger
 * /user/getMateriaById/{dni}:
 *  get:
 *      summary: Devolver las materias que cursa un alumno determinado
 *      parameters:
 *        - in: path
 *          name: dni
 *          schema:
 *            type: string
 *          required: true
 *          description: DNI del alumno
 */
routerUsers.get("/user/getMateriaById/:dni", getMateriaById);

export default routerUsers;
