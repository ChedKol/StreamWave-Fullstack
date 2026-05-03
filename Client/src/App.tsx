import { Provider } from 'react-redux';
import { store } from './store/store'; // ודאי שהנתיב לקובץ ה-store נכון
import { AuthProvider } from './auth/AuthContext';
import Router from './routes/Router';

function App() {
  return (
    // המילה store כאן חייבת להיות באותיות קטנות
    <Provider store={store}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </Provider>
  );
}

export default App;