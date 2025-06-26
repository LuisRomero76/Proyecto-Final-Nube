import { Route, Routes } from 'react-router-dom';
import Principal from '../pages/principal';
import Usuarios from '../pages/Usuarios/usuarios';
import Productos from '../pages/Products/productos';
import Login from '../components/Login/login';
import PrivateRoute from '../components/authToken/authToken';
import UsuariosView from '../pages/Usuarios/usuariosView';
import Pedidos from '../pages/Pedidos/pedidos';
import Favoritos from '../pages/Favoritos/favoritos';
import PedidosView from '../pages/Pedidos/pedidosView';
import Perfil from '../pages/perfil';
import Ventas from '../pages/Ventas/ventas';
import Admins from '../pages/Admins/admins';
import ProductosView from '../pages/Products/productosView';
import AdminsView from '../pages/Admins/adminsView';
import ResetContra from '../pages/olvidContra/resetContra';

function AppRouters() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/principal" element={<PrivateRoute><Principal /></PrivateRoute>} />
            <Route path="/usuarios" element={<PrivateRoute><Usuarios/></PrivateRoute>} />
            <Route path="/productos" element={<PrivateRoute><Productos/></PrivateRoute>} />
            <Route path="/productos/:id" element={<PrivateRoute><ProductosView/></PrivateRoute>} />
            <Route path="/usuarioView/:id" element={<PrivateRoute><UsuariosView/></PrivateRoute>} />
            <Route path="/pedidos/view/:id" element={<PrivateRoute><PedidosView/></PrivateRoute>} />
            <Route path="/pedidos" element={<PrivateRoute><Pedidos/></PrivateRoute>} />
            <Route path="/favoritos" element={<PrivateRoute><Favoritos/></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil/></PrivateRoute>} />
            <Route path="/ventas" element={<PrivateRoute><Ventas/></PrivateRoute>} />
            <Route path="/administradores" element={<PrivateRoute><Admins/></PrivateRoute>} />
            <Route path="/adminView/:id" element={<PrivateRoute><AdminsView/></PrivateRoute>} />
            <Route path="/resetContra" element={<ResetContra/>} />
            
        </Routes>
    );
}

export default AppRouters;