import { Component } from "react";
import Menu from "../components/Menu";
import '../styles/style.css'

export default function App(){
    return(
        <>
        <Menu/>
        <Component{...pageProps}/>
        </>
    )

}