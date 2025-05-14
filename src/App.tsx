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
import { Layout, Menu, notification, theme } from "antd";
import "antd/dist/reset.css";
import "./App.css";

import Login from "./pages/Login";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  PhoneOutlined,
  ProjectOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  MdCategory,
  MdShop,
} from "react-icons/md";
import Requests from "./pages/Requests";
import Categories from "./pages/Categories";
import FilesAndLinks from "./pages/FilesAndLinks/FilesAndLinks";
import Maps from "./pages/Maps";
import Nodes from "./pages/Nodes";

const { Content, Footer, Sider } = Layout;

notification.config({
  maxCount: 1,
});

function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  function PrivateRoute() {
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
            {/* <img src={"./banqa-logo-only.png"} width="70%" alt="logo" /> */}
            <img src={"./ons-logo.png"} width="97%" alt="logo" />
          </div>
          <Menu
            selectedKeys={[location?.pathname]}
            defaultSelectedKeys={["/"]}
            mode="inline"
          >
            <Menu.Item key="/nodes" icon={<MdShop />}>
              <NavLink to="/nodes">Nodes</NavLink>
            </Menu.Item>
            <Menu.Item key="/maps" icon={<ProjectOutlined />}>
              <NavLink to="/maps">Map</NavLink>
            </Menu.Item>
            <Menu.Item key="/requests" icon={<PhoneOutlined />}>
              <NavLink to="/requests">Requests</NavLink>
            </Menu.Item>
            <Menu.Item key="/categories" icon={<MdCategory />}>
              <NavLink to="/categories">Categories</NavLink>
            </Menu.Item>
            <Menu.Item key="/files" icon={<SettingOutlined />}>
              <NavLink to="/files">Settings & Files</NavLink>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="layout">
          <Content style={{ padding: "0 50px" }}>
            <div
              className="site-layout-content"
              style={{ background: colorBgContainer, margin: "40px 0 0 0" }}
            >
              <Outlet />
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>BANQA Admin ©2024</Footer>
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
          <Route path="/" element={<Nodes />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/files" element={<FilesAndLinks />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
