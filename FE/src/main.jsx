import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import App from './App';
import './styles/components.css';
import './styles/theme.css';
import './styles/react.css';

createRoot(document.getElementById('root')).render(<AppProvider><App /></AppProvider>);
