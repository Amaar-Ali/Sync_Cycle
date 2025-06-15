import './utils/logUtils'; // Import first to disable console logs
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './custom-bootstrap.css'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
