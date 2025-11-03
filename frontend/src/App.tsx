import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatRoom from './pages/ChatRoom';
import CreateChat from './pages/CreateChat';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

function App() {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to={isAuthenticated ? '/chats' : '/login'}
                            />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/chats" />
                            ) : (
                                <Login />
                            )
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/chats" />
                            ) : (
                                <Register />
                            )
                        }
                    />
                    <Route
                        path="/chats"
                        element={
                            isAuthenticated ? (
                                <ChatRoom />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/create-chat"
                        element={
                            isAuthenticated ? (
                                <CreateChat />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </Router>
    );
}

export default App;
