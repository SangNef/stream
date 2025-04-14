import React, { Fragment } from "react";
import { Provider } from "react-redux";
import { store } from "./store/AuthStore";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import "./App.css";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    {routes.map(({ path, Component, Layout, RouteType }) => {
                        const L = Layout ?? Fragment;
                        const R = typeof RouteType === "function" ? RouteType : Fragment;
                        return (
                            <Route
                                key={path}
                                path={path}
                                element={
                                    <R>
                                        <L>
                                            <Component />
                                        </L>
                                    </R>
                                }
                            />
                        );
                    })}
                </Routes>
            </Router>
            <ToastContainer />
        </Provider>
    );
}

export default App;
