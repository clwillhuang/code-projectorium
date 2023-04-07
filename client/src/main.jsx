import React from 'react'
import ReactDOM from 'react-dom/client'
import {
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Projects from './routes/Projects';
import Home from './routes/Home';
import { QueryClient, QueryClientProvider } from 'react-query';
import ProjectDetail from './routes/ProjectDetail';
import ProjectReader from './routes/ProjectReader';
import ProjectBrowser from './routes/ProjectBrowser';
import Register from './routes/Register';
import Login from './routes/Login';

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home/>
	},
	{
		path: "/projects",
		element: <Projects/>
	},
	{
		path: "/projects/:projectId/edit",
		element: <ProjectDetail/>
	},
	{
		path: "/projects/:projectId/view",
		element: <ProjectReader/>
	},
	{
		path: "/browse",
		element: <ProjectBrowser/>
	},
	{
		path: "/register",
		element: <Register/>
	},
	{
		path: "/Login",
		element: <Login/>
	}
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router}/>
		</QueryClientProvider>
	</React.StrictMode>
)
