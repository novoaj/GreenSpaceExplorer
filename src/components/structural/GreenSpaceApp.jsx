import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from "./Layout"
import Home from "../content/Home"
import LoginScreen from '../content/LoginScreen';
import SignupScreen from '../content/SignupScreen';
import useToken from '../useToken';

export default function GreenSpaceApp(){

    const { token, removeToken, setToken } = useToken()
    
    return (
        <BrowserRouter>
                <Routes>
                    <Route path = "/" element={<Layout token={token} removeToken={removeToken}/>}>
                        <Route index element={<Home />} />
                        <Route path="/login" element={<LoginScreen setToken={setToken}/>}></Route>
                        <Route path = "/signup" element={<SignupScreen setToken={setToken}/>}></Route>
                    </Route>
                </Routes>
            </BrowserRouter> 
    )
}