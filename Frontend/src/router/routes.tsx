import { createBrowserRouter, Navigate } from "react-router-dom";
import Model from "../components/Model";
// import { Page1 } from "../components/pages/Page1";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/raw" replace />,
  },
  {
    path: "/raw",
    element: <Model />,
  },
  {
    path: "/aggregated",
    element: <Model />,
  },
  {
    path: "/delta",
    element: <Model />,
  },
  // {
  //   path:'page1',
  //   element:<Page1/>
  // }
]);

export default router;
