import { Router } from "express";
import { loginAdmin, logoutAdmin } from "../controllers/authAdmin_controllers.js";
import { authenticateTokenAdmin } from "../middleware/authMiddleware.js";
import { changeAdminPassword, createAdmin, deleteAdmin, getAdmin, getAdminPerfil, getAdmins, patchAdmin, updateAdmin, updateAdminProfileImage, updateStateAdmin } from "../controllers/admins.controllers.js";
import { createUser, deleteUser, getUser, getUsers, patchUser, sumarCompras, updateStateUser } from "../controllers/usuarios.controllers.js";
import { createVino, deleteVino, getVino, getVinos, getVinosPorCategoria, reducirStockVino, updateVino, upload } from "../controllers/vinos.controllers.js";
import { getCategoria, getCategorias } from "../controllers/categorias.controllers.js";
import { createPedido, deletePedido, getPedido, getPedidos, updatePedido, updateStatePedido } from "../controllers/pedidos.controllers.js";
import { createFavorito, deleteFavorito, getFavoritos, getFavoritosPersona } from "../controllers/favoritos.controllers.js";
import { createVenta, deleteVenta, getVenta, getVentas, getVentasByAdmin, searchVentasByCliente } from "../controllers/ventas_controllers.js";
import { addDetallePedido, deleteDetallePedido, updateDetallePedido } from "../controllers/detalles_pedidos.controllers.js";
import { resetContra, verificarDatos } from "../controllers/reserContra.controllers.js";
import { createAdminAWS } from "../controllers/AWSlightsail/login.controllers.js";

const router = Router();

router.post("/admins/registrar", createAdminAWS);

router.get("/admins", getAdmins);
router.get("/admins/:id", authenticateTokenAdmin, getAdmin);
router.get("/admins/perfil", authenticateTokenAdmin, getAdminPerfil);
router.post("/admins", authenticateTokenAdmin, createAdmin);
router.delete("/admins/:id", authenticateTokenAdmin, deleteAdmin);
router.patch("/admins/:id/password", authenticateTokenAdmin, changeAdminPassword);
router.patch("/admins/:id/perfil", authenticateTokenAdmin, upload.single("perfil"), updateAdminProfileImage);
router.patch("/admins/:id", authenticateTokenAdmin, updateAdmin);
router.put("/adminsState/:id", authenticateTokenAdmin, updateStateAdmin);
router.patch("/admins/update/:id", authenticateTokenAdmin, patchAdmin); 

router.post("/login-admin", loginAdmin);
router.post("/logout-admin", authenticateTokenAdmin, logoutAdmin);


router.post("/admins/verificar-datos", verificarDatos);
router.patch("/admins/reset-contra/:id", resetContra);


router.get('/ventasAdmin', authenticateTokenAdmin, getVentas);
router.get('/ventasAdmin/:id', authenticateTokenAdmin, getVenta);
router.get('/ventasAdmin/admin/:adminId', authenticateTokenAdmin, getVentasByAdmin);
router.post('/ventasAdmin', authenticateTokenAdmin, createVenta);
router.delete('/ventasAdmin/:id', authenticateTokenAdmin, deleteVenta);
router.get('/ventasAdmin/search', authenticateTokenAdmin, searchVentasByCliente);


router.get("/usuariosAdmin", authenticateTokenAdmin, getUsers);
router.get("/usuariosAdmin/:id", authenticateTokenAdmin, getUser);
router.post("/usuariosAdmin",authenticateTokenAdmin, createUser);
router.delete("/usuariosAdmin/:id", authenticateTokenAdmin, deleteUser);
router.put("/usuariosStateAdmin/:id", authenticateTokenAdmin, updateStateUser);
router.patch("/usuariosAdmin/:id", authenticateTokenAdmin, patchUser);
router.put("/usuariosAdmin/:id/sumarCompra", authenticateTokenAdmin, sumarCompras);



router.get("/vinosAdmin", authenticateTokenAdmin, getVinos);
router.get("/vinosAdmin/categoria/:categoria_id", authenticateTokenAdmin, getVinosPorCategoria);
router.get("/vinosAdmin/:id", authenticateTokenAdmin, getVino);
router.post("/vinosAdmin", authenticateTokenAdmin, upload.single("imagen"), createVino);
router.put("/vinosAdmin/:id", authenticateTokenAdmin, upload.single("imagen"), updateVino);
router.delete("/vinosAdmin/:id", authenticateTokenAdmin, deleteVino);
router.put("/vinosAdmin/:id/reducirStock", authenticateTokenAdmin, reducirStockVino)

router.get("/categoriasAdmin", authenticateTokenAdmin, getCategorias);
router.get("/categoriasAdmin/:id", authenticateTokenAdmin, getCategoria);
router.post("/detallePedidosAdmin", authenticateTokenAdmin, addDetallePedido);


router.get("/pedidosAdmin", authenticateTokenAdmin, getPedidos);
router.get("/pedidosAdmin/:id", authenticateTokenAdmin, getPedido);
router.post("/pedidosAdmin", authenticateTokenAdmin, createPedido);
router.put("/pedidosAdmin/:id", authenticateTokenAdmin, updatePedido);
router.put("/pedidosAdmin/:id/estado", authenticateTokenAdmin, updateStatePedido);
router.delete("/pedidosAdmin/:id", authenticateTokenAdmin, deletePedido);


router.put("/detallePedidosAdmin/:id", authenticateTokenAdmin, updateDetallePedido); 
router.delete("/detallePedidosAdmin/:id", authenticateTokenAdmin, deleteDetallePedido);

router.get("/favoritosAdmin", authenticateTokenAdmin, getFavoritos);
router.post("/favoritosAdmin", authenticateTokenAdmin, createFavorito);
router.delete("/favoritosAdmin/:id", authenticateTokenAdmin, deleteFavorito);
router.get("/favoritosAdmin/persona/:persona_id", authenticateTokenAdmin, getFavoritosPersona);


export default router;
