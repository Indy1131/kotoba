import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Reader from "./pages/Reader";
import ProtectedRoute from "./routing/ProtectedRoute";

export default [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/reader",
        element: (
          <ProtectedRoute>
            <Reader />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
