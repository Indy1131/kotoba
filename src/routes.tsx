import Layout from "./layouts/Layout";
// import Home from "./pages/Home";
import About from "./pages/About";
import Reader from "./pages/Reader";
import RealTimeFormants from "./pages/RealTimeFormants";
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
      {
        path: "/realtime-formants",
        element: (
          <ProtectedRoute>
            <RealTimeFormants />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
