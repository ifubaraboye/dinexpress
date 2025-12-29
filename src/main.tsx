import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Dunnkayce from "./pages/Dunnkayce";
import Grills from "./pages/Grills";
import BTO from "./pages/BTO";
import Laughters from "./pages/Laughters";
import Search from "./pages/Search";
import Profile from "./pages/profile/index";
import ChangePassword from "./pages/profile/ChangePassword";
import ChangeName from "./pages/profile/ChangeName";
import ChangeEmail from "./pages/profile/ChangeEmail";
import ChangeAddress from "./pages/profile/ChangeAddress";
import Reorder from "./pages/Reorder";
import TrackOrder from "./pages/TrackOrder";
import AuthPage from "./pages/Auth";
import NotFoundPage from "./components/NotFoundPage";
import RunnerHome from "./pages/Runner";
import RunnerHistory from "./pages/RunnerHistory";
import RunnerOrders from "./pages/Orders";
import ActiveOrderDetails from "./pages/ActiveOrderDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "dunnkayce", element: <Dunnkayce /> },
      { path: "grills", element: <Grills /> },
      { path: "bto", element: <BTO /> },
      { path: "laughters-kitchen", element: <Laughters /> },
      { path: "search", element: <Search /> },
      { path: "reorder", element: <Reorder /> },
      { path: "track/:orderId", element: <TrackOrder /> },
      { path: "login", element: <AuthPage /> },
      { path: "runner", children: [
        { index: true, element: <RunnerHome /> },
        { path: "history", element: <RunnerHistory /> },
        { path: "orders", element: <RunnerOrders /> },
        { path: "orders/:orderId", element: <ActiveOrderDetails /> }
      ]},

      // User Profile Routes
      {
        path: "profile",
        children: [
          { index: true, element: <Profile /> },
          {
            path: "change-address",
            element: <ChangeAddress onConfirm={(newAddress) => console.log("New address:", newAddress)} />,
          },
          {
            path: "change-email",
            element: <ChangeEmail onConfirm={(newEmail) => console.log("New email:", newEmail)} />,
          },
          {
            path: "change-username",
            element: <ChangeName onConfirm={(newName) => console.log("New name:", newName)} />,
          },
          { path: "change-password", element: <ChangePassword /> },
        ],
      },

      // Runner Profile Routes
      {
        path: "runner/profile",
        children: [
          { index: true, element: <Profile /> },
          {
            path: "change-address",
            element: <ChangeAddress onConfirm={(newAddress) => console.log("New address:", newAddress)} />,
          },
          {
            path: "change-email",
            element: <ChangeEmail onConfirm={(newEmail) => console.log("New email:", newEmail)} />,
          },
          {
            path: "change-username",
            element: <ChangeName onConfirm={(newName) => console.log("New name:", newName)} />,
          },
          { path: "change-password", element: <ChangePassword /> },
        ],
      },
    ],
  },
]);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
