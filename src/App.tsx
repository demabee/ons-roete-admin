/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, notification, theme } from "antd";
import "antd/dist/reset.css";
import "./App.css";

import Login from "./pages/Login";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  LogoutOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  MdPhotoLibrary,
  MdPlace,
  MdShop,
} from "react-icons/md";
import Maps from "./pages/Maps";
import Nodes from "./pages/Nodes";
import Gallery from './pages/Gallery';
import Destination from './pages/Destination';
import Homepage from './pages/Homepage';

const { Content, Footer, Sider } = Layout;

notification.config({
  maxCount: 1,
});

function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  function PrivateRoute() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return localStorage.getItem("auth-token") ? (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          style={{ backgroundColor: "#fff" }}
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div
            style={{
              width: "85%",
              margin: "7.5%",
              marginTop: "10%",
              paddingBottom: 20,
              textAlign: "center",
            }}
          >
            <img src={"./ons-logo.png"} width="97%" alt="logo" />
          </div>
          <Menu
            selectedKeys={[location?.pathname]}
            defaultSelectedKeys={["/"]}
            mode="inline"
          >
            <Menu.Item key="/" icon={<MdShop />}>
              <NavLink to="/">Homepage</NavLink>
            </Menu.Item>
            <Menu.Item key="/nodes" icon={<MdShop />}>
              <NavLink to="/nodes">Nodes</NavLink>
            </Menu.Item>
            <Menu.Item key="/gallery" icon={<MdPhotoLibrary />}>
              <NavLink to="/gallery">Gallery</NavLink>
            </Menu.Item>
            <Menu.Item key="/destination" icon={<MdPlace />}>
              <NavLink to="/destination">Destination</NavLink>
            </Menu.Item>
            <Menu.Item key="/maps" icon={<ProjectOutlined />}>
              <NavLink to="/maps">Map</NavLink>
            </Menu.Item>
            <Menu.Item icon={<LogoutOutlined />}>
              <a
                onClick={async (e) => {
                  await localStorage.removeItem("auth-token");
                  navigate("/");
                }}
                rel="noopener noreferrer"
                href="#"
              >
                Logout
              </a>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="layout">
          <Content style={{ padding: "0 50px" }}>
            <div
              className="site-layout-content"
              style={{
                background:
                  location.pathname === "/" ? "transparent" : colorBgContainer,
                margin: "40px 0 0 0",
              }}
            >
              <Outlet />
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>Ons Roete Admin ©{new Date().getFullYear()}</Footer>
        </Layout>
      </Layout>
    ) : (
      <Navigate to="/login" />
    );
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!localStorage.getItem("app-id")) {
          localStorage.setItem("app-id", "maps");
        }
      } else {
        console.log("user is logged out");
        localStorage.removeItem("auth-token");
      }
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/destination" element={<Destination />} />
          <Route path="/maps" element={<Maps />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
