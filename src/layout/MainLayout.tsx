import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function MainLayout(){

  return(

    <div className="layout">

      <Sidebar/>

      <div className="main">

        <Header/>

        <div className="content">
          <Outlet/>
        </div>

      </div>

    </div>

  )

}