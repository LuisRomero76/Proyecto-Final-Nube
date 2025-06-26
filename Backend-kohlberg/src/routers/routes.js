import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, patchUser, updateUser } from "../controllers/usuarios.controllers.js";
import { createVino, deleteVino, getVino, getVinos, getVinosPorCategoria, updateVino } from "../controllers/vinos.controllers.js";
import { getCategoria, getCategorias } from "../controllers/categorias.controllers.js";
import { createPedido, deletePedido, getPedido, getPedidos, updatePedido } from "../controllers/pedidos.controllers.js";
import { createFavorito, deleteFavorito, getFavorito, getFavoritos, getFavoritosPersona } from "../controllers/favoritos.controllers.js";
import { loginUser, logoutUser } from "../controllers/auth.controllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";


const router = Router();

router.post("/login", loginUser);
router.post("/logout", authenticateToken, logoutUser);

router.get("/usuarios/:id", authenticateToken, getUser);
router.post("/usuarios", createUser);
router.put("/usuarios/:id", authenticateToken, updateUser);
router.patch("/usuarios/:id", authenticateToken, patchUser);

router.get("/vinos", getVinos);
router.get("/vinos/categoria/:categoria_id", authenticateToken, getVinosPorCategoria);
router.get("/vinos/:id", authenticateToken, getVino);

router.get("/categorias", authenticateToken, getCategorias);
router.get("/categorias/:id", authenticateToken, getCategoria);

router.get("/pedidos", authenticateToken, getPedidos);
router.get("/pedidos/:id", authenticateToken, getPedido);
router.post("/pedidos", authenticateToken, createPedido);
router.put("/pedidos/:id", authenticateToken, updatePedido);
router.delete("/pedidos/:id", authenticateToken, deletePedido);

router.get("/favoritos", authenticateToken, getFavoritos);
router.post("/favoritos", authenticateToken, createFavorito);
router.delete("/favoritos/:id", authenticateToken, deleteFavorito);
router.get("/favoritos/persona/:persona_id", authenticateToken, getFavoritosPersona);

export default router;