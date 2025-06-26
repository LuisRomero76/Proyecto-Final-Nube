import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routers/AppRouters.jsx';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;