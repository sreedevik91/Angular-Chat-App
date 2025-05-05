import { Routes } from "@angular/router";
import { authGuard } from "../guards/auth.guard";

const childRoutes:Routes= [
    {
        path:'',
        loadComponent:()=>import('../components/layout/layout.component'),
        children:[
            {
                path:'chat',
                loadComponent:()=>import('../components/chat/chat.component'),
                canActivate:[authGuard]
            }
        ]
    }
]

export default childRoutes