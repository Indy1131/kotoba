import Layout from "./layouts/Layout";
// import Home from "./pages/Home";
import About from "./pages/About";
import Reader from "./pages/Reader";
import ProtectedRoute from "./routing/ProtectedRoute";

export default [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <About /> },
      {
        path: "/record",
        element: (
          <ProtectedRoute>
            <Reader />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
