import React, { useState } from "react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { DEFAULT_LOGIN_ERR_CODE, LOGIN_ERR_CODES } from "../constants/session";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onLogin = (values: { email: string; password: string }) => {
    setErrorMessage("");
    try {
      setLoading(true);
      const docRef = collection(db, "admins");
      const q = query(docRef, where("email", "==", values?.email), limit(1));
      getDocs(q).then((docSnap) => {
        if (docSnap.empty) {
          // No matching documents found
          setLoading(false);
          console.log("No such document!");
          setErrorMessage(DEFAULT_LOGIN_ERR_CODE);
          return;
        } else {
          setPersistence(auth, browserSessionPersistence)
            .then(() => {
              return signInWithEmailAndPassword(
                auth,
                values.email,
                values.password
              )
                .then((userCredential: { user: any }) => {
                  const user = userCredential.user;
                  localStorage.setItem("auth-token", user);
                  if (!localStorage.getItem("app-id")) {
                    localStorage.setItem("app-id", "maps");
                  }
                  setLoading(false);
                  navigate("/");
                })
                .catch((error: { code: any; message: any }) => {
                  const errorCode = error.code;
                  const errorMessage = error.message;
                  console.log("errrr1", errorCode, errorMessage);
                  setErrorMessage(
                    LOGIN_ERR_CODES[errorMessage] ?? DEFAULT_LOGIN_ERR_CODE
                  );
                  setLoading(false);
                });
            })
            .catch((error: { code: any; message: any }) => {
              // Handle Errors here.
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log("errrr2", errorCode, errorMessage);
              setErrorMessage(
                LOGIN_ERR_CODES[errorMessage] ?? DEFAULT_LOGIN_ERR_CODE
              );
            });
        }
      });
    } catch (e) {
      console.log(e);
      console.log("errrr4", errorMessage);
      setErrorMessage(DEFAULT_LOGIN_ERR_CODE);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <img src="./ons-logo.png" width={300} alt="logo" />
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onLogin}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email Address!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email Address"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <p style={{ color: "red" }}>{errorMessage}</p>
        <Form.Item>
          <Button
            type="default"
            htmlType="submit"
            block
            loading={loading}
            disabled={loading}
            className="login-form-button"
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
