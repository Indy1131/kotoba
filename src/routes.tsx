import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Reader from "./pages/Reader";
import FormantAnalysis from "./pages/FormantAnalysis";
import RealTimeFormants from "./pages/RealTimeFormants";
import TestCanvas from "./pages/TestCanvas";
import ProtectedRoute from "./routing/ProtectedRoute";

export default [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/record",
        element: (
          <ProtectedRoute>
            <Reader />
          </ProtectedRoute>
        ),
      },
      {
        path: "/about",
        element: (
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        )
      },
      {
        path: "/formants",
        element: (
          <ProtectedRoute>
            <FormantAnalysis />
          </ProtectedRoute>
        )
      },
      {
        path: "/realtime-formants",
        element: (
          <ProtectedRoute>
            <RealTimeFormants />
          </ProtectedRoute>
        )
      },
      {
        path: "/test-canvas",
        element: (
          <ProtectedRoute>
            <TestCanvas />
          </ProtectedRoute>
        )
      }
    ],
  },
];
